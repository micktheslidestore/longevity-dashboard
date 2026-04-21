"use client"

import { useState } from "react"
import { T } from "@/components/Primitives"

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
  { id: "wearable",   kind: "data",   label: "Wearables",              sublabel: "Whoop · Oura" },
  { id: "cgm",        kind: "data",   label: "CGM",                    sublabel: "Levels / Dexcom" },
  { id: "bloodwork",  kind: "data",   label: "Lab results",            sublabel: "Quarterly bloods" },
  { id: "rpe",        kind: "data",   label: "RPE / Mood",             sublabel: "Manual check-in" },

  // Processing
  { id: "irt",        kind: "agent",  label: "Allostatic Load Engine", sublabel: "IRT-based scoring" },
  { id: "agent",      kind: "agent",  label: "AI Agent",               sublabel: "Pattern · Brief · Draft" },

  // Coach product
  { id: "command",    kind: "coach",  label: "Command Centre",         sublabel: "/coach/command" },
  { id: "trends_c",   kind: "coach",  label: "Trends",                 sublabel: "/coach/trends" },
  { id: "medical_c",  kind: "coach",  label: "Medical Roadmap",        sublabel: "/coach/medical" },
  { id: "strategy",   kind: "coach",  label: "Quarterly Strategy",     sublabel: "Editable doc" },

  // Client product
  { id: "dashboard",  kind: "client", label: "Jamie Dashboard",        sublabel: "/client" },
  { id: "checkin",    kind: "client", label: "Check-in",               sublabel: "/client/checkin" },
  { id: "directive",  kind: "client", label: "Directives",             sublabel: "Pushed to dashboard" },
  { id: "command_j",  kind: "client", label: "Command (read)",         sublabel: "/client/command" },

  // Outputs
  { id: "report",     kind: "output", label: "Quarterly Report",       sublabel: "Archived PDF link" },
  { id: "notify",     kind: "output", label: "Notification",           sublabel: "Push / email" },
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
    label: "End of quarter",
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
  client: T.accent,
  coach:  T.ok,
  data:   "#8FA0B3",
  agent:  "#9B8FA9",
  output: "#C8A56A",
}
const KIND_BG: Record<NodeKind, string> = {
  client: "rgba(200,165,106,0.08)",
  coach:  "rgba(127,169,155,0.08)",
  data:   "rgba(143,160,179,0.08)",
  agent:  "rgba(155,143,169,0.08)",
  output: "rgba(200,165,106,0.08)",
}
const EDGE_COLOR: Record<EdgeKind, string> = {
  sync:     T.accent,
  review:   T.ok,
  generate: "#9B8FA9",
  alert:    T.alert,
  read:     "#8FA0B3",
}

const LAYER_LABELS: Record<NodeKind, string> = {
  data:   "Data sources",
  agent:  "Processing",
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
    <div style={{ padding: "40px 48px 80px", minHeight: "100vh" }}>

      {/* Header */}
      <div style={{ marginBottom: 40 }}>
        <p style={{ fontFamily: T.sans, fontSize: 11, fontWeight: 500, color: T.ink3, margin: "0 0 8px" }}>
          System architecture
        </p>
        <h1 style={{ fontFamily: T.serif, fontSize: 26, fontWeight: 400, margin: "0 0 12px", color: T.ink }}>
          How the two products talk to each other
        </h1>
        <p style={{ fontFamily: T.sans, fontSize: 13, color: T.ink3, margin: 0, maxWidth: 600, lineHeight: 1.65 }}>
          Every action Darcy takes in the Coach product — editing strategy, publishing directives, approving agent drafts —
          produces a visible result in Jamie's Client product. Click any node or edge to see details.
        </p>
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 32 }}>
        {LAYER_ORDER.map(kind => (
          <div key={kind} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{
              width: 8,
              height: 8,
              borderRadius: kind === "agent" ? "50%" : 2,
              background: KIND_COLOR[kind],
              flexShrink: 0,
            }} />
            <span style={{ fontFamily: T.sans, fontSize: 11, color: T.ink3 }}>
              {LAYER_LABELS[kind]}
            </span>
          </div>
        ))}
        <div style={{ width: 1, background: T.borderMed, margin: "0 4px" }} />
        {(Object.keys(EDGE_COLOR) as EdgeKind[]).map(ek => (
          <div key={ek} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 16, height: 2, background: EDGE_COLOR[ek], flexShrink: 0, borderRadius: 1 }} />
            <span style={{ fontFamily: T.sans, fontSize: 11, color: T.ink3 }}>{ek}</span>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 16, marginBottom: 48 }}>
        {LAYER_ORDER.map(kind => (
          <div key={kind}>
            <div style={{
              fontFamily: T.sans,
              fontSize: 11,
              fontWeight: 500,
              color: KIND_COLOR[kind],
              marginBottom: 10,
              paddingBottom: 8,
              borderBottom: `1px solid ${KIND_COLOR[kind]}33`,
            }}>
              {LAYER_LABELS[kind]}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
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
                      border: `1px solid ${sel ? KIND_COLOR[kind] : T.border}`,
                      borderRadius: 8,
                      padding: "10px 12px",
                      background: sel ? KIND_BG[kind] : T.surface,
                      opacity: hi ? 1 : 0.25,
                      transition: "opacity 0.15s, border-color 0.15s, background 0.15s",
                      display: "block",
                      textAlign: "left",
                    }}
                  >
                    <div style={{
                      fontFamily: T.sans,
                      fontSize: 12,
                      fontWeight: sel ? 600 : 400,
                      color: sel ? KIND_COLOR[kind] : T.ink,
                      marginBottom: 2,
                    }}>
                      {node.label}
                    </div>
                    {node.sublabel && (
                      <div style={{ fontFamily: T.sans, fontSize: 10, color: T.ink3, marginBottom: 8 }}>
                        {node.sublabel}
                      </div>
                    )}
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                      {edgesFor(node.id).map((e, i) => (
                        <span key={i} style={{
                          fontFamily: T.sans,
                          fontSize: 9,
                          padding: "1px 5px",
                          borderRadius: 4,
                          background: `${EDGE_COLOR[e.kind]}20`,
                          color: EDGE_COLOR[e.kind],
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
      <div style={{ marginBottom: 48 }}>
        <p style={{ fontFamily: T.sans, fontSize: 11, fontWeight: 500, color: T.ink3, margin: "0 0 12px" }}>
          All connections — click to inspect
        </p>
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
                  gridTemplateColumns: "180px 40px 180px 90px 1fr",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 14px",
                  border: `1px solid ${sel ? EDGE_COLOR[edge.kind] : T.border}`,
                  borderRadius: 8,
                  background: sel ? `${EDGE_COLOR[edge.kind]}10` : T.surface,
                  opacity: hi ? 1 : 0.2,
                  transition: "opacity 0.15s, border-color 0.15s",
                }}
              >
                <div style={{ color: KIND_COLOR[fromNode.kind] }}>
                  <span style={{ fontFamily: T.sans, fontSize: 10, color: T.ink3, display: "block", marginBottom: 2 }}>From</span>
                  <span style={{ fontFamily: T.sans, fontSize: 12 }}>{fromNode.label}</span>
                </div>
                <div style={{ textAlign: "center", color: EDGE_COLOR[edge.kind], fontFamily: T.sans, fontSize: 16, lineHeight: 1 }}>→</div>
                <div style={{ color: KIND_COLOR[toNode.kind] }}>
                  <span style={{ fontFamily: T.sans, fontSize: 10, color: T.ink3, display: "block", marginBottom: 2 }}>To</span>
                  <span style={{ fontFamily: T.sans, fontSize: 12 }}>{toNode.label}</span>
                </div>
                <span style={{
                  fontFamily: T.sans,
                  fontSize: 10,
                  padding: "3px 8px",
                  borderRadius: 6,
                  background: `${EDGE_COLOR[edge.kind]}18`,
                  color: EDGE_COLOR[edge.kind],
                  justifySelf: "start",
                }}>
                  {edge.kind}
                </span>
                <span style={{ fontFamily: T.sans, fontSize: 12, color: T.ink2 }}>{edge.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Detail panel (sticky) */}
      {(activeNode || activeEdge) && (
        <div style={{
          position: "sticky",
          bottom: 20,
          border: `1px solid ${T.borderMed}`,
          borderRadius: 12,
          padding: "20px 24px",
          background: T.surface,
          display: "grid",
          gridTemplateColumns: "1fr auto",
          gap: 16,
          alignItems: "start",
          boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
        }}>
          {activeNode && (() => {
            const inbound  = EDGES.filter(e => e.to   === activeNode.id)
            const outbound = EDGES.filter(e => e.from === activeNode.id)
            return (
              <>
                <div>
                  <div style={{ fontFamily: T.sans, fontSize: 11, fontWeight: 500, color: KIND_COLOR[activeNode.kind], marginBottom: 4 }}>
                    {LAYER_LABELS[activeNode.kind]}
                  </div>
                  <div style={{ fontFamily: T.serif, fontSize: 18, color: T.ink, fontWeight: 400, marginBottom: 4 }}>
                    {activeNode.label}
                  </div>
                  {activeNode.sublabel && (
                    <div style={{ fontFamily: T.sans, fontSize: 12, color: T.ink3, marginBottom: 16 }}>
                      {activeNode.sublabel}
                    </div>
                  )}
                  <div style={{ display: "flex", gap: 32 }}>
                    {inbound.length > 0 && (
                      <div>
                        <div style={{ fontFamily: T.sans, fontSize: 10, fontWeight: 500, color: T.ink3, marginBottom: 8 }}>
                          Receives from
                        </div>
                        {inbound.map((e, i) => {
                          const src = NODES.find(n => n.id === e.from)!
                          return (
                            <div key={i} style={{ fontFamily: T.sans, fontSize: 12, color: T.ink2, marginBottom: 4, display: "flex", gap: 8, alignItems: "baseline" }}>
                              <span style={{ color: EDGE_COLOR[e.kind], fontSize: 8 }}>●</span>
                              <span style={{ color: KIND_COLOR[src.kind] }}>{src.label}</span>
                              <span style={{ color: T.ink3 }}>via {e.label}</span>
                            </div>
                          )
                        })}
                      </div>
                    )}
                    {outbound.length > 0 && (
                      <div>
                        <div style={{ fontFamily: T.sans, fontSize: 10, fontWeight: 500, color: T.ink3, marginBottom: 8 }}>
                          Sends to
                        </div>
                        {outbound.map((e, i) => {
                          const dst = NODES.find(n => n.id === e.to)!
                          return (
                            <div key={i} style={{ fontFamily: T.sans, fontSize: 12, color: T.ink2, marginBottom: 4, display: "flex", gap: 8, alignItems: "baseline" }}>
                              <span style={{ color: EDGE_COLOR[e.kind], fontSize: 8 }}>●</span>
                              <span style={{ color: KIND_COLOR[dst.kind] }}>{dst.label}</span>
                              <span style={{ color: T.ink3 }}>via {e.label}</span>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setActiveNode(null)}
                  style={{ all: "unset", cursor: "pointer", fontFamily: T.sans, fontSize: 12, color: T.ink3, padding: "4px 8px" }}
                >
                  ×
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
                  <div style={{ fontFamily: T.sans, fontSize: 11, fontWeight: 500, color: EDGE_COLOR[activeEdge.kind], marginBottom: 8 }}>
                    {activeEdge.kind} · {activeEdge.label}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                    <span style={{ fontFamily: T.serif, fontSize: 16, color: KIND_COLOR[fromNode.kind] }}>{fromNode.label}</span>
                    <span style={{ fontFamily: T.sans, color: EDGE_COLOR[activeEdge.kind], fontSize: 18 }}>──→</span>
                    <span style={{ fontFamily: T.serif, fontSize: 16, color: KIND_COLOR[toNode.kind] }}>{toNode.label}</span>
                  </div>
                  <p style={{ fontFamily: T.sans, fontSize: 13, color: T.ink2, margin: 0, lineHeight: 1.65, maxWidth: 560 }}>
                    {activeEdge.description}
                  </p>
                </div>
                <button
                  onClick={() => setActiveEdge(null)}
                  style={{ all: "unset", cursor: "pointer", fontFamily: T.sans, fontSize: 12, color: T.ink3, padding: "4px 8px" }}
                >
                  ×
                </button>
              </>
            )
          })()}
        </div>
      )}

      {/* Action → result reference table */}
      <div style={{ marginTop: 56, paddingTop: 32, borderTop: `1px solid ${T.border}` }}>
        <p style={{ fontFamily: T.sans, fontSize: 11, fontWeight: 500, color: T.ink3, margin: "0 0 20px" }}>
          Action → visual result reference
        </p>

        {/* Header row */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 1,
          marginBottom: 1,
        }}>
          {["Darcy does this in Coach", "Triggers this process", "Jamie sees this in Client"].map(h => (
            <div key={h} style={{
              fontFamily: T.sans,
              fontSize: 11,
              fontWeight: 500,
              color: T.ink3,
              padding: "10px 14px",
              background: T.surfaceRaised,
              borderRadius: 0,
            }}>
              {h}
            </div>
          ))}
        </div>

        {/* Data rows */}
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {[
            ["Publishes a protocol change in Strategy doc", "Directive generated → pushed to dashboard", "New corrector card appears in 'In-flight correctors'"],
            ["Confirms DEXA fasting in Command Centre", "Milestone marked done on Medical Roadmap", "Upcoming test shows confirmed status"],
            ["Approves agent draft in Agent chat", "Draft promoted to strategy section", "Strategy section visible in Jamie's Command (read-only)"],
            ["Updates Q2 target in Strategy doc", "Target rail recalculates vs actuals", "Progress bar on Jamie's northstar section updates"],
            ["Closes a quarter (Q1 → Q2 transition)", "Report snapshot generated, archived", "Historical report link appears in 'Past quarters'"],
            ["Agent flags autonomic stress overnight", "Alert sent to Darcy + briefing prepared", "No direct client impact until Darcy acts on it"],
            ["Jamie submits daily check-in (RPE)", "RPE feeds IRT engine → AL score updates", "Darcy's Trends pivot refreshes with new day data"],
          ].map(([action, trigger, result], i) => {
            const colors = [T.ok, "#9B8FA9", T.accent]
            return (
              <div key={i} style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: 1,
              }}>
                {[action, trigger, result].map((cell, j) => (
                  <div key={j} style={{
                    padding: "12px 14px",
                    background: T.surface,
                    fontFamily: T.sans,
                    fontSize: 12,
                    color: colors[j],
                    lineHeight: 1.55,
                    borderRadius: 0,
                  }}>
                    {cell}
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      </div>

      {/* Integration status */}
      <div style={{ marginTop: 40, display: "flex", gap: 12, flexWrap: "wrap" }}>
        {[
          { label: "Data sync",   status: "live",    note: "Wearable + CGM auto-sync" },
          { label: "IRT engine",  status: "live",    note: "Scoring on every new data point" },
          { label: "AI Agent",    status: "proto",   note: "Pre-loaded responses, API pending" },
          { label: "Directives",  status: "live",    note: "Coach publishes → client sees" },
          { label: "Reports",     status: "proto",   note: "Q2 active, Q1 archived" },
          { label: "Push alerts", status: "planned", note: "Agent → Darcy notifications" },
        ].map(item => {
          const statusColor = item.status === "live" ? T.ok : item.status === "proto" ? T.warn : T.ink4
          return (
            <div key={item.label} style={{
              background: T.surface,
              borderRadius: 10,
              padding: "12px 16px",
              display: "flex",
              flexDirection: "column",
              gap: 4,
              minWidth: 140,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", flexShrink: 0, background: statusColor }} />
                <span style={{ fontFamily: T.sans, fontSize: 10, color: T.ink3 }}>
                  {item.status}
                </span>
              </div>
              <div style={{ fontFamily: T.sans, fontSize: 13, fontWeight: 500, color: T.ink }}>{item.label}</div>
              <div style={{ fontFamily: T.sans, fontSize: 11, color: T.ink3 }}>{item.note}</div>
            </div>
          )
        })}
      </div>

    </div>
  )
}
