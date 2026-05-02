/**
 * Build-time fetch of the latest published @onebrain-ai/cli version from npm.
 * Astro evaluates this in component frontmatter during prerender, so the
 * version is baked into the static HTML at build — no runtime cost.
 *
 * Falls back to a known-good version string if the registry is unreachable
 * (offline build, CI without network, etc).
 */
const FALLBACK = '2.1.8';
const REGISTRY = 'https://registry.npmjs.org/@onebrain-ai/cli/latest';

export async function getCliVersion(): Promise<string> {
  try {
    const res = await fetch(REGISTRY, { headers: { Accept: 'application/json' } });
    if (!res.ok) return FALLBACK;
    const data = (await res.json()) as { version?: string };
    return data.version || FALLBACK;
  } catch {
    return FALLBACK;
  }
}
