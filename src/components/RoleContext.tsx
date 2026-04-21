"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

type Role = "james" | "darcy"
type Accent = "amber" | "teal" | "cool"
type Theme = "dark" | "light"

interface AppContextType {
  role: Role
  setRole: (r: Role) => void
  accent: Accent
  setAccent: (a: Accent) => void
  theme: Theme
  setTheme: (t: Theme) => void
}

const AppContext = createContext<AppContextType | null>(null)

export function AppProviders({ children }: { children: ReactNode }) {
  // Role is always set by the sidebar (ClientSidebar → "james", CoachSidebar → "darcy").
  // Do NOT read role from localStorage on mount — that causes a hydration mismatch
  // because SSR renders "james" but the client may have stored "darcy".
  const [role, setRole] = useState<Role>("james")
  const [accent, setAccent] = useState<Accent>("amber")
  const [theme, setTheme] = useState<Theme>("dark")

  // Read accent + theme from localStorage after hydration (SSR-safe: these affect
  // visual styling, not DOM structure, so a one-frame flash is acceptable)
  useEffect(() => {
    const savedAccent = localStorage.getItem("al_accent") as Accent | null
    const savedTheme  = localStorage.getItem("al_theme")  as Theme  | null
    if (savedAccent) setAccent(savedAccent)
    if (savedTheme)  setTheme(savedTheme)
  }, [])

  // Persist and apply to DOM
  useEffect(() => {
    localStorage.setItem("al_role", role)
    localStorage.setItem("al_accent", accent)
    localStorage.setItem("al_theme", theme)
    document.documentElement.setAttribute("data-theme", theme)
    document.documentElement.setAttribute("data-accent", accent)
  }, [role, accent, theme])

  return (
    <AppContext.Provider value={{ role, setRole, accent, setAccent, theme, setTheme }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error("useApp must be used within AppProviders")
  return ctx
}
