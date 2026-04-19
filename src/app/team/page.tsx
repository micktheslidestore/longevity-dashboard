import { agentInsights, annotations, riskProfile } from "@/data/james"
import { AlertTriangle, CheckCircle, Info, MessageSquare } from "lucide-react"

function riskColor(level: string) {
  if (level === "high") return "var(--accent-red)"
  if (level === "moderate") return "var(--accent-amber)"
  return "var(--accent-green)"
}

const ANNOTATION_COLORS: Record<string, string> = {
  medical: "var(--accent-red)",
  training: "var(--accent-blue)",
  coach: "var(--accent-teal)",
  nutrition: "var(--accent-green)",
  life: "var(--accent-amber)",
}

export default function TeamPage() {
  const darcyAnnotations = annotations.filter(a => a.addedBy === "darcy")
  const jamesAnnotations = annotations.filter(a => a.addedBy === "james")

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>Team</h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
          Agent analysis history · Coach annotations · Client events
        </p>
      </div>

      {/* Team members */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {[
          { name: "Darcy", role: "Longevity Coach", initials: "D", color: "var(--accent-teal)", annotations: darcyAnnotations.length },
          { name: "James", role: "Client", initials: "J", color: "var(--accent-blue)", annotations: jamesAnnotations.length },
        ].map(m => (
          <div
            key={m.name}
            className="rounded-xl p-5 flex items-center gap-4"
            style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--bg-border)" }}
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0"
              style={{ backgroundColor: m.color, color: "var(--bg-base)" }}
            >
              {m.initials}
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{m.name}</p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>{m.role}</p>
              <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>{m.annotations} annotations</p>
            </div>
          </div>
        ))}
      </div>

      {/* Risk profile */}
      <div
        className="rounded-xl p-5 mb-8"
        style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--bg-border)" }}
      >
        <p className="text-xs font-medium tracking-widest uppercase mb-4" style={{ color: "var(--text-muted)" }}>
          Risk Profile — {riskProfile.name}, {riskProfile.age}
        </p>
        <div className="flex flex-col gap-3">
          {[
            {
              condition: "APOE E4/E4",
              implication: "Highest genetic risk for Alzheimer's. Metabolic health, sleep quality, and inflammation are amplified risk vectors. Every inflammatory episode carries elevated cognitive consequence.",
              priority: "high",
            },
            {
              condition: "Elevated Lp(a)",
              implication: "Genetically elevated cardiovascular risk. Does not respond to lifestyle. Fixed risk factor — requires monitoring and likely pharmacological management. Last value: 148 nmol/L (ref < 75).",
              priority: "high",
            },
            {
              condition: "Paroxysmal AFib",
              implication: "Makes HRV interpretation more complex. AFib burden is itself a trackable signal — correlates with overtraining, alcohol, and poor sleep. Three events in the Jan peak-load period.",
              priority: "moderate",
            },
          ].map(r => (
            <div
              key={r.condition}
              className="rounded-lg p-4 flex items-start gap-3"
              style={{ backgroundColor: "var(--bg-elevated)", border: "1px solid var(--bg-border)" }}
            >
              <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: riskColor(r.priority) }} />
              <div>
                <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{r.condition}</p>
                <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>{r.implication}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Agent insight history */}
      <div
        className="rounded-xl p-5 mb-8"
        style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--bg-border)" }}
      >
        <p className="text-xs font-medium tracking-widest uppercase mb-4" style={{ color: "var(--text-muted)" }}>
          Agent Analysis History
        </p>
        <div className="flex flex-col gap-4">
          {[...agentInsights].reverse().map((insight, i) => (
            <div
              key={i}
              className="rounded-lg p-4"
              style={{ backgroundColor: "var(--bg-elevated)", border: "1px solid var(--bg-border)" }}
            >
              <div className="flex items-start justify-between gap-4 mb-2">
                <div className="flex items-start gap-2">
                  {insight.riskLevel === "low"
                    ? <CheckCircle size={15} style={{ color: "var(--accent-green)", marginTop: 1 }} />
                    : insight.riskLevel === "moderate"
                    ? <Info size={15} style={{ color: "var(--accent-amber)", marginTop: 1 }} />
                    : <AlertTriangle size={15} style={{ color: "var(--accent-red)", marginTop: 1 }} />
                  }
                  <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{insight.headline}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {new Date(insight.date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                  </p>
                  <span
                    className="text-xs"
                    style={{ color: riskColor(insight.riskLevel) }}
                  >
                    {insight.riskLevel} · {Math.round(insight.confidence * 100)}%
                  </span>
                </div>
              </div>
              <p className="text-xs ml-5 mb-2" style={{ color: "var(--text-secondary)" }}>{insight.body}</p>
              <div
                className="ml-5 rounded px-3 py-2 text-xs"
                style={{ backgroundColor: "var(--bg-surface)", color: "var(--text-muted)", borderLeft: "2px solid var(--accent-teal)" }}
              >
                {insight.action}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Full annotation log */}
      <div
        className="rounded-xl p-5"
        style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--bg-border)" }}
      >
        <p className="text-xs font-medium tracking-widest uppercase mb-4" style={{ color: "var(--text-muted)" }}>
          All Annotations
        </p>
        <div className="flex flex-col gap-3">
          {[...annotations].reverse().map((a, i) => (
            <div key={i} className="flex items-start gap-3">
              <div
                className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
                style={{ backgroundColor: ANNOTATION_COLORS[a.type] }}
              />
              <div className="flex-1 flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{a.label}</span>
                    <span
                      className="text-xs px-1.5 py-0.5 rounded capitalize"
                      style={{ backgroundColor: `${ANNOTATION_COLORS[a.type]}18`, color: ANNOTATION_COLORS[a.type] }}
                    >
                      {a.type}
                    </span>
                  </div>
                  <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{a.detail}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {new Date(a.date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                  </p>
                  <div className="flex items-center justify-end gap-1 mt-0.5">
                    <MessageSquare size={10} style={{ color: "var(--text-muted)" }} />
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                      {a.addedBy === "darcy" ? "Darcy" : "James"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
