"use client"

import { useState } from "react"
import { DATA } from "@/data/james"

// ─── Load classification ──────────────────────────────────────────────────────

function loadScore(type: string | undefined | null, duration: number | undefined | null): number {
  if (!type || !duration) return 0
  if (type === "zone2")     return Math.min(100, Math.round(duration / 1.6))
  if (type === "test")      return 90
  if (type === "mobility")  return 15
  if (type === "recovery")  return 5
  return 0
}

const LOAD_COLOR = (score: number) =>
  score === 0  ? "var(--hair-strong)"
  : score < 30 ? "var(--ok)"
  : score < 60 ? "color-mix(in srgb, var(--ok) 50%, var(--warn))"
  : score < 80 ? "var(--warn)"
  : "var(--alert)"

const WORKOUT_COLORS: Record<string, string> = {
  zone2: "var(--ok)", test: "var(--warn)", mobility: "var(--accent)", recovery: "#9B8FA9", rest: "var(--ink-3)",
}

// ─── Week data ────────────────────────────────────────────────────────────────

type DayNote = { time: string; text: string; type: "coaching" | "medical" | "event" }

const DAY_NOTES: Record<string, DayNote[]> = {
  "2026-04-20": [
    { time: "09:00", text: "Board call", type: "event" },
    { time: "14:45", text: "Coaching call · Darcy", type: "coaching" },
  ],
  "2026-04-21": [
    { time: "08:00", text: "Strategy doc review", type: "coaching" },
  ],
  "2026-04-22": [
    { time: "08:30", text: "DEXA + VO₂max · West Clinic", type: "medical" },
    { time: "20:30", text: "Fast starts (prev night)", type: "medical" },
  ],
  "2026-04-24": [
    { time: "10:00", text: "DEXA review · Darcy", type: "coaching" },
  ],
  "2026-04-26": [],
}

const NOTE_COLORS: Record<DayNote["type"], string> = {
  coaching: "var(--ok)",
  medical:  "var(--warn)",
  event:    "var(--accent)",
}

// ─── Future weeks (placeholder data) ─────────────────────────────────────────

type WeekPlanDay = typeof DATA.weekPlan[number]

// Week Apr 27 – May 3 (all TBD)
const WEEK_NEXT: WeekPlanDay[] = [
  { date: "2026-04-27", dow: "Sun", isToday: false, workout: { type: "recovery", label: "Recovery walk", duration: 30, note: "Light walk — recovery from DEXA week." }, diet: { label: "High fibre", note: "" } },
  { date: "2026-04-28", dow: "Mon", isToday: false, workout: { type: "zone2", label: "Zone-2 run", duration: 55, note: "Return to full volume." }, diet: { label: "High fibre", note: "" } },
  { date: "2026-04-29", dow: "Tue", isToday: false, workout: null, diet: { label: "Normal", note: "" } },
  { date: "2026-04-30", dow: "Wed", isToday: false, workout: { type: "zone2", label: "Zone-2 bike", duration: 60, note: "Protocol review results in." }, diet: { label: "High fibre", note: "" } },
  { date: "2026-05-01", dow: "Thu", isToday: false, workout: { type: "zone2", label: "Zone-2 run", duration: 50, note: "" }, diet: { label: "Normal", note: "" } },
  { date: "2026-05-02", dow: "Fri", isToday: false, workout: { type: "mobility", label: "Mobility", duration: 30, note: "" }, diet: { label: "Normal", note: "" } },
  { date: "2026-05-03", dow: "Sat", isToday: false, workout: null, diet: { label: "Normal", note: "" } },
]

const NEXT_DAY_NOTES: Record<string, DayNote[]> = {
  "2026-04-29": [{ time: "10:00", text: "Quarterly protocol review · Darcy", type: "coaching" }],
  "2026-05-01": [{ time: "08:00", text: "Strategy doc locked", type: "coaching" }],
}

// ─── Week selector ────────────────────────────────────────────────────────────

const WEEKS = [
  { id: "current", label: "Apr 20–26", days: DATA.weekPlan, notes: DAY_NOTES },
  { id: "next",    label: "Apr 27–May 3", days: WEEK_NEXT, notes: NEXT_DAY_NOTES },
]

// ─── Component ────────────────────────────────────────────────────────────────

export default function CoachCalendarPage() {
  const [weekId, setWeekId] = useState("current")
  const [selectedDay, setSelectedDay] = useState<string | null>("2026-04-20")
  const [showDragHint, setShowDragHint] = useState(true)

  const week = WEEKS.find(w => w.id === weekId)!
  const selected = week.days.find(d => d.date === selectedDay) ?? null
  const selectedNotes = selectedDay ? (week.notes[selectedDay] ?? []) : []

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, padding: "24px 32px", maxWidth: 1300 }}>

      {/* Header */}
      <div style={{ borderBottom: "1px solid var(--hair)", paddingBottom: 16 }}>
        <div style={{ fontFamily: "var(--mono)", fontSize: 8.5, textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--ok)", marginBottom: 6 }}>
          Training calendar · Darcy O&apos;Sullivan
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <h1 style={{ fontFamily: "var(--serif)", fontSize: 26, fontWeight: 400, color: "var(--ink)", margin: 0, letterSpacing: "-0.02em" }}>
            Jamie Garis · weekly schedule
          </h1>
          <div style={{ display: "flex", gap: 8 }}>
            {WEEKS.map(w => (
              <button
                key={w.id}
                onClick={() => { setWeekId(w.id); setSelectedDay(null) }}
                style={{ fontFamily: "var(--mono)", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.08em", border: `1px solid ${weekId === w.id ? "var(--ok)" : "var(--hair-strong)"}`, padding: "6px 14px", color: weekId === w.id ? "var(--ok)" : "var(--ink-3)", background: weekId === w.id ? "color-mix(in srgb, var(--ok) 8%, transparent)" : "transparent", cursor: "pointer" }}
              >
                {w.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Drag hint */}
      {showDragHint && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", border: "1px solid var(--hair)", background: "var(--panel-2)", fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-3)" }}>
          <span>Drag-and-drop rescheduling is coming — this view shows the current committed plan synced with Jamie&apos;s calendar.</span>
          <button onClick={() => setShowDragHint(false)} style={{ color: "var(--ink-4)", background: "none", border: "none", cursor: "pointer", fontFamily: "var(--mono)", fontSize: 9 }}>Dismiss</button>
        </div>
      )}

      {/* Load bar summary */}
      <div className="panel">
        <div className="panel-head">
          <span>Weekly load · {week.label}</span>
          <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            {week.days.reduce((sum, d) => sum + loadScore(d.workout?.type, d.workout?.duration), 0)} load units · target ≤380
          </span>
        </div>
        <div style={{ padding: "12px 24px 16px", display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8 }}>
          {week.days.map(day => {
            const score = loadScore(day.workout?.type, day.workout?.duration)
            const pct = Math.min(100, (score / 100) * 100)
            const color = LOAD_COLOR(score)
            return (
              <div key={day.date} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <div style={{ fontFamily: "var(--mono)", fontSize: 8, color: "var(--ink-4)", textTransform: "uppercase" }}>{day.dow}</div>
                <div style={{ width: "100%", height: 40, background: "var(--panel-2)", position: "relative", display: "flex", alignItems: "flex-end" }}>
                  <div style={{ width: "100%", height: `${pct}%`, background: color, minHeight: score > 0 ? 3 : 0 }} />
                </div>
                <div style={{ fontFamily: "var(--mono)", fontSize: 8, color }}>
                  {score > 0 ? score : "—"}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Day Kanban grid */}
      <div className="panel">
        <div className="panel-head">
          <span>Day-by-day · {week.label}</span>
          <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Click a day to see detail</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
          {week.days.map((day, i) => {
            const isSelected = selectedDay === day.date
            const wColor = day.workout ? WORKOUT_COLORS[day.workout.type] : "var(--ink-4)"
            const notes = week.notes[day.date] ?? []
            const hasConflict = notes.some(n => n.type === "medical") && day.workout?.type === "test"

            return (
              <div
                key={day.date}
                onClick={() => setSelectedDay(isSelected ? null : day.date)}
                style={{
                  padding: "12px 10px",
                  borderRight: i < 6 ? "1px solid var(--hair)" : undefined,
                  borderLeft: day.isToday ? "2px solid var(--accent)" : isSelected ? "2px solid var(--ok)" : undefined,
                  background: isSelected ? "var(--panel-2)" : "transparent",
                  cursor: "pointer",
                  minHeight: 160,
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                }}
              >
                {/* Day header */}
                <div>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 8, color: "var(--ink-4)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{day.dow}</div>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 20, letterSpacing: "-0.02em", lineHeight: 1, color: day.isToday ? "var(--accent)" : "var(--ink)", marginTop: 2 }}>
                    {day.date.slice(8)}
                  </div>
                </div>

                {/* Workout card */}
                {day.workout ? (
                  <div style={{ padding: "4px 6px", borderLeft: `2px solid ${wColor}`, background: `color-mix(in srgb, ${wColor} 8%, transparent)` }}>
                    <div style={{ fontFamily: "var(--mono)", fontSize: 8, color: wColor, textTransform: "uppercase", letterSpacing: "0.05em", lineHeight: 1.3 }}>{day.workout.label}</div>
                    {day.workout.duration && <div style={{ fontFamily: "var(--mono)", fontSize: 7, color: "var(--ink-4)", marginTop: 1 }}>{day.workout.duration} min</div>}
                  </div>
                ) : (
                  <div style={{ padding: "4px 6px", borderLeft: "2px solid var(--hair-strong)" }}>
                    <div style={{ fontFamily: "var(--mono)", fontSize: 8, color: "var(--ink-4)", textTransform: "uppercase" }}>Rest</div>
                  </div>
                )}

                {/* Calendar notes */}
                {notes.map((note, ni) => (
                  <div key={ni} style={{ padding: "3px 6px", borderLeft: `2px solid ${NOTE_COLORS[note.type]}`, background: `color-mix(in srgb, ${NOTE_COLORS[note.type]} 6%, transparent)` }}>
                    <div style={{ fontFamily: "var(--mono)", fontSize: 7, color: "var(--ink-4)"  }}>{note.time}</div>
                    <div style={{ fontFamily: "var(--mono)", fontSize: 8, color: NOTE_COLORS[note.type], lineHeight: 1.3 }}>{note.text}</div>
                  </div>
                ))}

                {/* Conflict indicator */}
                {hasConflict && (
                  <div style={{ fontFamily: "var(--mono)", fontSize: 7, color: "var(--warn)", textTransform: "uppercase", letterSpacing: "0.08em" }}>⚠ High-load test day</div>
                )}
              </div>
            )
          })}
        </div>

        {/* Selected day detail */}
        {selected && (
          <div style={{ padding: "18px 24px", borderTop: "1px solid var(--hair)", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24 }}>
            {/* Workout */}
            <div>
              <div style={{ fontFamily: "var(--mono)", fontSize: 8, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>
                {selected.dow} {selected.date.slice(8)} · {selected.workout?.label ?? "Rest day"}
              </div>
              {selected.workout ? (
                <>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                    <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: WORKOUT_COLORS[selected.workout.type], border: `1px solid ${WORKOUT_COLORS[selected.workout.type]}`, padding: "2px 7px", textTransform: "uppercase" }}>{selected.workout.type}</span>
                    {selected.workout.duration && <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-3)" }}>{selected.workout.duration} min</span>}
                    <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: LOAD_COLOR(loadScore(selected.workout.type, selected.workout.duration)) }}>
                      Load: {loadScore(selected.workout.type, selected.workout.duration)}
                    </span>
                  </div>
                  <div style={{ fontSize: 12.5, color: "var(--ink-2)", lineHeight: 1.55 }}>{selected.workout.note}</div>
                </>
              ) : (
                <div style={{ fontSize: 12.5, color: "var(--ink-3)", fontStyle: "italic" }}>Rest or active recovery only.</div>
              )}
            </div>

            {/* Nutrition */}
            <div>
              <div style={{ fontFamily: "var(--mono)", fontSize: 8, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Nutrition · {selected.diet.label}</div>
              <div style={{ fontSize: 12.5, color: "var(--ink-2)", lineHeight: 1.55 }}>{selected.diet.note || "Standard protocol — high fibre, no refined carbs."}</div>
            </div>

            {/* Calendar events */}
            <div>
              <div style={{ fontFamily: "var(--mono)", fontSize: 8, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Calendar</div>
              {selectedNotes.length > 0 ? selectedNotes.map((note, i) => (
                <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6, alignItems: "baseline" }}>
                  <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-4)", flexShrink: 0 }}>{note.time}</span>
                  <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: NOTE_COLORS[note.type] }}>{note.text}</span>
                </div>
              )) : (
                <div style={{ fontSize: 12, color: "var(--ink-4)", fontStyle: "italic" }}>No scheduled events.</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Upcoming high-stakes days */}
      <div className="panel">
        <div className="panel-head">
          <span>High-stakes days ahead</span>
          <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Avoid scheduling extra load on these dates</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1, background: "var(--hair)" }}>
          {[
            { date: "22 Apr", label: "DEXA + VO₂max retest", type: "medical", note: "Fasting required. No training. High measurement load." },
            { date: "29 Apr", label: "Quarterly protocol review", type: "coaching", note: "60-min session with Darcy. Results interpretation and planning." },
            { date: "6 May",  label: "Full quarterly bloods", type: "medical", note: "ApoB, testosterone, HbA1c, Lp(a), ferritin. Fasting required." },
            { date: "12 May", label: "Cardiology consult", type: "medical", note: "Dr. Rao. ApoB discussion, possible statin review. No pre-test training." },
          ].map(item => (
            <div key={item.date} style={{ padding: "16px 18px", background: "var(--bg)" }}>
              <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: NOTE_COLORS[item.type as DayNote["type"]], textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>{item.date}</div>
              <div style={{ fontFamily: "var(--mono)", fontSize: 10.5, color: "var(--ink)", marginBottom: 6 }}>{item.label}</div>
              <div style={{ fontSize: 11.5, color: "var(--ink-3)", lineHeight: 1.55 }}>{item.note}</div>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
