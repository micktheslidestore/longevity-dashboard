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
  const [role, setRole] = useState<Role>("james")
  const [accent, setAccent] = useState<Accent>("amber")
  const [theme, setTheme] = useState<Theme>("dark")

  useEffect(() => {
    if (typeof window !== "undefined") {
      setRole((localStorage.getItem("al_role") as Role) || "james")
      setAccent((localStorage.getItem("al_accent") as Accent) || "amber")
      setTheme((localStorage.getItem("al_theme") as Theme) || "dark")
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("al_role", role)
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
