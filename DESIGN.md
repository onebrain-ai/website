---
name: OneBrain
description: Marketing site for OneBrain, an AI thinking partner that lives inside your Obsidian vault.
colors:
  void-black: "#050507"
  console-surface: "#0a0a12"
  hairline: "#FFFFFF14"
  signal-white: "#f0f0f2"
  muted-steel: "#a1a1aa"
  magenta-pulse: "#ff2d92"
  cyan-signal: "#00f3ff"
  violet-arc: "#bc13fe"
  amber-warn: "#ffb000"
typography:
  display:
    fontFamily: "Chakra Petch, Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(3.2rem, 8.5vw, 8.5rem)"
    fontWeight: 700
    lineHeight: 0.92
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Chakra Petch, Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.4rem, 5.6vw, 5rem)"
    fontWeight: 700
    lineHeight: 0.95
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Chakra Petch, Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.05rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.04em"
  body:
    fontFamily: "JetBrains Mono, ui-monospace, SF Mono, Menlo, monospace"
    fontSize: "0.95rem"
    fontWeight: 400
    lineHeight: 1.65
    letterSpacing: "normal"
  label:
    fontFamily: "JetBrains Mono, ui-monospace, SF Mono, Menlo, monospace"
    fontSize: "0.625rem"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0.4em"
rounded:
  none: "0"
  sm: "2px"
spacing:
  sm: "12px"
  md: "18px"
  lg: "24px"
  section-pad: "4rem"
components:
  button-primary:
    backgroundColor: "{colors.magenta-pulse}"
    textColor: "{colors.void-black}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "18px 30px"
  button-primary-hover:
    backgroundColor: "#ffffff"
    textColor: "{colors.magenta-pulse}"
  button-ghost:
    backgroundColor: "#FFFFFF05"
    textColor: "#FFFFFFD9"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "18px 30px"
  button-ghost-hover:
    backgroundColor: "#00F3FF0D"
    textColor: "{colors.cyan-signal}"
  card:
    backgroundColor: "{colors.console-surface}"
    textColor: "{colors.signal-white}"
    rounded: "{rounded.none}"
    padding: "22px 24px"
  input:
    backgroundColor: "#00000080"
    textColor: "#ffffff"
    typography: "{typography.body}"
    rounded: "{rounded.none}"
    padding: "14px 16px"
  pill-eyebrow:
    textColor: "{colors.cyan-signal}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "9px 16px"
---

# Design System: OneBrain

## 1. Overview

**Creative North Star: "The Operator Console"**

OneBrain's surface is a live mission-control console for a thinking machine. You don't *read* this site so much as *sit at its controls*: HUD readouts pin the four corners, a scroll-progress spine tracks your position on the right edge, telemetry ticks in a live agent feed, and each section "boots" with a one-shot scanline sweep before it reveals itself. The aesthetic is operator-grade and unmistakably alive, the visual half of the brand's promise that the agent is awake and learning you. Everything is rendered in light-on-void: near-black panels, monospace status lines, and a neon signal palette that glows rather than shines.

This is a developer-facing instrument, not a marketing brochure. It rejects every default of the category: no rounded-card grids, no soft purple SaaS gradients, no Inter-on-white, no big-number "hero metric" template, no mascot illustrations. It does not try to look like Notion, Mem, Reflect, or Obsidian's own marketing, the wedge is *the agent that learns you*, not prettier notes. And it is the opposite of corporate, no navy-and-gray, no stock photography, no buzzword sales copy, no trust-badge soup. Density is high and deliberate; every readout is concrete (real commands, real vault paths, real-feeling telemetry) so a skeptical engineer can *see* the machine work instead of reading adjectives about it.

The treatment is a strong hypothesis, not a cage. Hold the *register* (operator-grade, living, candid) as fixed; the specific neon-and-scanline execution is open to revision if a sharper direction better earns the install and the star.

**Key Characteristics:**
- Light-on-void: near-black (#050507) surfaces, neon signal accents that glow.
- Angular, never rounded: rectangular surfaces have zero radius; bevels come from `clip-path` cuts.
- Monospace as the speaking voice: reading copy is set in JetBrains Mono, not the sans.
- Living HUD: corner readouts, scroll-spine, scanline boots, live telemetry, warp transitions.
- Italic uppercase display type (Chakra Petch) for every headline.
- Per-section accent rotation across a four-color neon family.

## 2. Colors

A light-on-void palette: a single near-black canvas carrying a four-color neon "signal" family, where accents *glow* (via blur and box-shadow) rather than fill large areas.

### Primary
- **Magenta Pulse** (`#ff2d92`): The brand's act-now color and signature glow. Fills the primary CTA, strokes the hero headline, marks the command prompt `$`, and pulses in the warp-transition mark. The most emotionally loaded color in the system, use it where you want the eye and the click.

### Secondary
- **Cyan Signal** (`#00f3ff`): The system/interactive color. Default section accent, focus-ring color, link and copy-button hover, inline `code` highlight. Reads as "live and operable."

### Tertiary
- **Violet Arc** (`#bc13fe`): Gradient partner (pairs with Cyan in the nav CTA's frame) and a per-section accent.
- **Amber Warn** (`#ffb000`): The fourth section accent; the warm outlier that keeps the neon family from reading purely cool.

### Neutral
- **Void Black** (`#050507`): The body canvas. Everything sits on this.
- **Console Surface** (`#0a0a12`): Slightly lifted panels and section chrome. Cards layer a translucent variant (`rgba(8,8,14,0.78)`) on top.
- **Signal White** (`#f0f0f2`): Default text and headline fill.
- **Muted Steel** (`#a1a1aa`): Secondary/label text and inactive nav links. Reading copy uses a translucent white (`rgba(255,255,255,0.62)`) as its muted floor.
- **Hairline** (`#FFFFFF14`, i.e. `rgba(255,255,255,0.08)`): Borders, dividers, the section-grid lines.

### Named Rules
**The Glow-Not-Fill Rule.** Accents earn their saturation by *glowing*, neon stroke, blurred orb, box-shadow halo, never by flooding a large surface. A neon color filling more than a button-sized area is a bug; the void is what makes the signal read.

**The Per-Section Accent Rule.** Each section owns one accent via the `--section-accent` custom property, rotating through the four-color family. Within a section, that one accent is law; do not mix two signal colors in a single section except where the system already pairs them (the nav CTA frame, the hero headline's magenta-stroke / cyan-underglow).

**The Living-Floor Rule.** Reading copy never goes lighter than `rgba(255,255,255,0.62)` on void; that is the muted floor, not a starting point. Push toward Signal White for anything a user must actually read (the AAA aim). The current input placeholder (`rgba(255,255,255,0.22)`) sits below that floor and is the known weak spot to fix, not a pattern to copy.

## 3. Typography

**Display / Headline Font:** Chakra Petch (with Inter, then system sans, as fallback)
**Body / Reading Font:** JetBrains Mono (with SF Mono, Menlo as fallback)
**Base UI Sans:** Inter (the `font-sans` base for any neutral UI text the mono voice doesn't claim)

**Character:** Chakra Petch is a squared, technical display face; set italic, bold, and uppercase it reads like a stenciled mission designation. Pairing it against monospace body copy (rather than a humanist sans) is the deliberate move that keeps the whole page in the operator/terminal register, the contrast axis is *engineered display vs. terminal output*, never two similar sans-serifs.

### Hierarchy
- **Display** (Chakra Petch italic 700, `clamp(3.2rem, 8.5vw, 8.5rem)`, line-height 0.92, `-0.02em`, uppercase): The hero headline only. One per page.
- **Headline** (Chakra Petch italic 700, `clamp(2.4rem, 5.6vw, 5rem)`, line-height 0.95, `-0.02em`, uppercase): Section titles (`cyber-h2`). Often rendered stroke-only with a left-to-right color "drain" on section boot.
- **Title** (Chakra Petch italic 700, `1.05rem`, `0.04em`, uppercase): Card titles and small headers.
- **Body** (JetBrains Mono 400, `0.95rem`, line-height 1.65, `rgba(255,255,255,0.62)`): All reading copy, hero sub, section sub, card descriptions. Cap measure at 540–640px (~60–70ch).
- **Label** (JetBrains Mono 700, `0.625rem`/10px, letter-spacing `0.4em`, uppercase): Eyebrow pills, HUD readouts, status lines, nav links (9px / `0.2em`). The system's "machine print."

### Named Rules
**The Monospace Voice Rule.** Reading copy is JetBrains Mono, not the sans. The terminal voice is the brand; do not swap body prose to Inter for "readability", widen line-height instead.

**The Stencil Rule.** Headlines are Chakra Petch, italic, uppercase, every time. Never set a headline in the body mono or in roman/non-italic Chakra Petch; the italic stencil is the brand's headline signature.

## 4. Elevation

There are no traditional drop shadows in this system. Depth is built two ways: **tonal layering** (Void Black `#050507` canvas → Console Surface `#0a0a12` chrome → translucent card panels `rgba(8,8,14,0.78)` → hairline borders) and **neon glow**, the only `box-shadow` vocabulary present, used as a *halo around active or accent elements*, not as a lift under surfaces. A surface that casts a soft gray drop shadow for "depth" is off-system; surfaces are flat and depth comes from value and from light bleeding off the signal colors.

### Shadow Vocabulary
- **CTA glow** (`box-shadow: 0 0 40px rgba(255,45,146,0.35)`; hover `0 0 70px rgba(255,45,146,0.6)`): The primary button's resting magenta halo, intensifies on hover.
- **Dot / focus glow** (`0 0 10px–22px currentColor`): Spine dots, pill dots, and focus states glow in their own accent.
- **Text glow** (`text-shadow: 0 0 50–60px <accent>`): Headline stroke and stylized type emit a soft accent bloom.
- **Orb wash** (`filter: blur(100px)` on a 9%-accent ellipse): Ambient per-section atmosphere behind content, the closest thing to "elevation," and it sits *behind*, never under.

### Named Rules
**The No-Lift Rule.** No surface casts a gray drop shadow. The only `box-shadow` in the system is a colored *glow* on active/accent elements. If a card looks like it's floating on a 2014 app shadow, delete the shadow and let tonal layering carry the depth.

## 5. Components

### Buttons
- **Shape:** Angular, never rounded. Beveled corners via `clip-path` polygons (e.g. `polygon(8% 0, 100% 0, 100% 75%, 92% 100%, 0 100%, 0 25%)`); `border-radius` is `0`.
- **Primary** (`btn-cyber-primary`): Solid Magenta Pulse fill, Void Black text, magenta border, resting CTA glow. Label set in mono caps (11px, `0.32em`), padding `18px 30px`. **Hover:** flips to white fill with magenta text and a stronger glow; the `↗` arrow slides diagonally.
- **Ghost** (`btn-cyber-ghost`): Barely-there fill (`rgba(255,255,255,0.02)`), 85%-white text, faint white border. **Hover:** Cyan Signal border + text over a 5%-cyan wash.
- **Nav CTA** (`btn-tech`): A gradient *frame* (Violet Arc → Cyan Signal) wrapping a Void-Black inner panel, both clipped to the same angular shape. **Hover:** inner panel flips white (so inner dark text reads) with a magenta box-shadow glow.

### Cards / Containers (`cyber-card`)
- **Corner Style:** Sharp (`border-radius: 0`).
- **Background:** Translucent console panel (`rgba(8,8,14,0.78)`), deliberately solid-enough to avoid a per-card backdrop-blur layer.
- **Border:** 1px Hairline (`rgba(255,255,255,0.06)`).
- **Shadow Strategy:** None at rest (see Elevation). Hover tints the border toward the section accent and reveals a 2px accent bar on the left edge plus an accent-colored corner meta-label.
- **Internal Padding:** `~1.4rem 1.5rem`.
- **Nesting:** Forbidden. Cards never contain cards.

### Inputs / Fields (`waitlist-input`)
- **Style:** Black translucent fill (`rgba(0,0,0,0.5)`), 1px Hairline border (`rgba(255,255,255,0.1)`), sharp corners, mono 13px, white text. Padding `14px 16px`.
- **Focus:** 2px section-accent outline (`outline-offset: 2px`) plus accent border, the same accent the surrounding section owns.
- **Placeholder:** Currently `rgba(255,255,255,0.22)` — below the Living-Floor and the one contrast debt to repay.

### Navigation (`nav-glass`)
- **Style:** Sticky 64px bar, opaque near-black (`rgba(2,2,4,0.92)`) with a 1px hairline bottom border. No backdrop-blur (the opacity carries the glass feel without a Safari paint cost).
- **Logo:** Chakra Petch, 1.4rem.
- **Links:** Mono 9px, `0.2em`, uppercase, Muted Steel at rest. Hover/active flips to white and reveals `[ ]` brackets framing the label. The active section is tracked by an IntersectionObserver and mirrored on both the nav links and the spine dots.
- **Mobile:** Collapses to a drawer; the scroll-spine and per-section scanline are suppressed below 1024px (scroll-snap is disabled there too).

### Signature Components
- **Eyebrow Pill** (`cyber-pill`): Mono 10px `0.4em` caps in the section accent, framed by hand-drawn corner brackets with a pulsing dot and a typewriter caret on entrance. This is the project's deliberate, branded kicker, used as one consistent system element, not a generic per-section eyebrow.
- **Page Spine HUD** (`page-spine`): Right-edge fixed scroll-progress rail; one dot per section, inactive dots faint gray, the active dot glows in the section accent. Doubles as jump navigation.
- **Operator Console** (`op-console`): The hero's live agent-telemetry panel, window chrome, REC indicator, scrolling feed, and a MEM/INBOX/TASKS/VAULT status strip. The literal embodiment of the North Star.
- **Command Box** (`cmd-box`): The install-command surface, `$` prompt in magenta, mono command text, a 3px magenta→cyan gradient bar on the left edge, and a copy button that confirms in cyan. The single most conversion-critical element (it carries the install).
- **Warp Transition:** A full-screen scanline sweep + held blackout with a breathing brain mark between hash jumps, the "teleport between consoles" effect.

## 6. Do's and Don'ts

### Do:
- **Do** keep every rectangular surface sharp (`border-radius: 0`); express angularity through `clip-path` bevels, never rounded corners.
- **Do** set headlines in Chakra Petch, italic, uppercase, and reading copy in JetBrains Mono. Honor the Monospace Voice and Stencil rules.
- **Do** give each section exactly one accent via `--section-accent` and let accents *glow* rather than fill (Glow-Not-Fill, Per-Section Accent rules).
- **Do** hold body text to ≥4.5:1 (AA floor) and push toward AAA where the palette allows; treat `rgba(255,255,255,0.62)` as the muted floor and fix the input placeholder up to it.
- **Do** show the machine, real commands, real vault paths, live telemetry, over adjectives. Make the hero earn the install in one screen.
- **Do** ship a `prefers-reduced-motion` path for every animation (scanline, warp, particles, glitch all already have one) and keep effects from gating content visibility.

### Don't:
- **Don't** use generic-SaaS scaffolding: rounded-card grids, soft purple gradients, Inter-on-white, the big-number hero-metric template, or mascot illustrations.
- **Don't** let it read like a rival note tool, Notion, Mem, Reflect, or Obsidian's own marketing. The wedge is the agent that learns you, not prettier notes.
- **Don't** drift corporate/enterprise: no navy-and-gray, no stock photography, no buzzword sales copy ("supercharge your knowledge"), no trust-badge soup.
- **Don't** add gray drop shadows for depth; the only shadow is a neon glow on accents (No-Lift Rule).
- **Don't** nest cards inside cards, or flood a neon accent across a large surface.
- **Don't** set headlines in the body mono or in roman (non-italic) Chakra Petch, and don't swap reading copy to a sans for "readability."
- **Don't** turn the eyebrow pill into a generic per-section all-caps kicker; it is one branded system element, used consistently, not scaffolding sprinkled above every heading.
