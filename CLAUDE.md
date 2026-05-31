# CLAUDE.md

Marketing site for **OneBrain** (an AI thinking partner that lives inside your Obsidian vault). Astro 6 + Tailwind CSS v4, deployed to Cloudflare Pages at [onebrain.run](https://onebrain.run).

```bash
bun install
bun run dev      # astro dev
bun run build    # output to ./dist
```

## Design Context

Before any UI work, read the two root docs — they are the source of truth and override generic defaults:

- **`PRODUCT.md`** — strategy: register (`brand`), users (terminal-native developers / Obsidian power users), purpose, brand personality (*operator-grade, living, candid*), anti-references, design principles, accessibility target (**WCAG 2.2 AAA where feasible**).
- **`DESIGN.md`** — the visual system (Stitch DESIGN.md format), with the machine-readable token frontmatter and named rules. Sidecar at `.impeccable/design.json`.

**North Star: "The Operator Console."** A live mission-control surface for a thinking machine — light-on-void, monospace voice, neon-glow accents, italic-uppercase Chakra Petch headlines.

Non-negotiables (full rules in `DESIGN.md`):
- **Sharp, never rounded.** `border-radius: 0` on surfaces; bevels via `clip-path`.
- **Glow, not fill.** Neon accents glow; they never flood a large surface. One accent per section via `--section-accent`.
- **Monospace voice + Stencil headlines.** Reading copy is JetBrains Mono; headlines are Chakra Petch italic uppercase.
- **No-Lift.** No gray drop shadows; depth is tonal layering + neon glow only.
- **Contrast floor.** Body copy never lighter than `rgba(255,255,255,0.62)`; aim AAA. (Known debt: the waitlist input placeholder is below floor.)
- **Avoid:** generic SaaS scaffolding, rival note-tool looks (Notion/Mem/Reflect/Obsidian), corporate/enterprise styling.

Goals the site serves: **CLI installs** and **GitHub stars** (comprehension first — make "you teach the agent, it extends you" land fast). Cloud waitlist is secondary.

The visual identity is a strong hypothesis, not a constraint — the owner is open to a rethink. Preserve the *personality*; the neon/HUD *execution* is revisable.

## Impeccable

This project is set up for the `impeccable` design skill. Useful next commands: `/impeccable critique src/pages/index.astro`, `/impeccable audit src/pages/index.astro`, `/impeccable live`.
