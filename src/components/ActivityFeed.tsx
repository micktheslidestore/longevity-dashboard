"use client"

import { useState } from "react"
import { DATA } from "@/data/james"
import { useApp } from "./RoleContext"

type FeedItem = typeof DATA.activityFeed[number]

const ACTOR_LABELS: Record<string, string> = { darcy: "Darcy", agent: "Agent", jamie: "Jamie", system: "System" }

function FeedRow({ item }: { item: FeedItem }) {
  return (
    <div className="feed-item">
      <div className={`feed-dot ${item.type}`} />
      <div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 6, flexWrap: "wrap" }}>
          <span className={`feed-actor ${item.actor}`}>{ACTOR_LABELS[item.actor]}</span>
          <span className="feed-title">{item.title}</span>
        </div>
        <div className="feed-body">{item.body}</div>
        <div className="feed-when">{item.when}</div>
      </div>
    </div>
  )
}

export default function ActivityFeed({ compact = false }: { compact?: boolean }) {
  const { role } = useApp()
  const [showAll, setShowAll] = useState(false)

  const items = DATA.activityFeed.filter(item =>
    item.visibility === "both" ||
    item.visibility === role ||
    (role === "darcy" && item.visibility === "darcy") ||
    (role === "james" && item.visibility === "jamie")
  )

  const visible = compact && !showAll ? items.slice(0, 6) : items

  return (
    <div className="panel">
      <div className="panel-head">
        <span>Activity</span>
        <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.08em", display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "var(--ok)", animation: "pulse 2s infinite" }} />
          Live
        </span>
      </div>
      <div className="feed">
        {visible.map(item => <FeedRow key={item.id} item={item} />)}
      </div>
      {compact && items.length > 6 && (
        <div style={{ padding: "10px 16px", borderTop: "1px solid var(--hair)" }}>
          <button
            onClick={() => setShowAll(s => !s)}
            style={{ fontFamily: "var(--mono)", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--ink-3)", background: "transparent", border: "none", cursor: "pointer" }}
          >
            {showAll ? "Show less" : `Show ${items.length - 6} more`}
          </button>
        </div>
      )}
    </div>
  )
}
