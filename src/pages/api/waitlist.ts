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
    console.error('[waitlist] WAITLIST_DB binding missing for:', email);
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
      console.warn('[waitlist] hashIp failed; proceeding with ip_hash=null:', e);
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
    console.error('[waitlist] insert failed:', e);
    return json({ ok: false, error: 'server_error' }, 500);
  }
};

export const GET: APIRoute = () => json({ ok: false, error: 'method_not_allowed' }, 405);
