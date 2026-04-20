"use client"

import { useState } from "react"
import { DATA } from "@/data/james"

const { command } = DATA

export default function ClientCommandPage() {
  const [openSec, setOpenSec] = useState<string | null>(null)
  const [checked, setChecked] = useState<Record<string, boolean>>(
    Object.fromEntries([
      ...command.jtbd.clientProgramme.map(i => [i.id, i.done]),
      ...command.jtbd.clientDaily.map(i => [i.id, i.done]),
    ])
  )

  const phases = command.cyclephase.phases
  const current = command.cyclephase.current

  const sectionValues: Record<string, string> = {
    exercise: command.quarterlyStrategy.exercise,
    fuelling: command.quarterlyStrategy.fuelling,
    lifestyle: command.quarterlyStrategy.lifestyle,
  }

  const sections = [
    { key: "exercise", label: "Exercise & training" },
    { key: "fuelling", label: "Fuelling & nutrition" },
    { key: "lifestyle", label: "Lifestyle protocol" },
  ] as const

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, padding: "24px 32px", maxWidth: 1100 }}>

      <div style={{ borderBottom: "1px solid var(--hair)", paddingBottom: 16 }}>
        <div style={{ fontFamily: "var(--mono)", fontSize: 8.5, textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--ink-3)", marginBottom: 6 }}>Your programme</div>
        <h1 style={{ fontFamily: "var(--serif)", fontSize: 26, fontWeight: 400, color: "var(--ink)", margin: 0, letterSpacing: "-0.02em" }}>Q2 2026 · Jamie Garis</h1>
      </div>

      {/* Cycle position */}
      <div className="panel">
        <div className="panel-head"><span>Quarterly cycle · Q2 2026</span></div>
        <div style={{ padding: "20px 24px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", position: "relative" }}>
            <div style={{ position: "absolute", top: 10, left: 10, right: 10, height: 1, background: "var(--hair-strong)", zIndex: 0 }} />
            {phases.map((ph, i) => {
              const color = ph.done ? "var(--ok)" : ph.upcoming ? "var(--warn)" : "var(--hair-strong)"
              return (
                <div key={ph.label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", position: "relative", zIndex: 1 }}>
                  <div style={{ width: 20, height: 20, borderRadius: "50%", background: ph.done ? "var(--ok)" : "var(--bg)", border: `2px solid ${color}`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10 }}>
                    {ph.done && <span style={{ color: "var(--bg)", fontSize: 9, fontWeight: 700 }}>✓</span>}
                    {ph.upcoming && !ph.done && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--warn)", display: "block" }} />}
                  </div>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 8.5, textTransform: "uppercase", letterSpacing: "0.08em", color: ph.upcoming ? "var(--ink)" : ph.done ? "var(--ok)" : "var(--ink-3)", textAlign: "center", lineHeight: 1.4, marginBottom: 3 }}>{ph.label}</div>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 8, color: ph.upcoming ? "var(--warn)" : "var(--ink-4)", textAlign: "center" }}>{ph.upcoming ? "▶ " : ""}{ph.date}</div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Checklist */}
      <div className="panel">
        <div className="panel-head"><span>Your programme checklist</span><span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Q2 2026</span></div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
          {[
            { title: "Programme goals", items: command.jtbd.clientProgramme, color: "var(--accent)" },
            { title: "Daily habits", items: command.jtbd.clientDaily, color: "var(--accent)" },
          ].map((col, ci) => {
            const done = col.items.filter(i => checked[i.id]).length
            return (
              <div key={col.title} style={{ borderRight: ci === 0 ? "1px solid var(--hair)" : undefined, padding: "16px 20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", color: col.color }}>{col.title}</div>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-3)" }}>{done}/{col.items.length}</div>
                </div>
                <div style={{ height: 2, background: "var(--hair-strong)", marginBottom: 14 }}>
                  <div style={{ height: "100%", width: `${(done / col.items.length) * 100}%`, background: col.color }} />
                </div>
                {col.items.map(item => (
                  <label key={item.id} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 8, cursor: "pointer" }}>
                    <input type="checkbox" checked={checked[item.id] ?? false} onChange={() => setChecked(p => ({ ...p, [item.id]: !p[item.id] }))} style={{ marginTop: 2, accentColor: col.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 12.5, color: checked[item.id] ? "var(--ink-3)" : "var(--ink)", lineHeight: 1.4, textDecoration: checked[item.id] ? "line-through" : "none" }}>{item.text}</span>
                  </label>
                ))}
              </div>
            )
          })}
        </div>
      </div>

      {/* Strategy (read-only) */}
      <div className="panel">
        <div className="panel-head">
          <span>Your Q2 protocol · {command.quarterlyStrategy.quarter}</span>
          <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Read-only · set by {command.quarterlyStrategy.lockedBy.split("·")[0].trim()}</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
          {sections.map((sec, i) => (
            <div key={sec.key} style={{ borderRight: i % 2 === 0 ? "1px solid var(--hair)" : undefined, borderTop: i >= 2 ? "1px solid var(--hair)" : undefined }}>
              <div onClick={() => setOpenSec(openSec === sec.key ? null : sec.key)} style={{ padding: "14px 22px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontFamily: "var(--mono)", fontSize: 8, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--ink-3)" }}>{sec.label}</div>
                <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-3)" }}>{openSec === sec.key ? "▲" : "▼"}</span>
              </div>
              {openSec === sec.key && (
                <div style={{ padding: "0 22px 18px" }}>
                  <p style={{ fontSize: 12.5, color: "var(--ink-2)", lineHeight: 1.6, margin: 0 }}>{sectionValues[sec.key]}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Feedback loop (resolved) */}
      <div className="panel">
        <div className="panel-head"><span>Resolved interventions</span><span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ok)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{DATA.courseCorrector.filter(c => c.status === "resolved").length} resolved this quarter</span></div>
        {DATA.courseCorrector.filter(c => c.status === "resolved").map((c, i) => (
          <div key={i} style={{ padding: "14px 20px", borderTop: i > 0 ? "1px solid var(--hair)" : "1px solid var(--hair)" }}>
            <div style={{ display: "flex", gap: 12, alignItems: "baseline", marginBottom: 6 }}>
              <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ok)", textTransform: "uppercase" }}>✓ Resolved</span>
              <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-3)" }}>{c.date}</span>
            </div>
            <div style={{ fontSize: 12.5, color: "var(--ink-2)", lineHeight: 1.5, marginBottom: 4 }}>{c.outcome}</div>
            {c.impact.after !== null && (
              <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--ok)" }}>{c.impact.metric}: {c.impact.before} → {c.impact.after} {c.impact.unit} in {c.impact.days} days</div>
            )}
          </div>
        ))}
      </div>

    </div>
  )
}
