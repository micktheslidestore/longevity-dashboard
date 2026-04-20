"use client"

import { useState, useMemo } from "react"
import { DATA } from "@/data/james"
import { useApp } from "@/components/RoleContext"
import { LifecycleChip } from "@/components/Primitives"
import { computeSeries, DOMAINS, type DomainKey } from "@/lib/irt"

// ─── AL Scorecard ────────────────────────────────────────────────────────────

function ALScorecard({ alScore, domainScores }: { alScore: number; domainScores: Record<DomainKey, number> }) {
  const band = alScore >= 70 ? { label: "Elevated", color: "var(--alert)" }
    : alScore >= 50 ? { label: "Watch", color: "var(--warn)" }
    : { label: "Stable", color: "var(--ok)" }

  return (
    <div className="panel" style={{ padding: "20px 24px" }}>
      <div style={{ fontFamily: "var(--mono)", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--ink-3)", marginBottom: 12 }}>
        Allostatic load · today
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 16 }}>
        <div style={{ fontFamily: "var(--mono)", fontSize: 52, letterSpacing: "-0.04em", color: band.color, lineHeight: 1 }}>
          {alScore}
        </div>
        <div>
          <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: band.color, textTransform: "uppercase", letterSpacing: "0.1em" }}>{band.label}</div>
          <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-4)", marginTop: 2 }}>/ 100 · IRT model</div>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {(Object.keys(DOMAINS) as DomainKey[]).map(dk => {
          const z = domainScores[dk]
          const pct = Math.max(0, Math.min(100, Math.round(50 + (z / 3) * 50)))
          const color = z > 1 ? "var(--alert)" : z > 0.3 ? "var(--warn)" : "var(--ok)"
          return (
            <div key={dk}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  {DOMAINS[dk].label}
                </span>
                <span style={{ fontFamily: "var(--mono)", fontSize: 9, color }}>
                  {z > 0 ? "+" : ""}{z.toFixed(2)}σ
                </span>
              </div>
              <div style={{ height: 3, background: "var(--hair-strong)", borderRadius: 0 }}>
                <div style={{ height: "100%", width: `${pct}%`, background: color, transition: "width 0.3s" }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Week Calendar ────────────────────────────────────────────────────────────

const WORKOUT_COLORS: Record<string, string> = {
  zone2:    "var(--ok)",
  test:     "var(--warn)",
  mobility: "var(--accent)",
  recovery: "#9B8FA9",
  rest:     "var(--ink-3)",
}

function WeekCalendar() {
  const [selectedDay, setSelectedDay] = useState<string | null>("2026-04-20")

  const selected = DATA.weekPlan.find(d => d.date === selectedDay) ?? null

  return (
    <div className="panel">
      <div className="panel-head">
        <span>Week plan · 20–26 Apr</span>
        <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          Workouts · diet · protocol
        </span>
      </div>

      {/* 7-column grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", borderBottom: "1px solid var(--hair)" }}>
        {DATA.weekPlan.map((day) => {
          const isSelected = selectedDay === day.date
          const wColor = day.workout ? WORKOUT_COLORS[day.workout.type] : "transparent"
          return (
            <div
              key={day.date}
              onClick={() => setSelectedDay(day.date === selectedDay ? null : day.date)}
              style={{
                padding: "12px 10px",
                borderRight: "1px solid var(--hair)",
                borderLeft: day.isToday ? "2px solid var(--accent)" : undefined,
                background: isSelected ? "var(--panel-2)" : day.isToday ? "color-mix(in srgb, var(--accent) 5%, transparent)" : "transparent",
                cursor: "pointer",
                minHeight: 110,
              }}
            >
              {/* Day header */}
              <div style={{ marginBottom: 8 }}>
                <div style={{ fontFamily: "var(--mono)", fontSize: 8, color: "var(--ink-4)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{day.dow}</div>
                <div style={{
                  fontFamily: "var(--mono)", fontSize: 20, letterSpacing: "-0.02em", lineHeight: 1,
                  color: day.isToday ? "var(--accent)" : "var(--ink)",
                  marginTop: 2,
                }}>
                  {day.date.slice(8)}
                </div>
              </div>

              {/* Workout chip */}
              {day.workout ? (
                <div style={{
                  padding: "3px 6px", marginBottom: 5,
                  borderLeft: `2px solid ${wColor}`,
                  background: `color-mix(in srgb, ${wColor} 10%, transparent)`,
                }}>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 8, color: wColor, textTransform: "uppercase", letterSpacing: "0.06em", lineHeight: 1.3 }}>
                    {day.workout.label}
                  </div>
                  {day.workout.duration && (
                    <div style={{ fontFamily: "var(--mono)", fontSize: 7, color: "var(--ink-4)", marginTop: 1 }}>{day.workout.duration}min</div>
                  )}
                </div>
              ) : (
                <div style={{ padding: "3px 6px", marginBottom: 5, borderLeft: "2px solid var(--hair-strong)" }}>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 8, color: "var(--ink-4)", textTransform: "uppercase", letterSpacing: "0.06em" }}>No workout</div>
                </div>
              )}

              {/* Diet chip */}
              <div style={{
                padding: "3px 6px",
                borderLeft: "2px solid color-mix(in srgb, var(--warn) 50%, transparent)",
                background: "color-mix(in srgb, var(--warn) 5%, transparent)",
              }}>
                <div style={{ fontFamily: "var(--mono)", fontSize: 8, color: "var(--warn)", textTransform: "uppercase", letterSpacing: "0.06em", lineHeight: 1.3 }}>
                  {day.diet.label}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Day detail drawer */}
      {selected && (
        <div style={{ padding: "16px 20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          <div>
            <div style={{ fontFamily: "var(--mono)", fontSize: 8, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>
              {selected.dow} {selected.date.slice(8)} Apr · {selected.workout?.label ?? "Rest"}
            </div>
            {selected.workout ? (
              <>
                <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 6 }}>
                  <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: WORKOUT_COLORS[selected.workout.type], border: `1px solid ${WORKOUT_COLORS[selected.workout.type]}`, padding: "2px 7px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    {selected.workout.type}
                  </span>
                  {selected.workout.duration && (
                    <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-3)" }}>{selected.workout.duration} min</span>
                  )}
                </div>
                <div style={{ fontSize: 12.5, color: "var(--ink-2)", lineHeight: 1.55 }}>{selected.workout.note}</div>
              </>
            ) : (
              <div style={{ fontSize: 12.5, color: "var(--ink-3)", fontStyle: "italic" }}>Active recovery day — no structured training.</div>
            )}
          </div>
          <div>
            <div style={{ fontFamily: "var(--mono)", fontSize: 8, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>
              Nutrition · {selected.diet.label}
            </div>
            <div style={{ fontSize: 12.5, color: "var(--ink-2)", lineHeight: 1.55 }}>{selected.diet.note}</div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main page ───────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { role } = useApp()
  const [ackDone, setAckDone] = useState<string[]>([])

  const computed = useMemo(() => computeSeries(DATA.rawTimeSeries), [])
  const lastDay = computed[computed.length - 1]

  const activeCorrectors = DATA.courseCorrector.filter(c => c.status === "active" || c.status === "pending")

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, padding: "24px 32px", maxWidth: 1300 }}>

      {/* ── Row 1: AL scorecard + morning briefing ── */}
      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 20, alignItems: "start" }}>

        <ALScorecard alScore={lastDay.alScore} domainScores={lastDay.domainScores} />

        {/* Morning briefing */}
        <div className="panel" style={{ padding: "20px 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
            <span style={{ fontFamily: "var(--mono)", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--ink-3)" }}>
              {DATA.signal.narrative.eyebrow}
            </span>
            <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-3)" }}>{DATA.signal.narrative.stamp}</span>
          </div>
          <p style={{ fontFamily: "var(--serif)", fontSize: 20, fontWeight: 300, letterSpacing: "-0.015em", lineHeight: 1.35, margin: "0 0 14px", color: "var(--ink)" }}>
            {DATA.signal.narrative.title}
          </p>
          <p style={{ fontSize: 13, color: "var(--ink-2)", lineHeight: 1.65, margin: 0 }}>
            {DATA.signal.narrative.rationale}
          </p>
          <div style={{ marginTop: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontFamily: "var(--mono)", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--ok)" }}>
              {role === "darcy" ? DATA.signal.narrative.byCoach : DATA.signal.narrative.by}
            </div>
            {/* Darcy sees agent drafts inline */}
            {role === "darcy" && DATA.agentDrafts.length > 0 && (
              <div style={{ display: "flex", gap: 8 }}>
                <button style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.08em", textTransform: "uppercase", border: "1px solid var(--ink)", padding: "5px 12px", background: "var(--ink)", color: "var(--bg)", cursor: "pointer" }}>
                  Review {DATA.agentDrafts.length} draft{DATA.agentDrafts.length !== 1 ? "s" : ""}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Row 2: North star ── */}
      <div className="northstar">
        <div className="ns-head">
          <span className="ns-label">{DATA.vision.label}</span>
          <span className="ns-days">{DATA.vision.daysLeft} days left</span>
        </div>
        <p className="ns-statement">{DATA.vision.statement}</p>
        <div className="ns-tracks" style={{ marginTop: 12 }}>
          {DATA.vision.tracks.map(t => (
            <div key={t.name} className="ns-track">
              <span className="tn">{t.name}</span>
              <span className="tv">{t.now} <span style={{ color: "var(--ink-3)" }}>{t.unit}</span></span>
              <div className="tbar"><div className="fill" style={{ width: `${t.progress * 100}%` }} /></div>
              <div className="ts">
                <span>{t.dir === "down" ? "↓" : "↑"} {t.target} {t.unit}</span>
                <span>{Math.round(t.progress * 100)}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Row 3: Week calendar ── */}
      <WeekCalendar />

      {/* ── Row 4: Course correctors (active/pending only) ── */}
      {activeCorrectors.length > 0 && (
        <div className="panel">
          <div className="panel-head">
            <span>In-flight correctors</span>
            <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              {activeCorrectors.length} active · awaiting outcome
            </span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${activeCorrectors.length}, 1fr)`, borderLeft: "1px solid var(--hair)" }}>
            {activeCorrectors.map((c, i) => {
              const done = ackDone.includes(c.date)
              return (
                <div key={i} style={{ padding: "16px 20px", borderRight: "1px solid var(--hair)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
                    <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{c.date}</span>
                    <span className={`lc-chip lc-${c.status === "active" ? "flag" : "draft"}`}>{c.status}</span>
                  </div>
                  <div style={{ fontSize: 13, color: "var(--ink)", lineHeight: 1.5, marginBottom: 8 }}>{c.recommendation}</div>
                  <div style={{ fontSize: 12, color: "var(--ink-2)", lineHeight: 1.5, marginBottom: 8, borderLeft: "2px solid var(--hair-strong)", paddingLeft: 8 }}>
                    {c.action}
                  </div>
                  {c.impact.metric && (
                    <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
                      Tracking: {c.impact.metric} · {c.impact.before}{c.impact.unit} → target
                    </div>
                  )}
                  {role === "james" && c.status === "active" && !done && (
                    <button
                      onClick={() => setAckDone(p => [...p, c.date])}
                      style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.08em", textTransform: "uppercase", border: "1px solid var(--ok)", padding: "5px 12px", color: "var(--ok)", background: "transparent", cursor: "pointer" }}
                    >
                      Acknowledge
                    </button>
                  )}
                  {done && (
                    <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ok)", textTransform: "uppercase", letterSpacing: "0.08em" }}>✓ Acknowledged</div>
                  )}
                  <div style={{ marginTop: 8, fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-4)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{c.by}</div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Row 5: Directives from Darcy ── */}
      <div className="panel">
        <div className="panel-head">
          <span>Directives</span>
          {role === "darcy" && (
            <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--warn)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              {DATA.agentDrafts.length} draft{DATA.agentDrafts.length !== 1 ? "s" : ""} in inbox
            </span>
          )}
        </div>
        <div className="directive-list">
          {role === "darcy" && DATA.agentDrafts.map((d, i) => (
            <div key={`draft-${i}`} className="directive-row" style={{ background: "color-mix(in oklab, var(--warn) 4%, transparent)" }}>
              <div className="dg"><LifecycleChip lc={d.lifecycle} /></div>
              <div>
                <div className="d-head"><span className="who">Agent</span><span>Draft · awaiting countersignature</span></div>
                <div className="d-body agent-tone">{d.body}</div>
                <div className="d-meta">{d.meta}</div>
                <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                  <button style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", border: "1px solid var(--ink)", padding: "5px 12px", background: "var(--ink)", color: "var(--bg)", cursor: "pointer" }}>Countersign</button>
                  <button style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", border: "1px solid var(--hair-strong)", padding: "5px 12px", color: "var(--ink-2)", background: "transparent", cursor: "pointer" }}>Edit &amp; sign</button>
                  <button style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", border: "1px solid var(--hair-strong)", padding: "5px 12px", color: "var(--alert)", background: "transparent", cursor: "pointer" }}>Discard</button>
                </div>
              </div>
            </div>
          ))}
          {DATA.directive.map((d, i) => (
            <div key={i} className="directive-row">
              <div className="dg"><LifecycleChip lc={d.lifecycle} /></div>
              <div>
                <div className="d-head"><span className="who">{d.who}</span><span>{d.role}</span></div>
                <div className="d-body">{d.body}</div>
                <div className="d-meta">{d.meta}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
