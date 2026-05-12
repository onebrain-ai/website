import type { APIRoute } from 'astro';
// Astro v6 + @astrojs/cloudflare exposes env via cloudflare:workers (was Astro.locals.runtime.env).
import { env } from 'cloudflare:workers';
import { DISPOSABLE_DOMAINS } from '../../lib/disposable-domains';

// Run as Cloudflare Worker, not prerendered.
export const prerender = false;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Minimum render-to-submit time. Humans need at least this long to
// focus the input + type a real address. Bots fire under 300ms. The
// form is server-rendered, so the timer starts on script-init at the
// page load — generous floor for anyone with a slow connection.
const MIN_SUBMIT_MS = 1500;

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

// Cloudflare Turnstile siteverify endpoint. Public, no auth required
// (the secret is sent as a form field). 4s timeout: Turnstile usually
// responds in <200ms; if the upstream is slow we'd rather log + accept
// the signup than block on the gate. A bot can't exploit this because
// the dev/missing-secret path also accepts (defense-in-depth via
// honeypot + timing + disposable + Origin still applies).
const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
const TURNSTILE_TIMEOUT_MS = 4000;

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

// Dev-only fallback salt. Production MUST set WAITLIST_IP_SALT via
// `wrangler secret put WAITLIST_IP_SALT` — without it, anyone with
// the public source can rainbow-table the entire IPv4 space in
// seconds (2^32 SHA-256 hashes, ~1 minute on a modern GPU) and
// reverse the stored ip_hash back to "did Alice's IP X.Y.Z.W sign
// up?". In prod-missing-secret we log loudly and degrade ip_hash to
// null — signups still land, only the attribution column is lost
// until the secret is bound. A null is recoverable; a leaked weak
// hash is not.
const DEV_FALLBACK_SALT = '|onebrain-dev-only';

async function hashIp(ip: string, salt: string): Promise<string> {
  // Privacy-preserving — store a one-way hash, never the raw IP.
  const data = new TextEncoder().encode(ip + salt);
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

  // ── Anti-spam silent rejects ─────────────────────────────────────
  // These three checks all return 200 OK without writing to D1 — the
  // bot can't distinguish "blocked" from "accepted", which is the
  // point. A noisy 4xx response would tell the attacker which signal
  // tripped, so they could tune around it.

  // 1) Honeypot: hidden `company` field. Human form has it offscreen,
  //    aria-hidden, tabindex=-1, autocomplete=off. Bots that fill
  //    every <input> trip it.
  const honeypot = asString(fields.company);
  if (honeypot && honeypot.length > 0) {
    return json({ ok: true }, 200);
  }

  // 2) Submission timing: client sends ms elapsed from form render to
  //    submit. Real humans take >1500ms (focus + type + click);
  //    most bots fire under 300ms.
  //
  //    Missing `t` entirely → treat as legacy client (older cached
  //    HTML before this version shipped) and let the request continue
  //    to the normal validation path. Silent-rejecting on missing-t
  //    would cause every stale browser cache to "succeed" with no
  //    D1 row forever. The honeypot still catches the simple-bot
  //    case where t is omitted.
  //
  //    Present-but-too-fast → silent-accept (bot signal).
  //    Accept stringified `t` too — some clients/SDKs may JSON-encode
  //    numerics as strings.
  const tRaw = fields.t;
  if (tRaw !== undefined) {
    const elapsedNum =
      typeof tRaw === 'number'
        ? tRaw
        : typeof tRaw === 'string'
          ? Number(tRaw)
          : NaN;
    if (Number.isFinite(elapsedNum) && elapsedNum < MIN_SUBMIT_MS) {
      return json({ ok: true }, 200);
    }
  }

  // 3) Disposable-domain blocklist. Throwaway addresses bounce when
  //    we email the list at launch and tank sender reputation.
  //    `.pop()` on the @-split takes the trailing component, defending
  //    against malformed inputs like `a@b@mailinator.com` — even if
  //    a future EMAIL_RE relaxation admits them, the disposable check
  //    still resolves to the real trailing domain.
  const parts = emailRaw.trim().toLowerCase().split('@');
  const candidateDomain = parts.length >= 2 ? parts[parts.length - 1] : '';
  if (candidateDomain && DISPOSABLE_DOMAINS.has(candidateDomain)) {
    return json({ ok: true }, 200);
  }

  // 4) Cloudflare Turnstile verification — invisible CAPTCHA that
  //    blocks ~95% of headless bots including those with stealth
  //    plugins. Skipped only when no TURNSTILE_SECRET is bound (dev
  //    + dashboard misconfig); production MUST set it via
  //    `wrangler versions secret put TURNSTILE_SECRET`. When the
  //    secret is present:
  //      - missing/empty token  → silent-accept (bot signal)
  //      - upstream verify fail → silent-accept (bot signal)
  //      - verify upstream slow → log + allow through (better than
  //        breaking submits on a third-party blip; the upstream
  //        downtime is rare and other P0 signals still catch the
  //        bulk of bot traffic)
  const turnstileSecret = (env as { TURNSTILE_SECRET?: string }).TURNSTILE_SECRET;
  if (turnstileSecret) {
    const turnstileToken = asString(fields['cf-turnstile-response']);
    if (!turnstileToken) {
      return json({ ok: true }, 200);
    }
    const verifyBody = new URLSearchParams();
    verifyBody.append('secret', turnstileSecret);
    verifyBody.append('response', turnstileToken);
    if (clientAddress) verifyBody.append('remoteip', clientAddress);
    let verifyOk = false;
    try {
      const verifyRes = await fetch(TURNSTILE_VERIFY_URL, {
        method: 'POST',
        body: verifyBody,
        signal: AbortSignal.timeout(TURNSTILE_TIMEOUT_MS),
      });
      const verifyData = (await verifyRes.json()) as { success?: boolean };
      verifyOk = verifyData.success === true;
    } catch (e) {
      // Upstream timeout / network error — log and let through. The
      // alternative (block on every Turnstile blip) would lose real
      // signups for an outage we can't fix from our side. Distinguish
      // the failure shape so a future Workers Analytics counter can
      // bucket them and we can post-mortem "slow CF" vs "down CF".
      const kind =
        e instanceof DOMException && e.name === 'TimeoutError'
          ? 'timeout'
          : 'network';
      console.warn(`[waitlist] turnstile verify ${kind}; allowing through:`, safeErr(e));
      verifyOk = true;
    }
    if (!verifyOk) {
      return json({ ok: true }, 200);
    }
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

  // Resolve IP-hash salt from Cloudflare secret. Production MUST bind
  // WAITLIST_IP_SALT via `wrangler secret put WAITLIST_IP_SALT` (use
  // `openssl rand -base64 32` for the value — anything shorter loses
  // collision resistance against a determined rainbow-table).
  //
  // Failure mode tree:
  //  - secret present                 → hash with it (normal path)
  //  - dev (import.meta.env.DEV)      → hash with DEV_FALLBACK_SALT
  //  - prod with secret missing       → store ip_hash=null + log
  //
  // The prod-missing path deliberately writes null instead of falling
  // through to DEV_FALLBACK_SALT: a deterministic published-source
  // salt is worse than no hash, because it lets the attacker rainbow-
  // table back to "did Alice's IP sign up?". A null is recoverable
  // (operator can re-derive from raw IP later if needed, or just
  // accept the temporary loss of attribution); a leaked weak hash is
  // not. Signups still land — only the ip_hash column goes null until
  // the secret is bound.
  const ipSalt = (env as { WAITLIST_IP_SALT?: string }).WAITLIST_IP_SALT;
  let activeSalt: string | null;
  if (ipSalt) {
    activeSalt = ipSalt;
  } else if (import.meta.env.DEV) {
    activeSalt = DEV_FALLBACK_SALT;
  } else {
    console.error('[waitlist] WAITLIST_IP_SALT secret missing in production — storing ip_hash=null');
    activeSalt = null;
  }

  // Compute IP hash outside the DB try so a hash failure doesn't poison
  // an otherwise-valid insert; we still record the row with ip_hash=null.
  let ipHash: string | null = null;
  if (clientAddress && activeSalt) {
    try {
      ipHash = await hashIp(clientAddress, activeSalt);
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
