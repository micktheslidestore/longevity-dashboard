"use client"

import { useState } from "react"
import { DATA } from "@/data/james"
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, ReferenceLine, Tooltip } from "recharts"

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

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, padding: "24px 32px", maxWidth: 1100 }}>

      {/* Draw info */}
      <div style={{ display: "flex", gap: 20 }}>
        <div className="panel" style={{ flex: 1, padding: "14px 18px" }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--ink-3)" }}>Last draw</div>
          <div style={{ fontFamily: "var(--mono)", fontSize: 14, color: "var(--ink)", marginTop: 4 }}>{pathology.lastDraw}</div>
        </div>
        <div className="panel" style={{ flex: 1, padding: "14px 18px" }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--ink-3)" }}>Next draw</div>
          <div style={{ fontFamily: "var(--mono)", fontSize: 14, color: "var(--ink)", marginTop: 4 }}>{pathology.nextDraw}</div>
        </div>
        <div className="panel" style={{ flex: 1, padding: "14px 18px" }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--ink-3)" }}>Risk factors</div>
          <div style={{ fontFamily: "var(--serif)", fontSize: 12, color: "var(--warn)", marginTop: 4, fontStyle: "italic" }}>{DATA.user.risk}</div>
        </div>
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
