"use client"

import { useState } from "react"
import { DATA } from "@/data/james"

function bandColor(band: string) {
  if (band === "hi") return "var(--ok)"
  if (band === "lo") return "var(--alert)"
  return "var(--warn)"
}

function MiniBar({ v, max = 10, color = "var(--accent)" }: { v: number; max?: number; color?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div style={{ flex: 1, height: 3, background: "var(--hair-strong)", position: "relative" }}>
        <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${(v / max) * 100}%`, background: color }} />
      </div>
      <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-2)", width: 14, textAlign: "right" }}>{v}</span>
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
    <div style={{ display: "flex", flexDirection: "column", gap: 20, padding: "24px 32px", maxWidth: 960 }}>

      {/* ── Streak + completion status ──────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
        {/* Streak */}
        <div className="panel" style={{ padding: "16px 20px" }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--ink-3)" }}>Check-in streak</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 6 }}>
            <span style={{ fontFamily: "var(--mono)", fontSize: 32, letterSpacing: "-0.04em", color: "var(--ok)", lineHeight: 1 }}>{checkin.streak}</span>
            <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>consecutive days</span>
          </div>
          <div style={{ display: "flex", gap: 3, marginTop: 10 }}>
            {Array.from({ length: Math.min(checkin.streak, 14) }).map((_, i) => (
              <div key={i} style={{ width: 10, height: 4, background: "var(--ok)", opacity: 0.4 + (i / 14) * 0.6 }} />
            ))}
          </div>
        </div>

        {/* Today's completion */}
        <div className="panel" style={{ padding: "16px 20px", borderLeft: `3px solid ${done ? "var(--ok)" : "var(--warn)"}` }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--ink-3)" }}>Today · {user.today}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: done ? "var(--ok)" : "var(--warn)", flexShrink: 0 }} />
            <span style={{ fontFamily: "var(--mono)", fontSize: 12, color: done ? "var(--ok)" : "var(--warn)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              {done ? "Submitted" : "Not yet submitted"}
            </span>
          </div>
          <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-3)", marginTop: 6 }}>
            {done ? "Darcy has been notified." : "Complete the form below to log today."}
          </div>
        </div>

        {/* Last night summary */}
        <div className="panel" style={{ padding: "16px 20px" }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--ink-3)" }}>Last night</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginTop: 6 }}>
            <span style={{ fontFamily: "var(--mono)", fontSize: 22, letterSpacing: "-0.03em", color: lastNight.sleepScore >= 75 ? "var(--ok)" : lastNight.sleepScore >= 55 ? "var(--warn)" : "var(--alert)", lineHeight: 1 }}>
              {lastNight.sleepScore}
            </span>
            <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-3)" }}>/100 · {lastNight.band}</span>
          </div>
          <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-3)", marginTop: 6 }}>
            {lastNight.total} · HRV {lastNight.hrvOvernight} ms · {lastNight.bedtime}–{lastNight.wake}
          </div>
        </div>
      </div>

      {/* ── 30-day pattern with drill-down ──────────────────────────────── */}
      <div className="panel" style={{ padding: "16px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--ink-2)" }}>
            30-day pattern
            <span style={{ color: "var(--ink-3)", marginLeft: 10, fontSize: 9 }}>Click any day to drill in</span>
          </div>
          <div style={{ display: "flex", gap: 14 }}>
            {[["hi", "var(--ok)", "Good"], ["md", "var(--warn)", "Moderate"], ["lo", "var(--alert)", "Low"]].map(([k, col, lbl]) => (
              <div key={k} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div style={{ width: 8, height: 8, background: col as string }} />
                <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{lbl}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Strip with regime change markers */}
        <div style={{ position: "relative", height: 56, marginBottom: selectedDay !== null ? 16 : 0 }}>
          {/* Day bars */}
          <div style={{ display: "flex", gap: 3, position: "absolute", top: 20, left: 0, right: 0 }}>
            {checkin.qualStrip.map((band, i) => {
              const isSelected = selectedDay === i
              return (
                <div
                  key={i}
                  onClick={() => setSelectedDay(isSelected ? null : i)}
                  style={{
                    flex: 1,
                    height: 28,
                    background: bandColor(band),
                    opacity: isSelected ? 1 : 0.65,
                    cursor: "pointer",
                    outline: isSelected ? "2px solid var(--ink)" : "none",
                    outlineOffset: 1,
                    transition: "opacity 0.1s",
                  }}
                />
              )
            })}
          </div>

          {/* Regime change markers */}
          {checkin.regimeChanges.map(rc => {
            const pct = (rc.dayIndex / 29) * 100
            return (
              <div
                key={rc.dayIndex}
                style={{
                  position: "absolute",
                  left: `${pct}%`,
                  top: 0,
                  transform: "translateX(-50%)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  pointerEvents: "none",
                }}
              >
                <div style={{ fontFamily: "var(--mono)", fontSize: 7, textTransform: "uppercase", letterSpacing: "0.06em", color: rc.color, whiteSpace: "nowrap", marginBottom: 2 }}>
                  {rc.label}
                </div>
                <div style={{ width: 1, height: 48, background: rc.color, opacity: 0.5 }} />
              </div>
            )
          })}
        </div>

        {/* Drill-down drawer */}
        {selected && (
          <div style={{ borderTop: "1px solid var(--hair)", marginTop: 4, paddingTop: 14, display: "grid", gridTemplateColumns: "120px 1fr auto", gap: 20, alignItems: "start" }}>
            <div>
              <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{selected.date}</div>
              <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>{selected.dow}</div>
              <MiniBar v={selected.sleep} color="var(--ok)" />
              <div style={{ fontFamily: "var(--mono)", fontSize: 8, color: "var(--ink-3)", textTransform: "uppercase", marginBottom: 4 }}>Sleep</div>
              <MiniBar v={selected.mood} color="var(--accent)" />
              <div style={{ fontFamily: "var(--mono)", fontSize: 8, color: "var(--ink-3)", textTransform: "uppercase", marginBottom: 4 }}>Mood</div>
              <MiniBar v={selected.load} color="var(--alert)" />
              <div style={{ fontFamily: "var(--mono)", fontSize: 8, color: "var(--ink-3)", textTransform: "uppercase" }}>Load</div>
            </div>
            <div>
              {selected.note ? (
                <p style={{ fontFamily: "var(--serif)", fontSize: 13, fontStyle: "italic", lineHeight: 1.65, color: "var(--ink-2)", margin: 0 }}>
                  &ldquo;{selected.note}&rdquo;
                </p>
              ) : (
                <p style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>No note</p>
              )}
              {selected.tags.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 10 }}>
                  {selected.tags.map(t => (
                    <span key={t} style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.06em", border: "1px solid var(--hair)", padding: "2px 6px", color: "var(--ink-3)", textTransform: "uppercase" }}>{t}</span>
                  ))}
                </div>
              )}
              {/* Regime change overlay for this day */}
              {checkin.regimeChanges.filter(rc => rc.dayIndex === selectedDay).map(rc => (
                <div key={rc.dayIndex} style={{ marginTop: 10, padding: "6px 10px", borderLeft: `2px solid ${rc.color}`, fontFamily: "var(--mono)", fontSize: 10, color: rc.color, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  {rc.label} · protocol change
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8, height: 28 }}>
              <div style={{ width: 10, height: "100%", background: bandColor(selected.band) }} />
              <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.08em", alignSelf: "center" }}>{selected.band === "hi" ? "Good" : selected.band === "lo" ? "Low" : "Moderate"}</span>
            </div>
          </div>
        )}
      </div>

      {/* ── Last night detail ───────────────────────────────────────────── */}
      <div className="panel" style={{ padding: "20px 24px" }}>
        <div style={{ fontFamily: "var(--mono)", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--ink-3)", marginBottom: 14 }}>
          Last night · {lastNight.bedtime} – {lastNight.wake}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", borderTop: "1px solid var(--hair)", borderLeft: "1px solid var(--hair)" }}>
          {[
            { l: "Total",        v: lastNight.total },
            { l: "Deep",         v: lastNight.deep },
            { l: "REM",          v: lastNight.rem },
            { l: "Efficiency",   v: `${lastNight.efficiency}%` },
            { l: "HRV overnight",v: `${lastNight.hrvOvernight} ms` },
            { l: "RHR",          v: `${lastNight.rhrOvernight} bpm` },
            { l: "Skin temp Δ",  v: lastNight.skinTempDelta },
            { l: "Resp. rate",   v: `${lastNight.respRate} /min` },
          ].map(({ l, v }) => (
            <div key={l} style={{ borderRight: "1px solid var(--hair)", borderBottom: "1px solid var(--hair)", padding: "10px 14px" }}>
              <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>{l}</div>
              <div style={{ fontFamily: "var(--mono)", fontSize: 15, color: "var(--ink)", marginTop: 4 }}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Check-in form ────────────────────────────────────────────────── */}
      {!done ? (
        <>
          <div className="panel" style={{ padding: "20px 24px" }}>
            <div style={{ fontFamily: "var(--mono)", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--ink-3)", marginBottom: 20 }}>
              Morning check-in · {user.today}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {checkin.today.sliders.map((s, i) => (
                <div key={i}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
                    <span style={{ fontFamily: "var(--serif)", fontSize: 15, fontStyle: "italic", fontWeight: 300, color: "var(--ink)" }}>{s.q}</span>
                    <span style={{ fontFamily: "var(--mono)", fontSize: 18, letterSpacing: "-0.02em", color: "var(--ink)" }}>{sliders[i]}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.08em", width: 52, flexShrink: 0 }}>{s.left}</span>
                    <input
                      type="range" min={s.min} max={s.max} value={sliders[i]}
                      onChange={e => setSliders(prev => { const n = [...prev]; n[i] = +e.target.value; return n })}
                      style={{ flex: 1, accentColor: "var(--accent)" }}
                    />
                    <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.08em", width: 52, flexShrink: 0, textAlign: "right" }}>{s.right}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="panel" style={{ padding: "20px 24px" }}>
            <div style={{ fontFamily: "var(--mono)", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--ink-3)", marginBottom: 14 }}>How would you label this morning?</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
              {checkin.today.tags.all.map(t => (
                <button key={t} onClick={() => toggleTag(t)} style={{
                  fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.06em", padding: "5px 10px",
                  border: "1px solid var(--hair-strong)",
                  background: tags.includes(t) ? "var(--ink)" : "transparent",
                  color: tags.includes(t) ? "var(--bg)" : "var(--ink-2)",
                  cursor: "pointer",
                }}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="panel" style={{ padding: "20px 24px" }}>
            <div style={{ fontFamily: "var(--mono)", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--ink-3)", marginBottom: 12 }}>Morning note</div>
            <textarea
              value={note} onChange={e => setNote(e.target.value)} rows={4}
              style={{ width: "100%", background: "var(--panel-2)", border: "1px solid var(--hair)", color: "var(--ink)", fontFamily: "var(--serif)", fontSize: 14, lineHeight: 1.65, padding: "12px 14px", resize: "vertical", fontStyle: "italic" }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
              <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Visible to Darcy after submission
              </span>
              <button
                onClick={() => setSubmitted(true)}
                style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", border: "1px solid var(--ink)", padding: "8px 20px", background: "var(--ink)", color: "var(--bg)", cursor: "pointer" }}
              >
                Submit check-in
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="panel" style={{ padding: "28px 28px", textAlign: "center" }}>
          <div style={{ width: 14, height: 14, borderRadius: "50%", background: "var(--ok)", margin: "0 auto 12px" }} />
          <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--ok)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>Check-in submitted · {user.today}</div>
          <div style={{ fontFamily: "var(--serif)", fontSize: 13, color: "var(--ink-3)", fontStyle: "italic" }}>Darcy has been notified. Streak: {checkin.streak + 1} days.</div>
        </div>
      )}

      {/* ── Recent history ───────────────────────────────────────────────── */}
      <div className="panel">
        <div className="panel-head"><span>Recent history</span></div>
        {checkin.history.map((h, i) => (
          <div key={i} style={{ padding: "14px 20px", borderTop: i > 0 ? "1px solid var(--hair)" : undefined }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
              <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-2)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{h.when}</span>
              <div style={{ display: "flex", gap: 16 }}>
                {h.metrics.map(([label, val]) => (
                  <span key={label} style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-3)" }}>
                    {label} <strong style={{ color: "var(--ink)", fontWeight: 400 }}>{val}</strong>
                  </span>
                ))}
              </div>
            </div>
            <p style={{ fontFamily: "var(--serif)", fontSize: 13, fontStyle: "italic", lineHeight: 1.6, color: "var(--ink-2)", margin: "0 0 8px" }}>&ldquo;{h.quote}&rdquo;</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {h.tags.map(t => (
                <span key={t} style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.06em", border: "1px solid var(--hair)", padding: "2px 6px", color: "var(--ink-3)", textTransform: "uppercase" }}>{t}</span>
              ))}
            </div>
          </div>
        ))}
      </div>

    </div>
  )
}
