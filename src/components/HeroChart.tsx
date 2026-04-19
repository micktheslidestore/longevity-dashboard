"use client"

import { useState, useMemo } from "react"
import {
  ResponsiveContainer, ComposedChart, Area, Line, CartesianGrid,
  XAxis, YAxis, Tooltip, ReferenceLine, ReferenceArea, Legend,
} from "recharts"
import { WEIGHTS, type MetricKey, type ComputedDay } from "@/lib/irt"

const OVERLAY_OPTIONS: { key: MetricKey; label: string; color: string }[] = [
  { key: "hrv",            label: "HRV",         color: "#7FA99B" },
  { key: "rhr",            label: "RHR",          color: "#C17A6A" },
  { key: "sleepEff",       label: "Sleep eff.",   color: "#9B8FA9" },
  { key: "deepSleep",      label: "Deep sleep",   color: "#6A7FA9" },
  { key: "cortisol",       label: "Cortisol",     color: "#C8A56A" },
  { key: "skinTemp",       label: "Skin temp",    color: "#A9886A" },
  { key: "glucoseSD",      label: "Glucose SD",   color: "#6AA9A0" },
]

const DOMAIN_COLORS: Record<string, string> = {
  autonomic:      "var(--warn)",
  cardiovascular: "var(--alert)",
  sleep:          "#9B8FA9",
  metabolic:      "#6AA9A0",
  inflammation:   "#C8A56A",
  body:           "var(--ink-3)",
}

interface HeroChartProps {
  computed: ComputedDay[]
  eventMarkers?: { dayIndex: number; label: string; color?: string }[]
}

function slope7(vals: number[]): number | null {
  const n = Math.min(7, vals.length)
  if (n < 2) return null
  const slice = vals.slice(-n)
  const xmean = (n - 1) / 2
  let num = 0, den = 0
  slice.forEach((y, i) => { num += (i - xmean) * (y - slice.reduce((a, b) => a + b, 0) / n); den += (i - xmean) ** 2 })
  return den === 0 ? 0 : num / den
}

export default function HeroChart({ computed, eventMarkers = [] }: HeroChartProps) {
  const [overlays, setOverlays] = useState<MetricKey[]>(["hrv"])
  const [clickedIdx, setClickedIdx] = useState<number | null>(null)
  const [showArea, setShowArea] = useState(true)

  const chartData = useMemo(() => computed.map((d, i) => {
    const row: Record<string, number | string> = {
      date: d.date.slice(5),  // MM-DD
      al:   d.alScore,
    }
    OVERLAY_OPTIONS.forEach(o => {
      row[o.key] = d.raw[o.key as keyof typeof d.raw] as number
    })
    return row
  }), [computed])

  const alValues = computed.map(d => d.alScore)
  const slopeVal = slope7(alValues)
  const slopeText = slopeVal === null
    ? null
    : slopeVal > 0.3
    ? `↑ Rising  +${slopeVal.toFixed(1)} pt/day (7d)`
    : slopeVal < -0.3
    ? `↓ Falling  ${slopeVal.toFixed(1)} pt/day (7d)`
    : `→ Flat  ±${Math.abs(slopeVal).toFixed(1)} pt/day (7d)`

  const slopeColor = slopeVal === null ? "var(--ink-3)"
    : slopeVal > 0.3 ? "var(--alert)"
    : slopeVal < -0.3 ? "var(--ok)"
    : "var(--ink-2)"

  const toggleOverlay = (k: MetricKey) => {
    setOverlays(prev => prev.includes(k) ? prev.filter(x => x !== k) : [...prev, k])
  }

  const clickedDay = clickedIdx !== null ? computed[clickedIdx] : null

  return (
    <div className="panel" style={{ padding: "20px 24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
        <span style={{ fontFamily: "var(--mono)", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--ink-3)" }}>
          Allostatic Load · 30-day
        </span>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {slopeText && (
            <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: slopeColor }}>
              {slopeText}
            </span>
          )}
          <button
            onClick={() => setShowArea(a => !a)}
            style={{
              fontFamily: "var(--mono)", fontSize: 8, textTransform: "uppercase",
              letterSpacing: "0.06em", padding: "3px 8px",
              border: "1px solid var(--hair-strong)",
              background: "transparent", color: "var(--ink-3)", cursor: "pointer",
            }}
          >
            {showArea ? "Line" : "Area"}
          </button>
        </div>
      </div>

      {/* Overlay toggles */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
        {OVERLAY_OPTIONS.map(o => {
          const on = overlays.includes(o.key)
          return (
            <button
              key={o.key}
              onClick={() => toggleOverlay(o.key)}
              style={{
                fontFamily: "var(--mono)", fontSize: 8, textTransform: "uppercase",
                letterSpacing: "0.06em", padding: "3px 8px",
                border: `1px solid ${on ? o.color : "var(--hair-strong)"}`,
                background: on ? `color-mix(in srgb, ${o.color} 15%, transparent)` : "transparent",
                color: on ? o.color : "var(--ink-4)",
                cursor: "pointer",
              }}
            >
              {o.label}
            </button>
          )
        })}
      </div>

      {/* Chart */}
      <div style={{ height: 240 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            onClick={e => { if (e?.activeTooltipIndex !== undefined && typeof e.activeTooltipIndex === "number") setClickedIdx(e.activeTooltipIndex) }}
          >
            <CartesianGrid strokeDasharray="2 4" stroke="var(--hair)" />
            <XAxis
              dataKey="date"
              tick={{ fontFamily: "var(--mono)", fontSize: 8, fill: "var(--ink-4)" }}
              tickLine={false}
              axisLine={false}
              interval={4}
            />
            <YAxis
              yAxisId="al"
              domain={[20, 100]}
              tick={{ fontFamily: "var(--mono)", fontSize: 8, fill: "var(--ink-4)" }}
              tickLine={false}
              axisLine={false}
              width={28}
            />
            {overlays.length > 0 && (
              <YAxis yAxisId="bio" orientation="right" hide />
            )}
            <Tooltip
              contentStyle={{
                background: "var(--panel)", border: "1px solid var(--hair-strong)",
                fontFamily: "var(--mono)", fontSize: 10, borderRadius: 0,
              }}
              labelStyle={{ color: "var(--ink-3)", fontSize: 8, textTransform: "uppercase" }}
              itemStyle={{ color: "var(--ink-2)" }}
            />

            {/* 50 = baseline reference */}
            <ReferenceLine yAxisId="al" y={50} stroke="var(--hair-strong)" strokeDasharray="3 3" />

            {/* Event markers */}
            {eventMarkers.map((ev, i) => (
              <ReferenceLine
                key={i}
                yAxisId="al"
                x={chartData[ev.dayIndex]?.date as string}
                stroke={ev.color || "var(--hair-strong)"}
                strokeDasharray="2 3"
                label={{ value: ev.label, position: "top", fontFamily: "var(--mono)", fontSize: 7, fill: ev.color || "var(--ink-4)" }}
              />
            ))}

            {/* Click highlight */}
            {clickedIdx !== null && (
              <ReferenceArea
                yAxisId="al"
                x1={chartData[Math.max(0, clickedIdx)]?.date as string}
                x2={chartData[Math.min(chartData.length - 1, clickedIdx + 1)]?.date as string}
                fill="var(--ok)"
                fillOpacity={0.08}
              />
            )}

            {/* AL area/line */}
            {showArea ? (
              <Area
                yAxisId="al"
                type="monotone"
                dataKey="al"
                name="AL Score"
                stroke="var(--warn)"
                strokeWidth={1.5}
                fill="color-mix(in srgb, var(--warn) 12%, transparent)"
                dot={false}
                activeDot={{ r: 3, fill: "var(--warn)" }}
              />
            ) : (
              <Line
                yAxisId="al"
                type="monotone"
                dataKey="al"
                name="AL Score"
                stroke="var(--warn)"
                strokeWidth={1.5}
                dot={false}
                activeDot={{ r: 3, fill: "var(--warn)" }}
              />
            )}

            {/* Biomarker overlays */}
            {OVERLAY_OPTIONS.filter(o => overlays.includes(o.key)).map(o => (
              <Line
                key={o.key}
                yAxisId="bio"
                type="monotone"
                dataKey={o.key}
                name={o.label}
                stroke={o.color}
                strokeWidth={1}
                strokeDasharray="4 2"
                dot={false}
                activeDot={{ r: 2 }}
              />
            ))}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Click drill-down */}
      {clickedDay && (
        <div style={{
          marginTop: 16, padding: "12px 16px",
          borderTop: "1px solid var(--hair)",
          display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12,
        }}>
          <div>
            <div style={{ fontFamily: "var(--mono)", fontSize: 8, color: "var(--ink-4)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
              {clickedDay.date} · AL {clickedDay.alScore}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {(["autonomic","cardiovascular","sleep"] as const).map(dk => (
                <div key={dk} style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-3)" }}>{dk}</span>
                  <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: DOMAIN_COLORS[dk] }}>
                    {clickedDay.domainScores[dk] > 0 ? "+" : ""}{clickedDay.domainScores[dk].toFixed(2)}σ
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontFamily: "var(--mono)", fontSize: 8, color: "var(--ink-4)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Domain Z-scores</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {(["metabolic","inflammation","body"] as const).map(dk => (
                <div key={dk} style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-3)" }}>{dk}</span>
                  <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: DOMAIN_COLORS[dk] }}>
                    {clickedDay.domainScores[dk] > 0 ? "+" : ""}{clickedDay.domainScores[dk].toFixed(2)}σ
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontFamily: "var(--mono)", fontSize: 8, color: "var(--ink-4)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Key Z-scores</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {(["hrv","rhr","sleepEff","deepSleep"] as const).map(k => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-3)" }}>{WEIGHTS[k].label.split(" ")[0]}</span>
                  <span style={{
                    fontFamily: "var(--mono)", fontSize: 9,
                    color: clickedDay.z[k] > 0.5 ? "var(--warn)" : clickedDay.z[k] < -0.5 ? "var(--ok)" : "var(--ink-2)"
                  }}>
                    {clickedDay.z[k] > 0 ? "+" : ""}{clickedDay.z[k].toFixed(2)}σ
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
