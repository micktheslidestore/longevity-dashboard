// Jamie Garis · 54M · APOE ε4/ε4 · Lp(a) elevated · Paroxysmal AFib
// Coach: Darcy O'Sullivan
// Devices: Garmin Fenix 8 · Oura Ring Gen 4 · Withings Scale · Withings BPM Core

function seeded(seed: number) {
  let s = seed
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

function series(n: number, base: number, drift: number, noise: number, seedOffset = 0) {
  const r = seeded(42 + seedOffset)
  const out: number[] = []
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1)
    out.push(base + drift * t + (r() - 0.5) * noise)
  }
  return out
}

export const DATA = {
  user: {
    first: "Jamie",
    last: "Garis",
    age: 54,
    sex: "M",
    today: "Sun 19 Apr 2026",
    timeNow: "06:42",
    reportId: "AL-2026-0419-JLG",
    risk: "APOE ε4/ε4 · Lp(a) elevated · paroxysmal AFib",
  },

  signal: {
    narrative: {
      eyebrow: "Morning briefing",
      title: "You are carrying three nights of incomplete recovery.",
      rationale:
        "Resting HR has been +4 bpm for three consecutive nights, HRV sits 11 ms below your 30-day mean, and skin temperature has crept +0.4 °C. The signature resembles the early phase of your February setback. Metabolic and inflammatory markers remain stable. Convert today's scheduled lactate session into zone-2 or mobility. Protect sleep onset. Reassess Saturday morning. No dietary changes — continue omega-3, berberine, and the rotating sleep-aid protocol.",
      by: "Darcy O'Sullivan",
      byCoach: "Darcy O'Sullivan · agent-assisted",
      stamp: "06:14 · 19 Apr",
    },
    index: {
      score: 64,
      band: "Elevated — course correction required",
      breakdown: [
        { label: "Cardiovascular", v: 58, dir: "hi" },
        { label: "Metabolic", v: 42, dir: "lo" },
        { label: "Sleep / Recovery", v: 71, dir: "hi" },
        { label: "Autonomic", v: 78, dir: "hi" },
        { label: "Inflammation", v: 49, dir: "lo" },
        { label: "Body comp.", v: 36, dir: "lo" },
      ],
    },
  },

  domains: [
    { name: "Cardiovascular", state: "drift", stateLabel: "Drift", dir: "hi", value: 52, unit: "bpm RHR", delta: "+4 vs 30d · +2 yesterday", note: "Third consecutive elevated night", spark: series(30, 48, 4, 2.2, 1) },
    { name: "Metabolic", state: "stable", stateLabel: "Stable", dir: "lo", value: 94, unit: "mg/dL fasting", delta: "−1 vs 30d · CGM SD 14.2", note: null, spark: series(30, 96, -2, 3, 2) },
    { name: "Sleep / Recovery", state: "watch", stateLabel: "Watch", dir: "hi", value: 6.2, unit: "h total", delta: "Deep 54 min · REM 72 min", note: "Onset latency 38 min", spark: series(30, 7.1, -0.8, 0.6, 3) },
    { name: "Autonomic", state: "flag", stateLabel: "Flag", dir: "alt", value: 41, unit: "ms HRV", delta: "−11 vs 30d · −7 yesterday", note: "Pattern echoes Feb 06–11 setback", spark: series(30, 54, -12, 4, 4) },
    { name: "Inflammation", state: "stable", stateLabel: "Stable", dir: "lo", value: 0.7, unit: "mg/L hs-CRP", delta: "Last draw 02 Apr · within range", note: null, spark: series(30, 0.8, -0.1, 0.12, 5) },
    { name: "Body composition", state: "stable", stateLabel: "Stable", dir: "lo", value: 14.8, unit: "% body fat", delta: "−0.3 vs 30d · lean +0.4 kg", note: null, spark: series(30, 15.2, -0.5, 0.3, 6) },
  ],

  vision: {
    label: "North-star · Q3 2026",
    statement: "Lower ApoB to ≤ 70 mg/dL while holding HRV above 48 ms.",
    daysLeft: 68,
    tracks: [
      { name: "ApoB", now: 84, target: 70, unit: "mg/dL", dir: "down", progress: 0.48 },
      { name: "HRV floor", now: 41, target: 48, unit: "ms", dir: "up", progress: 0.22 },
      { name: "VO₂max", now: 47.8, target: 50, unit: "ml/kg/min", dir: "up", progress: 0.36 },
      { name: "Visceral fat", now: 6.1, target: 5.0, unit: "%", dir: "down", progress: 0.55 },
    ],
  },

  calendar: {
    connected: "jamie.garis@anchoria.vc",
    syncedAt: "06:41",
    events: [
      { t: "07:00", end: "07:45", lbl: "Zone-2 · Richmond Park", kind: "health", src: "Allostatic protocol" },
      { t: "08:30", end: "09:00", lbl: "Prep — board deck walkthrough", kind: "work", src: "Google Calendar" },
      { t: "09:00", end: "11:00", lbl: "Anchoria board call", kind: "work", src: "Google Calendar", flag: "high-stress" },
      { t: "12:30", end: "13:15", lbl: "Lunch — Emily Park", kind: "work", src: "Google Calendar" },
      { t: "15:00", end: "15:15", lbl: "Coaching call · Darcy", kind: "health", src: "Allostatic" },
      { t: "17:30", end: "18:30", lbl: "Partners offsite travel prep", kind: "work", src: "Google Calendar" },
      { t: "21:30", end: "22:00", lbl: "Wind-down · sauna", kind: "health", src: "Allostatic protocol" },
    ],
    // Calendar grid events keyed by YYYY-MM-DD
    grid: {
      "2026-04-14": [{ lbl: "Zone-2 run", kind: "health" }, { lbl: "Coaching call", kind: "health" }],
      "2026-04-15": [{ lbl: "Board prep", kind: "work" }],
      "2026-04-16": [{ lbl: "Quarterly review", kind: "work" }, { lbl: "Deep tissue massage", kind: "health" }],
      "2026-04-17": [{ lbl: "NYC flight", kind: "work", flag: "high-stress" }],
      "2026-04-18": [{ lbl: "Client dinner", kind: "work" }],
      "2026-04-19": [{ lbl: "Zone-2 · Richmond Park", kind: "health" }, { lbl: "Anchoria board call", kind: "work", flag: "high-stress" }, { lbl: "Coaching call · Darcy", kind: "health" }],
      "2026-04-20": [{ lbl: "Rest day", kind: "health" }],
      "2026-04-21": [{ lbl: "Zone-2 run", kind: "health" }],
      "2026-04-22": [{ lbl: "DEXA + VO₂max retest", kind: "health" }, { lbl: "West Clinic 08:30", kind: "health" }],
      "2026-04-23": [{ lbl: "Partners offsite", kind: "work", flag: "high-stress" }],
      "2026-04-24": [{ lbl: "Partners offsite", kind: "work" }],
      "2026-04-25": [{ lbl: "Mobility + sauna", kind: "health" }],
      "2026-04-26": [{ lbl: "Zone-2 run", kind: "health" }],
      "2026-04-29": [{ lbl: "Quarterly protocol review · Darcy", kind: "health" }],
      "2026-05-06": [{ lbl: "Full quarterly bloods", kind: "health" }],
      "2026-05-12": [{ lbl: "Dr. Sanjay Rao · cardiology", kind: "health" }],
    },
  },

  coachPush: [
    { kind: "compliance", icon: "signed", title: "Zone-2 minutes this week", body: "You're at 82 of 180. Three sessions left before Sunday.", by: "Darcy · 07:02", action: "Log session" },
    { kind: "reminder", icon: "signed", title: "In-person check-in — Wed 22 Apr", body: "DEXA + VO₂max retest, West Clinic 08:30. Fasted from 20:30 Tue.", by: "Darcy · added 02 Apr", action: "Confirm" },
    { kind: "protocol", icon: "draft", title: "New supplement — creatine 5g", body: "Proposed addition. Reviewed by agent, awaits your consent before adding to protocol.", by: "Agent draft → Darcy", action: "Approve" },
  ],

  // directive entries are what Jamie sees — only Darcy-signed items, never agent drafts
  directive: [
    { who: "Darcy", role: "Coach", lifecycle: "signed", body: "Agree with the hold. Jamie — write in this morning's check-in how board-cycle stress feels different this quarter than Q1. We may need to formalise a pre-quarter protocol before the July cycle.", meta: "Darcy O'Sullivan · 06:14 · 17 Apr" },
    { who: "Darcy", role: "Coach", lifecycle: "signed", body: "Your resting HR elevation over the past 72 hours is tracking the board prep cycle — this pattern has appeared ahead of every major board event this year. An 8-minute breathing sequence at 14:45 today, before the coaching call, will help.", meta: "Darcy O'Sullivan · 06:16 · 17 Apr" },
  ],
  // agent drafts visible to Darcy only (in his inbox/team workspace)
  agentDrafts: [
    { who: "Agent", lifecycle: "draft", body: "Resting HR elevation over the past 72 hours correlates with the board prep cycle (r = +0.71 across the last four quarters). Suggest an 8-minute breathing protocol at 14:45, ahead of the coaching call.", meta: "Drafted 05:58 · awaiting Darcy" },
  ],

  // Course corrector — the feedback loop: recommendation → action → outcome
  courseCorrector: [
    {
      date: "06 Feb 2026",
      recommendation: "Hold all intensity training. Autonomic flag active — HRV below floor for 5 consecutive days.",
      action: "Converted 2 lactate sessions to zone-2. Reduced weekly load by 40%.",
      outcome: "HRV recovered to baseline (54ms) within 8 days. No further flag events. Setback avoided.",
      impact: { metric: "HRV", before: 38, after: 54, unit: "ms", days: 8 },
      status: "resolved",
      by: "Darcy · signed 06:14",
    },
    {
      date: "22 Mar 2026",
      recommendation: "Eliminate post-14:00 caffeine for 14-day test. Agent analysis: correlated with −18 min deep sleep across 60 nights.",
      action: "Stopped afternoon caffeine entirely. Switched to matcha before noon only.",
      outcome: "Deep sleep increased from 54 min to 74 min average over 2 weeks. Sleep score improved 12 points.",
      impact: { metric: "Deep sleep", before: 54, after: 74, unit: "min", days: 14 },
      status: "resolved",
      by: "Darcy · signed 22 Mar",
    },
    {
      date: "02 Apr 2026",
      recommendation: "Increase fibre adherence to 89%+ target. ApoB delta correlates +0.74 with weekly fibre log, not cardio.",
      action: "Added psyllium husk + increased legume intake. Logging daily.",
      outcome: "Pending — next bloods 02 Jul. ApoB was 84 at last draw. Target ≤70.",
      impact: { metric: "ApoB", before: 84, after: null, unit: "mg/dL", days: null },
      status: "pending",
      by: "Darcy · signed 02 Apr",
    },
    {
      date: "17 Apr 2026",
      recommendation: "Hold intensity today. Three nights of elevated RHR (+4 bpm), HRV at −11ms vs 30d baseline, skin temp +0.4°C.",
      action: "Pending — signal issued this morning.",
      outcome: "Pending — monitoring.",
      impact: { metric: "RHR", before: 52, after: null, unit: "bpm", days: null },
      status: "active",
      by: "Darcy · signed 06:14",
    },
  ],

  trends: {
    periods: ["14d", "30d", "90d"],
    cards: [
      { name: "Resting heart rate", unit: "bpm", now: 52, delta: "+4 vs 30d", deltaDir: "up", data: series(30, 48, 4, 2.2, 10), band: [46, 52], note: "Trending up since day 18. Correlates with sleep debt (r = 0.68)." },
      { name: "HRV (rMSSD)", unit: "ms", now: 41, delta: "−11 vs 30d", deltaDir: "down", data: series(30, 54, -12, 4, 11), band: [48, 62], note: "Three consecutive days below 30-day floor. Flag active." },
      { name: "Sleep · deep", unit: "min", now: 54, delta: "−18 vs 30d", deltaDir: "down", data: series(30, 72, -20, 10, 12), band: [65, 90], note: "Loss concentrated in second half of night." },
      { name: "Glucose (CGM) variability", unit: "mg/dL SD", now: 14.2, delta: "−0.8 vs 30d", deltaDir: "down", data: series(30, 15.1, -1, 1.4, 13), band: [12, 18], note: "Stable. Lunch-time excursions capped below 135 mg/dL." },
      { name: "Skin temperature Δ", unit: "°C", now: 0.4, delta: "+0.4 vs baseline", deltaDir: "up", data: series(30, 0, 0.45, 0.15, 14), band: [-0.2, 0.2], note: "Sustained positive deviation. Precedes inflammation flag historically." },
      { name: "VO₂max (estimate)", unit: "ml/kg/min", now: 47.8, delta: "+0.2 vs 30d", deltaDir: "up", data: series(30, 47.4, 0.5, 0.4, 15), band: [46, 49], note: "Flat — protect by not over-reaching this week." },
    ],
    events: [
      { day: 3, lbl: "Q1 bloods", kind: "medical" },
      { day: 7, lbl: "NYC trip", kind: "travel" },
      { day: 12, lbl: "Lactate session", kind: "training" },
      { day: 17, lbl: "Board-cycle begins", kind: "life" },
      { day: 22, lbl: "Protocol change: +creatine", kind: "protocol" },
      { day: 26, lbl: "Mild viral illness", kind: "medical" },
    ],
    insights: [
      { id: "i1", title: "HRV has trended down for 11 days.", body: "Training load increased 38% over the same period. Sleep efficiency dropped below 78% on 8 of those 11 nights. This pattern precedes the October overtraining event by a similar signature.", strength: "high", refs: ["HRV −11 ms", "Training load +38%", "Sleep eff. <78% × 8", "Oct '25 precedent"], lifecycle: "signed", by: "Darcy · signed 07:14" },
      { id: "i2", title: "ApoB responds to fibre, not cardio, in your data.", body: "Across 11 months, ApoB deltas correlate +0.74 with weekly fibre-log adherence and +0.12 with weekly zone-2 minutes. The last quarterly drop (−7 mg/dL) aligned with 89% fibre adherence, not the cardio protocol.", strength: "high", refs: ["ApoB 91→84", "Fibre adherence 89%", "Zone-2 corr +0.12"], lifecycle: "signed", by: "Darcy · signed 03 Apr" },
      { id: "i3", title: "Skin-temp rise precedes your inflammation events by 4–6 days.", body: "In the last 14 months, every hs-CRP flag above 1.1 mg/L was preceded by a ≥0.3 °C skin-temp deviation sustained over 3 nights. Today is day 3 of a 0.4 °C deviation.", strength: "medium", refs: ["sTemp +0.4 °C × 3 nights", "hs-CRP precedent × 6"], lifecycle: "draft", by: "Agent draft · awaiting Darcy" },
      { id: "i4", title: "Afternoon caffeine cost 18 minutes of deep sleep.", body: "On days with caffeine logged after 14:00, deep-sleep duration was 18 ± 4 min lower than matched non-caffeine days. Effect confirmed across 60 nights. Protocol change implemented 22 Mar — deep sleep now averaging 74 min (was 54 min).", strength: "high", refs: ["n=60 nights", "Δ deep sleep −18 min", "Confirmed 22 Mar"], lifecycle: "signed", by: "Darcy · confirmed 05 Apr" },
    ],
    corr: {
      labels: ["RHR", "HRV", "Sleep", "Glucose", "sTemp", "Stress"],
      matrix: [
        [1.00, -0.71, -0.42, 0.21, 0.55, 0.62],
        [-0.71, 1.00, 0.58, -0.14, -0.48, -0.51],
        [-0.42, 0.58, 1.00, -0.09, -0.30, -0.38],
        [0.21, -0.14, -0.09, 1.00, 0.12, 0.34],
        [0.55, -0.48, -0.30, 0.12, 1.00, 0.41],
        [0.62, -0.51, -0.38, 0.34, 0.41, 1.00],
      ],
    },
  },

  pathology: {
    lastDraw: "02 Apr 2026",
    nextDraw: "02 Jul 2026",
    panels: [
      {
        group: "Cardiovascular",
        rows: [
          { marker: "ApoB", full: "Apolipoprotein B", value: 84, unit: "mg/dL", range: [40, 80], prev: 91, flag: "warn", trend: "↓ from 91", why: "ApoB measures the number of atherogenic particles in your blood — a stronger predictor of cardiovascular events than LDL-C alone. Your Lp(a) risk makes ApoB control especially critical. Target: ≤70 mg/dL.", action: "Continue statin + fibre protocol. Retest Jul. ApoB is your single most important modifiable number." },
          { marker: "Lp(a)", full: "Lipoprotein(a)", value: 118, unit: "nmol/L", range: [0, 75], prev: 121, flag: "warn", trend: "→ genetic", why: "Lp(a) is largely genetically determined and doesn't respond meaningfully to lifestyle changes. At 118 nmol/L you are in the high-risk tier. It amplifies cardiovascular risk when combined with elevated ApoB.", action: "Lp(a) itself cannot be modified. The lever is driving ApoB aggressively low around it. Discuss emerging therapies (PCSK9i, RNA-targeting drugs) with Dr. Rao." },
          { marker: "LDL-C", full: "Low-density lipoprotein", value: 88, unit: "mg/dL", range: [50, 100], prev: 96, flag: null, trend: "↓ 8", why: null, action: null },
          { marker: "HDL-C", full: "High-density lipoprotein", value: 58, unit: "mg/dL", range: [40, 80], prev: 56, flag: null, trend: "↑ 2", why: null, action: null },
          { marker: "Triglycerides", full: "Fasting triglycerides", value: 82, unit: "mg/dL", range: [40, 150], prev: 94, flag: null, trend: "↓ 12", why: null, action: null },
        ],
      },
      {
        group: "Metabolic",
        rows: [
          { marker: "Fasting insulin", full: "Insulin, fasting", value: 6.2, unit: "µIU/mL", range: [2, 9], prev: 7.1, flag: null, trend: "↓ 0.9", why: null, action: null },
          { marker: "HOMA-IR", full: "Insulin resistance index", value: 1.4, unit: "", range: [0, 2.0], prev: 1.7, flag: null, trend: "↓", why: null, action: null },
          { marker: "HbA1c", full: "Glycated hemoglobin", value: 5.3, unit: "%", range: [4.5, 5.6], prev: 5.4, flag: null, trend: "→", why: null, action: null },
          { marker: "Fasting glucose", full: "Fasting plasma glucose", value: 92, unit: "mg/dL", range: [70, 99], prev: 94, flag: null, trend: "→", why: null, action: null },
        ],
      },
      {
        group: "Inflammation",
        rows: [
          { marker: "hs-CRP", full: "High-sensitivity C-reactive protein", value: 0.7, unit: "mg/L", range: [0, 1.0], prev: 0.9, flag: null, trend: "↓", why: null, action: null },
          { marker: "Fibrinogen", full: "Fibrinogen activity", value: 342, unit: "mg/dL", range: [200, 400], prev: 318, flag: "warn", trend: "↑ 24", why: "Fibrinogen is an acute-phase protein and clotting factor. Elevated levels (especially trending up) indicate systemic inflammation and increase thrombotic risk — relevant given your AFib profile.", action: "Monitor trend at next draw. Prioritise anti-inflammatory nutrition (omega-3, polyphenols). If above 400 at next draw, discuss with Dr. Rao." },
          { marker: "Homocysteine", full: "Homocysteine, serum", value: 9.1, unit: "µmol/L", range: [0, 10.4], prev: 9.6, flag: null, trend: "↓", why: null, action: null },
        ],
      },
      {
        group: "Hormonal",
        rows: [
          { marker: "Testosterone", full: "Testosterone, total", value: 512, unit: "ng/dL", range: [350, 1050], prev: 498, flag: null, trend: "↑ 14", why: null, action: null },
          { marker: "Cortisol AM", full: "Cortisol, morning", value: 18.4, unit: "µg/dL", range: [6, 19], prev: 15.2, flag: "warn", trend: "↑ 3.2", why: "Morning cortisol at the top of range (18.4 µg/dL) in the context of poor sleep, elevated RHR, and board-cycle stress suggests active HPA axis activation. Your APOE E4/E4 genotype makes chronic cortisol elevation a cognitive risk factor.", action: "Protect sleep onset. Reduce evening stimulation. Consider morning cortisol retest in 4 weeks — if persistently elevated, discuss adrenal function with Darcy." },
          { marker: "DHEA-S", full: "Dehydroepiandrosterone sulfate", value: 198, unit: "µg/dL", range: [70, 310], prev: 205, flag: null, trend: "→", why: null, action: null },
        ],
      },
    ],
    timeline: [
      { marker: "ApoB", unit: "mg/dL", target: 65, points: [{ q: "Q2'25", v: 108 }, { q: "Q3'25", v: 99 }, { q: "Q4'25", v: 91 }, { q: "Q1'26", v: 84 }], range: [60, 120] },
      { marker: "Lp(a)", unit: "nmol/L", target: 75, points: [{ q: "Q2'25", v: 124 }, { q: "Q3'25", v: 122 }, { q: "Q4'25", v: 121 }, { q: "Q1'26", v: 118 }], range: [70, 130] },
      { marker: "hs-CRP", unit: "mg/L", target: 1.0, points: [{ q: "Q2'25", v: 1.2 }, { q: "Q3'25", v: 1.0 }, { q: "Q4'25", v: 0.9 }, { q: "Q1'26", v: 0.7 }], range: [0.2, 1.6] },
      { marker: "Fasting insulin", unit: "µIU/mL", target: 6, points: [{ q: "Q2'25", v: 8.4 }, { q: "Q3'25", v: 7.8 }, { q: "Q4'25", v: 7.1 }, { q: "Q1'26", v: 6.2 }], range: [2, 10] },
      { marker: "Fibrinogen", unit: "mg/dL", target: 300, points: [{ q: "Q2'25", v: 302 }, { q: "Q3'25", v: 310 }, { q: "Q4'25", v: 318 }, { q: "Q1'26", v: 342 }], range: [260, 380] },
    ],
  },

  lastNight: {
    sleepScore: 68,
    band: "Fair",
    total: "6h 12m",
    deep: "0h 54m",
    rem: "1h 12m",
    efficiency: 82,
    hrvOvernight: 41,
    rhrOvernight: 52,
    skinTempDelta: "+0.4°C",
    respRate: 14.8,
    bedtime: "23:42",
    wake: "05:54",
  },

  checkin: {
    today: {
      sliders: [
        { q: "How well did you sleep?", val: 6, min: 0, max: 10, left: "Broken", right: "Deep" },
        { q: "Mood on waking", val: 7, min: 0, max: 10, left: "Dull", right: "Clear" },
        { q: "Physical soreness", val: 4, min: 0, max: 10, left: "None", right: "Severe" },
        { q: "Mental load", val: 8, min: 0, max: 10, left: "Light", right: "Heavy" },
        { q: "Motivation", val: 6, min: 0, max: 10, left: "Inert", right: "Propulsive" },
      ],
      tags: {
        selected: ["wired-tired", "board-week", "shallow-sleep"],
        all: ["rested", "wired-tired", "foggy", "sharp", "sore", "tight-back", "headache", "anxious", "calm", "under-recovered", "board-week", "travel-lag", "alcohol-prev", "caffeine-heavy", "shallow-sleep", "hot-room"],
      },
      note: "Woke at 04:40 with the same board-call loop. Got up, made tea, did the 4-7-8 protocol twice. Back to sleep for maybe 40 minutes. The chest tightness Darcy and I talked about on Monday is back — not pain, pressure.",
    },
    history: [
      { when: "Thu 16 Apr", quote: "Surprising energy despite the short night. Ran fasted, felt strong through minute 40.", metrics: [["Sleep", 5], ["Mood", 8], ["Load", 7]] as [string, number][], tags: ["wired-tired", "sharp", "board-week"], band: "md" },
      { when: "Wed 15 Apr", quote: "Afternoon slump crushed me. Caffeine after 14:00 was a mistake I could feel by midnight.", metrics: [["Sleep", 7], ["Mood", 6], ["Load", 8]] as [string, number][], tags: ["foggy", "caffeine-heavy"], band: "md" },
      { when: "Tue 14 Apr", quote: "Best I've felt in a fortnight. Clear head, body quiet, wife said I looked like myself again.", metrics: [["Sleep", 9], ["Mood", 9], ["Load", 4]] as [string, number][], tags: ["rested", "sharp", "calm"], band: "hi" },
      { when: "Mon 13 Apr", quote: "Chest pressure on waking. Not pain. Noted. Did the breathing sequence Darcy sent before breakfast.", metrics: [["Sleep", 6], ["Mood", 5], ["Load", 9]] as [string, number][], tags: ["anxious", "under-recovered"], band: "lo" },
      { when: "Sun 12 Apr", quote: "Easy day. Long walk with Clara, no screens until 10. Needed it.", metrics: [["Sleep", 8], ["Mood", 8], ["Load", 3]] as [string, number][], tags: ["rested", "calm"], band: "hi" },
    ],
    qualStrip: ["md","md","hi","hi","md","lo","md","hi","hi","md","lo","lo","md","md","hi","md","md","hi","hi","md","lo","md","md","hi","md","lo","lo","md","md","md"],
  },

  team: {
    inbox: [
      { id: "t1", status: "pending", who: "agent", title: "Recommend converting Fri lactate → zone-2", body: "Autonomic flag active (HRV −11 ms over 3 nights). Historical precedent: Feb 06–11. Suggest protocol change before 07:30.", refs: ["HRV 41 ms", "RHR +4 bpm", "Feb precedent"], drafted: "05:58 · 17 Apr", visibility: "hidden-from-james" },
      { id: "t2", status: "pending", who: "agent", title: "New insight · caffeine × deep sleep confirmed", body: "Post-protocol change (22 Mar): deep sleep increased from 54 to 74 min average. 60-night dataset confirmed. Recommend marking as resolved insight.", refs: ["Δ +20 min deep sleep", "n=60 confirmed"], drafted: "11 Apr", visibility: "hidden-from-james" },
      { id: "t3", status: "pending", who: "agent", title: "Flag · overnight glucose excursion 02:14", body: "+18 mg/dL without food log. Possible dawn phenomenon shift. Recommend: observe one more night.", refs: ["CGM 02:14"], drafted: "Thu 22:40", visibility: "hidden-from-james" },
    ],
    signed: [
      { id: "s1", title: "Hold intensity today", body: "Convert Fri lactate → zone-2. Signed after agent draft.", visibleTo: "james", signedAt: "06:14 · 17 Apr" },
      { id: "s2", title: "Chest-pressure note shared with Dr. Rao", body: "Note from Mon 13 Apr forwarded with Jamie's consent. If recurs ≥2× in 10 days, book consult.", visibleTo: "james", signedAt: "Wed 18:31" },
    ],
    coach: {
      name: "Darcy O'Sullivan, MS",
      role: "Longevity coach · since Aug 2024",
      initials: "DO",
      bio: "Works with 11 principals. Clinical background in exercise physiology and psychoneuroimmunology. Protocol lead — all agent drafts pass through him before reaching you.",
    },
    thread: [
      { who: "agent", name: "Agent", chip: "draft", when: "Fri 06:58", body: "Cross-referencing the last six weeks: the ApoB drop (−7 mg/dL) and fibrinogen rise (+24) both correlate with dropped zone-2 minutes (−34% month-over-month). Recommend restoring 3×45 min zone-2 before the July draw.", refs: ["ApoB ↓ 91→84", "Fibrinogen ↑ 318→342", "Zone-2 minutes ↓ 34%"], counter: null },
      { who: "coach", name: "Darcy O'Sullivan", chip: "signed", when: "Fri 07:14", body: "Approved with one change — Jamie, we start with 2×45 this week, not 3. Your autonomic flag takes priority. Third session lands next week if HRV stabilises above 48.", refs: [], counter: "Countersigned · tasks created in your agenda" },
      { who: "agent", name: "Agent", chip: "draft", when: "Thu 22:40", body: "Overnight glucose excursion at 02:14 (+18 mg/dL, returned to baseline by 03:40) without a food log. Possible dawn-phenomenon shift — flagging for Darcy, not for Jamie's attention unless it repeats tonight.", refs: ["CGM 02:14"], counter: null },
      { who: "coach", name: "Darcy O'Sullivan", chip: "signed", when: "Wed 18:30", body: "Jamie — the chest pressure note from Monday is on my radar. I've shared it (with your consent) with Dr. Rao. If it recurs more than twice in the next 10 days we book a consult. The anxiety pathway we've seen before, not cardiac.", refs: ["Check-in · Mon 13 Apr"], counter: "Shared with Dr. S. Rao · 18:31" },
    ],
    calendar: [
      { day: "17", dow: "Fri", when: "15:00", title: "Weekly coaching call", with: "Darcy O'Sullivan · video · 15 min", tag: "Recurring" },
      { day: "22", dow: "Wed", when: "08:30", title: "DEXA + VO₂max retest", with: "Longevity Lab — West Clinic", tag: "Quarterly" },
      { day: "29", dow: "Wed", when: "11:00", title: "Quarterly protocol review", with: "Darcy O'Sullivan · in person · 60 min", tag: "Milestone" },
      { day: "06", dow: "Wed", when: "07:30", title: "Bloods — full quarterly panel", with: "Phlebotomist visit · fasted", tag: "Labs" },
      { day: "12", dow: "Tue", when: "14:00", title: "Consult — cardiology", with: "Dr. Sanjay Rao, MD · video", tag: "Specialist" },
    ],
    agentStandingBrief: "Watch ApoB trajectory. Flag any 72-hour HRV deficit >15%. Forward overnight glucose events to Darcy without interrupting Jamie. Prepare pre-quarter protocol draft by 24 Apr.",
    agentBriefIssuedBy: "Darcy · 02 Apr",
  },

  // Activity feed — the live event stream between coach, agent, and client.
  // visibility: "both" = Jamie + Darcy, "darcy" = Darcy only, "jamie" = Jamie only
  activityFeed: [
    { id: "a1",  when: "06:42 · Today",  type: "sync",         actor: "system",  visibility: "both",  title: "Devices synced",                    body: "Garmin · Oura · Withings · 3 sources · 06:41" },
    { id: "a2",  when: "06:16 · Today",  type: "directive",    actor: "darcy",   visibility: "both",  title: "Directive published",               body: "Board-cycle stress protocol issued to Jamie." },
    { id: "a3",  when: "06:14 · Today",  type: "countersign",  actor: "darcy",   visibility: "darcy", title: "Agent draft countersigned",          body: "\"Hold intensity today\" — published. Zone-2 substitution added to Jamie's calendar." },
    { id: "a4",  when: "06:14 · Today",  type: "directive",    actor: "darcy",   visibility: "jamie", title: "Hold intensity — protocol updated",  body: "Darcy has reviewed your signals and updated today's training protocol." },
    { id: "a5",  when: "05:58 · Today",  type: "agent-flag",   actor: "agent",   visibility: "darcy", title: "Flag raised — autonomic",            body: "HRV −11 ms over 3 nights. RHR +4 bpm. Pattern matches Feb 06. Awaiting your review." },
    { id: "a6",  when: "Thu 22:40",      type: "agent-flag",   actor: "agent",   visibility: "darcy", title: "Overnight glucose excursion",        body: "+18 mg/dL at 02:14 without food log. Dawn phenomenon possible. Observe one more night." },
    { id: "a7",  when: "Wed 18:31",      type: "share",        actor: "darcy",   visibility: "both",  title: "Note shared with Dr. Rao",           body: "Chest pressure entry (Mon 13 Apr) forwarded to Dr. Sanjay Rao with Jamie's consent." },
    { id: "a8",  when: "Wed 07:45",      type: "checkin",      actor: "jamie",   visibility: "both",  title: "Check-in submitted",                body: "Sleep 7 · Mood 6 · Load 8 · tags: foggy, caffeine-heavy" },
    { id: "a9",  when: "Fri 07:14",      type: "countersign",  actor: "darcy",   visibility: "darcy", title: "ApoB zone-2 recommendation signed",  body: "Modified: 2×45 min this week (not 3). Autonomic flag takes priority." },
    { id: "a10", when: "Fri 07:14",      type: "directive",    actor: "darcy",   visibility: "jamie", title: "Zone-2 sessions updated",            body: "2×45 min zone-2 this week. Full programme resumes next week if HRV stabilises." },
    { id: "a11", when: "22 Mar",         type: "protocol",     actor: "darcy",   visibility: "both",  title: "Protocol change · caffeine cutoff",  body: "Post-14:00 caffeine eliminated. Confirmed by 60-night dataset: +20 min deep sleep." },
    { id: "a12", when: "02 Apr",         type: "protocol",     actor: "darcy",   visibility: "both",  title: "Protocol addition · fibre target",  body: "Psyllium husk + legume logging. ApoB correlation: fibre r=+0.74 vs cardio r=+0.12." },
    { id: "a13", when: "02 Apr",         type: "goal",         actor: "darcy",   visibility: "both",  title: "North-star confirmed for Q3",        body: "ApoB ≤ 70 mg/dL while HRV > 48 ms. 68 days to next bloods. Sub-goals active." },
  ],

  // Quarterly review — auto-populated when a quarter closes
  quarterlyReview: {
    quarter: "Q1 2026",
    status: "ready",    // "ready" | "in-progress" | "complete"
    closedOn: "31 Mar 2026",
    daysOpen: 20,
    preparedBy: "Darcy · reviewed agent summary",
    agenda: [
      { section: "What we targeted", items: ["ApoB ≤ 85 mg/dL → achieved 84 ✓", "HRV floor > 46 ms → missed, currently 41 ms", "Zone-2 ≥ 180 min/week → averaged 148 min"] },
      { section: "What moved", items: ["ApoB: 91 → 84 mg/dL (−7). Fibre adherence the lever, not cardio.", "Deep sleep: 54 → 74 min avg after caffeine protocol change.", "Fibrinogen trending up — 318 → 342 mg/dL. Watch closely Q2."] },
      { section: "What didn't and why", items: ["HRV below floor: board-cycle stress + inadequate pre-quarter taper.", "Zone-2 volume: travel weeks in Jan and Mar dropped totals.", "VO₂max flat: intensity holds (correct) slowed aerobic adaptation."] },
      { section: "Proposed Q2 targets", items: ["HRV floor ≥ 44 ms (realistic step)", "Fibrinogen < 320 mg/dL", "Zone-2 ≥ 160 min/week (adjusted for board cycles)"] },
    ],
  },
}
