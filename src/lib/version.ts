/**
 * Build-time resolution of the latest OneBrain CLI version. Astro
 * evaluates this in component frontmatter during prerender, so the
 * version is baked into the static HTML at build — no runtime cost.
 *
 * v3.x binaries ship via GitHub Releases (direct tarball + `onebrain
 * update` self-installer), so the release *tag* is the canonical
 * version source.
 *
 * Resolution order (first success wins):
 *   1. `github.com/.../releases/latest` **redirect** — a HEAD request
 *      with `redirect: 'manual'` exposes a `Location:` of
 *      `…/releases/tag/vX.Y.Z`. This is the plain github.com web
 *      endpoint, NOT `api.github.com`, so it is not subject to the
 *      60-req/hr unauthenticated API rate limit that Cloudflare's
 *      shared build-runner IPs routinely hit (which silently pinned the
 *      site to the fallback). No token required.
 *   2. `api.github.com/.../releases/latest` — used only if the redirect
 *      lookup fails. Sends `GITHUB_TOKEN` when present (5000 req/hr).
 *   3. `FALLBACK` — a known-good literal for a fully offline build.
 *
 * Memoized at module scope: Hero and Footer both call this; the second
 * caller shares the in-flight Promise instead of issuing a duplicate
 * request.
 */
const FALLBACK = '3.4.5';
const LATEST_REDIRECT = 'https://github.com/onebrain-ai/onebrain-cli/releases/latest';
const RELEASES_API = 'https://api.github.com/repos/onebrain-ai/onebrain-cli/releases/latest';
const FETCH_TIMEOUT_MS = 5000;

let cachedPromise: Promise<string> | null = null;

// Strip a leading "v" then constrain to a semver-safe charset — don't
// depend on Astro's template escaping as the security control; sanitize
// at the source.
function sanitize(raw: string): string {
  return raw.replace(/^v/, '').replace(/[^0-9A-Za-z.\-+]/g, '');
}

// 1. Follow the github.com releases/latest redirect and read the tag
//    out of the Location header. `redirect: 'manual'` keeps the 3xx
//    response (undici, used by the Node build) so its headers stay
//    readable instead of being followed transparently.
async function fromRedirect(): Promise<string | null> {
  const res = await fetch(LATEST_REDIRECT, {
    method: 'HEAD',
    redirect: 'manual',
    headers: { 'User-Agent': 'onebrain-website-build' },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  const loc = res.headers.get('location');
  const m = loc && loc.match(/\/tag\/(v?[0-9][^/]*)\/?$/);
  return m ? sanitize(m[1]) : null;
}

// 2. Releases API fallback (token-aware).
async function fromApi(): Promise<string | null> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'onebrain-website-build',
  };
  const token = process.env.GITHUB_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(RELEASES_API, {
    headers,
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { tag_name?: string };
  return data.tag_name ? sanitize(data.tag_name) : null;
}

export function getCliVersion(): Promise<string> {
  if (cachedPromise) return cachedPromise;
  cachedPromise = (async () => {
    try {
      const version = (await fromRedirect().catch(() => null))
        || (await fromApi().catch(() => null));
      if (version) return version;
      console.warn(`[version] could not resolve latest release — using FALLBACK ${FALLBACK}`);
      return FALLBACK;
    } catch (e) {
      // Reset the cache so a future caller can retry; otherwise an
      // unexpected throw would permanently serve a rejected promise to
      // every subsequent caller.
      cachedPromise = null;
      console.warn('[version] release lookup failed, using FALLBACK:', e);
      return FALLBACK;
    }
  })();
  return cachedPromise;
}
