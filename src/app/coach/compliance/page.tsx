"use client"

import { useState } from "react"
import { DATA } from "@/data/james"

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
// Simple grid derived from the 30-day rawTimeSeries — each cell is a day,
// colour-coded by overall adherence score for that day.

const DAYS_OF_WEEK = ["M", "T", "W", "T", "F", "S", "S"]

// Mock 30-day adherence — Apr 1–20, with realistic variation
const THIRTY_DAY_ADHERENCE = [
  // Week 1: Apr 1–6 (starting Tue)
  null, null, 0.92, 0.88, 0.95, 0.90, 0.72,
  // Week 2: Apr 7–13
  0.85, 0.78, 0.82, 0.90, 0.68, 0.72, 0.65,
  // Week 3: Apr 14–20 (today)
  0.82, 0.88, 0.74, 0.70, 0.78, 0.75, 0.71,
  // Week 4 placeholder (future)
  null, null, null, null, null, null, null,
]

function adColor(v: number | null): string {
  if (v === null) return "transparent"
  if (v >= 0.9) return "var(--ok)"
  if (v >= 0.75) return "color-mix(in srgb, var(--ok) 55%, var(--warn))"
  if (v >= 0.6) return "var(--warn)"
  return "var(--alert)"
}

// ─── Flags ────────────────────────────────────────────────────────────────────

const FLAGS = [
  {
    id: "zone2-volume",
    severity: "warn" as const,
    label: "Zone-2 volume below target",
    detail: "82/160 min this week (51%). Board-cycle context noted. Action: confirm hold-intensity until DEXA results; resume full volume next week.",
    action: "Confirm with Jamie",
  },
  {
    id: "fibre-adherence",
    severity: "warn" as const,
    label: "Fibre adherence below ApoB threshold",
    detail: "86% vs 89% target. Small gap, but sustained for 3 weeks. ApoB Q3 target at risk if not corrected. Consider pushing an evening reminder.",
    action: "Push reminder",
  },
  {
    id: "sleep-nights",
    severity: "info" as const,
    label: "2 non-adherent sleep nights this week",
    detail: "Sun and Tue linked to late board prep sessions. Sleep onset delayed ~40 min. HRV impact visible in overnight data. Not a flag yet — watch next week.",
    action: "Monitor",
  },
]

// ─── Overall score ────────────────────────────────────────────────────────────

const quarterScore = Math.round(
  PROTOCOLS.reduce((sum, p) => sum + p.rate, 0) / PROTOCOLS.length * 100
)

export default function CoachCompliancePage() {
  const [selectedProtocol, setSelectedProtocol] = useState<string | null>(null)
  const [dismissedFlags, setDismissedFlags] = useState<string[]>([])

  const activeFlags = FLAGS.filter(f => !dismissedFlags.includes(f.id))

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, padding: "24px 32px", maxWidth: 1200 }}>

      {/* Header */}
      <div style={{ borderBottom: "1px solid var(--hair)", paddingBottom: 16 }}>
        <div style={{ fontFamily: "var(--mono)", fontSize: 8.5, textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--ok)", marginBottom: 6 }}>
          Compliance monitoring · Darcy O&apos;Sullivan
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <h1 style={{ fontFamily: "var(--serif)", fontSize: 26, fontWeight: 400, color: "var(--ink)", margin: 0, letterSpacing: "-0.02em" }}>
            Jamie Garis · protocol adherence
          </h1>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: "var(--mono)", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--ink-3)", marginBottom: 4 }}>This week (7-day)</div>
            <div style={{ fontFamily: "var(--mono)", fontSize: 28, letterSpacing: "-0.04em", color: quarterScore >= 85 ? "var(--ok)" : quarterScore >= 70 ? "var(--warn)" : "var(--alert)", lineHeight: 1 }}>
              {Math.round(PROTOCOLS.reduce((s, p) => s + p.rate, 0) / PROTOCOLS.length * 100)}%
            </div>
          </div>
        </div>
      </div>

      {/* Flags */}
      {activeFlags.length > 0 && (
        <div className="panel">
          <div className="panel-head">
            <span>Attention required</span>
            <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--warn)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{activeFlags.length} open</span>
          </div>
          {activeFlags.map((flag, i) => (
            <div key={flag.id} style={{ display: "flex", alignItems: "stretch", borderTop: i > 0 ? "1px solid var(--hair)" : "1px solid var(--hair)" }}>
              <div style={{ width: 3, background: flag.severity === "warn" ? "var(--warn)" : "var(--accent)", flexShrink: 0 }} />
              <div style={{ flex: 1, padding: "12px 18px", display: "flex", gap: 16, alignItems: "center" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 10.5, color: "var(--ink)", marginBottom: 3 }}>{flag.label}</div>
                  <div style={{ fontSize: 12, color: "var(--ink-3)", lineHeight: 1.5 }}>{flag.detail}</div>
                </div>
                <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                  <button style={{ fontFamily: "var(--mono)", fontSize: 8, textTransform: "uppercase", letterSpacing: "0.06em", border: "1px solid var(--warn)", color: "var(--warn)", padding: "4px 10px", background: "transparent", cursor: "pointer" }}>
                    {flag.action}
                  </button>
                  <button onClick={() => setDismissedFlags(p => [...p, flag.id])} style={{ fontFamily: "var(--mono)", fontSize: 8, textTransform: "uppercase", letterSpacing: "0.06em", border: "1px solid var(--hair-strong)", color: "var(--ink-3)", padding: "4px 10px", background: "transparent", cursor: "pointer" }}>
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Protocol adherence grid */}
      <div className="panel">
        <div className="panel-head">
          <span>Protocol adherence · this week</span>
          <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Click a protocol for detail</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1, background: "var(--hair)" }}>
          {PROTOCOLS.map(proto => {
            const selected = selectedProtocol === proto.id
            const statusColor = proto.status === "ok" ? "var(--ok)" : "var(--warn)"
            return (
              <div
                key={proto.id}
                onClick={() => setSelectedProtocol(selected ? null : proto.id)}
                style={{ background: selected ? "var(--panel-2)" : "var(--bg)", padding: "16px 18px", cursor: "pointer", borderLeft: selected ? `2px solid ${statusColor}` : "2px solid transparent", transition: "background 0.1s" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink)", letterSpacing: "0.02em" }}>{proto.label}</div>
                  <span style={{ fontFamily: "var(--mono)", fontSize: 8, color: statusColor, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    {proto.status === "ok" ? "⬤ On track" : "◉ Watch"}
                  </span>
                </div>
                {/* Progress bar */}
                <div style={{ height: 3, background: "var(--hair-strong)", marginBottom: 6 }}>
                  <div style={{ height: "100%", width: `${proto.rate * 100}%`, background: statusColor, transition: "width 0.3s" }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--mono)", fontSize: 9 }}>
                  <span style={{ color: statusColor }}>{proto.thisWeek}</span>
                  <span style={{ color: "var(--ink-4)" }}>🔥 {proto.streak}d streak</span>
                </div>
                <div style={{ fontFamily: "var(--mono)", fontSize: 8, color: "var(--ink-4)", marginTop: 4 }}>{proto.target}</div>

                {selected && (
                  <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px solid var(--hair)", fontSize: 12, color: "var(--ink-2)", lineHeight: 1.6 }}>
                    {proto.note}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* 30-day calendar grid */}
      <div className="panel">
        <div className="panel-head">
          <span>30-day adherence calendar</span>
          <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Apr 2026 · composite score per day</span>
        </div>
        <div style={{ padding: "20px 24px" }}>
          {/* Day labels */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 6 }}>
            {DAYS_OF_WEEK.map((d, i) => (
              <div key={i} style={{ fontFamily: "var(--mono)", fontSize: 8, color: "var(--ink-4)", textAlign: "center", textTransform: "uppercase", letterSpacing: "0.08em" }}>{d}</div>
            ))}
          </div>
          {/* Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
            {THIRTY_DAY_ADHERENCE.map((v, i) => {
              const dayNum = i - 1 // Apr starts Tue, so offset by 1
              const date = dayNum >= 0 && dayNum < 30 ? dayNum + 1 : null
              const isToday = date === 20
              return (
                <div
                  key={i}
                  style={{
                    height: 36,
                    borderRadius: 3,
                    background: v !== null ? `color-mix(in srgb, ${adColor(v)} 30%, var(--panel-2))` : "var(--panel-2)",
                    border: isToday ? "1px solid var(--accent)" : "1px solid transparent",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 1,
                  }}
                >
                  {date && (
                    <>
                      <div style={{ fontFamily: "var(--mono)", fontSize: 8, color: isToday ? "var(--accent)" : "var(--ink-3)" }}>{date}</div>
                      {v !== null && (
                        <div style={{ fontFamily: "var(--mono)", fontSize: 7, color: adColor(v) }}>{Math.round(v * 100)}%</div>
                      )}
                    </>
                  )}
                </div>
              )
            })}
          </div>
          {/* Legend */}
          <div style={{ display: "flex", gap: 16, marginTop: 14, paddingTop: 12, borderTop: "1px solid var(--hair)" }}>
            {[
              { label: "≥90% — excellent", color: "var(--ok)" },
              { label: "75–89% — good", color: "color-mix(in srgb, var(--ok) 55%, var(--warn))" },
              { label: "60–74% — watch", color: "var(--warn)" },
              { label: "<60% — flag", color: "var(--alert)" },
            ].map(item => (
              <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: `color-mix(in srgb, ${item.color} 40%, var(--panel-2))` }} />
                <span style={{ fontFamily: "var(--mono)", fontSize: 8, color: "var(--ink-4)" }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Check-in summary */}
      <div className="panel">
        <div className="panel-head">
          <span>Check-in summary</span>
          <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ok)", textTransform: "uppercase", letterSpacing: "0.08em" }}>14-day streak · last 06:42 today</span>
        </div>
        <div style={{ padding: "20px 24px", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
          {[
            { label: "Subjective energy", value: "6/10", note: "Typical board-week level", color: "var(--warn)" },
            { label: "Training RPE", value: "Rest", note: "Hold-intensity day", color: "var(--ink-3)" },
            { label: "Mood", value: "7/10", note: "Slightly elevated stress", color: "var(--warn)" },
            { label: "Gut / digestion", value: "Good", note: "No GI flags today", color: "var(--ok)" },
          ].map(item => (
            <div key={item.label} style={{ padding: "14px 16px", border: "1px solid var(--hair)", background: "var(--panel-2)" }}>
              <div style={{ fontFamily: "var(--mono)", fontSize: 8, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--ink-4)", marginBottom: 8 }}>{item.label}</div>
              <div style={{ fontFamily: "var(--mono)", fontSize: 22, letterSpacing: "-0.03em", color: item.color, marginBottom: 4, lineHeight: 1 }}>{item.value}</div>
              <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-4)" }}>{item.note}</div>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
