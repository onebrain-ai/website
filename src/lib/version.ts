/**
 * Build-time fetch of the latest published @onebrain-ai/cli version from npm.
 * Astro evaluates this in component frontmatter during prerender, so the
 * version is baked into the static HTML at build — no runtime cost.
 *
 * Memoized at module scope: Hero and Footer both call this; second caller
 * shares the in-flight Promise instead of issuing a duplicate registry fetch.
 *
 * Falls back to a known-good version string if the registry is unreachable
 * (offline build, CI without network, etc).
 */
const FALLBACK = '2.1.8';
const REGISTRY = 'https://registry.npmjs.org/@onebrain-ai/cli/latest';

let cachedPromise: Promise<string> | null = null;

export function getCliVersion(): Promise<string> {
  if (cachedPromise) return cachedPromise;
  cachedPromise = (async () => {
    try {
      const res = await fetch(REGISTRY, { headers: { Accept: 'application/json' } });
      if (!res.ok) return FALLBACK;
      const data = (await res.json()) as { version?: string };
      return data.version || FALLBACK;
    } catch {
      return FALLBACK;
    }
  })();
  return cachedPromise;
}
