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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500&family=Inter+Tight:wght@300;400;500;600&family=Source+Serif+4:ital,opsz,wght@0,8..60,300;0,8..60,400;1,8..60,300;1,8..60,400&display=swap" rel="stylesheet" />
      </head>
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
