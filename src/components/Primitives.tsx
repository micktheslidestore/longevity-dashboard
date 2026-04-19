"use client"

import { useMemo } from "react"

export function Spark({
  data,
  color = "var(--accent)",
  width = 72,
  height = 22,
}: {
  data: number[]
  color?: string
  width?: number
  height?: number
}) {
  const path = useMemo(() => {
    if (!data || data.length < 2) return ""
    const min = Math.min(...data)
    const max = Math.max(...data)
    const range = max - min || 1
    const pts = data.map((v, i) => {
      const x = (i / (data.length - 1)) * width
      const y = height - ((v - min) / range) * (height - 2) - 1
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    return "M" + pts.join(" L")
  }, [data, width, height])

  if (!path) return null
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
    >
      <path d={path} fill="none" stroke={color} strokeWidth={1.2} />
    </svg>
  )
}

export function LifecycleChip({ lc }: { lc: string }) {
  const map: Record<string, string> = {
    signed: "Signed",
    draft: "Draft",
    "in-review": "In review",
    flag: "Flag",
  }
  return <span className={`lc-chip lc-${lc}`}>{map[lc] ?? lc}</span>
}
