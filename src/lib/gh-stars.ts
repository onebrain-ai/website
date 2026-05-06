/**
 * Build-time fetch of the GitHub star count for onebrain-ai/onebrain.
 * Astro evaluates this in component frontmatter during prerender, so
 * the count is baked into the static HTML — no runtime cost, no
 * client-side fetch.
 *
 * Returns 0 on any failure (offline build, rate limit, schema break).
 * The Cloud component must hide the badge on 0 — rendering "0 stars"
 * as social proof is worse than rendering no proof at all.
 *
 * Unauthenticated `api.github.com` is 60 req/hr per IP; CI runners
 * share IP pools and hit that ceiling on busy days. If a `GITHUB_TOKEN`
 * env var is present at build time we send it (5000 req/hr authenticated).
 */
const REPO_API = 'https://api.github.com/repos/onebrain-ai/onebrain';
const FETCH_TIMEOUT_MS = 5000;

export async function getGitHubStars(): Promise<number> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'onebrain-website-build',
  };
  const token = process.env.GITHUB_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const res = await fetch(REPO_API, {
      headers,
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!res.ok) {
      console.warn(`[gh-stars] GitHub API returned ${res.status} — falling back to 0; badge will be hidden`);
      return 0;
    }
    const data = (await res.json()) as { stargazers_count?: number };
    return typeof data.stargazers_count === 'number' ? data.stargazers_count : 0;
  } catch (err) {
    console.warn('[gh-stars] fetch failed — falling back to 0; badge will be hidden:', err);
    return 0;
  }
}

export function formatStars(n: number): string {
  if (n < 1000) return String(n);
  return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
}
