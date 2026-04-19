"use client"

import { DATA } from "@/data/james"
import { useApp } from "@/components/RoleContext"
import { Spark, LifecycleChip } from "@/components/Primitives"

export default function TodayPage() {
  const { role } = useApp()

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, padding: "24px 32px", maxWidth: 1200 }}>

      {/* North-star */}
      <div className="northstar">
        <div className="ns-head">
          <span className="ns-label">{DATA.vision.label}</span>
          <span className="ns-days">{DATA.vision.daysLeft} days left · {DATA.user.today}</span>
        </div>
        <p className="ns-statement">{DATA.vision.statement}</p>
        <div className="ns-score-row">
          <div>
            <div className="ns-score">
              {DATA.signal.index.score}<span className="sl">/100</span>
            </div>
            <div className="ns-band">{DATA.signal.index.band}</div>
          </div>
          <div className="ns-tracks">
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
      </div>

      {/* Morning narrative */}
      <div className="panel" style={{ padding: "20px 24px" }}>
        <div className="panel-head" style={{ padding: 0, marginBottom: 10, border: 0 }}>
          <span>{DATA.signal.narrative.eyebrow}</span>
          <span>{DATA.signal.narrative.stamp}</span>
        </div>
        <p style={{ fontFamily: "var(--serif)", fontSize: 18, fontWeight: 300, letterSpacing: "-0.015em", lineHeight: 1.4, margin: "10px 0 12px", color: "var(--ink)" }}>
          {DATA.signal.narrative.title}
        </p>
        <p style={{ fontSize: 13, color: "var(--ink-2)", lineHeight: 1.65 }}>
          {DATA.signal.narrative.rationale}
        </p>
        <div style={{ marginTop: 12, fontFamily: "var(--mono)", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--ok)" }}>
          {role === "darcy" ? DATA.signal.narrative.byCoach : DATA.signal.narrative.by}
        </div>
      </div>

      {/* Directives */}
      <div className="panel">
        <div className="panel-head">
          <span>Today&apos;s directive</span>
          {role === "darcy" && (
            <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--warn)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              {DATA.agentDrafts.length} draft{DATA.agentDrafts.length !== 1 ? "s" : ""} awaiting your review
            </span>
          )}
        </div>
        <div className="directive-list">
          {/* Darcy sees agent drafts at the top of his workspace */}
          {role === "darcy" && DATA.agentDrafts.map((d, i) => (
            <div key={`draft-${i}`} className="directive-row" style={{ background: "color-mix(in oklab, var(--warn) 4%, transparent)" }}>
              <div className="dg">
                <LifecycleChip lc={d.lifecycle} />
              </div>
              <div>
                <div className="d-head">
                  <span className="who">Agent</span>
                  <span>Draft · awaiting your countersignature</span>
                </div>
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
          {/* Signed directives visible to both */}
          {DATA.directive.map((d, i) => (
            <div key={i} className="directive-row">
              <div className="dg">
                <LifecycleChip lc={d.lifecycle} />
              </div>
              <div>
                <div className="d-head">
                  <span className="who">{d.who}</span>
                  <span>{d.role}</span>
                </div>
                <div className="d-body">{d.body}</div>
                <div className="d-meta">{d.meta}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Domain grid */}
      <div className="domain-grid">
        {DATA.domains.map(d => {
          const sparkColor =
            d.state === "flag" ? "var(--alert)" :
            d.state === "drift" || d.state === "watch" ? "var(--warn)" :
            "var(--ok)"
          const stateClass =
            d.state === "flag" ? "alt" :
            d.state === "drift" || d.state === "watch" ? "hi" : "lo"
          return (
            <div key={d.name} className="domain-cell">
              <div className="dh">
                <span className="dname">{d.name}</span>
                <span className={`dstate ${stateClass}`}>{d.stateLabel}</span>
              </div>
              <div className="dval">
                {d.value}
                <span style={{ fontSize: 11, color: "var(--ink-3)", marginLeft: 5, fontFamily: "var(--mono)", fontWeight: 400 }}>
                  {d.unit}
                </span>
              </div>
              <div className="ddelta">{d.delta}</div>
              {d.note && <div className="dnote">{d.note}</div>}
              <div className="spark">
                <Spark data={d.spark} color={sparkColor} />
              </div>
            </div>
          )
        })}
      </div>

      {/* Calendar + Coach push */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

        {/* Calendar strip */}
        <div className="panel calstrip">
          <div className="calstrip-head">
            <span style={{ fontFamily: "var(--mono)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--ink-2)" }}>
              {DATA.user.today}
            </span>
            <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Synced {DATA.calendar.syncedAt}
            </span>
          </div>
          {DATA.calendar.events.map((ev, i) => (
            <div key={i} className="ev" data-flag={ev.flag}>
              <div className="when">
                {ev.t}
                <span className="end">{ev.end}</span>
              </div>
              <div>
                <div className="lbl">{ev.lbl}</div>
                <div className="src">{ev.src}</div>
              </div>
              <div className="kind">{ev.kind}</div>
            </div>
          ))}
        </div>

        {/* Coach push */}
        <div className="panel">
          <div className="panel-head">
            <span>Coach &amp; protocol</span>
          </div>
          {DATA.coachPush.map((p, i) => (
            <div key={i} className="push-row">
              <div className="pg">
                <LifecycleChip lc={p.icon} />
              </div>
              <div>
                <div className="pt">{p.title}</div>
                <div className="pb">{p.body}</div>
                <div className="pm">{p.by}</div>
              </div>
              <div>
                <button style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.08em", textTransform: "uppercase", border: "1px solid var(--hair-strong)", padding: "5px 10px", color: "var(--ink-2)", background: "transparent" }}>
                  {p.action}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Course corrector */}
      <div className="panel">
        <div className="panel-head">
          <span>Course corrector</span>
          <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Recommendation → Action → Outcome
          </span>
        </div>
        {DATA.courseCorrector.map((c, i) => (
          <div key={i} className="corrector-row">
            <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: 20, alignItems: "start" }}>
              <div>
                <div className="cr-date">{c.date}</div>
                <div style={{ marginTop: 5 }}>
                  <span className={`lc-chip lc-${c.status === "resolved" ? "signed" : c.status === "active" ? "flag" : "draft"}`}>
                    {c.status}
                  </span>
                </div>
                {c.impact.after !== null ? (
                  <div style={{ marginTop: 10, fontFamily: "var(--mono)", fontSize: 11, lineHeight: 1.4 }}>
                    <div style={{ color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.08em", fontSize: 8, marginBottom: 2 }}>{c.impact.metric}</div>
                    <div style={{ color: "var(--ok)" }}>
                      {c.impact.before} → {c.impact.after}
                      <span style={{ color: "var(--ink-3)", marginLeft: 3 }}>{c.impact.unit}</span>
                    </div>
                    {c.impact.days && (
                      <div style={{ color: "var(--ink-3)", fontSize: 9, marginTop: 2 }}>in {c.impact.days}d</div>
                    )}
                  </div>
                ) : (
                  <div style={{ marginTop: 10, fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    {c.impact.metric} · monitoring
                  </div>
                )}
              </div>
              <div>
                <div className="cr-title">{c.recommendation}</div>
                <div className="cr-action">{c.action}</div>
                <div className={`cr-outcome${c.status !== "resolved" ? " pending" : ""}`}>
                  {c.outcome}
                </div>
                <div style={{ marginTop: 8, fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  {c.by}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  )
}
