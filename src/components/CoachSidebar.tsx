"use client"

import { usePathname, useRouter } from "next/navigation"
import { useEffect } from "react"
import { useApp } from "./RoleContext"
import { NavIcon, type IconKey } from "./NavIcons"
import { T } from "./Primitives"

const PRIMARY_NAV: { key: string; icon: IconKey; label: string; href: string }[] = [
  { key: "command",    icon: "command",    label: "Command centre", href: "/coach/command" },
  { key: "compliance", icon: "compliance", label: "Compliance",     href: "/coach/compliance" },
  { key: "calendar",   icon: "dashboard",  label: "Calendar",       href: "/coach/calendar" },
  { key: "trends",     icon: "trends",     label: "Trends",         href: "/coach/trends" },
  { key: "medical",    icon: "medical",    label: "Medical",        href: "/coach/medical" },
  { key: "team",       icon: "team",       label: "Team",           href: "/coach/team" },
  { key: "dashboard",  icon: "dashboard",  label: "Dashboard",      href: "/coach/dashboard" },
]

const TOOL_NAV: { key: string; icon: IconKey; label: string; href: string }[] = [
  { key: "agent",        icon: "agent",        label: "Agent",        href: "/coach/command#agent" },
  { key: "architecture", icon: "architecture", label: "Architecture", href: "/coach/architecture" },
]

// All nav items combined for mobile tab bar (primary only, 5 max)
const MOBILE_NAV = PRIMARY_NAV.slice(0, 5)

export default function CoachSidebar() {
  const pathname = usePathname()
  const router   = useRouter()
  const { setRole, theme, setTheme } = useApp()

  useEffect(() => { setRole("darcy") }, [setRole])

  function isActive(href: string) {
    const base = href.split("#")[0]
    return pathname.startsWith(base)
  }

  function navigate(href: string) {
    const [path, hash] = href.split("#")
    router.push(path)
    if (hash) {
      setTimeout(() => {
        document.getElementById(hash)?.scrollIntoView({ behavior: "smooth", block: "start" })
      }, 200)
    }
  }

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <div className="coach-sidebar" style={{
        width: 200, minWidth: 200, height: "100vh",
        display: "flex", flexDirection: "column",
        borderRight: `1px solid ${T.borderSubtle}`,
        padding: "24px 0", background: T.bg, flexShrink: 0,
        position: "sticky", top: 0, overflowY: "auto",
      }}>
        {/* Brand */}
        <div style={{ padding: "0 20px 20px", borderBottom: `1px solid ${T.border}`, marginBottom: 8 }}>
          <div style={{ fontFamily: T.serif, fontSize: 18, letterSpacing: "-0.02em", color: T.ink }}>
            Allostatic<em style={{ fontStyle: "italic", color: T.ink3 }}>.</em>
          </div>
          <div style={{ fontFamily: T.sans, fontSize: 11, color: T.ok, marginTop: 3, fontWeight: 500 }}>
            Coach workspace
          </div>
        </div>

        {/* Primary nav */}
        <nav style={{ flex: 1, padding: "4px 0" }}>
          {PRIMARY_NAV.map(item => {
            const active = isActive(item.href)
            return (
              <button
                key={item.key}
                onClick={() => navigate(item.href)}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  width: "100%", padding: "9px 20px",
                  fontFamily: T.sans, fontSize: 13, fontWeight: active ? 500 : 400,
                  color: active ? T.ink : T.ink3,
                  background: active ? T.surfaceRaised : "transparent",
                  borderLeft: `2px solid ${active ? T.ok : "transparent"}`,
                  cursor: "pointer", textAlign: "left",
                  transition: "all 0.12s ease",
                }}
              >
                <NavIcon name={item.icon} />
                {item.label}
              </button>
            )
          })}

          {/* Tools divider */}
          <div style={{ height: 1, background: T.border, margin: "8px 20px" }} />
          <div style={{ fontFamily: T.sans, fontSize: 11, color: T.ink4, padding: "2px 20px 6px" }}>
            Tools
          </div>

          {TOOL_NAV.map(item => {
            const active = isActive(item.href)
            return (
              <button
                key={item.key}
                onClick={() => navigate(item.href)}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  width: "100%", padding: "9px 20px",
                  fontFamily: T.sans, fontSize: 13, fontWeight: active ? 500 : 400,
                  color: active ? T.ink : T.ink3,
                  background: active ? T.surfaceRaised : "transparent",
                  borderLeft: `2px solid ${active ? T.ok : "transparent"}`,
                  cursor: "pointer", textAlign: "left",
                  transition: "all 0.12s ease",
                }}
              >
                <NavIcon name={item.icon} />
                {item.label}
              </button>
            )
          })}
        </nav>

        {/* Meta */}
        <div style={{ padding: "14px 20px", borderTop: `1px solid ${T.border}` }}>
          <div style={{ fontFamily: T.sans, fontSize: 12, color: T.ok, marginBottom: 6, fontWeight: 500 }}>
            Darcy O&apos;Sullivan
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontFamily: T.sans, fontSize: 11, color: T.ink4, marginBottom: 3 }}>
            <span>Client</span><span>J. Garis · 54M</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontFamily: T.sans, fontSize: 11, color: T.ink4, marginBottom: 3 }}>
            <span>AL score</span><span style={{ color: T.warn }}>64 elevated</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontFamily: T.sans, fontSize: 11, color: T.ink4, marginBottom: 3 }}>
            <span>Pending</span><span style={{ color: T.warn }}>3 drafts</span>
          </div>
          <div style={{ paddingTop: 10, borderTop: `1px solid ${T.border}`, marginTop: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <button onClick={() => router.push("/")} style={{ fontFamily: T.sans, fontSize: 11, color: T.ink4, cursor: "pointer" }}>
                ← Switch product
              </button>
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                style={{ fontFamily: T.sans, fontSize: 11, color: T.ink4, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
              >
                {theme === "dark" ? "☀" : "◑"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile bottom tab bar ── */}
      <div className="mobile-tab-bar">
        {MOBILE_NAV.map(item => {
          const active = isActive(item.href)
          return (
            <button
              key={item.key}
              onClick={() => navigate(item.href)}
              className="mobile-tab-item"
              data-active={active ? "true" : "false"}
              aria-label={item.label}
            >
              <NavIcon name={item.icon} size={22} />
            </button>
          )
        })}
        {/* Architecture as last tab on mobile */}
        <button
          onClick={() => navigate("/coach/architecture")}
          className="mobile-tab-item"
          data-active={pathname.startsWith("/coach/architecture") ? "true" : "false"}
          aria-label="Architecture"
        >
          <NavIcon name="architecture" size={22} />
        </button>
      </div>
    </>
  )
}
