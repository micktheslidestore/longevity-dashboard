"use client"

import { useState } from "react"
import { DATA } from "@/data/james"
import { T, LifecycleChip } from "@/components/Primitives"

// ─── Outcomes data ────────────────────────────────────────────────────────────

type OutcomeStatus = "effective" | "monitoring" | "partial" | "pending"

interface Outcome {
  id: string
  protocol: string
  issuedDate: string
  daysAgo: number
  before: string
  after: string | null
  status: OutcomeStatus
  verdict: string
  note: string
}

const OUTCOMES: Outcome[] = [
  {
    id: "caffeine",
    protocol: "Caffeine curfew after 14:00",
    issuedDate: "22 Mar 2026",
    daysAgo: 29,
    before: "Deep sleep avg 41 min · HRV 48 ms",
    after:  "Deep sleep avg 61 min · HRV 52 ms",
    status: "effective",
    verdict: "+20 min deep sleep · +4 ms HRV avg",
    note: "The strongest protocol result this quarter. Sustained over 4 weeks. Jamie has maintained 100% adherence for 28 days. This change is worth locking permanently.",
  },
  {
    id: "hold-intensity",
    protocol: "Hold-intensity corrector",
    issuedDate: "17 Apr 2026",
    daysAgo: 3,
    before: "HRV 52 ms (baseline) · RHR 48 bpm",
    after: null,
    status: "monitoring",
    verdict: "Day 3 of hold — HRV stable at 41 ms, not yet recovering",
    note: "Historical pattern match: February setback took 8 days to resolve. No further decline overnight — the hold is preventing worsening. Expect recovery to begin day 5–6 if load is maintained.",
  },
  {
    id: "zone2-increase",
    protocol: "Zone-2 volume increase to 160 min/week",
    issuedDate: "01 Jan 2026",
    daysAgo: 110,
    before: "VO₂max est. 42 mL/kg/min · ApoB 99 mg/dL",
    after:  "VO₂max est. 44 mL/kg/min · ApoB 84 mg/dL",
    status: "partial",
    verdict: "+2 mL/kg/min VO₂max · −15 mg/dL ApoB (fibre is the primary ApoB lever)",
    note: "Zone-2 correlates r=+0.12 with ApoB delta — useful but not the main driver. The primary benefit has been cardiovascular adaptation and sleep architecture. Volume adherence averaging 68% of target across the quarter.",
  },
  {
    id: "fibre",
    protocol: "Daily fibre logging protocol",
    issuedDate: "15 Nov 2025",
    daysAgo: 156,
    before: "ApoB 108 mg/dL · Fibre adherence unmeasured",
    after:  "ApoB 84 mg/dL · Fibre adherence 86%",
    status: "effective",
    verdict: "−24 mg/dL ApoB over 5 quarters · r=+0.74 correlation",
    note: "This is the single most impactful protocol in Jamie's programme. ApoB drops ~7 mg/dL per quarter when fibre adherence exceeds 89%. Current 86% adherence is 3 points below the threshold — close but not maximising the effect.",
  },
]

const OUTCOME_STATUS_STYLE: Record<OutcomeStatus, { label: string; color: string; bg: string }> = {
  effective:  { label: "Effective",  color: T.ok,    bg: T.okSubtle },
  monitoring: { label: "Monitoring", color: T.warn,  bg: T.warnSubtle },
  partial:    { label: "Partial",    color: "#9B8FA9", bg: "rgba(155,143,169,0.08)" },
  pending:    { label: "Pending",    color: T.ink3,  bg: "rgba(125,121,114,0.08)" },
}

function OutcomesSection() {
  const [selected, setSelected] = useState<string | null>(null)

  return (
    <div style={{ background: T.surface, borderRadius: 12 }}>
      {/* Head */}
      <div style={{ padding: "16px 24px", borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: T.sans, fontSize: 14, fontWeight: 600, color: T.ink }}>Outcomes · did it work?</span>
        <span style={{ fontFamily: T.sans, fontSize: 12, color: T.ink3 }}>
          {OUTCOMES.filter(o => o.status === "effective").length} effective · {OUTCOMES.filter(o => o.status === "monitoring").length} monitoring · {OUTCOMES.filter(o => o.status === "partial").length} partial
        </span>
      </div>

      <div style={{ padding: "6px 0" }}>
        {OUTCOMES.map((outcome, i) => {
          const style = OUTCOME_STATUS_STYLE[outcome.status]
          const isSelected = selected === outcome.id
          return (
            <div key={outcome.id} style={{ borderTop: i > 0 ? `1px solid ${T.border}` : undefined }}>
              <div
                onClick={() => setSelected(isSelected ? null : outcome.id)}
                style={{ padding: "18px 24px", cursor: "pointer", display: "flex", alignItems: "flex-start", gap: 20 }}
              >
                {/* Status chip */}
                <div style={{ flexShrink: 0, paddingTop: 2 }}>
                  <span style={{ fontFamily: T.sans, fontSize: 11, color: style.color, background: style.bg, padding: "3px 10px", borderRadius: 20, fontWeight: 500, display: "inline-block" }}>
                    {style.label}
                  </span>
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: T.sans, fontSize: 14, fontWeight: 500, color: T.ink, marginBottom: 4 }}>{outcome.protocol}</div>
                  <div style={{ fontFamily: T.sans, fontSize: 12, color: T.ink4, marginBottom: 10 }}>Issued {outcome.issuedDate} · {outcome.daysAgo} days ago</div>

                  {/* Before / After */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 12, alignItems: "center", marginBottom: 8 }}>
                    <div>
                      <div style={{ fontFamily: T.sans, fontSize: 11, color: T.ink4, marginBottom: 4, fontWeight: 500 }}>Before</div>
                      <div style={{ fontFamily: T.sans, fontSize: 13, color: T.ink3, lineHeight: 1.4 }}>{outcome.before}</div>
                    </div>
                    <div style={{ fontFamily: T.sans, fontSize: 16, color: T.border }}>→</div>
                    <div>
                      <div style={{ fontFamily: T.sans, fontSize: 11, color: T.ink4, marginBottom: 4, fontWeight: 500 }}>After</div>
                      <div style={{ fontFamily: T.sans, fontSize: 13, color: outcome.after ? T.ink2 : T.ink4, lineHeight: 1.4 }}>{outcome.after ?? "Still measuring…"}</div>
                    </div>
                  </div>

                  <div style={{ fontFamily: T.sans, fontSize: 13, color: style.color, fontWeight: 500 }}>{outcome.verdict}</div>
                </div>

                <div style={{ fontFamily: T.sans, fontSize: 12, color: T.ink4, flexShrink: 0 }}>{isSelected ? "▲" : "▼"}</div>
              </div>

              {isSelected && (
                <div style={{ padding: "0 24px 20px 88px", borderTop: `1px solid ${T.border}` }}>
                  <p style={{ fontFamily: T.sans, fontSize: 13, color: T.ink2, lineHeight: 1.7, margin: "16px 0 0", maxWidth: 560 }}>{outcome.note}</p>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Protocol adherence data ──────────────────────────────────────────────────

const PROTOCOLS = [
  {
    id: "zone2",
    label: "Zone-2 training",
    target: "160 min/week",
    thisWeek: "82 min (51%)",
    rate: 0.51,
    streak: 3,
    status: "warn" as const,
    note: "Board-cycle week — volume typically 40–50% of target. Historical pattern. 3 sessions remaining.",
  },
  {
    id: "sleep",
    label: "Sleep protocol",
    target: "No screens after 21:30",
    thisWeek: "5/7 nights (71%)",
    rate: 0.71,
    streak: 5,
    status: "warn" as const,
    note: "2 non-adherent nights correlate with board prep sessions (Sun and Tue). Sleep onset delayed by ~40 min on both nights.",
  },
  {
    id: "checkin",
    label: "Daily check-in",
    target: "Submitted each morning",
    thisWeek: "7/7 (100%)",
    rate: 1.0,
    streak: 14,
    status: "ok" as const,
    note: "14-day streak active. Last submitted 06:42 today. Strong habit — longest streak this quarter.",
  },
  {
    id: "supps",
    label: "Supplement stack",
    target: "Omega-3 · berberine · psyllium",
    thisWeek: "6/7 days (86%)",
    rate: 0.86,
    streak: 6,
    status: "ok" as const,
    note: "Missed Sunday — travel day. Psyllium husk most commonly skipped. Consider travel pack.",
  },
  {
    id: "fibre",
    label: "Fibre logging",
    target: "≥89% to maintain ApoB trend",
    thisWeek: "6/7 days (86%)",
    rate: 0.86,
    streak: 6,
    status: "warn" as const,
    note: "3 points below the 89% threshold required for ApoB trajectory. Slight risk to quarterly target. Consider an evening reminder.",
  },
  {
    id: "caffeine",
    label: "Caffeine curfew (14:00)",
    target: "No caffeine after 14:00",
    thisWeek: "7/7 days (100%)",
    rate: 1.0,
    streak: 28,
    status: "ok" as const,
    note: "28-day streak — the strongest protocol habit. Sleep efficiency improvement (+12 min deep sleep avg) correlates with this change. Confirmed effective.",
  },
]

// ─── 30-day compliance grid ───────────────────────────────────────────────────

const DAYS_OF_WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

const THIRTY_DAY_ADHERENCE = [
  null, null, 0.92, 0.88, 0.95, 0.90, 0.72,
  0.85, 0.78, 0.82, 0.90, 0.68, 0.72, 0.65,
  0.82, 0.88, 0.74, 0.70, 0.78, 0.75, 0.71,
  null, null, null, null, null, null, null,
]

function adColor(v: number | null): string {
  if (v === null) return "transparent"
  if (v >= 0.9) return T.ok
  if (v >= 0.75) return `color-mix(in srgb, ${T.ok} 55%, ${T.warn})`
  if (v >= 0.6) return T.warn
  return T.alert
}

// ─── Flags ────────────────────────────────────────────────────────────────────

const FLAGS = [
  {
    id: "zone2-volume",
    label: "Zone-2 volume below target",
    detail: "82/160 min this week (51%). Board-cycle context noted. Action: confirm hold-intensity until DEXA results; resume full volume next week.",
  },
  {
    id: "fibre-adherence",
    label: "Fibre adherence below ApoB threshold",
    detail: "86% vs 89% target. Small gap, but sustained for 3 weeks. ApoB Q3 target at risk if not corrected. Consider pushing an evening reminder.",
  },
  {
    id: "sleep-nights",
    label: "2 non-adherent sleep nights this week",
    detail: "Sun and Tue linked to late board prep sessions. Sleep onset delayed ~40 min. HRV impact visible in overnight data. Not a flag yet — watch next week.",
  },
]

type FlagStatus = "raised" | "triaged" | "resolved"
interface FlagState { status: FlagStatus; action?: string }

function LifecycleTrack({ status }: { status: FlagStatus }) {
  const steps: { key: FlagStatus; label: string }[] = [
    { key: "raised",   label: "Raised" },
    { key: "triaged",  label: "Triaged" },
    { key: "resolved", label: "Resolved" },
  ]
  const idx = steps.findIndex(s => s.key === status)
  const stepColor = (i: number) => i <= idx ? (status === "resolved" ? T.ok : status === "triaged" ? T.ink2 : T.warn) : T.ink4
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
      {steps.map((step, i) => (
        <div key={step.key} style={{ display: "flex", alignItems: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
            <div style={{
              width: 8, height: 8, borderRadius: "50%",
              background: i <= idx ? stepColor(i) : "transparent",
              border: `1.5px solid ${stepColor(i)}`,
            }} />
            <span style={{ fontFamily: T.sans, fontSize: 10, color: stepColor(i), whiteSpace: "nowrap" }}>
              {step.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div style={{
              width: 28, height: 1.5,
              background: i < idx ? stepColor(i) : T.ink4,
              marginBottom: 16,
            }} />
          )}
        </div>
      ))}
    </div>
  )
}

const quarterScore = Math.round(
  PROTOCOLS.reduce((sum, p) => sum + p.rate, 0) / PROTOCOLS.length * 100
)

export default function CoachCompliancePage() {
  const [selectedProtocol, setSelectedProtocol] = useState<string | null>(null)
  const [dismissedFlags, setDismissedFlags] = useState<string[]>([])
  const [flagStates, setFlagStates] = useState<Record<string, FlagState>>(
    () => Object.fromEntries(FLAGS.map(f => [f.id, { status: "raised" as FlagStatus }]))
  )
  const [toast, setToast] = useState<string | null>(null)

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  function triageFlag(flagId: string, action: string) {
    setFlagStates(prev => ({ ...prev, [flagId]: { status: "triaged", action } }))
    const msgs: Record<string, string> = {
      Act: "Corrector created — Jamie will see it after Darcy signs",
      "Notify Jamie": "Message sent to Jamie's feed",
      Watch: "Re-evaluating in 24 h — flag marked as watched",
    }
    showToast(msgs[action] ?? `Flag triaged via ${action}`)
  }

  function resolveFlag(flagId: string) {
    setFlagStates(prev => ({ ...prev, [flagId]: { ...prev[flagId], status: "resolved" } }))
    showToast("Flag resolved")
  }

  const activeFlags = FLAGS.filter(f => !dismissedFlags.includes(f.id))
  const raisedCount = activeFlags.filter(f => flagStates[f.id]?.status === "raised").length

  const barColor = (status: FlagStatus) =>
    status === "resolved" ? T.ok : status === "triaged" ? T.ink2 : T.warn

  return (
    <div style={{ padding: "48px 48px 80px", maxWidth: 1200, margin: "0 auto", display: "flex", flexDirection: "column", gap: 56 }}>

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", bottom: 28, right: 28, zIndex: 100,
          background: T.surfaceRaised, border: `1px solid ${T.borderMed}`,
          padding: "10px 16px", borderRadius: 10,
          fontFamily: T.sans, fontSize: 13, color: T.ink2,
          boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
        }}>
          {toast}
        </div>
      )}

      {/* Header */}
      <div>
        <div style={{ fontFamily: T.sans, fontSize: 12, color: T.ok, marginBottom: 8, fontWeight: 500 }}>
          Compliance monitoring · Darcy O&apos;Sullivan
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <h1 style={{ fontFamily: T.serif, fontSize: 28, fontWeight: 400, color: T.ink, margin: 0, letterSpacing: "-0.02em" }}>
            Jamie Garis · protocol adherence
          </h1>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: T.sans, fontSize: 12, color: T.ink3, marginBottom: 4, fontWeight: 500 }}>This week (7-day)</div>
            <div style={{ fontFamily: T.mono, fontSize: 32, letterSpacing: "-0.04em", color: quarterScore >= 85 ? T.ok : quarterScore >= 70 ? T.warn : T.alert, lineHeight: 1, fontWeight: 300 }}>
              {quarterScore}%
            </div>
          </div>
        </div>
      </div>

      {/* Outcomes — lead with this */}
      <OutcomesSection />

      {/* Flags */}
      {activeFlags.length > 0 && (
        <div style={{ background: T.surface, borderRadius: 12 }}>
          <div style={{ padding: "16px 24px", borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontFamily: T.sans, fontSize: 14, fontWeight: 600, color: T.ink }}>Attention required</span>
            <span style={{ fontFamily: T.sans, fontSize: 12, color: T.warn, fontWeight: 500 }}>{raisedCount} open</span>
          </div>
          {activeFlags.map((flag, i) => {
            const fs = flagStates[flag.id] ?? { status: "raised" as FlagStatus }
            const isRaised = fs.status === "raised"
            const isTriaged = fs.status === "triaged"
            const bc = barColor(fs.status)
            return (
              <div key={flag.id} style={{ display: "flex", alignItems: "stretch", borderTop: i > 0 ? `1px solid ${T.border}` : `1px solid ${T.border}` }}>
                {/* Left color bar */}
                <div style={{ width: 3, background: bc, flexShrink: 0 }} />
                <div style={{ flex: 1, padding: "16px 20px 16px 20px" }}>
                  {/* Top row: label + lifecycle chip */}
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                    <div style={{ fontFamily: T.sans, fontSize: 14, fontWeight: 500, color: T.ink }}>{flag.label}</div>
                    <LifecycleChip status={fs.status} />
                  </div>
                  <div style={{ fontFamily: T.sans, fontSize: 13, color: T.ink3, lineHeight: 1.5, marginBottom: 14 }}>{flag.detail}</div>

                  {/* Lifecycle track */}
                  <div style={{ marginBottom: 14 }}>
                    <LifecycleTrack status={fs.status} />
                  </div>

                  {/* Actions */}
                  {isRaised && (
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <button
                        onClick={() => triageFlag(flag.id, "Act")}
                        style={{ fontFamily: T.sans, fontSize: 12, border: `1px solid ${T.warn}`, color: T.warn, padding: "5px 14px", background: "transparent", cursor: "pointer", borderRadius: 6, fontWeight: 500 }}
                      >
                        Act
                      </button>
                      <button
                        onClick={() => triageFlag(flag.id, "Notify Jamie")}
                        style={{ fontFamily: T.sans, fontSize: 12, border: `1px solid ${T.borderMed}`, color: T.ink2, padding: "5px 14px", background: "transparent", cursor: "pointer", borderRadius: 6 }}
                      >
                        Notify Jamie
                      </button>
                      <button
                        onClick={() => triageFlag(flag.id, "Watch")}
                        style={{ fontFamily: T.sans, fontSize: 12, border: `1px solid ${T.borderMed}`, color: T.ink2, padding: "5px 14px", background: "transparent", cursor: "pointer", borderRadius: 6 }}
                      >
                        Watch
                      </button>
                      <div style={{ flex: 1 }} />
                      <button
                        onClick={() => setDismissedFlags(p => [...p, flag.id])}
                        style={{ fontFamily: T.sans, fontSize: 12, border: `1px solid ${T.borderMed}`, color: T.ink4, padding: "5px 12px", background: "transparent", cursor: "pointer", borderRadius: 6 }}
                      >
                        Dismiss
                      </button>
                    </div>
                  )}

                  {isTriaged && (
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <span style={{ fontFamily: T.sans, fontSize: 12, color: T.ink3 }}>
                        Triaged via <strong style={{ color: T.ink2 }}>{fs.action}</strong>
                        {fs.action === "Watch" && (
                          <span style={{ color: T.ink4 }}> · Re-evaluating Fri 24 Apr</span>
                        )}
                      </span>
                      <button
                        onClick={() => resolveFlag(flag.id)}
                        style={{ fontFamily: T.sans, fontSize: 12, border: `1px solid ${T.ok}`, color: T.ok, padding: "5px 14px", background: "transparent", cursor: "pointer", borderRadius: 6, fontWeight: 500 }}
                      >
                        Mark resolved
                      </button>
                    </div>
                  )}

                  {fs.status === "resolved" && (
                    <div style={{ fontFamily: T.sans, fontSize: 12, color: T.ok }}>
                      Resolved · no further action needed
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Protocol adherence grid */}
      <div style={{ background: T.surface, borderRadius: 12 }}>
        <div style={{ padding: "16px 24px", borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontFamily: T.sans, fontSize: 14, fontWeight: 600, color: T.ink }}>Protocol adherence · this week</span>
          <span style={{ fontFamily: T.sans, fontSize: 12, color: T.ink3 }}>Click a protocol for detail</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1, background: T.border }}>
          {PROTOCOLS.map(proto => {
            const selected = selectedProtocol === proto.id
            const statusColor = proto.status === "ok" ? T.ok : T.warn
            return (
              <div
                key={proto.id}
                onClick={() => setSelectedProtocol(selected ? null : proto.id)}
                style={{ background: selected ? T.surfaceRaised : T.surface, padding: "18px 20px", cursor: "pointer", borderLeft: selected ? `3px solid ${statusColor}` : "3px solid transparent" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <div style={{ fontFamily: T.sans, fontSize: 14, fontWeight: 500, color: T.ink }}>{proto.label}</div>
                  <span style={{ fontFamily: T.sans, fontSize: 11, color: statusColor, fontWeight: 500 }}>
                    {proto.status === "ok" ? "⬤ On track" : "◉ Watch"}
                  </span>
                </div>
                {/* Progress bar */}
                <div style={{ height: 3, background: T.border, marginBottom: 8, borderRadius: 1 }}>
                  <div style={{ height: "100%", width: `${proto.rate * 100}%`, background: statusColor, borderRadius: 1 }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontFamily: T.mono, fontSize: 13, color: statusColor, fontWeight: 300 }}>{proto.thisWeek}</span>
                  <span style={{ fontFamily: T.sans, fontSize: 12, color: T.ink4 }}>🔥 {proto.streak}d streak</span>
                </div>
                <div style={{ fontFamily: T.sans, fontSize: 12, color: T.ink4, marginTop: 4 }}>{proto.target}</div>

                {selected && (
                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${T.border}`, fontFamily: T.sans, fontSize: 13, color: T.ink2, lineHeight: 1.6 }}>
                    {proto.note}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* 30-day calendar grid */}
      <div style={{ background: T.surface, borderRadius: 12 }}>
        <div style={{ padding: "16px 24px", borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontFamily: T.sans, fontSize: 14, fontWeight: 600, color: T.ink }}>30-day adherence calendar</span>
          <span style={{ fontFamily: T.sans, fontSize: 12, color: T.ink3 }}>Apr 2026 · composite score per day</span>
        </div>
        <div style={{ padding: "20px 24px" }}>
          {/* Day labels */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 6 }}>
            {DAYS_OF_WEEK.map((d, i) => (
              <div key={i} style={{ fontFamily: T.sans, fontSize: 11, color: T.ink4, textAlign: "center" }}>{d}</div>
            ))}
          </div>
          {/* Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
            {THIRTY_DAY_ADHERENCE.map((v, i) => {
              const dayNum = i - 1
              const date = dayNum >= 0 && dayNum < 30 ? dayNum + 1 : null
              const isToday = date === 20
              return (
                <div
                  key={i}
                  style={{
                    height: 36,
                    borderRadius: 6,
                    background: v !== null ? `color-mix(in srgb, ${adColor(v)} 30%, ${T.surfaceRaised})` : T.surfaceRaised,
                    border: isToday ? `1px solid ${T.accent}` : "1px solid transparent",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 1,
                  }}
                >
                  {date && (
                    <>
                      <div style={{ fontFamily: T.mono, fontSize: 9, color: isToday ? T.accent : T.ink3 }}>{date}</div>
                      {v !== null && (
                        <div style={{ fontFamily: T.mono, fontSize: 8, color: adColor(v) }}>{Math.round(v * 100)}%</div>
                      )}
                    </>
                  )}
                </div>
              )
            })}
          </div>
          {/* Legend */}
          <div style={{ display: "flex", gap: 16, marginTop: 16, paddingTop: 14, borderTop: `1px solid ${T.border}` }}>
            {[
              { label: "≥90% — excellent", color: T.ok },
              { label: "75–89% — good", color: `color-mix(in srgb, ${T.ok} 55%, ${T.warn})` },
              { label: "60–74% — watch", color: T.warn },
              { label: "<60% — flag", color: T.alert },
            ].map(item => (
              <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 10, height: 10, borderRadius: 3, background: `color-mix(in srgb, ${item.color} 40%, ${T.surfaceRaised})` }} />
                <span style={{ fontFamily: T.sans, fontSize: 11, color: T.ink4 }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Check-in summary */}
      <div style={{ background: T.surface, borderRadius: 12 }}>
        <div style={{ padding: "16px 24px", borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontFamily: T.sans, fontSize: 14, fontWeight: 600, color: T.ink }}>Check-in summary</span>
          <span style={{ fontFamily: T.sans, fontSize: 12, color: T.ok, fontWeight: 500 }}>14-day streak · last 06:42 today</span>
        </div>
        <div style={{ padding: "24px", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
          {[
            { label: "Subjective energy", value: "6/10", note: "Typical board-week level", color: T.warn },
            { label: "Training RPE", value: "Rest", note: "Hold-intensity day", color: T.ink3 },
            { label: "Mood", value: "7/10", note: "Slightly elevated stress", color: T.warn },
            { label: "Gut / digestion", value: "Good", note: "No GI flags today", color: T.ok },
          ].map(item => (
            <div key={item.label} style={{ padding: "16px 18px", background: T.surfaceRaised, borderRadius: 10 }}>
              <div style={{ fontFamily: T.sans, fontSize: 12, color: T.ink4, marginBottom: 10, fontWeight: 500 }}>{item.label}</div>
              <div style={{ fontFamily: T.mono, fontSize: 22, letterSpacing: "-0.03em", color: item.color, marginBottom: 6, lineHeight: 1, fontWeight: 300 }}>{item.value}</div>
              <div style={{ fontFamily: T.sans, fontSize: 12, color: T.ink4 }}>{item.note}</div>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
