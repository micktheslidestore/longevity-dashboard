"use client"

import { usePathname, useRouter } from "next/navigation"
import { useEffect } from "react"
import { useApp } from "./RoleContext"
import { NavIcon, type IconKey } from "./NavIcons"
import { T } from "./Primitives"

const NAV: { key: string; icon: IconKey; label: string; href: string }[] = [
  { key: "dashboard", icon: "dashboard", label: "Dashboard", href: "/client" },
  { key: "command",   icon: "command",   label: "Command",   href: "/client/command" },
  { key: "checkin",   icon: "checkin",   label: "Check-in",  href: "/client/checkin" },
  { key: "trends",    icon: "trends",    label: "Trends",    href: "/client/trends" },
  { key: "medical",   icon: "medical",   label: "Medical",   href: "/client/medical" },
  { key: "team",      icon: "team",      label: "Team",      href: "/client/team" },
]

export default function ClientSidebar() {
  const pathname = usePathname()
  const router   = useRouter()
  const { setRole } = useApp()

  useEffect(() => { setRole("james") }, [setRole])

  function isActive(href: string) {
    if (href === "/client") return pathname === "/client"
    return pathname.startsWith(href)
  }

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <div className="client-sidebar" style={{
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
            Your programme
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "4px 0" }}>
          {NAV.map(item => {
            const active = isActive(item.href)
            return (
              <button
                key={item.key}
                onClick={() => router.push(item.href)}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  width: "100%", padding: "9px 20px",
                  fontFamily: T.sans, fontSize: 13, fontWeight: active ? 500 : 400,
                  color: active ? T.ink : T.ink3,
                  background: active ? T.surfaceRaised : "transparent",
                  borderLeft: `2px solid ${active ? T.accent : "transparent"}`,
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
        <div style={{ padding: "14px 20px", borderTop: `1px solid ${T.border}`, marginTop: "auto" }}>
          <div style={{ fontFamily: T.sans, fontSize: 12, color: T.ink, marginBottom: 2 }}>Jamie Garis · 54M</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: T.ok, flexShrink: 0, animation: "pulse 2.4s ease-in-out infinite" }} />
            <span style={{ fontFamily: T.sans, fontSize: 11, color: T.ok }}>Synced 06:41</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontFamily: T.sans, fontSize: 11, color: T.ink4, marginBottom: 2 }}>
            <span>AL score</span>
            <span style={{ color: T.warn }}>64</span>
          </div>
          <div style={{ paddingTop: 10, borderTop: `1px solid ${T.border}`, marginTop: 8 }}>
            <button onClick={() => router.push("/")} style={{ fontFamily: T.sans, fontSize: 11, color: T.ink4, cursor: "pointer" }}>
              ← Switch product
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile bottom tab bar ── */}
      <div className="mobile-tab-bar">
        {NAV.map(item => {
          const active = isActive(item.href)
          return (
            <button
              key={item.key}
              onClick={() => router.push(item.href)}
              className="mobile-tab-item"
              data-active={active ? "true" : "false"}
              aria-label={item.label}
            >
              <NavIcon name={item.icon} size={22} />
            </button>
          )
        })}
      </div>
    </>
  )
}
