# Allostatic — Design System & Lifecycle Specification

> This document is the single source of truth for visual design, lifecycle models, and implementation rules.
> It serves three purposes:
> 1. **Production brief** — share with stakeholders for review before build
> 2. **Claude Code constraint layer** — referenced by CLAUDE.md to ensure consistent implementation
> 3. **Design system reference** — tokens, typography, spacing, and component patterns

---

## 1. Design philosophy

Allostatic serves two users with fundamentally different emotional needs:

**Jamie (client)** — a high-wealth individual investing in longevity. His experience should feel like opening a letter from a trusted advisor. Calm authority. One clear message per screen. The AI is invisible — every insight arrives as if from Darcy personally.

**Darcy (coach)** — a professional managing Jamie's programme. His experience should feel like an efficient workspace — denser than Jamie's, but still breathable. The AI is visible as a tool — drafts, recommendations, and flags that Darcy reviews and signs.

### Core principles

1. **One focal element per screen** — the single thing that answers the user's implicit question. Everything else is visually subordinate.
2. **Whitespace over borders** — sections are separated by generous spacing, not by 1px lines. Containers use subtle background fills, not border grids.
3. **Narrative over data** — lead with a sentence in serif, not a grid of numbers. Data supports the narrative, not the other way around.
4. **Lifecycle-aware statuses** — every status chip has a definition, shows its position in a lifecycle, and indicates who triggers the next transition.
5. **Cross-platform receipts** — when Darcy takes an action, both platforms show confirmation. The platforms talk to each other — show it.
6. **AI is invisible to Jamie, visible to Darcy** — Jamie sees directives "from Darcy." Darcy sees the full pipeline: agent draft → review → signed.

---

## 2. Design tokens

### 2.1 Dark theme (default)

```
Background
  --bg:              #121214     page background
  --surface:         #1a1a1e     card/section fill
  --surface-raised:  #222226     elevated elements, active nav

Borders
  --border:          rgba(255,252,245, 0.06)   default separation
  --border-subtle:   rgba(255,252,245, 0.03)   structural lines (sidebar, topbar)
  --border-med:      rgba(255,252,245, 0.10)   interactive element borders

Ink (text)
  --ink:             #F2EFE8     primary text
  --ink-2:           #B5B0A6     secondary / body copy
  --ink-3:           #7D7972     tertiary / labels
  --ink-4:           #4A4743     quaternary / disabled

Semantic colours
  --ok:              #7FA99B     positive, stable, approved
  --ok-subtle:       rgba(127,169,155, 0.08)   background tint
  --ok-muted:        rgba(127,169,155, 0.15)   border tint
  --warn:            #C8A56A     watch, active, needs attention
  --warn-subtle:     rgba(200,165,106, 0.06)
  --warn-muted:      rgba(200,165,106, 0.12)
  --alert:           #C17A6A     elevated, flag, danger
  --accent:          #C8A56A     brand accent, today indicator
```

### 2.2 Light theme

```
Background
  --bg:              #FAF8F4     warm cream page background
  --surface:         #FFFFFF     card fill
  --surface-raised:  #F3F1EC     elevated elements, active nav

Borders
  --border:          rgba(30,28,24, 0.08)
  --border-subtle:   rgba(30,28,24, 0.05)
  --border-med:      rgba(30,28,24, 0.12)

Ink
  --ink:             #1C1B18
  --ink-2:           #52504A
  --ink-3:           #8A877F
  --ink-4:           #B8B4AC

Semantic (darkened for light backgrounds)
  --ok:              #4D8A7A
  --ok-subtle:       rgba(77,138,122, 0.06)
  --ok-muted:        rgba(77,138,122, 0.12)
  --warn:            #A07D3A
  --warn-subtle:     rgba(160,125,58, 0.05)
  --warn-muted:      rgba(160,125,58, 0.10)
  --alert:           #B05A4A
  --accent:          #A07D3A
```

---

## 3. Typography

### Font stack

| Role | Font | Usage |
|------|------|-------|
| **Serif** | Source Serif 4 (300, 400) | Headlines, narrative text, north-star statements, corrector titles |
| **Sans** | DM Sans (400, 500) | Body copy, labels, descriptions, buttons, navigation, all secondary text |
| **Mono** | IBM Plex Mono (300, 400) | Data values, scores, metrics, timestamps, technical identifiers only |

### Typography rules

1. **Serif leads the narrative.** The first thing a user reads on any screen should be serif — it sets the emotional tone.
2. **Sans is the workhorse.** All descriptive text, labels, button text, and secondary information uses sans. This is the biggest change from the current build.
3. **Mono is for numbers only.** Scores (64), metrics (41 ms), timestamps (06:14), and technical values. Never for labels, descriptions, or body text.
4. **Sentence case everywhere.** No ALL CAPS labels. No UPPERCASE buttons. Sentence case for everything including navigation, status chips, and eyebrows.
5. **Maximum two font sizes per component.** A card has a title size and a body size. Not three or four.

### Type scale

| Element | Font | Size | Weight | Colour |
|---------|------|------|--------|--------|
| Page headline | Serif | 28px | 300 | --ink |
| Section narrative | Serif | 22px | 300 | --ink |
| Card title | Serif | 20px | 400 | --ink |
| Body text | Sans | 14px | 400 | --ink-2 |
| Section label | Sans | 12px | 400 | --ink-3 |
| Component label | Sans | 11px | 500 | --ink-3 |
| Data value (large) | Mono | 36px | 300 | semantic |
| Data value (medium) | Mono | 22px | 300 | --ink |
| Data value (small) | Mono | 13px | 400 | --ink |
| Status chip | Sans | 11px | 500 | semantic |

---

## 4. Spacing & layout

### Spacing scale

| Token | Value | Usage |
|-------|-------|-------|
| `--space-xs` | 4px | Internal component gaps |
| `--space-sm` | 8px | Between related elements (e.g., grid cards) |
| `--space-md` | 16px | Between components within a section |
| `--space-lg` | 32px | Between sections |
| `--space-xl` | 48px | Between major content blocks |
| `--space-2xl` | 56px | Between screen regions (margin-bottom on major sections) |

### Container rules

1. **No 1px border grids.** Sections are separated by `--space-2xl` vertical whitespace.
2. **Cards use background fill, not borders.** Dark: `--surface` fill on `--bg`. Light: `--surface` fill with `1px solid --border`.
3. **Border radius: 10–14px for cards.** 8px for smaller elements (buttons, chips). 20px for pill-shaped chips.
4. **Card padding: 20–36px.** More padding = more importance. The morning card gets 32–36px. Sleep summary gets 16–18px.
5. **Max content width: 960px** for Jamie's view (comfortable reading). 1200px for Darcy's view (workspace density).

### Layout patterns

**Jamie's dashboard**: Single column, 960px max, generous vertical rhythm. Grid only for data metrics (4-col) and north-star tracks (2-col).

**Darcy's command centre**: Two-column layout where appropriate (decision layer is full-width focal, workflow cards can be 2-col). 1200px max.

---

## 5. Component patterns

### 5.1 Lifecycle chip

Every status in the system uses a consistent chip component with:
- Pill shape (border-radius: 20px)
- Dot indicator (5px circle) + label text
- Semantic colour from the status definition
- Hover/tap tooltip showing the plain-English definition

```
[● Active]  — colour: --warn, background: --warn-subtle
[● Signed]  — colour: --ok, background: --ok-subtle
[● Draft]   — colour: --ink-3, background: neutral
```

**Rule: no undefined status labels in the UI.** Every chip must map to a defined lifecycle state with a tooltip definition.

### 5.2 Lifecycle position indicator

For objects with multi-step lifecycles (correctors, directives), show the full lifecycle path with the current position highlighted:

```
Draft → ● Active → Acknowledged → Resolved
                                   ↑ current
```

Used inside corrector cards and directive detail views. Compact, single-line, muted colours for inactive states.

### 5.3 Action card (corrector/directive)

```
┌─────────────────────────────────────────────┐
│  [● Active]  Day 3 · issued 17 Apr          │
│                                              │
│  Hold all intensity training    ← serif 20px │
│  Zone-2 only or full rest...    ← sans 14px  │
│                                              │
│  Draft → ● Active → Ack → Resolved          │
│                                              │
│  [Acknowledge]  [Ask Darcy about this]       │
└─────────────────────────────────────────────┘
```

Background: `--warn-subtle` for active correctors, `--surface` for signed directives.

### 5.4 Morning card

The focal element on Jamie's dashboard. No container border — it breathes directly on the page background. Serif headline, sans body, green action callout at the bottom.

### 5.5 Score ring

Replaces the current large-number-with-bars pattern. SVG ring showing AL score as a proportion of 100. Colour follows band (ok/warn/alert). Domain bars sit below the ring as compact horizontal indicators.

### 5.6 Cross-platform receipt

When an action crosses platforms (Darcy approves → Jamie receives), both sides show a confirmation:

**Darcy sees:** "✓ Recommendation approved · pushed to Jamie"
**Jamie sees:** Corrector card appears with lifecycle chip and "from Darcy" attribution

The receipt uses `--ok-subtle` background with a dot indicator and is dismissible.

---

## 6. Lifecycle models

### 6.1 Protocol outcome

Tracks whether a protocol change worked.

| State | Colour | Definition | Entry trigger | Who evaluates |
|-------|--------|------------|---------------|---------------|
| Pending | --ink-3 | Issued, waiting for data | Darcy signs a protocol | System |
| Monitoring | --warn | Data accumulating, trend inconclusive | ≥7 days of data | Agent |
| Effective | --ok | Target metric improved, sustained ≥14 days | Metric improvement ≥ threshold | Agent recommends, Darcy confirms |
| Partial | --ink-3 | Some improvement, below target or confounded | Improvement <50% of target | Agent recommends, Darcy confirms |

### 6.2 Attention flag

Raised by the agent when data crosses a threshold.

| State | Colour | Definition | Trigger |
|-------|--------|------------|---------|
| Raised | --warn | Agent detects threshold breach | Metric crosses threshold or matches historical pattern |
| Triaged | --ink-2 | Darcy reviews and chooses action | Darcy selects: Act / Notify Jamie / Watch |
| Resolved | --ok | Underlying metric returns to baseline | Metric at baseline ≥48h, or Darcy manually resolves |

**Triage actions (not statuses):**
- **Act** → creates a corrector (transitions to corrector lifecycle)
- **Notify Jamie** → sends a message to Jamie's feed
- **Watch** → stays in Darcy's view, re-evaluates in 24h

### 6.3 Course corrector

The core feedback loop: recommendation → action → outcome.

| State | Colour | Definition | Trigger | Visibility |
|-------|--------|------------|---------|------------|
| Draft | --ink-3 | Agent prepares recommendation | Agent analysis | Darcy only |
| Active | --warn | Darcy approves and signs | Darcy clicks approve | Both |
| Acknowledged | --ok | Jamie has seen it | Jamie taps acknowledge | Both |
| Resolved | --ok | Intervention achieved goal | Metric restored to baseline | Both |
| Superseded | --ink-4 | Replaced or manually closed | Darcy issues replacement | Both |

### 6.4 Directive

Instructions from Darcy to Jamie.

| State | Colour | Definition | Visibility |
|-------|--------|------------|------------|
| Draft | --ink-3 | Agent prepares, awaiting Darcy | Darcy only |
| In review | --warn | Darcy is editing | Darcy only |
| Signed | --ok | Approved, published | Both |

**Key rule:** Jamie never sees "draft" or "in review." His experience: a directive appears, fully formed, from Darcy.

---

## 7. Cross-platform connection rules

1. Every action Darcy takes produces a visible receipt on his screen AND a visible arrival on Jamie's.
2. Data sync confirmation is ambient — a subtle pulse dot and timestamp in the sidebar, not a modal or banner.
3. Lifecycle objects (correctors, directives, flags) use the same visual language on both platforms — same colour, same chip shape, different information density.
4. Jamie sees the headline. Darcy sees the full record.
5. When Jamie acknowledges a corrector, Darcy's compliance view updates immediately with a receipt.

---

## 8. Implementation rules for Claude Code

### What to preserve from the current build
- Route-based role separation (`/client/*` and `/coach/*`)
- IRT-based AL score computation (`src/lib/irt.ts`)
- Data model structure (`src/data/james.ts`)
- Recharts for trend visualisation
- Next.js app router structure

### What to preserve (in addition to the above)
- **Navigation icons** (`src/components/NavIcons.tsx`) — the SVG icon system stays. Icons build spatial memory and pattern recognition. Apply typography changes (sentence case, sans-serif) to nav label text, but keep the icon component unchanged.

### What to change
- Replace `globals.css` with a token-based system using the values in section 2
- Swap monospace labels → sans-serif labels (mono only for data values)
- Remove border grids — use whitespace + background fill
- Add lifecycle chip component with tooltip definitions
- Add lifecycle position indicator component
- Sentence case all UI text (remove `text-transform: uppercase` from labels)
- Increase card padding from 16–20px to 20–36px
- Increase section gaps from 20px to 48–56px
- Add rounded corners (10–14px on cards, current 6px is too subtle)
- Set max-width 960px for client views, 1200px for coach views

### What NOT to do
- Do not flatten the information architecture — the current IA is correct
- Do not remove data or metrics — re-weight them visually, don't delete them
- Do not make Jamie's view look like Darcy's or vice versa
- Do not use gradients, shadows, or decorative effects
- Do not use ALL CAPS for any UI text
- Do not use monospace for labels, descriptions, or body text
- Do not add borders between list items — use spacing

---

## 9. File reference

| File | Purpose | Status |
|------|---------|--------|
| `client-dashboard-redesign.jsx` | Dark theme client dashboard reference | Complete |
| `client-dashboard-light.jsx` | Light theme client dashboard reference | Complete |
| `DESIGN_SYSTEM.md` (this file) | Design system + lifecycle spec | Living document |
| `src/app/globals.css` | Current CSS — to be replaced | Pending |
| `src/data/james.ts` | Data model — preserve | No change |
| `src/lib/irt.ts` | IRT computation — preserve | No change |

---

*Document version: 1.0 · April 2026*
*Prepared by: Mick + Claude · Design direction review*
