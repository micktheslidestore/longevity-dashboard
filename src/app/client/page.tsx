"use client"

import { useState, useMemo } from "react"
import { DATA } from "@/data/james"
import { computeSeries, DOMAINS as IRT_DOMAINS, type DomainKey } from "@/lib/irt"

// ─── Design tokens ───────────────────────────────────────────────────────────
const T = {
  bg: "#121214",
  surface: "#1a1a1e",
  surfaceRaised: "#222226",
  border: "rgba(255,252,245,0.06)",
  borderSubtle: "rgba(255,252,245,0.03)",
  ink: "#F2EFE8",
  ink2: "#B5B0A6",
  ink3: "#7D7972",
  ink4: "#4A4743",
  ok: "#7FA99B",
  okSubtle: "rgba(127,169,155,0.08)",
  okMuted: "rgba(127,169,155,0.15)",
  warn: "#C8A56A",
  warnSubtle: "rgba(200,165,106,0.06)",
  warnMuted: "rgba(200,165,106,0.12)",
  alert: "#C17A6A",
  accent: "#C8A56A",
  serif: "'Source Serif 4', Georgia, serif",
  sans: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
  mono: "'IBM Plex Mono', ui-monospace, Menlo, monospace",
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function domainColor(z: number) {
  return z > 1 ? T.alert : z > 0.3 ? T.warn : T.ok
}

const typeColor: Record<string, string> = {
  zone2: T.ok,
  test: T.warn,
  mobility: T.accent,
  recovery: "#9B8FA9",
  rest: T.ink4,
}

// ─── Lifecycle chip ───────────────────────────────────────────────────────────
type LifecycleStatus = "active" | "signed" | "draft" | "pending" | "effective" | "monitoring" | "partial"

const LC_CONFIGS: Record<LifecycleStatus, { label: string; color: string; def: string }> = {
  active:     { label: "Active",     color: T.warn,  def: "Live intervention — compliance tracking in progress" },
  signed:     { label: "Signed",     color: T.ok,    def: "Approved by Darcy — visible to you" },
  draft:      { label: "Draft",      color: T.ink3,  def: "Under review — not yet published" },
  pending:    { label: "Pending",    color: T.ink3,  def: "Awaiting enough data to evaluate" },
  effective:  { label: "Effective",  color: T.ok,    def: "Protocol is working — sustained improvement detected" },
  monitoring: { label: "Monitoring", color: T.warn,  def: "Data accumulating — trend not yet conclusive" },
  partial:    { label: "Partial",    color: T.ink3,  def: "Some improvement, below target threshold" },
}

function LifecycleChip({ status, showTooltip = true }: { status: LifecycleStatus; showTooltip?: boolean }) {
  const [hover, setHover] = useState(false)
  const c = LC_CONFIGS[status] ?? LC_CONFIGS.pending
  return (
    <span
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ position: "relative", display: "inline-flex", alignItems: "center", gap: 6 }}
    >
      <span style={{
        display: "inline-flex", alignItems: "center", gap: 5,
        fontSize: 11, fontFamily: T.sans, fontWeight: 500, letterSpacing: "0.02em",
        color: c.color, padding: "3px 10px",
        background: `${c.color}18`, borderRadius: 20,
      }}>
        <span style={{ width: 5, height: 5, borderRadius: "50%", background: c.color, flexShrink: 0 }} />
        {c.label}
      </span>
      {showTooltip && hover && (
        <span style={{
          position: "absolute", bottom: "calc(100% + 8px)", left: 0,
          background: T.surfaceRaised, border: `1px solid ${T.border}`,
          padding: "8px 12px", borderRadius: 8, fontSize: 12, color: T.ink2,
          lineHeight: 1.5, width: 220, zIndex: 10,
          boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
          pointerEvents: "none",
        }}>
          {c.def}
        </span>
      )}
    </span>
  )
}

// ─── Score ring ───────────────────────────────────────────────────────────────
function ScoreRing({ score, size = 140 }: { score: number; size?: number }) {
  const band = score >= 70
    ? { label: "Elevated", color: T.alert }
    : score >= 50
    ? { label: "Watch", color: T.warn }
    : { label: "Stable", color: T.ok }
  const r = (size - 12) / 2
  const c = Math.PI * 2 * r
  const pct = score / 100
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={T.border} strokeWidth={5} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={band.color} strokeWidth={5}
          strokeDasharray={`${pct * c} ${c}`} strokeLinecap="round"
          style={{ transition: "stroke-dasharray 1s ease" }} />
      </svg>
      <div style={{
        position: "absolute", inset: 0, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
      }}>
        <span style={{ fontFamily: T.mono, fontSize: 36, fontWeight: 300, color: band.color, lineHeight: 1, letterSpacing: "-0.03em" }}>
          {score}
        </span>
        <span style={{ fontFamily: T.sans, fontSize: 11, color: band.color, marginTop: 2, fontWeight: 500 }}>
          {band.label}
        </span>
      </div>
    </div>
  )
}

// ─── Domain rows shown under the score ring ───────────────────────────────────
const VISIBLE_DOMAINS: { key: DomainKey; label: string }[] = [
  { key: "autonomic",     label: "Autonomic" },
  { key: "sleep",         label: "Sleep" },
  { key: "metabolic",     label: "Metabolic" },
  { key: "inflammation",  label: "Inflammatory" },
]

// ─── Main component ───────────────────────────────────────────────────────────
export default function ClientDashboard() {
  const [correctorAck, setCorrectorAck] = useState(false)

  // Computed IRT scores from real time-series data
  const computed = useMemo(() => computeSeries(DATA.rawTimeSeries), [])
  const lastDay = computed[computed.length - 1]
  const alScore = lastDay.alScore
  const domainScores = lastDay.domainScores

  // Active corrector from data
  const activeCorrector = DATA.courseCorrector.find(c => c.status === "active")

  return (
    <div style={{
      minHeight: "100vh",
      background: T.bg,
      color: T.ink,
      fontFamily: T.sans,
      fontSize: 14,
      lineHeight: 1.65,
      WebkitFontSmoothing: "antialiased",
    }}>

      {/* ── Topbar ── */}
      <div style={{
        height: 52,
        borderBottom: `1px solid ${T.borderSubtle}`,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 48px",
        position: "sticky", top: 0, zIndex: 10,
        background: T.bg,
      }}>
        <span style={{ fontSize: 12, color: T.ink3 }}>
          {DATA.user.today}
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontSize: 11, color: T.ink4 }}>
            Garmin · Oura · Withings
          </span>
          <a
            href="/client/checkin"
            style={{
              fontFamily: T.sans, fontSize: 12, color: T.ink,
              background: T.surfaceRaised, border: "none",
              padding: "6px 14px", borderRadius: 8, cursor: "pointer",
              textDecoration: "none", display: "inline-block",
            }}
          >
            Daily check-in
          </a>
        </div>
      </div>

      {/* ── Main content ── */}
      <div style={{ padding: "48px 48px 80px", maxWidth: 960, margin: "0 auto" }}>

        {/* ═══════════════════════════════════════════════════════════════
            SECTION 1: Morning card
            The emotional anchor — one narrative, one number.
        ═══════════════════════════════════════════════════════════════ */}

        <div style={{
          display: "grid", gridTemplateColumns: "1fr auto",
          gap: 48, alignItems: "start", marginBottom: 56,
        }}>
          <div>
            <div style={{ fontSize: 12, color: T.ink3, marginBottom: 12 }}>
              {DATA.signal.narrative.eyebrow} · from {DATA.signal.narrative.by}
            </div>
            <h1 style={{
              fontFamily: T.serif, fontSize: 28, fontWeight: 300,
              lineHeight: 1.4, letterSpacing: "-0.02em",
              color: T.ink, margin: "0 0 16px", maxWidth: 520,
            }}>
              {DATA.signal.narrative.title}
            </h1>
            <p style={{
              fontSize: 14, color: T.ink2, lineHeight: 1.75,
              margin: "0 0 20px", maxWidth: 520,
            }}>
              {DATA.signal.narrative.rationale.split(". ").slice(0, 3).join(". ") + "."}
            </p>
            <div style={{
              padding: "14px 18px", borderRadius: 10,
              background: T.okSubtle,
              borderLeft: `3px solid ${T.ok}`,
              maxWidth: 520,
            }}>
              <div style={{ fontSize: 11, color: T.ok, fontWeight: 500, marginBottom: 4 }}>
                What to do today
              </div>
              <div style={{ fontSize: 14, color: T.ink, lineHeight: 1.6 }}>
                Convert today&apos;s scheduled lactate session into zone-2 or mobility. Protect sleep onset.
              </div>
            </div>
          </div>

          <div style={{
            display: "flex", flexDirection: "column",
            alignItems: "center", gap: 8, paddingTop: 8,
          }}>
            <div style={{ fontSize: 11, color: T.ink3, marginBottom: 4 }}>Allostatic load</div>
            <ScoreRing score={alScore} />
            <div style={{
              display: "flex", flexDirection: "column",
              gap: 6, marginTop: 8, width: "100%",
            }}>
              {VISIBLE_DOMAINS.map(({ key, label }) => {
                const z = domainScores[key] ?? 0
                const pct = Math.max(0, Math.min(100, Math.round(50 + (z / 3) * 50)))
                const color = domainColor(z)
                return (
                  <div key={key} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 11, color: T.ink3, width: 80, textAlign: "right" }}>{label}</span>
                    <div style={{ flex: 1, height: 3, background: T.border, borderRadius: 2, overflow: "hidden" }}>
                      <div style={{
                        height: "100%", width: `${pct}%`,
                        background: color, borderRadius: 2,
                        transition: "width 0.8s ease",
                      }} />
                    </div>
                    <span style={{ fontSize: 10, color, width: 36, fontFamily: T.mono }}>
                      {z > 0 ? "+" : ""}{z.toFixed(1)}σ
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            SECTION 2: Active corrector
            Lifecycle-aware — shows position in the flow.
        ═══════════════════════════════════════════════════════════════ */}

        {activeCorrector && !correctorAck && (
          <div style={{
            padding: "28px 32px", borderRadius: 12,
            background: T.warnSubtle,
            border: `1px solid ${T.warnMuted}`,
            marginBottom: 56,
          }}>
            <div style={{
              display: "flex", justifyContent: "space-between",
              alignItems: "flex-start", marginBottom: 12,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <LifecycleChip status="active" />
                <span style={{ fontSize: 12, color: T.ink3 }}>
                  Day 3 · issued 17 Apr
                </span>
              </div>
              <span style={{ fontSize: 11, color: T.ink4 }}>from Darcy</span>
            </div>

            <h3 style={{
              fontFamily: T.serif, fontSize: 20, fontWeight: 400,
              margin: "0 0 8px", color: T.ink,
            }}>
              Hold all intensity training
            </h3>
            <p style={{
              fontSize: 14, color: T.ink2, lineHeight: 1.7,
              margin: "0 0 16px", maxWidth: 560,
            }}>
              Zone-2 only (HR below 135 bpm) or full rest until HRV stabilises above 44 ms for
              2 consecutive nights. Three nights of elevated RHR (+4 bpm) and skin temp +0.4 °C.
            </p>

            {/* Lifecycle position indicator */}
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              fontSize: 11, color: T.ink3, marginBottom: 20,
              padding: "10px 14px", background: "rgba(0,0,0,0.15)", borderRadius: 8,
              flexWrap: "wrap",
            }}>
              <span style={{ color: T.ink4 }}>Draft</span>
              <span style={{ color: T.ink4 }}>→</span>
              <span style={{ color: T.warn, fontWeight: 500 }}>● Active</span>
              <span style={{ color: T.ink4 }}>→</span>
              <span style={{ color: T.ink4 }}>Acknowledged</span>
              <span style={{ color: T.ink4 }}>→</span>
              <span style={{ color: T.ink4 }}>Resolved</span>
              <span style={{ marginLeft: "auto", color: T.ink4, fontSize: 10 }}>
                Resolves when HRV &gt; 44 ms for 2 nights
              </span>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setCorrectorAck(true)}
                style={{
                  fontFamily: T.sans, fontSize: 13, fontWeight: 500,
                  background: T.ok, color: T.bg, border: "none",
                  padding: "10px 24px", borderRadius: 8, cursor: "pointer",
                  transition: "opacity 0.15s ease",
                }}
              >
                Acknowledge
              </button>
              <a
                href="/client/command"
                style={{
                  fontFamily: T.sans, fontSize: 13, textDecoration: "none",
                  background: "transparent", color: T.ink2,
                  border: `1px solid ${T.border}`, padding: "10px 20px",
                  borderRadius: 8, cursor: "pointer", display: "inline-block",
                }}
              >
                Ask Darcy about this
              </a>
            </div>
          </div>
        )}

        {correctorAck && (
          <div style={{
            padding: "16px 24px", borderRadius: 10,
            background: T.okSubtle, border: `1px solid ${T.okMuted}`,
            marginBottom: 56, display: "flex", alignItems: "center", gap: 12,
          }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: T.ok, flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: T.ok }}>
              Corrector acknowledged — Darcy has been notified. Compliance tracking active.
            </span>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            SECTION 3: North star
            Where you're heading — spacious and aspirational.
        ═══════════════════════════════════════════════════════════════ */}

        <div style={{
          padding: "32px 36px", borderRadius: 14,
          background: T.surface,
          marginBottom: 56,
        }}>
          <div style={{
            display: "flex", justifyContent: "space-between",
            alignItems: "baseline", marginBottom: 8,
          }}>
            <span style={{ fontSize: 11, color: T.ink3 }}>North-star · Q3 2026</span>
            <span style={{ fontSize: 11, color: T.ink3 }}>{DATA.vision.daysLeft} days remaining</span>
          </div>
          <p style={{
            fontFamily: T.serif, fontSize: 22, fontWeight: 300,
            lineHeight: 1.5, margin: "0 0 28px", color: T.ink,
            letterSpacing: "-0.01em", maxWidth: 480,
          }}>
            {DATA.vision.statement}
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px 32px" }}>
            {DATA.vision.tracks.map(t => (
              <div key={t.name}>
                <div style={{
                  display: "flex", justifyContent: "space-between",
                  alignItems: "baseline", marginBottom: 6,
                }}>
                  <span style={{ fontSize: 13, color: T.ink2 }}>{t.name}</span>
                  <span style={{ fontSize: 13, fontFamily: T.mono, color: T.ink }}>
                    {t.now}{" "}
                    <span style={{ fontSize: 11, color: T.ink3 }}>{t.unit}</span>
                  </span>
                </div>
                <div style={{
                  height: 4, background: T.border, borderRadius: 2,
                  overflow: "hidden", marginBottom: 6,
                }}>
                  <div style={{
                    height: "100%", width: `${t.progress * 100}%`,
                    background: t.progress > 0.4 ? T.ok : T.warn,
                    borderRadius: 2, transition: "width 0.8s ease",
                  }} />
                </div>
                <div style={{
                  display: "flex", justifyContent: "space-between",
                  fontSize: 11, color: T.ink4,
                }}>
                  <span>{t.dir === "down" ? "↓" : "↑"} Target: {t.target} {t.unit}</span>
                  <span>{Math.round(t.progress * 100)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            SECTION 4: This week
            Compact, scannable calendar strip. No borders between days.
        ═══════════════════════════════════════════════════════════════ */}

        <div style={{ marginBottom: 56 }}>
          <div style={{ fontSize: 12, color: T.ink3, marginBottom: 16 }}>
            This week · 20–26 Apr
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8 }}>
            {DATA.weekPlan.map(d => {
              const wType = d.workout?.type ?? "rest"
              const wLabel = d.workout?.label ?? "Rest"
              const wDuration = d.workout?.duration ? `${d.workout.duration} min` : null
              const dayNum = d.date.slice(8)
              const dow = d.dow.slice(0, 3)
              return (
                <div key={d.date} style={{
                  padding: "14px 12px", borderRadius: 10,
                  background: d.isToday ? T.surfaceRaised : T.surface,
                  border: d.isToday ? `1px solid ${T.accent}33` : "1px solid transparent",
                  cursor: "pointer", transition: "all 0.15s",
                }}>
                  <div style={{ fontSize: 10, color: T.ink4, marginBottom: 2 }}>{dow}</div>
                  <div style={{
                    fontFamily: T.mono, fontSize: 20, fontWeight: 300,
                    color: d.isToday ? T.accent : T.ink, lineHeight: 1,
                    marginBottom: 10, letterSpacing: "-0.02em",
                  }}>
                    {dayNum}
                  </div>
                  <div style={{
                    fontSize: 11, color: typeColor[wType] ?? T.ink3,
                    lineHeight: 1.3, fontWeight: 500,
                  }}>
                    {wLabel}
                  </div>
                  {wDuration && (
                    <div style={{ fontSize: 10, color: T.ink4, marginTop: 2 }}>{wDuration}</div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            SECTION 5: Directives from Darcy
            Signed instructions — clean cards, lifecycle chips.
        ═══════════════════════════════════════════════════════════════ */}

        <div style={{ marginBottom: 56 }}>
          <div style={{
            display: "flex", justifyContent: "space-between",
            alignItems: "baseline", marginBottom: 16,
          }}>
            <span style={{ fontSize: 12, color: T.ink3 }}>Directives from Darcy</span>
            <span style={{ fontSize: 11, color: T.ink4 }}>{DATA.directive.length} active</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {DATA.directive.map((d, i) => (
              <div key={i} style={{
                padding: "20px 24px", borderRadius: 12,
                background: T.surface,
              }}>
                <div style={{
                  display: "flex", justifyContent: "space-between",
                  alignItems: "center", marginBottom: 10,
                }}>
                  <LifecycleChip status={d.lifecycle as LifecycleStatus} />
                  <span style={{ fontSize: 11, color: T.ink4 }}>{d.meta}</span>
                </div>
                <p style={{ fontSize: 14, color: T.ink2, lineHeight: 1.7, margin: 0 }}>
                  {d.body}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            SECTION 6: Last night sleep
            Compact, subordinate — not fighting for attention.
        ═══════════════════════════════════════════════════════════════ */}

        <div>
          <div style={{ fontSize: 12, color: T.ink3, marginBottom: 16 }}>
            Last night · sleep summary
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
            {[
              { label: "Total",          value: DATA.lastNight.total,                    sub: null },
              { label: "Deep",           value: DATA.lastNight.deep,                     sub: "below target" },
              { label: "Efficiency",     value: `${DATA.lastNight.efficiency}%`,         sub: null },
              { label: "HRV overnight",  value: `${DATA.lastNight.hrvOvernight} ms`,     sub: "−11 vs baseline" },
            ].map(m => (
              <div key={m.label} style={{
                padding: "16px 18px", borderRadius: 10,
                background: T.surface,
              }}>
                <div style={{ fontSize: 11, color: T.ink3, marginBottom: 6 }}>{m.label}</div>
                <div style={{
                  fontFamily: T.mono, fontSize: 22, fontWeight: 300,
                  color: T.ink, letterSpacing: "-0.02em",
                }}>
                  {m.value}
                </div>
                {m.sub && (
                  <div style={{ fontSize: 11, color: T.warn, marginTop: 4 }}>{m.sub}</div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
