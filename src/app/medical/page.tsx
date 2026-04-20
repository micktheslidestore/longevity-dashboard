"use client"

import { useState } from "react"
import { DATA } from "@/data/james"
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, ReferenceLine, Tooltip } from "recharts"

// ─── Medical Roadmap ─────────────────────────────────────────────────────────

const MILESTONES = [
  { label: "Today",                    date: "20 Apr",  daysOut: 0,  type: "today",    note: null },
  { label: "DEXA + VO₂max retest",    date: "22 Apr",  daysOut: 2,  type: "test",     note: "Fasted from 20:30 Tue · West Clinic 08:30" },
  { label: "Quarterly protocol review",date: "29 Apr",  daysOut: 9,  type: "coaching", note: "In person · 60 min · Darcy O'Sullivan" },
  { label: "Full quarterly bloods",    date: "06 May",  daysOut: 16, type: "blood",    note: "Phlebotomist visit · fasted" },
  { label: "Cardiology consult",       date: "12 May",  daysOut: 22, type: "medical",  note: "Dr. Sanjay Rao, MD · video" },
  { label: "Q3 bloods · ApoB target", date: "02 Jul",  daysOut: 73, type: "target",   note: "ApoB ≤ 70 mg/dL · Fibrinogen < 320 mg/dL" },
]

const MILESTONE_COLORS: Record<string, string> = {
  today:    "var(--ink)",
  test:     "var(--warn)",
  coaching: "var(--ok)",
  blood:    "#9B8FA9",
  medical:  "var(--warn)",
  target:   "var(--ok)",
}

function MedicalRoadmap() {
  const [hovered, setHovered] = useState<number | null>(null)
  const totalDays = 73 // span to Jul 2

  return (
    <div className="panel">
      <div className="panel-head">
        <span>Medical roadmap · Q2 2026</span>
        <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          Next 73 days · key milestones
        </span>
      </div>

      {/* Timeline track */}
      <div style={{ padding: "24px 32px 10px" }}>
        <div style={{ position: "relative", height: 4, background: "var(--hair-strong)", borderRadius: 2 }}>
          {/* Progress fill */}
          <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: "2.7%", background: "var(--ink)", borderRadius: 2 }} />

          {MILESTONES.map((m, i) => {
            const pct = (m.daysOut / totalDays) * 100
            const color = MILESTONE_COLORS[m.type]
            return (
              <div
                key={m.label}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                style={{ position: "absolute", left: `${pct}%`, top: "50%", transform: "translate(-50%, -50%)", cursor: "default" }}
              >
                <div style={{
                  width: m.type === "today" ? 10 : 12,
                  height: m.type === "today" ? 10 : 12,
                  borderRadius: m.type === "target" ? 0 : "50%",
                  background: m.type === "today" ? "var(--ink)" : "var(--bg)",
                  border: `2px solid ${color}`,
                  transform: m.type === "target" ? "rotate(45deg)" : undefined,
                }} />
              </div>
            )
          })}
        </div>

        {/* Labels row */}
        <div style={{ position: "relative", height: 52, marginTop: 6 }}>
          {MILESTONES.map((m, i) => {
            const pct = (m.daysOut / totalDays) * 100
            const color = MILESTONE_COLORS[m.type]
            const isHovered = hovered === i
            return (
              <div
                key={m.label}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  position: "absolute",
                  left: `${pct}%`,
                  transform: "translateX(-50%)",
                  display: "flex", flexDirection: "column", alignItems: "center",
                  width: 90,
                }}
              >
                <div style={{ fontFamily: "var(--mono)", fontSize: 8, color: isHovered ? color : "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.06em", textAlign: "center", lineHeight: 1.3 }}>
                  {m.date}
                </div>
                <div style={{ fontFamily: "var(--mono)", fontSize: 7.5, color: isHovered ? "var(--ink)" : "var(--ink-4)", textAlign: "center", lineHeight: 1.3, marginTop: 2 }}>
                  {m.label}
                </div>
                {isHovered && m.note && (
                  <div style={{
                    position: "absolute", top: "100%", left: "50%", transform: "translateX(-50%)",
                    marginTop: 6, background: "var(--panel-2)", border: `1px solid ${color}`,
                    padding: "6px 10px", fontFamily: "var(--mono)", fontSize: 8.5, color: "var(--ink-2)",
                    whiteSpace: "nowrap", zIndex: 10, lineHeight: 1.4,
                  }}>
                    {m.note}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Target progress rails */}
      <div style={{ borderTop: "1px solid var(--hair)", padding: "16px 24px", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 0 }}>
        {DATA.vision.tracks.map((track, i) => {
          const pct = Math.round(track.progress * 100)
          const isDown = track.dir === "down"
          const color = pct >= 60 ? "var(--ok)" : pct >= 30 ? "var(--warn)" : "var(--alert)"
          return (
            <div key={track.name} style={{ padding: "10px 16px", borderRight: i < 3 ? "1px solid var(--hair)" : undefined }}>
              <div style={{ fontFamily: "var(--mono)", fontSize: 8, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--ink-3)", marginBottom: 6 }}>
                {track.name}
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 8 }}>
                <span style={{ fontFamily: "var(--mono)", fontSize: 18, color: "var(--ink)", letterSpacing: "-0.02em" }}>
                  {track.now}
                </span>
                <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-3)" }}>{track.unit}</span>
                <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-4)" }}>
                  {isDown ? "↓" : "↑"} {track.target}
                </span>
              </div>
              {/* Progress rail */}
              <div style={{ height: 3, background: "var(--hair-strong)", borderRadius: 1, marginBottom: 4 }}>
                <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 1 }} />
              </div>
              <div style={{ fontFamily: "var(--mono)", fontSize: 8, color }}>
                {pct}% to target
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function FlagDot({ flag }: { flag: string | null }) {
  if (!flag) return null
  return (
    <span style={{
      display: "inline-block",
      width: 6,
      height: 6,
      borderRadius: "50%",
      background: flag === "alert" ? "var(--alert)" : "var(--warn)",
      marginRight: 6,
      flexShrink: 0,
      marginTop: 1,
    }} />
  )
}

function InfoModal({ why, action, marker }: { why: string; action: string; marker: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <button
        className="info-btn"
        onClick={() => setOpen(o => !o)}
        title={`Why ${marker} is flagged`}
      >
        i
      </button>
      {open && (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 19 }} onClick={() => setOpen(false)} />
          <div className="info-popover" style={{ top: 20, right: 0, zIndex: 20 }}>
            <div className="info-title">{marker} · why flagged</div>
            <div>{why}</div>
            <div className="info-action">{action}</div>
          </div>
        </>
      )}
    </div>
  )
}

function LabRail({ points, range, target, unit }: {
  points: { q: string; v: number }[]
  range: [number, number]
  target: number
  unit: string
}) {
  const data = points.map(p => ({ name: p.q, value: p.v }))
  const [lo, hi] = range
  return (
    <div style={{ height: 80, width: "100%" }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -24 }}>
          <XAxis dataKey="name" tick={{ fontFamily: "var(--mono)", fontSize: 8, fill: "var(--ink-3)" }} tickLine={false} axisLine={false} />
          <YAxis domain={[lo, hi]} tick={{ fontFamily: "var(--mono)", fontSize: 8, fill: "var(--ink-3)" }} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{ background: "var(--panel-2)", border: "1px solid var(--hair-strong)", borderRadius: 0, fontFamily: "var(--mono)", fontSize: 9 }}
            formatter={(v) => [`${v} ${unit}`, ""]}
            labelStyle={{ color: "var(--ink-3)" }}
            itemStyle={{ color: "var(--ink)" }}
          />
          <ReferenceLine y={target} stroke="var(--ok)" strokeDasharray="3 3" strokeWidth={1} />
          <Line type="monotone" dataKey="value" stroke="var(--accent)" strokeWidth={1.5} dot={{ r: 2, fill: "var(--accent)", strokeWidth: 0 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default function MedicalPage() {
  const { pathology } = DATA
  const [openGroup, setOpenGroup] = useState<string | null>(null)
  const [shareToast, setShareToast] = useState(false)

  function handleShare() {
    setShareToast(true)
    setTimeout(() => setShareToast(false), 2800)
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, padding: "24px 32px", maxWidth: 1100 }}>

      {/* Page header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", paddingBottom: 16, borderBottom: "1px solid var(--hair)" }}>
        <div>
          <h1 style={{ fontFamily: "var(--serif)", fontSize: 34, fontWeight: 300, letterSpacing: "-0.02em", color: "var(--ink)", margin: 0, lineHeight: 1 }}>Medical.</h1>
          <div style={{ fontFamily: "var(--mono)", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--ink-3)", marginTop: 8 }}>
            Last draw {pathology.lastDraw} · Next scheduled {pathology.nextDraw} · {DATA.user.last.toUpperCase()}, {DATA.user.first.toUpperCase()} · DOB 04 Nov 1971
          </div>
        </div>
        <div style={{ display: "flex", gap: 0, position: "relative" }}>
          <button
            onClick={handleShare}
            style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", border: "1px solid var(--hair-strong)", borderRight: 0, padding: "9px 16px", color: "var(--ink-2)", background: "transparent", cursor: "pointer" }}
          >
            Share with clinician
          </button>
          <button
            style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", border: "1px solid var(--hair-strong)", borderRight: 0, padding: "9px 16px", color: "var(--ink-2)", background: "transparent", cursor: "pointer" }}
          >
            Export PDF
          </button>
          <button
            style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", border: "1px solid var(--ink)", padding: "9px 16px", background: "var(--ink)", color: "var(--bg)", cursor: "pointer" }}
          >
            Generate quarterly report
          </button>
          {shareToast && (
            <div style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, background: "var(--panel-2)", border: "1px solid var(--hair-strong)", padding: "8px 14px", fontFamily: "var(--mono)", fontSize: 10, color: "var(--ok)", letterSpacing: "0.08em", textTransform: "uppercase", whiteSpace: "nowrap", zIndex: 10 }}>
              Draft prepared for Dr. Sanjay Rao · review before sending
            </div>
          )}
        </div>
      </div>

      {/* Medical roadmap */}
      <MedicalRoadmap />

      {/* Risk strip */}
      <div style={{ display: "flex", gap: 0, borderTop: 0 }}>
        {[
          { l: "Risk profile", v: DATA.user.risk, color: "var(--warn)" },
          { l: "Last draw", v: pathology.lastDraw, color: "var(--ink)" },
          { l: "Next draw", v: pathology.nextDraw, color: "var(--ink)" },
        ].map(({ l, v, color }) => (
          <div key={l} className="panel" style={{ flex: 1, padding: "12px 16px", borderRight: 0 }}>
            <div style={{ fontFamily: "var(--mono)", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--ink-3)" }}>{l}</div>
            <div style={{ fontFamily: l === "Risk profile" ? "var(--serif)" : "var(--mono)", fontSize: 12, color, marginTop: 4, fontStyle: l === "Risk profile" ? "italic" : "normal" }}>{v}</div>
          </div>
        ))}
      </div>

      {/* Lab panels */}
      {pathology.panels.map(panel => (
        <div key={panel.group} className="panel">
          <div
            className="panel-head"
            style={{ cursor: "pointer" }}
            onClick={() => setOpenGroup(openGroup === panel.group ? null : panel.group)}
          >
            <span>{panel.group}</span>
            <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              {panel.rows.filter(r => r.flag).length > 0
                ? `${panel.rows.filter(r => r.flag).length} flagged`
                : "All clear"} · {openGroup === panel.group ? "collapse" : "expand"}
            </span>
          </div>
          <div className="labs">
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["Marker", "Value", "Range", "Previous", "Trend"].map(h => (
                    <th key={h} style={{ padding: "8px 14px", fontFamily: "var(--mono)", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--ink-3)", fontWeight: 400, borderBottom: "1px solid var(--hair-strong)", textAlign: h === "Marker" ? "left" : "right" }}>{h}</th>
                  ))}
                  <th style={{ width: 24, borderBottom: "1px solid var(--hair-strong)" }} />
                </tr>
              </thead>
              <tbody>
                {panel.rows.map(row => {
                  const inRange = row.value >= row.range[0] && row.value <= row.range[1]
                  return (
                    <tr key={row.marker}>
                      <td style={{ padding: "10px 14px", borderBottom: "1px solid var(--hair)", verticalAlign: "middle" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          {row.flag && (
                            <span style={{
                              display: "inline-block", width: 6, height: 6,
                              background: row.flag === "alert" ? "var(--alert)" : "var(--warn)",
                              borderRadius: "50%", flexShrink: 0,
                            }} />
                          )}
                          <div>
                            <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: row.flag ? (row.flag === "alert" ? "var(--alert)" : "var(--warn)") : "var(--ink)" }}>
                              {row.marker}
                            </div>
                            <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-3)", marginTop: 1 }}>{row.full}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "10px 14px", textAlign: "right", borderBottom: "1px solid var(--hair)", fontFamily: "var(--mono)", fontSize: 13, color: inRange ? "var(--ink)" : row.flag === "alert" ? "var(--alert)" : "var(--warn)", verticalAlign: "middle" }}>
                        {row.value} <span style={{ fontSize: 9, color: "var(--ink-3)" }}>{row.unit}</span>
                      </td>
                      <td style={{ padding: "10px 14px", textAlign: "right", borderBottom: "1px solid var(--hair)", fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-3)", verticalAlign: "middle" }}>
                        {row.range[0]}–{row.range[1]} {row.unit}
                      </td>
                      <td style={{ padding: "10px 14px", textAlign: "right", borderBottom: "1px solid var(--hair)", fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink-2)", verticalAlign: "middle" }}>
                        {row.prev} <span style={{ fontSize: 9, color: "var(--ink-3)" }}>{row.unit}</span>
                      </td>
                      <td style={{ padding: "10px 14px", textAlign: "right", borderBottom: "1px solid var(--hair)", fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink-2)", verticalAlign: "middle" }}>
                        {row.trend}
                      </td>
                      <td style={{ padding: "10px 14px", borderBottom: "1px solid var(--hair)", verticalAlign: "middle", textAlign: "center" }}>
                        {row.flag && row.why && row.action && (
                          <InfoModal why={row.why} action={row.action} marker={row.marker} />
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {/* Path timeline */}
      <div className="panel">
        <div className="panel-head">
          <span>Pathology trajectory</span>
          <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            4-quarter · dashed line = target
          </span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", borderLeft: "1px solid var(--hair)" }}>
          {pathology.timeline.map(item => (
            <div key={item.marker} style={{ borderRight: "1px solid var(--hair)", borderBottom: "1px solid var(--hair)", padding: "14px 16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
                <div style={{ fontFamily: "var(--mono)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--ink-2)" }}>{item.marker}</div>
                <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-3)" }}>
                  target {item.target} {item.unit}
                </div>
              </div>
              <LabRail
                points={item.points}
                range={item.range as [number, number]}
                target={item.target}
                unit={item.unit}
              />
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
