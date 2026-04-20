"use client"

import { useState } from "react"
import { DATA } from "@/data/james"
import { useApp } from "@/components/RoleContext"

const { command } = DATA

// ─── Cycle phase track ───────────────────────────────────────────────────────

function CyclePhase() {
  const { phases, current } = command.cyclephase
  return (
    <div className="panel">
      <div className="panel-head">
        <span>Quarterly cycle · Q2 2026</span>
        <span style={{ fontFamily: "var(--mono)", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--ink-3)" }}>
          Phase {current + 1} of {phases.length}
        </span>
      </div>
      <div style={{ padding: "20px 24px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 0, position: "relative" }}>
          {/* connecting line */}
          <div style={{
            position: "absolute", top: 10, left: 10, right: 10, height: 1,
            background: "var(--hair-strong)", zIndex: 0,
          }} />
          {phases.map((ph, i) => {
            const isActive = i === current
            const isFuture = i > current
            const color = ph.done ? "var(--ok)" : ph.upcoming ? "var(--warn)" : "var(--hair-strong)"
            return (
              <div key={ph.label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", position: "relative", zIndex: 1 }}>
                {/* node */}
                <div style={{
                  width: 20, height: 20, borderRadius: "50%",
                  background: ph.done ? "var(--ok)" : "var(--bg)",
                  border: `2px solid ${color}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: 10,
                }}>
                  {ph.done && <span style={{ color: "var(--bg)", fontSize: 9, fontWeight: 700 }}>✓</span>}
                  {ph.upcoming && !ph.done && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--warn)", display: "block" }} />}
                </div>
                {/* label */}
                <div style={{
                  fontFamily: "var(--mono)", fontSize: 8.5, textTransform: "uppercase", letterSpacing: "0.08em",
                  color: isActive || ph.upcoming ? "var(--ink)" : ph.done ? "var(--ok)" : "var(--ink-3)",
                  textAlign: "center", lineHeight: 1.4, marginBottom: 3,
                }}>
                  {ph.label}
                </div>
                <div style={{ fontFamily: "var(--mono)", fontSize: 8, color: ph.upcoming ? "var(--warn)" : "var(--ink-4)", textAlign: "center" }}>
                  {ph.upcoming ? "▶ " : ""}{ph.date}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── JTBD checklist ─────────────────────────────────────────────────────────

type JTBDItem = { id: string; done: boolean; text: string }

function JTBDList({ title, items, color }: { title: string; items: JTBDItem[]; color: string }) {
  const [checked, setChecked] = useState<Record<string, boolean>>(
    Object.fromEntries(items.map(i => [i.id, i.done]))
  )
  const done = Object.values(checked).filter(Boolean).length
  return (
    <div style={{ borderTop: "1px solid var(--hair)", padding: "16px 20px" }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ fontFamily: "var(--mono)", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", color }}>{title}</div>
        <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-3)" }}>{done}/{items.length}</div>
      </div>
      {/* Progress bar */}
      <div style={{ height: 2, background: "var(--hair-strong)", marginBottom: 14, borderRadius: 1 }}>
        <div style={{ height: "100%", width: `${(done / items.length) * 100}%`, background: color, borderRadius: 1, transition: "width 0.3s" }} />
      </div>
      {items.map(item => (
        <label
          key={item.id}
          style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 8, cursor: "pointer" }}
        >
          <input
            type="checkbox"
            checked={checked[item.id] ?? false}
            onChange={() => setChecked(p => ({ ...p, [item.id]: !p[item.id] }))}
            style={{ marginTop: 2, accentColor: color, flexShrink: 0 }}
          />
          <span style={{
            fontSize: 12.5, color: checked[item.id] ? "var(--ink-3)" : "var(--ink)",
            lineHeight: 1.4, textDecoration: checked[item.id] ? "line-through" : "none",
          }}>
            {item.text}
          </span>
        </label>
      ))}
    </div>
  )
}

function JTBDFramework({ role }: { role: string }) {
  const { coachProgramme, coachDaily, clientProgramme, clientDaily } = command.jtbd

  if (role === "darcy") {
    return (
      <div className="panel">
        <div className="panel-head">
          <span>Jobs-to-be-done · coach view</span>
          <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>All four buckets</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
          <div style={{ borderRight: "1px solid var(--hair)" }}>
            <JTBDList title="Coach · Programme" items={coachProgramme} color="var(--ok)" />
          </div>
          <div>
            <JTBDList title="Coach · Daily" items={coachDaily} color="var(--ok)" />
          </div>
          <div style={{ borderTop: "1px solid var(--hair)", borderRight: "1px solid var(--hair)" }}>
            <JTBDList title="Jamie · Programme" items={clientProgramme} color="var(--ink-2)" />
          </div>
          <div style={{ borderTop: "1px solid var(--hair)" }}>
            <JTBDList title="Jamie · Daily" items={clientDaily} color="var(--ink-2)" />
          </div>
        </div>
      </div>
    )
  }

  // Jamie sees only his own buckets
  return (
    <div className="panel">
      <div className="panel-head">
        <span>Your programme checklist</span>
        <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Q2 2026</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
        <div style={{ borderRight: "1px solid var(--hair)" }}>
          <JTBDList title="Programme" items={clientProgramme} color="var(--accent)" />
        </div>
        <div>
          <JTBDList title="Daily habits" items={clientDaily} color="var(--accent)" />
        </div>
      </div>
    </div>
  )
}

// ─── Data health table ───────────────────────────────────────────────────────

function statusStyle(s: string) {
  if (s === "connected" || s === "current") return { color: "var(--ok)", label: s }
  if (s === "warn") return { color: "var(--warn)", label: "Attention" }
  if (s === "stale") return { color: "var(--alert)", label: "Stale" }
  return { color: "var(--ink-3)", label: s }
}

function DataHealth() {
  return (
    <div className="panel">
      <div className="panel-head">
        <span>Data health</span>
        <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          {command.dataHealth.filter(d => d.status === "connected" || d.status === "current").length}/{command.dataHealth.length} sources live
        </span>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--mono)", fontSize: 10 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--hair-strong)" }}>
              {["Metric", "Source", "Type", "Status", "Last updated", "Next expected", "Notes"].map(h => (
                <th key={h} style={{ padding: "8px 14px", textAlign: "left", fontWeight: 400, fontSize: 8, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--ink-3)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {command.dataHealth.map((row, i) => {
              const st = statusStyle(row.status)
              return (
                <tr key={row.metric} style={{ borderBottom: "1px solid var(--hair)", background: i % 2 === 1 ? "var(--panel-2)" : undefined }}>
                  <td style={{ padding: "9px 14px", color: "var(--ink)", fontWeight: 500 }}>{row.metric}</td>
                  <td style={{ padding: "9px 14px", color: "var(--ink-2)" }}>{row.source}</td>
                  <td style={{ padding: "9px 14px" }}>
                    <span style={{
                      fontSize: 8, textTransform: "uppercase", letterSpacing: "0.08em",
                      border: `1px solid ${row.type === "blood" ? "var(--warn)" : "var(--hair-strong)"}`,
                      color: row.type === "blood" ? "var(--warn)" : "var(--ink-3)",
                      padding: "2px 5px",
                    }}>
                      {row.type}
                    </span>
                  </td>
                  <td style={{ padding: "9px 14px" }}>
                    <span style={{ color: st.color, fontSize: 8, textTransform: "uppercase", letterSpacing: "0.08em" }}>● {st.label}</span>
                  </td>
                  <td style={{ padding: "9px 14px", color: "var(--ink-2)" }}>{row.lastUpdated}</td>
                  <td style={{ padding: "9px 14px", color: "var(--ink-3)" }}>{row.nextExpected}</td>
                  <td style={{ padding: "9px 14px", color: "var(--ink-3)", fontSize: 9 }}>{row.notes ?? "—"}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Quarterly strategy document (full build) ────────────────────────────────

const STRATEGY_SECTIONS = [
  {
    key: "exercise",
    label: "Exercise & training",
    status: "locked",
    linkedMetrics: ["HRV (rMSSD)", "VO₂max", "Resting HR"],
    lockedAt: "02 Apr 2026",
  },
  {
    key: "fuelling",
    label: "Fuelling & nutrition",
    status: "locked",
    linkedMetrics: ["ApoB", "Fasting insulin", "Glucose SD"],
    lockedAt: "02 Apr 2026",
  },
  {
    key: "lifestyle",
    label: "Lifestyle protocol",
    status: "in-review",
    linkedMetrics: ["Sleep efficiency", "Cortisol AM", "Skin temp Δ"],
    lockedAt: "Pending Darcy sign-off",
  },
  {
    key: "agentDirective",
    label: "Agent directive",
    status: "draft",
    linkedMetrics: ["HRV (rMSSD)", "Fibrinogen", "Cortisol AM"],
    lockedAt: "Draft · not yet signed",
  },
] as const

const STATUS_STYLE: Record<string, { color: string; label: string }> = {
  locked:    { color: "var(--ok)",    label: "Locked" },
  "in-review":{ color: "var(--warn)", label: "In review" },
  draft:     { color: "var(--ink-3)", label: "Draft" },
}

// Q2 targets vs current
const Q2_TARGETS = [
  { label: "HRV floor",   target: 44,  current: 41,  unit: "ms",     dir: "up",   note: "Currently 3 ms below target" },
  { label: "Fibrinogen",  target: 320, current: 342, unit: "mg/dL",  dir: "down", note: "Still 22 above — watch next draw" },
  { label: "Zone-2 min",  target: 160, current: 148, unit: "min/wk", dir: "up",   note: "Board-cycle weeks dragging average" },
]

function QuarterlyStrategy({ role }: { role: string }) {
  const s = command.quarterlyStrategy
  const [editing, setEditing] = useState(false)
  const [openSec, setOpenSec] = useState<string | null>(null)
  const isDarcy = role === "darcy"

  const sectionValues: Record<string, string> = {
    exercise: s.exercise,
    fuelling: s.fuelling,
    lifestyle: s.lifestyle,
    agentDirective: s.agentDirective,
  }

  return (
    <div className="panel">
      <div className="panel-head">
        <span>Quarterly strategy · {s.quarter}</span>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            {s.lockedBy}
          </span>
          {isDarcy && (
            <button
              onClick={() => setEditing(e => !e)}
              style={{
                fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.08em", textTransform: "uppercase",
                border: `1px solid ${editing ? "var(--warn)" : "var(--hair-strong)"}`,
                color: editing ? "var(--warn)" : "var(--ink-2)",
                padding: "4px 10px", background: "transparent", cursor: "pointer",
              }}
            >
              {editing ? "Done editing" : "Edit"}
            </button>
          )}
        </div>
      </div>

      {/* Q2 targets vs actuals strip */}
      <div style={{ borderBottom: "1px solid var(--hair)", padding: "14px 20px", background: "var(--panel-2)" }}>
        <div style={{ fontFamily: "var(--mono)", fontSize: 8, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--ink-3)", marginBottom: 12 }}>
          Q2 targets vs current position
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 0 }}>
          {Q2_TARGETS.map((t, i) => {
            const isUp = t.dir === "up"
            const progress = isUp
              ? Math.min(1, t.current / t.target)
              : Math.min(1, (t.target + (t.target - t.current) * -1 + (600 - t.target)) / (600 - t.target)) // simple invert for down
            // simpler: for down targets, progress = 1 - (current - target) / (initial - target)
            // Use a fixed ratio for visual purposes
            const pct = isUp
              ? Math.round((t.current / t.target) * 100)
              : t.current <= t.target ? 100 : Math.max(0, Math.round(100 - ((t.current - t.target) / t.target) * 100))
            const color = pct >= 90 ? "var(--ok)" : pct >= 70 ? "var(--warn)" : "var(--alert)"
            return (
              <div key={t.label} style={{ padding: "0 16px", borderRight: i < 2 ? "1px solid var(--hair)" : undefined }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-2)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{t.label}</div>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 9, color }}>
                    {t.current} → {t.dir === "up" ? "≥" : "≤"}{t.target} {t.unit}
                  </div>
                </div>
                <div style={{ height: 3, background: "var(--hair-strong)", borderRadius: 1, marginBottom: 4 }}>
                  <div style={{ height: "100%", width: `${Math.min(100, pct)}%`, background: color, borderRadius: 1 }} />
                </div>
                <div style={{ fontFamily: "var(--mono)", fontSize: 8, color: "var(--ink-4)" }}>{t.note}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Strategy sections */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>
        {STRATEGY_SECTIONS.map((sec, i) => {
          const st = STATUS_STYLE[sec.status]
          const isOpen = openSec === sec.key
          return (
            <div key={sec.key} style={{
              borderRight: i % 2 === 0 ? "1px solid var(--hair)" : undefined,
              borderTop: i >= 2 ? "1px solid var(--hair)" : undefined,
            }}>
              {/* Section header */}
              <div
                onClick={() => setOpenSec(isOpen ? null : sec.key)}
                style={{ padding: "14px 22px", display: "flex", justifyContent: "space-between", alignItems: "baseline", cursor: "pointer" }}
              >
                <div>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 8, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--ink-3)", marginBottom: 3 }}>
                    {sec.label}
                  </div>
                  <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                    {sec.linkedMetrics.map(m => (
                      <span key={m} style={{ fontFamily: "var(--mono)", fontSize: 7, textTransform: "uppercase", letterSpacing: "0.06em", border: "1px solid var(--hair-strong)", padding: "1px 5px", color: "var(--ink-4)" }}>{m}</span>
                    ))}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                  <span style={{ fontFamily: "var(--mono)", fontSize: 8, color: st.color, textTransform: "uppercase", letterSpacing: "0.08em", border: `1px solid ${st.color}`, padding: "2px 6px" }}>
                    {st.label}
                  </span>
                  <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-3)" }}>{isOpen ? "▲" : "▼"}</span>
                </div>
              </div>

              {/* Section body */}
              {isOpen && (
                <div style={{ padding: "0 22px 18px" }}>
                  {editing && isDarcy ? (
                    <textarea
                      defaultValue={sectionValues[sec.key]}
                      style={{
                        width: "100%", minHeight: 110, background: "var(--panel-2)",
                        border: "1px solid var(--warn)", color: "var(--ink)", fontSize: 12.5,
                        lineHeight: 1.6, padding: 8, resize: "vertical", fontFamily: "inherit",
                      }}
                    />
                  ) : (
                    <p style={{ fontSize: 12.5, color: "var(--ink-2)", lineHeight: 1.6, margin: 0 }}>{sectionValues[sec.key]}</p>
                  )}
                  <div style={{ fontFamily: "var(--mono)", fontSize: 8, color: "var(--ink-4)", marginTop: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    {sec.lockedAt}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Feedback loop cycle indicator ────────────────────────────────────────────

const STATUS_META: Record<string, { color: string; icon: string; label: string }> = {
  resolved: { color: "var(--ok)",    icon: "✓", label: "Resolved" },
  active:   { color: "var(--warn)",  icon: "→", label: "Active" },
  pending:  { color: "var(--ink-3)", icon: "○", label: "Pending" },
}

function FeedbackLoop() {
  const [expanded, setExpanded] = useState<number | null>(0)
  const correctors = DATA.courseCorrector

  return (
    <div className="panel">
      <div className="panel-head">
        <span>Feedback loop · interventions &amp; outcomes</span>
        <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          {correctors.filter(c => c.status === "resolved").length} resolved · {correctors.filter(c => c.status !== "resolved").length} active/pending
        </span>
      </div>

      {/* Cycle legend */}
      <div style={{ padding: "10px 22px", borderBottom: "1px solid var(--hair)", display: "flex", gap: 6, alignItems: "center", fontFamily: "var(--mono)", fontSize: 8, color: "var(--ink-4)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
        <span>Recommendation</span><span style={{ color: "var(--hair-strong)" }}>→</span>
        <span>Action</span><span style={{ color: "var(--hair-strong)" }}>→</span>
        <span>Outcome</span><span style={{ color: "var(--hair-strong)" }}>→</span>
        <span>Impact</span><span style={{ color: "var(--hair-strong)" }}>→</span>
        <span style={{ color: "var(--ok)" }}>Next cycle</span>
      </div>

      {correctors.map((c, i) => {
        const sm = STATUS_META[c.status] ?? STATUS_META.pending
        const isOpen = expanded === i
        return (
          <div key={i} style={{ borderTop: i > 0 ? "1px solid var(--hair)" : undefined }}>
            {/* Card header */}
            <div
              onClick={() => setExpanded(isOpen ? null : i)}
              style={{ padding: "14px 22px", display: "flex", alignItems: "center", gap: 14, cursor: "pointer" }}
            >
              {/* Status node */}
              <div style={{
                width: 32, height: 32, borderRadius: "50%", border: `2px solid ${sm.color}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "var(--mono)", fontSize: 14, color: sm.color, flexShrink: 0,
                background: c.status === "resolved" ? `${sm.color}15` : "transparent",
              }}>
                {sm.icon}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 3 }}>
                  <span style={{ fontFamily: "var(--mono)", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.08em", color: sm.color }}>
                    {sm.label}
                  </span>
                  <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-3)" }}>{c.date}</span>
                  <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-4)" }}>{c.by}</span>
                </div>
                <div style={{ fontSize: 13, color: "var(--ink)", lineHeight: 1.4, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
                  {c.recommendation}
                </div>
              </div>

              {/* Impact badge */}
              {c.impact.after !== null && (
                <div style={{ flexShrink: 0, textAlign: "right" }}>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 8, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{c.impact.metric}</div>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 13, color: "var(--ok)" }}>
                    {c.impact.before} → {c.impact.after} <span style={{ fontSize: 9, color: "var(--ink-3)" }}>{c.impact.unit}</span>
                  </div>
                </div>
              )}

              <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-3)", flexShrink: 0 }}>{isOpen ? "▲" : "▼"}</span>
            </div>

            {/* Expanded detail */}
            {isOpen && (
              <div style={{ padding: "0 22px 20px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 0, borderTop: "1px solid var(--hair)", paddingTop: 16 }}>
                  {[
                    { label: "Recommendation", body: c.recommendation, color: "var(--ink-3)" },
                    { label: "Action taken",   body: c.action,         color: "var(--accent)" },
                    { label: "Outcome",        body: c.outcome,        color: c.status === "resolved" ? "var(--ok)" : "var(--warn)" },
                  ].map((col, ci) => (
                    <div key={col.label} style={{ padding: "0 16px", borderRight: ci < 2 ? "1px solid var(--hair)" : undefined }}>
                      <div style={{ fontFamily: "var(--mono)", fontSize: 8, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--ink-3)", marginBottom: 6 }}>{col.label}</div>
                      <p style={{ fontSize: 12, color: col.color, lineHeight: 1.5, margin: 0 }}>{col.body}</p>
                    </div>
                  ))}
                </div>

                {/* Impact rail */}
                {c.impact.after !== null && c.impact.days !== null && (
                  <div style={{ marginTop: 16, padding: "12px 16px", background: "var(--panel-2)", borderLeft: `3px solid ${sm.color}` }}>
                    <div style={{ fontFamily: "var(--mono)", fontSize: 8, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--ink-3)", marginBottom: 8 }}>
                      Impact · {c.impact.metric} · {c.impact.days} days to result
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                      <div style={{ fontFamily: "var(--mono)", fontSize: 20, color: "var(--ink-3)", letterSpacing: "-0.02em" }}>
                        {c.impact.before} <span style={{ fontSize: 9 }}>{c.impact.unit}</span>
                      </div>
                      <div style={{ flex: 1, height: 3, background: "var(--hair-strong)", position: "relative" }}>
                        <div style={{ position: "absolute", inset: 0, background: sm.color, borderRadius: 1 }} />
                        <div style={{ position: "absolute", right: 0, top: -9, fontFamily: "var(--mono)", fontSize: 10, color: sm.color }}>→</div>
                      </div>
                      <div style={{ fontFamily: "var(--mono)", fontSize: 20, color: sm.color, letterSpacing: "-0.02em" }}>
                        {c.impact.after} <span style={{ fontSize: 9, color: "var(--ink-3)" }}>{c.impact.unit}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Process chain ───────────────────────────────────────────────────────────

function ProcessChain() {
  const nodes = [
    { label: "Wearable data",     sub: "Oura · Garmin · Withings",   icon: "⊙", color: "var(--ok)" },
    { label: "Agent analysis",    sub: "Flags · drafts · patterns",   icon: "⊗", color: "var(--accent)" },
    { label: "Darcy review",      sub: "Countersign or dismiss",       icon: "◎", color: "var(--warn)" },
    { label: "Jamie dashboard",   sub: "Directives · check-in",       icon: "◉", color: "var(--ink-2)" },
    { label: "Protocol update",   sub: "Regime change · annotation",  icon: "◈", color: "var(--ok)" },
  ]

  return (
    <div className="panel">
      <div className="panel-head">
        <span>Data &amp; decision process chain</span>
        <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Signal → insight → action → outcome</span>
      </div>
      <div style={{ padding: "24px 32px", display: "flex", alignItems: "center", gap: 0 }}>
        {nodes.map((n, i) => (
          <>
            <div key={n.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
              <div style={{
                width: 48, height: 48, borderRadius: "50%",
                border: `2px solid ${n.color}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "var(--mono)", fontSize: 18, color: n.color,
                background: `${n.color}12`,
                marginBottom: 10,
              }}>
                {n.icon}
              </div>
              <div style={{ fontFamily: "var(--mono)", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--ink)", textAlign: "center", lineHeight: 1.4 }}>{n.label}</div>
              <div style={{ fontFamily: "var(--mono)", fontSize: 8, color: "var(--ink-4)", textAlign: "center", marginTop: 4 }}>{n.sub}</div>
            </div>
            {i < nodes.length - 1 && (
              <div key={`arrow-${i}`} style={{ fontFamily: "var(--mono)", fontSize: 14, color: "var(--hair-strong)", flexShrink: 0, paddingBottom: 22, marginTop: -22 }}>→</div>
            )}
          </>
        ))}
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function CommandPage() {
  const { role } = useApp()

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, padding: "24px 32px", maxWidth: 1300 }}>

      {/* Page header */}
      <div style={{ borderBottom: "1px solid var(--hair)", paddingBottom: 16 }}>
        <div style={{ fontFamily: "var(--mono)", fontSize: 8.5, textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--ink-3)", marginBottom: 6 }}>
          Strategy Command Centre
        </div>
        <h1 style={{ fontFamily: "var(--serif)", fontSize: 26, fontWeight: 400, color: "var(--ink)", margin: 0, letterSpacing: "-0.02em" }}>
          Jamie Garis · Q2 2026 programme
        </h1>
        <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-3)", marginTop: 6 }}>
          ApoB target ≤ 70 mg/dL &nbsp;·&nbsp; HRV floor ≥ 44 ms &nbsp;·&nbsp; Fibrinogen &lt;320 mg/dL
        </div>
      </div>

      {/* Cycle phase track */}
      <CyclePhase />

      {/* JTBD framework */}
      <JTBDFramework role={role} />

      {/* Data health table */}
      <DataHealth />

      {/* Quarterly strategy document */}
      <QuarterlyStrategy role={role} />

      {/* Process chain */}
      <ProcessChain />

      {/* Feedback loop */}
      <FeedbackLoop />

    </div>
  )
}
