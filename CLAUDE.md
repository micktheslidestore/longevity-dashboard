# Allostatic — Claude Code Instructions

@AGENTS.md

## Project overview

Allostatic is a longevity coaching platform with two interconnected products:
- **Client product** (`/client/*`) — Jamie's view. Personal, calm, narrative-led.
- **Coach product** (`/coach/*`) — Darcy's view. Efficient workspace, AI-visible.

See `ALLOSTATIC_PRODUCT_DOC.md` for full product architecture and feature documentation.

## Design system

**Read `DESIGN_SYSTEM.md` before making any visual changes.** This is the single source of truth for:
- Design tokens (colours, spacing, typography) for both dark and light themes
- Typography rules (which font for which purpose — serif, sans, mono)
- Component patterns (lifecycle chips, action cards, score rings)
- Lifecycle models (corrector, directive, flag, outcome state machines)
- Cross-platform connection rules
- Implementation rules (what to change, what to preserve, what NOT to do)

### Critical design rules (summary)

1. **Monospace is for numbers only.** Use sans-serif (DM Sans) for all labels, descriptions, body text, and buttons. Mono (IBM Plex Mono) is reserved for data values, scores, and timestamps.
2. **Sentence case everywhere.** No `text-transform: uppercase`. No ALL CAPS labels or buttons.
3. **No border grids.** Separate sections with whitespace (48–56px gaps). Cards use background fills, not 1px borders.
4. **One focal element per screen.** The most important thing should be visually dominant. Everything else is subordinate.
5. **Lifecycle-aware statuses.** Every status chip must have a tooltip definition and show its lifecycle position. See DESIGN_SYSTEM.md section 6 for all state machines.
6. **Jamie never sees AI.** Directives and correctors appear "from Darcy." Draft and in-review states are coach-only.

### Reference implementations

- `client-dashboard-redesign.jsx` — dark theme client dashboard (canonical reference)
- `client-dashboard-light.jsx` — light theme client dashboard (canonical reference)

When building new screens or modifying existing ones, match the patterns, spacing, typography, and component usage from these reference files.

## Tech stack

- Next.js (app router) + TypeScript
- Recharts for data visualisation
- CSS custom properties for theming
- No component library — custom components only

## Data

- `src/data/james.ts` — single source of truth for all mock data
- `src/lib/irt.ts` — IRT-based Allostatic Load computation (genuinely computed, not hardcoded)
- Changes to data structure should propagate to all consuming components

## File structure

```
src/
  app/
    page.tsx              — Landing gate (product selector)
    client/               — Jamie's product
      page.tsx            — Client dashboard
      command/page.tsx    — Client command (agent, calendar, protocol)
      checkin/page.tsx    — Daily check-in form
      trends/page.tsx     — 30-day trend charts
      medical/page.tsx    — Biomarker pace, labs, roadmap
      team/page.tsx       — Care team roster
    coach/                — Darcy's product
      command/page.tsx    — Coach command centre (decision layer, agent, workflow)
      compliance/page.tsx — Outcomes, adherence, flags
      calendar/page.tsx   — Weekly Kanban calendar
      trends/page.tsx     — Full analytical trend view
      medical/page.tsx    — Biomarker action view
      team/page.tsx       — Inbox, team management
      dashboard/page.tsx  — Live view of Jamie's dashboard
      architecture/page.tsx — System connectivity map
  components/             — Shared components
  data/                   — Mock data
  lib/                    — Computation utilities
```
