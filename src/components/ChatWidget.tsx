"use client"

import { useState, useRef, useEffect } from "react"
import { usePathname } from "next/navigation"

interface Msg { role: "agent" | "user"; text: string }

function matchResponse(input: string, isCoach: boolean): string {
  const q = input.toLowerCase()

  if (isCoach) {
    if (/brief|morning|today|daily/.test(q))
      return `Morning briefing · Jamie Garis\n\nAllostatic Load: 64 (elevated). HRV 41 ms (−11 vs baseline). RHR +4 bpm. Skin temp +0.4°C — day 3 of autonomic flag.\n\nBoard call at 09:00 today. Hold-intensity corrector active. 3 drafts awaiting countersignature.\n\nPriority: confirm hold with Jamie, protect sleep onset tonight.`

    if (/apob|cholesterol|lipid/.test(q))
      return `ApoB trajectory · Jamie Garis\n\nCurrent: 84 mg/dL · Q3 target: ≤70 mg/dL · 73 days remaining.\n\nProgression: 108 → 99 → 91 → 84. At current rate projected 77 mg/dL — 7 above target. Fibre adherence needs to reach 94%+ or consider statin dose adjustment at May 12 consult.`

    if (/autonomic|flag|hrv|sleep|recovery/.test(q))
      return `Autonomic flag · day 3\n\nHRV: 41 ms (−11 vs 30-day baseline of 52 ms). RHR: 52 bpm (+4). Skin temp: +0.4°C sustained.\n\nPattern matches Feb 06–11 setback — took 8 days to resolve after load reduction. Board call today adds cortisol load.\n\nRecommendation: maintain hold through Wednesday. Reassess post-DEXA.`

    if (/protocol|zone|train|intensity/.test(q))
      return `Active protocol · Jamie Garis\n\nZone-2: ≥160 min/week · no caffeine post-14:00 · omega-3 3g/day.\n\nActive corrector (17 Apr): hold-intensity — zone-2 only until HRV stabilises above 44 ms for 2 consecutive nights. Jamie has not logged a session since the hold was issued.`

    if (/quarter|report|q1|q2/.test(q))
      return `Q1 2026 summary (closed 31 Mar)\n\nApoB 91 → 84 mg/dL ✓ · deep sleep +20 min ✓ · HRV floor missed · fibrinogen rising (watch list).\n\nQ2 adjustments: zone-2 target reduced to 160 min/week, fibrinogen added to watch list.`

    return `I've reviewed Jamie's latest data.\n\nAllostatic Load: 64 (elevated). Primary flags: autonomic (day 3) and sleep quality. Board-cycle stress active.\n\nAsk me about ApoB, the autonomic flag, protocol, quarterly report, or this morning's briefing.`
  } else {
    if (/brief|morning|today|daily/.test(q))
      return `Good morning, Jamie.\n\nAllostatic Load: 64 — you're in the elevated band. Your HRV last night was 41 ms, which is below your baseline. Darcy has a hold-intensity corrector active since Thursday.\n\nToday: zone-2 only (HR <135 bpm) or full rest. Board call at 09:00 — take it easy this morning.`

    if (/zone.?2|zone two|cardio|train/.test(q))
      return `Zone-2 this week · Jamie\n\nTarget: 160 min · Logged: 82 min · 3 sessions remaining.\n\nWith the hold-intensity corrector active, keep HR below 135 bpm. No high-intensity work until your HRV recovers above 44 ms for two nights running.\n\nDarcy will lift the hold once you hit that threshold.`

    if (/load|allostatic|stress|recover/.test(q))
      return `Your allostatic load today: 64\n\nThat's elevated. The main contributors are sleep (HRV 41 ms, efficiency 82%) and today's board call adding anticipatory stress.\n\nDarcy's corrector is active — trust the hold. Zone-2 or rest today. Log your evening check-in so the data stays current.`

    if (/apob|cholesterol|lipid/.test(q))
      return `ApoB update · Jamie\n\nCurrent: 84 mg/dL · Target: ≤70 mg/dL by Q3.\n\nYou're tracking well — fibre adherence is the primary lever. Keep it above 89% this week. Darcy will review with Dr. Rao on May 12.`

    if (/sleep|hrv|recover/.test(q))
      return `Sleep last night · Jamie\n\nHRV: 41 ms (your baseline is 52 ms). Efficiency: 82%. Deep sleep: 54 min.\n\nThis is why the hold-intensity corrector is active. Your body is working to recover — protect tonight's sleep. No screens after 21:30, keep the room cool.`

    return `Hi Jamie — here's where things stand.\n\nAllostatic Load: 64 (elevated). Hold-intensity corrector active since Thursday. Zone-2 only today.\n\nAsk me about your zone-2 progress, allostatic load, ApoB, or this morning's briefing.`
  }
}

export function ChatWidget() {
  const pathname = usePathname()
  const isCoach = pathname.startsWith("/coach")
  const isClient = pathname.startsWith("/client")
  const isCommandPage = pathname.endsWith("/command")

  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  if (isCommandPage) return null
  if (!isCoach && !isClient) return null

  const accentColor = isCoach ? "var(--ok)" : "var(--warn)"
  const userName = isCoach ? "Darcy" : "Jamie"
  const assistantLabel = isCoach ? "Darcy's Assistant" : "Jamie's Assistant"

  const CHIPS = isCoach
    ? ["Morning briefing", "ApoB status", "Autonomic flag"]
    : ["Morning briefing", "Zone 2 this week", "What's my load?"]

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (open) {
      if (messages.length === 0) {
        const greeting = isCoach
          ? `Morning, Darcy. Jamie's overnight analysis is ready.\n\nAllostatic Load: 64 (elevated). HRV held at 41 ms — no further decline. Hold-intensity corrector from 17 Apr remains active. 3 drafts awaiting your review.\n\nWhat would you like to address?`
          : `Good morning, Jamie. Your allostatic load is 64 — elevated.\n\nHRV last night: 41 ms (below your baseline of 52 ms). Darcy's hold-intensity corrector is active — zone-2 only or rest today.\n\nWhat can I help you with?`
        setMessages([{ role: "agent", text: greeting }])
      }
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  function send(text: string) {
    if (!text.trim() || loading) return
    setMessages(p => [...p, { role: "user", text: text.trim() }])
    setInput("")
    setLoading(true)
    setTimeout(() => {
      setMessages(p => [...p, { role: "agent", text: matchResponse(text, isCoach) }])
      setLoading(false)
    }, 700)
  }

  return (
    <>
      {/* Panel */}
      <div
        style={{
          position: "fixed",
          bottom: 100,
          right: 28,
          width: 360,
          height: 480,
          zIndex: 300,
          background: "var(--bg)",
          border: "1px solid var(--hair-strong)",
          boxShadow: "0 8px 40px rgba(0,0,0,0.5)",
          display: "flex",
          flexDirection: "column",
          transform: open ? "translateY(0)" : "translateY(16px)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition: "transform 0.2s ease, opacity 0.15s ease",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "12px 16px",
            borderBottom: "1px solid var(--hair-strong)",
            display: "flex",
            alignItems: "center",
            gap: 10,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: accentColor,
              flexShrink: 0,
            }}
          />
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontFamily: "var(--mono)",
                fontSize: 10,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: "var(--ink)",
              }}
            >
              {assistantLabel}
            </div>
            <div
              style={{
                fontFamily: "var(--mono)",
                fontSize: 8,
                color: accentColor,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginTop: 1,
              }}
            >
              ⬤ Live · pre-loaded context
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close chat"
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: 4,
              color: "var(--ink-3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <line x1="1" y1="1" x2="13" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="13" y1="1" x2="1" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Quick chips */}
        <div
          style={{
            padding: "8px 12px",
            borderBottom: "1px solid var(--hair)",
            display: "flex",
            gap: 6,
            flexWrap: "wrap",
            flexShrink: 0,
          }}
        >
          {CHIPS.map(chip => (
            <button
              key={chip}
              onClick={() => send(chip)}
              style={{
                fontFamily: "var(--mono)",
                fontSize: 8,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                padding: "4px 10px",
                border: "1px solid var(--hair-strong)",
                color: "var(--ink-3)",
                background: "transparent",
                cursor: "pointer",
              }}
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Messages */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "12px 14px",
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          {messages.map((m, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                flexDirection: m.role === "user" ? "row-reverse" : "row",
                gap: 8,
                alignItems: "flex-start",
              }}
            >
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  background: m.role === "agent" ? "var(--panel-2)" : accentColor,
                  border: `1px solid ${m.role === "agent" ? "var(--hair-strong)" : accentColor}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  fontFamily: "var(--mono)",
                  fontSize: 7,
                  color: m.role === "agent" ? accentColor : "var(--bg)",
                  textTransform: "uppercase",
                }}
              >
                {m.role === "agent" ? "A" : userName[0]}
              </div>
              <div
                style={{
                  maxWidth: "78%",
                  background:
                    m.role === "agent"
                      ? "var(--panel-2)"
                      : `color-mix(in srgb, ${accentColor} 10%, var(--panel-2))`,
                  border: `1px solid ${
                    m.role === "agent"
                      ? "var(--hair)"
                      : `color-mix(in srgb, ${accentColor} 25%, transparent)`
                  }`,
                  padding: "8px 11px",
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: 7,
                    color: m.role === "agent" ? accentColor : "var(--ink-3)",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    marginBottom: 4,
                  }}
                >
                  {m.role === "agent" ? "Agent" : userName}
                </div>
                <div
                  style={{
                    fontSize: 11.5,
                    color: "var(--ink-2)",
                    lineHeight: 1.55,
                    whiteSpace: "pre-line",
                  }}
                >
                  {m.text}
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  background: "var(--panel-2)",
                  border: "1px solid var(--hair-strong)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "var(--mono)",
                  fontSize: 7,
                  color: accentColor,
                }}
              >
                A
              </div>
              <div
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: 9,
                  color: "var(--ink-4)",
                  letterSpacing: "0.08em",
                }}
              >
                Analysing…
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div
          style={{
            padding: "10px 12px",
            borderTop: "1px solid var(--hair)",
            display: "flex",
            gap: 8,
            flexShrink: 0,
          }}
        >
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && send(input)}
            placeholder={isCoach ? "Ask about Jamie's data…" : "Ask about your programme…"}
            style={{
              flex: 1,
              background: "var(--panel-2)",
              border: "1px solid var(--hair-strong)",
              padding: "7px 10px",
              fontFamily: "var(--mono)",
              fontSize: 10,
              color: "var(--ink)",
              letterSpacing: "0.02em",
              outline: "none",
            }}
          />
          <button
            onClick={() => send(input)}
            style={{
              fontFamily: "var(--mono)",
              fontSize: 8,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              border: "none",
              background: accentColor,
              color: "var(--bg)",
              padding: "7px 14px",
              cursor: "pointer",
            }}
          >
            Send
          </button>
        </div>
      </div>

      {/* Floating button */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-label={open ? "Close chat" : "Open chat"}
        style={{
          position: "fixed",
          bottom: 28,
          right: 28,
          zIndex: 300,
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: accentColor,
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
          transition: "transform 0.15s ease",
        }}
      >
        {open ? (
          /* X icon */
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <line x1="2" y1="2" x2="16" y2="16" stroke="white" strokeWidth="2" strokeLinecap="round" />
            <line x1="16" y1="2" x2="2" y2="16" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </svg>
        ) : (
          /* Chat bubble icon */
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M20 2H4C2.9 2 2 2.9 2 4V16C2 17.1 2.9 18 4 18H7L12 23L17 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z"
              fill="white"
            />
          </svg>
        )}
      </button>
    </>
  )
}
