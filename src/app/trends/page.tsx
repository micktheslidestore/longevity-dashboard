"use client"

import { useState } from "react"
import { dailyMetrics, annotations } from "@/data/james"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  CartesianGrid,
} from "recharts"

type Range = 14 | 30 | 90

const ANNOTATION_COLORS: Record<string, string> = {
  medical: "var(--accent-red)",
  training: "var(--accent-blue)",
  coach: "var(--accent-teal)",
  nutrition: "var(--accent-green)",
  life: "var(--accent-amber)",
}

const CHARTS = [
  {
    key: "hrv",
    label: "HRV",
    unit: "ms",
    color: "var(--accent-teal)",
    baseline: 62,
    baselineLabel: "Baseline 62ms",
    description: "Heart rate variability — primary recovery and stress marker",
  },
  {
    key: "sleepEfficiency",
    label: "Sleep Efficiency",
    unit: "%",
    color: "var(--accent-blue)",
    baseline: 83,
    baselineLabel: "Personal baseline 83%",
    description: "Time asleep vs time in bed",
  },
  {
    key: "acuteChronicRatio",
    label: "Training Load (ACR)",
    unit: "",
    color: "var(--accent-amber)",
    baseline: 1.3,
    baselineLabel: "Caution threshold 1.3",
    description: "Acute:chronic workload ratio — above 1.3 signals overreach risk",
  },
  {
    key: "restingHR",
    label: "Resting Heart Rate",
    unit: "bpm",
    color: "var(--accent-red)",
    baseline: 52,
    baselineLabel: "Baseline 52bpm",
    description: "Resting HR — elevation signals stress, illness, or overtraining",
  },
  {
    key: "allostaticScore",
    label: "Allostatic Load Score",
    unit: "",
    color: "#a78bfa",
    baseline: null,
    baselineLabel: null,
    description: "Composite physiological burden across all domains",
  },
  {
    key: "weightKg",
    label: "Body Weight",
    unit: "kg",
    color: "var(--accent-green)",
    baseline: null,
    baselineLabel: null,
    description: "Body weight — sustained drops under training load signal underfueling",
  },
] as const

function formatDate(dateStr: string, range: Range) {
  const d = new Date(dateStr)
  if (range === 14) return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" })
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label, annotations: annots }: any) {
  if (!active || !payload?.length) return null
  const dayAnnotations = annots.filter((a: { date: string }) => a.date === label)
  return (
    <div
      className="rounded-lg p-3 text-xs shadow-xl min-w-[160px]"
      style={{ backgroundColor: "var(--bg-elevated)", border: "1px solid var(--bg-border)", color: "var(--text-primary)" }}
    >
      <p className="mb-2 font-medium" style={{ color: "var(--text-secondary)" }}>
        {new Date(label).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
      </p>
      {payload.map((p: { name: string; value: number; color: string }, i: number) => (
        <p key={i} style={{ color: p.color }}>
          {p.name}: <span className="font-semibold">{p.value}</span>
        </p>
      ))}
      {dayAnnotations.map((a: { label: string; detail: string; type: string }, i: number) => (
        <div key={i} className="mt-2 pt-2" style={{ borderTop: "1px solid var(--bg-border)" }}>
          <p style={{ color: ANNOTATION_COLORS[a.type] }} className="font-medium">{a.label}</p>
          <p style={{ color: "var(--text-secondary)" }}>{a.detail}</p>
        </div>
      ))}
    </div>
  )
}

export default function TrendsPage() {
  const [range, setRange] = useState<Range>(30)

  const slicedData = dailyMetrics.slice(-range).map(d => ({
    ...d,
    acuteChronicRatio: parseFloat(d.acuteChronicRatio.toFixed(2)),
    weightKg: parseFloat(d.weightKg.toFixed(1)),
  }))

  const visibleAnnotations = annotations.filter(a => {
    const cutoff = dailyMetrics[dailyMetrics.length - range].date
    return a.date >= cutoff
  })

  return (
    <div className="p-8 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>Trends</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            Cross-signal patterns · James · 90-day window
          </p>
        </div>
        <div className="flex gap-1">
          {([14, 30, 90] as Range[]).map(r => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className="px-3 py-1.5 rounded-lg text-sm transition-all"
              style={{
                backgroundColor: range === r ? "var(--bg-elevated)" : "transparent",
                color: range === r ? "var(--accent-teal)" : "var(--text-muted)",
                border: `1px solid ${range === r ? "var(--bg-border)" : "transparent"}`,
              }}
            >
              {r}d
            </button>
          ))}
        </div>
      </div>

      {/* Annotation legend */}
      <div
        className="rounded-xl p-4 mb-6 flex items-center gap-6 flex-wrap"
        style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--bg-border)" }}
      >
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>Event types:</span>
        {Object.entries(ANNOTATION_COLORS).map(([type, color]) => (
          <div key={type} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-xs capitalize" style={{ color: "var(--text-secondary)" }}>{type}</span>
          </div>
        ))}
        <span className="text-xs ml-auto" style={{ color: "var(--text-muted)" }}>
          {visibleAnnotations.length} events in this window
        </span>
      </div>

      {/* Charts */}
      <div className="flex flex-col gap-6">
        {CHARTS.map(({ key, label, unit, color, baseline, baselineLabel, description }) => (
          <div
            key={key}
            className="rounded-xl p-5"
            style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--bg-border)" }}
          >
            <div className="flex items-start justify-between mb-1">
              <div>
                <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{label}</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{description}</p>
              </div>
              {baselineLabel && (
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                  — — {baselineLabel}
                </span>
              )}
            </div>
            <div className="mt-4" style={{ height: 160 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={slicedData} margin={{ top: 4, right: 12, bottom: 0, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--bg-border)" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickFormatter={d => formatDate(d, range)}
                    tick={{ fill: "var(--text-muted)", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    interval={range === 14 ? 1 : range === 30 ? 4 : 13}
                  />
                  <YAxis
                    tick={{ fill: "var(--text-muted)", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={v => `${v}${unit}`}
                  />
                  <Tooltip
                    content={<CustomTooltip annotations={visibleAnnotations} />}
                  />
                  {baseline !== null && (
                    <ReferenceLine
                      y={baseline}
                      stroke="var(--text-muted)"
                      strokeDasharray="4 4"
                      strokeWidth={1}
                    />
                  )}
                  {/* Annotation lines */}
                  {visibleAnnotations.map((a, i) => (
                    <ReferenceLine
                      key={i}
                      x={a.date}
                      stroke={ANNOTATION_COLORS[a.type]}
                      strokeWidth={1}
                      strokeOpacity={0.6}
                    />
                  ))}
                  <Line
                    type="monotone"
                    dataKey={key}
                    name={label}
                    stroke={color}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, fill: color }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>

      {/* Annotation event log */}
      <div
        className="rounded-xl p-5 mt-6"
        style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--bg-border)" }}
      >
        <p className="text-xs font-medium tracking-widest uppercase mb-4" style={{ color: "var(--text-muted)" }}>
          Event Log — {range} day window
        </p>
        <div className="flex flex-col gap-3">
          {visibleAnnotations.map((a, i) => (
            <div key={i} className="flex items-start gap-3">
              <div
                className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
                style={{ backgroundColor: ANNOTATION_COLORS[a.type] }}
              />
              <div className="flex-1 flex items-start justify-between gap-4">
                <div>
                  <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{a.label}</span>
                  <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{a.detail}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {new Date(a.date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                    {a.addedBy === "darcy" ? "Darcy" : "James"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
