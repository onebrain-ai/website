# Product

## Register

brand

## Users

Developers and technical Obsidian power users who live in the terminal. They already keep a vault (notes, journals, project docs) and are comfortable with a CLI — they install tools via `brew`/`npm`, skim the GitHub repo before trying anything, and judge a project by whether it respects their time and intelligence. They arrive skeptical, because the "second brain" category is crowded and overpromised, and want to grasp quickly what makes OneBrain different and whether it's worth pointing at their own vault.

Context of use: evaluating the tool on a laptop, often arriving from a GitHub / HN / X referral, deciding within a couple of minutes whether to install it or star it.

## Product Purpose

OneBrain is an open-source AI thinking partner that runs inside your Obsidian vault: a two-way intelligence layer where you teach the agent and the agent extends you, both evolving over time against your own notes, memory, and tasks. It ships as a CLI (`onebrain-ai/onebrain`) with ~30 commands and a built-in web UI, with a native Desktop app on the way.

The marketing site exists to turn skeptical, technical visitors into users of the open-source tool. Success looks like:

1. **CLI installs** — visitors run the `brew` / `npm` install command (the GET_STARTED path).
2. **GitHub stars** — visitors trust the project enough to star the repo.

Desktop-app notify signups are a secondary outcome. A precondition for all of these is *comprehension*: the site has to make "you teach the agent, it extends you, all inside your vault" land fast, because the core idea is unusual and easily mistaken for yet another note app.

## Brand Personality

Technical, alive, and candid. The voice speaks to engineers as peers: concrete about what the tool literally does (commands, vault, memory, the agent loop), never markety. The product should feel *alive* and agentic (it boots, it has telemetry, it responds) and *credible* (open-source, real commands, real paths like `memory/`). Three words: **operator-grade, living, candid.**

Strategic note on the visual direction: the current "Cyber / Operator Console" treatment is a strong, deliberate first expression of this personality, but it is a **hypothesis, not a constraint.** The owner is open to rethinking the visual direction if a stronger one would serve the developer audience better. So preserve the *personality* (technical, alive, candid) as the north star, and treat the specific neon / HUD / scanline execution as open to revision rather than sacred. Judge any redesign on whether it improves comprehension, installs, and stars for a skeptical developer.

## Anti-references

- **Generic SaaS.** Rounded-card grids, soft purple gradients, Inter-on-white, the big-number "hero metric" template, mascot illustrations. The default startup look reads as "we have nothing specific to say."
- **Rival note / second-brain tools.** Notion, Mem, Reflect, and Obsidian's own marketing. Do not blend into the category; OneBrain's wedge is the *agent that learns you*, not prettier notes.
- **Corporate / enterprise.** Navy-and-gray palettes, stock photography, buzzword sales copy ("supercharge your knowledge"), trust-badge soup. The audience is individual developers, not procurement.

## Design Principles

1. **Show the machine, don't pitch it.** Real commands, real vault paths, live-feeling telemetry — let a developer *see* the tool working rather than read adjectives about it. Concrete output is the strongest proof.
2. **Earn the install in one screen.** The hero has to make the unusual concept legible fast, then hand over a copy-paste install command. Comprehension is the gate; never bury the idea under effects.
3. **Speak engineer-to-engineer.** Plain, specific, technically literate copy. No marketing buzzwords, no overpromising. Candor is what earns the star.
4. **Personality is the north star; the skin is negotiable.** Stay technical / alive / candid regardless of visual treatment. The cyber-console look is one expression of the brief, not the brief itself.
5. **Motion and performance are craft, not decoration.** The current build already respects LCP, reduced-motion, and offscreen unloading; any future direction must hold that bar. Effects must never gate content visibility or readability.

## Accessibility & Inclusion

Target **WCAG 2.2 AAA where feasible, AA as the floor.** On a dark neon theme that means: push body text toward 7:1 contrast wherever the palette allows (watch muted grays on near-black — the most likely failure), keep full keyboard operability (the spine HUD, nav, copy buttons, and waitlist form all reachable and visible on focus), and ship a complete `prefers-reduced-motion` path for every animation (the scanline / warp / particle systems already have this — keep it). Maintain screen-reader parity for stylized text via the existing `sr-only` pattern (used today on the cinematic hero headline).
