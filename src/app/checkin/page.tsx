"use client"

import { useState } from "react"
import { DATA } from "@/data/james"
import { T } from "@/components/Primitives"

function bandColor(band: string): string {
  if (band === "hi") return T.ok
  if (band === "lo") return T.alert
  return T.warn
}

function MiniBar({ v, max = 10, color = T.accent }: { v: number; max?: number; color?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ flex: 1, height: 3, background: T.border, borderRadius: 2, position: "relative" }}>
        <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${(v / max) * 100}%`, background: color, borderRadius: 2 }} />
      </div>
      <span style={{ fontFamily: T.mono, fontSize: 11, color: T.ink2, width: 16, textAlign: "right" }}>{v}</span>
    </div>
  )
}

export default function CheckinPage() {
  const { lastNight, checkin, user } = DATA
  const [sliders, setSliders] = useState(checkin.today.sliders.map(s => s.val))
  const [tags, setTags] = useState<string[]>(checkin.today.tags.selected)
  const [note, setNote] = useState(checkin.today.note)
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const done = submitted || checkin.todayDone

  function toggleTag(t: string) {
    setTags(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])
  }

  const selected = selectedDay !== null ? checkin.daily[selectedDay] : null

  return (
    <div style={{ padding: "48px 48px 80px", maxWidth: 960, margin: "0 auto" }}>

      {/* Page headline */}
      <div style={{ marginBottom: 48 }}>
        <h1 style={{ fontFamily: T.serif, fontSize: 36, fontWeight: 300, color: T.ink, margin: "0 0 10px", letterSpacing: "-0.02em" }}>
          How are you today?
        </h1>
        <div style={{ fontFamily: T.sans, fontSize: 13, color: T.ink3 }}>
          {user.today} · {done ? "Check-in complete" : "A few questions to help Darcy understand your day"}
        </div>
      </div>

      {/* Streak + completion + last night */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20, marginBottom: 56 }}>

        {/* Streak */}
        <div style={{ background: T.surface, borderRadius: 12, padding: "20px 24px" }}>
          <div style={{ fontFamily: T.sans, fontSize: 12, color: T.ink3, marginBottom: 8 }}>Check-in streak</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 10 }}>
            <span style={{ fontFamily: T.mono, fontSize: 36, letterSpacing: "-0.04em", color: T.ok, lineHeight: 1 }}>{checkin.streak}</span>
            <span style={{ fontFamily: T.sans, fontSize: 12, color: T.ink3 }}>consecutive days</span>
          </div>
          <div style={{ display: "flex", gap: 3 }}>
            {Array.from({ length: Math.min(checkin.streak, 14) }).map((_, i) => (
              <div key={i} style={{ width: 10, height: 4, background: T.ok, borderRadius: 1, opacity: 0.3 + (i / 14) * 0.7 }} />
            ))}
          </div>
        </div>

        {/* Today's completion */}
        <div style={{
          background: T.surface, borderRadius: 12, padding: "20px 24px",
          borderLeft: `3px solid ${done ? T.ok : T.warn}`,
        }}>
          <div style={{ fontFamily: T.sans, fontSize: 12, color: T.ink3, marginBottom: 8 }}>Today · {user.today}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: done ? T.ok : T.warn, flexShrink: 0 }} />
            <span style={{ fontFamily: T.sans, fontSize: 13, fontWeight: 500, color: done ? T.ok : T.warn }}>
              {done ? "Submitted" : "Not yet submitted"}
            </span>
          </div>
          <div style={{ fontFamily: T.sans, fontSize: 12, color: T.ink3 }}>
            {done ? "Darcy has been notified." : "Complete the form below to log today."}
          </div>
        </div>

        {/* Last night */}
        <div style={{ background: T.surface, borderRadius: 12, padding: "20px 24px" }}>
          <div style={{ fontFamily: T.sans, fontSize: 12, color: T.ink3, marginBottom: 8 }}>Last night</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 4 }}>
            <span style={{ fontFamily: T.mono, fontSize: 28, letterSpacing: "-0.03em", lineHeight: 1, color: lastNight.sleepScore >= 75 ? T.ok : lastNight.sleepScore >= 55 ? T.warn : T.alert }}>
              {lastNight.sleepScore}
            </span>
            <span style={{ fontFamily: T.sans, fontSize: 12, color: T.ink3 }}>/100 · {lastNight.band}</span>
          </div>
          <div style={{ fontFamily: T.sans, fontSize: 12, color: T.ink3 }}>
            {lastNight.total} · HRV {lastNight.hrvOvernight} ms · {lastNight.bedtime}–{lastNight.wake}
          </div>
        </div>
      </div>

      {/* 30-day pattern */}
      <div style={{ background: T.surface, borderRadius: 12, padding: "24px 28px", marginBottom: 56 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 16 }}>
          <div style={{ fontFamily: T.sans, fontSize: 14, fontWeight: 500, color: T.ink }}>
            30-day pattern
            <span style={{ fontFamily: T.sans, fontSize: 12, color: T.ink3, marginLeft: 10, fontWeight: 400 }}>Click any day to explore</span>
          </div>
          <div style={{ display: "flex", gap: 14 }}>
            {[["hi", T.ok, "Good"], ["md", T.warn, "Moderate"], ["lo", T.alert, "Low"]].map(([k, col, lbl]) => (
              <div key={k} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: col as string }} />
                <span style={{ fontFamily: T.sans, fontSize: 12, color: T.ink3 }}>{lbl}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Strip */}
        <div style={{ position: "relative", height: 56, marginBottom: selectedDay !== null ? 16 : 0 }}>
          <div style={{ display: "flex", gap: 3, position: "absolute", top: 20, left: 0, right: 0 }}>
            {checkin.qualStrip.map((band, i) => {
              const isSelected = selectedDay === i
              return (
                <div
                  key={i}
                  onClick={() => setSelectedDay(isSelected ? null : i)}
                  style={{
                    flex: 1, height: 28, borderRadius: 3,
                    background: bandColor(band),
                    opacity: isSelected ? 1 : 0.55,
                    cursor: "pointer",
                    outline: isSelected ? `2px solid ${T.ink}` : "none",
                    outlineOffset: 1,
                    transition: "opacity 0.1s",
                  }}
                />
              )
            })}
          </div>

          {checkin.regimeChanges.map(rc => {
            const pct = (rc.dayIndex / 29) * 100
            return (
              <div
                key={rc.dayIndex}
                style={{
                  position: "absolute", left: `${pct}%`, top: 0,
                  transform: "translateX(-50%)",
                  display: "flex", flexDirection: "column", alignItems: "center",
                  pointerEvents: "none",
                }}
              >
                <div style={{ fontFamily: T.sans, fontSize: 10, color: rc.color, whiteSpace: "nowrap", marginBottom: 2 }}>
                  {rc.label}
                </div>
                <div style={{ width: 1, height: 48, background: rc.color, opacity: 0.5 }} />
              </div>
            )
          })}
        </div>

        {/* Drill-down drawer */}
        {selected && (
          <div style={{ borderTop: `1px solid ${T.border}`, marginTop: 4, paddingTop: 16, display: "grid", gridTemplateColumns: "120px 1fr auto", gap: 20, alignItems: "start" }}>
            <div>
              <div style={{ fontFamily: T.sans, fontSize: 13, fontWeight: 500, color: T.ink, marginBottom: 2 }}>{selected.date}</div>
              <div style={{ fontFamily: T.sans, fontSize: 11, color: T.ink3, marginBottom: 12 }}>{selected.dow}</div>
              <MiniBar v={selected.sleep} color={T.ok} />
              <div style={{ fontFamily: T.sans, fontSize: 11, color: T.ink3, marginBottom: 6 }}>Sleep</div>
              <MiniBar v={selected.mood} color={T.accent} />
              <div style={{ fontFamily: T.sans, fontSize: 11, color: T.ink3, marginBottom: 6 }}>Mood</div>
              <MiniBar v={selected.load} color={T.alert} />
              <div style={{ fontFamily: T.sans, fontSize: 11, color: T.ink3 }}>Load</div>
            </div>
            <div>
              {selected.note ? (
                <p style={{ fontFamily: T.serif, fontSize: 15, fontStyle: "italic", lineHeight: 1.65, color: T.ink2, margin: "0 0 12px" }}>
                  &ldquo;{selected.note}&rdquo;
                </p>
              ) : (
                <p style={{ fontFamily: T.sans, fontSize: 12, color: T.ink3 }}>No note</p>
              )}
              {selected.tags.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {selected.tags.map(t => (
                    <span key={t} style={{
                      fontFamily: T.sans, fontSize: 11, padding: "3px 10px",
                      border: `1px solid ${T.borderMed}`, borderRadius: 20,
                      color: T.ink3,
                    }}>{t}</span>
                  ))}
                </div>
              )}
              {checkin.regimeChanges.filter(rc => rc.dayIndex === selectedDay).map(rc => (
                <div key={rc.dayIndex} style={{ marginTop: 10, padding: "8px 12px", borderLeft: `2px solid ${rc.color}`, borderRadius: 4, fontFamily: T.sans, fontSize: 11, color: rc.color }}>
                  {rc.label} · protocol change
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8, height: 28, alignItems: "center" }}>
              <div style={{ width: 8, height: "100%", background: bandColor(selected.band), borderRadius: 2 }} />
              <span style={{ fontFamily: T.sans, fontSize: 11, color: T.ink3 }}>{selected.band === "hi" ? "Good" : selected.band === "lo" ? "Low" : "Moderate"}</span>
            </div>
          </div>
        )}
      </div>

      {/* Last night detail */}
      <div style={{ background: T.surface, borderRadius: 12, padding: "24px 28px", marginBottom: 56 }}>
        <div style={{ fontFamily: T.sans, fontSize: 14, fontWeight: 500, color: T.ink, marginBottom: 20 }}>
          Last night · {lastNight.bedtime} – {lastNight.wake}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          {[
            { l: "Total",          v: lastNight.total },
            { l: "Deep",           v: lastNight.deep },
            { l: "REM",            v: lastNight.rem },
            { l: "Efficiency",     v: `${lastNight.efficiency}%` },
            { l: "HRV overnight",  v: `${lastNight.hrvOvernight} ms` },
            { l: "Resting HR",     v: `${lastNight.rhrOvernight} bpm` },
            { l: "Skin temp Δ",    v: lastNight.skinTempDelta },
            { l: "Resp. rate",     v: `${lastNight.respRate} /min` },
          ].map(({ l, v }) => (
            <div key={l} style={{ background: T.surfaceRaised, borderRadius: 8, padding: "12px 14px" }}>
              <div style={{ fontFamily: T.sans, fontSize: 11, color: T.ink3, marginBottom: 4 }}>{l}</div>
              <div style={{ fontFamily: T.mono, fontSize: 16, color: T.ink }}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Check-in form */}
      {!done ? (
        <>
          {/* Sliders */}
          <div style={{ background: T.surface, borderRadius: 12, padding: "24px 28px", marginBottom: 24 }}>
            <div style={{ fontFamily: T.sans, fontSize: 14, fontWeight: 500, color: T.ink, marginBottom: 24 }}>
              Morning check-in · {user.today}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
              {checkin.today.sliders.map((s, i) => (
                <div key={i}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
                    <span style={{ fontFamily: T.serif, fontSize: 16, fontStyle: "italic", fontWeight: 300, color: T.ink }}>{s.q}</span>
                    <span style={{ fontFamily: T.mono, fontSize: 20, letterSpacing: "-0.02em", color: T.ink, fontWeight: 300 }}>{sliders[i]}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <span style={{ fontFamily: T.sans, fontSize: 11, color: T.ink3, width: 56, flexShrink: 0 }}>{s.left}</span>
                    <input
                      type="range" min={s.min} max={s.max} value={sliders[i]}
                      onChange={e => setSliders(prev => { const n = [...prev]; n[i] = +e.target.value; return n })}
                      style={{ flex: 1, accentColor: T.accent }}
                    />
                    <span style={{ fontFamily: T.sans, fontSize: 11, color: T.ink3, width: 56, flexShrink: 0, textAlign: "right" }}>{s.right}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div style={{ background: T.surface, borderRadius: 12, padding: "24px 28px", marginBottom: 24 }}>
            <div style={{ fontFamily: T.sans, fontSize: 14, fontWeight: 500, color: T.ink, marginBottom: 16 }}>How would you label this morning?</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {checkin.today.tags.all.map(t => {
                const active = tags.includes(t)
                return (
                  <button key={t} onClick={() => toggleTag(t)} style={{
                    fontFamily: T.sans, fontSize: 12, padding: "6px 14px",
                    border: `1px solid ${active ? T.ink : T.borderMed}`,
                    borderRadius: 20,
                    background: active ? T.ink : "transparent",
                    color: active ? T.bg : T.ink2,
                    cursor: "pointer",
                    transition: "all 0.1s",
                  }}>
                    {t}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Note */}
          <div style={{ background: T.surface, borderRadius: 12, padding: "24px 28px", marginBottom: 24 }}>
            <div style={{ fontFamily: T.sans, fontSize: 14, fontWeight: 500, color: T.ink, marginBottom: 14 }}>Morning note</div>
            <textarea
              value={note} onChange={e => setNote(e.target.value)} rows={4}
              style={{
                width: "100%", background: T.surfaceRaised,
                border: `1px solid ${T.border}`, borderRadius: 8,
                color: T.ink, fontFamily: T.serif, fontSize: 15,
                lineHeight: 1.65, padding: "14px 16px",
                resize: "vertical", fontStyle: "italic",
                boxSizing: "border-box",
              }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14 }}>
              <span style={{ fontFamily: T.sans, fontSize: 12, color: T.ink3 }}>
                Visible to Darcy after submission
              </span>
              <button
                onClick={() => setSubmitted(true)}
                style={{
                  fontFamily: T.sans, fontSize: 13, fontWeight: 500,
                  border: "none", borderRadius: 8,
                  padding: "10px 24px", background: T.ink, color: T.bg, cursor: "pointer",
                }}
              >
                Submit check-in
              </button>
            </div>
          </div>
        </>
      ) : (
        <div style={{ background: T.surface, borderRadius: 12, padding: "36px 28px", textAlign: "center", marginBottom: 24 }}>
          <div style={{ width: 14, height: 14, borderRadius: "50%", background: T.ok, margin: "0 auto 14px" }} />
          <div style={{ fontFamily: T.sans, fontSize: 14, fontWeight: 500, color: T.ok, marginBottom: 8 }}>Check-in submitted · {user.today}</div>
          <div style={{ fontFamily: T.serif, fontSize: 15, color: T.ink3, fontStyle: "italic" }}>Darcy has been notified. Streak: {checkin.streak + 1} days.</div>
        </div>
      )}

      {/* Recent history */}
      <div style={{ background: T.surface, borderRadius: 12, overflow: "hidden" }}>
        <div style={{ padding: "20px 28px", borderBottom: `1px solid ${T.border}` }}>
          <span style={{ fontFamily: T.sans, fontSize: 14, fontWeight: 500, color: T.ink }}>Recent history</span>
        </div>
        {checkin.history.map((h, i) => (
          <div key={i} style={{ padding: "20px 28px", borderTop: i > 0 ? `1px solid ${T.border}` : undefined }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
              <span style={{ fontFamily: T.sans, fontSize: 13, fontWeight: 500, color: T.ink2 }}>{h.when}</span>
              <div style={{ display: "flex", gap: 16 }}>
                {h.metrics.map(([label, val]) => (
                  <span key={label} style={{ fontFamily: T.sans, fontSize: 12, color: T.ink3 }}>
                    {label} <span style={{ fontFamily: T.mono, fontSize: 12, color: T.ink }}>{val}</span>
                  </span>
                ))}
              </div>
            </div>
            <p style={{ fontFamily: T.serif, fontSize: 15, fontStyle: "italic", lineHeight: 1.65, color: T.ink2, margin: "0 0 10px" }}>&ldquo;{h.quote}&rdquo;</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {h.tags.map(t => (
                <span key={t} style={{
                  fontFamily: T.sans, fontSize: 11, padding: "3px 10px",
                  border: `1px solid ${T.border}`, borderRadius: 20, color: T.ink3,
                }}>{t}</span>
              ))}
            </div>
          </div>
        ))}
      </div>

    </div>
  )
}
