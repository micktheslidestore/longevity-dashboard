"use client"

import { usePathname } from "next/navigation"
import { useApp } from "./RoleContext"
import { useState } from "react"

const SCREENS = [
  { href: "/checkin", label: "Check-in" },
  { href: "/", label: "Today" },
  { href: "/trends", label: "Trends" },
  { href: "/medical", label: "Medical" },
  { href: "/team", label: "Team" },
]

const ACCENTS: Array<[string, string]> = [["amber", "#C8A56A"], ["teal", "#7FA99B"], ["cool", "#8FA0B3"]]

export default function Topbar() {
  const pathname = usePathname()
  const { accent, setAccent, theme, setTheme } = useApp()
  const [tweaksOpen, setTweaksOpen] = useState(false)

  const current = SCREENS.find(s => s.href === pathname || (s.href !== "/" && pathname.startsWith(s.href)))
  const label = current?.label || "Today"

  return (
    <>
      <div className="topbar">
        <div className="tb-left">
          <span><span className="pulse" />Live</span>
          <span className="tick">SEC · <strong>{label.toUpperCase()}</strong></span>
        </div>
        <div className="tb-right">
          <span className="tick">RHR <strong>52</strong></span>
          <span className="tick">HRV <strong>41</strong></span>
          <span className="tick">SLP <strong>6.2h</strong></span>
          <button
            onClick={() => setTweaksOpen(o => !o)}
            style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-3)", border: "1px solid var(--hair-strong)", padding: "4px 8px" }}
          >
            Tweaks
          </button>
        </div>
      </div>

      {tweaksOpen && (
        <div className="tweaks">
          <h4>Tweaks <span className="x" onClick={() => setTweaksOpen(false)}>close</span></h4>
          <div className="tweak-row">
            <span className="lbl">Theme</span>
            <div className="seg-mini">
              {(["dark", "light"] as const).map(t => (
                <button key={t} data-on={theme === t} onClick={() => setTheme(t)}>{t}</button>
              ))}
            </div>
          </div>
          <div className="tweak-row">
            <span className="lbl">Accent</span>
            <div className="swatches">
              {ACCENTS.map(([k, col]) => (
                <button key={k} data-on={accent === k} style={{ background: col }} onClick={() => setAccent(k as "amber" | "teal" | "cool")} />
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
