import {
  today,
  yesterday,
  agentInsights,
  annotations,
  trainingBlocks,
  riskProfile,
  type DailyMetric,
} from "@/data/james"
import { TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle, Info, ChevronRight } from "lucide-react"

function delta(a: number, b: number) {
  return a - b
}

function TrendIcon({ val }: { val: number }) {
  if (val > 1) return <TrendingUp size={13} className="inline" style={{ color: "var(--accent-green)" }} />
  if (val < -1) return <TrendingDown size={13} className="inline" style={{ color: "var(--accent-red)" }} />
  return <Minus size={13} className="inline" style={{ color: "var(--text-muted)" }} />
}

function riskColor(level: string) {
  if (level === "high") return "var(--accent-red)"
  if (level === "moderate") return "var(--accent-amber)"
  return "var(--accent-green)"
}

function scoreColor(score: number) {
  if (score >= 75) return "var(--accent-green)"
  if (score >= 55) return "var(--accent-amber)"
  return "var(--accent-red)"
}

function ScoreRing({ score, size = 48 }: { score: number; size?: number }) {
  const r = (size - 6) / 2
  const circ = 2 * Math.PI * r
  const fill = (score / 100) * circ
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--bg-border)" strokeWidth={4} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={scoreColor(score)}
        strokeWidth={4}
        strokeDasharray={`${fill} ${circ}`}
        strokeLinecap="round"
      />
    </svg>
  )
}

const domains = [
  { key: "cardiovascularScore", label: "Cardiovascular", sub: "HR · BP · AFib" },
  { key: "sleepScore", label: "Sleep", sub: "Efficiency · Deep · REM" },
  { key: "metabolicScore", label: "Metabolic", sub: "Weight · Body comp" },
  { key: "neuroendocrineScore", label: "Neuroendocrine", sub: "HRV · Stress axis" },
  { key: "recoveryScore", label: "Recovery", sub: "Readiness · Load" },
  { key: "cognitiveLoadScore", label: "Cognitive Load", sub: "Stress · Mood proxy" },
] as const

function getTodaySignal() {
  const acr = today.acuteChronicRatio
  const hrv = today.hrv
  const sleep = today.sleepEfficiency
  const allostatic = today.allostaticScore

  if (allostatic >= 72 && hrv >= 58 && sleep >= 82) {
    return {
      headline: "Strong recovery. This is a day to build on.",
      detail: `HRV at ${hrv}ms — above your recent average. Sleep efficiency ${sleep}%. Allostatic score ${allostatic}/100. Training load is balanced.`,
      action: "Proceed with planned session. Monitor intensity. Fuel well post-training.",
    }
  }
  if (acr > 1.4 && hrv < 50) {
    return {
      headline: "Training load is outpacing recovery. Don't stack intensity today.",
      detail: `Acute:chronic ratio at ${acr} — above the 1.3 caution threshold. HRV ${hrv}ms is ${delta(hrv, yesterday.hrv) < 0 ? "down" : "up"} from yesterday. Sleep efficiency ${sleep}%.`,
      action: "Quality movement only — walk, mobility, low zone 2. Review nutrition intake. Early bed tonight.",
    }
  }
  if (hrv < 45) {
    return {
      headline: "Recovery is compromised. Rest is the performance today.",
      detail: `HRV at ${hrv}ms — well below your 62ms baseline. Sleep efficiency ${sleep}%. Readiness ${today.readinessScore}/100.`,
      action: "No structured training. Focus on sleep, nutrition, and stress reduction. Flag to Darcy if this persists.",
    }
  }
  return {
    headline: "Moderate readiness. Keep intensity in check.",
    detail: `HRV ${hrv}ms, sleep efficiency ${sleep}%, allostatic score ${allostatic}/100. ACR at ${acr}.`,
    action: "Light to moderate session is appropriate. Avoid pushing beyond zone 3.",
  }
}

function getCurrentBlockInfo() {
  const todayDate = today.date
  return trainingBlocks.find(b => b.startDate <= todayDate && b.endDate >= todayDate)
}

export default function TodayPage() {
  const signal = getTodaySignal()
  const block = getCurrentBlockInfo()
  const latestInsight = agentInsights[agentInsights.length - 1]
  const recentAnnotations = annotations.slice(-3)

  const blockWeek = block
    ? Math.ceil((new Date(today.date).getTime() - new Date(block.startDate).getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1
    : 1

  return (
    <div className="p-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-sm mb-1" style={{ color: "var(--text-muted)" }}>
            {new Date(today.date).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
          <h1 className="text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>
            Good morning, James
          </h1>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {riskProfile.conditions.map(c => (
            <span
              key={c}
              className="text-xs px-2 py-1 rounded"
              style={{ backgroundColor: "var(--bg-elevated)", color: "var(--text-muted)", border: "1px solid var(--bg-border)" }}
            >
              {c}
            </span>
          ))}
        </div>
      </div>

      {/* Today's Signal */}
      <div
        className="rounded-xl p-6 mb-6"
        style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--bg-border)" }}
      >
        <div className="flex items-start justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "var(--accent-teal)" }} />
              <span className="text-xs font-medium tracking-widest uppercase" style={{ color: "var(--accent-teal)" }}>
                Today&apos;s Signal
              </span>
            </div>
            <h2 className="text-xl font-medium mb-2" style={{ color: "var(--text-primary)" }}>
              {signal.headline}
            </h2>
            <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
              {signal.detail}
            </p>
            <div
              className="rounded-lg px-4 py-3 text-sm"
              style={{ backgroundColor: "var(--bg-elevated)", color: "var(--text-secondary)", borderLeft: "3px solid var(--accent-teal)" }}
            >
              {signal.action}
            </div>
          </div>

          <div className="flex flex-col items-center gap-2 shrink-0">
            <div className="relative">
              <ScoreRing score={today.allostaticScore} size={80} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-bold" style={{ color: scoreColor(today.allostaticScore) }}>
                  {today.allostaticScore}
                </span>
              </div>
            </div>
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>Allostatic Load</span>
            {block && (
              <span className="text-xs text-center" style={{ color: "var(--text-muted)" }}>
                {block.name}<br />Wk {blockWeek}/{block.weekTotal}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Domain scores */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {domains.map(({ key, label, sub }) => {
          const score = today[key as keyof DailyMetric] as number
          const yScore = yesterday[key as keyof DailyMetric] as number
          const d = delta(score, yScore)
          return (
            <div
              key={key}
              className="rounded-xl p-4 flex items-center gap-4"
              style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--bg-border)" }}
            >
              <div className="relative shrink-0">
                <ScoreRing score={score} size={48} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-semibold" style={{ color: scoreColor(score) }}>{score}</span>
                </div>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>{label}</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{sub}</p>
                <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
                  <TrendIcon val={d} /> {d > 0 ? "+" : ""}{d} from yesterday
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Delta strip */}
      <div
        className="rounded-xl p-5 mb-6"
        style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--bg-border)" }}
      >
        <p className="text-xs font-medium tracking-widest uppercase mb-4" style={{ color: "var(--text-muted)" }}>
          What changed since yesterday
        </p>
        <div className="grid grid-cols-4 gap-6">
          {[
            { label: "HRV", value: `${today.hrv}ms`, d: delta(today.hrv, yesterday.hrv), invert: false },
            { label: "Sleep Efficiency", value: `${today.sleepEfficiency}%`, d: delta(today.sleepEfficiency, yesterday.sleepEfficiency), invert: false },
            { label: "Resting HR", value: `${today.restingHR}bpm`, d: delta(today.restingHR, yesterday.restingHR), invert: true },
            { label: "Load Ratio (ACR)", value: `${today.acuteChronicRatio}`, d: parseFloat((today.acuteChronicRatio - yesterday.acuteChronicRatio).toFixed(2)), invert: true },
            { label: "Systolic BP", value: `${today.systolic}mmHg`, d: delta(today.systolic, yesterday.systolic), invert: true },
            { label: "Weight", value: `${today.weightKg}kg`, d: parseFloat((today.weightKg - yesterday.weightKg).toFixed(1)), invert: false },
            { label: "Deep Sleep", value: `${today.deepSleepMinutes}min`, d: delta(today.deepSleepMinutes, yesterday.deepSleepMinutes), invert: false },
            { label: "Readiness", value: `${today.readinessScore}/100`, d: delta(today.readinessScore, yesterday.readinessScore), invert: false },
          ].map(({ label, value, d, invert }) => {
            const positive = invert ? d < 0 : d > 0
            const negative = invert ? d > 0 : d < 0
            const color = d === 0 ? "var(--text-muted)" : positive ? "var(--accent-green)" : negative ? "var(--accent-red)" : "var(--text-muted)"
            return (
              <div key={label}>
                <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>{label}</p>
                <p className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>{value}</p>
                <p className="text-xs mt-0.5" style={{ color }}>
                  {d > 0 ? "+" : ""}{d} today
                </p>
              </div>
            )
          })}
        </div>
        {today.afibEvent && (
          <div
            className="mt-4 flex items-center gap-2 text-sm rounded-lg px-4 py-2"
            style={{ backgroundColor: "rgba(239,68,68,0.1)", color: "var(--accent-red)", border: "1px solid rgba(239,68,68,0.2)" }}
          >
            <AlertTriangle size={14} />
            AFib event detected overnight. Flag for Darcy.
          </div>
        )}
      </div>

      {/* Agent insight */}
      <div
        className="rounded-xl p-5 mb-6"
        style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--bg-border)" }}
      >
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-medium tracking-widest uppercase" style={{ color: "var(--text-muted)" }}>
            Agent Analysis
          </p>
          <span
            className="text-xs px-2 py-0.5 rounded-full"
            style={{ backgroundColor: "var(--bg-elevated)", color: riskColor(latestInsight.riskLevel) }}
          >
            {latestInsight.riskLevel} risk · {Math.round(latestInsight.confidence * 100)}% confidence
          </span>
        </div>
        <div className="flex items-start gap-3">
          {latestInsight.riskLevel === "low"
            ? <CheckCircle size={16} style={{ color: "var(--accent-green)", marginTop: 2 }} />
            : latestInsight.riskLevel === "moderate"
            ? <Info size={16} style={{ color: "var(--accent-amber)", marginTop: 2 }} />
            : <AlertTriangle size={16} style={{ color: "var(--accent-red)", marginTop: 2 }} />
          }
          <div className="flex-1">
            <p className="text-sm font-medium mb-1" style={{ color: "var(--text-primary)" }}>{latestInsight.headline}</p>
            <p className="text-sm mb-3" style={{ color: "var(--text-secondary)" }}>{latestInsight.body}</p>
            <p className="text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>Trajectory</p>
            <p className="text-sm mb-3" style={{ color: "var(--text-secondary)" }}>{latestInsight.trajectory}</p>
            <div
              className="rounded-lg px-4 py-3 text-sm"
              style={{ backgroundColor: "var(--bg-elevated)", color: "var(--text-secondary)", borderLeft: "3px solid var(--accent-teal)" }}
            >
              {latestInsight.action}
            </div>
          </div>
        </div>
      </div>

      {/* Recent annotations */}
      <div
        className="rounded-xl p-5"
        style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--bg-border)" }}
      >
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-medium tracking-widest uppercase" style={{ color: "var(--text-muted)" }}>
            Recent Events
          </p>
          <a href="/trends" className="text-xs flex items-center gap-1" style={{ color: "var(--accent-teal)" }}>
            View timeline <ChevronRight size={12} />
          </a>
        </div>
        <div className="flex flex-col gap-3">
          {recentAnnotations.map((a, i) => (
            <div key={i} className="flex items-start gap-3">
              <div
                className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                style={{
                  backgroundColor:
                    a.type === "medical" ? "var(--accent-red)" :
                    a.type === "training" ? "var(--accent-blue)" :
                    a.type === "coach" ? "var(--accent-teal)" :
                    a.type === "nutrition" ? "var(--accent-green)" :
                    "var(--accent-amber)",
                }}
              />
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{a.label}</span>
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {new Date(a.date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })} · {a.addedBy === "darcy" ? "Darcy" : "James"}
                  </span>
                </div>
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{a.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
