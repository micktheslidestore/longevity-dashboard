"use client"

import { useRouter } from "next/navigation"

export default function LandingGate() {
  const router = useRouter()

  const card = {
    base: {
      flex: 1, padding: "36px 40px", border: "1px solid var(--hair-strong)",
      display: "flex", flexDirection: "column" as const, gap: 0,
      cursor: "pointer", background: "var(--panel)", transition: "border-color 0.15s",
      maxWidth: 420,
    },
  }

  return (
    <div style={{
      minHeight: "100vh", background: "var(--bg)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: "40px 24px",
    }}>

      {/* Brand */}
      <div style={{ textAlign: "center", marginBottom: 56 }}>
        <div style={{ fontFamily: "var(--serif)", fontSize: 38, letterSpacing: "-0.03em", color: "var(--ink)", marginBottom: 10 }}>
          Allostatic<em>.</em>
        </div>
        <div style={{ fontFamily: "var(--mono)", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.18em", color: "var(--ink-4)" }}>
          Health intelligence platform
        </div>
      </div>

      {/* Product cards */}
      <div style={{ display: "flex", gap: 20, width: "100%", maxWidth: 880 }}>

        {/* Client card — Jamie */}
        <div
          style={card.base}
          onClick={() => router.push("/client")}
          onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--accent)")}
          onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--hair-strong)")}
        >
          <div style={{ fontFamily: "var(--mono)", fontSize: 8.5, textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--accent)", marginBottom: 20 }}>
            ○ Principal
          </div>
          <div style={{ fontFamily: "var(--serif)", fontSize: 28, letterSpacing: "-0.02em", color: "var(--ink)", marginBottom: 4, lineHeight: 1.1 }}>
            Jamie Garis
          </div>
          <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-3)", marginBottom: 32 }}>
            54M · APOE ε4/ε4 · Lp(a) elevated
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 36 }}>
            {[
              { l: "AL Score", v: "64", c: "var(--warn)", sub: "Elevated" },
              { l: "Streak", v: "14d", c: "var(--ok)", sub: "Check-ins" },
              { l: "Next test", v: "22 Apr", c: "var(--ink-2)", sub: "DEXA + VO₂max" },
              { l: "ApoB", v: "84", c: "var(--warn)", sub: "↓ 91 last Q" },
            ].map(({ l, v, c, sub }) => (
              <div key={l}>
                <div style={{ fontFamily: "var(--mono)", fontSize: 8, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--ink-4)", marginBottom: 2 }}>{l}</div>
                <div style={{ fontFamily: "var(--mono)", fontSize: 20, color: c, letterSpacing: "-0.02em", lineHeight: 1 }}>{v}</div>
                <div style={{ fontFamily: "var(--mono)", fontSize: 8.5, color: "var(--ink-4)", marginTop: 2 }}>{sub}</div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: "auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontFamily: "var(--mono)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--ink-2)" }}>
              Enter programme
            </span>
            <span style={{ fontFamily: "var(--mono)", fontSize: 14, color: "var(--accent)" }}>→</span>
          </div>
        </div>

        {/* Divider */}
        <div style={{ width: 1, background: "var(--hair)", flexShrink: 0, alignSelf: "stretch" }} />

        {/* Coach card — Darcy */}
        <div
          style={card.base}
          onClick={() => router.push("/coach/command")}
          onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--ok)")}
          onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--hair-strong)")}
        >
          <div style={{ fontFamily: "var(--mono)", fontSize: 8.5, textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--ok)", marginBottom: 20 }}>
            ◎ Coach
          </div>
          <div style={{ fontFamily: "var(--serif)", fontSize: 28, letterSpacing: "-0.02em", color: "var(--ink)", marginBottom: 4, lineHeight: 1.1 }}>
            Darcy O&apos;Sullivan
          </div>
          <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-3)", marginBottom: 32 }}>
            MS · Longevity coach · since Aug 2024
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 36 }}>
            {[
              { l: "Active clients", v: "1",  c: "var(--ok)",    sub: "J. Garis" },
              { l: "Drafts pending", v: "3",  c: "var(--warn)",  sub: "Awaiting review" },
              { l: "Next milestone", v: "2d", c: "var(--warn)",  sub: "DEXA 22 Apr" },
              { l: "Q2 cycle",       v: "W3", c: "var(--ink-2)", sub: "Remeasurement" },
            ].map(({ l, v, c, sub }) => (
              <div key={l}>
                <div style={{ fontFamily: "var(--mono)", fontSize: 8, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--ink-4)", marginBottom: 2 }}>{l}</div>
                <div style={{ fontFamily: "var(--mono)", fontSize: 20, color: c, letterSpacing: "-0.02em", lineHeight: 1 }}>{v}</div>
                <div style={{ fontFamily: "var(--mono)", fontSize: 8.5, color: "var(--ink-4)", marginTop: 2 }}>{sub}</div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: "auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontFamily: "var(--mono)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--ink-2)" }}>
              Enter coach centre
            </span>
            <span style={{ fontFamily: "var(--mono)", fontSize: 14, color: "var(--ok)" }}>→</span>
          </div>
        </div>
      </div>

      {/* Footer status */}
      <div style={{ marginTop: 40, display: "flex", gap: 24, fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-4)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
        <span>⬤ Live</span>
        <span>Last sync 06:41</span>
        <span>Garmin · Oura · Withings</span>
        <span>19 Apr 2026</span>
      </div>
    </div>
  )
}
