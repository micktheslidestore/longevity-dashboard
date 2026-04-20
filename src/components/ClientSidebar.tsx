"use client"

import { usePathname, useRouter } from "next/navigation"
import { useEffect } from "react"
import { useApp } from "./RoleContext"
import { NavIcon, type IconKey } from "./NavIcons"

const NAV: { key: string; icon: IconKey; label: string; href: string }[] = [
  { key: "command",   icon: "command",     label: "Command Centre", href: "/client/command" },
  { key: "dashboard", icon: "dashboard",   label: "Dashboard",      href: "/client" },
  { key: "checkin",   icon: "checkin",     label: "Check-in",       href: "/client/checkin" },
  { key: "trends",    icon: "trends",      label: "Trends",         href: "/client/trends" },
  { key: "medical",   icon: "medical",     label: "Medical",        href: "/client/medical" },
  { key: "team",      icon: "team",        label: "Team",           href: "/client/team" },
]

export default function ClientSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { setRole } = useApp()

  useEffect(() => { setRole("james") }, [setRole])

  const s = {
    sidebar: {
      width: 200, minWidth: 200, height: "100vh", display: "flex", flexDirection: "column" as const,
      borderRight: "1px solid var(--hair)", padding: "22px 0", background: "var(--bg)",
      flexShrink: 0,
    },
    brand: { padding: "0 18px 20px", borderBottom: "1px solid var(--hair)", marginBottom: 10 },
    brandName: { fontFamily: "var(--serif)", fontSize: 18, letterSpacing: "-0.02em", color: "var(--ink)" },
    brandSub: { fontFamily: "var(--mono)", fontSize: 8.5, textTransform: "uppercase" as const, letterSpacing: "0.1em", color: "var(--ink-3)", marginTop: 3 },
    nav: { flex: 1, padding: "6px 0" },
    btn: (active: boolean) => ({
      display: "flex", alignItems: "center", gap: 11,
      width: "100%", padding: "9px 18px",
      background: active ? "var(--panel-2)" : "transparent",
      borderLeft: active ? "2px solid var(--accent)" : "2px solid transparent",
      color: active ? "var(--ink)" : "var(--ink-3)",
      fontFamily: "var(--mono)", fontSize: 10.5, letterSpacing: "0.04em",
      cursor: "pointer", textAlign: "left" as const,
    }),
    meta: { padding: "14px 18px", borderTop: "1px solid var(--hair)", marginTop: "auto" },
    metaRow: { display: "flex", justifyContent: "space-between", fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-4)", marginBottom: 3 },
  }

  return (
    <div style={s.sidebar}>
      <div style={s.brand}>
        <div style={s.brandName}>Allostatic<em>.</em></div>
        <div style={s.brandSub}>Jamie Garis · Principal</div>
      </div>

      <nav style={s.nav}>
        {NAV.map(item => {
          const active = item.href === "/client"
            ? pathname === "/client"
            : pathname.startsWith(item.href)
          return (
            <button key={item.key} style={s.btn(active)} onClick={() => router.push(item.href)}>
              <NavIcon name={item.icon} />
              {item.label}
            </button>
          )
        })}
      </nav>

      <div style={s.meta}>
        <div style={s.metaRow}><span>AL score</span><span style={{ color: "var(--warn)" }}>64</span></div>
        <div style={s.metaRow}><span>Last sync</span><span>06:41</span></div>
        <div style={s.metaRow}><span>Coach</span><span>Darcy O'Sullivan</span></div>
        <div style={{ marginTop: 10, paddingTop: 8, borderTop: "1px solid var(--hair)" }}>
          <button
            onClick={() => router.push("/")}
            style={{ fontFamily: "var(--mono)", fontSize: 8.5, color: "var(--ink-4)", textTransform: "uppercase", letterSpacing: "0.1em", cursor: "pointer" }}
          >
            ← Switch product
          </button>
        </div>
      </div>
    </div>
  )
}
