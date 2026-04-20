"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DATA } from "@/data/james"

const { command } = DATA

// ─── Quarterly history ────────────────────────────────────────────────────────

const QUARTER_HISTORY = [
  {
    id: "q2-2026", label: "Q2 2026", status: "active", daysIn: 20,
    closedOn: null,
    summary: "ApoB trajectory positive. Autonomic flag active since 17 Apr. DEXA retest due 22 Apr.",
    highlights: null,
  },
  {
    id: "q1-2026", label: "Q1 2026", status: "closed", daysIn: 90,
    closedOn: "31 Mar 2026",
    summary: "Strong quarter. ApoB moved significantly. Sleep protocol produced durable improvement.",
    highlights: ["ApoB 91 → 84 mg/dL ✓", "Deep sleep +20 min after caffeine protocol ✓", "HRV floor missed — autonomic vulnerability persists", "Fibrinogen trending up — watch in Q2"],
  },
  {
    id: "q4-2025", label: "Q4 2025", status: "archived", daysIn: 92,
    closedOn: "31 Dec 2025",
    summary: "Foundation quarter. Zone-2 protocol established. AFib check clear.",
    highlights: ["ApoB 99 → 91 mg/dL", "Zone-2 baseline set at 148 min/week", "AFib Holter — no events", "Sleep architecture: work in progress"],
  },
]

// ─── Modal ────────────────────────────────────────────────────────────────────

function Modal({ title, body, onClose, onConfirm, confirmLabel }: {
  title: string; body: React.ReactNode; onClose: () => void
  onConfirm: () => void; confirmLabel: string
}) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}
      onClick={onClose}>
      <div style={{ background: "var(--bg)", border: "1px solid var(--hair-strong)", padding: "28px 32px", maxWidth: 520, width: "90%", boxShadow: "0 8px 40px rgba(0,0,0,0.5)" }}
        onClick={e => e.stopPropagation()}>
        <div style={{ fontFamily: "var(--mono)", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--ok)", marginBottom: 10 }}>{title}</div>
        <div style={{ fontSize: 13, color: "var(--ink-2)", lineHeight: 1.65, marginBottom: 24 }}>{body}</div>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ fontFamily: "var(--mono)", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.08em", border: "1px solid var(--hair-strong)", padding: "7px 16px", color: "var(--ink-3)", background: "transparent", cursor: "pointer" }}>Cancel</button>
          <button onClick={onConfirm} style={{ fontFamily: "var(--mono)", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.08em", border: "none", background: "var(--ok)", color: "var(--bg)", padding: "7px 18px", cursor: "pointer" }}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  )
}

// ─── Decision layer ───────────────────────────────────────────────────────────

function DecisionLayer() {
  const [status, setStatus] = useState<"pending" | "approved" | "dismissed">("pending")

  if (status === "approved") return (
    <div style={{ padding: "28px 36px", border: "1px solid color-mix(in srgb, var(--ok) 30%, transparent)", borderLeft: "3px solid var(--ok)", background: "color-mix(in srgb, var(--ok) 4%, transparent)" }}>
      <div style={{ fontFamily: "var(--mono)", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--ok)", marginBottom: 4 }}>✓ Recommendation approved · pushed to Jamie</div>
      <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-3)" }}>Jamie will see the updated corrector when he next opens the app. Agent briefing updated.</div>
    </div>
  )

  if (status === "dismissed") return null

  return (
    <div style={{ border: "1px solid var(--hair-strong)", padding: "40px 44px", background: "var(--bg)" }}>
      {/* Label */}
      <div style={{ fontFamily: "var(--mono)", fontSize: 8.5, textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--ink-4)", marginBottom: 24 }}>
        Decision required · {DATA.user.today}
      </div>

      {/* Situation — large, calm, serif */}
      <p style={{ fontFamily: "var(--serif)", fontSize: 21, fontWeight: 300, lineHeight: 1.7, color: "var(--ink)", margin: "0 0 36px", maxWidth: 620 }}>
        Jamie's allostatic load has been elevated for three consecutive days.
        The autonomic flag from 17 Apr has not resolved — his HRV is still suppressed and a board call this morning adds further cortisol load.
      </p>

      {/* Three supporting data points */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 32, marginBottom: 36, paddingBottom: 36, borderBottom: "1px solid var(--hair)" }}>
        {[
          { label: "HRV last night", value: "41 ms", sub: "−11 vs his baseline of 52 ms", color: "var(--warn)" },
          { label: "Corrector status", value: "Day 3", sub: "Hold-intensity active since 17 Apr", color: "var(--ink)" },
          { label: "Today's context", value: "Board call", sub: "09:00 · anticipatory stress expected", color: "var(--ink)" },
        ].map(item => (
          <div key={item.label}>
            <div style={{ fontFamily: "var(--mono)", fontSize: 8, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--ink-4)", marginBottom: 10 }}>{item.label}</div>
            <div style={{ fontFamily: "var(--mono)", fontSize: 26, letterSpacing: "-0.03em", color: item.color, lineHeight: 1, marginBottom: 8 }}>{item.value}</div>
            <div style={{ fontSize: 13, color: "var(--ink-3)", lineHeight: 1.55 }}>{item.sub}</div>
          </div>
        ))}
      </div>

      {/* Recommendation */}
      <div style={{ borderLeft: "2px solid var(--ok)", paddingLeft: 24, marginBottom: 32 }}>
        <div style={{ fontFamily: "var(--mono)", fontSize: 8, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--ink-4)", marginBottom: 10 }}>Recommendation</div>
        <p style={{ fontSize: 14, color: "var(--ink-2)", lineHeight: 1.75, margin: 0, maxWidth: 580 }}>
          Maintain the intensity hold through Wednesday 23 Apr. Zone-2 only — heart rate below 135 bpm — or full rest.
          Reassess after DEXA and VO₂max retest results come through Wednesday afternoon.
          If HRV shows two consecutive nights above 44 ms before then, the hold can be lifted early.
        </p>
      </div>

      {/* Action buttons */}
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <button
          onClick={() => setStatus("approved")}
          style={{ fontFamily: "var(--mono)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", border: "none", background: "var(--ok)", color: "var(--bg)", padding: "12px 28px", cursor: "pointer" }}
        >
          Approve and push to Jamie →
        </button>
        <button style={{ fontFamily: "var(--mono)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", border: "1px solid var(--hair-strong)", background: "transparent", color: "var(--ink-2)", padding: "12px 20px", cursor: "pointer" }}>
          Modify
        </button>
        <button
          onClick={() => setStatus("dismissed")}
          style={{ fontFamily: "var(--mono)", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.08em", border: "none", background: "transparent", color: "var(--ink-4)", padding: "12px 16px", cursor: "pointer" }}
        >
          Not now
        </button>
      </div>
    </div>
  )
}

// ─── Agent panel ──────────────────────────────────────────────────────────────

interface Msg { role: "agent" | "coach"; text: string; time: string }

const QUICK_ACTIONS = [
  "Morning briefing",
  "ApoB status",
  "Draft protocol change",
  "Autonomic flag analysis",
  "Quarterly report summary",
]

function matchResponse(input: string, router: ReturnType<typeof useRouter>): string {
  const q = input.toLowerCase()

  if (/brief|morning|today|daily/.test(q))
    return `Morning briefing for Jamie Garis · ${DATA.user.today}\n\nAllostatic Load: 64 (elevated band). Three consecutive nights of incomplete recovery — RHR +4 bpm above 30-day baseline, HRV at 41 ms (−11 vs baseline). Skin temp deviation +0.4°C sustained over 3 nights.\n\nBoard call today at 09:00 — anticipatory stress likely active.\n\nPriority actions: (1) Confirm hold-intensity corrector with Jamie. (2) Schedule 8-min breathing sequence before 14:45 coaching call. (3) Protect sleep onset — no screens after 21:30.\n\nNo dietary changes required. Continue omega-3, berberine, rotating sleep-aid protocol.`

  if (/apob|cholesterol|lipid|statin/.test(q))
    return `ApoB trajectory for Jamie Garis:\n\nCurrent: 84 mg/dL · Q3 target: ≤70 mg/dL · 73 days remaining.\n\nQuarterly progression: 108 → 99 → 91 → 84. Consistent −7 mg/dL per quarter when fibre adherence exceeds 89%. At this rate: projected 77 mg/dL by Q3 — still 7 above target.\n\nTo hit ≤70: fibre adherence must reach 94%+, or we need to consider a statin dose adjustment (discuss with Dr. Rao at May 12 consult).\n\nThe cardio protocol (zone-2) correlates r=+0.12 with ApoB delta — fibre is the primary lever (r=+0.74).`

  if (/protocol|zone|train|intensity|hold/.test(q))
    return `Current protocol for Jamie Garis (Q2 2026):\n\n● Zone-2: ≥160 min/week (adjusted from 180 for board-cycle weeks)\n● No caffeine post-14:00 (in place since 22 Mar — confirmed effective)\n● Omega-3: 3g/day · psyllium husk daily · legume logging active\n● CGM SD target: <14 mg/dL\n\nActive corrector (17 Apr): Hold-intensity — convert all sessions to zone-2 until HRV stabilises above 44 ms for 2 consecutive nights.\n\nJamie has not logged a session since the hold was issued. Recommend checking in.\n\nView full trends → /coach/trends`

  if (/draft|suggest|recommend|direct/.test(q))
    return `Proposed directive for Jamie Garis:\n\n"Extend the intensity hold through Saturday 26 Apr. HRV currently 41 ms — we need 2 consecutive nights above 44 ms before resuming zone-2. This keeps you on track for the DEXA VO₂max retest Wednesday.\n\nAction: Zone-2 only (HR <135 bpm) or full rest until Saturday morning review. Log your Sunday morning HRV in check-in."\n\nShall I format this as a signed directive and push to Jamie's dashboard?`

  if (/sleep|recovery|hrv|autonomic|flag/.test(q))
    return `Autonomic flag analysis · Jamie Garis:\n\nHRV: 41 ms (−11 vs 30-day baseline of 52 ms). RHR: 52 bpm (+4 vs baseline). Skin temp: +0.4°C sustained for 3 nights.\n\nPattern match: This signature is nearly identical to the February 06–11 setback. That event took 8 days to resolve after load reduction. We're on day 3 of the current flag.\n\nRisk: If we don't hold intensity now, recovery extends by an estimated 4–6 days based on historical pattern. Board call today adds cortisol load.\n\nRecommendation: Maintain hold through at least Wednesday. Re-evaluate after DEXA.\n\nView HRV trends in detail → /coach/trends`

  if (/report|quarter|q1|q2|summary/.test(q))
    return `Quarterly summary — Q1 2026 (closed 31 Mar):\n\nOutcomes: ApoB 91 → 84 mg/dL ✓ · Deep sleep +20 min avg after caffeine protocol ✓ · Fibrinogen rising (318 → 342) — watch list.\n\nMissed: HRV floor target (48 ms) — current 41 ms reflects board-cycle vulnerability. Zone-2 volume averaged 148 min/week vs 180 target.\n\nQ2 adjustments: Zone-2 target reduced to 160 min/week (realistic for board-cycle schedule). Added fibrinogen to watch list. Pre-quarter taper protocol to be formalised before July.\n\nFull Q1 report available as PDF export.`

  if (/trend|chart|graph|data/.test(q)) {
    setTimeout(() => router.push("/coach/trends"), 1200)
    return `Opening Trends for Jamie Garis…\n\nNavigating to the trends view now. You'll see the 30-day series for HRV, RHR, sleep, glucose, and Allostatic Load with protocol annotation markers and multi-metric overlay.`
  }

  if (/medical|dexa|lab|blood|doctor/.test(q)) {
    setTimeout(() => router.push("/coach/medical"), 1200)
    return `Opening Medical Roadmap…\n\nKey upcoming dates: DEXA + VO₂max retest 22 Apr (2 days), Quarterly bloods 6 May (16 days), Cardiology consult 12 May (22 days).\n\nJamie must fast from 20:30 Tuesday for the DEXA. I'll navigate you there now.`
  }

  return `I've analysed Jamie's latest data. Here's what I see:\n\nAllostatic Load: 64 (elevated). Primary flags: autonomic (HRV −11 ms, day 3 of deficit) and sleep quality (efficiency 82%, deep sleep 54 min). Board-cycle stress is the current context.\n\nNext recommended actions: (1) Confirm today's hold-intensity corrector. (2) Review 3 pending agent drafts. (3) Prepare DEXA retest briefing for Wed 22 Apr.\n\nAsk me about ApoB, protocol changes, the autonomic flag, trends, medical roadmap, or the quarterly report.`
}

function AgentPanel() {
  const router = useRouter()
  const now = "07:14"
  const [messages, setMessages] = useState<Msg[]>([
    { role: "agent", time: "06:58", text: `Good morning, Darcy. I've completed Jamie's overnight analysis.\n\nAllostatic Load: 64 (elevated — same band as yesterday). HRV held at 41 ms overnight, no further decline. Skin temp deviation stable at +0.4°C.\n\nYou have 3 drafts awaiting countersignature and a board call on Jamie's calendar at 09:00. The hold-intensity corrector from 17 Apr remains active.\n\nWhat would you like to address first?` },
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }) }, [messages])

  function send(text: string) {
    if (!text.trim()) return
    const coachMsg: Msg = { role: "coach", text: text.trim(), time: now }
    setMessages(p => [...p, coachMsg])
    setInput("")
    setLoading(true)
    setTimeout(() => {
      setMessages(p => [...p, { role: "agent", text: matchResponse(text, router), time: now }])
      setLoading(false)
    }, 700)
  }

  return (
    <div id="agent" className="panel">
      <div className="panel-head">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span>Agent</span>
          <span style={{ fontFamily: "var(--mono)", fontSize: 8, color: "var(--ok)", textTransform: "uppercase", letterSpacing: "0.08em", border: "1px solid color-mix(in srgb, var(--ok) 40%, transparent)", padding: "2px 7px" }}>⬤ Live · pre-loaded context</span>
        </div>
        <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-3)" }}>Ask about Jamie's data, draft directives, navigate to sections</span>
      </div>

      {/* Quick actions */}
      <div style={{ padding: "10px 20px", borderBottom: "1px solid var(--hair)", display: "flex", gap: 8, flexWrap: "wrap" }}>
        {QUICK_ACTIONS.map(qa => (
          <button key={qa} onClick={() => send(qa)} style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.06em", padding: "5px 12px", border: "1px solid var(--hair-strong)", color: "var(--ink-3)", background: "transparent", cursor: "pointer", textTransform: "uppercase" }}>
            {qa}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div style={{ height: 320, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", flexDirection: m.role === "coach" ? "row-reverse" : "row", gap: 10, alignItems: "flex-start" }}>
            <div style={{ width: 26, height: 26, borderRadius: "50%", background: m.role === "agent" ? "var(--panel-2)" : "var(--ok)", border: `1px solid ${m.role === "agent" ? "var(--hair-strong)" : "var(--ok)"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontFamily: "var(--mono)", fontSize: 8, color: m.role === "agent" ? "var(--ok)" : "var(--bg)", textTransform: "uppercase" }}>
              {m.role === "agent" ? "A" : "D"}
            </div>
            <div style={{ maxWidth: "76%", background: m.role === "agent" ? "var(--panel-2)" : "color-mix(in srgb, var(--ok) 10%, var(--panel-2))", border: `1px solid ${m.role === "agent" ? "var(--hair)" : "color-mix(in srgb, var(--ok) 25%, transparent)"}`, padding: "10px 14px" }}>
              <div style={{ fontFamily: "var(--mono)", fontSize: 8, color: m.role === "agent" ? "var(--ok)" : "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
                {m.role === "agent" ? "Agent" : "Darcy"} · {m.time}
              </div>
              <div style={{ fontSize: 12.5, color: "var(--ink-2)", lineHeight: 1.6, whiteSpace: "pre-line" }}>{m.text}</div>
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <div style={{ width: 26, height: 26, borderRadius: "50%", background: "var(--panel-2)", border: "1px solid var(--hair-strong)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--mono)", fontSize: 8, color: "var(--ok)" }}>A</div>
            <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-4)", letterSpacing: "0.08em" }}>Analysing…</div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ padding: "12px 20px", borderTop: "1px solid var(--hair)", display: "flex", gap: 10 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send(input)}
          placeholder="Ask about Jamie's data, draft a directive, navigate to a section…"
          style={{ flex: 1, background: "var(--panel-2)", border: "1px solid var(--hair-strong)", padding: "9px 12px", fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink)", letterSpacing: "0.02em" }}
        />
        <button onClick={() => send(input)} style={{ fontFamily: "var(--mono)", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", border: "none", background: "var(--ok)", color: "var(--bg)", padding: "9px 18px", cursor: "pointer" }}>
          Send
        </button>
      </div>
    </div>
  )
}

// ─── Workflow / Today ─────────────────────────────────────────────────────────

function WorkflowCommand() {
  const router = useRouter()
  const [actionsDone, setActionsDone] = useState<string[]>([])
  const [expandedAction, setExpandedAction] = useState<string | null>(null)
  const pendingDrafts = DATA.team.inbox.filter(x => x.status === "pending").length
  const activeCorrectors = DATA.courseCorrector.filter(c => c.status === "active")

  const NEXT_ACTIONS = [
    {
      id: "dexa",
      urgency: "critical",
      label: "DEXA + VO₂max retest",
      sub: "Wed 22 Apr · 2 days · West Clinic 08:30",
      cta: "Confirm fasting protocol",
      link: { label: "Medical roadmap →", href: "/coach/medical" },
      color: "var(--warn)",
      detail: "Jamie must fast from 20:30 Tue. Confirm he has the fasting protocol in his calendar and that the clinic has his prep sheet.",
    },
    {
      id: "drafts",
      urgency: "high",
      label: `${pendingDrafts} drafts awaiting your countersignature`,
      sub: "Autonomic flag · glucose excursion · ApoB analysis",
      cta: "Review drafts",
      link: { label: "Trends →", href: "/coach/trends" },
      color: "var(--warn)",
      detail: "3 drafts ready: hold-intensity corrector, caffeine-sleep insight, overnight glucose flag. All need your review before they reach Jamie.",
    },
    {
      id: "corrector",
      urgency: "active",
      label: activeCorrectors[0]?.recommendation ?? "Hold-intensity corrector active",
      sub: "Issued 17 Apr · day 3 · monitoring HRV recovery",
      cta: "Check overnight data",
      link: { label: "Compliance →", href: "/coach/compliance" },
      color: "var(--accent)",
      detail: "HRV stable at 41 ms — no further decline overnight. RHR still +4 bpm. Maintain hold through Wednesday, reassess post-DEXA retest.",
    },
    {
      id: "review",
      urgency: "upcoming",
      label: "Quarterly protocol review",
      sub: "Tue 29 Apr · 9 days · in person · 60 min",
      cta: "Prepare agenda",
      link: { label: "Medical →", href: "/coach/medical" },
      color: "var(--ok)",
      detail: "Topics: DEXA/VO₂max results, Q2 ApoB trajectory, fibrinogen watch, pre-quarter taper protocol, July board-cycle load plan.",
    },
  ]

  const phases = command.cyclephase.phases
  const upcomingIndex = phases.findIndex(p => p.upcoming)
  const nextAfterUpcoming = upcomingIndex >= 0 && upcomingIndex < phases.length - 1 ? phases[upcomingIndex + 1] : null

  const SYSTEM_STATUS = [
    { label: "Wearables synced",  status: "ok",   note: "06:41 · Whoop + Oura" },
    { label: "Agent analysis",    status: "ok",   note: "Completed 06:58" },
    { label: "Drafts queued",     status: "warn", note: "3 awaiting review" },
    { label: "Jamie dashboard",   status: "ok",   note: "Up to date" },
  ]

  return (
    <div className="panel">
      <div className="panel-head">
        <div>
          <span style={{ fontSize: 13, color: "var(--ink)" }}>Today</span>
          <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-3)", marginLeft: 10 }}>{DATA.user.today}</span>
        </div>
        <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          Q2 2026 · Week 3 of 13
        </span>
      </div>

      {/* Next required actions */}
      <div style={{ padding: "18px 22px", borderBottom: "1px solid var(--hair)" }}>
        <div style={{ fontFamily: "var(--mono)", fontSize: 8, textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--ink-4)", marginBottom: 14 }}>
          What needs to happen today
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {NEXT_ACTIONS.map(action => {
            const done = actionsDone.includes(action.id)
            const isExpanded = expandedAction === action.id
            return (
              <div key={action.id} style={{ border: `1px solid ${done ? "var(--hair)" : action.color === "var(--warn)" ? "color-mix(in srgb, var(--warn) 30%, transparent)" : "var(--hair)"}`, background: done ? "transparent" : action.urgency === "critical" ? "color-mix(in srgb, var(--warn) 4%, transparent)" : "transparent" }}>
                <div style={{ display: "flex", alignItems: "stretch", gap: 0 }}>
                  <div style={{ width: 3, background: done ? "var(--hair)" : action.color, flexShrink: 0 }} />
                  <div style={{ flex: 1, padding: "11px 16px", display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: done ? "var(--ink-3)" : "var(--ink)", marginBottom: 1, textDecoration: done ? "line-through" : "none" }}>{action.label}</div>
                      <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-4)" }}>{action.sub}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                      {/* Deep link */}
                      <button onClick={() => router.push(action.link.href)} style={{ fontFamily: "var(--mono)", fontSize: 8, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--ink-3)", background: "transparent", border: "none", cursor: "pointer", padding: "4px 0" }}>
                        {action.link.label}
                      </button>
                      {/* Expand detail */}
                      <button onClick={() => setExpandedAction(isExpanded ? null : action.id)} style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-4)", background: "transparent", border: "none", cursor: "pointer", padding: "4px" }}>
                        {isExpanded ? "▲" : "▼"}
                      </button>
                      {!done ? (
                        <button
                          onClick={() => setActionsDone(p => [...p, action.id])}
                          style={{ fontFamily: "var(--mono)", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.08em", border: `1px solid ${action.color}`, color: action.color, padding: "5px 12px", background: "transparent", cursor: "pointer" }}
                        >
                          {action.cta}
                        </button>
                      ) : (
                        <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ok)", textTransform: "uppercase", letterSpacing: "0.08em" }}>✓ Done</span>
                      )}
                    </div>
                  </div>
                </div>
                {isExpanded && (
                  <div style={{ padding: "10px 16px 12px 19px", borderTop: "1px solid var(--hair)", fontSize: 12.5, color: "var(--ink-2)", lineHeight: 1.6 }}>
                    {action.detail}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Cycle position + system status */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>

        {/* Where you are in the cycle */}
        <div style={{ padding: "16px 22px", borderRight: "1px solid var(--hair)" }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: 8, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--ink-4)", marginBottom: 14 }}>
            Where you are · Q2 2026
          </div>

          {/* Phase track */}
          <div style={{ display: "flex", gap: 0, alignItems: "flex-start", marginBottom: 12 }}>
            {phases.map((ph, i) => {
              const color = ph.done ? "var(--ok)" : ph.upcoming ? "var(--warn)" : "var(--hair-strong)"
              return (
                <div key={ph.label} style={{ display: "flex", alignItems: "flex-start", flex: 1 }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
                    <div style={{ width: 16, height: 16, borderRadius: "50%", background: ph.done ? "var(--ok)" : "var(--bg)", border: `2px solid ${color}`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 4 }}>
                      {ph.done && <span style={{ color: "var(--bg)", fontSize: 7 }}>✓</span>}
                      {ph.upcoming && !ph.done && <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--warn)", display: "block" }} />}
                    </div>
                    {ph.upcoming && (
                      <div style={{ fontFamily: "var(--mono)", fontSize: 7, color: "var(--warn)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 1 }}>▲ now</div>
                    )}
                    <div style={{ fontFamily: "var(--mono)", fontSize: 7, textTransform: "uppercase", letterSpacing: "0.04em", color: ph.upcoming ? "var(--warn)" : ph.done ? "var(--ok)" : "var(--ink-4)", textAlign: "center", lineHeight: 1.3 }}>
                      {ph.label.split(" ").slice(0, 2).join(" ")}
                    </div>
                    <div style={{ fontFamily: "var(--mono)", fontSize: 7, color: "var(--ink-4)", textAlign: "center" }}>{ph.date.slice(0, 6)}</div>
                  </div>
                  {i < phases.length - 1 && <div style={{ height: 1, flex: "0 0 6px", background: "var(--hair-strong)", marginTop: 8 }} />}
                </div>
              )
            })}
          </div>

          {/* Next step callout */}
          {nextAfterUpcoming && (
            <div style={{ borderLeft: "2px solid var(--hair-strong)", paddingLeft: 10 }}>
              <div style={{ fontFamily: "var(--mono)", fontSize: 7.5, color: "var(--ink-4)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 2 }}>Next milestone after remeasurement</div>
              <div style={{ fontFamily: "var(--mono)", fontSize: 9.5, color: "var(--ink-2)" }}>{nextAfterUpcoming.label} · {nextAfterUpcoming.date}</div>
            </div>
          )}
        </div>

        {/* System status (was "Data pipeline") */}
        <div style={{ padding: "16px 22px" }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: 8, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--ink-4)", marginBottom: 12 }}>System status</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {SYSTEM_STATUS.map(item => (
              <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontFamily: "var(--mono)", fontSize: 8, color: item.status === "ok" ? "var(--ok)" : "var(--warn)" }}>
                  {item.status === "ok" ? "⬤" : "◉"}
                </span>
                <span style={{ fontFamily: "var(--mono)", fontSize: 9.5, color: "var(--ink-2)", flex: 1 }}>{item.label}</span>
                <span style={{ fontFamily: "var(--mono)", fontSize: 8.5, color: "var(--ink-4)" }}>{item.note}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── JTBD with action outputs ─────────────────────────────────────────────────

interface ToastMsg { id: number; text: string }

function JTBDWithActions() {
  const [collapsed, setCollapsed] = useState(true)
  const [checked, setChecked] = useState<Record<string, boolean>>(
    Object.fromEntries([
      ...command.jtbd.coachProgramme.map(i => [i.id, i.done]),
      ...command.jtbd.coachDaily.map(i => [i.id, i.done]),
      ...command.jtbd.clientProgramme.map(i => [i.id, i.done]),
      ...command.jtbd.clientDaily.map(i => [i.id, i.done]),
    ])
  )
  const [toasts, setToasts] = useState<ToastMsg[]>([])

  function toast(text: string) {
    const id = Date.now()
    setToasts(p => [...p, { id, text }])
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3500)
  }

  const TASK_ACTIONS: Record<string, { label: string; msg: string; color: string }> = {
    cp1: { label: "Generate draft",    msg: "Protocol adjustment draft created — review in Agent",       color: "var(--ok)" },
    cp2: { label: "View adherence",    msg: "Fibre log: 6/7 days this week · 86% — below 89% target",   color: "var(--warn)" },
    cp3: { label: "Generate draft",    msg: "Pre-quarter taper draft queued in Agent inbox",              color: "var(--ok)" },
    cp4: { label: "Schedule review",   msg: "DEXA review meeting added — Thu 24 Apr 10:00",              color: "var(--ok)" },
    cd1: { label: "Open inbox",        msg: "3 flags from overnight analysis — opening Agent",            color: "var(--warn)" },
    cd2: { label: "Open drafts",       msg: "3 drafts awaiting countersignature",                        color: "var(--warn)" },
    cd3: { label: "Publish directive", msg: "Morning directive pushed to Jamie's dashboard ✓",           color: "var(--ok)" },
    cd4: { label: "Log notes",         msg: "Call notes form opened — Wed 15:00 session",                color: "var(--ok)" },
    jcp1: { label: "Push reminder",   msg: "Fasting reminder sent to Jamie — DEXA 22 Apr 08:30",        color: "var(--ok)" },
    jcp2: { label: "View log",        msg: "Jamie's fibre log: 6/7 days this week",                     color: "var(--ink-2)" },
    jcp3: { label: "Update target",   msg: "ApoB target updated on Jamie's dashboard",                  color: "var(--ok)" },
    jcp4: { label: "View minutes",    msg: "Zone-2: 82 of 160 min this week · 3 sessions left",         color: "var(--warn)" },
    jcd1: { label: "View check-in",   msg: "Jamie's check-in: 14-day streak · last submitted 06:42",    color: "var(--ok)" },
    jcd2: { label: "Send reminder",   msg: "Evening fibre log reminder scheduled for 20:00",            color: "var(--ok)" },
    jcd3: { label: "View log",        msg: "Breathing protocol logged 2× this week",                    color: "var(--ok)" },
    jcd4: { label: "Push directive",  msg: "Today's directive pushed to Jamie · 06:14 ✓",              color: "var(--ok)" },
  }

  function renderBucket(title: string, items: { id: string; done: boolean; text: string }[], color: string) {
    const done = items.filter(i => checked[i.id]).length
    return (
      <div style={{ padding: "14px 18px", borderTop: "1px solid var(--hair)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", color }}>{title}</div>
          <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-3)" }}>{done}/{items.length}</div>
        </div>
        <div style={{ height: 2, background: "var(--hair-strong)", marginBottom: 12 }}>
          <div style={{ height: "100%", width: `${(done / items.length) * 100}%`, background: color }} />
        </div>
        {items.map(item => {
          const action = TASK_ACTIONS[item.id]
          return (
            <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <input type="checkbox" checked={checked[item.id] ?? false} onChange={() => setChecked(p => ({ ...p, [item.id]: !p[item.id] }))} style={{ accentColor: color, flexShrink: 0 }} />
              <span style={{ flex: 1, fontSize: 12, color: checked[item.id] ? "var(--ink-3)" : "var(--ink)", lineHeight: 1.4, textDecoration: checked[item.id] ? "line-through" : "none" }}>{item.text}</span>
              {action && (
                <button
                  onClick={() => toast(action.msg)}
                  style={{ fontFamily: "var(--mono)", fontSize: 8, textTransform: "uppercase", letterSpacing: "0.06em", border: `1px solid ${action.color}`, color: action.color, padding: "3px 8px", background: "transparent", cursor: "pointer", flexShrink: 0 }}
                >
                  {action.label}
                </button>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="panel" style={{ position: "relative" }}>
      <div className="panel-head" onClick={() => setCollapsed(c => !c)} style={{ cursor: "pointer" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span>Programme checklist</span>
          {collapsed && (
            <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-3)" }}>
              {Object.values(checked).filter(Boolean).length}/{Object.values(checked).length} complete
            </span>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {!collapsed && <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Action buttons push to dashboard or generate outputs</span>}
          <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-3)" }}>{collapsed ? "▼" : "▲"}</span>
        </div>
      </div>

      {!collapsed && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
            <div style={{ borderRight: "1px solid var(--hair)" }}>
              {renderBucket("Your tasks · Programme", command.jtbd.coachProgramme, "var(--ok)")}
              {renderBucket("Your tasks · Today", command.jtbd.coachDaily, "var(--ok)")}
            </div>
            <div>
              {renderBucket("Jamie · Programme goals", command.jtbd.clientProgramme, "var(--accent)")}
              {renderBucket("Jamie · Daily habits", command.jtbd.clientDaily, "var(--accent)")}
            </div>
          </div>

          {/* Toast stack */}
          <div style={{ position: "fixed", bottom: 24, right: 24, display: "flex", flexDirection: "column", gap: 8, zIndex: 100 }}>
            {toasts.map(t => (
              <div key={t.id} style={{ background: "var(--panel-2)", border: "1px solid var(--ok)", padding: "10px 16px", fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-2)", maxWidth: 340, boxShadow: "0 4px 20px rgba(0,0,0,0.4)" }}>
                <span style={{ color: "var(--ok)", marginRight: 8 }}>✓</span>{t.text}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ─── Quarterly history ────────────────────────────────────────────────────────

function QuarterlyHistory() {
  const [open, setOpen] = useState<string | null>(null)
  const [panelCollapsed, setPanelCollapsed] = useState(true)
  return (
    <div className="panel">
      <div className="panel-head" onClick={() => setPanelCollapsed(c => !c)} style={{ cursor: "pointer" }}>
        <span>Quarterly history</span>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {!panelCollapsed && <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>End-of-quarter reports · growing timeline</span>}
          <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-3)" }}>{panelCollapsed ? "▼" : "▲"}</span>
        </div>
      </div>
      {!panelCollapsed && QUARTER_HISTORY.map((q, i) => (
        <div key={q.id} style={{ borderTop: i > 0 ? "1px solid var(--hair)" : undefined }}>
          <div onClick={() => setOpen(open === q.id ? null : q.id)} style={{ padding: "14px 22px", display: "flex", alignItems: "center", gap: 16, cursor: "pointer" }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: q.status === "active" ? "var(--ok)" : q.status === "closed" ? "var(--ink-3)" : "var(--hair-strong)", flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 2 }}>
                <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink)" }}>{q.label}</span>
                <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: q.status === "active" ? "var(--ok)" : "var(--ink-4)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  {q.status === "active" ? `Active · day ${q.daysIn}` : q.status === "closed" ? `Closed ${q.closedOn}` : `Archived ${q.closedOn}`}
                </span>
              </div>
              <div style={{ fontSize: 12, color: "var(--ink-3)", lineHeight: 1.4 }}>{q.summary}</div>
            </div>
            {q.status !== "active" && (
              <a href="#" onClick={e => e.preventDefault()} style={{ fontFamily: "var(--mono)", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--accent)", border: "1px solid var(--accent)", padding: "4px 10px", flexShrink: 0 }}>
                View report →
              </a>
            )}
            <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-3)" }}>{open === q.id ? "▲" : "▼"}</span>
          </div>
          {open === q.id && q.highlights && (
            <div style={{ padding: "0 22px 16px 48px" }}>
              {q.highlights.map(h => (
                <div key={h} style={{ fontFamily: "var(--mono)", fontSize: 10.5, color: h.includes("✓") ? "var(--ok)" : h.includes("↑") || h.includes("missed") || h.includes("watch") ? "var(--warn)" : "var(--ink-2)", marginBottom: 4, letterSpacing: "0.02em" }}>
                  · {h}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function CoachCommandPage() {
  const [showExportModal, setShowExportModal] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [exportDone, setExportDone] = useState(false)
  const [reportDone, setReportDone] = useState(false)

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32, padding: "24px 32px", maxWidth: 1300 }}>

      <div style={{ borderBottom: "1px solid var(--hair)", paddingBottom: 16 }}>
        <div style={{ fontFamily: "var(--mono)", fontSize: 8.5, textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--ok)", marginBottom: 6 }}>
          Coach Command Centre · Darcy O&apos;Sullivan
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <h1 style={{ fontFamily: "var(--serif)", fontSize: 26, fontWeight: 400, color: "var(--ink)", margin: 0, letterSpacing: "-0.02em" }}>
            Jamie Garis · Q2 2026 programme
          </h1>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={() => setShowExportModal(true)}
              style={{ fontFamily: "var(--mono)", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.08em", border: "1px solid var(--hair-strong)", padding: "6px 14px", color: exportDone ? "var(--ok)" : "var(--ink-2)", background: "transparent", cursor: "pointer" }}>
              {exportDone ? "✓ Exported" : "Export PDF"}
            </button>
            <button
              onClick={() => setShowReportModal(true)}
              style={{ fontFamily: "var(--mono)", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.08em", border: "1px solid var(--ink)", padding: "6px 14px", background: "var(--ink)", color: "var(--bg)", cursor: "pointer" }}>
              {reportDone ? "✓ Report queued" : "Generate quarterly report"}
            </button>
          </div>
        </div>
      </div>

      <DecisionLayer />

      {/* Agent is first — the primary interface */}
      <AgentPanel />
      <WorkflowCommand />
      <JTBDWithActions />
      <QuarterlyHistory />

      {/* Export PDF modal */}
      {showExportModal && (
        <Modal
          title="Export PDF · Jamie Garis Q2 2026"
          body={
            <div>
              <p style={{ margin: "0 0 12px" }}>This will generate a PDF snapshot containing:</p>
              <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 2 }}>
                <li>Current Allostatic Load score and domain breakdown</li>
                <li>Active protocol and correctors</li>
                <li>30-day trend summary (HRV, ApoB trajectory)</li>
                <li>Q2 strategy doc (all sections)</li>
                <li>Upcoming milestones and test dates</li>
              </ul>
              <p style={{ margin: "12px 0 0", fontSize: 11, color: "var(--ink-4)" }}>Suitable for sharing with referring physicians or for your own records.</p>
            </div>
          }
          confirmLabel="Generate PDF"
          onClose={() => setShowExportModal(false)}
          onConfirm={() => { setExportDone(true); setShowExportModal(false) }}
        />
      )}

      {/* Generate report modal */}
      {showReportModal && (
        <Modal
          title="Generate quarterly report · Q2 2026"
          body={
            <div>
              <p style={{ margin: "0 0 12px" }}>This snapshots the current Q2 state and queues it as a report. Use this at quarter-close or to share a mid-quarter progress update.</p>
              <p style={{ margin: "0 0 8px" }}>The report will include:</p>
              <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 2 }}>
                <li>Dashboard state at time of generation</li>
                <li>Quarter-to-date results vs targets</li>
                <li>Agent analysis summary</li>
                <li>Resolved and active correctors</li>
                <li>Locked as a permanent link in Quarterly History</li>
              </ul>
            </div>
          }
          confirmLabel="Confirm and generate"
          onClose={() => setShowReportModal(false)}
          onConfirm={() => { setReportDone(true); setShowReportModal(false) }}
        />
      )}

    </div>
  )
}
