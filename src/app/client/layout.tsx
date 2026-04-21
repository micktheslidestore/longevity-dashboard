"use client"

import ClientSidebar from "@/components/ClientSidebar"
import { ChatWidget } from "@/components/ChatWidget"

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "var(--bg)" }}>
      <ClientSidebar />
      <div className="content-scroll" style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
        {children}
      </div>
      <ChatWidget />
    </div>
  )
}
