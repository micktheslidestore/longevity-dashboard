import type { Metadata } from "next"
import "./globals.css"
import Nav from "@/components/Nav"

export const metadata: Metadata = {
  title: "Health Intelligence",
  description: "Personal longevity dashboard",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex" style={{ backgroundColor: "var(--bg-base)", color: "var(--text-primary)" }}>
        <Nav />
        <main className="flex-1 ml-16 min-h-screen overflow-y-auto">
          {children}
        </main>
      </body>
    </html>
  )
}
