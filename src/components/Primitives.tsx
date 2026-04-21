"use client"

import { useState, useMemo } from "react"

// ─── Design tokens (shared reference object) ─────────────────────────────────
// All values are CSS custom property references — light/dark switching is
// handled by [data-theme="light"] in globals.css + RoleContext setting the attr.
export const T = {
  bg:             "var(--bg)",
  surface:        "var(--surface)",
  surfaceRaised:  "var(--surface-raised)",
  border:         "var(--border)",
  borderSubtle:   "var(--border-subtle)",
  borderMed:      "var(--border-med)",
  ink:            "var(--ink)",
  ink2:           "var(--ink-2)",
  ink3:           "var(--ink-3)",
  ink4:           "var(--ink-4)",
  ok:             "var(--ok)",
  okSubtle:       "var(--ok-subtle)",
  okMuted:        "var(--ok-muted)",
  warn:           "var(--warn)",
  warnSubtle:     "var(--warn-subtle)",
  warnMuted:      "var(--warn-muted)",
  alert:          "var(--alert)",
  accent:         "var(--accent)",
  serif:          "var(--serif)",
  sans:           "var(--sans)",
  mono:           "var(--mono)",
}

// ─── Lifecycle chip ───────────────────────────────────────────────────────────
export type LifecycleStatus =
  | "active" | "signed" | "draft" | "pending"
  | "effective" | "monitoring" | "partial"
  | "in-review" | "flag" | "raised" | "triaged" | "resolved" | "superseded"

const LC_CONFIGS: Record<string, { label: string; color: string; bg: string; def: string }> = {
  active:     { label: "Active",     color: T.warn,  bg: T.warnSubtle, def: "Live intervention — compliance tracking in progress" },
  signed:     { label: "Signed",     color: T.ok,    bg: T.okSubtle,   def: "Approved by Darcy — visible to Jamie" },
  draft:      { label: "Draft",      color: T.ink3,  bg: "rgba(125,121,114,0.08)", def: "Agent draft — awaiting Darcy's review" },
  pending:    { label: "Pending",    color: T.ink3,  bg: "rgba(125,121,114,0.08)", def: "Awaiting enough data to evaluate" },
  effective:  { label: "Effective",  color: T.ok,    bg: T.okSubtle,   def: "Protocol is working — sustained improvement detected" },
  monitoring: { label: "Monitoring", color: T.warn,  bg: T.warnSubtle, def: "Data accumulating — trend not yet conclusive" },
  partial:    { label: "Partial",    color: T.ink3,  bg: "rgba(125,121,114,0.08)", def: "Some improvement, below target threshold" },
  "in-review":{ label: "In review",  color: T.warn,  bg: T.warnSubtle, def: "Darcy is editing — not yet published" },
  flag:       { label: "Flag",       color: T.alert, bg: "rgba(193,122,106,0.08)", def: "Threshold breach detected — awaiting triage" },
  raised:     { label: "Raised",     color: T.warn,  bg: T.warnSubtle, def: "Agent detected a threshold breach" },
  triaged:    { label: "Triaged",    color: T.ink2,  bg: "rgba(181,176,166,0.08)", def: "Darcy reviewed and chose an action" },
  resolved:   { label: "Resolved",   color: T.ok,    bg: T.okSubtle,   def: "Underlying metric returned to baseline" },
  superseded: { label: "Superseded", color: T.ink4,  bg: "rgba(74,71,67,0.08)",    def: "Replaced or manually closed by Darcy" },
}

/**
 * LifecycleChip — pill shape, dot indicator, hover tooltip.
 * Use for every status in the system. Sentence case. No uppercase.
 */
export function LifecycleChip({
  status,
  lc,
  showTooltip = true,
  size = "md",
}: {
  status?: LifecycleStatus | string
  /** @deprecated use status instead */
  lc?: string
  showTooltip?: boolean
  size?: "sm" | "md"
}) {
  const [hover, setHover] = useState(false)
  const resolvedStatus = status ?? lc ?? "pending"
  const c = LC_CONFIGS[resolvedStatus] ?? LC_CONFIGS.pending

  return (
    <span
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ position: "relative", display: "inline-flex", alignItems: "center" }}
    >
      <span style={{
        display: "inline-flex", alignItems: "center", gap: 5,
        fontSize: size === "sm" ? 10 : 11,
        fontFamily: T.sans, fontWeight: 500, letterSpacing: "0.02em",
        color: c.color, padding: size === "sm" ? "2px 8px" : "3px 10px",
        background: c.bg, borderRadius: 20,
      }}>
        <span style={{ width: 5, height: 5, borderRadius: "50%", background: c.color, flexShrink: 0 }} />
        {c.label}
      </span>

      {showTooltip && hover && (
        <span style={{
          position: "absolute", bottom: "calc(100% + 8px)", left: 0,
          background: T.surfaceRaised, border: `1px solid ${T.borderMed}`,
          padding: "8px 12px", borderRadius: 8,
          fontSize: 12, fontFamily: T.sans, color: T.ink2,
          lineHeight: 1.5, width: 220, zIndex: 50,
          boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
          pointerEvents: "none", whiteSpace: "normal",
        }}>
          {c.def}
        </span>
      )}
    </span>
  )
}

// ─── Score ring ───────────────────────────────────────────────────────────────
/**
 * ScoreRing — SVG progress ring for Allostatic Load score.
 * Band: ≥70 alert (elevated), ≥50 warn (watch), else ok (stable).
 */
export function ScoreRing({ score, size = 140 }: { score: number; size?: number }) {
  const band = score >= 70
    ? { label: "Elevated", color: T.alert }
    : score >= 50
    ? { label: "Watch",    color: T.warn }
    : { label: "Stable",   color: T.ok }
  const r   = (size - 12) / 2
  const circ = Math.PI * 2 * r
  const pct  = score / 100
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} style={{ fill: "none", stroke: T.border, strokeWidth: 5 }} />
        <circle cx={size/2} cy={size/2} r={r}
          strokeDasharray={`${pct * circ} ${circ}`} strokeLinecap="round"
          style={{ fill: "none", stroke: band.color, strokeWidth: 5, transition: "stroke-dasharray 1s ease" }} />
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

// ─── Spark line ───────────────────────────────────────────────────────────────
export function Spark({
  data,
  color = "var(--accent)",
  width = 72,
  height = 22,
}: {
  data: number[]
  color?: string
  width?: number
  height?: number
}) {
  const path = useMemo(() => {
    if (!data || data.length < 2) return ""
    const min = Math.min(...data)
    const max = Math.max(...data)
    const range = max - min || 1
    const pts = data.map((v, i) => {
      const x = (i / (data.length - 1)) * width
      const y = height - ((v - min) / range) * (height - 2) - 1
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    return "M" + pts.join(" L")
  }, [data, width, height])

  if (!path) return null
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <path d={path} fill="none" stroke={color} strokeWidth={1.2} />
    </svg>
  )
}

// ─── Domain colour helper ─────────────────────────────────────────────────────
export function domainColor(z: number): string {
  return z > 1 ? T.alert : z > 0.3 ? T.warn : T.ok
}

// ─── Workout type colour map ──────────────────────────────────────────────────
export const WORKOUT_COLORS: Record<string, string> = {
  zone2:    T.ok,
  test:     T.warn,
  mobility: T.accent,
  recovery: "#9B8FA9",
  rest:     T.ink4,
}
