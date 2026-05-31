---
target: src/pages/index.astro
total_score: 33
p0_count: 0
p1_count: 0
timestamp: 2026-05-31T18-51-50Z
slug: src-pages-index-astro
---
# Critique (re-run) — `src/pages/index.astro` (OneBrain homepage)

Register: brand (marketing). Goals: CLI installs + GitHub stars; comprehension is the precondition. Re-run after the clarify + layout + audit + adapt + polish passes.

## Design Health Score

| # | Heuristic | Score | Δ | Key Issue |
|---|-----------|-------|---|-----------|
| 1 | Visibility of System Status | 3 | — | Living HUD telemetry, active states. Strong. |
| 2 | Match System / Real World | 4 | +1 | Hero now states what OneBrain is plainly (clarifier under the display H1); comprehension gap closed. |
| 3 | User Control and Freedom | 3 | — | Nav/spine/skip-link; desktop scroll-snap still mandatory. |
| 4 | Consistency and Standards | 4 | — | Highly consistent; the zigzag is deliberate variation, not inconsistency. |
| 5 | Error Prevention | 3 | — | Waitlist guards (honeypot, timing, aria-invalid). |
| 6 | Recognition Rather Than Recall | 3 | — | Stylized mono nav labels (SYNERGY/STACK/SESSION) still not self-evident. |
| 7 | Flexibility and Efficiency | 3 | — | Spine quick-nav, anchors, copy button, keyboard. |
| 8 | Aesthetic and Minimalist Design | 4 | +1 | Copy cleaned (0 user-facing em dashes, rebuttal cadence 5→1), zigzag rhythm, contrast fixed. Density/8-section march unchanged. |
| 9 | Error Recovery | 3 | — | Waitlist errors paired to input; 404 exists. |
| 10 | Help and Documentation | 3 | — | GitHub/install/commands linked. |
| **Total** | | **33/40** | **+2** | **Good** |

## What changed since the baseline (31/40)

- **Hero comprehension (was P1, resolved):** kept "UNIFIED INTELLIGENCE" and added a bright clarifier — "OneBrain is the open-source AI thinking partner that lives inside your Obsidian vault." The most prominent readable line now says what it is. → Match-real-world +1.
- **Copy (was P2, resolved):** rebuttal cadence cut from 5 blocks to 1 deliberate ("BEYOND A SECOND BRAIN"); zero user-facing em dashes site-wide. → Aesthetic +1.
- **Layout rhythm (P2, partially):** Stack and Session flipped to diagram-left/text-right, breaking the "text-left every section" march. The uniform eyebrow + two-word-headline system and the 8-fold full-viewport snap remain.
- **Accessibility (was P2, resolved):** placeholder 1.85→5.3:1 (AA), card descriptions 6.3→7.79:1 (AAA), card meta 1.59→3.71:1; hamburger 36→44px touch target; install copy button gets a ~46px tap area on coarse pointers.
- **Performance (resolved):** Nav drawer animates `transform` instead of `padding-left` (layout-thrash flag cleared).
- **Social proof:** star badge now gated at ≥50 so a low count can't read as weak; at the current count it hides.

## Anti-Patterns Verdict

Still passes the brand slop test — distinctive operator-console identity, detector-clean apart from one false positive ("single font", when the page uses three families). The copy and rhythm cleanup reduced the "AI grammar" read; the remaining tell is the per-section eyebrow + identical two-word headline on all 8 sections (a committed brand system, not a reflex).

## Remaining Priority Issues

- **[P2] Section-header uniformity + 8-fold march.** Zigzag helped the left/right monotony, but every section still opens with the identical eyebrow + two-word stroke headline, and there are still 8 full-viewport snap sections. Vary the header cadence and/or compress 2-3 sections. → /impeccable layout or /impeccable distill
- **[P2] Mobile primary CTA.** Touch targets are fixed, but the hero's primary action on mobile is still `brew install` (which a phone can't run). Consider making "Star on GitHub" the coarse-pointer primary. → /impeccable adapt
- **[P3] Social-proof strip is thin without the star count.** Now that stars hide below 50, the strip leads with "Built by @kengio." Add an always-true signal (open source · MIT) so it stays credible. → /impeccable clarify
- **[P3] Stylized nav labels** (SYNERGY/STACK/SESSION) tax recognition for first-timers. → /impeccable clarify
- **[P3] Card meta labels** remain decorative-low (3.71:1); mark `aria-hidden` if strict AAA is required.
- **[P3] 404 + privacy pages** still contain em dashes (separate routes, not index).

## Persona Red Flags (updated)

- **Jordan (First-Timer):** now learns what OneBrain is from the clarifier within the first screen (was a 5-second blank). Nav labels still cryptic.
- **Devon (Skeptical dev):** the overpromise alarm is softer (plain clarifier, candid positive copy, no "10 stars" undercut). Real commands + MIT + BYOK still carry trust.
- **Casey (Mobile):** hamburger and copy targets now touch-friendly; the brew-install-as-primary friction remains.

## Questions to Consider

- Is the per-section eyebrow earning its place on all 8 sections, or would dropping it on half make the remaining ones land harder?
- With the star count hidden, what's the strongest always-true proof to lead the waitlist strip?
