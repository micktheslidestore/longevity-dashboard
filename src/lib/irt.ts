/**
 * IRT-inspired Allostatic Load computation engine.
 *
 * Approach:
 * - Each biomarker treated as a "test item" with a Discrimination weight (α)
 *   derived from clinical evidence, not fitted to sparse data.
 * - 21-day rolling Z-score against personal baseline replaces population norms.
 * - Direction-adjusted so positive Z always means higher allostatic burden.
 * - Composite AL score = weighted latent factor across all markers, mapped 0-100.
 * - Lag cross-correlation shows how many days after an intervention each
 *   biomarker responds (0-7 day window).
 */

// ─── Weights ─────────────────────────────────────────────────────────────────

export interface MarkerMeta {
  discrimination: number          // α: how strongly this marker loads onto the AL factor
  difficulty: number              // Z threshold where marker crosses into "flagged" territory
  direction: "higher-worse" | "lower-worse"
  domain: DomainKey
  label: string
  unit: string
}

export const WEIGHTS = {
  hrv:           { discrimination: 0.88, difficulty: 1.5, direction: "lower-worse",  domain: "autonomic",      label: "HRV (rMSSD)",        unit: "ms" },
  rhr:           { discrimination: 0.78, difficulty: 1.5, direction: "higher-worse", domain: "cardiovascular", label: "Resting HR",         unit: "bpm" },
  sleepEff:      { discrimination: 0.80, difficulty: 1.5, direction: "lower-worse",  domain: "sleep",          label: "Sleep efficiency",   unit: "%" },
  deepSleep:     { discrimination: 0.75, difficulty: 1.4, direction: "lower-worse",  domain: "sleep",          label: "Deep sleep",         unit: "min" },
  cortisol:      { discrimination: 0.82, difficulty: 1.3, direction: "higher-worse", domain: "autonomic",      label: "Cortisol AM",        unit: "µg/dL" },
  skinTemp:      { discrimination: 0.72, difficulty: 1.0, direction: "higher-worse", domain: "autonomic",      label: "Skin temp Δ",        unit: "°C" },
  glucoseSD:     { discrimination: 0.70, difficulty: 1.3, direction: "higher-worse", domain: "metabolic",      label: "Glucose variability",unit: "mg/dL SD" },
  hsCRP:         { discrimination: 0.71, difficulty: 1.2, direction: "higher-worse", domain: "inflammation",   label: "hs-CRP",             unit: "mg/L" },
  fibrinogen:    { discrimination: 0.66, difficulty: 1.2, direction: "higher-worse", domain: "inflammation",   label: "Fibrinogen",         unit: "mg/dL" },
  fastingInsulin:{ discrimination: 0.68, difficulty: 1.2, direction: "higher-worse", domain: "metabolic",      label: "Fasting insulin",    unit: "µIU/mL" },
  vo2max:        { discrimination: 0.60, difficulty: 1.5, direction: "lower-worse",  domain: "cardiovascular", label: "VO₂max",             unit: "ml/kg/min" },
  bodyFat:       { discrimination: 0.45, difficulty: 1.5, direction: "higher-worse", domain: "body",           label: "Body fat",           unit: "%" },
} satisfies Record<string, MarkerMeta>

export type MetricKey = keyof typeof WEIGHTS
export type DomainKey = "cardiovascular" | "autonomic" | "sleep" | "metabolic" | "inflammation" | "body"

export const DOMAINS: Record<DomainKey, { label: string; metrics: MetricKey[] }> = {
  cardiovascular: { label: "Cardiovascular",    metrics: ["rhr", "hrv", "vo2max"] },
  autonomic:      { label: "Autonomic / Neuro", metrics: ["hrv", "cortisol", "skinTemp"] },
  sleep:          { label: "Sleep / Recovery",  metrics: ["sleepEff", "deepSleep"] },
  metabolic:      { label: "Metabolic",         metrics: ["glucoseSD", "fastingInsulin"] },
  inflammation:   { label: "Inflammation",      metrics: ["hsCRP", "fibrinogen"] },
  body:           { label: "Body composition",  metrics: ["bodyFat"] },
}

// ─── Types ───────────────────────────────────────────────────────────────────

export interface DailyRecord {
  date: string
  hrv: number
  rhr: number
  sleepEff: number
  deepSleep: number
  skinTemp: number
  glucoseSD: number
  cortisol: number
  hsCRP: number
  fibrinogen: number
  fastingInsulin: number
  vo2max: number
  bodyFat: number
}

export type ZScores = Record<MetricKey, number>

export interface ComputedDay {
  date: string
  raw: DailyRecord
  z: ZScores
  domainScores: Record<DomainKey, number>
  alScore: number           // 0-100
  alZ: number               // raw latent Z before mapping
}

export interface Contributor {
  key: MetricKey
  label: string
  unit: string
  z: number
  weight: number
  pct: number               // % of total positive burden
}

export interface LagResult {
  key: MetricKey
  label: string
  lags: number[]            // r at lag 0..7
  peakLag: number
  peakR: number
}

// ─── Rolling stats ───────────────────────────────────────────────────────────

function rolling(values: number[], window = 21) {
  return values.map((_, i) => {
    const slice = values.slice(Math.max(0, i - window + 1), i + 1)
    const mean = slice.reduce((a, b) => a + b, 0) / slice.length
    const variance = slice.reduce((a, b) => a + (b - mean) ** 2, 0) / slice.length
    return { mean, sd: Math.sqrt(variance) || 0.001 }
  })
}

// ─── Core computation ────────────────────────────────────────────────────────

export function computeSeries(series: DailyRecord[], window = 21): ComputedDay[] {
  const keys = Object.keys(WEIGHTS) as MetricKey[]
  const stats: Record<string, { mean: number; sd: number }[]> = {}
  keys.forEach(k => {
    stats[k] = rolling(series.map(r => r[k as keyof DailyRecord] as number), window)
  })

  return series.map((record, i) => {
    const z = {} as ZScores
    keys.forEach(k => {
      const raw = record[k as keyof DailyRecord] as number
      let zi = (raw - stats[k][i].mean) / stats[k][i].sd
      if (WEIGHTS[k].direction === "lower-worse") zi = -zi
      z[k] = Math.max(-3, Math.min(3, zi))
    })

    const domainScores = {} as Record<DomainKey, number>
    ;(Object.keys(DOMAINS) as DomainKey[]).forEach(dk => {
      const metrics = DOMAINS[dk].metrics
      let wSum = 0, wTotal = 0
      metrics.forEach(k => { wSum += WEIGHTS[k].discrimination * z[k]; wTotal += WEIGHTS[k].discrimination })
      domainScores[dk] = wTotal > 0 ? wSum / wTotal : 0
    })

    let wSum = 0, wTotal = 0
    keys.forEach(k => { wSum += WEIGHTS[k].discrimination * z[k]; wTotal += WEIGHTS[k].discrimination })
    const alZ = wTotal > 0 ? wSum / wTotal : 0
    const alScore = Math.max(0, Math.min(100, Math.round(50 + (alZ / 3) * 50)))

    return { date: record.date, raw: record, z, domainScores, alScore, alZ }
  })
}

// ─── Top contributors ────────────────────────────────────────────────────────

export function topContributors(z: ZScores, n = 3): Contributor[] {
  const keys = Object.keys(WEIGHTS) as MetricKey[]
  let totalBurden = 0
  const contribs = keys.map(k => {
    const burden = Math.max(0, WEIGHTS[k].discrimination * z[k])
    totalBurden += burden
    return { key: k, label: WEIGHTS[k].label, unit: WEIGHTS[k].unit, z: z[k], weight: WEIGHTS[k].discrimination, burden }
  })
  return contribs
    .filter(c => c.burden > 0)
    .sort((a, b) => b.burden - a.burden)
    .slice(0, n)
    .map(c => ({ ...c, pct: totalBurden > 0 ? Math.round((c.burden / totalBurden) * 100) : 0 }))
}

// ─── Lag cross-correlation ───────────────────────────────────────────────────

export function lagCorrelations(computed: ComputedDay[], eventIndices: number[], maxLag = 7): LagResult[] {
  const keys = Object.keys(WEIGHTS) as MetricKey[]
  const eventSignal = computed.map((_, i) => eventIndices.includes(i) ? 1 : 0)

  return keys.map(k => {
    const lags: number[] = []
    for (let lag = 0; lag <= maxLag; lag++) {
      const n = computed.length - lag
      let sXY = 0, sX = 0, sY = 0, sX2 = 0, sY2 = 0
      for (let i = 0; i < n; i++) {
        const x = eventSignal[i]
        const y = computed[i + lag].z[k]
        sXY += x * y; sX += x; sY += y; sX2 += x * x; sY2 += y * y
      }
      const num = n * sXY - sX * sY
      const den = Math.sqrt((n * sX2 - sX ** 2) * (n * sY2 - sY ** 2))
      lags.push(den === 0 ? 0 : parseFloat((num / den).toFixed(3)))
    }
    const peakLag = lags.reduce((b, v, i) => Math.abs(v) > Math.abs(lags[b]) ? i : b, 0)
    return { key: k, label: WEIGHTS[k].label, lags, peakLag, peakR: lags[peakLag] }
  })
}

// ─── What-if simulation ──────────────────────────────────────────────────────

export interface WhatIfResult {
  newAL: number
  deltaAL: number
  newZ: ZScores
  contributors: Contributor[]
}

export function simulate(currentZ: ZScores, targetKey: MetricKey, changePercent: number): WhatIfResult {
  // changePercent < 0 = improvement. Convert to Z-score shift using discrimination weight.
  const direction = WEIGHTS[targetKey].direction === "lower-worse" ? -1 : 1
  const zShift = -(changePercent / 100) * direction * 1.5  // 1.5 scaling for reasonable visual range
  const newZForKey = Math.max(-3, Math.min(3, currentZ[targetKey] + zShift))
  const newZ = { ...currentZ, [targetKey]: newZForKey }

  const keys = Object.keys(WEIGHTS) as MetricKey[]
  let wSum = 0, wTotal = 0
  keys.forEach(k => { wSum += WEIGHTS[k].discrimination * newZ[k as MetricKey]; wTotal += WEIGHTS[k].discrimination })
  const newAlZ = wTotal > 0 ? wSum / wTotal : 0
  const newAL = Math.max(0, Math.min(100, Math.round(50 + (newAlZ / 3) * 50)))

  const keys2 = Object.keys(WEIGHTS) as MetricKey[]
  let wSum2 = 0, wTotal2 = 0
  keys2.forEach(k => { wSum2 += WEIGHTS[k].discrimination * currentZ[k]; wTotal2 += WEIGHTS[k].discrimination })
  const curAlZ = wTotal2 > 0 ? wSum2 / wTotal2 : 0
  const curAL = Math.max(0, Math.min(100, Math.round(50 + (curAlZ / 3) * 50)))

  return { newAL, deltaAL: newAL - curAL, newZ, contributors: topContributors(newZ) }
}

// ─── HRV age estimate ────────────────────────────────────────────────────────

export function estimateHRVAge(hrv: number): number {
  // HRV declines ~1ms per year on average after age 30.
  // Norm for 54M is ~38-45ms. Reference: normative data from Nunan et al.
  const agingSlope = -0.9
  const referenceAge54 = 42
  const diff = hrv - referenceAge54
  return Math.round(54 - diff / Math.abs(agingSlope))
}

export function estimateMetabolicAge(fastingInsulin: number, hba1c: number, glucoseSD: number): number {
  // Simple linear composite. Optimal at insulin ~5, HbA1c ~4.8, glucoseSD ~10.
  const insulinAge = (fastingInsulin - 5) * 1.8
  const hba1cAge = (hba1c - 4.8) * 6
  const glucoseAge = (glucoseSD - 10) * 0.5
  return Math.round(54 + (insulinAge + hba1cAge + glucoseAge) / 3)
}
