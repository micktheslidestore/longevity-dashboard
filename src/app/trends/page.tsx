"use client"

import { useState, useMemo } from "react"
import { DATA } from "@/data/james"
import { LifecycleChip } from "@/components/Primitives"
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ReferenceLine, CartesianGrid } from "recharts"

function top3Pairs(matrix: number[][], labels: string[]) {
  const pairs: { i: number; j: number; r: number }[] = []
  for (let i = 0; i < labels.length; i++) {
    for (let j = i + 1; j < labels.length; j++) {
      pairs.push({ i, j, r: Math.abs(matrix[i][j]) })
    }
  }
  pairs.sort((a, b) => b.r - a.r)
  return pairs.slice(0, 3)
}

function corrColor(r: number) {
  const abs = Math.abs(r)
  if (abs >= 0.6) return r > 0 ? "var(--warn)" : "var(--ok)"
  if (abs >= 0.35) return r > 0 ? "rgba(200,165,106,0.4)" : "rgba(127,169,155,0.4)"
  return "transparent"
}

const CHART_TYPES = ["line", "bar"] as const
type ChartType = typeof CHART_TYPES[number]

const PIVOT_METRICS = DATA.trends.cards.map(c => c.name)
const PIVOT_PERIODS = DATA.trends.periods

export default function TrendsPage() {
  const { corr, cards, insights, events } = DATA.trends
  const [period, setPeriod] = useState("30d")
  const [pivotMetric, setPivotMetric] = useState(PIVOT_METRICS[0])
  const [chartType, setChartType] = useState<ChartType>("line")
  const [openInsight, setOpenInsight] = useState<string | null>(null)

  const top3 = useMemo(() => top3Pairs(corr.matrix, corr.labels), [])

  const activeCard = cards.find(c => c.name === pivotMetric) ?? cards[0]
  const chartData = activeCard.data.map((v, i) => ({ i, value: parseFloat(v.toFixed(2)), day: i + 1 }))

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, padding: "24px 32px", maxWidth: 1200 }}>

      {/* Period toggle */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <span style={{ fontFamily: "var(--mono)", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--ink-3)" }}>Period</span>
        <div className="segmented">
          {PIVOT_PERIODS.map(p => (
            <button key={p} data-active={period === p} onClick={() => setPeriod(p)}>{p}</button>
          ))}
        </div>
      </div>

      {/* Insight feed */}
      <div className="panel">
        <div className="panel-head">
          <span>Insights</span>
        </div>
        {insights.map(ins => (
          <div
            key={ins.id}
            style={{ padding: "16px 20px", borderTop: "1px solid var(--hair)", cursor: "pointer" }}
            onClick={() => setOpenInsight(openInsight === ins.id ? null : ins.id)}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                <span style={{
                  fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.08em", textTransform: "uppercase",
                  color: ins.strength === "high" ? "var(--ok)" : "var(--warn)",
                  border: `1px solid ${ins.strength === "high" ? "var(--ok)" : "var(--warn)"}`,
                  padding: "2px 6px",
                }}>
                  {ins.strength}
                </span>
                <span style={{ fontSize: 14, color: "var(--ink)", fontWeight: 400 }}>{ins.title}</span>
              </div>
              <LifecycleChip lc={ins.lifecycle} />
            </div>
            {openInsight === ins.id && (
              <div style={{ marginTop: 12 }}>
                <p style={{ fontSize: 13, color: "var(--ink-2)", lineHeight: 1.6, marginBottom: 10 }}>{ins.body}</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {ins.refs.map(r => (
                    <span key={r} style={{ fontFamily: "var(--mono)", fontSize: 10, border: "1px solid var(--hair)", padding: "2px 6px", color: "var(--ink-2)" }}>{r}</span>
                  ))}
                </div>
                <div style={{ marginTop: 10, fontFamily: "var(--mono)", fontSize: 9, color: "var(--ok)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{ins.by}</div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Pivot chart */}
      <div className="panel">
        <div className="pivot-head">
          <span style={{ fontFamily: "var(--mono)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--ink-2)" }}>
            Trend · {activeCard.name}
          </span>
          <div className="pivot-controls">
            <label>
              Metric
              <select value={pivotMetric} onChange={e => setPivotMetric(e.target.value)}>
                {PIVOT_METRICS.map(m => <option key={m}>{m}</option>)}
              </select>
            </label>
            <label>
              Chart
              <div className="seg-mini" style={{ display: "inline-flex", marginLeft: 8 }}>
                {CHART_TYPES.map(t => (
                  <button key={t} data-on={chartType === t} onClick={() => setChartType(t)}>{t}</button>
                ))}
              </div>
            </label>
          </div>
        </div>

        <div style={{ padding: "0 20px 20px" }}>
          <div style={{ display: "flex", gap: 24, marginBottom: 12, paddingTop: 12 }}>
            <div>
              <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Current</div>
              <div style={{ fontFamily: "var(--mono)", fontSize: 20, letterSpacing: "-0.02em", color: activeCard.deltaDir === "up" && activeCard.unit !== "ms" ? "var(--ok)" : activeCard.deltaDir === "down" && activeCard.unit === "ms" ? "var(--alert)" : "var(--ink)" }}>
                {activeCard.now} <span style={{ fontSize: 10, color: "var(--ink-3)" }}>{activeCard.unit}</span>
              </div>
            </div>
            <div>
              <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Delta vs {period}</div>
              <div style={{ fontFamily: "var(--mono)", fontSize: 15, color: "var(--ink-2)", marginTop: 4 }}>{activeCard.delta}</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Note</div>
              <div style={{ fontSize: 12, color: "var(--ink-2)", lineHeight: 1.5, marginTop: 4, fontStyle: "italic" }}>{activeCard.note}</div>
            </div>
          </div>

          <div style={{ height: 180 }}>
            <ResponsiveContainer width="100%" height="100%">
              {chartType === "line" ? (
                <LineChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
                  <CartesianGrid stroke="var(--hair)" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontFamily: "var(--mono)", fontSize: 9, fill: "var(--ink-3)" }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontFamily: "var(--mono)", fontSize: 9, fill: "var(--ink-3)" }} tickLine={false} axisLine={false} domain={["auto", "auto"]} />
                  <Tooltip
                    contentStyle={{ background: "var(--panel-2)", border: "1px solid var(--hair-strong)", borderRadius: 0, fontFamily: "var(--mono)", fontSize: 10 }}
                    itemStyle={{ color: "var(--ink)" }}
                    labelStyle={{ color: "var(--ink-3)" }}
                  />
                  {events.map(ev => (
                    <ReferenceLine key={ev.day} x={ev.day} stroke="var(--warn)" strokeDasharray="2 3" strokeWidth={1} label={{ value: ev.lbl, position: "top", fontSize: 8, fill: "var(--warn)", fontFamily: "var(--mono)" }} />
                  ))}
                  {activeCard.band && (
                    <>
                      <ReferenceLine y={activeCard.band[0]} stroke="var(--hair-strong)" strokeDasharray="3 3" />
                      <ReferenceLine y={activeCard.band[1]} stroke="var(--hair-strong)" strokeDasharray="3 3" />
                    </>
                  )}
                  <Line type="monotone" dataKey="value" stroke="var(--accent)" strokeWidth={1.5} dot={false} />
                </LineChart>
              ) : (
                <BarChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
                  <CartesianGrid stroke="var(--hair)" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontFamily: "var(--mono)", fontSize: 9, fill: "var(--ink-3)" }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontFamily: "var(--mono)", fontSize: 9, fill: "var(--ink-3)" }} tickLine={false} axisLine={false} domain={["auto", "auto"]} />
                  <Tooltip
                    contentStyle={{ background: "var(--panel-2)", border: "1px solid var(--hair-strong)", borderRadius: 0, fontFamily: "var(--mono)", fontSize: 10 }}
                    itemStyle={{ color: "var(--ink)" }}
                    labelStyle={{ color: "var(--ink-3)" }}
                  />
                  {events.map(ev => (
                    <ReferenceLine key={ev.day} x={ev.day} stroke="var(--warn)" strokeDasharray="2 3" strokeWidth={1} />
                  ))}
                  <Bar dataKey="value" fill="var(--accent)" opacity={0.75} radius={0} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Correlation matrix */}
      <div className="panel">
        <div className="panel-head">
          <span>Correlation matrix · {period}</span>
          <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Pearson r · top 3 pairs labeled
          </span>
        </div>
        <div style={{ padding: "16px 20px", overflowX: "auto" }}>
          <table style={{ borderCollapse: "collapse", fontFamily: "var(--mono)", fontSize: 11 }}>
            <thead>
              <tr>
                <th style={{ padding: "6px 12px", color: "var(--ink-3)", fontWeight: 400, textAlign: "left", borderBottom: "1px solid var(--hair-strong)" }} />
                {corr.labels.map(l => (
                  <th key={l} style={{ padding: "6px 12px", color: "var(--ink-3)", fontWeight: 400, textAlign: "center", letterSpacing: "0.1em", textTransform: "uppercase", fontSize: 9, borderBottom: "1px solid var(--hair-strong)" }}>{l}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {corr.labels.map((row, i) => (
                <tr key={row}>
                  <td style={{ padding: "6px 12px", color: "var(--ink-2)", textTransform: "uppercase", letterSpacing: "0.1em", fontSize: 9, borderBottom: "1px solid var(--hair)", whiteSpace: "nowrap" }}>{row}</td>
                  {corr.labels.map((_, j) => {
                    const r = corr.matrix[i][j]
                    const rank = top3.findIndex(p => (p.i === i && p.j === j) || (p.i === j && p.j === i))
                    const isTop = rank >= 0
                    return (
                      <td
                        key={j}
                        style={{
                          padding: "8px 12px",
                          textAlign: "center",
                          background: i === j ? "var(--panel-2)" : corrColor(r),
                          borderBottom: "1px solid var(--hair)",
                          position: "relative",
                          color: i === j ? "var(--ink-3)" : "var(--ink)",
                          fontWeight: isTop ? 600 : 400,
                        }}
                      >
                        {r.toFixed(2)}
                        {isTop && i !== j && (
                          <span style={{
                            position: "absolute",
                            top: 2,
                            right: 3,
                            fontFamily: "var(--mono)",
                            fontSize: 8,
                            color: "var(--ink)",
                            background: "var(--accent)",
                            width: 12,
                            height: 12,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            lineHeight: 1,
                          }}>
                            {rank + 1}
                          </span>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ marginTop: 14, display: "flex", gap: 20 }}>
            {top3.map((p, idx) => (
              <div key={idx} style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-2)" }}>
                <span style={{ color: "var(--ink)", marginRight: 4 }}>{idx + 1}.</span>
                {corr.labels[p.i]} × {corr.labels[p.j]}
                <span style={{ color: Math.abs(corr.matrix[p.i][p.j]) >= 0.6 ? (corr.matrix[p.i][p.j] > 0 ? "var(--warn)" : "var(--ok)") : "var(--ink-3)", marginLeft: 6 }}>
                  r = {corr.matrix[p.i][p.j].toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Course corrector on Trends */}
      <div className="panel">
        <div className="panel-head">
          <span>Course corrector</span>
          <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Recommendation → Action → Outcome
          </span>
        </div>
        {DATA.courseCorrector.filter(c => c.status === "resolved").map((c, i) => (
          <div key={i} className="corrector-row">
            <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: 20, alignItems: "start" }}>
              <div>
                <div className="cr-date">{c.date}</div>
                <div style={{ marginTop: 5 }}>
                  <span className="lc-chip lc-signed">Resolved</span>
                </div>
                <div style={{ marginTop: 10, fontFamily: "var(--mono)", fontSize: 11, lineHeight: 1.4 }}>
                  <div style={{ color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.08em", fontSize: 8, marginBottom: 2 }}>{c.impact.metric}</div>
                  <div style={{ color: "var(--ok)" }}>
                    {c.impact.before} → {c.impact.after}
                    <span style={{ color: "var(--ink-3)", marginLeft: 3 }}>{c.impact.unit}</span>
                  </div>
                  {c.impact.days && <div style={{ color: "var(--ink-3)", fontSize: 9, marginTop: 2 }}>in {c.impact.days}d</div>}
                </div>
              </div>
              <div>
                <div className="cr-title">{c.recommendation}</div>
                <div className="cr-action">{c.action}</div>
                <div className="cr-outcome">{c.outcome}</div>
                <div style={{ marginTop: 8, fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{c.by}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  )
}
