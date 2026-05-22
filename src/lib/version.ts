/**
 * Build-time fetch of the latest OneBrain CLI version from the GitHub
 * Releases API. Astro evaluates this in component frontmatter during
 * prerender, so the version is baked into the static HTML at build — no
 * runtime cost.
 *
 * Source switched from npm registry to GitHub Releases at v3.0.0 GA: v3.x
 * binaries ship via GitHub Releases (direct tarball + `onebrain update`
 * self-installer), not via `npm publish`. The npm wrapper (`@onebrain-ai/cli`)
 * is planned for the v3.0.x window but is not the canonical version source
 * anymore.
 *
 * Memoized at module scope: Hero and Footer both call this; second caller
 * shares the in-flight Promise instead of issuing a duplicate API fetch.
 *
 * Falls back to a known-good version string if the API is unreachable
 * (offline build, CI without network, rate limit, etc).
 */
const FALLBACK = '3.0.0';
const RELEASES_API = 'https://api.github.com/repos/onebrain-ai/onebrain-cli/releases/latest';

let cachedPromise: Promise<string> | null = null;

export function getCliVersion(): Promise<string> {
  if (cachedPromise) return cachedPromise;
  cachedPromise = (async () => {
    try {
      const res = await fetch(RELEASES_API, {
        headers: { Accept: 'application/vnd.github+json' },
        signal: AbortSignal.timeout(5000),
      });
      if (!res.ok) {
        console.warn('[version] releases API returned non-ok, using FALLBACK', res.status);
        return FALLBACK;
      }
      const data = (await res.json()) as { tag_name?: string };
      const tag = data.tag_name || `v${FALLBACK}`;
      // Strip a leading "v" so consumers always see a bare semver string.
      return tag.replace(/^v/, '');
    } catch (e) {
      console.warn('[version] releases API fetch failed, using FALLBACK:', e);
      // Reset the cache so a future caller can retry; otherwise an
      // unexpected throw inside try{} would permanently serve a rejected
      // promise to every subsequent caller (Reviewer A round-1, PR #32).
      cachedPromise = null;
      return FALLBACK;
    }
  })();
  return cachedPromise;
}
