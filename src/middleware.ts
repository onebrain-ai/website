import { defineMiddleware } from 'astro:middleware';

/**
 * Security headers for dynamic routes (currently /api/waitlist).
 *
 * Static pages get the full set from public/_headers (served by
 * Cloudflare Workers Static Assets). This middleware is the dynamic
 * counterpart so JSON API responses don't ship without HSTS / nosniff
 * / clickjacking guards.
 *
 * The set here is the minimum useful for an API endpoint: no CSP
 * (irrelevant to JSON), no Permissions-Policy (no UI surface to scope).
 */
const API_SECURITY_HEADERS: Record<string, string> = {
  // Match public/_headers exactly. `preload` is a one-way commitment:
  // HTTPS-only on apex + all subdomains for the duration of max-age
  // (2 years). To remove safely, drop the directive here, ship for the
  // full max-age window, then request removal at hstspreload.org/removal.
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Frame-Options': 'DENY',
  'Cross-Origin-Opener-Policy': 'same-origin',
};

export const onRequest = defineMiddleware(async (_context, next) => {
  // Catch downstream rejections so the security headers this middleware
  // exists to add still ship — even on a 500. A bare `await next()`
  // would propagate the rejection and let Astro's default 500 leak
  // without HSTS/nosniff.
  let response: Response;
  try {
    response = await next();
  } catch (err) {
    // Trim to message only — Workers Logs can be Logpush'd or shared
    // via dashboard link, and downstream throws can carry stack frames
    // or D1 schema fragments. Raw Error objects belong nowhere logs
    // get aggregated.
    const msg = err instanceof Error ? err.message.slice(0, 200) : String(err).slice(0, 200);
    console.error('[middleware] downstream threw:', msg);
    response = new Response(
      JSON.stringify({ ok: false, error: 'server_error' }),
      { status: 500, headers: { 'Content-Type': 'application/json; charset=utf-8' } },
    );
  }

  // Some response classes (streamed, opaque) ship immutable header
  // bags. Build a fresh Headers from the original — the new bag is
  // always mutable, the body stream pass-through doesn't consume.
  const headers = new Headers(response.headers);
  for (const [name, value] of Object.entries(API_SECURITY_HEADERS)) {
    if (!headers.has(name)) headers.set(name, value);
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
});
