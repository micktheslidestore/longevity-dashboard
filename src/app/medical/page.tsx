"use client"

import { useState } from "react"
import { DATA } from "@/data/james"
import { T } from "@/components/Primitives"
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, ReferenceLine, Tooltip } from "recharts"

// ─── Biomarker pace + action view ────────────────────────────────────────────

type PaceStatus = "on-pace" | "watch" | "off-pace" | "flag"

const BIOMARKER_PACE: {
  name: string; unit: string; current: number | string; target: string
  status: PaceStatus; verdict: string; thisWeek: string; action: string
}[] = [
  {
    name: "ApoB cholesterol",
    unit: "mg/dL",
    current: 84,
    target: "≤70 by 2 Jul",
    status: "off-pace",
    verdict: "Projected 77 mg/dL at Q3 end — 7 above target at current rate",
    thisWeek: "Fibre adherence is at 86%, needs to reach 94%+ to close the gap. The difference between 86% and 94% adherence is approximately 3–4 mg/dL of ApoB movement per quarter.",
    action: "Push fibre reminder to Jamie this week. Flag the 7-point shortfall for Dr. Rao at the May cardiology consult — a statin dose adjustment may be the deciding factor.",
  },
  {
    name: "HRV floor",
    unit: "ms",
    current: 41,
    target: "≥48 sustained",
    status: "flag",
    verdict: "11 ms below baseline for 3 consecutive nights — flag active",
    thisWeek: "Autonomic suppression is the current priority. Board-cycle stress and incomplete sleep recovery are the most likely drivers. Pattern matches the February setback.",
    action: "Hold intensity through Wednesday. If flag persists beyond day 8 without improvement, escalate to Dr. Rao. Reassess after DEXA results.",
  },
  {
    name: "Fibrinogen",
    unit: "mg/dL",
    current: 342,
    target: "<320",
    status: "watch",
    verdict: "Rising trend over 2 quarters (318 → 342) — no active intervention yet",
    thisWeek: "No immediate risk, but the upward trend needs a response before Q3 bloods. Omega-3 dose increase and anti-inflammatory diet additions are the primary levers.",
    action: "Add fibrinogen to the 29 Apr protocol review agenda. Discuss omega-3 dose optimisation and consider adding curcumin to the supplement stack.",
  },
  {
    name: "VO₂max",
    unit: "mL/kg/min",
    current: 44,
    target: "≥47 by Q3",
    status: "watch",
    verdict: "Improving slowly (+1/quarter) — DEXA retest Wednesday gives objective reading",
    thisWeek: "Zone-2 volume is at 51% of weekly target due to hold-intensity corrector. This week's shortfall won't affect the trend materially — the DEXA retest is the key data point.",
    action: "Wait for Wednesday's VO₂max result before adjusting volume targets. If below 45, consider extending the weekly target to 180 min once the autonomic flag clears.",
  },
]

const PACE_STYLE: Record<PaceStatus, { label: string; color: string; bg: string }> = {
  "on-pace":  { label: "On pace",  color: T.ok,    bg: T.okSubtle },
  "watch":    { label: "Watch",    color: "#9B8FA9", bg: "rgba(155,143,169,0.08)" },
  "off-pace": { label: "Off pace", color: T.warn,  bg: T.warnSubtle },
  "flag":     { label: "Flag",     color: T.alert, bg: "rgba(193,122,106,0.08)" },
}

function BiomarkerPace() {
  const [selected, setSelected] = useState<string | null>(null)

  return (
    <div style={{ background: T.surface, borderRadius: 14, overflow: "hidden", marginBottom: 56 }}>
      {/* Header */}
      <div style={{
        padding: "20px 28px", borderBottom: `1px solid ${T.border}`,
        display: "flex", justifyContent: "space-between", alignItems: "baseline",
      }}>
        <span style={{ fontFamily: T.sans, fontSize: 16, fontWeight: 500, color: T.ink }}>
          Biomarker pace · Q2 2026
        </span>
        <span style={{ fontFamily: T.sans, fontSize: 12, color: T.ink3 }}>
          Click for this week's action
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
        {BIOMARKER_PACE.map((bm, idx) => {
          const ps = PACE_STYLE[bm.status]
          const isSelected = selected === bm.name
          const isRight = idx % 2 === 1
          const isBottom = idx >= 2

          return (
            <div
              key={bm.name}
              onClick={() => setSelected(isSelected ? null : bm.name)}
              style={{
                background: isSelected ? T.surfaceRaised : "transparent",
                cursor: "pointer",
                borderLeft: isSelected ? `3px solid ${ps.color}` : `3px solid transparent`,
                borderRight: isRight ? "none" : `1px solid ${T.border}`,
                borderBottom: isBottom ? "none" : `1px solid ${T.border}`,
                transition: "all 0.15s ease",
              }}
            >
              {/* Summary */}
              <div style={{ padding: "20px 24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <div>
                    <div style={{ fontFamily: T.sans, fontSize: 12, color: T.ink3, marginBottom: 4 }}>{bm.name}</div>
                    <div style={{ fontFamily: T.mono, fontSize: 24, letterSpacing: "-0.03em", color: T.ink, lineHeight: 1 }}>
                      {bm.current} <span style={{ fontFamily: T.sans, fontSize: 11, color: T.ink3 }}>{bm.unit}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span style={{
                      display: "inline-flex", alignItems: "center", gap: 5,
                      fontFamily: T.sans, fontSize: 11, fontWeight: 500,
                      color: ps.color, padding: "3px 10px",
                      background: ps.bg, borderRadius: 20, marginBottom: 6,
                    }}>
                      <span style={{ width: 5, height: 5, borderRadius: "50%", background: ps.color }} />
                      {ps.label}
                    </span>
                    <div style={{ fontFamily: T.sans, fontSize: 11, color: T.ink4, marginTop: 4 }}>
                      Target: {bm.target}
                    </div>
                  </div>
                </div>
                <div style={{ fontFamily: T.sans, fontSize: 13, color: T.ink3, lineHeight: 1.6 }}>
                  {bm.verdict}
                </div>
              </div>

              {/* Expanded action view */}
              {isSelected && (
                <div style={{ padding: "0 24px 24px", borderTop: `1px solid ${T.border}` }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, paddingTop: 16 }}>
                    <div>
                      <div style={{ fontFamily: T.sans, fontSize: 11, color: T.ink4, marginBottom: 8, fontWeight: 500 }}>
                        What this means this week
                      </div>
                      <p style={{ fontFamily: T.sans, fontSize: 13, color: T.ink2, lineHeight: 1.65, margin: 0 }}>
                        {bm.thisWeek}
                      </p>
                    </div>
                    <div style={{ borderLeft: `2px solid ${ps.color}`, paddingLeft: 16 }}>
                      <div style={{ fontFamily: T.sans, fontSize: 11, color: ps.color, marginBottom: 8, fontWeight: 500 }}>
                        Action
                      </div>
                      <p style={{ fontFamily: T.sans, fontSize: 13, color: T.ink2, lineHeight: 1.65, margin: 0 }}>
                        {bm.action}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Medical Roadmap ─────────────────────────────────────────────────────────

const MILESTONES = [
  { label: "Today",                     date: "20 Apr",  daysOut: 0,  type: "today",    note: null },
  { label: "DEXA + VO₂max retest",     date: "22 Apr",  daysOut: 2,  type: "test",     note: "Fasted from 20:30 Tue · West Clinic 08:30" },
  { label: "Quarterly protocol review", date: "29 Apr",  daysOut: 9,  type: "coaching", note: "In person · 60 min · Darcy O'Sullivan" },
  { label: "Full quarterly bloods",     date: "06 May",  daysOut: 16, type: "blood",    note: "Phlebotomist visit · fasted" },
  { label: "Cardiology consult",        date: "12 May",  daysOut: 22, type: "medical",  note: "Dr. Sanjay Rao, MD · video" },
  { label: "Q3 bloods · ApoB target",  date: "02 Jul",  daysOut: 73, type: "target",   note: "ApoB ≤ 70 mg/dL · Fibrinogen < 320 mg/dL" },
]

const MILESTONE_COLORS: Record<string, string> = {
  today:    T.ink,
  test:     T.warn,
  coaching: T.ok,
  blood:    "#9B8FA9",
  medical:  T.warn,
  target:   T.ok,
}

function MedicalRoadmap() {
  const [hovered, setHovered] = useState<number | null>(null)
  const totalDays = 73

  return (
    <div style={{ background: T.surface, borderRadius: 14, overflow: "hidden", marginBottom: 56 }}>
      <div style={{
        padding: "20px 28px", borderBottom: `1px solid ${T.border}`,
        display: "flex", justifyContent: "space-between", alignItems: "baseline",
      }}>
        <span style={{ fontFamily: T.sans, fontSize: 16, fontWeight: 500, color: T.ink }}>
          Medical roadmap · Q2 2026
        </span>
        <span style={{ fontFamily: T.sans, fontSize: 12, color: T.ink3 }}>
          Next 73 days
        </span>
      </div>

      <div style={{ padding: "28px 36px 16px" }}>
        {/* Timeline track */}
        <div style={{ position: "relative", height: 4, background: T.borderMed, borderRadius: 2 }}>
          <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: "2.7%", background: T.ink, borderRadius: 2 }} />
          {MILESTONES.map((m, i) => {
            const pct = (m.daysOut / totalDays) * 100
            const color = MILESTONE_COLORS[m.type]
            return (
              <div
                key={m.label}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                style={{ position: "absolute", left: `${pct}%`, top: "50%", transform: "translate(-50%, -50%)", cursor: "default" }}
              >
                <div style={{
                  width: 12, height: 12,
                  borderRadius: m.type === "target" ? 0 : "50%",
                  background: m.type === "today" ? T.ink : T.bg,
                  border: `2px solid ${color}`,
                  transform: m.type === "target" ? "rotate(45deg)" : undefined,
                }} />
              </div>
            )
          })}
        </div>

        {/* Labels row */}
        <div style={{ position: "relative", height: 56, marginTop: 8 }}>
          {MILESTONES.map((m, i) => {
            const pct = (m.daysOut / totalDays) * 100
            const color = MILESTONE_COLORS[m.type]
            const isHovered = hovered === i
            return (
              <div
                key={m.label}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  position: "absolute", left: `${pct}%`,
                  transform: "translateX(-50%)",
                  display: "flex", flexDirection: "column", alignItems: "center",
                  width: 90,
                }}
              >
                <div style={{ fontFamily: T.mono, fontSize: 10, color: isHovered ? color : T.ink3, textAlign: "center", lineHeight: 1.3 }}>
                  {m.date}
                </div>
                <div style={{ fontFamily: T.sans, fontSize: 10, color: isHovered ? T.ink : T.ink4, textAlign: "center", lineHeight: 1.3, marginTop: 2 }}>
                  {m.label}
                </div>
                {isHovered && m.note && (
                  <div style={{
                    position: "absolute", top: "100%", left: "50%", transform: "translateX(-50%)",
                    marginTop: 6, background: T.surfaceRaised, border: `1px solid ${color}`,
                    padding: "6px 10px", fontFamily: T.sans, fontSize: 11, color: T.ink2,
                    whiteSpace: "nowrap", zIndex: 10, lineHeight: 1.4, borderRadius: 6,
                  }}>
                    {m.note}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Target progress rails */}
      <div style={{ borderTop: `1px solid ${T.border}`, padding: "16px 0", display: "grid", gridTemplateColumns: "repeat(4, 1fr)" }}>
        {DATA.vision.tracks.map((track, i) => {
          const pct = Math.round(track.progress * 100)
          const isDown = track.dir === "down"
          const color = pct >= 60 ? T.ok : pct >= 30 ? T.warn : T.alert
          return (
            <div key={track.name} style={{ padding: "10px 20px", borderRight: i < 3 ? `1px solid ${T.border}` : undefined }}>
              <div style={{ fontFamily: T.sans, fontSize: 12, color: T.ink3, marginBottom: 6 }}>
                {track.name}
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 8 }}>
                <span style={{ fontFamily: T.mono, fontSize: 20, color: T.ink, letterSpacing: "-0.02em" }}>
                  {track.now}
                </span>
                <span style={{ fontFamily: T.sans, fontSize: 11, color: T.ink3 }}>{track.unit}</span>
                <span style={{ fontFamily: T.sans, fontSize: 11, color: T.ink4 }}>
                  {isDown ? "↓" : "↑"} {track.target}
                </span>
              </div>
              <div style={{ height: 4, background: T.border, borderRadius: 2, marginBottom: 4, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 2 }} />
              </div>
              <div style={{ fontFamily: T.sans, fontSize: 11, color }}>{pct}% to target</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function InfoModal({ why, action, marker }: { why: string; action: string; marker: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          width: 16, height: 16, borderRadius: "50%",
          border: `1px solid ${T.borderMed}`,
          fontFamily: T.sans, fontSize: 9, color: T.ink3,
          cursor: "pointer", flexShrink: 0,
        }}
        title={`Why ${marker} is flagged`}
      >
        i
      </button>
      {open && (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 19 }} onClick={() => setOpen(false)} />
          <div style={{
            position: "absolute", top: 20, right: 0, zIndex: 20,
            background: T.surfaceRaised, border: `1px solid ${T.borderMed}`,
            padding: "12px 14px", width: 260, borderRadius: 10,
            fontFamily: T.sans, fontSize: 12, color: T.ink2, lineHeight: 1.6,
            boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
          }}>
            <div style={{ fontFamily: T.sans, fontSize: 11, fontWeight: 500, color: T.ink, marginBottom: 6 }}>
              {marker} · why flagged
            </div>
            <div>{why}</div>
            <div style={{ marginTop: 8, paddingTop: 8, borderTop: `1px solid ${T.border}`, fontFamily: T.sans, fontSize: 11, color: T.accent }}>
              {action}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function LabRail({ points, range, target, unit }: {
  points: { q: string; v: number }[]
  range: [number, number]
  target: number
  unit: string
}) {
  const data = points.map(p => ({ name: p.q, value: p.v }))
  const [lo, hi] = range
  return (
    <div style={{ height: 80, width: "100%" }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -24 }}>
          <XAxis dataKey="name" tick={{ fontFamily: T.sans, fontSize: 10, fill: T.ink3 }} tickLine={false} axisLine={false} />
          <YAxis domain={[lo, hi]} tick={{ fontFamily: T.mono, fontSize: 9, fill: T.ink3 }} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{ background: T.surfaceRaised, border: `1px solid ${T.borderMed}`, borderRadius: 8, fontFamily: T.sans, fontSize: 11 }}
            formatter={(v) => [`${v} ${unit}`, ""]}
            labelStyle={{ color: T.ink3 }}
            itemStyle={{ color: T.ink }}
          />
          <ReferenceLine y={target} stroke={T.ok} strokeDasharray="3 3" strokeWidth={1} />
          <Line type="monotone" dataKey="value" stroke={T.accent} strokeWidth={1.5} dot={{ r: 2, fill: T.accent, strokeWidth: 0 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

const DATA_SOURCES = [
  {
    id: "quarterly-bloods",
    label: "Quarterly bloods",
    lastUploaded: "2 Apr 2026",
    nextExpected: "2 Jul 2026",
    nextUrgent: false,
  },
  {
    id: "dexa",
    label: "DEXA / body comp",
    lastUploaded: "12 Jan 2026",
    nextExpected: "22 Apr 2026",
    nextUrgent: true,
  },
  {
    id: "vo2max",
    label: "VO₂max / cardiology",
    lastUploaded: "12 Jan 2026",
    nextExpected: "22 Apr 2026",
    nextUrgent: true,
  },
  {
    id: "cgm",
    label: "Continuous data (CGM)",
    lastUploaded: "Today (continuous)",
    nextExpected: null,
    nextUrgent: false,
  },
]

function UploadModal({ onClose }: { onClose: () => void }) {
  const [selectedSource, setSelectedSource] = useState<string>("quarterly-bloods")
  const [dragging, setDragging] = useState(false)
  const [uploadToast, setUploadToast] = useState(false)

  function handleUpload() {
    onClose()
    // parent will show the toast — we emit via a callback-like pattern
    // but since we need the toast outside the modal, we set it here momentarily
    setUploadToast(true)
  }

  // fire external toast via a DOM-level trick: dispatch custom event
  function handleConfirm() {
    onClose()
    window.dispatchEvent(new CustomEvent("lab-upload-toast"))
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 200,
        }}
      />
      {/* Modal */}
      <div style={{
        position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
        zIndex: 201, background: T.surface, borderRadius: 12,
        width: 520, maxWidth: "calc(100vw - 48px)",
        boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
        overflow: "hidden",
      }}>
        {/* Modal header */}
        <div style={{ padding: "24px 28px 20px", borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <h2 style={{ fontFamily: T.serif, fontSize: 22, fontWeight: 300, color: T.ink, margin: 0, letterSpacing: "-0.02em" }}>
            Upload lab results
          </h2>
          <button
            onClick={onClose}
            style={{ fontFamily: T.sans, fontSize: 18, color: T.ink3, background: "none", border: "none", cursor: "pointer", lineHeight: 1, padding: "0 0 0 12px" }}
          >
            ×
          </button>
        </div>

        <div style={{ padding: "24px 28px 28px", display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Drop zone */}
          <div
            onDragOver={e => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={e => { e.preventDefault(); setDragging(false) }}
            style={{
              border: `1.5px dashed ${dragging ? T.accent : T.borderMed}`,
              borderRadius: 10,
              background: T.surfaceRaised,
              padding: "28px 24px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
              transition: "border-color 0.15s",
            }}
          >
            <div style={{ fontFamily: T.sans, fontSize: 13, color: T.ink2 }}>
              Drag and drop a file here, or
            </div>
            <label style={{ cursor: "pointer" }}>
              <input type="file" accept="application/pdf,image/*" style={{ display: "none" }} />
              <span style={{
                fontFamily: T.sans, fontSize: 12, fontWeight: 500,
                color: T.accent, border: `1px solid ${T.accent}`,
                padding: "5px 14px", borderRadius: 6, cursor: "pointer",
              }}>
                Choose file
              </span>
            </label>
            <div style={{ fontFamily: T.sans, fontSize: 11, color: T.ink4 }}>
              PDF or image · max 10 MB
            </div>
          </div>

          {/* Data source selector */}
          <div>
            <div style={{ fontFamily: T.sans, fontSize: 12, color: T.ink3, fontWeight: 500, marginBottom: 10 }}>
              Data source
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {DATA_SOURCES.map(ds => (
                <div
                  key={ds.id}
                  onClick={() => setSelectedSource(ds.id)}
                  style={{
                    padding: "10px 14px",
                    borderRadius: 8,
                    border: `1px solid ${selectedSource === ds.id ? T.accent : T.border}`,
                    background: selectedSource === ds.id ? "rgba(200,165,106,0.06)" : T.surfaceRaised,
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    transition: "border-color 0.12s",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                      width: 14, height: 14, borderRadius: "50%",
                      border: `2px solid ${selectedSource === ds.id ? T.accent : T.borderMed}`,
                      background: selectedSource === ds.id ? T.accent : "transparent",
                      flexShrink: 0,
                    }} />
                    <span style={{ fontFamily: T.sans, fontSize: 13, color: T.ink }}>{ds.label}</span>
                  </div>
                  <div style={{ display: "flex", gap: 20, flexShrink: 0 }}>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontFamily: T.sans, fontSize: 10, color: T.ink4 }}>Last uploaded</div>
                      <div style={{ fontFamily: T.sans, fontSize: 11, color: T.ink3 }}>{ds.lastUploaded}</div>
                    </div>
                    {ds.nextExpected && (
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontFamily: T.sans, fontSize: 10, color: T.ink4 }}>Next expected</div>
                        <div style={{ fontFamily: T.sans, fontSize: 11, color: ds.nextUrgent ? T.warn : T.ink3 }}>
                          {ds.nextExpected}{ds.nextUrgent ? " · 2 days" : ""}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upload button */}
          <button
            onClick={handleConfirm}
            style={{
              fontFamily: T.sans, fontSize: 13, fontWeight: 500,
              padding: "10px 20px", background: T.ok, color: T.bg,
              border: "none", cursor: "pointer", borderRadius: 8,
              width: "100%",
            }}
          >
            Upload and process
          </button>
        </div>
      </div>
    </>
  )
}

export default function MedicalPage() {
  const { pathology } = DATA
  const [openGroup, setOpenGroup] = useState<string | null>(null)
  const [shareToast, setShareToast] = useState(false)
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [uploadToast, setUploadToast] = useState(false)

  function handleShare() {
    setShareToast(true)
    setTimeout(() => setShareToast(false), 2800)
  }

  // Listen for the custom event fired from the modal after confirm
  useState(() => {
    function onLabUpload() {
      setUploadToast(true)
      setTimeout(() => setUploadToast(false), 4000)
    }
    if (typeof window !== "undefined") {
      window.addEventListener("lab-upload-toast", onLabUpload)
      return () => window.removeEventListener("lab-upload-toast", onLabUpload)
    }
  })

  return (
    <div style={{ padding: "48px 48px 80px", maxWidth: 960, margin: "0 auto" }}>

      {uploadModalOpen && <UploadModal onClose={() => setUploadModalOpen(false)} />}

      {/* Page header */}
      <div style={{ marginBottom: 56 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <h1 style={{ fontFamily: T.serif, fontSize: 28, fontWeight: 300, letterSpacing: "-0.02em", color: T.ink, margin: 0, lineHeight: 1.2 }}>
              Medical overview
            </h1>
            <div style={{ fontFamily: T.sans, fontSize: 12, color: T.ink3, marginTop: 8 }}>
              Last draw {pathology.lastDraw} · Next scheduled {pathology.nextDraw} · {DATA.user.first} {DATA.user.last}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, position: "relative" }}>
            <button
              onClick={() => setUploadModalOpen(true)}
              style={{
                fontFamily: T.sans, fontSize: 13, border: `1px solid ${T.borderMed}`,
                padding: "8px 16px", color: T.ink2, background: "transparent",
                cursor: "pointer", borderRadius: 8,
              }}
            >
              Upload lab results
            </button>
            <button
              onClick={handleShare}
              style={{
                fontFamily: T.sans, fontSize: 13, border: `1px solid ${T.borderMed}`,
                padding: "8px 16px", color: T.ink2, background: "transparent",
                cursor: "pointer", borderRadius: 8,
              }}
            >
              Share with clinician
            </button>
            <button style={{
              fontFamily: T.sans, fontSize: 13, border: `1px solid ${T.borderMed}`,
              padding: "8px 16px", color: T.ink2, background: "transparent",
              cursor: "pointer", borderRadius: 8,
            }}>
              Export PDF
            </button>
            <button style={{
              fontFamily: T.sans, fontSize: 13, fontWeight: 500,
              padding: "8px 18px", background: T.ok, color: T.bg,
              border: "none", cursor: "pointer", borderRadius: 8,
            }}>
              Quarterly report
            </button>
            {shareToast && (
              <div style={{
                position: "absolute", top: "calc(100% + 8px)", right: 0,
                background: T.surfaceRaised, border: `1px solid ${T.okMuted}`,
                padding: "8px 14px", fontFamily: T.sans, fontSize: 12, color: T.ok,
                whiteSpace: "nowrap", zIndex: 10, borderRadius: 8,
              }}>
                Draft prepared for Dr. Sanjay Rao · review before sending
              </div>
            )}
            {uploadToast && (
              <div style={{
                position: "fixed", bottom: 28, right: 28, zIndex: 300,
                background: T.surfaceRaised, border: `1px solid ${T.okMuted}`,
                padding: "10px 16px", fontFamily: T.sans, fontSize: 13, color: T.ok,
                whiteSpace: "nowrap", borderRadius: 10,
                boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
              }}>
                Lab results uploaded — agent will process and flag changes within 2 hours
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Biomarker pace */}
      <BiomarkerPace />

      {/* Medical roadmap */}
      <MedicalRoadmap />

      {/* Risk strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 56 }}>
        {[
          { l: "Risk profile", v: DATA.user.risk, color: T.warn },
          { l: "Last draw",    v: pathology.lastDraw, color: T.ink },
          { l: "Next draw",    v: pathology.nextDraw, color: T.ink },
        ].map(({ l, v, color }) => (
          <div key={l} style={{ background: T.surface, borderRadius: 10, padding: "14px 18px" }}>
            <div style={{ fontFamily: T.sans, fontSize: 11, color: T.ink3, marginBottom: 4 }}>{l}</div>
            <div style={{
              fontFamily: l === "Risk profile" ? T.serif : T.mono,
              fontSize: 12, color, marginTop: 4,
              fontStyle: l === "Risk profile" ? "italic" : "normal",
            }}>{v}</div>
          </div>
        ))}
      </div>

      {/* Lab panels */}
      {pathology.panels.map(panel => (
        <div key={panel.group} style={{ background: T.surface, borderRadius: 12, overflow: "hidden", marginBottom: 16 }}>
          <div
            style={{
              padding: "16px 24px", borderBottom: `1px solid ${T.border}`,
              display: "flex", justifyContent: "space-between", alignItems: "center",
              cursor: "pointer", fontFamily: T.sans, fontSize: 15, fontWeight: 500, color: T.ink,
            }}
            onClick={() => setOpenGroup(openGroup === panel.group ? null : panel.group)}
          >
            <span>{panel.group}</span>
            <span style={{ fontFamily: T.sans, fontSize: 12, color: T.ink3 }}>
              {panel.rows.filter(r => r.flag).length > 0
                ? `${panel.rows.filter(r => r.flag).length} flagged`
                : "All clear"} · {openGroup === panel.group ? "collapse" : "expand"}
            </span>
          </div>

          {(openGroup === panel.group || openGroup === null) && (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["Marker", "Value", "Range", "Previous", "Trend"].map(h => (
                    <th key={h} style={{
                      padding: "10px 16px", fontFamily: T.sans, fontSize: 11, fontWeight: 500,
                      color: T.ink3, borderBottom: `1px solid ${T.borderMed}`,
                      textAlign: h === "Marker" ? "left" : "right",
                    }}>{h}</th>
                  ))}
                  <th style={{ width: 24, borderBottom: `1px solid ${T.borderMed}` }} />
                </tr>
              </thead>
              <tbody>
                {panel.rows.map(row => {
                  const inRange = row.value >= row.range[0] && row.value <= row.range[1]
                  return (
                    <tr key={row.marker} style={{ background: row.flag ? T.warnSubtle : undefined }}>
                      <td style={{ padding: "12px 16px", borderBottom: `1px solid ${T.border}`, verticalAlign: "middle" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          {row.flag && (
                            <span style={{
                              display: "inline-block", width: 6, height: 6,
                              background: row.flag === "alert" ? T.alert : T.warn,
                              borderRadius: "50%", flexShrink: 0,
                            }} />
                          )}
                          <div>
                            <div style={{ fontFamily: T.sans, fontSize: 13, fontWeight: 500, color: row.flag ? (row.flag === "alert" ? T.alert : T.warn) : T.ink }}>
                              {row.marker}
                            </div>
                            <div style={{ fontFamily: T.sans, fontSize: 11, color: T.ink3, marginTop: 1 }}>{row.full}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "12px 16px", textAlign: "right", borderBottom: `1px solid ${T.border}`, fontFamily: T.mono, fontSize: 15, color: inRange ? T.ink : row.flag === "alert" ? T.alert : T.warn, verticalAlign: "middle" }}>
                        {row.value} <span style={{ fontFamily: T.sans, fontSize: 11, color: T.ink3 }}>{row.unit}</span>
                      </td>
                      <td style={{ padding: "12px 16px", textAlign: "right", borderBottom: `1px solid ${T.border}`, fontFamily: T.mono, fontSize: 11, color: T.ink3, verticalAlign: "middle" }}>
                        {row.range[0]}–{row.range[1]} {row.unit}
                      </td>
                      <td style={{ padding: "12px 16px", textAlign: "right", borderBottom: `1px solid ${T.border}`, fontFamily: T.mono, fontSize: 11, color: T.ink2, verticalAlign: "middle" }}>
                        {row.prev} <span style={{ fontFamily: T.sans, fontSize: 10, color: T.ink3 }}>{row.unit}</span>
                      </td>
                      <td style={{ padding: "12px 16px", textAlign: "right", borderBottom: `1px solid ${T.border}`, fontFamily: T.mono, fontSize: 11, color: T.ink2, verticalAlign: "middle" }}>
                        {row.trend}
                      </td>
                      <td style={{ padding: "12px 16px", borderBottom: `1px solid ${T.border}`, verticalAlign: "middle", textAlign: "center" }}>
                        {row.flag && row.why && row.action && (
                          <InfoModal why={row.why} action={row.action} marker={row.marker} />
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      ))}

      {/* Pathology trajectory */}
      <div style={{ background: T.surface, borderRadius: 12, overflow: "hidden", marginTop: 40 }}>
        <div style={{
          padding: "16px 24px", borderBottom: `1px solid ${T.border}`,
          display: "flex", justifyContent: "space-between", alignItems: "baseline",
        }}>
          <span style={{ fontFamily: T.sans, fontSize: 15, fontWeight: 500, color: T.ink }}>
            Pathology trajectory
          </span>
          <span style={{ fontFamily: T.sans, fontSize: 12, color: T.ink3 }}>
            4 quarters · dashed line = target
          </span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)" }}>
          {pathology.timeline.map((item, i) => (
            <div key={item.marker} style={{
              borderRight: i % 3 < 2 ? `1px solid ${T.border}` : undefined,
              borderBottom: i < 3 ? `1px solid ${T.border}` : undefined,
              padding: "16px 20px",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
                <div style={{ fontFamily: T.sans, fontSize: 13, color: T.ink2 }}>{item.marker}</div>
                <div style={{ fontFamily: T.sans, fontSize: 11, color: T.ink3 }}>
                  target {item.target} {item.unit}
                </div>
              </div>
              <LabRail
                points={item.points}
                range={item.range as [number, number]}
                target={item.target}
                unit={item.unit}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
