"use client"

import CoachSidebar from "@/components/CoachSidebar"
import { ChatWidget } from "@/components/ChatWidget"

export default function CoachLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "var(--bg)" }}>
      <CoachSidebar />
      <div className="content-scroll" style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
        {children}
      </div>
      <ChatWidget />
    </div>
  )
}
