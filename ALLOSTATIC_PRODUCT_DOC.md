# Allostatic — Product & Implementation Document

> Living document. Last updated: April 2026.  
> Use this as a briefing tool with prospects, a markup surface for amends, and a technical reference for moving toward production.

---

## 1. What this is

Allostatic is a longevity coaching platform — a software layer that sits between a coach (Darcy O'Sullivan) and a client (Jamie Garis, 54M principal) and makes the coaching relationship more data-driven, more accountable, and more scalable.

The core problem it solves: high-performance longevity coaching currently lives in spreadsheets, WhatsApp messages, and PDFs. The coach has data from wearables, labs, and check-ins scattered across five different apps. The client doesn't know what's actually working. Neither party has a clear record of what was decided and what happened as a result.

Allostatic consolidates those inputs into two interconnected products — a Coach product and a Client product — with a shared scientific layer underneath.

**The prospect pitch in one sentence:** *Real-time data aggregation + AI-assisted decision-making for longevity coaches who want to run a programme that actually produces measurable outcomes.*

---

## 2. The scientific model

### 2.1 Allostatic Load (IRT-based scoring)

The centrepiece of the platform is the **Allostatic Load (AL) score** — a composite metric from 0–100 that represents how close a client is to physiological overload across four domains.

**Why this framing:** "Allostatic load" is the scientific term for the cumulative wear-and-tear the body experiences when exposed to chronic stress — physical, metabolic, sleep-related, and psychological. Unlike a single biomarker, it captures the system-level state of the client.

**How it's calculated:** The model is inspired by **Item Response Theory (IRT)** — the same statistical framework used in adaptive educational testing. Each biomarker is treated as a "question" with its own discriminating power. Rather than averaging raw numbers, the model:

1. Normalises each metric against the *individual's own rolling baseline* (not population averages)
2. Computes a z-score deviation for each domain
3. Weights domains by empirical discriminating power
4. Produces a composite score with subscore breakdowns

This means Jamie's HRV dropping from 52 ms to 41 ms reads differently than the population average of 45 ms — because it's his baseline that matters.

**Score bands:**
| Score | Band | Meaning |
|---|---|---|
| 0–49 | Stable | Normal adaptive load, training can progress |
| 50–69 | Watch | Elevated — monitor, consider load reduction |
| 70–100 | Elevated | Flag — corrector required, protect recovery |

**Domains tracked:**
| Domain | Metrics | Weight |
|---|---|---|
| Autonomic | HRV (heart rate variability), resting heart rate | Highest |
| Sleep | Sleep efficiency, deep sleep minutes | High |
| Metabolic | Glucose SD, time-in-range (CGM) | Medium |
| Inflammatory | Skin temperature deviation (proxy) | Medium |

**Source:** `src/lib/irt.ts` — this is genuinely computed from the raw time series on every render. It is not a hardcoded number.

### 2.2 Protocol outcome tracking

Every corrector issued has a before/after impact tracked in the data model:

```ts
impact: { metric: "Deep sleep", before: "41 min", after: "62 min", unit: "avg", days: 6 }
```

The compliance page surfaces this as "Outcomes — did it work?" — flipping the lens from adherence (are they doing it?) to results (did it move the needle?).

### 2.3 Biomarker pace modelling

Key biomarkers (ApoB, HRV floor, Fibrinogen, VO₂max) are tracked against quarterly targets with pace indicators:

- **Current trajectory** vs target endpoint
- **Projected value** at end of quarter at current rate
- **Gap** between projection and target
- **What this means this week** — a specific action for the coach

This transforms the medical view from a reporting tool into a weekly decision surface.

---

## 3. Product structure

### 3.1 Architecture overview

```
Landing gate (/)
├── Client product (/client/*)    — Jamie's view
│   ├── Dashboard                  — AL score, northstar, directives
│   ├── Command                    — Agent, cycle, checklist, protocol
│   ├── Check-in                   — Daily RPE, mood, session log
│   ├── Trends                     — 30-day charts, pivot heatmap
│   ├── Medical                    — Biomarker pace, roadmap, labs
│   └── Team                       — Care team roster
│
└── Coach product (/coach/*)       — Darcy's view
    ├── Command Centre              — Decision layer, agent SOP, workout card, today
    ├── Compliance                  — Outcomes, flag triage, adherence
    ├── Calendar                    — Weekly Kanban, drag-and-drop
    ├── Trends                      — Full analytical view
    ├── Medical                     — Biomarker action view + lab upload
    ├── Team                        — Inbox, team management
    ├── Dashboard                   — Live view of Jamie's dashboard
    └── Architecture                — System connectivity map + lifecycle workflows
```

### 3.2 The landing gate

`/` is a product gate, not a dashboard. It shows two cards:
- **Jamie (Principal)** → routes to `/client`
- **Darcy (Coach)** → routes to `/coach/command`

This ensures the two products never collide. The toggle-based role switching that early prototypes used has been removed — product identity is determined by route, not a button.

### 3.3 Route-based role context

Both sidebars (`ClientSidebar`, `CoachSidebar`) call `setRole("james" | "darcy")` via `useEffect` on mount. This keeps all existing components that read `useApp()` working correctly without a toggle.

---

## 4. Key components and their purpose

### 4.1 Coach Command Centre — `/coach/command`

The primary workspace for Darcy. Opens every morning with everything needed to manage Jamie's programme. Seven sections, flowing top to bottom:

**Since your last visit** *(new)*
Dismissible banner at the top surfacing 3 recent changes since Darcy last opened the app — colour-coded by severity (warn/accent/neutral), each with a timestamp and a deep link to the relevant page (Trends, Medical, Compliance). One click to dismiss for the session.

**Decision Layer**
The first fixed decision surface. A calm, spacious panel with:
- A plain-English situation narrative (large serif)
- Three supporting data points
- A specific recommendation with timeline
- One primary action: "Approve and push to Jamie"

This is the missing piece in most coaching dashboards: not just "here's a flag" but "here's what to do about it, now."

**Workout recommendation card** *(new)*
Agent-drafted 5-day workout block for the current week. Each day shows date, workout type, duration, and notes. The coach can:
- Edit any day inline (type dropdown, duration, note field)
- Approve the full block → transitions to "Pushed" state with toast notification
- Modify individual days before approving
- Reject and ask the agent to draft again

Lifecycle state machine: Draft → Approved → Pushed to Jamie's calendar. The card includes an agent reasoning paragraph (serif) explaining why the week was structured as it was, factoring in active correctors, calendar events, and recovery signals.

**Agent — structured Morning SOP + chat** *(enhanced)*
Two layers in one panel:

*Morning SOP* (collapsible, open by default) — 5 structured sections with colour-coded status dots:
1. Overnight analysis — HRV, RHR, skin temp, sleep efficiency with values and context
2. Workout recommendation — link to the card above with corrector status
3. Attention flags — active flags with pattern-match notes
4. Pending items — draft count and countersignature SLA status
5. Today's actions — 3 prioritised items with deep links

*Chat interface* (below SOP) — pre-loaded with Jamie's overnight context. Quick-action chips: ApoB status, draft protocol change, autonomic flag analysis, quarterly summary. Pattern-matched responses covering all key data points; navigates to sections when asked. Designed to accept real Claude API integration.

**Today (Workflow)**
4 action cards — each with urgency colour-coding, a **due-date badge** (mono text, amber when "by today"), expandable detail, a deep link to the relevant section, and a CTA that marks the action done.

**Programme Checklist**
Collapsed by default. Unchecks show **due dates** below the task text — dates with "by today" appear in amber. Action buttons deep-link to the relevant coach page (Compliance, Medical, Trends). Organised in four buckets: coach programme, coach daily, Jamie programme, Jamie daily.

**Quarterly history + Prepare review** *(enhanced)*
Collapsed by default. The active Q2 row includes a **"Prepare review →"** CTA that opens a 4-step guided questionnaire:
1. What worked well this quarter?
2. What didn't land or was missed?
3. Proposed targets for next quarter
4. Protocol changes to carry forward

Progress bar across steps. "Save and close" available at any point. On completion, notes are saved as a draft for the Tue 29 Apr quarterly review session.

### 4.2 Compliance — `/coach/compliance`

Leads with **Outcomes**, not adherence. The question is "did it work?" not "did they do it?"

- **Outcomes section:** resolved correctors with before/after impact, expandable notes
- **Attention flags:** full lifecycle triage — each flag moves through **Raised → Triaged → Resolved** with three action buttons (Act / Notify Jamie / Watch), a `LifecycleTrack` dot indicator, and after triage: "Triaged via [action]" + "Mark resolved"
- **Protocol adherence grid:** 6 protocols with progress bars, streaks, clickable detail
- **30-day adherence calendar:** colour-coded composite score per day
- **Check-in summary:** this morning's subjective data from Jamie

### 4.3 Calendar — `/coach/calendar`

Weekly Kanban view with drag-and-drop. Drag a workout from one day to another to reschedule. Changes are flagged as "pending" until Darcy commits them. Commit triggers a toast: "Schedule updated · syncing with Jamie's calendar."

Features: load bar chart (workout volume by day), calendar events overlaid (coaching calls, medical tests), high-stakes days panel (DEXA, bloods, cardiology).

### 4.4 Medical — `/coach/medical`

Two layers:
1. **Biomarker Pace** (top, action-focused): 4 biomarkers with pace status, "what this means this week", and Darcy's specific action. Clickable.
2. **Medical Roadmap**: milestone timeline (Apr 20 → Jul 2), biomarker target progress rails, full lab panels with trajectory charts.

**Upload lab results** *(new)*: button in the page header opens a modal with:
- Drag-and-drop file upload area (PDF, CSV, image)
- Data source selector with "Last uploaded" and "Next expected" dates per source
- Upload confirmation toast

### 4.5 Architecture — `/coach/architecture`

Two tabs:

**Architecture tab** — interactive system map:
- 5 layers: Data sources → Processing → Coach product → Client product → Outputs
- 17 labelled edges: sync / review / generate / alert / read
- Click any node: see what it receives from and sends to
- Click any edge: plain-English description of what triggers what
- Action → visual result table: 7 rows mapping coach actions to client-visible outcomes
- Integration status badges: live / proto / planned

**Workflows tab** *(new)* — 4 lifecycle diagrams in a 2×2 grid:
- **Protocol outcome:** Pending → Monitoring → Effective / Partial
- **Attention flag:** Raised → Triaged → Resolved
- **Course corrector:** Draft → Active → Acknowledged → Resolved / Superseded
- **Directive:** Draft → In review → Signed

Each lifecycle shows a horizontal pill-and-arrow flow diagram with a "now" badge on Jamie's current state, and clicking any state pill expands a panel showing entry condition, actor, and visibility rules. Actor ownership chips at the bottom summarise who owns each lifecycle.

### 4.6 Client Command — `/client/command`

Jamie's equivalent of the coach command, but read-focused:
- **Health assistant** (agent): morning briefing, zone-2 questions, "create a health consult PDF" — plain English, no jargon
- **You are here**: cycle position with explicit "Next action / Where you are / What's next" three-column strip
- **Programme checklist**: his to-dos with progress tracking
- **Protocol (read-only)**: Darcy's strategy doc, collapsed sections
- **Resolved interventions**: historical correctors with impact

### 4.7 AI Agent / Chat Widget

Two implementations:
1. **Full panel** on Command pages — prominent, first on page
2. **Floating widget** on all other pages — bottom-right bubble, 56px circle, slides open to a compact panel (360×480px). Hidden on Command pages (full panel already there). Role-aware: green accent for coach, amber for client.

---

## 5. How the two products talk to each other

This is currently **modelled** — the architecture is real, the data connections are simulated. The live version would replace static data with API calls.

### 5.1 Data flow

```
Wearables + CGM  ──sync──▶  Allostatic Load Engine  ──score──▶  AL dashboard
                                      │
                                   flags
                                      ▓
Lab results  ─────────────────────▶  Agent  ──brief──▶  Darcy (coach command)
                                      │
                                   drafts
                                      ▓
Daily check-in  ────RPE──────────▶  Darcy reviews  ──approve──▶  Directive
                                                                      │
                                                                   pushed
                                                                      ▓
                                                               Jamie's dashboard
```

### 5.2 Coach action → client result

| Darcy does in Coach product | Jamie sees in Client product |
|---|---|
| Approves a recommendation in Decision Layer | Corrector card updates on dashboard |
| Approves workout block in recommendation card | Week plan updates, calendar syncs |
| Publishes a protocol change | New directive card appears + amber alert banner |
| Agent generates a draft → Darcy countersigns | Strategy section updates (visible read-only) |
| Closes the quarter | Report archived → link in Quarterly History |
| Updates a Q2 biomarker target | Progress bar on Jamie's northstar updates |
| Jamie submits daily check-in | RPE feeds IRT engine → AL score updates → visible in Compliance |

### 5.3 Current integration status

| Integration | Status | Notes |
|---|---|---|
| Wearable sync (Whoop, Oura) | **Prototype** | Static data in `james.ts` |
| CGM sync | **Prototype** | Static data |
| IRT/AL computation | **Live** | Computed from raw time series on every render |
| AI Agent | **Prototype** | Pattern-matched responses, no API calls |
| Directive publishing | **Modelled** | UI flow works, no database write |
| Workout block push | **Modelled** | State transitions in UI, no calendar write |
| Lab upload | **Modelled** | Modal + toast, no file processing |
| Push notifications | **Planned** | Not yet built |
| PDF export | **Modelled** | Modal confirms, no actual PDF generated |

---

## 6. Design system

### 6.1 Aesthetic direction

**Reference:** Oura app + Linear settings panel + Superhuman inbox.  
**Goal:** Spacious, unhurried, high confidence in the data. One decision point per surface.

### 6.2 Typography

| Role | Font | Usage |
|---|---|---|
| Narrative / headings | Source Serif 4 (300–400 weight) | Situation descriptions, page titles, northstar statement, agent reasoning |
| Interface / labels | DM Sans (400–600 weight) | All body text, navigation, buttons, descriptions, checklist items |
| Data / metrics | IBM Plex Mono (300–500 weight) | Numbers, timestamps, scores, and data values only |

**Rule:** Monospace is for **data only**. Narrative content — especially the Decision Layer, agent responses, and reasoning paragraphs — uses DM Sans or Source Serif 4. Monospace everywhere creates terminal noise, not calm.

**Sentence case everywhere.** No `text-transform: uppercase`. No ALL CAPS labels or buttons.

### 6.3 Colour palette

```
Background:    #0B0B0D    (very dark, warm-neutral)
Panel:         #111115    (slightly lifted)
Panel raised:  #18181C

OK / primary:  #7FA99B    (muted teal — coach, healthy, confirmed)
Warn:          #C8A56A    (amber — attention, watch)
Alert:         #C17A6A    (red-clay — flag, critical)
Accent:        #C8A56A    (same as warn — client product, actions)

Ink:           #F0EDE8    (primary text — warm white)
Ink-2:         #9B9690    (secondary text)
Ink-3:         #635E58    (labels, timestamps)
Ink-4:         #3C3935    (very muted — placeholders, disabled)
```

**Restriction:** Only three accent colours in use at any time. Primary actions use `--ok` (coach) or `--warn` (client). Secondary information uses grays. Alert/critical uses `--alert` sparingly.

### 6.4 Spacing principles

- Panel header: 16px 24px padding
- Page containers: 48px (desktop), 20px 16px (mobile)
- Section gaps: 32–56px
- 20% whitespace minimum — when in doubt, remove an element rather than add one
- No 1px border grids between sections — use whitespace and background fills
- Buttons confirm intent before executing: all destructive or consequential actions use a modal

### 6.5 Mobile responsiveness

Full responsive layout at <768px:

- **Sidebars** collapse to a fixed bottom tab bar (56px, icons only, safe-area inset aware)
- **Content areas** switch to 20px/16px padding
- **Grid layouts** collapse to single column
- **Chat widget FAB** repositions above the tab bar
- **Morning card** stacks vertically
- Minimum 44px touch targets on all interactive elements

### 6.6 Interaction model

- All buttons have `transition: all 0.12s ease`
- Destructive/consequential actions open a modal listing what will happen
- Toast notifications for async confirmations (3.5s timeout, bottom-right stack)
- Information flows downward and rightward: overview → detail, current → future, coach decision → client action
- Lifecycle state machines are visual and interactive — every status is tappable with an explanation

---

## 7. Technology stack

### 7.1 Current (prototype)

| Layer | Technology |
|---|---|
| Framework | Next.js 16.2.4 (App Router) |
| Language | TypeScript |
| Styling | CSS custom properties + inline styles via design token object |
| Charts | Recharts |
| State management | React useState + Context (RoleContext) |
| Data | Static TypeScript file (`src/data/james.ts`) |
| AI Agent | Pattern-matched responses (no API) |
| Hosting | Vercel (free tier) |
| Fonts | Google Fonts (Source Serif 4, DM Sans, IBM Plex Mono) |

### 7.2 Production stack (recommended)

| Layer | Technology | Notes |
|---|---|---|
| Framework | Next.js (same) | App Router is production-ready |
| Database | Supabase (Postgres) | Row-level security for coach/client isolation |
| Auth | Supabase Auth | OAuth (Google) + magic link |
| Wearable data | Terra API or direct OAuth | See Section 8 |
| AI Agent | Anthropic Claude API | Claude Sonnet recommended |
| File generation | Vercel Edge + PDF generation lib | For real PDF exports |
| Notifications | Supabase Edge Functions + Resend (email) | For alerts and briefings |
| Hosting | Vercel Pro | Scales automatically |

---

## 8. What you'd actually need to buy — feasibility and costs

### 8.1 Prototype → production: what changes

The current prototype runs entirely on static data and simulated API calls. Moving to production requires:

1. **A real database** — client profiles, check-in logs, correctors, protocol history, agent conversations
2. **Wearable data ingestion** — automated pulls from Whoop, Oura, Garmin, Dexcom
3. **Real AI agent** — live Claude API calls with client context injected per session
4. **Authentication** — coaches log in, clients log in, data is isolated
5. **Notification system** — morning briefings auto-sent, alerts triggered by AL threshold

### 8.2 Estimated monthly costs at small scale (1 coach, 5 clients)

| Service | Plan | Monthly cost | Notes |
|---|---|---|---|
| **Domain** | .com via Namecheap | ~$1.20/mo ($15/yr) | allostatic.io or similar |
| **Vercel** | Pro | $20 | Required for team features |
| **Supabase** | Pro | $25 | 8GB DB, auth, edge functions |
| **Terra API** | Starter | $99–199 | Connects Whoop, Oura, Garmin, Dexcom, Apple Health. Per-user fee above threshold |
| **Anthropic Claude API** | Pay-as-you-go | $30–80 | ~$0.003/1k input tokens (Sonnet). Estimate 100 agent sessions/day × ~3k tokens = ~$1–3/day |
| **Resend (email)** | Free tier | $0 | 3,000 emails/month free |
| **TOTAL** | | **~$175–325/mo** | At 1 coach, 5 clients |

### 8.3 Costs at medium scale (5 coaches, 50 clients)

| Service | Plan | Monthly cost |
|---|---|---|
| Vercel Pro | Same | $20 |
| Supabase Pro | Same (scales within plan) | $25 |
| Terra API | Per-user pricing | $250–500 (est. $5–10/user/month for wearable connectors) |
| Claude API | Higher volume | $200–400 |
| Resend | Growth plan | $20 |
| **TOTAL** | | **~$515–945/mo** |

### 8.4 Terra API — the key integration decision

**Terra** (tryterra.io) is the industry-standard wearable data aggregation layer. It handles OAuth connections to Whoop, Oura, Garmin, Dexcom, Apple Health, Fitbit, and 20+ others, then normalises the data into a consistent schema via webhooks.

**Why it matters:** Without Terra (or a similar layer), you'd need to build and maintain individual OAuth integrations with each wearable platform — a significant ongoing engineering cost.

**Alternative:** Build direct integrations only for Oura (free API) and Whoop (free developer API). This covers the likely initial user base at zero ongoing API cost but limits device support and adds development time (~3–4 weeks).

**Terra pricing:**
- Free tier: development only, rate-limited
- Starter: ~$99–199/month (up to ~20 users)
- Growth: ~$0.50–2/user/month above threshold
- Enterprise: negotiated

**Recommendation:** Start with direct Oura + Whoop APIs for the MVP (free), migrate to Terra when supporting 10+ clients or 3+ device types.

### 8.5 AI Agent — Claude API

The current agent uses regex pattern matching. The production version sends each conversation turn to the Claude API with:
- System prompt containing client context (last 30 days of AL data, active correctors, protocol, upcoming milestones)
- Conversation history
- Coach query

**Cost estimate:**
- System prompt + context: ~2,000 tokens per conversation
- Average coach query + response: ~1,000 tokens
- At 50 conversations/day (5 coaches, active use): ~150,000 tokens/day
- Claude 3.5 Sonnet pricing: $3/M input, $15/M output
- Estimate: ~$0.45/day input + ~$1.50/day output = ~$2/day = ~$60/month at this volume

**Recommendation:** Use Claude 3.5 Haiku for quick queries (cheaper), Claude 3.5 Sonnet for morning briefings and draft generation (higher quality where it matters).

### 8.6 Feasibility summary

| Milestone | Engineering time | Cost to reach |
|---|---|---|
| Prototype → MVP with real auth + DB | 4–6 weeks | Dev time only |
| Add Oura + Whoop direct integration | 2–3 weeks | $0 ongoing |
| Add real AI agent (Claude API) | 1 week | $60–200/month |
| Add Terra for multi-device | 1–2 weeks | $99–500/month |
| PDF export + notifications | 1–2 weeks | $0–20/month |
| **Total to production MVP** | **~10–14 weeks** | **~$175–750/month** |

This is achievable as a solo full-stack build or with a small team (1 engineer + design). The prototype has done most of the hard product thinking — the production build is primarily a data layer and API integration project.

---

## 9. What's built vs. what's modelled

### 9.1 Genuinely computed / live

- ✅ Allostatic Load score and domain subscores (IRT engine)
- ✅ 30-day trend series with statistical z-scores
- ✅ Pivot heatmap with per-row statistics (mean, min, max, trend)
- ✅ Chart rendering (Recharts) with protocol annotations and multi-metric overlay
- ✅ Biomarker target progress rails
- ✅ Flag triage state machine (Raised → Triaged → Resolved) with persisted React state
- ✅ Workout recommendation card lifecycle (Draft → Approved → Pushed)
- ✅ Quarterly review questionnaire (4-step, step-persisted)
- ✅ Architecture lifecycle diagrams with interactive expand panels
- ✅ Mobile responsive layout (bottom tab bar, stacked grids, safe-area insets)

### 9.2 Modelled (UI complete, no backend)

- 🟡 Agent chat (pattern matching → needs Claude API)
- 🟡 Directive publishing (toast confirms → needs DB write)
- 🟡 Workout block push (state transitions → needs calendar write)
- 🟡 Lab file upload (modal + toast → needs file processing)
- 🟡 Wearable sync (static data → needs Terra or direct APIs)
- 🟡 PDF export (modal → needs Puppeteer/PDF generation)
- 🟡 Push notifications (alert UI exists → needs email/push service)
- 🟡 Calendar drag-and-drop (local state only → needs persistence)
- 🟡 Authentication (no login gates → needs Supabase Auth)

### 9.3 Not yet built

- ❌ Multi-client support (only Jamie Garis is modelled)
- ❌ Coach onboarding flow
- ❌ Client onboarding / device connection
- ❌ Real-time updates (WebSocket or Supabase Realtime)
- ❌ Mobile app (web-only, fully responsive)
- ❌ Admin / billing layer

---

## 10. Key product decisions and rationale

### Why two separate products, not one with a toggle?

Early prototype used a role toggle in the topbar. Removed because:
- The information architecture, primary actions, and emotional context are fundamentally different for coach vs client
- A toggle creates confusion about whose data you're editing vs. whose you're viewing
- Separate URL spaces allow future mobile-native client product (e.g. a native iOS app for Jamie while Darcy uses the web coach dashboard)

### Why IRT for the AL score?

Standard wearable apps average population norms. A 45 ms HRV reads as "good" for a 54-year-old male population. But if Jamie's baseline is 52 ms, 45 ms is a significant deviation. IRT lets the model be person-centred rather than population-centred — much more useful for coaching interventions.

### Why lead with a Decision Layer on the Command Centre?

Most coaching dashboards surface flags without telling the coach what to do. The gap between "HRV is low" and "Darcy needs to extend the intensity hold and push a directive" is significant. The Decision Layer closes that gap: situation + data + recommendation + one-click approval.

### Why an agent-first workout recommendation?

The agent drafts the workout block based on overnight signals (HRV, correctors, calendar conflicts, upcoming tests) before Darcy opens the app. Darcy arrives to a proposal, not a blank slate. She can edit individual days inline, approve the full block, or reject and redraft. This models the right workflow: AI as a capable first drafter, coach as the expert reviewer.

### Why outcomes before adherence on the Compliance page?

Adherence metrics answer "is Jamie doing the protocol?" but Darcy's real question is "is the protocol working?" Showing adherence first trains the coach to optimise for compliance rather than results. Leading with outcomes builds conviction in what the system is telling her.

### Why a structured Morning SOP instead of a pure chat interface?

Open-ended chat puts all the burden of knowing what to ask on the coach. The structured SOP — 5 sections, each pre-populated with the overnight analysis — means Darcy can scan the full picture in under 60 seconds, then drop into chat only for specific follow-up questions. The SOP is the briefing; the chat is the drill-down.

### Why a floating widget rather than a second nav link for the agent?

The agent on Command pages is a primary workspace. On other pages (Trends, Medical, Calendar) it's a quick look-up tool — "what's the ApoB target?" doesn't require navigating away. A floating widget respects the user's current context while keeping the agent accessible everywhere.

---

## 11. Demo guide — what to show and in what order

For a walkthrough video or live prospect demo, use this sequence:

1. **Landing gate** `/` — sets the two-product framing. Click Jamie first.
2. **Client dashboard** `/client` — AL score ring, northstar, morning directive from Darcy, today's workout. The calm, personal experience.
3. **Client check-in** `/client/checkin` — how Jamie reports back. Sleep/energy/mood, compliance slider.
4. **Client trends** `/client/trends` — 30-day HRV, ApoB, sleep charts with protocol event markers.
5. **Switch to Darcy** — back to `/` and into `/coach/command`.
6. **Coach command centre** `/coach/command` — the money shot. Walk through in order: since-last-visit banner → Decision Layer → Workout recommendation card (edit a day, approve) → Agent SOP (expand sections) → Today checklist with due dates → Prepare quarterly review questionnaire.
7. **Coach compliance** `/coach/compliance` — flag triage (click Act/Notify/Watch, watch the lifecycle dots advance). Outcomes section showing before/after impact.
8. **Coach medical** `/coach/medical` — biomarker pace view, upload lab results button + modal.
9. **Architecture** `/coach/architecture` — switch to Workflows tab, show the four lifecycle diagrams and the "now" badge on Jamie's current state.

---

## 12. Markup guide — using this document for amends

When using this document to brief amends to a developer or AI:

**For component changes:** reference the component name and route. e.g. "Decision Layer on `/coach/command` — change the serif situation text to also include..."

**For design changes:** reference the CSS custom property or component class. e.g. "increase `--ok` brightness slightly", "make `.panel-head` font-size 14px"

**For data changes:** `src/data/james.ts` is the single source of truth for all mock data. Changes there propagate everywhere.

**For new pages:** follow the pattern — create the page, add the route to the relevant sidebar (`CoachSidebar.tsx` or `ClientSidebar.tsx`), add an icon key if needed to `NavIcons.tsx`.

**For production amends:** flag with `[PRODUCTION]` prefix — these require backend work beyond the prototype layer.

---

*Built with Next.js 16 · TypeScript · Recharts · Supabase (planned) · Claude API (planned)*  
*Prototype hosted on Vercel. All data is simulated — Jamie Garis and Darcy O'Sullivan are fictional clients.*
