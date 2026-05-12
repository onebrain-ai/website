import type { APIRoute } from 'astro';
// Astro v6 + @astrojs/cloudflare exposes env via cloudflare:workers (was Astro.locals.runtime.env).
import { env } from 'cloudflare:workers';

// Run as Cloudflare Worker, not prerendered.
export const prerender = false;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Hand-rolled D1 surface — minimum we need from @cloudflare/workers-types.
// Kept local so the file doesn't pull a transitive types dep into the
// API surface contract.
interface D1Database {
  prepare(sql: string): D1PreparedStatement;
}
interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  run(): Promise<unknown>;
}

const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT = 5;
const hits = new Map<string, number[]>();

// Hardcoded — the only allowed Origin for cross-origin POST. Worker
// also serves the static site at this origin, so same-origin form
// submits send `Origin: https://onebrain.run`. Anything else is a
// third-party page POSTing on the user's behalf (CSRF surface).
const ALLOWED_ORIGIN = 'https://onebrain.run';
// Cap request body before parsing JSON — Workers buffer up to 100 MB
// by default. A waitlist signup is <300 bytes; 10 KB is generous and
// blocks slow-loris isolate pinning + accidental large payloads.
const MAX_BODY_BYTES = 10 * 1024;

// Trim caught exceptions to just the message for Cloudflare Workers
// Logs. Raw Error objects can include D1 schema fragments, stack
// frames pointing at internal modules, or pieces of the failing SQL —
// none of which we want in operational logs that may be Logpush'd
// or shared via dashboard links later.
function safeErr(e: unknown): string {
  if (e instanceof Error) return e.message.slice(0, 200);
  return String(e).slice(0, 200);
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

// Narrow `unknown` JSON body to a string field so we never coerce
// objects/arrays into `"[object Object]"` and persist garbage.
function asString(v: unknown): string | undefined {
  return typeof v === 'string' ? v : undefined;
}

async function hashIp(ip: string): Promise<string> {
  // Privacy-preserving — store a one-way hash, never the raw IP.
  const data = new TextEncoder().encode(ip + '|onebrain');
  const buf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf))
    .slice(0, 12)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  // CSRF surface: browsers send a CORS preflight for `application/json`
  // and the endpoint replies with no Access-Control-Allow-Origin, so
  // third-party JSON POSTs are blocked. But `text/plain` is a "simple
  // request" — no preflight, body delivers. An attacker page can post
  // a JSON-shaped string with `text/plain` and the endpoint will parse
  // it via request.json(). Reject anything that isn't application/json.
  const ct = (request.headers.get('content-type') || '').toLowerCase();
  if (!ct.startsWith('application/json')) {
    return json({ ok: false, error: 'invalid_content_type' }, 415);
  }
  // Origin header: present on every browser cross-origin POST. Same-
  // origin fetches from onebrain.run send `Origin: https://onebrain.run`.
  // null/missing Origin is fine (some user agents and non-browser
  // clients omit it on same-origin); only reject when a foreign Origin
  // is explicitly present.
  const origin = request.headers.get('origin');
  if (origin && origin !== ALLOWED_ORIGIN) {
    return json({ ok: false, error: 'forbidden_origin' }, 403);
  }
  // Body-size guard before parse. Content-Length is advisory but every
  // legitimate fetch() from the form sets it. Missing Content-Length
  // is allowed (chunked), but in that case the JSON parser still bounds
  // memory by the field-extraction path below.
  const cl = request.headers.get('content-length');
  if (cl !== null && Number(cl) > MAX_BODY_BYTES) {
    return json({ ok: false, error: 'payload_too_large' }, 413);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: 'invalid_body' }, 400);
  }
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return json({ ok: false, error: 'invalid_body' }, 400);
  }
  const fields = body as Record<string, unknown>;

  const emailRaw = asString(fields.email);
  if (emailRaw === undefined) {
    return json({ ok: false, error: 'invalid_email' }, 400);
  }

  // clientAddress absent in local dev (no incoming Cloudflare ip header) — skip rate limit.
  // In production, clientAddress should always populate from cf-connecting-ip; if it's
  // missing, fail closed rather than serving an unlimited path silently.
  if (clientAddress) {
    const now = Date.now();
    const ts = (hits.get(clientAddress) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
    if (ts.length >= RATE_LIMIT) {
      return json({ ok: false, error: 'rate_limited' }, 429);
    }
    ts.push(now);
    hits.set(clientAddress, ts);

    // Opportunistic prune: when the Map crosses 1024 entries, walk in insertion
    // order until we find the first other IP whose entries have all aged out and
    // drop it. Bounds Map size without setInterval (which would keep the isolate
    // alive) and without an LRU (which would need a second structure). 1024 is
    // well above realistic concurrent-IP fan-out for a waitlist endpoint; entries
    // also self-expire because the next hit from the same IP recomputes `ts` from
    // a filtered slice.
    if (hits.size > 1024) {
      for (const [ip, arr] of hits) {
        if (ip === clientAddress) continue;
        const fresh = arr.filter((t) => now - t < RATE_WINDOW_MS);
        if (fresh.length === 0) {
          hits.delete(ip);
          break;
        }
        if (fresh.length !== arr.length) hits.set(ip, fresh);
      }
    }
  } else if (!import.meta.env.DEV) {
    console.error('[waitlist] clientAddress missing in production — refusing to serve unlimited path');
    return json({ ok: false, error: 'server_error' }, 500);
  }

  const email = emailRaw.trim().toLowerCase();
  if (!email || email.length > 254 || !EMAIL_RE.test(email)) {
    return json({ ok: false, error: 'invalid_email' }, 400);
  }

  const db = (env as { WAITLIST_DB?: D1Database }).WAITLIST_DB;
  if (!db) {
    // In dev (no D1 binding configured) accept the signup so the form
    // round-trips. In production this means the binding is missing
    // from wrangler.jsonc — fail loud so a deploy regression doesn't
    // silently lose every signup while users see "Got it".
    // Unguarded — operational misconfiguration MUST surface in prod logs (no PII).
    console.error('[waitlist] WAITLIST_DB binding missing');
    if (!import.meta.env.DEV) {
      return json({ ok: false, error: 'server_misconfigured' }, 503);
    }
    return json({ ok: true, note: 'received_no_persistence' }, 200);
  }

  // Compute IP hash outside the DB try so a hash failure doesn't poison
  // an otherwise-valid insert; we still record the row with ip_hash=null.
  let ipHash: string | null = null;
  if (clientAddress) {
    try {
      ipHash = await hashIp(clientAddress);
    } catch (e) {
      console.warn('[waitlist] hashIp failed; proceeding with ip_hash=null:', safeErr(e));
    }
  }

  try {
    await db
      .prepare(
        'INSERT INTO waitlist (email, created_at, source, ip_hash) VALUES (?1, ?2, ?3, ?4) ON CONFLICT(email) DO NOTHING',
      )
      .bind(email, new Date().toISOString(), 'website', ipHash)
      .run();

    return json({ ok: true }, 200);
  } catch (e) {
    console.error('[waitlist] insert failed:', safeErr(e));
    return json({ ok: false, error: 'server_error' }, 500);
  }
};

export const GET: APIRoute = () => json({ ok: false, error: 'method_not_allowed' }, 405);
