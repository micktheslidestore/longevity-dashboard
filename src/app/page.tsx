"use client"

import { useRouter } from "next/navigation"
import { T } from "@/components/Primitives"

export default function LandingGate() {
  const router = useRouter()

  return (
    <div style={{
      minHeight: "100vh",
      background: T.bg,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px 24px",
      fontFamily: T.sans,
    }}>

      {/* Brand */}
      <div style={{ textAlign: "center", marginBottom: 64 }}>
        <div style={{ fontFamily: T.serif, fontSize: 44, fontWeight: 300, letterSpacing: "-0.03em", color: T.ink, marginBottom: 12, lineHeight: 1 }}>
          Allostatic<em>.</em>
        </div>
        <div style={{ fontFamily: T.sans, fontSize: 13, color: T.ink3, letterSpacing: "0.01em" }}>
          Your longevity intelligence platform
        </div>
      </div>

      {/* Product cards */}
      <div style={{ display: "flex", gap: 32, width: "100%", maxWidth: 960, alignItems: "stretch" }}>

        {/* Client card — Jamie */}
        <ClientCard onClick={() => router.push("/client")} accentColor={T.warn} />

        {/* Coach card — Darcy */}
        <CoachCard onClick={() => router.push("/coach/command")} accentColor={T.ok} />
      </div>

      {/* Footer */}
      <div style={{ marginTop: 56, display: "flex", gap: 20, alignItems: "center" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: T.sans, fontSize: 12, color: T.ink3 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: T.ok, display: "inline-block" }} />
          Live
        </span>
        <span style={{ fontFamily: T.sans, fontSize: 12, color: T.ink4 }}>Last sync 06:41</span>
        <span style={{ fontFamily: T.sans, fontSize: 12, color: T.ink4 }}>Garmin · Oura · Withings</span>
        <span style={{ fontFamily: T.mono, fontSize: 11, color: T.ink4 }}>19 Apr 2026</span>
      </div>
    </div>
  )
}

function ClientCard({ onClick, accentColor }: { onClick: () => void; accentColor: string }) {
  return (
    <div
      onClick={onClick}
      style={{
        flex: 1,
        background: T.surface,
        borderRadius: 16,
        padding: "36px 36px 32px",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        gap: 0,
        transition: "background 0.15s",
      }}
      onMouseEnter={e => (e.currentTarget.style.background = T.surfaceRaised)}
      onMouseLeave={e => (e.currentTarget.style.background = T.surface)}
    >
      <div style={{ fontFamily: T.sans, fontSize: 12, color: T.warn, marginBottom: 20, fontWeight: 500 }}>
        Principal
      </div>
      <div style={{ fontFamily: T.serif, fontSize: 32, fontWeight: 300, letterSpacing: "-0.02em", color: T.ink, marginBottom: 6, lineHeight: 1.1 }}>
        Jamie Garis
      </div>
      <div style={{ fontFamily: T.sans, fontSize: 13, color: T.ink3, marginBottom: 36 }}>
        54 years · APOE ε4/ε4 · Lp(a) elevated
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 40 }}>
        {[
          { label: "Allostatic load", value: "64", color: T.warn, sub: "Elevated" },
          { label: "Check-in streak", value: "14d", color: T.ok, sub: "Consecutive days" },
          { label: "Next test", value: "22 Apr", color: T.ink2, sub: "DEXA + VO₂max" },
          { label: "ApoB", value: "84", color: T.warn, sub: "Down from 91 last quarter" },
        ].map(({ label, value, color, sub }) => (
          <div key={label}>
            <div style={{ fontFamily: T.sans, fontSize: 11, color: T.ink4, marginBottom: 4 }}>{label}</div>
            <div style={{ fontFamily: T.mono, fontSize: 22, fontWeight: 300, color, letterSpacing: "-0.02em", lineHeight: 1 }}>{value}</div>
            <div style={{ fontFamily: T.sans, fontSize: 11, color: T.ink4, marginTop: 3 }}>{sub}</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: "auto", display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: `1px solid ${T.border}`, paddingTop: 20 }}>
        <span style={{ fontFamily: T.sans, fontSize: 13, color: T.ink2, fontWeight: 500 }}>
          Enter programme
        </span>
        <span style={{ fontFamily: T.mono, fontSize: 16, color: accentColor }}>→</span>
      </div>
    </div>
  )
}

function CoachCard({ onClick, accentColor }: { onClick: () => void; accentColor: string }) {
  return (
    <div
      onClick={onClick}
      style={{
        flex: 1,
        background: T.surface,
        borderRadius: 16,
        padding: "36px 36px 32px",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        gap: 0,
        transition: "background 0.15s",
      }}
      onMouseEnter={e => (e.currentTarget.style.background = T.surfaceRaised)}
      onMouseLeave={e => (e.currentTarget.style.background = T.surface)}
    >
      <div style={{ fontFamily: T.sans, fontSize: 12, color: T.ok, marginBottom: 20, fontWeight: 500 }}>
        Coach
      </div>
      <div style={{ fontFamily: T.serif, fontSize: 32, fontWeight: 300, letterSpacing: "-0.02em", color: T.ink, marginBottom: 6, lineHeight: 1.1 }}>
        Darcy O&apos;Sullivan
      </div>
      <div style={{ fontFamily: T.sans, fontSize: 13, color: T.ink3, marginBottom: 36 }}>
        MS · Longevity coach · since Aug 2024
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 40 }}>
        {[
          { label: "Active clients", value: "1",  color: T.ok,   sub: "J. Garis" },
          { label: "Drafts pending", value: "3",  color: T.warn, sub: "Awaiting review" },
          { label: "Next milestone", value: "2d", color: T.warn, sub: "DEXA 22 Apr" },
          { label: "Q2 cycle",       value: "W3", color: T.ink2, sub: "Remeasurement" },
        ].map(({ label, value, color, sub }) => (
          <div key={label}>
            <div style={{ fontFamily: T.sans, fontSize: 11, color: T.ink4, marginBottom: 4 }}>{label}</div>
            <div style={{ fontFamily: T.mono, fontSize: 22, fontWeight: 300, color, letterSpacing: "-0.02em", lineHeight: 1 }}>{value}</div>
            <div style={{ fontFamily: T.sans, fontSize: 11, color: T.ink4, marginTop: 3 }}>{sub}</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: "auto", display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: `1px solid ${T.border}`, paddingTop: 20 }}>
        <span style={{ fontFamily: T.sans, fontSize: 13, color: T.ink2, fontWeight: 500 }}>
          Enter coach centre
        </span>
        <span style={{ fontFamily: T.mono, fontSize: 16, color: accentColor }}>→</span>
      </div>
    </div>
  )
}
