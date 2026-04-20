import ClientSidebar from "@/components/ClientSidebar"
import { ChatWidget } from "@/components/ChatWidget"

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "var(--bg)" }}>
      <ClientSidebar />
      <div style={{ flex: 1, overflow: "auto" }}>
        {children}
      </div>
      <ChatWidget />
    </div>
  )
}
