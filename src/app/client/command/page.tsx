"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DATA } from "@/data/james"
import { T, LifecycleChip } from "@/components/Primitives"

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
    <div style={{ background: T.surface, borderRadius: 12, overflow: "hidden", marginBottom: 56 }}>
      {/* Header */}
      <div style={{ padding: "18px 24px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontFamily: T.sans, fontSize: 14, fontWeight: 500, color: T.ink }}>Your health assistant</span>
          <span style={{
            fontFamily: T.sans, fontSize: 11, color: T.ok, fontWeight: 500,
            background: T.okSubtle, padding: "2px 8px", borderRadius: 20,
            display: "inline-flex", alignItems: "center", gap: 4,
          }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: T.ok, display: "inline-block" }} />
            Online
          </span>
        </div>
        <span style={{ fontFamily: T.sans, fontSize: 12, color: T.ink3 }}>Ask anything about your data, training, or upcoming tests</span>
      </div>

      {/* Quick actions */}
      <div style={{ padding: "12px 24px", borderBottom: `1px solid ${T.border}`, display: "flex", gap: 8, flexWrap: "wrap" }}>
        {QUICK_ACTIONS.map(qa => (
          <button key={qa} onClick={() => send(qa)} style={{
            fontFamily: T.sans, fontSize: 12, padding: "6px 14px",
            border: `1px solid ${T.borderMed}`, borderRadius: 20,
            color: T.ink2, background: "transparent", cursor: "pointer",
            transition: "background 0.1s, color 0.1s",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = T.surfaceRaised; e.currentTarget.style.color = T.ink }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = T.ink2 }}
          >
            {qa}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div style={{ height: 300, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", flexDirection: m.role === "jamie" ? "row-reverse" : "row", gap: 12, alignItems: "flex-start" }}>
            <div style={{
              width: 28, height: 28, borderRadius: "50%",
              background: m.role === "agent" ? T.surfaceRaised : T.warn,
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              fontFamily: T.sans, fontSize: 11, fontWeight: 600,
              color: m.role === "agent" ? T.ink3 : T.bg,
            }}>
              {m.role === "agent" ? "A" : "J"}
            </div>
            <div style={{
              maxWidth: "76%",
              background: m.role === "agent" ? T.surfaceRaised : `rgba(200,165,106,0.10)`,
              borderRadius: 10,
              padding: "10px 14px",
            }}>
              <div style={{ fontFamily: T.sans, fontSize: 11, color: m.role === "agent" ? T.ink3 : T.warn, marginBottom: 5, fontWeight: 500 }}>
                {m.role === "agent" ? "Assistant" : "Jamie"} · {m.time}
              </div>
              <div style={{ fontSize: 13, color: T.ink2, lineHeight: 1.65, whiteSpace: "pre-line", fontFamily: T.sans }}>{m.text}</div>
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: T.surfaceRaised, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: T.sans, fontSize: 11, color: T.ink3 }}>A</div>
            <div style={{ fontFamily: T.sans, fontSize: 13, color: T.ink4 }}>Thinking…</div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ padding: "14px 24px", borderTop: `1px solid ${T.border}`, display: "flex", gap: 10 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send(input)}
          placeholder="Ask about your training, data, or upcoming tests…"
          style={{
            flex: 1, background: T.surfaceRaised,
            border: `1px solid ${T.borderMed}`, borderRadius: 8,
            padding: "10px 14px", fontFamily: T.sans, fontSize: 13,
            color: T.ink, outline: "none",
          }}
        />
        <button onClick={() => send(input)} style={{
          fontFamily: T.sans, fontSize: 13, fontWeight: 500,
          border: "none", background: T.warn, color: T.bg,
          padding: "10px 20px", borderRadius: 8, cursor: "pointer",
        }}>
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
    { key: "exercise", label: "Exercise and training" },
    { key: "fuelling", label: "Fuelling and nutrition" },
    { key: "lifestyle", label: "Lifestyle protocol" },
  ] as const

  return (
    <div style={{ padding: "48px 48px 80px", maxWidth: 960, margin: "0 auto" }}>

      {/* Page header */}
      <div style={{ marginBottom: 48 }}>
        <div style={{ fontFamily: T.sans, fontSize: 12, color: T.ink3, marginBottom: 8 }}>Your programme</div>
        <h1 style={{ fontFamily: T.serif, fontSize: 32, fontWeight: 300, color: T.ink, margin: 0, letterSpacing: "-0.02em" }}>
          Q2 2026 · Jamie Garis
        </h1>
      </div>

      {/* Agent panel */}
      <ClientAgentPanel />

      {/* Cycle — "you are here" */}
      <div style={{ background: T.surface, borderRadius: 12, padding: "24px 28px", marginBottom: 56 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <span style={{ fontFamily: T.sans, fontSize: 14, fontWeight: 500, color: T.ink }}>Where you are · Q2 2026</span>
          <span style={{ fontFamily: T.sans, fontSize: 12, color: T.ink3 }}>Quarterly cycle</span>
        </div>

        {/* Track */}
        <div style={{ display: "flex", alignItems: "flex-start", position: "relative" }}>
          <div style={{ position: "absolute", top: 10, left: 10, right: 10, height: 1, background: T.border, zIndex: 0 }} />
          {phases.map((ph) => {
            const color = ph.done ? T.ok : ph.upcoming ? T.warn : T.border
            return (
              <div key={ph.label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", position: "relative", zIndex: 1 }}>
                <div style={{
                  width: 20, height: 20, borderRadius: "50%",
                  background: ph.done ? T.ok : T.bg,
                  border: `2px solid ${color}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: ph.upcoming ? 4 : 8,
                }}>
                  {ph.done && <span style={{ color: T.bg, fontSize: 9, fontWeight: 700 }}>✓</span>}
                  {ph.upcoming && !ph.done && <span style={{ width: 6, height: 6, borderRadius: "50%", background: T.warn, display: "block" }} />}
                </div>
                {ph.upcoming && (
                  <div style={{
                    fontFamily: T.sans, fontSize: 10, color: T.warn, marginBottom: 4,
                    background: T.warnSubtle, padding: "2px 8px", borderRadius: 20, fontWeight: 500,
                  }}>
                    You are here
                  </div>
                )}
                <div style={{
                  fontFamily: T.sans, fontSize: 11, fontWeight: ph.upcoming ? 500 : 400,
                  color: ph.upcoming ? T.ink : ph.done ? T.ok : T.ink3,
                  textAlign: "center", lineHeight: 1.4, marginBottom: 2,
                }}>
                  {ph.label}
                </div>
                <div style={{ fontFamily: T.mono, fontSize: 10, color: ph.upcoming ? T.warn : T.ink4, textAlign: "center" }}>
                  {ph.date}
                </div>
              </div>
            )
          })}
        </div>

        {/* What's next */}
        {upcomingIndex >= 0 && (
          <div style={{ marginTop: 24, paddingTop: 20, borderTop: `1px solid ${T.border}`, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>
            <div>
              <div style={{ fontFamily: T.sans, fontSize: 12, color: T.ink3, marginBottom: 6 }}>Next action</div>
              <div style={{ fontSize: 13, color: T.ink2, lineHeight: 1.55, fontFamily: T.sans }}>DEXA + VO₂max retest Wed 22 Apr — fast from 20:30 Tue night</div>
            </div>
            <div>
              <div style={{ fontFamily: T.sans, fontSize: 12, color: T.ink3, marginBottom: 6 }}>Where you are</div>
              <div style={{ fontFamily: T.mono, fontSize: 13, color: T.warn, lineHeight: 1.55 }}>Phase 3 of 4 · Remeasurement week</div>
            </div>
            <div>
              <div style={{ fontFamily: T.sans, fontSize: 12, color: T.ink3, marginBottom: 6 }}>What&apos;s next</div>
              <div style={{ fontSize: 13, color: T.ink2, lineHeight: 1.55, fontFamily: T.sans }}>Strategy review session with Darcy, Tue 29 Apr — results interpreted, protocol updated</div>
            </div>
          </div>
        )}
      </div>

      {/* Checklist */}
      <div style={{ background: T.surface, borderRadius: 12, overflow: "hidden", marginBottom: 56 }}>
        <div style={{ padding: "20px 28px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontFamily: T.sans, fontSize: 14, fontWeight: 500, color: T.ink }}>Your programme checklist</span>
          <span style={{ fontFamily: T.sans, fontSize: 12, color: T.ink3 }}>Q2 2026</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
          {[
            { title: "Programme goals", items: command.jtbd.clientProgramme },
            { title: "Daily habits", items: command.jtbd.clientDaily },
          ].map((col, ci) => {
            const done = col.items.filter(i => checked[i.id]).length
            return (
              <div key={col.title} style={{
                borderRight: ci === 0 ? `1px solid ${T.border}` : undefined,
                padding: "20px 28px",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                  <div style={{ fontFamily: T.sans, fontSize: 12, fontWeight: 500, color: T.warn }}>{col.title}</div>
                  <div style={{ fontFamily: T.mono, fontSize: 12, color: T.ink3 }}>{done}/{col.items.length}</div>
                </div>
                <div style={{ height: 3, background: T.border, borderRadius: 2, marginBottom: 16 }}>
                  <div style={{ height: "100%", width: `${(done / col.items.length) * 100}%`, background: T.warn, borderRadius: 2, transition: "width 0.3s" }} />
                </div>
                {col.items.map(item => (
                  <label key={item.id} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 10, cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={checked[item.id] ?? false}
                      onChange={() => setChecked(p => ({ ...p, [item.id]: !p[item.id] }))}
                      style={{ marginTop: 3, accentColor: T.warn, flexShrink: 0 }}
                    />
                    <span style={{
                      fontFamily: T.sans, fontSize: 13, lineHeight: 1.5,
                      color: checked[item.id] ? T.ink3 : T.ink,
                      textDecoration: checked[item.id] ? "line-through" : "none",
                    }}>{item.text}</span>
                  </label>
                ))}
              </div>
            )
          })}
        </div>
      </div>

      {/* Strategy (read-only) */}
      <div style={{ background: T.surface, borderRadius: 12, overflow: "hidden", marginBottom: 56 }}>
        <div style={{ padding: "20px 28px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontFamily: T.sans, fontSize: 14, fontWeight: 500, color: T.ink }}>Your Q2 protocol</span>
          <span style={{ fontFamily: T.sans, fontSize: 12, color: T.ink3 }}>
            Read-only · set by {command.quarterlyStrategy.lockedBy.split("·")[0].trim()}
          </span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
          {sections.map((sec, i) => (
            <div key={sec.key} style={{
              borderRight: i % 2 === 0 ? `1px solid ${T.border}` : undefined,
              borderTop: i >= 2 ? `1px solid ${T.border}` : undefined,
            }}>
              <div
                onClick={() => setOpenSec(openSec === sec.key ? null : sec.key)}
                style={{ padding: "16px 28px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}
              >
                <div style={{ fontFamily: T.sans, fontSize: 13, color: T.ink2, fontWeight: 500 }}>{sec.label}</div>
                <span style={{ fontFamily: T.mono, fontSize: 11, color: T.ink3 }}>{openSec === sec.key ? "▲" : "▼"}</span>
              </div>
              {openSec === sec.key && (
                <div style={{ padding: "0 28px 20px" }}>
                  <p style={{ fontFamily: T.sans, fontSize: 13, color: T.ink2, lineHeight: 1.65, margin: 0 }}>{sectionValues[sec.key]}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Resolved interventions */}
      <div style={{ background: T.surface, borderRadius: 12, overflow: "hidden" }}>
        <div style={{ padding: "20px 28px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontFamily: T.sans, fontSize: 14, fontWeight: 500, color: T.ink }}>Resolved interventions</span>
          <span style={{ fontFamily: T.sans, fontSize: 12, color: T.ok }}>
            {DATA.courseCorrector.filter(c => c.status === "resolved").length} resolved this quarter
          </span>
        </div>
        {DATA.courseCorrector.filter(c => c.status === "resolved").map((c, i) => (
          <div key={i} style={{ padding: "18px 28px", borderTop: `1px solid ${T.border}` }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 8 }}>
              <LifecycleChip status="resolved" />
              <span style={{ fontFamily: T.mono, fontSize: 11, color: T.ink3 }}>{c.date}</span>
            </div>
            <div style={{ fontFamily: T.sans, fontSize: 13, color: T.ink2, lineHeight: 1.55, marginBottom: 6 }}>{c.outcome}</div>
            {c.impact.after !== null && (
              <div style={{ fontFamily: T.mono, fontSize: 11, color: T.ok }}>
                {c.impact.metric}: {c.impact.before} → {c.impact.after} {c.impact.unit} in {c.impact.days} days
              </div>
            )}
          </div>
        ))}
      </div>

    </div>
  )
}
