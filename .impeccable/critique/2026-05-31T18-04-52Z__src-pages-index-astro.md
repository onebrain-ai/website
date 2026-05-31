---
target: src/pages/index.astro
total_score: 31
p0_count: 0
p1_count: 1
timestamp: 2026-05-31T18-04-52Z
slug: src-pages-index-astro
---
# Critique — `src/pages/index.astro` (OneBrain homepage)

Register: brand (marketing). Goals: CLI installs + GitHub stars; comprehension is the precondition.

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Living HUD telemetry, active nav/spine states, copy-confirm, waitlist states. Strong. |
| 2 | Match System / Real World | 3 | Developer language fits; but the hero H1 "UNIFIED INTELLIGENCE" is abstract vs the plain footer line. |
| 3 | User Control and Freedom | 3 | Nav, spine, skip-link, anchor jumps; desktop scroll-snap mandatory slightly fights free scroll. |
| 4 | Consistency and Standards | 4 | Extremely consistent design system end to end. |
| 5 | Error Prevention | 3 | Waitlist: honeypot + timing guard + aria-invalid + validation. Small error surface, handled well. |
| 6 | Recognition Rather Than Recall | 3 | Stylized mono nav labels (SYNERGY/STACK/SESSION) aren't self-evident for section content. |
| 7 | Flexibility and Efficiency | 3 | Spine quick-nav, anchor links, copy button, keyboard paths. Good for a marketing page. |
| 8 | Aesthetic and Minimalist Design | 3 | Striking and mostly purposeful, but 8 near-identical full-viewport sections + ambient maximalism push past "needed." |
| 9 | Error Recovery | 3 | Waitlist errors paired to input via aria; 404 exists. Limited surface. |
| 10 | Help and Documentation | 3 | GitHub/install/commands linked; the page itself documents the product. |
| **Total** | | **31/40** | **Good** |

## Anti-Patterns Verdict

**Does it look AI-generated? No — this is the rare page that passes the brand slop test on aesthetic.** The operator-console world (corner HUD, live agent telemetry, per-section custom visualizations, warp transitions) is cohesive and genuinely hard to mistake for a template. A visitor asks "how was this built?", not "which AI made this?"

**LLM assessment.** The aesthetic is committed and distinctive. The real AI-grammar risk is not the look but the *grammar*: every one of 8 sections opens with the identical eyebrow-pill + two-word italic stroke headline + mono sub, and the copy repeatedly lands on the "not X, it's Y" / "No X. No Y." rebuttal cadence (Hero, Synergy, Stack, Workflow). The per-section custom visualizations rescue the sameness, but the header system reads as section scaffolding when viewed cold. (Identity-preservation note: the eyebrow pill is a deliberate, named brand system, so it isn't a reflex tell — but it is still the page's most template-reading repetition.)

**Deterministic scan** (`detect.mjs`, 2 findings): (1) `Nav.astro:371` animates `padding-left` (layout-transition warning, minor perf); (2) "single font / only Chakra Petch" at `Layout.astro:93` — **false positive**; the page uses three families (Chakra Petch display, JetBrains Mono body/labels, Inter base). The scan is otherwise clean: no gradient-text, identical-grid, or glassmorphism flags. The `cyber-card` hover left bar (2px) and `cmd-box` left gradient bar (3px) brush the side-stripe ban but are implemented as `::before` pseudo-elements (so the detector missed them) and are deliberate single-use brand accents, not repeated alert stripes.

**Visual evidence.** Direct browser inspection (Playwright) across all 8 sections + footer at 1440px and 390px, plus computed contrast checks. No detect.js overlay was injected; findings come from screenshots and computed-style sampling.

## Overall Impression

A genuinely well-crafted, distinctive marketing page that already clears the bar most AI sites fail. The biggest opportunity isn't the visuals — it's *comprehension*: the most prominent element on the page (the hero H1) says the least about what OneBrain actually is, while the clearest description sits hidden in `sr-only` and in the footer. For a page whose job is to convert a skeptical developer into an install or a star, lead with meaning, then let the cinematic treatment carry it.

## What's Working

1. **A committed, original identity.** The operator-console system is cohesive and unmistakable. This is the hard part, and it's done.
2. **Every section earns real imagery.** Operator console, live knowledge graph, harness/LLM layer stack, vault hub-and-spoke, co-evolution loop, command catalog — distinct custom visualizations per section, not colored blocks. Exactly what the brand register asks for.
3. **Shows the machine.** Real install command up top, real command names (`/braindump`, `/distill`, `/recap`), real vault paths (`memory/`), live GitHub stars, live telemetry. Concrete proof over adjectives.
4. **Solid engineering underneath.** No horizontal overflow at 390px, reduced-motion paths, offscreen animation unloading, skip-link, `focus-visible`, and an `sr-only` SEO/AT headline. The craft is real.

## Priority Issues

- **[P1] The hero H1 is mood, not meaning.** "UNIFIED INTELLIGENCE" is the largest text on the page and communicates nothing about what OneBrain does; the actual description ("AI thinking partner for Obsidian") is hidden in `sr-only` and only stated plainly in the footer. For a skeptical developer, a giant "UNIFIED INTELLIGENCE" also risks reading as the vague AI grandiosity the audience distrusts — directly against PRODUCT.md's "speak engineer-to-engineer, no overpromising."
  - **Fix:** Make the first thing read say what it does. Either rewrite the visible H1 toward the footer's own plain line, or add an H2-scale clarifier immediately under it ("AI thinking partner that lives in your Obsidian vault — teach it once, it remembers."). Keep the cinematic treatment; change what it says.
  - **Suggested command:** /impeccable clarify

- **[P2] Formulaic copy cadence + em dashes.** The "not another second brain", "doesn't ask you to query an AI", "BEYOND A SECOND BRAIN", "doesn't build harnesses — it orchestrates them", "No tab juggling. No tool sprawl." rebuttal rhythm recurs across 4+ section blocks, and em dashes appear in nearly every section. This is the aphoristic-cadence tell and the em-dash ban from the skill's own copy rules, and it dents the "candid, specific" voice.
  - **Fix:** Limit the rebuttal shape to ≤2 sections; replace em dashes with periods/colons; make each section's claim specific to that section.
  - **Suggested command:** /impeccable clarify

- **[P2] Section-template uniformity and an 8-fold march.** Eight full-viewport, scroll-snapped sections each open with the identical header system. The decision a skeptical visitor makes is really driven by Hero + Synergy; the remaining six are "more depth" delivered at one even pace. The custom visualizations carry it, but the cadence is predictable and long.
  - **Fix:** Vary the section-header cadence (drop the eyebrow on some sections, vary headline scale/placement/alignment); consider whether all 8 must be full-viewport snap, or whether 2-3 could combine/compress.
  - **Suggested command:** /impeccable layout (or /impeccable distill to tighten)

- **[P2] Accessibility gaps vs the AAA target.** Body, sub, nav, and command text are excellent (7.8–17:1). But the input placeholder computes 1.85:1 and card meta-labels 1.59:1 (both fail even AA), and card descriptions sit at 6.3:1 (miss the AAA goal). For a stated "AAA where feasible" bar these are the concrete gaps.
  - **Fix:** Placeholder → ≥4.5:1 (raise toward 0.5–0.6 white); card descriptions → toward 0.7 white for AAA; meta labels → AA or mark decorative with appropriate ARIA.
  - **Suggested command:** /impeccable audit (full a11y pass, then apply fixes)

- **[P3] Low live star count is weak social proof.** Surfacing "10 STARS ON GITHUB" can backfire for the star goal — a skeptical developer reads a low count as "early/unproven." 
  - **Fix:** Only show the raw number above a threshold; below it, lead with a different proof (open-source, MIT, BYOK, real command surface).
  - **Suggested command:** /impeccable clarify

## Persona Red Flags

**Jordan (Confused First-Timer):** Lands on "UNIFIED INTELLIGENCE" and cannot tell what the product is within 5 seconds; has to read the sub copy to orient. Nav labels SYNERGY / STACK / SESSION don't describe what each section contains. Recovers once scrolling reveals concrete commands and the install line.

**Devon (Skeptical terminal-native developer — project persona):** "UNIFIED INTELLIGENCE" + "SYNERGETIC THINKING" trip the overpromise alarm on arrival; "10 stars" reads as unproven. Won back by real commands, MIT license, BYOK, and the harness-agnostic story (Claude Code / Gemini / Codex / raw API). The em-dash/aphoristic copy slightly dents the "talks to me like a peer" feel he's looking for.

**Casey (Distracted Mobile User):** Hero works well one-handed and the H1 doesn't overflow at 390px; scroll-snap is correctly disabled on mobile. Two frictions: the primary mobile CTA is a `brew install` command a phone can't actually run (a star/waitlist CTA may convert better on mobile), and eight tall sections make for a long thumb-scroll to reach Cloud/waitlist.

## Minor Observations

- Possible copy typo in the Commands intro ("each verb wraps that wrap real workflows" — looks duplicated). Verify and fix.
- `cmd-box` 3px left gradient bar and `cyber-card` 2px hover left bar brush the side-stripe ban (via `::before`, so the detector missed them). Intentional brand accents on single elements; worth a conscious keep/drop, not a reflexive removal.
- `Nav.astro:371` animates `padding-left` (layout property). Minor jank risk; prefer transform.

## Questions to Consider

- What if the first line a visitor reads told them exactly what OneBrain is and does, and the cinematic treatment amplified *that* instead of replacing it?
- Does a skeptical developer need eight full-screen sections to decide, or would Hero + Synergy + Commands + Cloud (with the rest compressed) convert faster?
- If installs and stars are the goal, is the hero's primary CTA the right one on mobile, where `brew install` can't run?
