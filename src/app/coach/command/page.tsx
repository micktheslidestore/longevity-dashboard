"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DATA } from "@/data/james"
import { T } from "@/components/Primitives"

const { command } = DATA

// ─── Quarter history data ─────────────────────────────────────────────────────

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

// ─── Shared modal ─────────────────────────────────────────────────────────────

function Modal({ title, body, onClose, onConfirm, confirmLabel }: {
  title: string; body: React.ReactNode; onClose: () => void
  onConfirm: () => void; confirmLabel: string
}) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}
      onClick={onClose}>
      <div style={{ background: T.surface, border: `1px solid ${T.borderMed}`, padding: "28px 32px", maxWidth: 520, width: "90%", borderRadius: 12, boxShadow: "0 8px 40px rgba(0,0,0,0.5)" }}
        onClick={e => e.stopPropagation()}>
        <div style={{ fontFamily: T.sans, fontSize: 11, fontWeight: 600, color: T.ok, marginBottom: 10 }}>{title}</div>
        <div style={{ fontFamily: T.sans, fontSize: 13, color: T.ink2, lineHeight: 1.65, marginBottom: 24 }}>{body}</div>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ fontFamily: T.sans, fontSize: 13, border: `1px solid ${T.borderMed}`, padding: "7px 16px", color: T.ink3, background: "transparent", cursor: "pointer", borderRadius: 6 }}>Cancel</button>
          <button onClick={onConfirm} style={{ fontFamily: T.sans, fontSize: 13, border: "none", background: T.ok, color: T.bg, padding: "7px 18px", cursor: "pointer", borderRadius: 6, fontWeight: 500 }}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  )
}

// ─── Since last visit ─────────────────────────────────────────────────────────

const SINCE_LAST_VISIT = [
  { id: "v1", when: "Thu 22:40", type: "agent-flag",  title: "Overnight glucose excursion", body: "+18 mg/dL at 02:14 — no food log. Dawn phenomenon possible. Observe one more night.", href: "/coach/trends", linkLabel: "View trends", color: T.warn },
  { id: "v2", when: "Wed 18:31", type: "share",        title: "Note forwarded to Dr. Rao",   body: "Chest pressure entry from Mon 13 Apr shared with Dr. Sanjay Rao with Jamie's consent.", href: "/coach/medical", linkLabel: "Medical roadmap", color: T.ink3 },
  { id: "v3", when: "Wed 07:45", type: "checkin",      title: "Check-in submitted",          body: "Jamie · Sleep 7 · Mood 6 · Load 8 · tags: foggy, caffeine-heavy", href: "/coach/compliance", linkLabel: "Compliance", color: T.accent },
]

function SinceLastVisit() {
  const router = useRouter()
  const [dismissed, setDismissed] = useState(false)
  if (dismissed) return null
  return (
    <div style={{ background: T.surface, borderRadius: 12, border: `1px solid ${T.border}`, overflow: "hidden" }}>
      <div style={{ padding: "14px 24px", borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontFamily: T.sans, fontSize: 13, fontWeight: 600, color: T.ink }}>Since your last visit</span>
          <span style={{ fontFamily: T.sans, fontSize: 11, color: T.ink4, background: T.surfaceRaised, padding: "2px 8px", borderRadius: 20 }}>3 changes</span>
        </div>
        <button onClick={() => setDismissed(true)} style={{ fontFamily: T.sans, fontSize: 12, color: T.ink4, background: "transparent", border: "none", cursor: "pointer", padding: "4px 8px" }}>
          Dismiss
        </button>
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        {SINCE_LAST_VISIT.map((item, i) => (
          <div key={item.id} style={{ padding: "12px 24px", borderBottom: i < SINCE_LAST_VISIT.length - 1 ? `1px solid ${T.border}` : undefined, display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 3, height: 36, background: item.color, borderRadius: 2, flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 2 }}>
                <span style={{ fontFamily: T.sans, fontSize: 13, fontWeight: 500, color: T.ink }}>{item.title}</span>
                <span style={{ fontFamily: T.mono, fontSize: 11, color: T.ink4 }}>{item.when}</span>
              </div>
              <div style={{ fontFamily: T.sans, fontSize: 12, color: T.ink3, lineHeight: 1.4 }}>{item.body}</div>
            </div>
            <button onClick={() => router.push(item.href)} style={{ fontFamily: T.sans, fontSize: 12, color: T.ink3, background: "transparent", border: "none", cursor: "pointer", padding: "4px 0", flexShrink: 0 }}>
              {item.linkLabel} →
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Decision layer ───────────────────────────────────────────────────────────

function DecisionLayer() {
  const [status, setStatus] = useState<"pending" | "approved" | "dismissed">("pending")

  if (status === "approved") return (
    <div style={{ padding: "28px 36px", border: `1px solid ${T.okMuted}`, borderLeft: `3px solid ${T.ok}`, background: T.okSubtle, borderRadius: 12 }}>
      <div style={{ fontFamily: T.sans, fontSize: 13, fontWeight: 600, color: T.ok, marginBottom: 4 }}>Recommendation approved — pushed to Jamie</div>
      <div style={{ fontFamily: T.sans, fontSize: 12, color: T.ink3 }}>Jamie will see the updated corrector when he next opens the app. Agent briefing updated.</div>
    </div>
  )

  if (status === "dismissed") return null

  return (
    <div style={{ background: T.warnSubtle, border: `1px solid ${T.warnMuted}`, padding: "40px 44px", borderRadius: 12 }}>
      <div style={{ fontFamily: T.sans, fontSize: 11, color: T.ink4, marginBottom: 24, fontWeight: 500 }}>
        Decision required · {DATA.user.today}
      </div>
      <p style={{ fontFamily: T.serif, fontSize: 21, fontWeight: 300, lineHeight: 1.7, color: T.ink, margin: "0 0 36px", maxWidth: 620 }}>
        Jamie&apos;s allostatic load has been elevated for three consecutive days.
        The autonomic flag from 17 Apr has not resolved — his HRV is still suppressed and a board call this morning adds further cortisol load.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 32, marginBottom: 36, paddingBottom: 36, borderBottom: `1px solid ${T.border}` }}>
        {[
          { label: "HRV last night", value: "41 ms", sub: "−11 vs his baseline of 52 ms", color: T.warn },
          { label: "Corrector status", value: "Day 3", sub: "Hold-intensity active since 17 Apr", color: T.ink },
          { label: "Today's context", value: "Board call", sub: "09:00 · anticipatory stress expected", color: T.ink },
        ].map(item => (
          <div key={item.label}>
            <div style={{ fontFamily: T.sans, fontSize: 12, color: T.ink4, marginBottom: 10, fontWeight: 500 }}>{item.label}</div>
            <div style={{ fontFamily: T.mono, fontSize: 26, letterSpacing: "-0.03em", color: item.color, lineHeight: 1, marginBottom: 8, fontWeight: 300 }}>{item.value}</div>
            <div style={{ fontFamily: T.sans, fontSize: 13, color: T.ink3, lineHeight: 1.55 }}>{item.sub}</div>
          </div>
        ))}
      </div>
      <div style={{ borderLeft: `2px solid ${T.ok}`, paddingLeft: 24, marginBottom: 32 }}>
        <div style={{ fontFamily: T.sans, fontSize: 12, color: T.ink4, marginBottom: 10, fontWeight: 600 }}>Recommendation</div>
        <p style={{ fontFamily: T.sans, fontSize: 14, color: T.ink2, lineHeight: 1.75, margin: 0, maxWidth: 580 }}>
          Maintain the intensity hold through Wednesday 23 Apr. Zone-2 only — heart rate below 135 bpm — or full rest.
          Reassess after DEXA and VO₂max retest results come through Wednesday afternoon.
          If HRV shows two consecutive nights above 44 ms before then, the hold can be lifted early.
        </p>
      </div>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <button onClick={() => setStatus("approved")} style={{ fontFamily: T.sans, fontSize: 14, fontWeight: 600, border: "none", background: T.ok, color: T.bg, padding: "12px 28px", cursor: "pointer", borderRadius: 8 }}>
          Approve and push to Jamie
        </button>
        <button style={{ fontFamily: T.sans, fontSize: 14, border: `1px solid ${T.borderMed}`, background: "transparent", color: T.ink2, padding: "12px 20px", cursor: "pointer", borderRadius: 8 }}>
          Modify
        </button>
        <button onClick={() => setStatus("dismissed")} style={{ fontFamily: T.sans, fontSize: 13, border: "none", background: "transparent", color: T.ink4, padding: "12px 16px", cursor: "pointer" }}>
          Not now
        </button>
      </div>
    </div>
  )
}

// ─── Workout recommendation card ──────────────────────────────────────────────

type WorkoutDay = {
  date: string; dow: string; type: string; label: string; duration: string; note: string
}

const INITIAL_WORKOUT_DAYS: WorkoutDay[] = [
  { date: "Mon 20 Apr", dow: "Mon", type: "rest",     label: "Rest",            duration: "—",     note: "Active recovery only. Hold-intensity corrector day 4." },
  { date: "Tue 21 Apr", dow: "Tue", type: "zone2",    label: "Zone-2 run",      duration: "45 min", note: "HR 120–135 bpm. Richmond Park. Fasted ok." },
  { date: "Wed 22 Apr", dow: "Wed", type: "test",     label: "DEXA + VO₂max",   duration: "90 min", note: "Fasted from 20:30 Tue. West Clinic 08:30." },
  { date: "Thu 23 Apr", dow: "Thu", type: "mobility", label: "Mobility + breath", duration: "20 min", note: "Pre-offsite. 4-7-8 protocol." },
  { date: "Fri 24 Apr", dow: "Fri", type: "rest",     label: "Rest",            duration: "—",     note: "Offsite — hold protocol. Protect sleep onset." },
]

const TYPE_OPTIONS = ["rest", "zone2", "mobility", "lactate", "test", "recovery"]
const TYPE_LABELS: Record<string, string> = {
  rest: "Rest", zone2: "Zone-2", mobility: "Mobility", lactate: "Lactate", test: "Testing", recovery: "Recovery"
}
const TYPE_COLOR: Record<string, string> = {
  rest: T.ink4, zone2: T.ok, mobility: T.accent, lactate: T.warn, test: T.ink2, recovery: T.ok
}

function WorkoutRecommendationCard() {
  const [lifecycle, setLifecycle] = useState<"draft" | "approved" | "pushed">("draft")
  const [days, setDays] = useState<WorkoutDay[]>(INITIAL_WORKOUT_DAYS)
  const [editingDay, setEditingDay] = useState<number | null>(null)
  const [editBuf, setEditBuf] = useState<Partial<WorkoutDay>>({})
  const [toast, setToast] = useState<string | null>(null)

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 3500)
  }

  function startEdit(i: number) {
    setEditingDay(i)
    setEditBuf({ ...days[i] })
  }

  function saveEdit(i: number) {
    setDays(prev => prev.map((d, idx) => idx === i ? { ...d, ...editBuf } as WorkoutDay : d))
    setEditingDay(null)
    setEditBuf({})
  }

  function approve() {
    setLifecycle("pushed")
    showToast("Workout block approved and pushed to Jamie's calendar ✓")
  }

  const borderColor = lifecycle === "draft" ? T.warnMuted : T.okMuted
  const bgColor     = lifecycle === "draft" ? T.warnSubtle : T.okSubtle
  const lcLabel     = lifecycle === "draft" ? "Draft · awaiting your review" : "Approved · pushed to Jamie"
  const lcColor     = lifecycle === "draft" ? T.warn : T.ok

  return (
    <div style={{ background: T.surface, borderRadius: 12, border: `1px solid ${borderColor}`, overflow: "hidden" }}>
      {/* Header */}
      <div style={{ padding: "16px 24px", background: bgColor, borderBottom: `1px solid ${borderColor}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontFamily: T.sans, fontSize: 11, color: T.ink4, marginBottom: 4 }}>Agent workout recommendation · week of 20 Apr</div>
          <div style={{ fontFamily: T.sans, fontSize: 14, fontWeight: 600, color: T.ink }}>5-day workout block</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontFamily: T.sans, fontSize: 11, color: lcColor, fontWeight: 500, background: lifecycle === "draft" ? T.warnSubtle : T.okSubtle, border: `1px solid ${lifecycle === "draft" ? T.warnMuted : T.okMuted}`, padding: "3px 10px", borderRadius: 20 }}>
            {lcLabel}
          </span>
        </div>
      </div>

      {/* Agent reasoning */}
      <div style={{ padding: "20px 24px", borderBottom: `1px solid ${T.border}` }}>
        <div style={{ fontFamily: T.sans, fontSize: 11, color: T.ink4, marginBottom: 8, fontWeight: 500 }}>Agent reasoning</div>
        <p style={{ fontFamily: T.serif, fontSize: 15, fontWeight: 300, lineHeight: 1.75, color: T.ink2, margin: 0, maxWidth: 680 }}>
          Hold-intensity corrector remains active (day 4). HRV is stable but not recovering — conservative week is appropriate.
          Wednesday must be rest and fasted for DEXA. Thursday is offsite prep so mobility only. Friday is offsite.
          Recommending zone-2 Tuesday, then rest Friday, with full reassessment after DEXA results land Wednesday afternoon.
        </p>
      </div>

      {/* Day rows */}
      <div>
        {days.map((day, i) => {
          const isEditing = editingDay === i
          const col = TYPE_COLOR[day.type] ?? T.ink3
          return (
            <div key={day.date} style={{ borderBottom: i < days.length - 1 ? `1px solid ${T.border}` : undefined }}>
              {isEditing ? (
                /* Edit mode */
                <div style={{ padding: "14px 24px", background: T.surfaceRaised, display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <span style={{ fontFamily: T.mono, fontSize: 12, color: T.ink4, width: 80 }}>{day.date}</span>
                    <select
                      value={editBuf.type ?? day.type}
                      onChange={e => setEditBuf(b => ({ ...b, type: e.target.value, label: TYPE_LABELS[e.target.value] }))}
                      style={{ fontFamily: T.sans, fontSize: 13, background: T.surface, border: `1px solid ${T.borderMed}`, color: T.ink, padding: "5px 10px", borderRadius: 6, cursor: "pointer" }}
                    >
                      {TYPE_OPTIONS.map(t => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
                    </select>
                    <input
                      value={editBuf.duration ?? day.duration}
                      onChange={e => setEditBuf(b => ({ ...b, duration: e.target.value }))}
                      placeholder="Duration"
                      style={{ fontFamily: T.sans, fontSize: 13, background: T.surface, border: `1px solid ${T.borderMed}`, color: T.ink, padding: "5px 10px", borderRadius: 6, width: 100 }}
                    />
                  </div>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <input
                      value={editBuf.note ?? day.note}
                      onChange={e => setEditBuf(b => ({ ...b, note: e.target.value }))}
                      style={{ flex: 1, fontFamily: T.sans, fontSize: 13, background: T.surface, border: `1px solid ${T.borderMed}`, color: T.ink, padding: "5px 10px", borderRadius: 6 }}
                    />
                    <button onClick={() => saveEdit(i)} style={{ fontFamily: T.sans, fontSize: 12, fontWeight: 600, border: "none", background: T.ok, color: T.bg, padding: "6px 14px", cursor: "pointer", borderRadius: 6 }}>Save</button>
                    <button onClick={() => setEditingDay(null)} style={{ fontFamily: T.sans, fontSize: 12, border: `1px solid ${T.borderMed}`, background: "transparent", color: T.ink3, padding: "6px 12px", cursor: "pointer", borderRadius: 6 }}>Cancel</button>
                  </div>
                </div>
              ) : (
                /* View mode */
                <div style={{ padding: "12px 24px", display: "flex", alignItems: "center", gap: 16 }}>
                  <span style={{ fontFamily: T.mono, fontSize: 12, color: T.ink4, width: 80, flexShrink: 0 }}>{day.date}</span>
                  <span style={{ fontFamily: T.sans, fontSize: 12, fontWeight: 600, color: col, width: 120, flexShrink: 0 }}>{day.label}</span>
                  <span style={{ fontFamily: T.mono, fontSize: 12, color: T.ink4, width: 60, flexShrink: 0 }}>{day.duration}</span>
                  <span style={{ flex: 1, fontFamily: T.sans, fontSize: 12, color: T.ink3, lineHeight: 1.4 }}>{day.note}</span>
                  {lifecycle === "draft" && (
                    <button onClick={() => startEdit(i)} style={{ fontFamily: T.sans, fontSize: 11, border: `1px solid ${T.borderMed}`, color: T.ink4, background: "transparent", padding: "4px 10px", cursor: "pointer", borderRadius: 6, flexShrink: 0 }}>
                      Edit
                    </button>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Actions */}
      <div style={{ padding: "16px 24px", borderTop: `1px solid ${T.border}`, display: "flex", gap: 12, alignItems: "center" }}>
        {lifecycle === "draft" ? (
          <>
            <button onClick={approve} style={{ fontFamily: T.sans, fontSize: 13, fontWeight: 600, border: "none", background: T.ok, color: T.bg, padding: "10px 22px", cursor: "pointer", borderRadius: 8 }}>
              Approve and push to Jamie →
            </button>
            <button style={{ fontFamily: T.sans, fontSize: 13, border: `1px solid ${T.borderMed}`, background: "transparent", color: T.ink2, padding: "10px 18px", cursor: "pointer", borderRadius: 8 }}>
              Modify
            </button>
            <button style={{ fontFamily: T.sans, fontSize: 12, border: "none", background: "transparent", color: T.ink4, padding: "10px 14px", cursor: "pointer" }}>
              Reject — draft again
            </button>
          </>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontFamily: T.sans, fontSize: 13, fontWeight: 600, color: T.ok }}>✓ Pushed to Jamie&apos;s calendar</span>
            <span style={{ fontFamily: T.sans, fontSize: 12, color: T.ink4 }}>Jamie&apos;s week plan updated · {DATA.user.today} 07:14</span>
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", bottom: 24, right: 24, background: T.surfaceRaised, border: `1px solid ${T.ok}`, padding: "12px 20px", fontFamily: T.sans, fontSize: 13, color: T.ink2, boxShadow: "0 4px 20px rgba(0,0,0,0.4)", borderRadius: 8, zIndex: 100, maxWidth: 360 }}>
          <span style={{ color: T.ok, marginRight: 8 }}>✓</span>{toast}
        </div>
      )}
    </div>
  )
}

// ─── Agent panel (enhanced SOP + chat) ───────────────────────────────────────

interface Msg { role: "agent" | "coach"; text: string; time: string }

const QUICK_ACTIONS = [
  "ApoB status",
  "Draft protocol change",
  "Autonomic flag analysis",
  "Quarterly report summary",
]

function matchResponse(input: string, router: ReturnType<typeof useRouter>): string {
  const q = input.toLowerCase()

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
    return `Opening trends for Jamie Garis…\n\nNavigating to the trends view now. You'll see the 30-day series for HRV, RHR, sleep, glucose, and Allostatic Load with protocol annotation markers and multi-metric overlay.`
  }

  if (/medical|dexa|lab|blood|doctor/.test(q)) {
    setTimeout(() => router.push("/coach/medical"), 1200)
    return `Opening medical roadmap…\n\nKey upcoming dates: DEXA + VO₂max retest 22 Apr (2 days), Quarterly bloods 6 May (16 days), Cardiology consult 12 May (22 days).\n\nJamie must fast from 20:30 Tuesday for the DEXA. I'll navigate you there now.`
  }

  return `I've analysed Jamie's latest data. Here's what I see:\n\nAllostatic Load: 64 (elevated). Primary flags: autonomic (HRV −11 ms, day 3 of deficit) and sleep quality (efficiency 82%, deep sleep 54 min). Board-cycle stress is the current context.\n\nNext recommended actions: (1) Confirm today's hold-intensity corrector. (2) Review 3 pending agent drafts. (3) Prepare DEXA retest briefing for Wed 22 Apr.\n\nAsk me about ApoB, protocol changes, the autonomic flag, trends, medical roadmap, or the quarterly report.`
}

const SOP_SECTIONS = [
  {
    id: "overnight",
    label: "Overnight analysis",
    status: "complete",
    items: [
      { label: "HRV", value: "41 ms", note: "−11 vs 30d baseline · stable, not recovering", color: T.warn },
      { label: "RHR", value: "52 bpm", note: "+4 vs baseline · 4th consecutive night elevated", color: T.warn },
      { label: "Skin temp", value: "+0.4°C", note: "Day 3 of deviation · inflammation precursor", color: T.warn },
      { label: "Sleep efficiency", value: "82%", note: "Below 85% target · deep sleep 54 min", color: T.ink3 },
    ],
  },
  {
    id: "workout",
    label: "Workout recommendation",
    status: "pending",
    items: [
      { label: "Block", value: "5 days", note: "Mon rest · Tue zone-2 · Wed DEXA · Thu mobility · Fri rest", color: T.ok },
      { label: "Corrector", value: "Active", note: "Hold-intensity day 4 · monitor HRV post-DEXA", color: T.warn },
    ],
  },
  {
    id: "flags",
    label: "Attention flags",
    status: "active",
    items: [
      { label: "Autonomic", value: "Day 3", note: "HRV + RHR + sTemp · pattern matches Feb setback", color: T.warn },
      { label: "Glucose", value: "+18 mg/dL", note: "Thu 02:14 · dawn phenomenon likely · observe 1 more night", color: T.warn },
    ],
  },
  {
    id: "pending",
    label: "Pending items",
    status: "action",
    items: [
      { label: "Drafts", value: "3", note: "Autonomic flag · glucose excursion · ApoB analysis · awaiting countersign", color: T.warn },
      { label: "Countersign", value: "Due today", note: "Within 24h SLA · 2 drafts at 22h mark", color: T.warn },
    ],
  },
  {
    id: "actions",
    label: "Today's actions",
    status: "prioritised",
    items: [
      { label: "1st", value: "DEXA prep", note: "Confirm Jamie's fasting protocol → Medical roadmap", color: T.warn, href: "/coach/medical" },
      { label: "2nd", value: "Countersign drafts", note: "3 awaiting review → Compliance", color: T.ok, href: "/coach/compliance" },
      { label: "3rd", value: "Approve workout block", note: "Push to Jamie's calendar → see card above", color: T.ok },
    ],
  },
]

function AgentPanel() {
  const router = useRouter()
  const now = "07:14"
  const [sopOpen, setSopOpen] = useState(true)
  const [openSection, setOpenSection] = useState<string | null>("overnight")
  const [messages, setMessages] = useState<Msg[]>([
    { role: "agent", time: "06:58", text: `Morning briefing complete. Five sections ready for your review above.\n\nTL;DR: HRV stable at 41 ms but not recovering. 3 drafts awaiting your countersignature. Workout block drafted for your approval. DEXA fasting confirmation is the critical action today.\n\nWhat would you like to address first?` },
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
    <div id="agent" style={{ background: T.surface, borderRadius: 12, overflow: "hidden" }}>
      {/* Header */}
      <div style={{ padding: "16px 24px", borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontFamily: T.sans, fontSize: 14, fontWeight: 600, color: T.ink }}>Agent</span>
          <span style={{ fontFamily: T.sans, fontSize: 11, color: T.ok, background: T.okSubtle, padding: "2px 8px", borderRadius: 20, fontWeight: 500 }}>Live · pre-loaded context</span>
        </div>
        <button
          onClick={() => setSopOpen(o => !o)}
          style={{ fontFamily: T.sans, fontSize: 12, color: T.ink3, background: "transparent", border: `1px solid ${T.borderMed}`, padding: "5px 12px", cursor: "pointer", borderRadius: 6 }}
        >
          {sopOpen ? "Hide morning SOP" : "Show morning SOP"}
        </button>
      </div>

      {/* Structured SOP */}
      {sopOpen && (
        <div style={{ borderBottom: `1px solid ${T.border}` }}>
          {SOP_SECTIONS.map((section, si) => {
            const isOpen = openSection === section.id
            const statusColor = section.status === "action" ? T.warn : section.status === "active" ? T.warn : T.ok
            return (
              <div key={section.id} style={{ borderBottom: si < SOP_SECTIONS.length - 1 ? `1px solid ${T.border}` : undefined }}>
                <div
                  onClick={() => setOpenSection(isOpen ? null : section.id)}
                  style={{ padding: "12px 24px", display: "flex", alignItems: "center", gap: 14, cursor: "pointer" }}
                >
                  <span style={{ fontFamily: T.mono, fontSize: 11, color: statusColor, width: 16 }}>⬤</span>
                  <span style={{ fontFamily: T.sans, fontSize: 13, fontWeight: 500, color: T.ink, flex: 1 }}>
                    Section {si + 1} — {section.label}
                  </span>
                  <span style={{ fontFamily: T.sans, fontSize: 11, color: T.ink4, background: T.surfaceRaised, padding: "2px 8px", borderRadius: 20 }}>
                    {section.items.length} {section.items.length === 1 ? "item" : "items"}
                  </span>
                  <span style={{ fontFamily: T.sans, fontSize: 11, color: T.ink4 }}>{isOpen ? "▲" : "▼"}</span>
                </div>
                {isOpen && (
                  <div style={{ padding: "0 24px 16px 54px", display: "flex", flexDirection: "column", gap: 10 }}>
                    {section.items.map(item => (
                      <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 16 }}>
                        <span style={{ fontFamily: T.sans, fontSize: 12, color: T.ink4, width: 80, flexShrink: 0 }}>{item.label}</span>
                        <span style={{ fontFamily: T.mono, fontSize: 13, color: item.color, width: 80, flexShrink: 0 }}>{item.value}</span>
                        <span style={{ fontFamily: T.sans, fontSize: 12, color: T.ink3, flex: 1, lineHeight: 1.4 }}>
                          {item.note}
                          {(item as { href?: string }).href && (
                            <button
                              onClick={(e) => { e.stopPropagation(); router.push((item as { href: string }).href) }}
                              style={{ fontFamily: T.sans, fontSize: 11, color: T.accent, background: "transparent", border: "none", cursor: "pointer", marginLeft: 8 }}
                            >
                              →
                            </button>
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Quick actions */}
      <div style={{ padding: "12px 24px", borderBottom: `1px solid ${T.border}`, display: "flex", gap: 8, flexWrap: "wrap" }}>
        {QUICK_ACTIONS.map(qa => (
          <button key={qa} onClick={() => send(qa)} style={{ fontFamily: T.sans, fontSize: 12, padding: "5px 14px", border: `1px solid ${T.borderMed}`, color: T.ink3, background: "transparent", cursor: "pointer", borderRadius: 20 }}>
            {qa}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div style={{ height: 280, overflowY: "auto", padding: "16px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", flexDirection: m.role === "coach" ? "row-reverse" : "row", gap: 10, alignItems: "flex-start" }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: m.role === "agent" ? T.surfaceRaised : T.ok, border: `1px solid ${m.role === "agent" ? T.borderMed : T.ok}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontFamily: T.sans, fontSize: 11, fontWeight: 600, color: m.role === "agent" ? T.ok : T.bg }}>
              {m.role === "agent" ? "A" : "D"}
            </div>
            <div style={{ maxWidth: "76%", background: m.role === "agent" ? T.surfaceRaised : T.okSubtle, border: `1px solid ${m.role === "agent" ? T.border : T.okMuted}`, padding: "10px 14px", borderRadius: 10 }}>
              <div style={{ fontFamily: T.sans, fontSize: 11, color: m.role === "agent" ? T.ok : T.ink3, marginBottom: 6, fontWeight: 600 }}>
                {m.role === "agent" ? "Agent" : "Darcy"} · {m.time}
              </div>
              <div style={{ fontFamily: T.sans, fontSize: 13, color: T.ink2, lineHeight: 1.6, whiteSpace: "pre-line" }}>{m.text}</div>
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: T.surfaceRaised, border: `1px solid ${T.borderMed}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: T.sans, fontSize: 11, fontWeight: 600, color: T.ok }}>A</div>
            <div style={{ fontFamily: T.sans, fontSize: 12, color: T.ink4 }}>Analysing…</div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ padding: "12px 24px", borderTop: `1px solid ${T.border}`, display: "flex", gap: 10 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send(input)}
          placeholder="Ask about Jamie's data, draft a directive, navigate to a section…"
          style={{ flex: 1, background: T.surfaceRaised, border: `1px solid ${T.borderMed}`, padding: "9px 14px", fontFamily: T.sans, fontSize: 13, color: T.ink, borderRadius: 8, outline: "none" }}
        />
        <button onClick={() => send(input)} style={{ fontFamily: T.sans, fontSize: 13, fontWeight: 600, border: "none", background: T.ok, color: T.bg, padding: "9px 20px", cursor: "pointer", borderRadius: 8 }}>
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
      due: "by Tue 21 Apr",
      cta: "Confirm fasting protocol",
      link: { label: "Medical roadmap", href: "/coach/medical" },
      color: T.warn,
      detail: "Jamie must fast from 20:30 Tue. Confirm he has the fasting protocol in his calendar and that the clinic has his prep sheet.",
    },
    {
      id: "drafts",
      urgency: "high",
      label: `${pendingDrafts} drafts awaiting your countersignature`,
      sub: "Autonomic flag · glucose excursion · ApoB analysis",
      due: "by today",
      cta: "Review drafts",
      link: { label: "Compliance", href: "/coach/compliance" },
      color: T.warn,
      detail: "3 drafts ready: hold-intensity corrector, caffeine-sleep insight, overnight glucose flag. All need your review before they reach Jamie.",
    },
    {
      id: "corrector",
      urgency: "active",
      label: activeCorrectors[0]?.recommendation ?? "Hold-intensity corrector active",
      sub: "Issued 17 Apr · day 3 · monitoring HRV recovery",
      due: "ongoing",
      cta: "Check overnight data",
      link: { label: "Trends", href: "/coach/trends" },
      color: T.accent,
      detail: "HRV stable at 41 ms — no further decline overnight. RHR still +4 bpm. Maintain hold through Wednesday, reassess post-DEXA retest.",
    },
    {
      id: "review",
      urgency: "upcoming",
      label: "Quarterly protocol review",
      sub: "Tue 29 Apr · 9 days · in person · 60 min",
      due: "by Mon 28 Apr",
      cta: "Prepare agenda",
      link: { label: "Prepare review ↓", href: "#quarterly" },
      color: T.ok,
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
    <div style={{ background: T.surface, borderRadius: 12 }}>
      {/* Head */}
      <div style={{ padding: "16px 24px", borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <span style={{ fontFamily: T.sans, fontSize: 14, fontWeight: 600, color: T.ink }}>Today</span>
          <span style={{ fontFamily: T.mono, fontSize: 12, color: T.ink3, marginLeft: 10 }}>{DATA.user.today}</span>
        </div>
        <span style={{ fontFamily: T.sans, fontSize: 12, color: T.ink3 }}>
          Q2 2026 · Week 3 of 13
        </span>
      </div>

      {/* Next required actions */}
      <div style={{ padding: "20px 24px", borderBottom: `1px solid ${T.border}` }}>
        <div style={{ fontFamily: T.sans, fontSize: 12, color: T.ink4, marginBottom: 14, fontWeight: 500 }}>
          What needs to happen today
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {NEXT_ACTIONS.map(action => {
            const done = actionsDone.includes(action.id)
            const isExpanded = expandedAction === action.id
            return (
              <div key={action.id} style={{ borderRadius: 8, border: `1px solid ${done ? T.border : action.urgency === "critical" ? T.warnMuted : T.border}`, background: done ? "transparent" : action.urgency === "critical" ? T.warnSubtle : "transparent", overflow: "hidden" }}>
                <div style={{ display: "flex", alignItems: "stretch", gap: 0 }}>
                  <div style={{ width: 3, background: done ? T.border : action.color, flexShrink: 0 }} />
                  <div style={{ flex: 1, padding: "11px 16px", display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: T.sans, fontSize: 13, color: done ? T.ink3 : T.ink, marginBottom: 1, textDecoration: done ? "line-through" : "none", fontWeight: 500 }}>{action.label}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontFamily: T.sans, fontSize: 12, color: T.ink4 }}>{action.sub}</span>
                        <span style={{ fontFamily: T.mono, fontSize: 11, color: action.due === "by today" ? T.warn : T.ink4, background: T.surfaceRaised, padding: "1px 7px", borderRadius: 10 }}>{action.due}</span>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                      <button onClick={() => action.link.href.startsWith("#") ? undefined : router.push(action.link.href)} style={{ fontFamily: T.sans, fontSize: 12, color: T.ink3, background: "transparent", border: "none", cursor: "pointer", padding: "4px 0" }}>
                        {action.link.label} →
                      </button>
                      <button onClick={() => setExpandedAction(isExpanded ? null : action.id)} style={{ fontFamily: T.sans, fontSize: 12, color: T.ink4, background: "transparent", border: "none", cursor: "pointer", padding: "4px" }}>
                        {isExpanded ? "▲" : "▼"}
                      </button>
                      {!done ? (
                        <button
                          onClick={() => setActionsDone(p => [...p, action.id])}
                          style={{ fontFamily: T.sans, fontSize: 12, border: `1px solid ${action.color}`, color: action.color, padding: "5px 12px", background: "transparent", cursor: "pointer", borderRadius: 6, fontWeight: 500 }}
                        >
                          {action.cta}
                        </button>
                      ) : (
                        <span style={{ fontFamily: T.sans, fontSize: 12, color: T.ok, fontWeight: 500 }}>✓ Done</span>
                      )}
                    </div>
                  </div>
                </div>
                {isExpanded && (
                  <div style={{ padding: "10px 16px 12px 19px", borderTop: `1px solid ${T.border}`, fontFamily: T.sans, fontSize: 13, color: T.ink2, lineHeight: 1.6 }}>
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
        <div style={{ padding: "18px 24px", borderRight: `1px solid ${T.border}` }}>
          <div style={{ fontFamily: T.sans, fontSize: 12, color: T.ink4, marginBottom: 14, fontWeight: 500 }}>
            Where you are · Q2 2026
          </div>
          <div style={{ display: "flex", gap: 0, alignItems: "flex-start", marginBottom: 12 }}>
            {phases.map((ph, i) => {
              const color = ph.done ? T.ok : ph.upcoming ? T.warn : T.border
              return (
                <div key={ph.label} style={{ display: "flex", alignItems: "flex-start", flex: 1 }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
                    <div style={{ width: 16, height: 16, borderRadius: "50%", background: ph.done ? T.ok : T.bg, border: `2px solid ${color}`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 4 }}>
                      {ph.done && <span style={{ color: T.bg, fontSize: 7 }}>✓</span>}
                      {ph.upcoming && !ph.done && <span style={{ width: 5, height: 5, borderRadius: "50%", background: T.warn, display: "block" }} />}
                    </div>
                    {ph.upcoming && (
                      <div style={{ fontFamily: T.sans, fontSize: 9, color: T.warn, marginBottom: 1 }}>▲ now</div>
                    )}
                    <div style={{ fontFamily: T.sans, fontSize: 9, color: ph.upcoming ? T.warn : ph.done ? T.ok : T.ink4, textAlign: "center", lineHeight: 1.3 }}>
                      {ph.label.split(" ").slice(0, 2).join(" ")}
                    </div>
                    <div style={{ fontFamily: T.mono, fontSize: 9, color: T.ink4, textAlign: "center" }}>{ph.date.slice(0, 6)}</div>
                  </div>
                  {i < phases.length - 1 && <div style={{ height: 1, flex: "0 0 6px", background: T.borderMed, marginTop: 8 }} />}
                </div>
              )
            })}
          </div>
          {nextAfterUpcoming && (
            <div style={{ borderLeft: `2px solid ${T.borderMed}`, paddingLeft: 10 }}>
              <div style={{ fontFamily: T.sans, fontSize: 11, color: T.ink4, marginBottom: 2 }}>Next milestone after remeasurement</div>
              <div style={{ fontFamily: T.sans, fontSize: 12, color: T.ink2 }}>{nextAfterUpcoming.label} · {nextAfterUpcoming.date}</div>
            </div>
          )}
        </div>
        <div style={{ padding: "18px 24px" }}>
          <div style={{ fontFamily: T.sans, fontSize: 12, color: T.ink4, marginBottom: 12, fontWeight: 500 }}>System status</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {SYSTEM_STATUS.map(item => (
              <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontFamily: T.mono, fontSize: 10, color: item.status === "ok" ? T.ok : T.warn }}>
                  {item.status === "ok" ? "⬤" : "◉"}
                </span>
                <span style={{ fontFamily: T.sans, fontSize: 13, color: T.ink2, flex: 1 }}>{item.label}</span>
                <span style={{ fontFamily: T.mono, fontSize: 11, color: T.ink4 }}>{item.note}</span>
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

const ITEM_DUE: Record<string, string> = {
  cp1: "by Fri 25 Apr",
  cp3: "by Tue 29 Apr",
  cp4: "by Thu 24 Apr",
  cd2: "by today",
  cd4: "by Wed 23 Apr",
  jcp1: "Wed 22 Apr",
  jcp3: "by 02 Jul",
}

function JTBDWithActions() {
  const router = useRouter()
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

  const TASK_ACTIONS: Record<string, { label: string; msg: string; color: string; href?: string }> = {
    cp1: { label: "Generate draft",    msg: "Protocol adjustment draft created — review in agent",       color: T.ok },
    cp2: { label: "View adherence",    msg: "Fibre log: 6/7 days this week · 86% — below 89% target",   color: T.warn, href: "/coach/compliance" },
    cp3: { label: "Generate draft",    msg: "Pre-quarter taper draft queued in agent inbox",              color: T.ok },
    cp4: { label: "Schedule review",   msg: "DEXA review meeting added — Thu 24 Apr 10:00",              color: T.ok, href: "/coach/medical" },
    cd1: { label: "Open inbox",        msg: "3 flags from overnight analysis — opening agent",            color: T.warn },
    cd2: { label: "Open drafts",       msg: "3 drafts awaiting countersignature",                        color: T.warn, href: "/coach/compliance" },
    cd3: { label: "Publish directive", msg: "Morning directive pushed to Jamie's dashboard ✓",           color: T.ok },
    cd4: { label: "Log notes",         msg: "Call notes form opened — Wed 15:00 session",                color: T.ok },
    jcp1: { label: "Push reminder",   msg: "Fasting reminder sent to Jamie — DEXA 22 Apr 08:30",        color: T.ok },
    jcp2: { label: "View log",        msg: "Jamie's fibre log: 6/7 days this week",                     color: T.ink2, href: "/coach/compliance" },
    jcp3: { label: "Update target",   msg: "ApoB target updated on Jamie's dashboard",                  color: T.ok },
    jcp4: { label: "View minutes",    msg: "Zone-2: 82 of 160 min this week · 3 sessions left",         color: T.warn, href: "/coach/trends" },
    jcd1: { label: "View check-in",   msg: "Jamie's check-in: 14-day streak · last submitted 06:42",    color: T.ok, href: "/coach/compliance" },
    jcd2: { label: "Send reminder",   msg: "Evening fibre log reminder scheduled for 20:00",            color: T.ok },
    jcd3: { label: "View log",        msg: "Breathing protocol logged 2× this week",                    color: T.ok, href: "/coach/compliance" },
    jcd4: { label: "Push directive",  msg: "Today's directive pushed to Jamie · 06:14 ✓",              color: T.ok },
  }

  function renderBucket(title: string, items: { id: string; done: boolean; text: string }[], color: string) {
    const done = items.filter(i => checked[i.id]).length
    return (
      <div style={{ padding: "14px 20px", borderTop: `1px solid ${T.border}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <div style={{ fontFamily: T.sans, fontSize: 12, color, fontWeight: 600 }}>{title}</div>
          <div style={{ fontFamily: T.mono, fontSize: 12, color: T.ink3 }}>{done}/{items.length}</div>
        </div>
        <div style={{ height: 2, background: T.border, marginBottom: 12, borderRadius: 1 }}>
          <div style={{ height: "100%", width: `${(done / items.length) * 100}%`, background: color, borderRadius: 1 }} />
        </div>
        {items.map(item => {
          const action = TASK_ACTIONS[item.id]
          const due = ITEM_DUE[item.id]
          return (
            <div key={item.id} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 10 }}>
              <input type="checkbox" checked={checked[item.id] ?? false} onChange={() => setChecked(p => ({ ...p, [item.id]: !p[item.id] }))} style={{ accentColor: color, flexShrink: 0, marginTop: 2 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: T.sans, fontSize: 13, color: checked[item.id] ? T.ink3 : T.ink, lineHeight: 1.4, textDecoration: checked[item.id] ? "line-through" : "none" }}>{item.text}</div>
                {due && !checked[item.id] && (
                  <div style={{ fontFamily: T.mono, fontSize: 11, color: due === "by today" ? T.warn : T.ink4, marginTop: 2 }}>{due}</div>
                )}
              </div>
              {action && (
                <button
                  onClick={() => { toast(action.msg); if (action.href) setTimeout(() => router.push(action.href!), 400) }}
                  style={{ fontFamily: T.sans, fontSize: 11, border: `1px solid ${action.color}`, color: action.color, padding: "3px 10px", background: "transparent", cursor: "pointer", flexShrink: 0, borderRadius: 6 }}
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
    <div style={{ background: T.surface, borderRadius: 12, position: "relative" }}>
      <div onClick={() => setCollapsed(c => !c)} style={{ padding: "16px 24px", borderBottom: collapsed ? undefined : `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontFamily: T.sans, fontSize: 14, fontWeight: 600, color: T.ink }}>Programme checklist</span>
          {collapsed && (
            <span style={{ fontFamily: T.sans, fontSize: 12, color: T.ink3 }}>
              {Object.values(checked).filter(Boolean).length}/{Object.values(checked).length} complete
            </span>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {!collapsed && <span style={{ fontFamily: T.sans, fontSize: 12, color: T.ink3 }}>Due dates · deep links to relevant pages</span>}
          <span style={{ fontFamily: T.sans, fontSize: 12, color: T.ink3 }}>{collapsed ? "▼" : "▲"}</span>
        </div>
      </div>

      {!collapsed && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
            <div style={{ borderRight: `1px solid ${T.border}` }}>
              {renderBucket("Your tasks · Programme", command.jtbd.coachProgramme, T.ok)}
              {renderBucket("Your tasks · Today", command.jtbd.coachDaily, T.ok)}
            </div>
            <div>
              {renderBucket("Jamie · Programme goals", command.jtbd.clientProgramme, T.accent)}
              {renderBucket("Jamie · Daily habits", command.jtbd.clientDaily, T.accent)}
            </div>
          </div>

          <div style={{ position: "fixed", bottom: 24, right: 24, display: "flex", flexDirection: "column", gap: 8, zIndex: 100 }}>
            {toasts.map(t => (
              <div key={t.id} style={{ background: T.surfaceRaised, border: `1px solid ${T.ok}`, padding: "10px 16px", fontFamily: T.sans, fontSize: 13, color: T.ink2, maxWidth: 340, boxShadow: "0 4px 20px rgba(0,0,0,0.4)", borderRadius: 8 }}>
                <span style={{ color: T.ok, marginRight: 8 }}>✓</span>{t.text}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ─── Quarterly review questionnaire ──────────────────────────────────────────

const REVIEW_STEPS = [
  {
    id: "worked",
    title: "What worked well this quarter?",
    placeholder: "e.g. Sleep protocol, ApoB trajectory, fibre adherence…",
    hint: "Focus on outcomes that moved in the right direction and the levers behind them.",
  },
  {
    id: "missed",
    title: "What didn't land or was missed?",
    placeholder: "e.g. HRV floor target, zone-2 volume, autonomic resilience…",
    hint: "Be specific — what was the gap and what contributed to it?",
  },
  {
    id: "targets",
    title: "Proposed targets for next quarter",
    placeholder: "e.g. ApoB ≤ 70 mg/dL, HRV floor 48 ms, zone-2 ≥ 160 min/week…",
    hint: "Numeric where possible. Consider what's achievable given Jamie's schedule.",
  },
  {
    id: "protocol",
    title: "Protocol changes to carry forward",
    placeholder: "e.g. Pre-quarter taper for July board cycle, fibrinogen retest, statin review…",
    hint: "What adjustments should be formalised as directives or correctors?",
  },
]

function PrepareQuarterlyReviewModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [done, setDone] = useState(false)

  const current = REVIEW_STEPS[step]
  const isLast = step === REVIEW_STEPS.length - 1

  function next() {
    if (isLast) { setDone(true) }
    else setStep(s => s + 1)
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}
      onClick={onClose}>
      <div style={{ background: T.surface, border: `1px solid ${T.borderMed}`, padding: "32px 36px", maxWidth: 560, width: "90%", borderRadius: 14, boxShadow: "0 8px 48px rgba(0,0,0,0.5)" }}
        onClick={e => e.stopPropagation()}>

        {done ? (
          <>
            <div style={{ fontFamily: T.sans, fontSize: 11, fontWeight: 600, color: T.ok, marginBottom: 16 }}>Quarterly review prepared</div>
            <p style={{ fontFamily: T.serif, fontSize: 16, fontWeight: 300, lineHeight: 1.7, color: T.ink, margin: "0 0 20px" }}>
              Your review notes have been drafted and queued for the Tue 29 Apr session.
              Jamie will not see these until you choose to share the output.
            </p>
            <div style={{ fontFamily: T.sans, fontSize: 12, color: T.ink3, marginBottom: 24 }}>
              {Object.keys(answers).length} of {REVIEW_STEPS.length} sections completed · saved as draft
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={onClose} style={{ fontFamily: T.sans, fontSize: 13, border: "none", background: T.ok, color: T.bg, padding: "9px 20px", cursor: "pointer", borderRadius: 8, fontWeight: 500 }}>
                Done
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Progress */}
            <div style={{ display: "flex", gap: 4, marginBottom: 24 }}>
              {REVIEW_STEPS.map((s, i) => (
                <div key={s.id} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= step ? T.ok : T.border }} />
              ))}
            </div>

            <div style={{ fontFamily: T.sans, fontSize: 11, color: T.ink4, marginBottom: 8 }}>
              Step {step + 1} of {REVIEW_STEPS.length} · Prepare quarterly review · Q2 2026
            </div>
            <div style={{ fontFamily: T.sans, fontSize: 15, fontWeight: 600, color: T.ink, marginBottom: 6 }}>
              {current.title}
            </div>
            <div style={{ fontFamily: T.sans, fontSize: 12, color: T.ink3, marginBottom: 16, lineHeight: 1.5 }}>
              {current.hint}
            </div>
            <textarea
              value={answers[current.id] ?? ""}
              onChange={e => setAnswers(a => ({ ...a, [current.id]: e.target.value }))}
              placeholder={current.placeholder}
              rows={4}
              style={{
                width: "100%", fontFamily: T.sans, fontSize: 13, color: T.ink, lineHeight: 1.6,
                background: T.surfaceRaised, border: `1px solid ${T.borderMed}`, padding: "10px 14px",
                borderRadius: 8, outline: "none", resize: "vertical", boxSizing: "border-box",
              }}
            />
            <div style={{ display: "flex", gap: 10, justifyContent: "space-between", marginTop: 20 }}>
              <button
                onClick={onClose}
                style={{ fontFamily: T.sans, fontSize: 13, border: `1px solid ${T.borderMed}`, padding: "8px 16px", color: T.ink3, background: "transparent", cursor: "pointer", borderRadius: 6 }}
              >
                Save and close
              </button>
              <div style={{ display: "flex", gap: 10 }}>
                {step > 0 && (
                  <button onClick={() => setStep(s => s - 1)} style={{ fontFamily: T.sans, fontSize: 13, border: `1px solid ${T.borderMed}`, padding: "8px 16px", color: T.ink2, background: "transparent", cursor: "pointer", borderRadius: 6 }}>
                    Back
                  </button>
                )}
                <button onClick={next} style={{ fontFamily: T.sans, fontSize: 13, fontWeight: 600, border: "none", background: T.ok, color: T.bg, padding: "8px 20px", cursor: "pointer", borderRadius: 6 }}>
                  {isLast ? "Complete review" : "Next →"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ─── Quarterly history ────────────────────────────────────────────────────────

function QuarterlyHistory() {
  const [open, setOpen] = useState<string | null>(null)
  const [panelCollapsed, setPanelCollapsed] = useState(true)
  const [showReviewModal, setShowReviewModal] = useState(false)

  return (
    <div id="quarterly" style={{ background: T.surface, borderRadius: 12 }}>
      <div onClick={() => setPanelCollapsed(c => !c)} style={{ padding: "16px 24px", borderBottom: panelCollapsed ? undefined : `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
        <span style={{ fontFamily: T.sans, fontSize: 14, fontWeight: 600, color: T.ink }}>Quarterly history</span>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {!panelCollapsed && (
            <button
              onClick={e => { e.stopPropagation(); setShowReviewModal(true) }}
              style={{ fontFamily: T.sans, fontSize: 12, fontWeight: 600, border: "none", background: T.ok, color: T.bg, padding: "6px 14px", cursor: "pointer", borderRadius: 6 }}
            >
              Prepare quarterly review →
            </button>
          )}
          <span style={{ fontFamily: T.sans, fontSize: 12, color: T.ink3 }}>{panelCollapsed ? "▼" : "▲"}</span>
        </div>
      </div>

      {!panelCollapsed && (
        <>
          {/* Active quarter with CTA */}
          <div style={{ padding: "16px 24px", borderBottom: `1px solid ${T.border}`, background: T.okSubtle }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: T.ok, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 4 }}>
                  <span style={{ fontFamily: T.sans, fontSize: 14, fontWeight: 600, color: T.ink }}>Q2 2026</span>
                  <span style={{ fontFamily: T.sans, fontSize: 12, color: T.ok }}>Active · day 20</span>
                </div>
                <div style={{ fontFamily: T.sans, fontSize: 13, color: T.ink3, lineHeight: 1.4, maxWidth: 500 }}>
                  ApoB trajectory positive. Autonomic flag active since 17 Apr. DEXA retest due 22 Apr. Quarterly review scheduled Tue 29 Apr.
                </div>
              </div>
              <button
                onClick={() => setShowReviewModal(true)}
                style={{ fontFamily: T.sans, fontSize: 12, fontWeight: 500, border: `1px solid ${T.ok}`, color: T.ok, background: "transparent", padding: "7px 14px", cursor: "pointer", borderRadius: 8, flexShrink: 0 }}
              >
                Prepare review →
              </button>
            </div>
          </div>

          {/* Previous quarters */}
          {QUARTER_HISTORY.filter(q => q.status !== "active").map((q, i) => (
            <div key={q.id} style={{ borderTop: `1px solid ${T.border}` }}>
              <div onClick={() => setOpen(open === q.id ? null : q.id)} style={{ padding: "14px 24px", display: "flex", alignItems: "center", gap: 16, cursor: "pointer" }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: q.status === "closed" ? T.ink3 : T.border, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 2 }}>
                    <span style={{ fontFamily: T.sans, fontSize: 14, fontWeight: 600, color: T.ink }}>{q.label}</span>
                    <span style={{ fontFamily: T.sans, fontSize: 12, color: T.ink4 }}>
                      {q.status === "closed" ? `Closed ${q.closedOn}` : `Archived ${q.closedOn}`}
                    </span>
                  </div>
                  <div style={{ fontFamily: T.sans, fontSize: 13, color: T.ink3, lineHeight: 1.4 }}>{q.summary}</div>
                </div>
                <a href="#" onClick={e => e.preventDefault()} style={{ fontFamily: T.sans, fontSize: 12, color: T.accent, border: `1px solid ${T.accent}`, padding: "4px 10px", flexShrink: 0, borderRadius: 6, textDecoration: "none" }}>
                  View report →
                </a>
                <span style={{ fontFamily: T.sans, fontSize: 12, color: T.ink3 }}>{open === q.id ? "▲" : "▼"}</span>
              </div>
              {open === q.id && q.highlights && (
                <div style={{ padding: "0 24px 16px 50px" }}>
                  {q.highlights.map(h => (
                    <div key={h} style={{ fontFamily: T.sans, fontSize: 13, color: h.includes("✓") ? T.ok : h.includes("↑") || h.includes("missed") || h.includes("watch") || h.includes("↗") ? T.warn : T.ink2, marginBottom: 4 }}>
                      · {h}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </>
      )}

      {showReviewModal && <PrepareQuarterlyReviewModal onClose={() => setShowReviewModal(false)} />}
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
    <div style={{ padding: "48px 48px 80px", maxWidth: 1200, margin: "0 auto", display: "flex", flexDirection: "column", gap: 32 }}>

      {/* Page header */}
      <div>
        <div style={{ fontFamily: T.sans, fontSize: 12, color: T.ok, marginBottom: 8, fontWeight: 500 }}>
          Coach command centre · Darcy O&apos;Sullivan
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <h1 style={{ fontFamily: T.serif, fontSize: 28, fontWeight: 400, color: T.ink, margin: 0, letterSpacing: "-0.02em" }}>
            Jamie Garis · Q2 2026 programme
          </h1>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={() => setShowExportModal(true)}
              style={{ fontFamily: T.sans, fontSize: 13, border: `1px solid ${T.borderMed}`, padding: "7px 16px", color: exportDone ? T.ok : T.ink2, background: "transparent", cursor: "pointer", borderRadius: 8 }}>
              {exportDone ? "✓ Exported" : "Export PDF"}
            </button>
            <button
              onClick={() => setShowReportModal(true)}
              style={{ fontFamily: T.sans, fontSize: 13, fontWeight: 600, border: "none", padding: "7px 16px", background: T.ok, color: T.bg, cursor: "pointer", borderRadius: 8 }}>
              {reportDone ? "✓ Report queued" : "Generate quarterly report"}
            </button>
          </div>
        </div>
      </div>

      <SinceLastVisit />
      <DecisionLayer />
      <WorkoutRecommendationCard />
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
              <p style={{ margin: "12px 0 0", fontSize: 11, color: T.ink4 }}>Suitable for sharing with referring physicians or for your own records.</p>
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
                <li>Locked as a permanent link in quarterly history</li>
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
