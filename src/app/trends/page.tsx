"use client"

import { useState, useMemo } from "react"
import { DATA } from "@/data/james"
import { useApp } from "@/components/RoleContext"
import { LifecycleChip } from "@/components/Primitives"
import HeroChart from "@/components/HeroChart"
import WhatIf from "@/components/WhatIf"
import { computeSeries, lagCorrelations, WEIGHTS, type MetricKey } from "@/lib/irt"
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, Tooltip, ReferenceLine, CartesianGrid, Legend,
} from "recharts"

// ─── helpers ────────────────────────────────────────────────────────────────

function corrColor(r: number): string {
  const abs = Math.abs(r)
  if (abs >= 0.6) return r > 0 ? "rgba(200,165,106,0.55)" : "rgba(127,169,155,0.55)"
  if (abs >= 0.35) return r > 0 ? "rgba(200,165,106,0.25)" : "rgba(127,169,155,0.25)"
  return "transparent"
}

function corrTextColor(r: number, abs: number): string {
  if (abs >= 0.6) return r > 0 ? "var(--warn)" : "var(--ok)"
  return "var(--ink-2)"
}

function top3Pairs(matrix: number[][], labels: string[]) {
  const pairs: { i: number; j: number; r: number }[] = []
  for (let i = 0; i < labels.length; i++)
    for (let j = i + 1; j < labels.length; j++)
      pairs.push({ i, j, r: Math.abs(matrix[i][j]) })
  pairs.sort((a, b) => b.r - a.r)
  return pairs.slice(0, 3)
}

function pairKey(a: string, b: string) {
  return `${a} × ${b}`
}

function heatOpacity(val: number, min: number, max: number) {
  return Math.round(((val - min) / (max - min)) * 100) / 100
}

const CHART_TYPES = ["line", "bar"] as const
type ChartType = typeof CHART_TYPES[number]

// ─── sub-components ──────────────────────────────────────────────────────────

function ChartPanel({
  card,
  events,
  type,
  overlay,
  overlayCard,
}: {
  card: typeof DATA.trends.cards[number]
  events: typeof DATA.trends.events
  type: ChartType
  overlay: boolean
  overlayCard?: typeof DATA.trends.cards[number]
}) {
  const data = card.data.map((v, i) => {
    const d: Record<string, number> = { day: i + 1, primary: parseFloat(v.toFixed(2)) }
    if (overlayCard) d.overlay = parseFloat(overlayCard.data[i].toFixed(2))
    return d
  })

  const tooltipStyle = {
    contentStyle: { background: "var(--panel-2)", border: "1px solid var(--hair-strong)", borderRadius: 0, fontFamily: "var(--mono)", fontSize: 10 },
    itemStyle: { color: "var(--ink)" },
    labelStyle: { color: "var(--ink-3)" },
  }

  return (
    <div style={{ height: 180 }}>
      <ResponsiveContainer width="100%" height="100%">
        {type === "line" ? (
          <LineChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
            <CartesianGrid stroke="var(--hair)" vertical={false} />
            <XAxis dataKey="day" tick={{ fontFamily: "var(--mono)", fontSize: 9, fill: "var(--ink-3)" }} tickLine={false} axisLine={false} />
            <YAxis yAxisId="left" tick={{ fontFamily: "var(--mono)", fontSize: 9, fill: "var(--ink-3)" }} tickLine={false} axisLine={false} domain={["auto", "auto"]} />
            {overlay && overlayCard && <YAxis yAxisId="right" orientation="right" tick={{ fontFamily: "var(--mono)", fontSize: 9, fill: "var(--ink-3)" }} tickLine={false} axisLine={false} domain={["auto", "auto"]} />}
            <Tooltip {...tooltipStyle} />
            {events.map(ev => (
              <ReferenceLine key={ev.day} x={ev.day} yAxisId="left" stroke="var(--warn)" strokeDasharray="2 3" strokeWidth={1}
                label={{ value: ev.lbl, position: "top", fontSize: 8, fill: "var(--warn)", fontFamily: "var(--mono)" }} />
            ))}
            {card.band && <>
              <ReferenceLine y={card.band[0]} yAxisId="left" stroke="var(--hair-strong)" strokeDasharray="3 3" />
              <ReferenceLine y={card.band[1]} yAxisId="left" stroke="var(--hair-strong)" strokeDasharray="3 3" />
            </>}
            <Line yAxisId="left" type="monotone" dataKey="primary" stroke="var(--accent)" strokeWidth={1.5} dot={false} name={card.name} />
            {overlay && overlayCard && (
              <Line yAxisId="right" type="monotone" dataKey="overlay" stroke="var(--ok)" strokeWidth={1.5} dot={false} strokeDasharray="4 2" name={overlayCard.name} />
            )}
            {overlay && overlayCard && <Legend wrapperStyle={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-3)" }} />}
          </LineChart>
        ) : (
          <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
            <CartesianGrid stroke="var(--hair)" vertical={false} />
            <XAxis dataKey="day" tick={{ fontFamily: "var(--mono)", fontSize: 9, fill: "var(--ink-3)" }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontFamily: "var(--mono)", fontSize: 9, fill: "var(--ink-3)" }} tickLine={false} axisLine={false} domain={["auto", "auto"]} />
            <Tooltip {...tooltipStyle} />
            {events.map(ev => (
              <ReferenceLine key={ev.day} x={ev.day} stroke="var(--warn)" strokeDasharray="2 3" strokeWidth={1} />
            ))}
            <Bar dataKey="primary" fill="var(--accent)" opacity={0.75} radius={0} name={card.name} />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  )
}

// ─── main page ───────────────────────────────────────────────────────────────

export default function TrendsPage() {
  const { role } = useApp()
  const { corr, cards, insights, events, corrInsights, pivotData, pinnedViews } = DATA.trends

  // IRT computation
  const computed = useMemo(() => computeSeries(DATA.rawTimeSeries), [])
  const lastDay = computed[computed.length - 1]
  const eventIndices = DATA.checkin.regimeChanges.map(rc => rc.dayIndex)
  const lagResults = useMemo(() => lagCorrelations(computed, eventIndices), [computed])

  // Period
  const [period, setPeriod] = useState("30d")

  // Insight feed
  const [openInsight, setOpenInsight] = useState<string | null>(null)

  // Correlation matrix selection
  const [selectedPair, setSelectedPair] = useState<{ i: number; j: number } | null>({ i: 0, j: 1 })
  const top3 = useMemo(() => top3Pairs(corr.matrix, corr.labels), [])

  const selectedKey = selectedPair
    ? pairKey(corr.labels[selectedPair.i], corr.labels[selectedPair.j])
    : null
  const selectedInsight = selectedKey ? (corrInsights[selectedKey] ?? corrInsights[pairKey(corr.labels[selectedPair!.j], corr.labels[selectedPair!.i])]) : null
  const selectedR = selectedPair ? corr.matrix[selectedPair.i][selectedPair.j] : null

  // Pivot chart
  const [pivotMetric, setPivotMetric] = useState(cards[0].name)
  const [chartType, setChartType] = useState<ChartType>("line")
  const [overlayMetric, setOverlayMetric] = useState<string>("none")
  const [pinned, setPinned] = useState<typeof pinnedViews>(pinnedViews)

  const activeCard = cards.find(c => c.name === pivotMetric) ?? cards[0]
  const overlayCard = cards.find(c => c.name === overlayMetric)

  function pinCurrentView() {
    if (pinned.length >= 3) return
    const title = overlayCard ? `${activeCard.name.split(" ")[0]} + ${overlayCard.name.split(" ")[0]}` : `${activeCard.name} · ${period}`
    setPinned(p => [...p, { id: `p${Date.now()}`, title, metrics: overlayCard ? [activeCard.name, overlayCard.name] : [activeCard.name], pinnedBy: "Darcy · now" }])
  }

  // Pivot table — heat map by day of week
  const { rows: pivotRows, weeks, values } = pivotData
  const allVals = values.flat()
  const pvMin = Math.min(...allVals)
  const pvMax = Math.max(...allVals)
  const rowMeans = values.map(row => parseFloat((row.reduce((a, b) => a + b, 0) / row.length).toFixed(1)))

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, padding: "24px 32px", maxWidth: 1300 }}>

      {/* Period toggle */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <span style={{ fontFamily: "var(--mono)", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--ink-3)" }}>Period</span>
        <div className="segmented">
          {DATA.trends.periods.map(p => (
            <button key={p} data-active={period === p} onClick={() => setPeriod(p)}>{p}</button>
          ))}
        </div>
      </div>

      {/* ── Hero chart (IRT AL score + biomarker overlays) ──────────────── */}
      <HeroChart computed={computed} eventMarkers={DATA.checkin.regimeChanges.map(rc => ({ dayIndex: rc.dayIndex, label: rc.label, color: rc.color }))} />

      {/* ── What-if simulation ──────────────────────────────────────────── */}
      <WhatIf currentZ={lastDay.z} currentAL={lastDay.alScore} />

      {/* ── Lag correlation engine ───────────────────────────────────────── */}
      <div className="panel">
        <div className="panel-head">
          <span>Lag cross-correlation · intervention response</span>
          <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Days until each biomarker responds to a protocol event
          </span>
        </div>
        <div style={{ padding: "16px 20px", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12 }}>
          {lagResults
            .filter(lr => Math.abs(lr.peakR) > 0.05)
            .sort((a, b) => Math.abs(b.peakR) - Math.abs(a.peakR))
            .slice(0, 10)
            .map(lr => (
              <div key={lr.key} style={{ borderLeft: `2px solid ${Math.abs(lr.peakR) > 0.3 ? "var(--warn)" : "var(--hair-strong)"}`, paddingLeft: 10 }}>
                <div style={{ fontFamily: "var(--mono)", fontSize: 8, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--ink-3)", marginBottom: 3 }}>
                  {lr.label}
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                  <span style={{ fontFamily: "var(--mono)", fontSize: 16, color: Math.abs(lr.peakR) > 0.3 ? "var(--warn)" : "var(--ink-2)", letterSpacing: "-0.02em" }}>
                    {lr.peakLag}d
                  </span>
                  <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-3)" }}>
                    r={lr.peakR > 0 ? "+" : ""}{lr.peakR.toFixed(2)}
                  </span>
                </div>
                <div style={{ display: "flex", gap: 2, marginTop: 6 }}>
                  {lr.lags.map((r, i) => (
                    <div
                      key={i}
                      title={`Lag ${i}d: r=${r.toFixed(2)}`}
                      style={{
                        width: 10, height: Math.abs(r) * 24,
                        background: i === lr.peakLag ? "var(--warn)" : "var(--hair-strong)",
                        alignSelf: "flex-end",
                        minHeight: 2,
                      }}
                    />
                  ))}
                </div>
                <div style={{ fontFamily: "var(--mono)", fontSize: 7, color: "var(--ink-4)", marginTop: 3, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  lag 0 ──────── 7d
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* ── Correlation matrix ───────────────────────────────────────────── */}
      <div className="panel">
        <div className="panel-head">
          <span>Cross-signal correlation engine</span>
          <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Click any cell · {period} · warm = co-elevation · cool = inverse
          </span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 0 }}>

          {/* Matrix */}
          <div style={{ padding: "16px 20px", overflowX: "auto", borderRight: "1px solid var(--hair)" }}>
            <table style={{ borderCollapse: "collapse", fontFamily: "var(--mono)", fontSize: 11 }}>
              <thead>
                <tr>
                  <th style={{ padding: "6px 10px", color: "var(--ink-3)", fontWeight: 400, textAlign: "left", borderBottom: "1px solid var(--hair-strong)", fontSize: 9 }} />
                  {corr.labels.map(l => (
                    <th key={l} style={{ padding: "6px 10px", color: "var(--ink-3)", fontWeight: 400, textAlign: "center", letterSpacing: "0.1em", textTransform: "uppercase", fontSize: 9, borderBottom: "1px solid var(--hair-strong)" }}>{l}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {corr.labels.map((row, i) => (
                  <tr key={row}>
                    <td style={{ padding: "4px 10px", color: "var(--ink-2)", textTransform: "uppercase", letterSpacing: "0.1em", fontSize: 9, borderBottom: "1px solid var(--hair)", whiteSpace: "nowrap" }}>{row}</td>
                    {corr.labels.map((_, j) => {
                      const r = corr.matrix[i][j]
                      const abs = Math.abs(r)
                      const isSelected = selectedPair && ((selectedPair.i === i && selectedPair.j === j) || (selectedPair.i === j && selectedPair.j === i))
                      const rank = top3.findIndex(p => (p.i === i && p.j === j) || (p.i === j && p.j === i))
                      return (
                        <td
                          key={j}
                          onClick={() => i !== j ? setSelectedPair({ i: Math.min(i, j), j: Math.max(i, j) }) : null}
                          style={{
                            padding: "10px 10px",
                            textAlign: "center",
                            background: i === j ? "var(--panel-2)" : corrColor(r),
                            borderBottom: "1px solid var(--hair)",
                            position: "relative",
                            color: i === j ? "var(--ink-3)" : corrTextColor(r, abs),
                            fontWeight: rank >= 0 && i !== j ? 500 : 400,
                            cursor: i !== j ? "pointer" : "default",
                            outline: isSelected ? "2px solid var(--ink)" : undefined,
                            outlineOffset: -2,
                            transition: "opacity 0.1s",
                            minWidth: 52,
                          }}
                        >
                          {i === j ? "—" : (r >= 0 ? "+" : "") + r.toFixed(2)}
                          {rank >= 0 && i !== j && (
                            <span style={{
                              position: "absolute", top: 2, right: 2,
                              fontFamily: "var(--mono)", fontSize: 8,
                              background: "var(--ink)", color: "var(--bg)",
                              width: 13, height: 13,
                              display: "flex", alignItems: "center", justifyContent: "center",
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
          </div>

          {/* Pair detail panel */}
          <div style={{ padding: "20px 24px", minWidth: 280 }}>
            {selectedPair && selectedR !== null ? (
              <>
                <div style={{ fontFamily: "var(--mono)", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--ink-3)", marginBottom: 8 }}>Selected pair</div>
                <div style={{ fontFamily: "var(--serif)", fontSize: 24, fontWeight: 300, letterSpacing: "-0.02em", color: "var(--ink)", marginBottom: 6 }}>
                  {corr.labels[selectedPair.i]} × {corr.labels[selectedPair.j]}
                </div>
                <div style={{ fontFamily: "var(--mono)", fontSize: 22, letterSpacing: "-0.03em", marginBottom: 16, color: Math.abs(selectedR) >= 0.6 ? (selectedR > 0 ? "var(--warn)" : "var(--ok)") : "var(--ink-2)" }}>
                  r = {selectedR >= 0 ? "+" : ""}{selectedR.toFixed(2)}
                </div>
                {selectedInsight ? (
                  <>
                    <p style={{ fontSize: 12.5, color: "var(--ink-2)", lineHeight: 1.6, marginBottom: 12 }}>
                      {selectedInsight.body}
                    </p>
                    <div style={{ borderLeft: "2px solid var(--accent)", paddingLeft: 10, marginBottom: 12 }}>
                      <div style={{ fontFamily: "var(--mono)", fontSize: 8, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--ink-3)", marginBottom: 4 }}>Action</div>
                      <div style={{ fontSize: 12, color: "var(--ink)", lineHeight: 1.5 }}>{selectedInsight.action}</div>
                    </div>
                    <LifecycleChip lc={selectedInsight.lifecycle} />
                    <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.06em", marginLeft: 8 }}>{selectedInsight.by}</span>
                  </>
                ) : (
                  <p style={{ fontSize: 12.5, color: "var(--ink-3)", lineHeight: 1.6, fontStyle: "italic", fontFamily: "var(--serif)" }}>
                    {corr.labels[selectedPair.i]} × {corr.labels[selectedPair.j]}: r = {selectedR.toFixed(2)}. Click another cell to explore a different pair. Insights are written by the agent and countersigned by Darcy when clinically meaningful.
                  </p>
                )}
              </>
            ) : (
              <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                Click any cell to explore a pair
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Pivot chart with overlay ─────────────────────────────────────── */}
      <div className="panel">
        <div className="pivot-head">
          <span style={{ fontFamily: "var(--mono)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--ink-2)" }}>
            Trend explorer
          </span>
          <div className="pivot-controls">
            <label>
              Metric
              <select value={pivotMetric} onChange={e => setPivotMetric(e.target.value)}>
                {cards.map(c => <option key={c.name}>{c.name}</option>)}
              </select>
            </label>
            <label>
              Overlay
              <select value={overlayMetric} onChange={e => setOverlayMetric(e.target.value)}>
                <option value="none">None</option>
                {cards.filter(c => c.name !== pivotMetric).map(c => <option key={c.name}>{c.name}</option>)}
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
            {role === "darcy" && (
              <button
                onClick={pinCurrentView}
                disabled={pinned.length >= 3}
                style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.08em", textTransform: "uppercase", border: "1px solid var(--hair-strong)", padding: "5px 10px", color: pinned.length >= 3 ? "var(--ink-3)" : "var(--ink-2)", background: "transparent", cursor: pinned.length >= 3 ? "not-allowed" : "pointer" }}
              >
                {pinned.length >= 3 ? "3 pinned (max)" : "Pin view"}
              </button>
            )}
          </div>
        </div>

        <div style={{ padding: "0 20px 20px" }}>
          <div style={{ display: "flex", gap: 24, marginBottom: 12, paddingTop: 12, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Current</div>
              <div style={{ fontFamily: "var(--mono)", fontSize: 20, letterSpacing: "-0.02em", color: "var(--ink)", marginTop: 2 }}>
                {activeCard.now} <span style={{ fontSize: 10, color: "var(--ink-3)" }}>{activeCard.unit}</span>
              </div>
            </div>
            <div>
              <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Delta</div>
              <div style={{ fontFamily: "var(--mono)", fontSize: 14, color: "var(--ink-2)", marginTop: 2 }}>{activeCard.delta}</div>
            </div>
            {overlayCard && (
              <div>
                <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Overlay</div>
                <div style={{ fontFamily: "var(--mono)", fontSize: 14, color: "var(--ok)", marginTop: 2 }}>{overlayCard.now} <span style={{ fontSize: 10, color: "var(--ink-3)" }}>{overlayCard.unit}</span></div>
              </div>
            )}
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Agent note</div>
              <div style={{ fontSize: 12, color: "var(--ink-2)", lineHeight: 1.5, marginTop: 2, fontStyle: "italic" }}>{activeCard.note}</div>
            </div>
          </div>
          <ChartPanel card={activeCard} events={events} type={chartType} overlay={!!overlayCard} overlayCard={overlayCard} />
        </div>
      </div>

      {/* ── Pinned views (Darcy) ─────────────────────────────────────────── */}
      {role === "darcy" && pinned.length > 0 && (
        <div className="panel">
          <div className="panel-head">
            <span>Pinned views</span>
            <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              {pinned.length}/3 · Darcy&apos;s saved chart configurations
            </span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${pinned.length}, 1fr)`, borderLeft: "1px solid var(--hair)" }}>
            {pinned.map(pv => {
              const pc = cards.find(c => c.name === pv.metrics[0]) ?? cards[0]
              const po = cards.find(c => c.name === pv.metrics[1])
              return (
                <div key={pv.id} style={{ borderRight: "1px solid var(--hair)", padding: "14px 16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
                    <div style={{ fontFamily: "var(--mono)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--ink-2)" }}>{pv.title}</div>
                    <button
                      onClick={() => setPinned(p => p.filter(x => x.id !== pv.id))}
                      style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-3)", background: "transparent", border: "none", cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.06em" }}
                    >
                      Unpin
                    </button>
                  </div>
                  <ChartPanel card={pc} events={events} type="line" overlay={!!po} overlayCard={po} />
                  <div style={{ marginTop: 6, fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{pv.pinnedBy}</div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Pivot heat-map table ─────────────────────────────────────────── */}
      <div className="panel">
        <div className="pivot-head">
          <div>
            <span style={{ fontFamily: "var(--mono)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--ink-2)" }}>Pivot · exploratory view</span>
            <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-3)", marginTop: 3 }}>Build your own slice · heat intensity = relative value</div>
          </div>
          <div className="pivot-controls">
            <label>Rows <select defaultValue="Day of week"><option>Day of week</option></select></label>
            <label>Metric <select defaultValue="Sleep h"><option>Sleep h</option></select></label>
            <label>Weeks <select defaultValue="8"><option>8</option><option>4</option><option>12</option></select></label>
          </div>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="pivot-table" style={{ minWidth: 700 }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left" }}>Day of week</th>
                {weeks.map(w => <th key={w}>{w}</th>)}
                <th>Mean</th>
              </tr>
            </thead>
            <tbody>
              {pivotRows.map((row, ri) => (
                <tr key={row}>
                  <td style={{ textAlign: "left", color: "var(--ink-2)" }}>{row}</td>
                  {values[ri].map((v, wi) => {
                    const opacity = heatOpacity(v, pvMin, pvMax)
                    return (
                      <td key={wi} className="heat" style={{ "--heat": opacity } as React.CSSProperties}>
                        <span>{v.toFixed(1)}</span>
                      </td>
                    )
                  })}
                  <td style={{ color: "var(--ink-2)", fontWeight: 500 }}>{rowMeans[ri]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Insight feed ─────────────────────────────────────────────────── */}
      <div className="panel">
        <div className="panel-head">
          <span>Insights</span>
          <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Agent · reviewed by Darcy
          </span>
        </div>
        {insights.map(ins => (
          <div
            key={ins.id}
            style={{ padding: "14px 20px", borderTop: "1px solid var(--hair)", cursor: "pointer" }}
            onClick={() => setOpenInsight(openInsight === ins.id ? null : ins.id)}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                <span style={{
                  fontFamily: "var(--mono)", fontSize: 8, letterSpacing: "0.08em", textTransform: "uppercase",
                  color: ins.strength === "high" ? "var(--ok)" : "var(--warn)",
                  border: `1px solid ${ins.strength === "high" ? "var(--ok)" : "var(--warn)"}`,
                  padding: "2px 5px", flexShrink: 0,
                }}>
                  {ins.strength}
                </span>
                <span style={{ fontSize: 13.5, color: "var(--ink)" }}>{ins.title}</span>
              </div>
              <LifecycleChip lc={ins.lifecycle} />
            </div>
            {openInsight === ins.id && (
              <div style={{ marginTop: 12 }}>
                <p style={{ fontSize: 12.5, color: "var(--ink-2)", lineHeight: 1.6, marginBottom: 10 }}>{ins.body}</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
                  {ins.refs.map(r => (
                    <span key={r} style={{ fontFamily: "var(--mono)", fontSize: 10, border: "1px solid var(--hair)", padding: "2px 6px", color: "var(--ink-2)" }}>{r}</span>
                  ))}
                </div>
                <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ok)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{ins.by}</div>
              </div>
            )}
          </div>
        ))}
      </div>

    </div>
  )
}
