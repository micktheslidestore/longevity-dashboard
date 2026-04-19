"use client"

import { useState } from "react"
import { DATA } from "@/data/james"
import { useApp } from "./RoleContext"

export default function QuarterlyReview() {
  const { role } = useApp()
  const [open, setOpen] = useState(false)
  const { quarterlyReview: qr } = DATA

  if (qr.status !== "ready") return null

  return (
    <>
      <div className="qr-banner">
        <div>
          <div className="qr-label">{qr.quarter} closed {qr.closedOn} · {qr.daysOpen} days ago</div>
          <div className="qr-title">
            {role === "darcy"
              ? "Quarterly review ready to send — confirm and publish to Jamie."
              : "Your Q1 review is ready. Darcy has prepared a summary of what moved and what's next."}
          </div>
          <div style={{ marginTop: 6, fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Prepared by {qr.preparedBy}
          </div>
        </div>
        <div style={{ display: "flex", gap: 0, flexShrink: 0 }}>
          <button
            onClick={() => setOpen(o => !o)}
            style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", border: "1px solid var(--warn)", borderRight: 0, padding: "8px 14px", color: "var(--warn)", background: "transparent", cursor: "pointer" }}
          >
            {open ? "Close" : "Open review"}
          </button>
          {role === "darcy" && (
            <button style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", border: "1px solid var(--warn)", padding: "8px 14px", background: "var(--warn)", color: "var(--bg)", cursor: "pointer" }}>
              Publish to Jamie
            </button>
          )}
        </div>
      </div>

      {open && (
        <div className="panel" style={{ padding: "24px 28px" }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--ink-3)", marginBottom: 20 }}>
            {qr.quarter} · Quarterly review
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            {qr.agenda.map((section, i) => (
              <div key={i}>
                <div style={{ fontFamily: "var(--mono)", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--ink-2)", marginBottom: 10, paddingBottom: 8, borderBottom: "1px solid var(--hair)" }}>
                  {section.section}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {section.items.map((item, j) => (
                    <div key={j} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                      <span style={{ color: "var(--ink-3)", fontFamily: "var(--mono)", fontSize: 10, flexShrink: 0, marginTop: 1 }}>—</span>
                      <span style={{ fontSize: 12.5, color: "var(--ink)", lineHeight: 1.55 }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          {role === "darcy" && (
            <div style={{ marginTop: 24, paddingTop: 16, borderTop: "1px solid var(--hair)", display: "flex", gap: 12, alignItems: "center" }}>
              <div style={{ flex: 1, fontFamily: "var(--serif)", fontSize: 13, color: "var(--ink-3)", fontStyle: "italic" }}>
                This agenda populates automatically at quarter close. Edit Q2 targets before publishing.
              </div>
              <button style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", border: "1px solid var(--hair-strong)", padding: "8px 14px", color: "var(--ink-2)", background: "transparent", cursor: "pointer" }}>
                Edit targets
              </button>
              <button style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", border: "1px solid var(--ink)", padding: "8px 14px", background: "var(--ink)", color: "var(--bg)", cursor: "pointer" }}>
                Publish to Jamie
              </button>
            </div>
          )}
        </div>
      )}
    </>
  )
}
