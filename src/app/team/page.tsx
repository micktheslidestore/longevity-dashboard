"use client"

import { useState } from "react"
import { DATA } from "@/data/james"
import { useApp } from "@/components/RoleContext"
import { LifecycleChip, T } from "@/components/Primitives"
import ActivityFeed from "@/components/ActivityFeed"
import QuarterlyReview from "@/components/QuarterlyReview"

function Avatar({ initials, round }: { initials: string; round?: boolean }) {
  return (
    <div style={{
      width: 36,
      height: 36,
      borderRadius: round ? "50%" : 8,
      background: T.surfaceRaised,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: T.sans,
      fontSize: 11,
      fontWeight: 600,
      color: T.ink3,
      flexShrink: 0,
    }}>
      {initials}
    </div>
  )
}

export default function TeamPage() {
  const { role } = useApp()
  const { team } = DATA
  const [inboxTab, setInboxTab] = useState<"pending" | "signed">("pending")

  const pendingInbox = role === "darcy" ? team.inbox : []
  const visibleSigned = team.signed.filter(s => s.visibleTo === "james" || role === "darcy")

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      gap: 48,
      padding: "48px 48px 80px",
      maxWidth: 960,
      margin: "0 auto",
    }}>

      {/* Quarterly review */}
      <QuarterlyReview />

      {/* Workflow explainer */}
      <div style={{
        background: T.surface,
        borderRadius: 12,
        padding: "28px 32px",
      }}>
        <p style={{
          fontFamily: T.sans,
          fontSize: 11,
          fontWeight: 500,
          color: T.ink3,
          marginBottom: 20,
          margin: "0 0 20px",
        }}>
          How this works
        </p>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 0 }}>
          {[
            { label: "Agent", sub: "Monitors signals 24/7. Drafts insights, flags anomalies, proposes protocol changes.", color: T.ink3 },
            { arrow: "→", arrowSub: "draft" },
            { label: "Darcy", sub: "Reviews every agent output. Countersigns, modifies, or discards before it reaches you.", color: T.ok },
            { arrow: "→", arrowSub: "signed" },
            { label: "Jamie", sub: "Receives only what Darcy has reviewed and signed. Agent drafts are never visible to you.", color: T.accent },
          ].map((step, i) => (
            "arrow" in step ? (
              <div key={i} style={{ textAlign: "center", padding: "0 20px", flexShrink: 0 }}>
                <div style={{ fontFamily: T.sans, fontSize: 18, color: T.border, lineHeight: 1 }}>{step.arrow}</div>
                <div style={{ fontFamily: T.sans, fontSize: 10, color: T.ink3, marginTop: 3 }}>{step.arrowSub}</div>
              </div>
            ) : (
              <div key={i} style={{ flex: 1 }}>
                <div style={{ fontFamily: T.sans, fontSize: 12, fontWeight: 600, color: step.color, marginBottom: 6 }}>{step.label}</div>
                <div style={{ fontFamily: T.sans, fontSize: 12, color: T.ink2, lineHeight: 1.6 }}>{step.sub}</div>
              </div>
            )
          ))}
        </div>
      </div>

      {/* Two column: coach card + calendar */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>

        {/* Coach card */}
        <div style={{ background: T.surface, borderRadius: 12, padding: "24px 28px" }}>
          <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 18 }}>
            <Avatar initials={team.coach.initials} round />
            <div>
              <div style={{ fontFamily: T.serif, fontSize: 16, fontWeight: 400, color: T.ink, lineHeight: 1.2 }}>
                {team.coach.name}
              </div>
              <div style={{ fontFamily: T.sans, fontSize: 11, color: T.ink3, marginTop: 3 }}>
                {team.coach.role}
              </div>
            </div>
          </div>
          <p style={{ fontFamily: T.sans, fontSize: 13, color: T.ink2, lineHeight: 1.65, margin: 0 }}>
            {team.coach.bio}
          </p>
        </div>

        {/* Upcoming */}
        <div style={{ background: T.surface, borderRadius: 12, overflow: "hidden" }}>
          <div style={{
            padding: "18px 24px 14px",
            borderBottom: `1px solid ${T.border}`,
          }}>
            <span style={{ fontFamily: T.sans, fontSize: 13, fontWeight: 500, color: T.ink }}>Upcoming</span>
          </div>
          {team.calendar.map((ev, i) => (
            <div key={i} style={{
              display: "grid",
              gridTemplateColumns: "44px 1fr auto",
              gap: 14,
              padding: "12px 24px",
              borderTop: i > 0 ? `1px solid ${T.border}` : undefined,
              alignItems: "center",
            }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontFamily: T.mono, fontSize: 17, letterSpacing: "-0.02em", color: T.ink, lineHeight: 1 }}>
                  {ev.day}
                </div>
                <div style={{ fontFamily: T.sans, fontSize: 10, color: T.ink3, marginTop: 2 }}>{ev.dow}</div>
              </div>
              <div>
                <div style={{ fontFamily: T.sans, fontSize: 12, fontWeight: 500, color: T.ink, marginBottom: 2 }}>{ev.title}</div>
                <div style={{ fontFamily: T.sans, fontSize: 11, color: T.ink3 }}>{ev.with} · {ev.when}</div>
              </div>
              <div style={{
                fontFamily: T.sans,
                fontSize: 10,
                color: T.ink3,
                background: T.surfaceRaised,
                padding: "2px 8px",
                borderRadius: 6,
              }}>
                {ev.tag}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Agent standing brief */}
      <div style={{ background: T.surface, borderRadius: 12, padding: "20px 28px" }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: 12,
        }}>
          <span style={{ fontFamily: T.sans, fontSize: 11, fontWeight: 500, color: T.ink3 }}>
            Agent standing brief
          </span>
          <span style={{ fontFamily: T.sans, fontSize: 11, color: T.ink3 }}>
            Issued by {team.agentBriefIssuedBy}
          </span>
        </div>
        <p style={{
          fontFamily: T.serif,
          fontSize: 15,
          color: T.ink2,
          lineHeight: 1.7,
          fontStyle: "italic",
          margin: 0,
        }}>
          {team.agentStandingBrief}
        </p>
      </div>

      {/* Inbox */}
      <div style={{ background: T.surface, borderRadius: 12, overflow: "hidden" }}>
        <div style={{
          padding: "18px 24px 14px",
          borderBottom: `1px solid ${T.border}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
          <span style={{ fontFamily: T.sans, fontSize: 13, fontWeight: 500, color: T.ink }}>Inbox</span>
          {role === "darcy" && (
            <span style={{ fontFamily: T.sans, fontSize: 11, color: T.warn }}>
              {pendingInbox.length} awaiting review
            </span>
          )}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 0, padding: "0 24px", borderBottom: `1px solid ${T.border}` }}>
          {[
            { key: "pending", label: "Pending", count: role === "darcy" ? pendingInbox.length : 0 },
            { key: "signed",  label: "Signed",  count: visibleSigned.length },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setInboxTab(tab.key as "pending" | "signed")}
              style={{
                all: "unset",
                cursor: "pointer",
                fontFamily: T.sans,
                fontSize: 12,
                fontWeight: inboxTab === tab.key ? 500 : 400,
                color: inboxTab === tab.key ? T.ink : T.ink3,
                padding: "12px 0",
                marginRight: 24,
                borderBottom: inboxTab === tab.key ? `2px solid ${T.accent}` : "2px solid transparent",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                transition: "color 0.15s",
              }}
            >
              {tab.label}
              {tab.count > 0 && (
                <span style={{
                  fontFamily: T.mono,
                  fontSize: 10,
                  color: inboxTab === tab.key ? T.accent : T.ink3,
                  background: inboxTab === tab.key ? `rgba(200,165,106,0.12)` : T.surfaceRaised,
                  padding: "1px 6px",
                  borderRadius: 10,
                }}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {inboxTab === "pending" && (
          role === "darcy" ? (
            pendingInbox.map(item => (
              <div key={item.id} style={{
                display: "grid",
                gridTemplateColumns: "auto 1fr auto",
                gap: 16,
                padding: "20px 24px",
                borderTop: `1px solid ${T.border}`,
                alignItems: "flex-start",
              }}>
                <Avatar initials="AG" />
                <div>
                  <div style={{ fontFamily: T.sans, fontSize: 13, fontWeight: 500, color: T.ink, marginBottom: 4 }}>
                    {item.title}
                  </div>
                  <div style={{ fontFamily: T.serif, fontSize: 13, color: T.ink2, lineHeight: 1.6, fontStyle: "italic", marginBottom: 8 }}>
                    {item.body}
                  </div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
                    {item.refs.map(r => (
                      <span key={r} style={{
                        fontFamily: T.sans,
                        fontSize: 10,
                        color: T.ink3,
                        background: T.surfaceRaised,
                        padding: "2px 8px",
                        borderRadius: 6,
                      }}>{r}</span>
                    ))}
                  </div>
                  <div style={{ fontFamily: T.sans, fontSize: 11, color: T.ink3 }}>
                    Drafted {item.drafted} · {item.visibility === "hidden-from-james" ? "Not visible to Jamie" : "Visible"}
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <button style={{
                    all: "unset",
                    cursor: "pointer",
                    fontFamily: T.sans,
                    fontSize: 12,
                    fontWeight: 500,
                    color: T.bg,
                    background: T.ok,
                    padding: "7px 14px",
                    borderRadius: 8,
                    textAlign: "center",
                  }}>
                    Countersign
                  </button>
                  <button style={{
                    all: "unset",
                    cursor: "pointer",
                    fontFamily: T.sans,
                    fontSize: 12,
                    color: T.ink2,
                    background: T.surfaceRaised,
                    padding: "7px 14px",
                    borderRadius: 8,
                    textAlign: "center",
                  }}>
                    Edit &amp; sign
                  </button>
                  <button style={{
                    all: "unset",
                    cursor: "pointer",
                    fontFamily: T.sans,
                    fontSize: 12,
                    color: "#C17A6A",
                    background: "rgba(193,122,106,0.08)",
                    padding: "7px 14px",
                    borderRadius: 8,
                    textAlign: "center",
                  }}>
                    Discard
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div style={{
              padding: "48px 24px",
              textAlign: "center",
              fontFamily: T.sans,
              fontSize: 12,
              color: T.ink3,
            }}>
              Agent drafts pass through Darcy before reaching you.
            </div>
          )
        )}

        {inboxTab === "signed" && (
          visibleSigned.length > 0 ? (
            visibleSigned.map(item => (
              <div key={item.id} style={{ padding: "20px 24px", borderTop: `1px solid ${T.border}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
                  <span style={{ fontFamily: T.serif, fontSize: 15, color: T.ink }}>{item.title}</span>
                  <span style={{ fontFamily: T.sans, fontSize: 11, color: T.ok }}>Signed {item.signedAt}</span>
                </div>
                <div style={{ fontFamily: T.sans, fontSize: 13, color: T.ink2, lineHeight: 1.6 }}>{item.body}</div>
              </div>
            ))
          ) : (
            <div style={{
              padding: "48px 24px",
              textAlign: "center",
              fontFamily: T.sans,
              fontSize: 12,
              color: T.ink3,
            }}>
              Nothing signed yet.
            </div>
          )
        )}
      </div>

      {/* Thread */}
      <div style={{ background: T.surface, borderRadius: 12, overflow: "hidden" }}>
        <div style={{
          padding: "18px 24px 14px",
          borderBottom: `1px solid ${T.border}`,
        }}>
          <span style={{ fontFamily: T.sans, fontSize: 13, fontWeight: 500, color: T.ink }}>Thread</span>
        </div>
        <div style={{ padding: "0 24px" }}>
          {team.thread.map((msg, i) => (
            <div key={i} style={{
              display: "grid",
              gridTemplateColumns: "auto 1fr",
              gap: 14,
              padding: "18px 0",
              borderTop: i > 0 ? `1px solid ${T.border}` : undefined,
              alignItems: "flex-start",
            }}>
              <Avatar initials={msg.who === "agent" ? "AG" : team.coach.initials} round={msg.who === "coach"} />
              <div>
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 8,
                  gap: 12,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontFamily: T.sans, fontSize: 12, fontWeight: 600, color: T.ink }}>
                      {msg.name}
                    </span>
                    <LifecycleChip status={msg.chip} size="sm" />
                  </div>
                  <span style={{ fontFamily: T.sans, fontSize: 11, color: T.ink3, flexShrink: 0 }}>{msg.when}</span>
                </div>
                <div style={{
                  fontFamily: msg.who === "agent" ? T.serif : T.sans,
                  fontStyle: msg.who === "agent" ? "italic" : "normal",
                  fontSize: 13,
                  color: T.ink2,
                  lineHeight: 1.65,
                }}>
                  {msg.body}
                </div>
                {msg.refs.length > 0 && (
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
                    {msg.refs.map(r => (
                      <span key={r} style={{
                        fontFamily: T.sans,
                        fontSize: 10,
                        color: T.ink3,
                        background: T.surfaceRaised,
                        padding: "2px 8px",
                        borderRadius: 6,
                      }}>{r}</span>
                    ))}
                  </div>
                )}
                {msg.counter && (
                  <div style={{
                    marginTop: 8,
                    fontFamily: T.sans,
                    fontSize: 12,
                    color: T.ok,
                    padding: "6px 12px",
                    background: T.okSubtle,
                    borderRadius: 8,
                    display: "inline-block",
                  }}>
                    {msg.counter}
                  </div>
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
