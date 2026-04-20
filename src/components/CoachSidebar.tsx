"use client"

import { usePathname, useRouter } from "next/navigation"
import { useEffect } from "react"
import { useApp } from "./RoleContext"
import { NavIcon, type IconKey } from "./NavIcons"

const PRIMARY_NAV: { key: string; icon: IconKey; label: string; href: string }[] = [
  { key: "command",      icon: "command",      label: "Command Centre", href: "/coach/command" },
  { key: "dashboard",    icon: "dashboard",    label: "Dashboard",      href: "/coach" },
  { key: "compliance",   icon: "compliance",   label: "Compliance",     href: "/coach/compliance" },
  { key: "trends",       icon: "trends",       label: "Trends",         href: "/coach/trends" },
  { key: "medical",      icon: "medical",      label: "Medical",        href: "/coach/medical" },
  { key: "team",         icon: "team",         label: "Team",           href: "/coach/team" },
]

const TOOL_NAV: { key: string; icon: IconKey; label: string; href: string }[] = [
  { key: "agent",        icon: "agent",        label: "Agent",          href: "/coach/command#agent" },
  { key: "architecture", icon: "architecture", label: "Architecture",   href: "/coach/architecture" },
]

export default function CoachSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { setRole } = useApp()

  useEffect(() => { setRole("darcy") }, [setRole])

  const s = {
    sidebar: {
      width: 200, minWidth: 200, height: "100vh", display: "flex", flexDirection: "column" as const,
      borderRight: "1px solid var(--hair)", padding: "22px 0", background: "var(--bg)",
      flexShrink: 0,
    },
    brand: { padding: "0 18px 20px", borderBottom: "1px solid var(--hair)", marginBottom: 10 },
    brandName: { fontFamily: "var(--serif)", fontSize: 18, letterSpacing: "-0.02em", color: "var(--ink)" },
    brandSub: { fontFamily: "var(--mono)", fontSize: 8.5, textTransform: "uppercase" as const, letterSpacing: "0.1em", color: "var(--ok)", marginTop: 3 },
    nav: { flex: 1, padding: "6px 0" },
    divider: { height: 1, background: "var(--hair)", margin: "8px 18px" },
    divLabel: { fontFamily: "var(--mono)", fontSize: 8, textTransform: "uppercase" as const, letterSpacing: "0.12em", color: "var(--ink-4)", padding: "4px 18px" },
    btn: (active: boolean) => ({
      display: "flex", alignItems: "center", gap: 11,
      width: "100%", padding: "9px 18px",
      background: active ? "var(--panel-2)" : "transparent",
      borderLeft: active ? "2px solid var(--ok)" : "2px solid transparent",
      color: active ? "var(--ink)" : "var(--ink-3)",
      fontFamily: "var(--mono)", fontSize: 10.5, letterSpacing: "0.04em",
      cursor: "pointer", textAlign: "left" as const,
    }),
    meta: { padding: "14px 18px", borderTop: "1px solid var(--hair)" },
    metaRow: { display: "flex", justifyContent: "space-between", fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-4)", marginBottom: 3 },
  }

  function isActive(href: string) {
    const base = href.split("#")[0]
    return base === "/coach" ? pathname === "/coach" : pathname.startsWith(base)
  }

  return (
    <div style={s.sidebar}>
      <div style={s.brand}>
        <div style={s.brandName}>Allostatic<em>.</em></div>
        <div style={s.brandSub}>Coach workspace</div>
      </div>

      <nav style={s.nav}>
        {PRIMARY_NAV.map(item => (
          <button key={item.key} style={s.btn(isActive(item.href))} onClick={() => router.push(item.href.split("#")[0])}>
            <NavIcon name={item.icon} />
            {item.label}
          </button>
        ))}

        <div style={s.divider} />
        <div style={s.divLabel}>Tools</div>

        {TOOL_NAV.map(item => (
          <button key={item.key} style={s.btn(isActive(item.href))} onClick={() => router.push(item.href.split("#")[0])}>
            <NavIcon name={item.icon} />
            {item.label}
          </button>
        ))}
      </nav>

      <div style={s.meta}>
        <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ok)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Darcy O&apos;Sullivan</div>
        <div style={s.metaRow}><span>Client</span><span>J. Garis · 54M</span></div>
        <div style={s.metaRow}><span>AL score</span><span style={{ color: "var(--warn)" }}>64 elevated</span></div>
        <div style={s.metaRow}><span>Pending</span><span style={{ color: "var(--warn)" }}>3 drafts</span></div>
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
