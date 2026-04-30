# onebrain-ai/website

Marketing site for [OneBrain](https://github.com/onebrain-ai/onebrain) — deployed at [onebrain.run](https://onebrain.run).

Built with [Astro](https://astro.build) + [Tailwind CSS v4](https://tailwindcss.com).

## Develop

```bash
bun install
bun run dev
```

## Build

```bash
bun run build
```

Output goes to `./dist`. Deployed via Cloudflare Pages.

## Structure

```
src/
  components/   Section components (Hero, Features, Cloud, ...)
  layouts/      Layout.astro
  pages/        index.astro
  styles/       global.css (Tailwind theme)
```
