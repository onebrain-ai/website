/**
 * Build-time fetch of the latest OneBrain CLI version from the GitHub
 * Releases API. Astro evaluates this in component frontmatter during
 * prerender, so the version is baked into the static HTML at build — no
 * runtime cost.
 *
 * Source switched from npm registry to GitHub Releases at v3.0.0 GA: v3.x
 * binaries ship via GitHub Releases (direct tarball + `onebrain update`
 * self-installer), not via `npm publish`. The npm wrapper (`@onebrain-ai/cli`)
 * is planned for the v3.0.x window but is no longer the canonical version
 * source.
 *
 * Memoized at module scope: Hero and Footer both call this; second caller
 * shares the in-flight Promise instead of issuing a duplicate API fetch.
 *
 * Falls back to a known-good version string if the API is unreachable
 * (offline build, CI without network, rate limit, etc).
 *
 * Unauthenticated `api.github.com` is 60 req/hr per IP; Cloudflare Workers
 * build runners share IP pools. If a `GITHUB_TOKEN` env var is present at
 * build time we send it (5000 req/hr authenticated). Mirrors gh-stars.ts.
 */
const FALLBACK = '3.0.0';
const RELEASES_API = 'https://api.github.com/repos/onebrain-ai/onebrain-cli/releases/latest';
const FETCH_TIMEOUT_MS = 5000;

let cachedPromise: Promise<string> | null = null;

export function getCliVersion(): Promise<string> {
  if (cachedPromise) return cachedPromise;
  cachedPromise = (async () => {
    const headers: Record<string, string> = {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'onebrain-website-build',
    };
    const token = process.env.GITHUB_TOKEN;
    if (token) headers.Authorization = `Bearer ${token}`;

    try {
      const res = await fetch(RELEASES_API, {
        headers,
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      });
      if (!res.ok) {
        console.warn(`[version] releases API returned ${res.status} — using FALLBACK ${FALLBACK}`);
        return FALLBACK;
      }
      const data = (await res.json()) as { tag_name?: string };
      const raw = data.tag_name || `v${FALLBACK}`;
      // Strip leading "v" then constrain to semver-safe charset
      // (Reviewer C round-1: don't depend on Astro's template escaping
      // as the security control — sanitize at the source).
      return raw.replace(/^v/, '').replace(/[^0-9A-Za-z.\-+]/g, '');
    } catch (e) {
      console.warn('[version] releases API fetch failed, using FALLBACK:', e);
      // Reset the cache so a future caller can retry; otherwise an
      // unexpected throw inside try{} would permanently serve a rejected
      // promise to every subsequent caller (Reviewer A round-1).
      cachedPromise = null;
      return FALLBACK;
    }
  })();
  return cachedPromise;
}
