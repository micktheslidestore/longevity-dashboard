import type { Metadata } from "next"
import "./globals.css"
import { AppProviders } from "@/components/RoleContext"
import Sidebar from "@/components/Sidebar"
import Topbar from "@/components/Topbar"

export const metadata: Metadata = {
  title: "Allostatic",
  description: "Health intelligence platform",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppProviders>
          <div className="app">
            <Sidebar />
            <div className="main">
              <Topbar />
              <div className="screen">
                {children}
              </div>
            </div>
          </div>
        </AppProviders>
      </body>
    </html>
  )
}
