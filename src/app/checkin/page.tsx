"use client"

import { useState } from "react"
import { DATA } from "@/data/james"

function bandColor(band: string) {
  if (band === "hi") return "var(--ok)"
  if (band === "lo") return "var(--alert)"
  return "var(--warn)"
}

export default function CheckinPage() {
  const { lastNight, checkin, user } = DATA
  const [sliders, setSliders] = useState(checkin.today.sliders.map(s => s.val))
  const [tags, setTags] = useState<string[]>(checkin.today.tags.selected)
  const [note, setNote] = useState(checkin.today.note)

  function toggleTag(t: string) {
    setTags(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, padding: "24px 32px", maxWidth: 900 }}>

      {/* Last night */}
      <div className="panel" style={{ padding: "20px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 16 }}>
          <span style={{ fontFamily: "var(--mono)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--ink-2)" }}>
            Last night · {lastNight.bedtime} – {lastNight.wake}
          </span>
          <div style={{ textAlign: "right" }}>
            <span style={{ fontFamily: "var(--mono)", fontSize: 22, letterSpacing: "-0.03em", color: lastNight.sleepScore >= 75 ? "var(--ok)" : lastNight.sleepScore >= 55 ? "var(--warn)" : "var(--alert)" }}>
              {lastNight.sleepScore}
            </span>
            <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-3)", marginLeft: 4 }}>/100 · {lastNight.band}</span>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", borderTop: "1px solid var(--hair)", borderLeft: "1px solid var(--hair)" }}>
          {[
            { l: "Total", v: lastNight.total },
            { l: "Deep", v: lastNight.deep },
            { l: "REM", v: lastNight.rem },
            { l: "Efficiency", v: `${lastNight.efficiency}%` },
            { l: "HRV overnight", v: `${lastNight.hrvOvernight} ms` },
            { l: "RHR", v: `${lastNight.rhrOvernight} bpm` },
            { l: "Skin temp Δ", v: lastNight.skinTempDelta },
            { l: "Resp. rate", v: `${lastNight.respRate} /min` },
          ].map(({ l, v }) => (
            <div key={l} style={{ borderRight: "1px solid var(--hair)", borderBottom: "1px solid var(--hair)", padding: "10px 14px" }}>
              <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>{l}</div>
              <div style={{ fontFamily: "var(--mono)", fontSize: 15, color: "var(--ink)", marginTop: 4 }}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Sliders */}
      <div className="panel" style={{ padding: "20px 24px" }}>
        <div style={{ fontFamily: "var(--mono)", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--ink-3)", marginBottom: 20 }}>
          Check-in · {user.today}
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
                  type="range"
                  min={s.min}
                  max={s.max}
                  value={sliders[i]}
                  onChange={e => setSliders(prev => { const n = [...prev]; n[i] = +e.target.value; return n })}
                  style={{ flex: 1, accentColor: "var(--accent)" }}
                />
                <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.08em", width: 52, flexShrink: 0, textAlign: "right" }}>{s.right}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tag cloud */}
      <div className="panel" style={{ padding: "20px 24px" }}>
        <div style={{ fontFamily: "var(--mono)", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--ink-3)", marginBottom: 14 }}>
          How would you label this morning?
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
          {checkin.today.tags.all.map(t => (
            <button
              key={t}
              onClick={() => toggleTag(t)}
              style={{
                fontFamily: "var(--mono)",
                fontSize: 10,
                letterSpacing: "0.06em",
                padding: "5px 10px",
                border: "1px solid var(--hair-strong)",
                background: tags.includes(t) ? "var(--ink)" : "transparent",
                color: tags.includes(t) ? "var(--bg)" : "var(--ink-2)",
                cursor: "pointer",
                transition: "background 0.1s, color 0.1s",
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Note */}
      <div className="panel" style={{ padding: "20px 24px" }}>
        <div style={{ fontFamily: "var(--mono)", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--ink-3)", marginBottom: 12 }}>
          Morning note
        </div>
        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          rows={5}
          style={{
            width: "100%",
            background: "var(--panel-2)",
            border: "1px solid var(--hair)",
            color: "var(--ink)",
            fontFamily: "var(--serif)",
            fontSize: 14,
            lineHeight: 1.65,
            padding: "12px 14px",
            resize: "vertical",
            fontStyle: "italic",
          }}
        />
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
          <button style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", border: "1px solid var(--ink)", padding: "7px 18px", background: "var(--ink)", color: "var(--bg)", cursor: "pointer" }}>
            Submit check-in
          </button>
        </div>
      </div>

      {/* 30-day strip */}
      <div className="panel" style={{ padding: "16px 20px" }}>
        <div style={{ fontFamily: "var(--mono)", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--ink-3)", marginBottom: 10 }}>
          30-day pattern
        </div>
        <div style={{ display: "flex", gap: 3 }}>
          {checkin.qualStrip.map((band, i) => (
            <div key={i} style={{ width: 9, height: 24, background: bandColor(band), opacity: 0.8, flexShrink: 0 }} />
          ))}
        </div>
        <div style={{ display: "flex", gap: 18, marginTop: 10 }}>
          {[["hi", "var(--ok)", "Good"], ["md", "var(--warn)", "Moderate"], ["lo", "var(--alert)", "Low"]].map(([k, col, lbl]) => (
            <div key={k} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 8, height: 8, background: col as string }} />
              <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{lbl}</span>
            </div>
          ))}
        </div>
      </div>

      {/* History */}
      <div className="panel">
        <div className="panel-head">
          <span>History</span>
        </div>
        {checkin.history.map((h, i) => (
          <div key={i} style={{ padding: "16px 20px", borderTop: i > 0 ? "1px solid var(--hair)" : undefined }}>
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
            <p style={{ fontFamily: "var(--serif)", fontSize: 13, fontStyle: "italic", lineHeight: 1.6, color: "var(--ink-2)", margin: "0 0 8px" }}>
              &ldquo;{h.quote}&rdquo;
            </p>
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
