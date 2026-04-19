import { pathologyResults, riskProfile } from "@/data/james"
import { TrendingUp, TrendingDown, Minus, AlertTriangle } from "lucide-react"

type FlagType = "normal" | "high" | "low"

function flagColor(flag: FlagType) {
  if (flag === "high") return "var(--accent-red)"
  if (flag === "low") return "var(--accent-amber)"
  return "var(--accent-green)"
}

function flagLabel(flag: FlagType) {
  if (flag === "high") return "High"
  if (flag === "low") return "Low"
  return "Normal"
}

const markerGroups = [
  {
    group: "Lipids & Cardiovascular",
    keys: ["totalCholesterol", "ldl", "hdl", "triglycerides", "lpa"],
    labels: {
      totalCholesterol: "Total Cholesterol",
      ldl: "LDL",
      hdl: "HDL",
      triglycerides: "Triglycerides",
      lpa: "Lp(a)",
    },
    note: "Lp(a) is genetically elevated and does not respond to lifestyle — this is a fixed risk factor requiring pharmacological consideration.",
  },
  {
    group: "Inflammation",
    keys: ["hsCRP", "homocysteine"],
    labels: {
      hsCRP: "hsCRP",
      homocysteine: "Homocysteine",
    },
    note: "hsCRP spiked in the follow-up panel — consistent with the overtraining and systemic inflammatory burden evident in wearable data 3 weeks prior.",
  },
  {
    group: "Metabolic",
    keys: ["hba1c", "fastingGlucose", "fastingInsulin"],
    labels: {
      hba1c: "HbA1c",
      fastingGlucose: "Fasting Glucose",
      fastingInsulin: "Fasting Insulin",
    },
    note: null,
  },
  {
    group: "Hormonal",
    keys: ["testosteroneTotal", "testosteroneFree", "dheas", "cortisolAM"],
    labels: {
      testosteroneTotal: "Testosterone (Total)",
      testosteroneFree: "Testosterone (Free)",
      dheas: "DHEA-S",
      cortisolAM: "Cortisol (AM)",
    },
    note: "Testosterone and cortisol suppression in Jan 2026 confirms central endocrine suppression — consistent with overtraining syndrome. Wearable proxy markers (HRV, sleep architecture) indicated this pattern 18 days before blood confirmation.",
  },
  {
    group: "Micronutrients",
    keys: ["ferritin", "vitaminD", "b12"],
    labels: {
      ferritin: "Ferritin",
      vitaminD: "Vitamin D",
      b12: "B12",
    },
    note: "Ferritin dropped significantly — likely driven by underfueling during training block. Vitamin D remains insufficient; supplementation protocol should be reviewed.",
  },
]

const baseline = pathologyResults[0]
const followUp = pathologyResults[1]

type Marker = {
  value: number
  unit: string
  refRange: string
  flag: string
}

function getTrend(key: string): "up" | "down" | "stable" {
  const b = baseline.markers[key as keyof typeof baseline.markers] as Marker
  const f = followUp.markers[key as keyof typeof followUp.markers] as Marker
  if (!b || !f) return "stable"
  const diff = f.value - b.value
  const pct = Math.abs(diff) / b.value
  if (pct < 0.04) return "stable"
  return diff > 0 ? "up" : "down"
}

function TrendIcon({ direction, flag }: { direction: "up" | "down" | "stable"; flag: string }) {
  const upGood = ["hdl", "testosteroneTotal", "testosteroneFree", "dheas", "cortisolAM", "ferritin", "vitaminD", "b12"]
  if (direction === "stable") return <Minus size={13} style={{ color: "var(--text-muted)" }} />
  const isGood = direction === "up" ? upGood.includes(flag) : !upGood.includes(flag)
  const color = isGood ? "var(--accent-green)" : "var(--accent-red)"
  return direction === "up"
    ? <TrendingUp size={13} style={{ color }} />
    : <TrendingDown size={13} style={{ color }} />
}

export default function MedicalPage() {
  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>Medical</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            Pathology results · 2 panels · Nov 2025 – Jan 2026
          </p>
        </div>
        <button
          className="text-sm px-4 py-2 rounded-lg"
          style={{ backgroundColor: "var(--bg-elevated)", color: "var(--accent-teal)", border: "1px solid var(--bg-border)" }}
        >
          Export report
        </button>
      </div>

      {/* Risk profile banner */}
      <div
        className="rounded-xl p-4 mb-6 flex items-start gap-3"
        style={{ backgroundColor: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.15)" }}
      >
        <AlertTriangle size={16} style={{ color: "var(--accent-red)", marginTop: 2, flexShrink: 0 }} />
        <div>
          <p className="text-sm font-medium mb-1" style={{ color: "var(--text-primary)" }}>
            Elevated baseline risk — results interpreted in context
          </p>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            {riskProfile.conditions.join(" · ")} — all pathology values are weighted against this risk profile. Normal reference ranges may not apply.
          </p>
        </div>
      </div>

      {/* Panel headers */}
      <div
        className="rounded-t-xl px-5 py-3 grid gap-4"
        style={{ backgroundColor: "var(--bg-elevated)", borderBottom: "1px solid var(--bg-border)", gridTemplateColumns: "2fr 1fr 1fr 1fr 60px" }}
      >
        <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Marker</span>
        <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
          {baseline.label}
        </span>
        <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
          {followUp.label}
        </span>
        <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Ref range</span>
        <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Trend</span>
      </div>

      {markerGroups.map(({ group, keys, labels, note }) => (
        <div
          key={group}
          className="mb-6"
          style={{ border: "1px solid var(--bg-border)", borderRadius: "0 0 12px 12px" }}
        >
          {/* Group header */}
          <div
            className="px-5 py-2"
            style={{ backgroundColor: "var(--bg-elevated)", borderBottom: "1px solid var(--bg-border)" }}
          >
            <p className="text-xs font-medium tracking-widest uppercase" style={{ color: "var(--text-muted)" }}>
              {group}
            </p>
          </div>

          {/* Rows */}
          {keys.map((key, i) => {
            const bMarker = baseline.markers[key as keyof typeof baseline.markers] as Marker
            const fMarker = followUp.markers[key as keyof typeof followUp.markers] as Marker
            const trend = getTrend(key)
            const isLast = i === keys.length - 1

            return (
              <div
                key={key}
                className="px-5 py-3 grid gap-4 items-center"
                style={{
                  gridTemplateColumns: "2fr 1fr 1fr 1fr 60px",
                  borderBottom: isLast ? "none" : "1px solid var(--bg-border)",
                  backgroundColor: "var(--bg-surface)",
                }}
              >
                <span className="text-sm" style={{ color: "var(--text-primary)" }}>
                  {labels[key as keyof typeof labels]}
                </span>

                {/* Baseline value */}
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                    {bMarker.value}
                  </span>
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>{bMarker.unit}</span>
                  <span
                    className="text-xs px-1.5 py-0.5 rounded"
                    style={{
                      backgroundColor: `${flagColor(bMarker.flag as FlagType)}18`,
                      color: flagColor(bMarker.flag as FlagType),
                    }}
                  >
                    {flagLabel(bMarker.flag as FlagType)}
                  </span>
                </div>

                {/* Follow-up value */}
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                    {fMarker.value}
                  </span>
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>{fMarker.unit}</span>
                  <span
                    className="text-xs px-1.5 py-0.5 rounded"
                    style={{
                      backgroundColor: `${flagColor(fMarker.flag as FlagType)}18`,
                      color: flagColor(fMarker.flag as FlagType),
                    }}
                  >
                    {flagLabel(fMarker.flag as FlagType)}
                  </span>
                </div>

                {/* Ref range */}
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {bMarker.refRange}
                </span>

                {/* Trend */}
                <div className="flex items-center">
                  <TrendIcon direction={trend} flag={key} />
                </div>
              </div>
            )
          })}

          {/* Group note */}
          {note && (
            <div
              className="px-5 py-3 text-xs"
              style={{
                backgroundColor: "var(--bg-elevated)",
                color: "var(--text-secondary)",
                borderTop: "1px solid var(--bg-border)",
                borderRadius: "0 0 12px 12px",
              }}
            >
              {note}
            </div>
          )}
        </div>
      ))}

      {/* Wearable correlation callout */}
      <div
        className="rounded-xl p-5"
        style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--bg-border)" }}
      >
        <p className="text-xs font-medium tracking-widest uppercase mb-3" style={{ color: "var(--text-muted)" }}>
          Wearable correlation
        </p>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          The January 2026 panel confirmed overtraining, underfueling, and central endocrine suppression.
          All three conditions were{" "}
          <span style={{ color: "var(--accent-teal)" }}>
            visible in wearable proxy markers 18 days before blood confirmation
          </span>
          {" "}— including HRV decline, sleep architecture degradation, and elevated resting HR. This is precisely
          the scenario this system is designed to catch in real time.
        </p>
      </div>
    </div>
  )
}
