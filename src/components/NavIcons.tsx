export type IconKey = "command" | "dashboard" | "checkin" | "compliance" | "trends" | "medical" | "team" | "agent" | "architecture"

export function NavIcon({ name, size = 15 }: { name: IconKey; size?: number }) {
  const s = { width: size, height: size, display: "block" as const, flexShrink: 0 as const }
  switch (name) {
    case "command":
      return <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" style={s}>
        <rect x="1.5" y="1.5" width="5" height="5"/><rect x="9.5" y="1.5" width="5" height="5"/>
        <rect x="1.5" y="9.5" width="5" height="5"/><rect x="9.5" y="9.5" width="5" height="5"/>
      </svg>
    case "dashboard":
      return <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" style={s}>
        <rect x="1.5" y="1.5" width="7" height="7"/><rect x="10.5" y="1.5" width="4" height="4"/>
        <rect x="1.5" y="10.5" width="4" height="4"/><rect x="7.5" y="10.5" width="7" height="4"/>
        <rect x="10.5" y="7.5" width="4" height="1.5"/>
      </svg>
    case "checkin":
      return <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" style={s}>
        <circle cx="8" cy="8" r="6"/>
        <polyline points="5,8.5 7,10.5 11,6" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    case "compliance":
      return <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" style={s}>
        <rect x="3" y="2" width="10" height="12" rx="1"/>
        <line x1="5.5" y1="6" x2="10.5" y2="6"/><line x1="5.5" y1="8.5" x2="10.5" y2="8.5"/>
        <line x1="5.5" y1="11" x2="8" y2="11"/>
      </svg>
    case "trends":
      return <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" style={s}>
        <polyline points="1.5,12.5 5,8.5 8,10.5 14,4" strokeLinecap="round" strokeLinejoin="round"/>
        <line x1="1.5" y1="14.5" x2="14.5" y2="14.5"/>
      </svg>
    case "medical":
      return <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" style={s}>
        <line x1="8" y1="2" x2="8" y2="14" strokeLinecap="round"/>
        <line x1="2" y1="8" x2="14" y2="8" strokeLinecap="round"/>
      </svg>
    case "team":
      return <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" style={s}>
        <circle cx="5.5" cy="5" r="2.5"/><path d="M1 14c0-2.5 2-4.5 4.5-4.5S10 11.5 10 14" strokeLinecap="round"/>
        <circle cx="11.5" cy="5" r="2"/><path d="M11.5 9.5c2 0 3.5 1.5 3.5 3.5" strokeLinecap="round"/>
      </svg>
    case "agent":
      return <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" style={s}>
        <rect x="1.5" y="2.5" width="13" height="9" rx="1.5"/>
        <path d="M5 14.5l1.5-3h3l1.5 3" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="5.5" cy="7" r="0.9" fill="currentColor" stroke="none"/>
        <circle cx="8" cy="7" r="0.9" fill="currentColor" stroke="none"/>
        <circle cx="10.5" cy="7" r="0.9" fill="currentColor" stroke="none"/>
      </svg>
    case "architecture":
      return <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" style={s}>
        <circle cx="8" cy="8" r="2.5"/>
        <circle cx="2.5" cy="3" r="1.5"/><circle cx="13.5" cy="3" r="1.5"/><circle cx="8" cy="14" r="1.5"/>
        <line x1="3.7" y1="4.2" x2="6" y2="6.2"/><line x1="12.3" y1="4.2" x2="10" y2="6.2"/>
        <line x1="8" y1="10.5" x2="8" y2="12.5"/>
      </svg>
    default:
      return null
  }
}
