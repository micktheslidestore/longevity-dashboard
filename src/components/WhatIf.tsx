"use client"

import { useState, useMemo } from "react"
import { useApp } from "@/components/RoleContext"
import { WEIGHTS, simulate, type MetricKey, type ZScores } from "@/lib/irt"

interface WhatIfProps {
  currentZ: ZScores
  currentAL: number
}

const SLIDER_METRICS: MetricKey[] = [
  "hrv", "rhr", "sleepEff", "deepSleep", "cortisol",
  "skinTemp", "glucoseSD", "hsCRP", "fastingInsulin", "vo2max",
]

function deltaLabel(pct: number, key: MetricKey) {
  const dir = WEIGHTS[key].direction
  const sign = pct > 0 ? "+" : ""
  if (dir === "lower-worse") {
    return pct < 0 ? `↑ ${Math.abs(pct)}% (improvement)` : `↓ ${pct}% (worse)`
  }
  return pct > 0 ? `↑ ${sign}${pct}% (worse)` : `↓ ${Math.abs(pct)}% (improvement)`
}

function improveLabel(key: MetricKey) {
  const dir = WEIGHTS[key].direction
  return dir === "lower-worse" ? "increase" : "decrease"
}

export default function WhatIf({ currentZ, currentAL }: WhatIfProps) {
  const { role } = useApp()
  const [selected, setSelected] = useState<MetricKey>("hrv")
  const [change, setChange] = useState(0)
  const [protocolSent, setProtocolSent] = useState(false)

  const result = useMemo(() => {
    if (change === 0) return null
    return simulate(currentZ, selected, change)
  }, [currentZ, selected, change])

  const deltaAL = result?.deltaAL ?? 0
  const newAL   = result?.newAL ?? currentAL

  const handleCreateProtocol = () => {
    setProtocolSent(true)
    setTimeout(() => setProtocolSent(false), 4000)
  }

  return (
    <div className="panel" style={{ padding: "20px 24px" }}>
      <div style={{
        fontFamily: "var(--mono)", fontSize: 9, textTransform: "uppercase",
        letterSpacing: "0.12em", color: "var(--ink-3)", marginBottom: 16,
      }}>
        Course correction calculator
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>

        {/* Left: controls */}
        <div>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
              Metric to simulate
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {SLIDER_METRICS.map(k => (
                <button
                  key={k}
                  onClick={() => { setSelected(k); setChange(0); setProtocolSent(false) }}
                  style={{
                    fontFamily: "var(--mono)", fontSize: 9, textTransform: "uppercase",
                    letterSpacing: "0.06em", padding: "4px 8px",
                    border: `1px solid ${selected === k ? "var(--ok)" : "var(--hair-strong)"}`,
                    background: selected === k ? "color-mix(in srgb, var(--ok) 12%, transparent)" : "transparent",
                    color: selected === k ? "var(--ok)" : "var(--ink-3)",
                    cursor: "pointer",
                  }}
                >
                  {WEIGHTS[k].label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
              <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Simulate a {improveLabel(selected)} in {WEIGHTS[selected].label}
              </div>
              <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-2)" }}>
                {change !== 0 ? deltaLabel(change, selected) : "drag to simulate"}
              </div>
            </div>
            <input
              type="range"
              min={-40}
              max={40}
              step={2}
              value={change}
              onChange={e => { setChange(+e.target.value); setProtocolSent(false) }}
              style={{ width: "100%", accentColor: "var(--ok)" }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--mono)", fontSize: 8, color: "var(--ink-4)", marginTop: 4 }}>
              <span>−40%</span>
              <span>0</span>
              <span>+40%</span>
            </div>
          </div>

          <div style={{ fontSize: 11, color: "var(--ink-3)", lineHeight: 1.55 }}>
            Current Z-score: <span style={{ fontFamily: "var(--mono)", color: currentZ[selected] > 0.5 ? "var(--warn)" : currentZ[selected] < -0.5 ? "var(--ok)" : "var(--ink-2)" }}>
              {currentZ[selected] > 0 ? "+" : ""}{currentZ[selected].toFixed(2)}σ
            </span>
            {" · "}{WEIGHTS[selected].unit}
          </div>
        </div>

        {/* Right: result */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", gap: 16 }}>
            <div style={{ flex: 1, borderLeft: "2px solid var(--hair-strong)", paddingLeft: 12 }}>
              <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Current AL</div>
              <div style={{ fontFamily: "var(--mono)", fontSize: 28, color: "var(--warn)", lineHeight: 1 }}>{currentAL}</div>
            </div>
            <div style={{ flex: 1, borderLeft: `2px solid ${deltaAL < 0 ? "var(--ok)" : deltaAL > 0 ? "var(--alert)" : "var(--hair-strong)"}`, paddingLeft: 12 }}>
              <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Projected AL</div>
              <div style={{ fontFamily: "var(--mono)", fontSize: 28, color: deltaAL < 0 ? "var(--ok)" : deltaAL > 0 ? "var(--alert)" : "var(--ink-2)", lineHeight: 1 }}>
                {newAL}
              </div>
              {deltaAL !== 0 && (
                <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: deltaAL < 0 ? "var(--ok)" : "var(--alert)", marginTop: 2 }}>
                  {deltaAL < 0 ? "" : "+"}{deltaAL} pts
                </div>
              )}
            </div>
          </div>

          {result && result.contributors.length > 0 && (
            <div>
              <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
                Remaining top drivers
              </div>
              {result.contributors.map(c => (
                <div key={c.key} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "5px 0", borderBottom: "1px solid var(--hair)",
                }}>
                  <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-2)" }}>{c.label}</span>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--warn)" }}>
                      {c.z > 0 ? "+" : ""}{c.z.toFixed(2)}σ
                    </span>
                    <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-3)" }}>
                      {c.pct}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {result && deltaAL !== 0 && (
            <div style={{
              padding: "10px 12px",
              background: deltaAL < 0 ? "color-mix(in srgb, var(--ok) 8%, transparent)" : "color-mix(in srgb, var(--alert) 8%, transparent)",
              border: `1px solid ${deltaAL < 0 ? "color-mix(in srgb, var(--ok) 30%, transparent)" : "color-mix(in srgb, var(--alert) 30%, transparent)"}`,
            }}>
              <div style={{ fontSize: 11.5, color: "var(--ink-2)", lineHeight: 1.5, fontFamily: "var(--serif)", fontStyle: "italic" }}>
                {deltaAL < 0
                  ? `A ${Math.abs(change)}% improvement in ${WEIGHTS[selected].label} would reduce allostatic load by ${Math.abs(deltaAL)} points — moving toward baseline.`
                  : `A ${Math.abs(change)}% decline in ${WEIGHTS[selected].label} would increase allostatic load by ${deltaAL} points.`
                }
              </div>
            </div>
          )}

          {/* Protocol CTA — Darcy only */}
          {role === "darcy" && result && deltaAL < -2 && (
            <div>
              {protocolSent ? (
                <div style={{
                  padding: "8px 12px", fontFamily: "var(--mono)", fontSize: 10,
                  color: "var(--ok)", border: "1px solid color-mix(in srgb, var(--ok) 30%, transparent)",
                  background: "color-mix(in srgb, var(--ok) 8%, transparent)",
                }}>
                  ✓ Protocol change drafted — review in inbox before publishing to Jamie.
                </div>
              ) : (
                <button
                  onClick={handleCreateProtocol}
                  className="primary"
                  style={{ width: "100%", padding: "9px 14px", fontFamily: "var(--mono)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em" }}
                >
                  Create protocol change → {WEIGHTS[selected].label}
                </button>
              )}
            </div>
          )}

          {role === "james" && result && deltaAL < -2 && (
            <div style={{
              padding: "8px 12px", fontSize: 11, color: "var(--ink-3)", lineHeight: 1.5,
              borderLeft: "2px solid var(--hair-strong)",
            }}>
              Share this simulation with Darcy — he can turn it into a protocol change.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
