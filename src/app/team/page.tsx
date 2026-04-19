"use client"

import { useState } from "react"
import { DATA } from "@/data/james"
import { useApp } from "@/components/RoleContext"
import { LifecycleChip } from "@/components/Primitives"
import ActivityFeed from "@/components/ActivityFeed"
import QuarterlyReview from "@/components/QuarterlyReview"

function Avatar({ initials, round }: { initials: string; round?: boolean }) {
  return (
    <div style={{
      width: 36,
      height: 36,
      borderRadius: round ? "50%" : 0,
      background: "var(--panel-2)",
      border: "1px solid var(--hair-strong)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "var(--mono)",
      fontSize: 11,
      color: "var(--ink-2)",
      flexShrink: 0,
    }}>
      {initials}
    </div>
  )
}

export default function TeamPage() {
  const { role } = useApp()
  const { team, user } = DATA
  const [inboxTab, setInboxTab] = useState<"pending" | "signed">("pending")

  const pendingInbox = role === "darcy" ? team.inbox : []
  const visibleSigned = team.signed.filter(s => s.visibleTo === "james" || role === "darcy")

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, padding: "24px 32px", maxWidth: 1100 }}>

      {/* Quarterly review — auto-surfaces at quarter close */}
      <QuarterlyReview />

      {/* Workflow explainer */}
      <div className="panel" style={{ padding: "18px 22px" }}>
        <div style={{ fontFamily: "var(--mono)", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--ink-3)", marginBottom: 14 }}>
          How this works
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
          {[
            { label: "Agent", sub: "Monitors signals 24/7. Drafts insights, flags anomalies, proposes protocol changes.", color: "var(--ink-3)" },
            { arrow: "→", arrowSub: "draft" },
            { label: "Darcy", sub: "Reviews every agent output. Countersigns, modifies, or discards before it reaches you.", color: "var(--ok)" },
            { arrow: "→", arrowSub: "signed" },
            { label: "Jamie", sub: "Receives only what Darcy has reviewed and signed. Agent drafts are never visible to you.", color: "var(--accent)" },
          ].map((step, i) => (
            "arrow" in step ? (
              <div key={i} style={{ textAlign: "center", padding: "0 16px", flexShrink: 0 }}>
                <div style={{ fontFamily: "var(--mono)", fontSize: 16, color: "var(--hair-strong)" }}>{step.arrow}</div>
                <div style={{ fontFamily: "var(--mono)", fontSize: 8, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 2 }}>{step.arrowSub}</div>
              </div>
            ) : (
              <div key={i} style={{ flex: 1, borderLeft: i === 0 ? "none" : undefined }}>
                <div style={{ fontFamily: "var(--mono)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: step.color, marginBottom: 4 }}>{step.label}</div>
                <div style={{ fontSize: 12, color: "var(--ink-2)", lineHeight: 1.5 }}>{step.sub}</div>
              </div>
            )
          ))}
        </div>
      </div>

      {/* Two column: coach card + calendar */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

        {/* Coach card */}
        <div className="panel" style={{ padding: "20px 22px" }}>
          <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 16 }}>
            <Avatar initials={team.coach.initials} round />
            <div>
              <div style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--ink)" }}>{team.coach.name}</div>
              <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 3 }}>{team.coach.role}</div>
            </div>
          </div>
          <p style={{ fontSize: 12.5, color: "var(--ink-2)", lineHeight: 1.6 }}>{team.coach.bio}</p>
        </div>

        {/* Upcoming */}
        <div className="panel">
          <div className="panel-head">
            <span>Upcoming</span>
          </div>
          {team.calendar.map((ev, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "44px 1fr auto", gap: 14, padding: "10px 16px", borderTop: i > 0 ? "1px solid var(--hair)" : undefined, alignItems: "center" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "var(--mono)", fontSize: 16, letterSpacing: "-0.02em", color: "var(--ink)", lineHeight: 1 }}>{ev.day}</div>
                <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{ev.dow}</div>
              </div>
              <div>
                <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink)", marginBottom: 2 }}>{ev.title}</div>
                <div style={{ fontSize: 11, color: "var(--ink-3)" }}>{ev.with} · {ev.when}</div>
              </div>
              <div style={{ fontFamily: "var(--mono)", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--ink-3)", border: "1px solid var(--hair)", padding: "2px 6px" }}>{ev.tag}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Agent standing brief */}
      <div className="panel" style={{ padding: "16px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
          <span style={{ fontFamily: "var(--mono)", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--ink-3)" }}>
            Agent standing brief
          </span>
          <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Issued by {team.agentBriefIssuedBy}
          </span>
        </div>
        <p style={{ fontSize: 13, color: "var(--ink-2)", lineHeight: 1.6, fontStyle: "italic", fontFamily: "var(--serif)" }}>
          {team.agentStandingBrief}
        </p>
      </div>

      {/* Inbox */}
      <div className="panel">
        <div className="panel-head">
          <span>Inbox</span>
          {role === "darcy" && (
            <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--warn)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              {pendingInbox.length} awaiting review
            </span>
          )}
        </div>
        <div className="inbox-tabs" style={{ padding: "0 20px" }}>
          <button data-on={inboxTab === "pending"} onClick={() => setInboxTab("pending")}>
            Pending
            {role === "darcy" && <span className="count">{pendingInbox.length}</span>}
          </button>
          <button data-on={inboxTab === "signed"} onClick={() => setInboxTab("signed")}>
            Signed <span className="count">{visibleSigned.length}</span>
          </button>
        </div>

        {inboxTab === "pending" && (
          role === "darcy" ? (
            pendingInbox.map(item => (
              <div key={item.id} className="inbox-row">
                <div className="ig">
                  <Avatar initials="AG" />
                </div>
                <div>
                  <div className="it">{item.title}</div>
                  <div className="ib">{item.body}</div>
                  <div className="ir">
                    {item.refs.map(r => <span key={r}>{r}</span>)}
                  </div>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-3)", marginTop: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    Drafted {item.drafted} · {item.visibility === "hidden-from-james" ? "Not visible to Jamie" : "Visible"}
                  </div>
                </div>
                <div className="inbox-actions">
                  <button className="primary">Countersign</button>
                  <button>Edit &amp; sign</button>
                  <button className="danger">Discard</button>
                </div>
              </div>
            ))
          ) : (
            <div style={{ padding: "32px 20px", textAlign: "center", fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Agent drafts pass through Darcy before reaching you.
            </div>
          )
        )}

        {inboxTab === "signed" && (
          visibleSigned.length > 0 ? (
            visibleSigned.map(item => (
              <div key={item.id} style={{ padding: "16px 20px", borderTop: "1px solid var(--hair)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
                  <span style={{ fontFamily: "var(--serif)", fontSize: 15, color: "var(--ink)" }}>{item.title}</span>
                  <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ok)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Signed {item.signedAt}</span>
                </div>
                <div style={{ fontSize: 12.5, color: "var(--ink-2)", lineHeight: 1.55 }}>{item.body}</div>
              </div>
            ))
          ) : (
            <div style={{ padding: "32px 20px", textAlign: "center", fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Nothing signed yet.
            </div>
          )
        )}
      </div>

      {/* Thread */}
      <div className="panel">
        <div className="panel-head">
          <span>Thread</span>
        </div>
        <div className="thread" style={{ padding: "0 20px" }}>
          {team.thread.map((msg, i) => (
            <div key={i} className="thread-item">
              <div>
                <Avatar initials={msg.who === "agent" ? "AG" : team.coach.initials} round={msg.who === "coach"} />
              </div>
              <div>
                <div className="who-line">
                  <span><strong>{msg.name}</strong></span>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <LifecycleChip lc={msg.chip} />
                    <span>{msg.when}</span>
                  </div>
                </div>
                <div className={`body${msg.who === "agent" ? " agent" : ""}`}>{msg.body}</div>
                {msg.refs.length > 0 && (
                  <div className="refs">
                    {msg.refs.map(r => <span key={r}>{r}</span>)}
                  </div>
                )}
                {msg.counter && (
                  <div className="counter">{msg.counter}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Activity feed */}
      <ActivityFeed />

    </div>
  )
}
