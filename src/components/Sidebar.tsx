"use client"

import { usePathname, useRouter } from "next/navigation"
import { useApp } from "./RoleContext"

const SCREENS = [
  { key: "checkin", num: "01", label: "Check-in", href: "/checkin" },
  { key: "today", num: "02", label: "Today", href: "/" },
  { key: "trends", num: "03", label: "Trends", href: "/trends" },
  { key: "medical", num: "04", label: "Medical", href: "/medical" },
  { key: "team", num: "05", label: "Team", href: "/team" },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { role } = useApp()

  return (
    <aside className="sidebar">
      <div>
        <div className="brand">Allostatic<em>.</em></div>
        <div className="who">
          <div><strong>J. Garis</strong> · 54M</div>
          <div>Cohort · Principals 04</div>
        </div>
      </div>

      <nav className="nav">
        {SCREENS.map((s) => {
          const active = pathname === s.href || (s.href !== "/" && pathname.startsWith(s.href))
          return (
            <button
              key={s.key}
              data-active={active}
              onClick={() => router.push(s.href)}
            >
              <span className="num">{s.num}</span>
              <span>{s.label}</span>
              <span className="dot" />
            </button>
          )
        })}
      </nav>

      <div className="meta">
        <div className="row-l"><span>Coach</span><span>Darcy O&apos;Sullivan</span></div>
        <div className="row-l"><span>Last sync</span><span>06:41</span></div>
        <div className="row-l"><span>Next bloods</span><span>02 Jul</span></div>
        <div style={{ marginTop: 10, textTransform: "uppercase", letterSpacing: "0.08em", fontSize: 9, color: "var(--ink-3)" }}>Devices</div>
        <div className="devices">
          <span>Garmin</span>
          <span>Oura</span>
          <span>Withings</span>
        </div>
        <div style={{ marginTop: 14, paddingTop: 10, borderTop: "1px solid var(--hair)" }}>
          <div style={{ color: "var(--ink-3)", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.08em" }}>Viewing as</div>
          <div style={{ color: "var(--ink)", marginTop: 2, fontFamily: "var(--mono)", fontSize: 10 }}>
            {role === "darcy" ? "Darcy O'Sullivan · coach" : "Jamie Garis · principal"}
          </div>
        </div>
      </div>
    </aside>
  )
}
