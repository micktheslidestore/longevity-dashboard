"use client"

import { useState } from "react"
import { dailyMetrics } from "@/data/james"

const METRICS = [
  { key: "energy", label: "Energy", low: "Depleted", high: "Energised" },
  { key: "mood", label: "Mood", low: "Low", high: "Elevated" },
  { key: "stress", label: "Stress", low: "Calm", high: "Overwhelmed" },
  { key: "soreness", label: "Muscle Soreness", low: "None", high: "Very sore" },
  { key: "appetite", label: "Appetite", low: "Suppressed", high: "Strong" },
] as const

type MetricKey = typeof METRICS[number]["key"]

// stress and soreness are inverted (high = bad)
const INVERTED: MetricKey[] = ["stress", "soreness"]

function scoreColor(key: MetricKey, val: number) {
  const inverted = INVERTED.includes(key)
  const effective = inverted ? 6 - val : val
  if (effective >= 4) return "var(--accent-green)"
  if (effective >= 3) return "var(--accent-amber)"
  return "var(--accent-red)"
}

function HeatCell({ val, metricKey }: { val: number; metricKey: MetricKey }) {
  const color = scoreColor(metricKey, val)
  return (
    <div
      className="w-6 h-6 rounded flex items-center justify-center text-xs font-medium"
      style={{ backgroundColor: `${color}28`, color }}
    >
      {val}
    </div>
  )
}

// Last 30 days of check-in data
const recent = dailyMetrics.slice(-30)

export default function CheckinPage() {
  const todayData = dailyMetrics[dailyMetrics.length - 1]

  const [values, setValues] = useState<Record<MetricKey, number>>({
    energy: todayData.checkin.energy,
    mood: todayData.checkin.mood,
    stress: todayData.checkin.stress,
    soreness: todayData.checkin.soreness,
    appetite: todayData.checkin.appetite,
  })
  const [notes, setNotes] = useState(todayData.checkin.notes)
  const [submitted, setSubmitted] = useState(false)

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>Morning Check-in</h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
          How are you feeling today? This qualitative data is layered with your wearable metrics.
        </p>
      </div>

      {/* Today's form */}
      <div
        className="rounded-xl p-6 mb-8"
        style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--bg-border)" }}
      >
        <div className="flex items-center justify-between mb-6">
          <p className="text-xs font-medium tracking-widest uppercase" style={{ color: "var(--text-muted)" }}>
            Today · {new Date(todayData.date).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
          </p>
          {submitted && (
            <span className="text-xs" style={{ color: "var(--accent-green)" }}>Saved</span>
          )}
        </div>

        <div className="flex flex-col gap-6">
          {METRICS.map(({ key, label, low, high }) => (
            <div key={key}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{label}</span>
                <span
                  className="text-sm font-bold w-6 h-6 rounded flex items-center justify-center"
                  style={{ backgroundColor: `${scoreColor(key, values[key])}28`, color: scoreColor(key, values[key]) }}
                >
                  {values[key]}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs w-20 text-right" style={{ color: "var(--text-muted)" }}>{low}</span>
                <div className="flex gap-2 flex-1">
                  {[1, 2, 3, 4, 5].map(v => (
                    <button
                      key={v}
                      onClick={() => setValues(prev => ({ ...prev, [key]: v }))}
                      className="flex-1 h-9 rounded-lg transition-all text-sm font-medium"
                      style={{
                        backgroundColor: values[key] === v ? `${scoreColor(key, v)}28` : "var(--bg-elevated)",
                        color: values[key] === v ? scoreColor(key, v) : "var(--text-muted)",
                        border: `1px solid ${values[key] === v ? scoreColor(key, v) : "var(--bg-border)"}`,
                      }}
                    >
                      {v}
                    </button>
                  ))}
                </div>
                <span className="text-xs w-20" style={{ color: "var(--text-muted)" }}>{high}</span>
              </div>
            </div>
          ))}

          <div>
            <label className="text-sm font-medium block mb-2" style={{ color: "var(--text-primary)" }}>
              Notes
            </label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Anything notable — quality of sleep, stress events, how training felt..."
              rows={3}
              className="w-full rounded-lg px-4 py-3 text-sm resize-none outline-none"
              style={{
                backgroundColor: "var(--bg-elevated)",
                border: "1px solid var(--bg-border)",
                color: "var(--text-primary)",
              }}
            />
          </div>

          <button
            onClick={() => setSubmitted(true)}
            className="w-full py-3 rounded-lg text-sm font-medium transition-all"
            style={{
              backgroundColor: submitted ? "var(--bg-elevated)" : "var(--accent-teal)",
              color: submitted ? "var(--accent-teal)" : "var(--bg-base)",
            }}
          >
            {submitted ? "Check-in recorded" : "Submit check-in"}
          </button>
        </div>
      </div>

      {/* 30-day heatmap */}
      <div
        className="rounded-xl p-5"
        style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--bg-border)" }}
      >
        <p className="text-xs font-medium tracking-widest uppercase mb-5" style={{ color: "var(--text-muted)" }}>
          30-day history
        </p>

        {/* Column headers (dates) */}
        <div className="flex gap-1 mb-1 pl-28">
          {recent.map((d, i) => (
            i % 5 === 0 ? (
              <div key={d.date} className="w-6 text-center" style={{ minWidth: 24 }}>
                <span className="text-xs" style={{ color: "var(--text-muted)", fontSize: 9 }}>
                  {new Date(d.date).getDate()}
                </span>
              </div>
            ) : <div key={d.date} style={{ minWidth: 24, width: 24 }} />
          ))}
        </div>

        <div className="flex flex-col gap-2">
          {METRICS.map(({ key, label }) => (
            <div key={key} className="flex items-center gap-1">
              <span className="text-xs w-28 shrink-0 text-right pr-2" style={{ color: "var(--text-secondary)" }}>
                {label}
              </span>
              <div className="flex gap-1">
                {recent.map(d => (
                  <HeatCell
                    key={d.date}
                    val={d.checkin[key as keyof typeof d.checkin] as number}
                    metricKey={key}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Notes log */}
        <div className="mt-6 flex flex-col gap-3">
          <p className="text-xs font-medium tracking-widest uppercase" style={{ color: "var(--text-muted)" }}>
            Notes with entries
          </p>
          {recent
            .filter(d => d.checkin.notes)
            .map(d => (
              <div key={d.date} className="flex items-start gap-3">
                <span className="text-xs shrink-0 mt-0.5" style={{ color: "var(--text-muted)" }}>
                  {new Date(d.date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                </span>
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{d.checkin.notes}</p>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}
