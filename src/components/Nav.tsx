"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Activity, TrendingUp, FlaskConical, ClipboardCheck, Users } from "lucide-react"

const links = [
  { href: "/", icon: Activity, label: "Today" },
  { href: "/trends", icon: TrendingUp, label: "Trends" },
  { href: "/medical", icon: FlaskConical, label: "Medical" },
  { href: "/checkin", icon: ClipboardCheck, label: "Check-in" },
  { href: "/team", icon: Users, label: "Team" },
]

export default function Nav() {
  const pathname = usePathname()
  return (
    <nav
      className="fixed left-0 top-0 h-screen w-16 flex flex-col items-center py-6 gap-1 z-50"
      style={{ backgroundColor: "var(--bg-surface)", borderRight: "1px solid var(--bg-border)" }}
    >
      <div className="mb-6">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
          style={{ backgroundColor: "var(--accent-teal)", color: "var(--bg-base)" }}
        >
          J
        </div>
      </div>
      {links.map(({ href, icon: Icon, label }) => {
        const active = pathname === href
        return (
          <Link
            key={href}
            href={href}
            title={label}
            className="w-10 h-10 rounded-lg flex items-center justify-center transition-all"
            style={{
              backgroundColor: active ? "var(--bg-elevated)" : "transparent",
              color: active ? "var(--accent-teal)" : "var(--text-muted)",
            }}
          >
            <Icon size={18} />
          </Link>
        )
      })}
    </nav>
  )
}
