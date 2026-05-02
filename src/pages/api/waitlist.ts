import type { APIRoute } from 'astro';

// Run as Cloudflare Worker, not prerendered.
export const prerender = false;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface Env {
  WAITLIST_DB?: D1Database;
}

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

async function hashIp(ip: string): Promise<string> {
  // Privacy-preserving — store a one-way hash, never the raw IP.
  const data = new TextEncoder().encode(ip + '|onebrain');
  const buf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf))
    .slice(0, 12)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export const POST: APIRoute = async ({ request, locals, clientAddress }) => {
  let body: { email?: string };
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: 'invalid_body' }, 400);
  }

  const email = String(body.email ?? '').trim().toLowerCase();
  if (!email || email.length > 254 || !EMAIL_RE.test(email)) {
    return json({ ok: false, error: 'invalid_email' }, 400);
  }

  const env = (locals as { runtime?: { env?: Env } }).runtime?.env;
  const db = env?.WAITLIST_DB;
  if (!db) {
    // Graceful fallback for local dev without D1 binding configured yet.
    console.warn('[waitlist] WAITLIST_DB binding not found — email received but not stored:', email);
    return json({ ok: true, note: 'received_no_persistence' }, 200);
  }

  try {
    const ipHash = clientAddress ? await hashIp(clientAddress) : null;
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
