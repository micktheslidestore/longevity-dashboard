"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DATA } from "@/data/james"

const { command } = DATA

// ─── Jamie's agent panel ──────────────────────────────────────────────────────

interface Msg { role: "agent" | "jamie"; text: string; time: string }

const QUICK_ACTIONS = [
  "Morning briefing",
  "Zone 2 this week",
  "Create a Zone 2 report",
  "Generate health consult PDF",
  "What's my ApoB status?",
]

function matchResponse(input: string, router: ReturnType<typeof useRouter>): string {
  const q = input.toLowerCase()

  if (/brief|morning|today|daily/.test(q))
    return `Good morning, Jamie — here's your ${DATA.user.today} briefing.\n\nAllostatic Load: 64 (elevated). You've had 3 nights of incomplete recovery — your HRV is at 41 ms, which is 11 ms below your normal baseline. Your resting heart rate is running 4 beats above average and your skin temp has been slightly elevated since Wednesday night.\n\nThere's a board call at 09:00 today — that kind of anticipatory stress tends to push your load a little higher.\n\nThe main thing today: hold training intensity. That means zone-2 or full rest only — no hard efforts until your HRV has been above 44 ms for 2 nights in a row.\n\nDEXA retest is this Wednesday (22 Apr) at 08:30. Fast from 20:30 tomorrow night.\n\nYou're on a 14-day check-in streak — keep it going.`

  if (/zone.?2|training|workout|session/.test(q))
    return `Your zone-2 progress this week:\n\nTarget: 160 min/week\nCompleted: 82 min (3 sessions)\nRemaining: 78 min across 3 days\n\nNote: Darcy has issued a hold-intensity corrector (active since 17 Apr). Convert any remaining sessions to zone-2 only (heart rate below 135 bpm) until further notice. No high-intensity work until your HRV stabilises.\n\nLast session: Mon 16 Apr, 45 min.\nNext planned: Wed 23 Apr (post-DEXA).`

  if (/zone.?2 report|intra.?month.*report|monthly report/.test(q))
    return `Zone 2 report — Q2 2026 intra-month snapshot:\n\n● Total zone-2 this quarter (Apr 1–20): 312 min across 9 sessions\n● Weekly average: 78 min — 49% of the 160 min weekly target\n● Board-cycle weeks (Apr 7–13 and Apr 14–20) account for the volume drop — typical pattern for you\n● Longest streak: 3 consecutive sessions\n● VO₂max proxy trend: stable — insufficient volume to see adaptation yet\n\nNote: The DEXA on 22 Apr includes a VO₂max retest which will give us an objective reading.\n\nDarcy can review this in detail under Compliance. A formatted 1-page PDF version can be generated via the Export button.`

  if (/pdf|health consult|consult|document/.test(q))
    return `I can prepare a PDF summary for your health consult. Here's what it would include:\n\n● Current Allostatic Load score and what it means\n● HRV, resting heart rate, sleep summary (30-day)\n● ApoB trajectory: 108 → 99 → 91 → 84 mg/dL · target ≤70 mg/dL\n● Active correctors and protocol overview\n● Upcoming tests: DEXA 22 Apr, bloods 6 May, cardiology 12 May\n● A plain-English narrative for your doctor\n\nDarcy can generate and sign this from the Command Centre. Ask her to use "Export PDF" — it'll be ready within minutes.`

  if (/apob|cholesterol|lipid/.test(q))
    return `ApoB status for Jamie Garis:\n\nCurrent reading (last labs): 84 mg/dL\nQ3 target: ≤70 mg/dL · 73 days to go\n\nProgress: 108 → 99 → 91 → 84 mg/dL over 4 quarters. That's consistent improvement.\n\nThe biggest factor is fibre. When you hit over 89% adherence on your daily fibre logging, ApoB drops about 7 points per quarter. This week you're at 86% — just below the threshold.\n\nAt the current rate you'll land around 77 mg/dL by Q3, which is good but still 7 above target. Darcy will discuss options (including a possible medication adjustment) at your May cardiology consult.`

  if (/trend|chart|data/.test(q)) {
    setTimeout(() => router.push("/client/trends"), 1200)
    return `Navigating to your Trends view now.\n\nYou'll see your 30-day history for HRV, resting heart rate, sleep, glucose levels, and your overall Allostatic Load score — all on the same chart.`
  }

  if (/medical|dexa|test|lab|blood/.test(q)) {
    setTimeout(() => router.push("/client/medical"), 1200)
    return `Opening your Medical section now.\n\nKey dates coming up:\n● DEXA + VO₂max: Wed 22 Apr (2 days)\n● Full bloods: Tue 6 May (16 days)\n● Cardiology consult: Mon 12 May (22 days)\n\nFast from 20:30 tomorrow for the DEXA.`
  }

  return `I'm here to help you understand your health data and what it means for you.\n\nYour Allostatic Load right now is 64 — that's in the elevated range, mainly because of incomplete recovery over the last few nights.\n\nThe most important thing today: hold training intensity (zone-2 or rest only).\n\nYou can ask me about your training, ApoB, upcoming tests, or ask me to put together a document for a health consult.`
}

function ClientAgentPanel() {
  const router = useRouter()
  const now = "07:14"
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "agent", time: "07:00",
      text: `Good morning, Jamie. Here's what's on for today (${DATA.user.today}).\n\nYour Allostatic Load is 64 — elevated. Three nights of incomplete recovery, HRV is 11 ms below your normal range. Board call this morning adds some anticipatory stress.\n\nThe hold on training intensity is still active — zone-2 only or rest today.\n\nDEXA retest is this Wednesday at 08:30. Fast from 20:30 tomorrow night.\n\nWhat would you like to know?`,
    },
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }) }, [messages])

  function send(text: string) {
    if (!text.trim()) return
    setMessages(p => [...p, { role: "jamie", text: text.trim(), time: now }])
    setInput("")
    setLoading(true)
    setTimeout(() => {
      setMessages(p => [...p, { role: "agent", text: matchResponse(text, router), time: now }])
      setLoading(false)
    }, 700)
  }

  return (
    <div className="panel">
      <div className="panel-head">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span>Your health assistant</span>
          <span style={{ fontFamily: "var(--mono)", fontSize: 8, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.08em", border: "1px solid color-mix(in srgb, var(--accent) 40%, transparent)", padding: "2px 7px" }}>⬤ Online</span>
        </div>
        <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-3)" }}>Ask anything about your data, training, or upcoming tests</span>
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
      <div style={{ height: 280, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", flexDirection: m.role === "jamie" ? "row-reverse" : "row", gap: 10, alignItems: "flex-start" }}>
            <div style={{ width: 26, height: 26, borderRadius: "50%", background: m.role === "agent" ? "var(--panel-2)" : "var(--accent)", border: `1px solid ${m.role === "agent" ? "var(--hair-strong)" : "var(--accent)"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontFamily: "var(--mono)", fontSize: 8, color: m.role === "agent" ? "var(--accent)" : "var(--bg)", textTransform: "uppercase" }}>
              {m.role === "agent" ? "A" : "J"}
            </div>
            <div style={{ maxWidth: "76%", background: m.role === "agent" ? "var(--panel-2)" : "color-mix(in srgb, var(--accent) 10%, var(--panel-2))", border: `1px solid ${m.role === "agent" ? "var(--hair)" : "color-mix(in srgb, var(--accent) 25%, transparent)"}`, padding: "10px 14px" }}>
              <div style={{ fontFamily: "var(--mono)", fontSize: 8, color: m.role === "agent" ? "var(--accent)" : "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
                {m.role === "agent" ? "Assistant" : "Jamie"} · {m.time}
              </div>
              <div style={{ fontSize: 12.5, color: "var(--ink-2)", lineHeight: 1.6, whiteSpace: "pre-line" }}>{m.text}</div>
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <div style={{ width: 26, height: 26, borderRadius: "50%", background: "var(--panel-2)", border: "1px solid var(--hair-strong)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--mono)", fontSize: 8, color: "var(--accent)" }}>A</div>
            <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-4)", letterSpacing: "0.08em" }}>Thinking…</div>
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
          placeholder="Ask about your training, data, or upcoming tests…"
          style={{ flex: 1, background: "var(--panel-2)", border: "1px solid var(--hair-strong)", padding: "9px 12px", fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink)", letterSpacing: "0.02em" }}
        />
        <button onClick={() => send(input)} style={{ fontFamily: "var(--mono)", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", border: "none", background: "var(--accent)", color: "var(--bg)", padding: "9px 18px", cursor: "pointer" }}>
          Send
        </button>
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ClientCommandPage() {
  const [openSec, setOpenSec] = useState<string | null>(null)
  const [checked, setChecked] = useState<Record<string, boolean>>(
    Object.fromEntries([
      ...command.jtbd.clientProgramme.map(i => [i.id, i.done]),
      ...command.jtbd.clientDaily.map(i => [i.id, i.done]),
    ])
  )

  const phases = command.cyclephase.phases
  const upcomingIndex = phases.findIndex(p => p.upcoming)

  const sectionValues: Record<string, string> = {
    exercise: command.quarterlyStrategy.exercise,
    fuelling: command.quarterlyStrategy.fuelling,
    lifestyle: command.quarterlyStrategy.lifestyle,
  }

  const sections = [
    { key: "exercise", label: "Exercise & training" },
    { key: "fuelling", label: "Fuelling & nutrition" },
    { key: "lifestyle", label: "Lifestyle protocol" },
  ] as const

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, padding: "24px 32px", maxWidth: 1100 }}>

      <div style={{ borderBottom: "1px solid var(--hair)", paddingBottom: 16 }}>
        <div style={{ fontFamily: "var(--mono)", fontSize: 8.5, textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--ink-3)", marginBottom: 6 }}>Your programme</div>
        <h1 style={{ fontFamily: "var(--serif)", fontSize: 26, fontWeight: 400, color: "var(--ink)", margin: 0, letterSpacing: "-0.02em" }}>Q2 2026 · Jamie Garis</h1>
      </div>

      {/* Agent first */}
      <ClientAgentPanel />

      {/* Cycle — "you are here" */}
      <div className="panel">
        <div className="panel-head">
          <span>Where you are · Q2 2026</span>
          <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Quarterly cycle</span>
        </div>
        <div style={{ padding: "22px 28px" }}>
          {/* Track */}
          <div style={{ display: "flex", alignItems: "flex-start", position: "relative" }}>
            <div style={{ position: "absolute", top: 10, left: 10, right: 10, height: 1, background: "var(--hair-strong)", zIndex: 0 }} />
            {phases.map((ph, i) => {
              const color = ph.done ? "var(--ok)" : ph.upcoming ? "var(--warn)" : "var(--hair-strong)"
              return (
                <div key={ph.label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", position: "relative", zIndex: 1 }}>
                  <div style={{ width: 20, height: 20, borderRadius: "50%", background: ph.done ? "var(--ok)" : "var(--bg)", border: `2px solid ${color}`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: ph.upcoming ? 2 : 8 }}>
                    {ph.done && <span style={{ color: "var(--bg)", fontSize: 9, fontWeight: 700 }}>✓</span>}
                    {ph.upcoming && !ph.done && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--warn)", display: "block" }} />}
                  </div>
                  {ph.upcoming && (
                    <div style={{ fontFamily: "var(--mono)", fontSize: 7.5, color: "var(--warn)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4, background: "color-mix(in srgb, var(--warn) 12%, transparent)", padding: "1px 6px" }}>
                      ▲ You are here
                    </div>
                  )}
                  <div style={{ fontFamily: "var(--mono)", fontSize: 8.5, textTransform: "uppercase", letterSpacing: "0.06em", color: ph.upcoming ? "var(--ink)" : ph.done ? "var(--ok)" : "var(--ink-3)", textAlign: "center", lineHeight: 1.4, marginBottom: 2 }}>
                    {ph.label}
                  </div>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 8, color: ph.upcoming ? "var(--warn)" : "var(--ink-4)", textAlign: "center" }}>
                    {ph.upcoming ? "▶ " : ""}{ph.date}
                  </div>
                </div>
              )
            })}
          </div>

          {/* What's next */}
          {upcomingIndex >= 0 && (
            <div style={{ marginTop: 18, paddingTop: 14, borderTop: "1px solid var(--hair)", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
              <div>
                <div style={{ fontFamily: "var(--mono)", fontSize: 7.5, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--ink-4)", marginBottom: 5 }}>Next action</div>
                <div style={{ fontSize: 12, color: "var(--ink-2)", lineHeight: 1.5 }}>DEXA + VO₂max retest Wed 22 Apr — fast from 20:30 Tue night</div>
              </div>
              <div>
                <div style={{ fontFamily: "var(--mono)", fontSize: 7.5, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--ink-4)", marginBottom: 5 }}>Where you are</div>
                <div style={{ fontSize: 12, color: "var(--warn)", lineHeight: 1.5, fontFamily: "var(--mono)" }}>Phase 3 of 4 · Remeasurement week</div>
              </div>
              <div>
                <div style={{ fontFamily: "var(--mono)", fontSize: 7.5, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--ink-4)", marginBottom: 5 }}>What&apos;s next</div>
                <div style={{ fontSize: 12, color: "var(--ink-2)", lineHeight: 1.5 }}>Strategy review session with Darcy, Tue 29 Apr — results interpreted, protocol updated</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Checklist */}
      <div className="panel">
        <div className="panel-head">
          <span>Your programme checklist</span>
          <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Q2 2026</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
          {[
            { title: "Programme goals", items: command.jtbd.clientProgramme, color: "var(--accent)" },
            { title: "Daily habits", items: command.jtbd.clientDaily, color: "var(--accent)" },
          ].map((col, ci) => {
            const done = col.items.filter(i => checked[i.id]).length
            return (
              <div key={col.title} style={{ borderRight: ci === 0 ? "1px solid var(--hair)" : undefined, padding: "16px 20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", color: col.color }}>{col.title}</div>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-3)" }}>{done}/{col.items.length}</div>
                </div>
                <div style={{ height: 2, background: "var(--hair-strong)", marginBottom: 14 }}>
                  <div style={{ height: "100%", width: `${(done / col.items.length) * 100}%`, background: col.color }} />
                </div>
                {col.items.map(item => (
                  <label key={item.id} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 8, cursor: "pointer" }}>
                    <input type="checkbox" checked={checked[item.id] ?? false} onChange={() => setChecked(p => ({ ...p, [item.id]: !p[item.id] }))} style={{ marginTop: 2, accentColor: col.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 12.5, color: checked[item.id] ? "var(--ink-3)" : "var(--ink)", lineHeight: 1.4, textDecoration: checked[item.id] ? "line-through" : "none" }}>{item.text}</span>
                  </label>
                ))}
              </div>
            )
          })}
        </div>
      </div>

      {/* Strategy (read-only) */}
      <div className="panel">
        <div className="panel-head">
          <span>Your Q2 protocol</span>
          <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Read-only · set by {command.quarterlyStrategy.lockedBy.split("·")[0].trim()}</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
          {sections.map((sec, i) => (
            <div key={sec.key} style={{ borderRight: i % 2 === 0 ? "1px solid var(--hair)" : undefined, borderTop: i >= 2 ? "1px solid var(--hair)" : undefined }}>
              <div onClick={() => setOpenSec(openSec === sec.key ? null : sec.key)} style={{ padding: "14px 22px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontFamily: "var(--mono)", fontSize: 8, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--ink-3)" }}>{sec.label}</div>
                <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-3)" }}>{openSec === sec.key ? "▲" : "▼"}</span>
              </div>
              {openSec === sec.key && (
                <div style={{ padding: "0 22px 18px" }}>
                  <p style={{ fontSize: 12.5, color: "var(--ink-2)", lineHeight: 1.6, margin: 0 }}>{sectionValues[sec.key]}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Resolved interventions */}
      <div className="panel">
        <div className="panel-head">
          <span>Resolved interventions</span>
          <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ok)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{DATA.courseCorrector.filter(c => c.status === "resolved").length} resolved this quarter</span>
        </div>
        {DATA.courseCorrector.filter(c => c.status === "resolved").map((c, i) => (
          <div key={i} style={{ padding: "14px 20px", borderTop: "1px solid var(--hair)" }}>
            <div style={{ display: "flex", gap: 12, alignItems: "baseline", marginBottom: 6 }}>
              <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ok)", textTransform: "uppercase" }}>✓ Resolved</span>
              <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-3)" }}>{c.date}</span>
            </div>
            <div style={{ fontSize: 12.5, color: "var(--ink-2)", lineHeight: 1.5, marginBottom: 4 }}>{c.outcome}</div>
            {c.impact.after !== null && (
              <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--ok)" }}>{c.impact.metric}: {c.impact.before} → {c.impact.after} {c.impact.unit} in {c.impact.days} days</div>
            )}
          </div>
        ))}
      </div>

    </div>
  )
}
