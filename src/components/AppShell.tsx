"use client"

import { usePathname } from "next/navigation"
import Sidebar from "./Sidebar"
import Topbar from "./Topbar"

// Routes where the OLD shell (sidebar + topbar) still wraps content.
// /client/* and /coach/* provide their own shells.
// / is the landing gate — no shell.
const NEW_ROUTES = ["/", "/client", "/coach"]

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isNew = pathname === "/" ||
    pathname.startsWith("/client") ||
    pathname.startsWith("/coach")

  if (isNew) return <>{children}</>

  return (
    <div className="app">
      <Sidebar />
      <div className="main">
        <Topbar />
        <div className="screen">{children}</div>
      </div>
    </div>
  )
}
