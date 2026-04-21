"use client"

import { useState, useMemo } from "react"
import { DATA } from "@/data/james"
import { useApp } from "@/components/RoleContext"
import { T, LifecycleChip } from "@/components/Primitives"
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
  if (abs >= 0.6) return r > 0 ? T.warn : T.ok
  return T.ink2
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

const OVERLAY_COLORS = [T.ok, "#C8A56A", "#9B8FA9"] as const

const tooltipStyle = {
  contentStyle: { background: T.surfaceRaised, border: `1px solid ${T.borderMed}`, borderRadius: 8, fontFamily: T.sans, fontSize: 11 },
  itemStyle: { color: T.ink },
  labelStyle: { color: T.ink3 },
}

function ChartPanel({
  card,
  events,
  regimeChanges,
  type,
  overlayCards,
}: {
  card: typeof DATA.trends.cards[number]
  events: typeof DATA.trends.events
  regimeChanges?: typeof DATA.checkin.regimeChanges
  type: ChartType
  overlayCards?: typeof DATA.trends.cards[number][]
}) {
  const hasOverlays = !!overlayCards && overlayCards.length > 0

  const data = card.data.map((v, i) => {
    const d: Record<string, number> = { day: i + 1, primary: parseFloat(v.toFixed(2)) }
    overlayCards?.forEach((oc, idx) => { d[`ov${idx}`] = parseFloat(oc.data[i].toFixed(2)) })
    return d
  })

  return (
    <div style={{ height: 180 }}>
      <ResponsiveContainer width="100%" height="100%">
        {type === "line" ? (
          <LineChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
            <CartesianGrid stroke={T.border} vertical={false} />
            <XAxis dataKey="day" tick={{ fontFamily: T.sans, fontSize: 10, fill: T.ink3 }} tickLine={false} axisLine={false} />
            <YAxis yAxisId="left" tick={{ fontFamily: T.sans, fontSize: 10, fill: T.ink3 }} tickLine={false} axisLine={false} domain={["auto", "auto"]} />
            {hasOverlays && <YAxis yAxisId="right" orientation="right" tick={{ fontFamily: T.sans, fontSize: 10, fill: T.ink3 }} tickLine={false} axisLine={false} domain={["auto", "auto"]} />}
            <Tooltip {...tooltipStyle} />
            {events.map(ev => (
              <ReferenceLine key={`ev-${ev.day}`} x={ev.day} yAxisId="left" stroke={T.ink3} strokeDasharray="2 4" strokeWidth={1}
                label={{ value: ev.lbl, position: "insideTopLeft", fontSize: 9, fill: T.ink3, fontFamily: T.sans }} />
            ))}
            {regimeChanges?.map(rc => (
              <ReferenceLine key={`rc-${rc.dayIndex}`} x={rc.dayIndex + 1} yAxisId="left"
                stroke={rc.color} strokeDasharray="1 2" strokeWidth={2}
                label={{ value: `▲ ${rc.label}`, position: "insideTopRight", fontSize: 9, fill: rc.color, fontFamily: T.sans }} />
            ))}
            {card.band && <>
              <ReferenceLine y={card.band[0]} yAxisId="left" stroke={T.border} strokeDasharray="3 3" />
              <ReferenceLine y={card.band[1]} yAxisId="left" stroke={T.border} strokeDasharray="3 3" />
            </>}
            <Line yAxisId="left" type="monotone" dataKey="primary" stroke={T.accent} strokeWidth={1.5} dot={false} name={card.name} />
            {overlayCards?.map((oc, idx) => (
              <Line key={oc.name} yAxisId="right" type="monotone" dataKey={`ov${idx}`}
                stroke={OVERLAY_COLORS[idx % OVERLAY_COLORS.length]} strokeWidth={1.5}
                dot={false} strokeDasharray="4 2" name={oc.name} />
            ))}
            {hasOverlays && <Legend wrapperStyle={{ fontFamily: T.sans, fontSize: 11, color: T.ink3 }} />}
          </LineChart>
        ) : (
          <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
            <CartesianGrid stroke={T.border} vertical={false} />
            <XAxis dataKey="day" tick={{ fontFamily: T.sans, fontSize: 10, fill: T.ink3 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontFamily: T.sans, fontSize: 10, fill: T.ink3 }} tickLine={false} axisLine={false} domain={["auto", "auto"]} />
            <Tooltip {...tooltipStyle} />
            {events.map(ev => (
              <ReferenceLine key={`ev-${ev.day}`} x={ev.day} stroke={T.ink3} strokeDasharray="2 4" strokeWidth={1} />
            ))}
            {regimeChanges?.map(rc => (
              <ReferenceLine key={`rc-${rc.dayIndex}`} x={rc.dayIndex + 1}
                stroke={rc.color} strokeDasharray="1 2" strokeWidth={2} />
            ))}
            <Bar dataKey="primary" fill={T.accent} opacity={0.75} radius={2} name={card.name} />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  )
}

// ─── Section header helper ────────────────────────────────────────────────────

function SectionHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <div style={{ padding: "20px 28px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <span style={{ fontFamily: T.sans, fontSize: 14, fontWeight: 500, color: T.ink }}>{title}</span>
      {sub && <span style={{ fontFamily: T.sans, fontSize: 12, color: T.ink3 }}>{sub}</span>}
    </div>
  )
}

// ─── main page ───────────────────────────────────────────────────────────────

export default function TrendsPage() {
  const { role } = useApp()
  const { corr, cards, insights, events, corrInsights, pinnedViews } = DATA.trends

  // IRT computation
  const computed = useMemo(() => computeSeries(DATA.rawTimeSeries), [])
  const lastDay = computed[computed.length - 1]
  const eventIndices = DATA.checkin.regimeChanges.map(rc => rc.dayIndex)
  const lagResults = useMemo(() => lagCorrelations(computed, eventIndices), [computed])

  // Period
  const [period, setPeriod] = useState("30d")

  // Insight feed
  const [openInsight, setOpenInsight] = useState<string | null>(null)

  // Correlation matrix
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
  const [overlayMetrics, setOverlayMetrics] = useState<string[]>([])
  const [pinned, setPinned] = useState<typeof pinnedViews>(pinnedViews)

  const activeCard = cards.find(c => c.name === pivotMetric) ?? cards[0]
  const overlayCards = cards.filter(c => overlayMetrics.includes(c.name))

  // Pivot deep dive
  const [pivotCardName, setPivotCardName] = useState(cards[0].name)
  const [selectedPivotCell, setSelectedPivotCell] = useState<[number, number] | null>(null)
  const pivotCard = cards.find(c => c.name === pivotCardName) ?? cards[0]

  const PIVOT_ROWS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  const PIVOT_WEEKS = ["W-4", "W-3", "W-2", "W-1"]
  const pivotValues: number[][] = PIVOT_ROWS.map((_, di) =>
    PIVOT_WEEKS.map((_, wi) => {
      const idx = 2 + wi * 7 + di
      return idx < pivotCard.data.length ? parseFloat(pivotCard.data[idx].toFixed(2)) : NaN
    })
  )
  const allPivotVals = pivotValues.flat().filter(v => !isNaN(v))
  const pvMin = Math.min(...allPivotVals)
  const pvMax = Math.max(...allPivotVals)
  const pvRange = pvMax - pvMin || 1
  const pivotRowMeans = pivotValues.map(row => {
    const v = row.filter(x => !isNaN(x))
    return v.length ? parseFloat((v.reduce((a, b) => a + b, 0) / v.length).toFixed(2)) : NaN
  })
  const pivotRowMins  = pivotValues.map(row => Math.min(...row.filter(x => !isNaN(x))))
  const pivotRowMaxes = pivotValues.map(row => Math.max(...row.filter(x => !isNaN(x))))
  const pivotRowTrends = pivotValues.map(row => {
    const early = row.slice(0, 2).filter(x => !isNaN(x))
    const late  = row.slice(2).filter(x => !isNaN(x))
    if (!early.length || !late.length) return "→"
    const diff = late.reduce((a,b)=>a+b,0)/late.length - early.reduce((a,b)=>a+b,0)/early.length
    if (Math.abs(diff) < pvRange * 0.04) return "→"
    return diff > 0 ? "↑" : "↓"
  })

  function toggleOverlay(name: string) {
    setOverlayMetrics(prev => {
      if (prev.includes(name)) return prev.filter(m => m !== name)
      if (prev.length >= 3) return prev
      return [...prev, name]
    })
  }

  function pinCurrentView() {
    if (pinned.length >= 3) return
    const title = overlayCards.length
      ? `${activeCard.name.split(" ")[0]} + ${overlayCards.map(o => o.name.split(" ")[0]).join(" + ")}`
      : `${activeCard.name} · ${period}`
    const metrics = [activeCard.name, ...overlayCards.map(o => o.name)]
    setPinned(p => [...p, { id: `p${Date.now()}`, title, metrics, pinnedBy: "Darcy · now" }])
  }

  const selectStyle = {
    background: T.surfaceRaised, border: `1px solid ${T.borderMed}`,
    borderRadius: 6, color: T.ink, fontFamily: T.sans, fontSize: 12,
    padding: "4px 8px", marginLeft: 8, cursor: "pointer",
  }

  return (
    <div style={{ padding: "48px 48px 80px", maxWidth: 960, margin: "0 auto" }}>

      {/* Page header + period toggle */}
      <div style={{ marginBottom: 48, display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontFamily: T.serif, fontSize: 32, fontWeight: 300, color: T.ink, margin: "0 0 8px", letterSpacing: "-0.02em" }}>Trends</h1>
          <div style={{ fontFamily: T.sans, fontSize: 13, color: T.ink3 }}>30-day biomarker and recovery history</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontFamily: T.sans, fontSize: 12, color: T.ink3 }}>Period</span>
          <div style={{ display: "flex", gap: 4, background: T.surface, borderRadius: 8, padding: 4 }}>
            {DATA.trends.periods.map(p => (
              <button key={p} onClick={() => setPeriod(p)} style={{
                fontFamily: T.sans, fontSize: 12, padding: "5px 12px", borderRadius: 6,
                border: "none", cursor: "pointer",
                background: period === p ? T.surfaceRaised : "transparent",
                color: period === p ? T.ink : T.ink3,
                fontWeight: period === p ? 500 : 400,
              }}>{p}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Z-score scorecard */}
      <div style={{ background: T.surface, borderRadius: 12, overflow: "hidden", marginBottom: 56 }}>
        <div style={{ padding: "20px 28px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontFamily: T.sans, fontSize: 14, fontWeight: 500, color: T.ink }}>Biomarker Z-scores · today vs 21-day baseline</span>
          <button
            title="Z-score measures how far today's reading is from your personal 21-day rolling mean, in standard deviations."
            style={{ fontFamily: T.sans, fontSize: 12, color: T.ink3, background: T.surfaceRaised, border: `1px solid ${T.borderMed}`, borderRadius: 6, padding: "4px 10px", cursor: "pointer" }}
          >
            What is a Z-score?
          </button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", padding: "4px 0" }}>
          {(Object.keys(WEIGHTS) as MetricKey[]).map((k, idx) => {
            const z = lastDay.z[k]
            const raw = lastDay.raw[k as keyof typeof lastDay.raw] as number
            const color = z > 1.2 ? T.alert : z > 0.5 ? T.warn : z < -0.5 ? T.ok : T.ink2
            const barW = Math.abs(z) / 3 * 100
            const isPositive = z >= 0
            return (
              <div key={k} style={{
                padding: "16px 18px",
                borderRight: idx % 6 !== 5 ? `1px solid ${T.border}` : undefined,
                borderTop: idx >= 6 ? `1px solid ${T.border}` : undefined,
              }}>
                <div style={{ fontFamily: T.sans, fontSize: 11, color: T.ink3, marginBottom: 6 }}>
                  {WEIGHTS[k].label}
                </div>
                <div style={{ fontFamily: T.mono, fontSize: 20, fontWeight: 300, letterSpacing: "-0.03em", color, lineHeight: 1, marginBottom: 3 }}>
                  {z > 0 ? "+" : ""}{z.toFixed(2)}σ
                </div>
                <div style={{ fontFamily: T.mono, fontSize: 10, color: T.ink4, marginBottom: 10 }}>
                  {raw.toFixed(1)} {WEIGHTS[k].unit}
                </div>
                <div style={{ height: 3, background: T.border, borderRadius: 2, position: "relative" }}>
                  <div style={{
                    position: "absolute", height: "100%",
                    width: `${barW}%`, background: color, borderRadius: 2,
                    left: isPositive ? "50%" : `${50 - barW}%`,
                  }} />
                  <div style={{ position: "absolute", left: "50%", top: -2, width: 1, height: 7, background: T.ink3 }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Hero chart */}
      <div style={{ marginBottom: 56 }}>
        <HeroChart computed={computed} eventMarkers={DATA.checkin.regimeChanges.map(rc => ({ dayIndex: rc.dayIndex, label: rc.label, color: rc.color }))} />
      </div>

      {/* What-if simulation */}
      <div style={{ marginBottom: 56 }}>
        <WhatIf currentZ={lastDay.z} currentAL={lastDay.alScore} />
      </div>

      {/* Lag correlation */}
      <div style={{ background: T.surface, borderRadius: 12, overflow: "hidden", marginBottom: 56 }}>
        <SectionHeader title="Lag cross-correlation · intervention response" sub="Days until each biomarker responds to a protocol event" />
        <div style={{ padding: "20px 28px", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 16 }}>
          {lagResults
            .filter(lr => Math.abs(lr.peakR) > 0.05)
            .sort((a, b) => Math.abs(b.peakR) - Math.abs(a.peakR))
            .slice(0, 10)
            .map(lr => (
              <div key={lr.key} style={{ borderLeft: `2px solid ${Math.abs(lr.peakR) > 0.3 ? T.warn : T.border}`, paddingLeft: 12 }}>
                <div style={{ fontFamily: T.sans, fontSize: 11, color: T.ink3, marginBottom: 4 }}>
                  {lr.label}
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                  <span style={{ fontFamily: T.mono, fontSize: 18, fontWeight: 300, color: Math.abs(lr.peakR) > 0.3 ? T.warn : T.ink2, letterSpacing: "-0.02em" }}>
                    {lr.peakLag}d
                  </span>
                  <span style={{ fontFamily: T.mono, fontSize: 10, color: T.ink3 }}>
                    r={lr.peakR > 0 ? "+" : ""}{lr.peakR.toFixed(2)}
                  </span>
                </div>
                <div style={{ display: "flex", gap: 2, marginTop: 8 }}>
                  {lr.lags.map((r, i) => (
                    <div
                      key={i}
                      title={`Lag ${i}d: r=${r.toFixed(2)}`}
                      style={{
                        width: 10, height: Math.abs(r) * 24, borderRadius: 1,
                        background: i === lr.peakLag ? T.warn : T.border,
                        alignSelf: "flex-end", minHeight: 2,
                      }}
                    />
                  ))}
                </div>
                <div style={{ fontFamily: T.sans, fontSize: 10, color: T.ink4, marginTop: 4 }}>
                  lag 0 — 7d
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Trend explorer */}
      <div style={{ background: T.surface, borderRadius: 12, overflow: "hidden", marginBottom: 56 }}>
        <div style={{ padding: "20px 28px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <span style={{ fontFamily: T.sans, fontSize: 14, fontWeight: 500, color: T.ink }}>Trend explorer</span>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <label style={{ fontFamily: T.sans, fontSize: 12, color: T.ink3, display: "flex", alignItems: "center" }}>
              Metric
              <select value={pivotMetric} onChange={e => { setPivotMetric(e.target.value); setOverlayMetrics([]) }} style={selectStyle}>
                {cards.map(c => <option key={c.name}>{c.name}</option>)}
              </select>
            </label>
            <div style={{ display: "flex", gap: 4, background: T.surfaceRaised, borderRadius: 6, padding: 3 }}>
              {CHART_TYPES.map(t => (
                <button key={t} onClick={() => setChartType(t)} style={{
                  fontFamily: T.sans, fontSize: 11, padding: "4px 10px", borderRadius: 4,
                  border: "none", cursor: "pointer",
                  background: chartType === t ? T.surface : "transparent",
                  color: chartType === t ? T.ink : T.ink3,
                  fontWeight: chartType === t ? 500 : 400,
                }}>{t}</button>
              ))}
            </div>
            <button
              onClick={pinCurrentView}
              disabled={pinned.length >= 3}
              style={{ fontFamily: T.sans, fontSize: 12, border: `1px solid ${T.borderMed}`, borderRadius: 6, padding: "5px 12px", color: pinned.length >= 3 ? T.ink3 : T.ink2, background: "transparent", cursor: pinned.length >= 3 ? "not-allowed" : "pointer" }}
            >
              {pinned.length >= 3 ? "3 pinned (max)" : "Pin view"}
            </button>
          </div>
        </div>

        {/* Overlay selector */}
        <div style={{ padding: "14px 28px", borderBottom: `1px solid ${T.border}` }}>
          <div style={{ fontFamily: T.sans, fontSize: 11, color: T.ink3, marginBottom: 8 }}>Overlay metrics — up to 3</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {cards.filter(c => c.name !== pivotMetric).map((c) => {
              const active = overlayMetrics.includes(c.name)
              const colorIdx = overlayMetrics.indexOf(c.name)
              const color = active ? OVERLAY_COLORS[colorIdx] : T.ink3
              const disabled = !active && overlayMetrics.length >= 3
              return (
                <button
                  key={c.name}
                  onClick={() => !disabled && toggleOverlay(c.name)}
                  style={{
                    fontFamily: T.sans, fontSize: 11, padding: "4px 12px",
                    border: `1px solid ${active ? color : T.borderMed}`,
                    borderRadius: 20,
                    background: active ? `${color}18` : "transparent",
                    color: disabled ? T.ink4 : color,
                    cursor: disabled ? "not-allowed" : "pointer",
                  }}
                >
                  {active && <span style={{ marginRight: 4 }}>●</span>}
                  {c.name.split(" ")[0]} {c.unit && <span style={{ opacity: 0.6 }}>{c.unit}</span>}
                </button>
              )
            })}
          </div>
        </div>

        <div style={{ padding: "20px 28px" }}>
          <div style={{ display: "flex", gap: 28, marginBottom: 16, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontFamily: T.sans, fontSize: 11, color: T.ink3, marginBottom: 4 }}>Current</div>
              <div style={{ fontFamily: T.mono, fontSize: 22, fontWeight: 300, letterSpacing: "-0.02em", color: T.ink }}>
                {activeCard.now} <span style={{ fontFamily: T.sans, fontSize: 11, color: T.ink3 }}>{activeCard.unit}</span>
              </div>
            </div>
            <div>
              <div style={{ fontFamily: T.sans, fontSize: 11, color: T.ink3, marginBottom: 4 }}>Delta</div>
              <div style={{ fontFamily: T.mono, fontSize: 15, color: T.ink2 }}>{activeCard.delta}</div>
            </div>
            {overlayCards.map((oc, idx) => (
              <div key={oc.name}>
                <div style={{ fontFamily: T.sans, fontSize: 11, color: T.ink3, marginBottom: 4 }}>Overlay {idx + 1}</div>
                <div style={{ fontFamily: T.mono, fontSize: 15, color: OVERLAY_COLORS[idx] }}>
                  {oc.now} <span style={{ fontFamily: T.sans, fontSize: 11, color: T.ink3 }}>{oc.unit}</span>
                </div>
              </div>
            ))}
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: T.sans, fontSize: 11, color: T.ink3, marginBottom: 4 }}>Note</div>
              <div style={{ fontFamily: T.sans, fontSize: 13, color: T.ink2, lineHeight: 1.55, fontStyle: "italic" }}>{activeCard.note}</div>
            </div>
          </div>
          <ChartPanel card={activeCard} events={events} regimeChanges={DATA.checkin.regimeChanges} type={chartType} overlayCards={overlayCards.length ? overlayCards : undefined} />
        </div>
      </div>

      {/* Pinned views — coach only */}
      {role === "darcy" && pinned.length > 0 && (
        <div style={{ background: T.surface, borderRadius: 12, overflow: "hidden", marginBottom: 56 }}>
          <SectionHeader title="Pinned views" sub={`${pinned.length}/3 · Darcy's saved configurations`} />
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${pinned.length}, 1fr)`, borderLeft: `1px solid ${T.border}` }}>
            {pinned.map(pv => {
              const pc = cards.find(c => c.name === pv.metrics[0]) ?? cards[0]
              const pinnedOverlays = pv.metrics.slice(1).map(m => cards.find(c => c.name === m)).filter(Boolean) as typeof cards
              return (
                <div key={pv.id} style={{ borderRight: `1px solid ${T.border}`, padding: "16px 20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
                    <div style={{ fontFamily: T.sans, fontSize: 13, fontWeight: 500, color: T.ink2 }}>{pv.title}</div>
                    <button
                      onClick={() => setPinned(p => p.filter(x => x.id !== pv.id))}
                      style={{ fontFamily: T.sans, fontSize: 11, color: T.ink3, background: "transparent", border: "none", cursor: "pointer" }}
                    >
                      Unpin
                    </button>
                  </div>
                  <ChartPanel card={pc} events={events} type="line" overlayCards={pinnedOverlays.length ? pinnedOverlays : undefined} />
                  <div style={{ marginTop: 8, fontFamily: T.sans, fontSize: 11, color: T.ink3 }}>{pv.pinnedBy}</div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Pivot deep dive */}
      <div style={{ background: T.surface, borderRadius: 12, overflow: "hidden", marginBottom: 56 }}>
        <div style={{ padding: "20px 28px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <span style={{ fontFamily: T.sans, fontSize: 14, fontWeight: 500, color: T.ink }}>Pivot · day-of-week deep dive</span>
            <div style={{ fontFamily: T.sans, fontSize: 12, color: T.ink3, marginTop: 3 }}>
              4 complete weeks · Mon–Sun · heat = relative value · click any cell to inspect
            </div>
          </div>
          <label style={{ fontFamily: T.sans, fontSize: 12, color: T.ink3, display: "flex", alignItems: "center" }}>
            Metric
            <select value={pivotCardName} onChange={e => { setPivotCardName(e.target.value); setSelectedPivotCell(null) }} style={selectStyle}>
              {cards.map(c => <option key={c.name}>{c.name}</option>)}
            </select>
          </label>
        </div>

        {/* Selected cell detail */}
        {selectedPivotCell && (() => {
          const [ri, wi] = selectedPivotCell
          const v = pivotValues[ri][wi]
          const inBand = pivotCard.band && v >= pivotCard.band[0] && v <= pivotCard.band[1]
          const [lo, hi] = pivotCard.band ?? [pvMin, pvMax]
          return (
            <div style={{ borderTop: `1px solid ${T.border}`, padding: "14px 28px", display: "flex", gap: 24, alignItems: "center", background: T.surfaceRaised }}>
              <div>
                <div style={{ fontFamily: T.sans, fontSize: 11, color: T.ink3 }}>
                  {PIVOT_ROWS[ri]} · {PIVOT_WEEKS[wi]}
                </div>
                <div style={{ fontFamily: T.mono, fontSize: 22, fontWeight: 300, letterSpacing: "-0.03em", color: T.ink, marginTop: 2 }}>
                  {v.toFixed(1)} <span style={{ fontFamily: T.sans, fontSize: 11, color: T.ink3 }}>{pivotCard.unit}</span>
                </div>
              </div>
              <div style={{ height: 36, width: 1, background: T.border }} />
              <div>
                <div style={{ fontFamily: T.sans, fontSize: 11, color: T.ink3 }}>Target band</div>
                <div style={{ fontFamily: T.mono, fontSize: 12, color: inBand ? T.ok : T.warn, marginTop: 2 }}>
                  {lo}–{hi} {pivotCard.unit} {inBand ? "✓ in range" : "⚠ out of band"}
                </div>
              </div>
              <div style={{ height: 36, width: 1, background: T.border }} />
              <div>
                <div style={{ fontFamily: T.sans, fontSize: 11, color: T.ink3 }}>vs week mean</div>
                <div style={{ fontFamily: T.mono, fontSize: 12, color: T.ink2, marginTop: 2 }}>
                  {v > pivotRowMeans[ri] ? "+" : ""}{(v - pivotRowMeans[ri]).toFixed(2)}
                </div>
              </div>
              <button
                onClick={() => setSelectedPivotCell(null)}
                style={{ marginLeft: "auto", fontFamily: T.sans, fontSize: 12, border: `1px solid ${T.borderMed}`, borderRadius: 6, background: "transparent", color: T.ink3, padding: "5px 12px", cursor: "pointer" }}
              >
                Close
              </button>
            </div>
          )
        })()}

        <div style={{ overflowX: "auto" }}>
          <table className="pivot-table" style={{ minWidth: 700 }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", fontFamily: T.sans, fontWeight: 500 }}>Day</th>
                {PIVOT_WEEKS.map(w => <th key={w} style={{ fontFamily: T.sans, fontWeight: 500 }}>{w}</th>)}
                <th style={{ fontFamily: T.sans, fontWeight: 500 }}>Mean</th>
                <th style={{ fontFamily: T.sans, fontWeight: 500 }}>Min</th>
                <th style={{ fontFamily: T.sans, fontWeight: 500 }}>Max</th>
                <th style={{ fontFamily: T.sans, fontWeight: 500 }}>Trend</th>
              </tr>
            </thead>
            <tbody>
              {PIVOT_ROWS.map((row, ri) => (
                <tr key={row}>
                  <td style={{ textAlign: "left", color: T.ink2, fontFamily: T.sans }}>{row}</td>
                  {pivotValues[ri].map((v, wi) => {
                    const opacity = heatOpacity(v, pvMin, pvMax)
                    const isSelected = selectedPivotCell?.[0] === ri && selectedPivotCell?.[1] === wi
                    return (
                      <td
                        key={wi}
                        className="heat"
                        onClick={() => setSelectedPivotCell(isSelected ? null : [ri, wi])}
                        style={{
                          "--heat": opacity,
                          cursor: "pointer",
                          outline: isSelected ? `2px solid ${T.warn}` : undefined,
                          outlineOffset: "-2px",
                        } as React.CSSProperties}
                      >
                        <span style={{ fontFamily: T.mono, fontSize: 12, fontWeight: 300 }}>{isNaN(v) ? "—" : v.toFixed(1)}</span>
                      </td>
                    )
                  })}
                  <td style={{ color: T.ink2, fontFamily: T.mono, fontSize: 12, fontWeight: 400 }}>{pivotRowMeans[ri].toFixed(1)}</td>
                  <td style={{ color: T.ink3, fontFamily: T.mono, fontSize: 11 }}>{pivotRowMins[ri].toFixed(1)}</td>
                  <td style={{ color: T.ink3, fontFamily: T.mono, fontSize: 11 }}>{pivotRowMaxes[ri].toFixed(1)}</td>
                  <td style={{ color: pivotRowTrends[ri] === "↑" ? T.warn : pivotRowTrends[ri] === "↓" ? T.ok : T.ink3, fontSize: 14, textAlign: "center" }}>
                    {pivotRowTrends[ri]}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {pivotCard.note && (
          <div style={{ padding: "12px 28px", borderTop: `1px solid ${T.border}`, fontFamily: T.sans, fontSize: 12, color: T.ink3, fontStyle: "italic" }}>
            {pivotCard.note}
          </div>
        )}
      </div>

      {/* Insight feed */}
      <div style={{ background: T.surface, borderRadius: 12, overflow: "hidden", marginBottom: 56 }}>
        <SectionHeader title="Insights" sub="Reviewed by Darcy" />
        {insights.map(ins => (
          <div
            key={ins.id}
            style={{ padding: "16px 28px", borderTop: `1px solid ${T.border}`, cursor: "pointer" }}
            onClick={() => setOpenInsight(openInsight === ins.id ? null : ins.id)}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{
                  fontFamily: T.sans, fontSize: 11, fontWeight: 500,
                  color: ins.strength === "high" ? T.ok : T.warn,
                  background: ins.strength === "high" ? T.okSubtle : T.warnSubtle,
                  padding: "2px 8px", borderRadius: 20, flexShrink: 0,
                }}>
                  {ins.strength}
                </span>
                <span style={{ fontFamily: T.sans, fontSize: 14, color: T.ink }}>{ins.title}</span>
              </div>
              <LifecycleChip lc={ins.lifecycle} />
            </div>
            {openInsight === ins.id && (
              <div style={{ marginTop: 14 }}>
                <p style={{ fontFamily: T.sans, fontSize: 13, color: T.ink2, lineHeight: 1.65, marginBottom: 12 }}>{ins.body}</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
                  {ins.refs.map(r => (
                    <span key={r} style={{ fontFamily: T.mono, fontSize: 10, border: `1px solid ${T.border}`, borderRadius: 4, padding: "2px 6px", color: T.ink2 }}>{r}</span>
                  ))}
                </div>
                <div style={{ fontFamily: T.sans, fontSize: 11, color: T.ok, fontWeight: 500 }}>{ins.by}</div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Correlation matrix */}
      <div style={{ background: T.surface, borderRadius: 12, overflow: "hidden" }}>
        <SectionHeader title="Cross-signal correlation engine" sub={`Click any cell · ${period} · warm = co-elevation · cool = inverse`} />
        <div style={{ display: "grid", gridTemplateColumns: "auto 1fr" }}>
          {/* Matrix */}
          <div style={{ padding: "20px 24px", overflowX: "auto", borderRight: `1px solid ${T.border}` }}>
            <table style={{ borderCollapse: "collapse", fontFamily: T.mono, fontSize: 11 }}>
              <thead>
                <tr>
                  <th style={{ padding: "6px 10px", color: T.ink3, fontWeight: 400, textAlign: "left", borderBottom: `1px solid ${T.borderMed}`, fontSize: 10, fontFamily: T.sans }} />
                  {corr.labels.map(l => (
                    <th key={l} style={{ padding: "6px 10px", color: T.ink3, fontWeight: 500, textAlign: "center", fontSize: 10, borderBottom: `1px solid ${T.borderMed}`, fontFamily: T.sans }}>{l}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {corr.labels.map((row, i) => (
                  <tr key={row}>
                    <td style={{ padding: "4px 10px", color: T.ink2, fontSize: 10, borderBottom: `1px solid ${T.border}`, whiteSpace: "nowrap", fontFamily: T.sans }}>{row}</td>
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
                            padding: "10px 10px", textAlign: "center",
                            background: i === j ? T.surfaceRaised : corrColor(r),
                            borderBottom: `1px solid ${T.border}`, position: "relative",
                            color: i === j ? T.ink3 : corrTextColor(r, abs),
                            fontWeight: rank >= 0 && i !== j ? 500 : 400,
                            cursor: i !== j ? "pointer" : "default",
                            outline: isSelected ? `2px solid ${T.ink}` : undefined,
                            outlineOffset: -2, minWidth: 52,
                            fontFamily: T.mono, fontSize: 11,
                          }}
                        >
                          {i === j ? "—" : (r >= 0 ? "+" : "") + r.toFixed(2)}
                          {rank >= 0 && i !== j && (
                            <span style={{ position: "absolute", top: 2, right: 2, fontFamily: T.sans, fontSize: 9, background: T.ink, color: T.bg, width: 14, height: 14, borderRadius: 3, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>
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
          {/* Pair detail */}
          <div style={{ padding: "24px 28px", minWidth: 280 }}>
            {selectedPair && selectedR !== null ? (
              <>
                <div style={{ fontFamily: T.sans, fontSize: 12, color: T.ink3, marginBottom: 10 }}>Selected pair</div>
                <div style={{ fontFamily: T.serif, fontSize: 24, fontWeight: 300, letterSpacing: "-0.02em", color: T.ink, marginBottom: 8 }}>
                  {corr.labels[selectedPair.i]} × {corr.labels[selectedPair.j]}
                </div>
                <div style={{ fontFamily: T.mono, fontSize: 24, fontWeight: 300, letterSpacing: "-0.03em", marginBottom: 20, color: Math.abs(selectedR) >= 0.6 ? (selectedR > 0 ? T.warn : T.ok) : T.ink2 }}>
                  r = {selectedR >= 0 ? "+" : ""}{selectedR.toFixed(2)}
                </div>
                {selectedInsight ? (
                  <>
                    <p style={{ fontFamily: T.sans, fontSize: 13, color: T.ink2, lineHeight: 1.65, marginBottom: 14 }}>{selectedInsight.body}</p>
                    <div style={{ borderLeft: `2px solid ${T.accent}`, paddingLeft: 12, marginBottom: 14 }}>
                      <div style={{ fontFamily: T.sans, fontSize: 11, color: T.ink3, marginBottom: 4 }}>Action</div>
                      <div style={{ fontFamily: T.sans, fontSize: 13, color: T.ink, lineHeight: 1.55 }}>{selectedInsight.action}</div>
                    </div>
                    <LifecycleChip lc={selectedInsight.lifecycle} />
                    <span style={{ fontFamily: T.sans, fontSize: 11, color: T.ink3, marginLeft: 10 }}>{selectedInsight.by}</span>
                  </>
                ) : (
                  <p style={{ fontFamily: T.serif, fontSize: 15, color: T.ink3, lineHeight: 1.65, fontStyle: "italic" }}>
                    {corr.labels[selectedPair.i]} × {corr.labels[selectedPair.j]}: r = {selectedR.toFixed(2)}. Click another cell to explore a different pair.
                  </p>
                )}
              </>
            ) : (
              <div style={{ fontFamily: T.sans, fontSize: 13, color: T.ink3 }}>
                Click any cell to explore a pair
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  )
}
