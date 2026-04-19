// Fictional persona — James, 54, London-based founder
// APOE E4/E4 | elevated Lp(a) | paroxysmal AFib
// Devices: Garmin, Oura Ring, Withings Scale + BPM Core
// 90-day narrative arc: baseline → overtraining hole (days 29–63) → course correction → recovery

export const riskProfile = {
  name: "James",
  age: 54,
  conditions: ["APOE E4/E4", "Elevated Lp(a)", "Paroxysmal AFib"],
  devices: ["Garmin", "Oura Ring", "Withings Scale", "Withings BPM Core"],
  goals: [
    "Cognitive sharpness at 70",
    "Cardiovascular resilience",
    "Sustained metabolic health",
    "Manage AFib burden",
  ],
}

export type DailyMetric = {
  date: string
  // Oura
  hrv: number
  deepSleepMinutes: number
  remMinutes: number
  sleepEfficiency: number
  readinessScore: number
  respiratoryRate: number
  tempDeviation: number
  // Garmin
  acuteLoad: number
  chronicLoad: number
  acuteChronicRatio: number
  activeCalories: number
  steps: number
  vo2max: number
  // Withings Scale
  weightKg: number
  bodyFatPct: number
  muscleMassKg: number
  // Withings BPM
  systolic: number
  diastolic: number
  restingHR: number
  afibEvent: boolean
  // Calculated
  allostaticScore: number
  cardiovascularScore: number
  sleepScore: number
  metabolicScore: number
  neuroendocrineScore: number
  recoveryScore: number
  cognitiveLoadScore: number
  // Check-in (qualitative)
  checkin: {
    energy: number
    mood: number
    stress: number
    soreness: number
    appetite: number
    notes: string
  }
}

export type Annotation = {
  date: string
  type: "coach" | "training" | "life" | "medical" | "nutrition"
  label: string
  detail: string
  addedBy: "darcy" | "james"
}

export type TrainingBlock = {
  name: string
  startDate: string
  endDate: string
  type: "base" | "build" | "peak" | "deload"
  weekCurrent: number
  weekTotal: number
}

// Day 0 = 2025-11-19 (90 days back from 2026-02-16)
function dateFromDay(day: number): string {
  const start = new Date("2025-11-19")
  start.setDate(start.getDate() + day)
  return start.toISOString().split("T")[0]
}

function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val))
}

function noise(magnitude: number) {
  return (Math.random() - 0.5) * magnitude
}

// Seeded deterministic noise so data looks consistent on every render
const seeds: number[] = []
for (let i = 0; i < 2000; i++) {
  seeds.push(((Math.sin(i * 127.1 + 311.7) * 43758.5453) % 1 + 1) / 2)
}
let seedIdx = 0
function seeded(magnitude: number) {
  const v = (seeds[seedIdx % seeds.length] - 0.5) * magnitude
  seedIdx++
  return v
}

function generateDay(day: number): DailyMetric {
  const date = dateFromDay(day)

  // Phase modifiers
  const isBaseline = day <= 28
  const isBuildUp = day >= 29 && day <= 49
  const isHole = day >= 50 && day <= 63
  const isCorrecting = day >= 64 && day <= 72
  const isRecovering = day >= 73

  // HRV — baseline ~62, builds down to ~42 in the hole, recovers to ~55
  let hrvBase = 62
  if (isBuildUp) hrvBase = 62 - (day - 28) * 0.8
  if (isHole) hrvBase = 45 - (day - 49) * 0.6
  if (isCorrecting) hrvBase = 41 + (day - 63) * 0.8
  if (isRecovering) hrvBase = 47 + (day - 72) * 0.4
  const hrv = clamp(Math.round(hrvBase + seeded(6)), 28, 78)

  // Sleep efficiency
  let sleepEffBase = 84
  if (isBuildUp) sleepEffBase = 84 - (day - 28) * 0.4
  if (isHole) sleepEffBase = 72 - (day - 49) * 0.3
  if (isCorrecting) sleepEffBase = 73 + (day - 63) * 0.7
  if (isRecovering) sleepEffBase = 79 + (day - 72) * 0.2
  const sleepEfficiency = clamp(Math.round(sleepEffBase + seeded(5)), 58, 94)

  // Deep sleep
  let deepBase = 82
  if (isBuildUp) deepBase = 82 - (day - 28) * 0.8
  if (isHole) deepBase = 62 - (day - 49) * 0.7
  if (isCorrecting) deepBase = 58 + (day - 63) * 1.2
  if (isRecovering) deepBase = 69 + (day - 72) * 0.5
  const deepSleepMinutes = clamp(Math.round(deepBase + seeded(12)), 38, 105)

  // REM
  const remMinutes = clamp(Math.round(95 + seeded(20) + (isHole ? -15 : 0)), 55, 130)

  // Readiness
  const readinessScore = clamp(Math.round(hrv * 1.1 + sleepEfficiency * 0.2 - 40 + seeded(8)), 32, 96)

  // Respiratory rate
  const respiratoryRate = clamp(+(14.8 + seeded(0.8) + (isHole ? 0.6 : 0)).toFixed(1), 13.0, 17.5)

  // Temp deviation
  const tempDeviation = clamp(+(seeded(0.3) + (isHole ? 0.15 : 0)).toFixed(2), -0.5, 0.7)

  // Training load
  let acuteBase = 280
  if (isBuildUp) acuteBase = 280 + (day - 28) * 8
  if (isHole) acuteBase = 420 + (day - 49) * 4
  if (isCorrecting) acuteBase = 380 - (day - 63) * 18
  if (isRecovering) acuteBase = 240 - (day - 72) * 2
  const acuteLoad = clamp(Math.round(acuteBase + seeded(30)), 140, 520)

  let chronicBase = 270
  if (isBuildUp) chronicBase = 270 + (day - 28) * 4
  if (isHole) chronicBase = 350 + (day - 49) * 2
  if (isCorrecting) chronicBase = 370 - (day - 63) * 6
  if (isRecovering) chronicBase = 310 - (day - 72) * 1.5
  const chronicLoad = clamp(Math.round(chronicBase + seeded(15)), 180, 420)
  const acuteChronicRatio = clamp(+(acuteLoad / chronicLoad).toFixed(2), 0.7, 1.9)

  // Steps & calories
  const steps = clamp(Math.round(9800 + seeded(2500) + (isHole ? -1200 : 0)), 4500, 16000)
  const activeCalories = clamp(Math.round(520 + seeded(120) + (isBuildUp || isHole ? 80 : 0)), 280, 820)

  // VO2max — slowly declining during hole, recovering
  let vo2Base = 48.5
  if (isBuildUp) vo2Base = 49.0
  if (isHole) vo2Base = 47.5 - (day - 49) * 0.08
  if (isCorrecting) vo2Base = 47.2 + (day - 63) * 0.05
  if (isRecovering) vo2Base = 47.6 + (day - 72) * 0.04
  const vo2max = clamp(+(vo2Base + seeded(0.4)).toFixed(1), 44.0, 52.0)

  // Withings scale — weight drops during underfueling hole
  let weightBase = 82.4
  if (isBuildUp) weightBase = 82.2
  if (isHole) weightBase = 81.8 - (day - 49) * 0.04
  if (isCorrecting) weightBase = 81.3 + (day - 63) * 0.05
  if (isRecovering) weightBase = 81.7 + (day - 72) * 0.02
  const weightKg = clamp(+(weightBase + seeded(0.3)).toFixed(1), 79.5, 84.5)
  const bodyFatPct = clamp(+(18.2 + seeded(0.4) + (isHole ? 0.3 : 0)).toFixed(1), 15.5, 21.5)
  const muscleMassKg = clamp(+(weightKg * (1 - bodyFatPct / 100) * 0.82).toFixed(1), 52, 62)

  // BP — elevated during hole & buildUp
  let sysBase = 118
  if (isBuildUp) sysBase = 121
  if (isHole) sysBase = 126 + (day - 49) * 0.3
  if (isCorrecting) sysBase = 122 - (day - 63) * 0.5
  if (isRecovering) sysBase = 118
  const systolic = clamp(Math.round(sysBase + seeded(8)), 108, 142)
  const diastolic = clamp(Math.round(systolic * 0.64 + seeded(4)), 68, 88)
  const restingHR = clamp(Math.round(52 + seeded(5) + (isHole ? 5 : 0) + (isBuildUp ? 3 : 0)), 44, 72)

  // AFib — more likely during the hole and high load
  const afibRisk = isHole ? 0.12 : isBuildUp ? 0.05 : 0.02
  const afibEvent = seeds[(seedIdx + 7) % seeds.length] < afibRisk

  // Domain scores (0–100)
  const cardiovascularScore = clamp(Math.round(
    100 - (systolic - 110) * 1.2 - (restingHR - 48) * 0.8 - (afibEvent ? 12 : 0) + seeded(4)
  ), 38, 98)

  const sleepScore = clamp(Math.round(
    sleepEfficiency * 0.5 + (deepSleepMinutes / 90) * 30 + (hrv / 70) * 20 + seeded(5)
  ), 28, 98)

  const metabolicScore = clamp(Math.round(
    90 - (weightKg - 80) * 1.5 - (bodyFatPct - 17) * 2 + seeded(4)
  ), 42, 96)

  const neuroendocrineScore = clamp(Math.round(
    hrv * 0.6 + (isHole ? -18 : 0) + (isBuildUp ? -8 : 0) + (isRecovering ? 5 : 0) + seeded(6)
  ), 28, 92)

  const recoveryScore = clamp(Math.round(
    readinessScore * 0.6 + (hrv / 70) * 25 + (isHole ? -15 : 0) + seeded(5)
  ), 24, 96)

  const cognitiveLoadScore = clamp(Math.round(
    78 + seeded(8) + (isHole ? -14 : 0) + (isBuildUp ? -5 : 0) + (isRecovering ? 6 : 0)
  ), 32, 96)

  const allostaticScore = clamp(Math.round(
    (cardiovascularScore * 0.22 +
      sleepScore * 0.20 +
      metabolicScore * 0.16 +
      neuroendocrineScore * 0.18 +
      recoveryScore * 0.14 +
      cognitiveLoadScore * 0.10) + seeded(3)
  ), 28, 96)

  // Check-in
  const energyBase = isHole ? 2.2 : isBuildUp ? 3.2 : isRecovering ? 3.6 : 4.0
  const moodBase = isHole ? 2.4 : isBuildUp ? 3.4 : isRecovering ? 3.8 : 4.2
  const stressBase = isHole ? 4.2 : isBuildUp ? 3.4 : isRecovering ? 2.8 : 2.4
  const sorenessBase = isHole ? 4.4 : isBuildUp ? 3.6 : isRecovering ? 2.6 : 2.2
  const appetiteBase = isHole ? 2.8 : isBuildUp ? 3.2 : isRecovering ? 3.6 : 4.0

  const checkinNotes: Record<string, string> = {
    [dateFromDay(35)]: "Long run felt harder than expected. Legs heavy.",
    [dateFromDay(42)]: "Woke at 3am, couldn't get back to sleep.",
    [dateFromDay(51)]: "Really struggling today. No motivation to train.",
    [dateFromDay(55)]: "Skipped session. Feel hollowed out.",
    [dateFromDay(58)]: "Darcy flagged my numbers. Think he's right.",
    [dateFromDay(64)]: "Bloods back. Not good. Time to pull back.",
    [dateFromDay(70)]: "First decent sleep in weeks.",
    [dateFromDay(78)]: "Starting to feel more like myself.",
    [dateFromDay(85)]: "HRV climbing back. Cautiously optimistic.",
  }

  return {
    date,
    hrv,
    deepSleepMinutes,
    remMinutes,
    sleepEfficiency,
    readinessScore,
    respiratoryRate,
    tempDeviation,
    acuteLoad,
    chronicLoad,
    acuteChronicRatio,
    activeCalories,
    steps,
    vo2max,
    weightKg,
    bodyFatPct,
    muscleMassKg,
    systolic,
    diastolic,
    restingHR,
    afibEvent,
    allostaticScore,
    cardiovascularScore,
    sleepScore,
    metabolicScore,
    neuroendocrineScore,
    recoveryScore,
    cognitiveLoadScore,
    checkin: {
      energy: clamp(Math.round(energyBase + seeded(1)), 1, 5),
      mood: clamp(Math.round(moodBase + seeded(1)), 1, 5),
      stress: clamp(Math.round(stressBase + seeded(1)), 1, 5),
      soreness: clamp(Math.round(sorenessBase + seeded(1)), 1, 5),
      appetite: clamp(Math.round(appetiteBase + seeded(1)), 1, 5),
      notes: checkinNotes[date] ?? "",
    },
  }
}

export const dailyMetrics: DailyMetric[] = Array.from({ length: 90 }, (_, i) => generateDay(i))

export const pathologyResults = [
  {
    date: dateFromDay(0),
    label: "Baseline (Nov 2025)",
    markers: {
      totalCholesterol: { value: 5.4, unit: "mmol/L", refRange: "< 5.0", flag: "high" },
      ldl: { value: 3.2, unit: "mmol/L", refRange: "< 3.0", flag: "high" },
      hdl: { value: 1.6, unit: "mmol/L", refRange: "> 1.0", flag: "normal" },
      triglycerides: { value: 1.1, unit: "mmol/L", refRange: "< 1.7", flag: "normal" },
      lpa: { value: 142, unit: "nmol/L", refRange: "< 75", flag: "high" },
      hsCRP: { value: 1.2, unit: "mg/L", refRange: "< 2.0", flag: "normal" },
      homocysteine: { value: 11.2, unit: "µmol/L", refRange: "< 15", flag: "normal" },
      hba1c: { value: 35, unit: "mmol/mol", refRange: "< 39", flag: "normal" },
      fastingGlucose: { value: 5.1, unit: "mmol/L", refRange: "< 5.6", flag: "normal" },
      fastingInsulin: { value: 6.8, unit: "mIU/L", refRange: "< 10", flag: "normal" },
      testosteroneTotal: { value: 18.4, unit: "nmol/L", refRange: "10–35", flag: "normal" },
      testosteroneFree: { value: 0.38, unit: "nmol/L", refRange: "0.17–0.6", flag: "normal" },
      dheas: { value: 7.2, unit: "µmol/L", refRange: "2.2–15.2", flag: "normal" },
      cortisolAM: { value: 462, unit: "nmol/L", refRange: "140–700", flag: "normal" },
      ferritin: { value: 88, unit: "µg/L", refRange: "30–300", flag: "normal" },
      vitaminD: { value: 68, unit: "nmol/L", refRange: "> 75", flag: "low" },
      b12: { value: 312, unit: "pmol/L", refRange: "145–569", flag: "normal" },
    },
  },
  {
    date: dateFromDay(64),
    label: "Follow-up (Jan 2026)",
    markers: {
      totalCholesterol: { value: 5.6, unit: "mmol/L", refRange: "< 5.0", flag: "high" },
      ldl: { value: 3.5, unit: "mmol/L", refRange: "< 3.0", flag: "high" },
      hdl: { value: 1.4, unit: "mmol/L", refRange: "> 1.0", flag: "normal" },
      triglycerides: { value: 1.4, unit: "mmol/L", refRange: "< 1.7", flag: "normal" },
      lpa: { value: 148, unit: "nmol/L", refRange: "< 75", flag: "high" },
      hsCRP: { value: 3.8, unit: "mg/L", refRange: "< 2.0", flag: "high" },
      homocysteine: { value: 13.6, unit: "µmol/L", refRange: "< 15", flag: "normal" },
      hba1c: { value: 37, unit: "mmol/mol", refRange: "< 39", flag: "normal" },
      fastingGlucose: { value: 5.4, unit: "mmol/L", refRange: "< 5.6", flag: "normal" },
      fastingInsulin: { value: 9.2, unit: "mIU/L", refRange: "< 10", flag: "normal" },
      testosteroneTotal: { value: 11.8, unit: "nmol/L", refRange: "10–35", flag: "low" },
      testosteroneFree: { value: 0.21, unit: "nmol/L", refRange: "0.17–0.6", flag: "low" },
      dheas: { value: 5.1, unit: "µmol/L", refRange: "2.2–15.2", flag: "normal" },
      cortisolAM: { value: 298, unit: "nmol/L", refRange: "140–700", flag: "low" },
      ferritin: { value: 44, unit: "µg/L", refRange: "30–300", flag: "low" },
      vitaminD: { value: 52, unit: "nmol/L", refRange: "> 75", flag: "low" },
      b12: { value: 278, unit: "pmol/L", refRange: "145–569", flag: "normal" },
    },
  },
]

export const trainingBlocks: TrainingBlock[] = [
  { name: "Base Build", startDate: dateFromDay(0), endDate: dateFromDay(27), type: "base", weekCurrent: 1, weekTotal: 4 },
  { name: "Intensity Block", startDate: dateFromDay(28), endDate: dateFromDay(55), type: "build", weekCurrent: 1, weekTotal: 4 },
  { name: "Forced Deload", startDate: dateFromDay(56), endDate: dateFromDay(72), type: "deload", weekCurrent: 1, weekTotal: 2 },
  { name: "Return to Base", startDate: dateFromDay(73), endDate: dateFromDay(89), type: "base", weekCurrent: 1, weekTotal: 3 },
]

export const annotations: Annotation[] = [
  { date: dateFromDay(7), type: "coach", label: "Form check", detail: "Reviewed running gait. Slight left hip drop — cue corrected.", addedBy: "darcy" },
  { date: dateFromDay(14), type: "nutrition", label: "Protein target raised", detail: "Increased to 2.0g/kg/day to support build phase.", addedBy: "darcy" },
  { date: dateFromDay(21), type: "life", label: "Work sprint", detail: "Board prep week. Late nights, elevated stress expected.", addedBy: "james" },
  { date: dateFromDay(28), type: "training", label: "Intensity block starts", detail: "4-week build. Acute load target 380–420.", addedBy: "darcy" },
  { date: dateFromDay(33), type: "life", label: "Travel — Dubai 3 nights", detail: "Time zone +4. Expect HRV impact, disrupted sleep.", addedBy: "james" },
  { date: dateFromDay(42), type: "coach", label: "HRV trend flagged", detail: "11-day downward trend. Monitoring. Asked James to reduce evening alcohol.", addedBy: "darcy" },
  { date: dateFromDay(47), type: "life", label: "Alcohol — client dinner", detail: "3 glasses wine. Noted for context.", addedBy: "james" },
  { date: dateFromDay(52), type: "coach", label: "Load reduction advised", detail: "ACR at 1.6. Recommended cutting intensity sessions by 50%.", addedBy: "darcy" },
  { date: dateFromDay(56), type: "training", label: "Forced deload begins", detail: "James agreed to stop all structured training. Active recovery only.", addedBy: "darcy" },
  { date: dateFromDay(58), type: "medical", label: "Bloods ordered", detail: "Darcy requested full panel given wearable trends.", addedBy: "darcy" },
  { date: dateFromDay(64), type: "medical", label: "Pathology results returned", detail: "Testosterone suppressed, cortisol low, hsCRP elevated. Confirms overtraining + underfueling hypothesis.", addedBy: "darcy" },
  { date: dateFromDay(66), type: "nutrition", label: "Fueling protocol updated", detail: "Caloric target increased by 400kcal/day. Focus on carb timing around activity.", addedBy: "darcy" },
  { date: dateFromDay(70), type: "life", label: "Meditation started", detail: "20 min daily. James tracking impact on mood and stress scores.", addedBy: "james" },
  { date: dateFromDay(73), type: "training", label: "Return to base phase", detail: "Low intensity only. No HR zone 4+. Rebuild aerobic base.", addedBy: "darcy" },
  { date: dateFromDay(82), type: "coach", label: "Positive trajectory confirmed", detail: "HRV back above 50. Sleep efficiency holding at 80%+. Cautiously progressing volume.", addedBy: "darcy" },
]

export const agentInsights = [
  {
    date: dateFromDay(42),
    domain: "Recovery",
    headline: "HRV in sustained decline — early warning signal",
    body: "James's HRV has declined 18% over 11 days. Acute:chronic training load ratio is 1.48 — approaching the danger zone. Sleep efficiency has been below his 83% personal baseline for 8 of the last 9 nights. These three signals in combination preceded his last overtraining episode (October 2024).",
    trajectory: "If current load continues without recovery intervention, full overtraining syndrome is likely within 10–14 days.",
    action: "Reduce intensity sessions by 40% this week. Prioritise 8hr sleep window. Rehydrate and increase caloric intake on training days.",
    confidence: 0.81,
    riskLevel: "moderate",
  },
  {
    date: dateFromDay(52),
    domain: "Cardiovascular",
    headline: "AFib events increasing with load",
    body: "Three AFib events detected in the last 12 days, compared to zero in the prior 28. Each occurred within 6 hours of a high-intensity session. Resting HR is elevated (+7 bpm above baseline). Given James's known AFib history, this clustering warrants immediate attention.",
    trajectory: "Continued high training load increases risk of sustained AFib episode.",
    action: "Suspend zone 4+ training immediately. Consult cardiologist before resuming intensity. Monitor overnight for further events.",
    confidence: 0.88,
    riskLevel: "high",
  },
  {
    date: dateFromDay(58),
    domain: "Neuroendocrine",
    headline: "Signs consistent with central endocrine suppression",
    body: "Wearable proxy markers (HRV rhythm disruption, sustained elevated resting HR, poor sleep architecture, low readiness despite rest days) are consistent with HPA axis suppression. This pattern is visible 18 days before blood confirmation in comparable cases. Testosterone and cortisol suppression is the likely finding.",
    trajectory: "Blood panel will likely confirm overtraining + underfueling. Without intervention, recovery timeline extends to 6–8 weeks.",
    action: "Full pathology panel ordered. Enforce deload. Prioritise caloric surplus, protein intake, and sleep hygiene.",
    confidence: 0.76,
    riskLevel: "high",
  },
  {
    date: dateFromDay(66),
    domain: "Metabolic",
    headline: "Underfueling confirmed — recovery protocol initiated",
    body: "Weight has dropped 1.1kg over 6 weeks despite elevated training load — a clear underfueling signal. Combined with confirmed low ferritin (44 µg/L) and suppressed testosterone, energy availability has been chronically insufficient. hsCRP at 3.8 mg/L indicates active systemic inflammation.",
    trajectory: "With 400kcal surplus, adequate protein, and training cessation: CRP should normalise in 3–4 weeks. Testosterone recovery typically 6–12 weeks.",
    action: "Follow updated nutrition protocol. Iron-rich foods + vitamin D supplementation. No structured training for 14 days minimum.",
    confidence: 0.91,
    riskLevel: "moderate",
  },
  {
    date: dateFromDay(78),
    domain: "Recovery",
    headline: "Positive recovery trajectory — maintain course",
    body: "HRV has increased from nadir of 38ms to 51ms over 14 days. Sleep efficiency is holding above 80% for 6 consecutive nights. Readiness score averaging 68 vs 48 at lowest point. No AFib events in 18 days. Body weight stabilising.",
    trajectory: "At current recovery rate, expect return to baseline HRV (62ms) within 11–14 days. Return to base training is appropriate.",
    action: "Begin return-to-base phase as planned. Zone 2 only for 2 weeks. Retest bloods in 6 weeks to confirm hormonal recovery.",
    confidence: 0.84,
    riskLevel: "low",
  },
  {
    date: dateFromDay(89),
    domain: "Cardiovascular",
    headline: "APOE E4/E4 context: inflammation reduction is high-leverage",
    body: "With James's E4/E4 genotype, sustained hsCRP elevation carries amplified cognitive risk beyond standard cardiovascular implications. The recent CRP spike (3.8 mg/L) is now trending down but has not yet returned to baseline. Each inflammatory episode in E4/E4 carriers correlates with accelerated amyloid accumulation risk in long-term studies.",
    trajectory: "CRP is declining. If maintained below 1.5 mg/L long-term, this risk profile is manageable with lifestyle alone.",
    action: "Prioritise anti-inflammatory nutrition (omega-3, polyphenols). Recheck hsCRP at next blood panel. Consider adding curcumin protocol — discuss with Darcy.",
    confidence: 0.72,
    riskLevel: "low",
  },
]

// Helper: get today's data (last entry = "today")
export const today = dailyMetrics[dailyMetrics.length - 1]
export const yesterday = dailyMetrics[dailyMetrics.length - 2]

export function getDelta(metric: keyof DailyMetric): number {
  const t = today[metric]
  const y = yesterday[metric]
  if (typeof t === "number" && typeof y === "number") return t - y
  return 0
}

export function getCurrentBlock(): TrainingBlock | undefined {
  const todayDate = today.date
  return trainingBlocks.find(b => b.startDate <= todayDate && b.endDate >= todayDate)
}

export function getLatestInsight() {
  return agentInsights[agentInsights.length - 1]
}
