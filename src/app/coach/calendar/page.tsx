"use client"

import { useState, useRef, useEffect } from "react"
import { DATA } from "@/data/james"
import { T } from "@/components/Primitives"

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
  score === 0  ? T.border
  : score < 30 ? T.ok
  : score < 60 ? `color-mix(in srgb, ${T.ok} 50%, ${T.warn})`
  : score < 80 ? T.warn
  : T.alert

const WORKOUT_COLORS: Record<string, string> = {
  zone2: T.ok, test: T.warn, mobility: T.accent, recovery: "#9B8FA9", rest: T.ink3,
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
  coaching: T.ok,
  medical:  T.warn,
  event:    T.accent,
}

// ─── Future weeks (placeholder data) ─────────────────────────────────────────

type WeekPlanDay = typeof DATA.weekPlan[number]

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

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ message, onDone }: { message: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3200)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <div style={{
      position: "fixed",
      bottom: 32,
      left: "50%",
      transform: "translateX(-50%)",
      zIndex: 9999,
      background: T.ink,
      color: T.bg,
      fontFamily: T.sans,
      fontSize: 13,
      fontWeight: 500,
      padding: "12px 24px",
      borderRadius: 8,
      pointerEvents: "none",
      boxShadow: "0 4px 24px rgba(0,0,0,0.18)",
    }}>
      {message}
    </div>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CoachCalendarPage() {
  const [weekId, setWeekId] = useState("current")
  const [selectedDay, setSelectedDay] = useState<string | null>("2026-04-20")

  // Per-week drag state
  const [weekDays, setWeekDays] = useState<WeekPlanDay[]>(() =>
    WEEKS[0].days.map(d => ({ ...d }))
  )
  const [originalDays] = useState<WeekPlanDay[]>(() =>
    WEEKS[0].days.map(d => ({ ...d }))
  )
  const [nextWeekDays, setNextWeekDays] = useState<WeekPlanDay[]>(() =>
    WEEK_NEXT.map(d => ({ ...d }))
  )
  const [nextOriginalDays] = useState<WeekPlanDay[]>(() =>
    WEEK_NEXT.map(d => ({ ...d }))
  )

  const [isPending, setIsPending] = useState(false)
  const [isNextPending, setIsNextPending] = useState(false)

  const [dragOver, setDragOver] = useState<string | null>(null)
  const dragRef = useRef<string | null>(null)

  const [toast, setToast] = useState<string | null>(null)

  const week = WEEKS.find(w => w.id === weekId)!

  const activeDays     = weekId === "current" ? weekDays     : nextWeekDays
  const setActiveDays  = weekId === "current" ? setWeekDays  : setNextWeekDays
  const activePending  = weekId === "current" ? isPending    : isNextPending
  const setActivePending = weekId === "current" ? setIsPending : setIsNextPending
  const activeOriginal = weekId === "current" ? originalDays : nextOriginalDays

  const selected      = activeDays.find(d => d.date === selectedDay) ?? null
  const selectedNotes = selectedDay ? (week.notes[selectedDay] ?? []) : []

  // Drag handlers
  function handleDragStart(date: string) {
    dragRef.current = date
  }

  function handleDragOver(e: React.DragEvent, date: string) {
    e.preventDefault()
    setDragOver(date)
  }

  function handleDragLeave() {
    setDragOver(null)
  }

  function handleDrop(targetDate: string) {
    const src = dragRef.current
    if (!src || src === targetDate) {
      setDragOver(null)
      return
    }
    setActiveDays(days => {
      const next = days.map(d => ({ ...d }))
      const si = next.findIndex(d => d.date === src)
      const ti = next.findIndex(d => d.date === targetDate)
      if (si === -1 || ti === -1) return days
      const tmp = next[si].workout
      next[si] = { ...next[si], workout: next[ti].workout }
      next[ti] = { ...next[ti], workout: tmp }
      return next
    })
    setActivePending(true)
    dragRef.current = null
    setDragOver(null)
  }

  function handleDragEnd() {
    dragRef.current = null
    setDragOver(null)
  }

  function handleReset() {
    setActiveDays(activeOriginal.map(d => ({ ...d })))
    setActivePending(false)
  }

  function handleCommit() {
    setActivePending(false)
    setToast("Schedule updated · syncing with Jamie's calendar")
  }

  const loadBarDays = activeDays

  return (
    <div style={{ padding: "48px 48px 80px", maxWidth: 1200, margin: "0 auto", display: "flex", flexDirection: "column", gap: 56 }}>

      {toast && <Toast message={toast} onDone={() => setToast(null)} />}

      {/* Header */}
      <div>
        <div style={{ fontFamily: T.sans, fontSize: 12, color: T.ok, marginBottom: 8, fontWeight: 500 }}>
          Training calendar · Darcy O&apos;Sullivan
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <h1 style={{ fontFamily: T.serif, fontSize: 28, fontWeight: 400, color: T.ink, margin: 0, letterSpacing: "-0.02em" }}>
            Jamie Garis · weekly schedule
          </h1>
          <div style={{ display: "flex", gap: 8 }}>
            {WEEKS.map(w => (
              <button
                key={w.id}
                onClick={() => { setWeekId(w.id); setSelectedDay(null) }}
                style={{
                  fontFamily: T.sans, fontSize: 13, border: `1px solid ${weekId === w.id ? T.ok : T.borderMed}`,
                  padding: "7px 16px", color: weekId === w.id ? T.ok : T.ink3,
                  background: weekId === w.id ? T.okSubtle : "transparent",
                  cursor: "pointer", borderRadius: 8, fontWeight: weekId === w.id ? 600 : 400,
                }}
              >
                {w.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Load bar summary */}
      <div style={{ background: T.surface, borderRadius: 12 }}>
        <div style={{ padding: "16px 24px", borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontFamily: T.sans, fontSize: 14, fontWeight: 600, color: T.ink }}>Weekly load · {week.label}</span>
          <span style={{ fontFamily: T.sans, fontSize: 12, color: T.ink3 }}>
            {loadBarDays.reduce((sum, d) => sum + loadScore(d.workout?.type, d.workout?.duration), 0)} load units · target ≤380
          </span>
        </div>
        <div style={{ padding: "14px 24px 18px", display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8 }}>
          {loadBarDays.map(day => {
            const score = loadScore(day.workout?.type, day.workout?.duration)
            const pct = Math.min(100, (score / 100) * 100)
            const color = LOAD_COLOR(score)
            return (
              <div key={day.date} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <div style={{ fontFamily: T.sans, fontSize: 11, color: T.ink4 }}>{day.dow}</div>
                <div style={{ width: "100%", height: 40, background: T.surfaceRaised, position: "relative", display: "flex", alignItems: "flex-end", borderRadius: 4 }}>
                  <div style={{ width: "100%", height: `${pct}%`, background: color, minHeight: score > 0 ? 3 : 0, borderRadius: 4 }} />
                </div>
                <div style={{ fontFamily: T.mono, fontSize: 11, color, fontWeight: 300 }}>
                  {score > 0 ? score : "—"}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Day Kanban grid */}
      <div style={{ background: T.surface, borderRadius: 12 }}>
        <div style={{ padding: "16px 24px", borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontFamily: T.sans, fontSize: 14, fontWeight: 600, color: T.ink }}>Day-by-day · {week.label}</span>
          <span style={{ fontFamily: T.sans, fontSize: 12, color: T.ink3 }}>Drag workouts to reschedule · click a day to see detail</span>
        </div>

        {/* Changes pending notice */}
        {activePending && (
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 24px",
            borderBottom: `1px solid ${T.border}`,
            background: T.warnSubtle,
          }}>
            <span style={{ fontFamily: T.sans, fontSize: 13, color: T.warn, fontWeight: 500 }}>
              Changes pending — schedule has been rearranged
            </span>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={handleReset}
                style={{ fontFamily: T.sans, fontSize: 13, border: `1px solid ${T.borderMed}`, padding: "6px 16px", color: T.ink3, background: "transparent", cursor: "pointer", borderRadius: 8 }}
              >
                Reset
              </button>
              <button
                onClick={handleCommit}
                style={{ fontFamily: T.sans, fontSize: 13, fontWeight: 600, border: `1px solid ${T.ok}`, padding: "6px 16px", color: T.ok, background: T.okSubtle, cursor: "pointer", borderRadius: 8 }}
              >
                Commit changes
              </button>
            </div>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
          {activeDays.map((day, i) => {
            const isSelected  = selectedDay === day.date
            const isDragOver  = dragOver === day.date
            const wColor      = day.workout ? WORKOUT_COLORS[day.workout.type] ?? T.ink4 : T.ink4
            const notes       = week.notes[day.date] ?? []
            const hasConflict = notes.some(n => n.type === "medical") && day.workout?.type === "test"

            return (
              <div
                key={day.date}
                onClick={() => setSelectedDay(isSelected ? null : day.date)}
                onDragOver={e => handleDragOver(e, day.date)}
                onDragLeave={handleDragLeave}
                onDrop={() => handleDrop(day.date)}
                style={{
                  padding: "14px 12px",
                  borderRight: i < 6 ? `1px solid ${T.border}` : undefined,
                  borderLeft: day.isToday
                    ? `3px solid ${T.accent}`
                    : isSelected
                    ? `3px solid ${T.ok}`
                    : "3px solid transparent",
                  background: isDragOver
                    ? T.okSubtle
                    : isSelected
                    ? T.surfaceRaised
                    : day.isToday
                    ? T.warnSubtle
                    : "transparent",
                  outline: isDragOver ? `1.5px dashed ${T.ok}` : undefined,
                  outlineOffset: isDragOver ? "-2px" : undefined,
                  cursor: "pointer",
                  minHeight: 220,
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                {/* Day header */}
                <div>
                  <div style={{ fontFamily: T.sans, fontSize: 11, color: T.ink4 }}>{day.dow}</div>
                  <div style={{ fontFamily: T.mono, fontSize: 20, letterSpacing: "-0.02em", lineHeight: 1, color: day.isToday ? T.accent : T.ink, marginTop: 2, fontWeight: 300 }}>
                    {day.date.slice(8)}
                  </div>
                </div>

                {/* Workout card — draggable */}
                {day.workout ? (
                  <div
                    draggable
                    onDragStart={() => handleDragStart(day.date)}
                    onDragEnd={handleDragEnd}
                    onClick={e => e.stopPropagation()}
                    style={{
                      padding: "10px 10px",
                      borderLeft: `3px solid ${wColor}`,
                      background: `color-mix(in srgb, ${wColor} 10%, transparent)`,
                      cursor: "grab",
                      opacity: dragRef.current === day.date ? 0.4 : 1,
                      userSelect: "none",
                      borderRadius: 6,
                    }}
                  >
                    <div style={{ fontFamily: T.sans, fontSize: 12, color: wColor, fontWeight: 500, lineHeight: 1.4 }}>{day.workout.label}</div>
                    {day.workout.duration != null && (
                      <div style={{ fontFamily: T.mono, fontSize: 11, color: T.ink3, marginTop: 3, fontWeight: 300 }}>{day.workout.duration} min</div>
                    )}
                    {day.workout.note && (
                      <div style={{ fontFamily: T.sans, fontSize: 11, color: T.ink3, lineHeight: 1.5, marginTop: 5 }}>{day.workout.note}</div>
                    )}
                  </div>
                ) : (
                  <div
                    draggable={false}
                    style={{ padding: "10px 10px", borderLeft: `2px dashed ${T.borderMed}`, minHeight: 52, display: "flex", alignItems: "center", borderRadius: 6 }}
                  >
                    <div style={{ fontFamily: T.sans, fontSize: 12, color: T.ink4 }}>Rest</div>
                  </div>
                )}

                {/* Calendar notes */}
                {notes.map((note, ni) => (
                  <div key={ni} style={{ padding: "5px 8px", borderLeft: `2px solid ${NOTE_COLORS[note.type]}`, background: `color-mix(in srgb, ${NOTE_COLORS[note.type]} 6%, transparent)`, borderRadius: 4 }}>
                    <div style={{ fontFamily: T.mono, fontSize: 10, color: T.ink4, fontWeight: 300 }}>{note.time}</div>
                    <div style={{ fontFamily: T.sans, fontSize: 11, color: NOTE_COLORS[note.type], lineHeight: 1.35, fontWeight: 500 }}>{note.text}</div>
                  </div>
                ))}

                {/* Conflict indicator */}
                {hasConflict && (
                  <div style={{ fontFamily: T.sans, fontSize: 11, color: T.warn, fontWeight: 500 }}>⚠ High-load test day</div>
                )}
              </div>
            )
          })}
        </div>

        {/* Selected day detail */}
        {selected && (
          <div style={{ padding: "20px 24px", borderTop: `1px solid ${T.border}`, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24 }}>
            {/* Workout */}
            <div>
              <div style={{ fontFamily: T.sans, fontSize: 12, color: T.ink3, marginBottom: 10, fontWeight: 500 }}>
                {selected.dow} {selected.date.slice(8)} · {selected.workout?.label ?? "Rest day"}
              </div>
              {selected.workout ? (
                <>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
                    <span style={{ fontFamily: T.sans, fontSize: 12, color: WORKOUT_COLORS[selected.workout.type], border: `1px solid ${WORKOUT_COLORS[selected.workout.type]}`, padding: "3px 8px", borderRadius: 6, fontWeight: 500 }}>{selected.workout.type}</span>
                    {selected.workout.duration != null && <span style={{ fontFamily: T.mono, fontSize: 12, color: T.ink3, fontWeight: 300 }}>{selected.workout.duration} min</span>}
                    <span style={{ fontFamily: T.mono, fontSize: 12, color: LOAD_COLOR(loadScore(selected.workout.type, selected.workout.duration)), fontWeight: 300 }}>
                      Load: {loadScore(selected.workout.type, selected.workout.duration)}
                    </span>
                  </div>
                  <div style={{ fontFamily: T.sans, fontSize: 13, color: T.ink2, lineHeight: 1.55 }}>{selected.workout.note}</div>
                </>
              ) : (
                <div style={{ fontFamily: T.serif, fontSize: 13, color: T.ink3, fontStyle: "italic" }}>Rest or active recovery only.</div>
              )}
            </div>

            {/* Nutrition */}
            <div>
              <div style={{ fontFamily: T.sans, fontSize: 12, color: T.ink3, marginBottom: 10, fontWeight: 500 }}>Nutrition · {selected.diet.label}</div>
              <div style={{ fontFamily: T.sans, fontSize: 13, color: T.ink2, lineHeight: 1.55 }}>{selected.diet.note || "Standard protocol — high fibre, no refined carbs."}</div>
            </div>

            {/* Calendar events */}
            <div>
              <div style={{ fontFamily: T.sans, fontSize: 12, color: T.ink3, marginBottom: 10, fontWeight: 500 }}>Calendar</div>
              {selectedNotes.length > 0 ? selectedNotes.map((note, i) => (
                <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6, alignItems: "baseline" }}>
                  <span style={{ fontFamily: T.mono, fontSize: 11, color: T.ink4, flexShrink: 0, fontWeight: 300 }}>{note.time}</span>
                  <span style={{ fontFamily: T.sans, fontSize: 13, color: NOTE_COLORS[note.type], fontWeight: 500 }}>{note.text}</span>
                </div>
              )) : (
                <div style={{ fontFamily: T.serif, fontSize: 13, color: T.ink4, fontStyle: "italic" }}>No scheduled events.</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Upcoming high-stakes days */}
      <div style={{ background: T.surface, borderRadius: 12 }}>
        <div style={{ padding: "16px 24px", borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontFamily: T.sans, fontSize: 14, fontWeight: 600, color: T.ink }}>High-stakes days ahead</span>
          <span style={{ fontFamily: T.sans, fontSize: 12, color: T.ink3 }}>Avoid scheduling extra load on these dates</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1, background: T.border }}>
          {[
            { date: "22 Apr", label: "DEXA + VO₂max retest", type: "medical", note: "Fasting required. No training. High measurement load." },
            { date: "29 Apr", label: "Quarterly protocol review", type: "coaching", note: "60-min session with Darcy. Results interpretation and planning." },
            { date: "6 May",  label: "Full quarterly bloods", type: "medical", note: "ApoB, testosterone, HbA1c, Lp(a), ferritin. Fasting required." },
            { date: "12 May", label: "Cardiology consult", type: "medical", note: "Dr. Rao. ApoB discussion, possible statin review. No pre-test training." },
          ].map(item => (
            <div key={item.date} style={{ padding: "18px 20px", background: T.surface }}>
              <div style={{ fontFamily: T.mono, fontSize: 13, color: NOTE_COLORS[item.type as DayNote["type"]], marginBottom: 6, fontWeight: 300 }}>{item.date}</div>
              <div style={{ fontFamily: T.sans, fontSize: 14, fontWeight: 500, color: T.ink, marginBottom: 8 }}>{item.label}</div>
              <div style={{ fontFamily: T.sans, fontSize: 13, color: T.ink3, lineHeight: 1.55 }}>{item.note}</div>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
