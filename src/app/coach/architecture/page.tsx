"use client"

import { useState } from "react"

// ─── Data model ────────────────────────────────────────────────────────────────

type NodeKind = "client" | "coach" | "data" | "agent" | "output"
type EdgeKind = "sync" | "review" | "generate" | "alert" | "read"

interface ArchNode {
  id: string
  kind: NodeKind
  label: string
  sublabel?: string
}

interface ArchEdge {
  from: string
  to: string
  kind: EdgeKind
  label: string
  description: string
}

const NODES: ArchNode[] = [
  // Data sources
  { id: "wearable",   kind: "data",   label: "Wearables",         sublabel: "Whoop · Oura" },
  { id: "cgm",        kind: "data",   label: "CGM",               sublabel: "Levels / Dexcom" },
  { id: "bloodwork",  kind: "data",   label: "Lab results",       sublabel: "Quarterly bloods" },
  { id: "rpe",        kind: "data",   label: "RPE / Mood",        sublabel: "Manual check-in" },

  // Processing
  { id: "irt",        kind: "agent",  label: "Allostatic Load Engine", sublabel: "IRT-based scoring" },
  { id: "agent",      kind: "agent",  label: "AI Agent",          sublabel: "Pattern · Brief · Draft" },

  // Coach product
  { id: "command",    kind: "coach",  label: "Command Centre",    sublabel: "/coach/command" },
  { id: "trends_c",   kind: "coach",  label: "Trends",            sublabel: "/coach/trends" },
  { id: "medical_c",  kind: "coach",  label: "Medical Roadmap",   sublabel: "/coach/medical" },
  { id: "strategy",   kind: "coach",  label: "Quarterly Strategy", sublabel: "Editable doc" },

  // Client product
  { id: "dashboard",  kind: "client", label: "Jamie Dashboard",   sublabel: "/client" },
  { id: "checkin",    kind: "client", label: "Check-in",          sublabel: "/client/checkin" },
  { id: "directive",  kind: "client", label: "Directives",        sublabel: "Pushed to dashboard" },
  { id: "command_j",  kind: "client", label: "Command (read)",    sublabel: "/client/command" },

  // Outputs
  { id: "report",     kind: "output", label: "Quarterly Report",  sublabel: "Archived PDF link" },
  { id: "notify",     kind: "output", label: "Notification",      sublabel: "Push / email" },
]

const EDGES: ArchEdge[] = [
  {
    from: "wearable", to: "irt", kind: "sync",
    label: "Auto-sync",
    description: "HRV, RHR, sleep, strain stream continuously into the Allostatic Load engine.",
  },
  {
    from: "cgm", to: "irt", kind: "sync",
    label: "Auto-sync",
    description: "Glucose variability and time-in-range feed the metabolic subscore.",
  },
  {
    from: "bloodwork", to: "irt", kind: "sync",
    label: "Quarterly upload",
    description: "ApoB, testosterone, HbA1c, Lp(a), and ferritin update the biomarker rail.",
  },
  {
    from: "rpe", to: "irt", kind: "sync",
    label: "Daily entry",
    description: "Subjective load from the check-in form adjusts the composite AL score.",
  },
  {
    from: "irt", to: "agent", kind: "generate",
    label: "Score + flags",
    description: "AL score, subscore deltas, and statistical anomalies are passed to the agent for interpretation.",
  },
  {
    from: "irt", to: "dashboard", kind: "sync",
    label: "Live score",
    description: "The AL score card, northstar, and week calendar update as new data arrives.",
  },
  {
    from: "irt", to: "trends_c", kind: "sync",
    label: "30-day series",
    description: "Trend lines, pivot heatmap, and overlay charts read directly from the scored time-series.",
  },
  {
    from: "agent", to: "command", kind: "generate",
    label: "Morning brief",
    description: "Each morning the agent analyses overnight data and prepares a structured brief with flags, draft protocols, and action priorities.",
  },
  {
    from: "agent", to: "notify", kind: "alert",
    label: "Alert",
    description: "Critical flags (autonomic stress, glucose spike, sleep debt) trigger push or email notifications to Darcy.",
  },
  {
    from: "command", to: "strategy", kind: "review",
    label: "Darcy edits",
    description: "Darcy authors and locks the quarterly strategy doc inside Command Centre. Changes are versioned.",
  },
  {
    from: "strategy", to: "directive", kind: "generate",
    label: "Publish directive",
    description: "When Darcy publishes a protocol change, it surfaces on Jamie's dashboard as a directive card.",
  },
  {
    from: "strategy", to: "command_j", kind: "read",
    label: "Read-only view",
    description: "Jamie can read the strategy doc (collapsed, read-only) from the client Command page.",
  },
  {
    from: "command", to: "report", kind: "generate",
    label: "End-of-quarter",
    description: "At quarter close, the system snapshots the dashboard, results, and strategy doc into an archived report link.",
  },
  {
    from: "checkin", to: "rpe", kind: "sync",
    label: "Form submit",
    description: "Jamie's daily check-in feeds RPE, mood, and session notes back into the data layer.",
  },
  {
    from: "directive", to: "dashboard", kind: "sync",
    label: "Rendered",
    description: "Published directives appear on Jamie's main dashboard as 'In-flight correctors'.",
  },
  {
    from: "medical_c", to: "bloodwork", kind: "read",
    label: "Milestone track",
    description: "The Medical Roadmap reads upcoming test dates and target ranges from the biomarker config.",
  },
  {
    from: "agent", to: "strategy", kind: "generate",
    label: "Draft suggestion",
    description: "Agent can draft protocol change language that Darcy reviews, edits, and approves before publishing.",
  },
]

// ─── Colour helpers ─────────────────────────────────────────────────────────

const KIND_COLOR: Record<NodeKind, string> = {
  client: "var(--accent)",
  coach:  "var(--ok)",
  data:   "#8FA0B3",
  agent:  "#9B8FA9",
  output: "#C8A56A",
}
const KIND_BG: Record<NodeKind, string> = {
  client: "rgba(127,169,155,0.08)",
  coach:  "rgba(127,169,155,0.08)",
  data:   "rgba(143,160,179,0.08)",
  agent:  "rgba(155,143,169,0.08)",
  output: "rgba(200,165,106,0.08)",
}
const EDGE_COLOR: Record<EdgeKind, string> = {
  sync:     "var(--accent)",
  review:   "var(--ok)",
  generate: "#9B8FA9",
  alert:    "var(--alert)",
  read:     "#8FA0B3",
}
const EDGE_LABEL_COLOR: Record<EdgeKind, string> = {
  sync:     "var(--accent)",
  review:   "var(--ok)",
  generate: "#9B8FA9",
  alert:    "var(--alert)",
  read:     "#8FA0B3",
}

// ─── Layout positions (col × row grid, unitless — we use %) ─────────────────
// We'll render in a 5-layer column layout inside a scrollable container.

const LAYER_LABELS: Record<NodeKind, string> = {
  data:   "Data sources",
  agent:  "Processing layer",
  coach:  "Coach product",
  client: "Client product",
  output: "Outputs",
}

const LAYER_ORDER: NodeKind[] = ["data", "agent", "coach", "client", "output"]

// ─── Component ───────────────────────────────────────────────────────────────

export default function ArchitecturePage() {
  const [activeEdge, setActiveEdge] = useState<ArchEdge | null>(null)
  const [activeNode, setActiveNode] = useState<ArchNode | null>(null)

  const byLayer = (kind: NodeKind) => NODES.filter(n => n.kind === kind)

  const edgesFor = (nodeId: string) =>
    EDGES.filter(e => e.from === nodeId || e.to === nodeId)

  const handleNode = (n: ArchNode) => {
    setActiveEdge(null)
    setActiveNode(prev => (prev?.id === n.id ? null : n))
  }

  const handleEdge = (e: ArchEdge) => {
    setActiveNode(null)
    setActiveEdge(prev => (prev?.from === e.from && prev?.to === e.to ? null : e))
  }

  const isHighlighted = (nodeId: string) => {
    if (activeNode) return activeNode.id === nodeId || edgesFor(activeNode.id).some(e => e.from === nodeId || e.to === nodeId)
    if (activeEdge) return activeEdge.from === nodeId || activeEdge.to === nodeId
    return true
  }

  return (
    <div style={{ padding: "32px 40px", minHeight: "100vh", fontFamily: "var(--mono)" }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--ink-3)", marginBottom: 6 }}>
          SYSTEM ARCHITECTURE
        </div>
        <h1 style={{ fontFamily: "var(--serif)", fontSize: 22, fontWeight: 600, margin: 0, color: "var(--ink-1)" }}>
          How the two products talk to each other
        </h1>
        <p style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 8, maxWidth: 600, lineHeight: 1.6 }}>
          Every action Darcy takes in the Coach product — editing strategy, publishing directives, approving agent drafts —
          produces a visible result in Jamie's Client product. This document maps those connections.
          Click any node or edge to see details.
        </p>
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 28 }}>
        {LAYER_ORDER.map(kind => (
          <div key={kind} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: kind === "agent" ? "50%" : 2, background: KIND_COLOR[kind], flexShrink: 0 }} />
            <span style={{ fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-3)" }}>
              {LAYER_LABELS[kind]}
            </span>
          </div>
        ))}
        <div style={{ width: 1, background: "var(--hair-strong)", margin: "0 4px" }} />
        {(Object.keys(EDGE_COLOR) as EdgeKind[]).map(ek => (
          <div key={ek} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 18, height: 2, background: EDGE_COLOR[ek], flexShrink: 0, borderRadius: 1 }} />
            <span style={{ fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-3)" }}>{ek}</span>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 16, marginBottom: 32 }}>
        {LAYER_ORDER.map(kind => (
          <div key={kind}>
            <div style={{
              fontSize: 9,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: KIND_COLOR[kind],
              marginBottom: 10,
              borderBottom: `1px solid ${KIND_COLOR[kind]}33`,
              paddingBottom: 6,
            }}>
              {LAYER_LABELS[kind]}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {byLayer(kind).map(node => {
                const hi = isHighlighted(node.id)
                const sel = activeNode?.id === node.id
                return (
                  <button
                    key={node.id}
                    onClick={() => handleNode(node)}
                    style={{
                      all: "unset",
                      cursor: "pointer",
                      border: `1px solid ${sel ? KIND_COLOR[kind] : "var(--hair-strong)"}`,
                      borderRadius: 6,
                      padding: "10px 12px",
                      background: sel ? KIND_BG[kind] : "transparent",
                      opacity: hi ? 1 : 0.28,
                      transition: "opacity 0.15s, border-color 0.15s",
                      display: "block",
                      textAlign: "left",
                    }}
                  >
                    <div style={{ fontSize: 11, color: sel ? KIND_COLOR[kind] : "var(--ink-1)", fontWeight: sel ? 600 : 400, marginBottom: 3 }}>
                      {node.label}
                    </div>
                    {node.sublabel && (
                      <div style={{ fontSize: 9, color: "var(--ink-3)", letterSpacing: "0.05em" }}>
                        {node.sublabel}
                      </div>
                    )}
                    {/* Edge count badge */}
                    <div style={{ marginTop: 8, display: "flex", gap: 4, flexWrap: "wrap" }}>
                      {edgesFor(node.id).map((e, i) => (
                        <span key={i} style={{
                          fontSize: 8,
                          padding: "1px 5px",
                          borderRadius: 3,
                          background: `${EDGE_COLOR[e.kind]}22`,
                          color: EDGE_COLOR[e.kind],
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                        }}>
                          {e.kind}
                        </span>
                      ))}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Edge table */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--ink-3)", marginBottom: 12 }}>
          ALL CONNECTIONS — click to inspect
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {EDGES.map((edge, i) => {
            const fromNode = NODES.find(n => n.id === edge.from)!
            const toNode   = NODES.find(n => n.id === edge.to)!
            const sel = activeEdge?.from === edge.from && activeEdge?.to === edge.to
            const hi  = activeNode
              ? edge.from === activeNode.id || edge.to === activeNode.id
              : activeEdge
                ? sel
                : true

            return (
              <button
                key={i}
                onClick={() => handleEdge(edge)}
                style={{
                  all: "unset",
                  cursor: "pointer",
                  display: "grid",
                  gridTemplateColumns: "180px 60px 180px 80px 1fr",
                  alignItems: "center",
                  gap: 12,
                  padding: "8px 12px",
                  border: `1px solid ${sel ? EDGE_COLOR[edge.kind] : "var(--hair)"}`,
                  borderRadius: 5,
                  background: sel ? `${EDGE_COLOR[edge.kind]}10` : "transparent",
                  opacity: hi ? 1 : 0.2,
                  transition: "opacity 0.15s, border-color 0.15s",
                  fontSize: 11,
                }}
              >
                {/* From */}
                <div style={{ color: KIND_COLOR[fromNode.kind] }}>
                  <span style={{ fontSize: 9, color: "var(--ink-3)", display: "block", marginBottom: 1 }}>FROM</span>
                  {fromNode.label}
                </div>
                {/* Arrow */}
                <div style={{ textAlign: "center", color: EDGE_COLOR[edge.kind], fontSize: 13 }}>→</div>
                {/* To */}
                <div style={{ color: KIND_COLOR[toNode.kind] }}>
                  <span style={{ fontSize: 9, color: "var(--ink-3)", display: "block", marginBottom: 1 }}>TO</span>
                  {toNode.label}
                </div>
                {/* Kind */}
                <div style={{
                  fontSize: 9,
                  padding: "2px 7px",
                  borderRadius: 3,
                  background: `${EDGE_COLOR[edge.kind]}20`,
                  color: EDGE_LABEL_COLOR[edge.kind],
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  textAlign: "center",
                  justifySelf: "start",
                }}>
                  {edge.kind}
                </div>
                {/* Label */}
                <div style={{ color: "var(--ink-2)", fontSize: 11 }}>{edge.label}</div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Detail panel */}
      {(activeNode || activeEdge) && (
        <div style={{
          position: "sticky",
          bottom: 20,
          border: "1px solid var(--hair-strong)",
          borderRadius: 8,
          padding: "16px 20px",
          background: "var(--bg)",
          display: "grid",
          gridTemplateColumns: "1fr auto",
          gap: 16,
          alignItems: "start",
        }}>
          {activeNode && (() => {
            const inbound  = EDGES.filter(e => e.to   === activeNode.id)
            const outbound = EDGES.filter(e => e.from === activeNode.id)
            return (
              <>
                <div>
                  <div style={{ fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase", color: KIND_COLOR[activeNode.kind], marginBottom: 4 }}>
                    {LAYER_LABELS[activeNode.kind]}
                  </div>
                  <div style={{ fontSize: 14, color: "var(--ink-1)", fontWeight: 600, marginBottom: 4 }}>{activeNode.label}</div>
                  {activeNode.sublabel && (
                    <div style={{ fontSize: 11, color: "var(--ink-3)", marginBottom: 12 }}>{activeNode.sublabel}</div>
                  )}
                  <div style={{ display: "flex", gap: 24 }}>
                    {inbound.length > 0 && (
                      <div>
                        <div style={{ fontSize: 9, color: "var(--ink-3)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>
                          RECEIVES FROM
                        </div>
                        {inbound.map((e, i) => {
                          const src = NODES.find(n => n.id === e.from)!
                          return (
                            <div key={i} style={{ fontSize: 11, color: "var(--ink-2)", marginBottom: 4, display: "flex", gap: 6, alignItems: "baseline" }}>
                              <span style={{ color: EDGE_COLOR[e.kind], fontSize: 9 }}>●</span>
                              <span style={{ color: KIND_COLOR[src.kind] }}>{src.label}</span>
                              <span style={{ color: "var(--ink-3)" }}>via {e.label}</span>
                            </div>
                          )
                        })}
                      </div>
                    )}
                    {outbound.length > 0 && (
                      <div>
                        <div style={{ fontSize: 9, color: "var(--ink-3)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>
                          SENDS TO
                        </div>
                        {outbound.map((e, i) => {
                          const dst = NODES.find(n => n.id === e.to)!
                          return (
                            <div key={i} style={{ fontSize: 11, color: "var(--ink-2)", marginBottom: 4, display: "flex", gap: 6, alignItems: "baseline" }}>
                              <span style={{ color: EDGE_COLOR[e.kind], fontSize: 9 }}>●</span>
                              <span style={{ color: KIND_COLOR[dst.kind] }}>{dst.label}</span>
                              <span style={{ color: "var(--ink-3)" }}>via {e.label}</span>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>
                <button onClick={() => setActiveNode(null)} style={{ all: "unset", cursor: "pointer", fontSize: 10, color: "var(--ink-3)", letterSpacing: "0.1em" }}>
                  CLOSE ×
                </button>
              </>
            )
          })()}

          {activeEdge && (() => {
            const fromNode = NODES.find(n => n.id === activeEdge.from)!
            const toNode   = NODES.find(n => n.id === activeEdge.to)!
            return (
              <>
                <div>
                  <div style={{ fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase", color: EDGE_COLOR[activeEdge.kind], marginBottom: 6 }}>
                    {activeEdge.kind.toUpperCase()} · {activeEdge.label}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                    <span style={{ fontSize: 13, color: KIND_COLOR[fromNode.kind], fontWeight: 600 }}>{fromNode.label}</span>
                    <span style={{ color: EDGE_COLOR[activeEdge.kind] }}>──────→</span>
                    <span style={{ fontSize: 13, color: KIND_COLOR[toNode.kind], fontWeight: 600 }}>{toNode.label}</span>
                  </div>
                  <p style={{ fontSize: 12, color: "var(--ink-2)", margin: 0, lineHeight: 1.65, maxWidth: 560 }}>
                    {activeEdge.description}
                  </p>
                </div>
                <button onClick={() => setActiveEdge(null)} style={{ all: "unset", cursor: "pointer", fontSize: 10, color: "var(--ink-3)", letterSpacing: "0.1em" }}>
                  CLOSE ×
                </button>
              </>
            )
          })()}
        </div>
      )}

      {/* Action-to-result reference table */}
      <div style={{ marginTop: 40, paddingTop: 24, borderTop: "1px solid var(--hair-strong)" }}>
        <div style={{ fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--ink-3)", marginBottom: 16 }}>
          ACTION → VISUAL RESULT REFERENCE
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1, background: "var(--hair)", border: "1px solid var(--hair)" }}>
          {/* Header */}
          {["Darcy does this in Coach", "Triggers this process", "Jamie sees this in Client"].map(h => (
            <div key={h} style={{ padding: "8px 12px", background: "var(--bg-2)", fontSize: 9, color: "var(--ink-3)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              {h}
            </div>
          ))}
          {/* Rows */}
          {[
            ["Publishes a protocol change in Strategy doc", "Directive generated → pushed to dashboard", "New corrector card appears in 'In-flight correctors'"],
            ["Confirms DEXA fasting in Command Centre", "Milestone marked done on Medical Roadmap", "Upcoming test shows confirmed status"],
            ["Approves agent draft in Agent chat", "Draft promoted to strategy section", "Strategy section visible in Jamie's Command (read-only)"],
            ["Updates Q2 target in Strategy doc", "Target rail recalculates vs actuals", "Progress bar on Jamie's northstar section updates"],
            ["Closes a quarter (Q1 → Q2 transition)", "Report snapshot generated, archived", "Historical report link appears in 'Past quarters'"],
            ["Agent flags autonomic stress overnight", "Alert sent to Darcy + briefing prepared", "No direct client impact until Darcy acts on it"],
            ["Jamie submits daily check-in (RPE)", "RPE feeds IRT engine → AL score updates", "Darcy's Trends pivot refreshes with new day data"],
          ].map(([action, trigger, result], i) => (
            [action, trigger, result].map((cell, j) => (
              <div key={`${i}-${j}`} style={{
                padding: "10px 12px",
                background: "var(--bg)",
                fontSize: 11,
                color: j === 0 ? "var(--ok)" : j === 1 ? "#9B8FA9" : "var(--accent)",
                lineHeight: 1.5,
              }}>
                {cell}
              </div>
            ))
          ))}
        </div>
      </div>

      {/* Integration status */}
      <div style={{ marginTop: 32, display: "flex", gap: 16, flexWrap: "wrap" }}>
        {[
          { label: "Data sync", status: "live",    note: "Wearable + CGM auto-sync" },
          { label: "IRT engine", status: "live",   note: "Scoring on every new data point" },
          { label: "AI Agent",   status: "proto",  note: "Pre-loaded responses, API pending" },
          { label: "Directives", status: "live",   note: "Coach publishes → client sees" },
          { label: "Reports",    status: "proto",  note: "Q2 active, Q1 archived" },
          { label: "Push alerts",status: "planned",note: "Agent → Darcy notifications" },
        ].map(item => (
          <div key={item.label} style={{
            border: "1px solid var(--hair-strong)",
            borderRadius: 6,
            padding: "10px 14px",
            display: "flex",
            flexDirection: "column",
            gap: 4,
            minWidth: 140,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{
                width: 6, height: 6, borderRadius: "50%", flexShrink: 0,
                background: item.status === "live" ? "var(--ok)" : item.status === "proto" ? "var(--warn)" : "var(--ink-4)",
              }} />
              <span style={{ fontSize: 10, color: "var(--ink-3)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                {item.status}
              </span>
            </div>
            <div style={{ fontSize: 12, color: "var(--ink-1)", fontWeight: 500 }}>{item.label}</div>
            <div style={{ fontSize: 10, color: "var(--ink-3)" }}>{item.note}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
