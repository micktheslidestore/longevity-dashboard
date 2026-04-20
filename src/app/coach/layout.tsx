import CoachSidebar from "@/components/CoachSidebar"

export default function CoachLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "var(--bg)" }}>
      <CoachSidebar />
      <div style={{ flex: 1, overflow: "auto" }}>
        {children}
      </div>
    </div>
  )
}
