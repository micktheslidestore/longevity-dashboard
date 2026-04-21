import { useState } from "react";

// ─── Light theme design tokens ───────────────────────────────────────────────
const T = {
  bg: "#FAF8F4",
  surface: "#FFFFFF",
  surfaceRaised: "#F3F1EC",
  border: "rgba(30,28,24,0.08)",
  borderSubtle: "rgba(30,28,24,0.05)",
  borderMed: "rgba(30,28,24,0.12)",
  
  ink: "#1C1B18",
  ink2: "#52504A",
  ink3: "#8A877F",
  ink4: "#B8B4AC",
  
  ok: "#4D8A7A",
  okSubtle: "rgba(77,138,122,0.06)",
  okMuted: "rgba(77,138,122,0.12)",
  okText: "#3A7466",
  warn: "#A07D3A",
  warnSubtle: "rgba(160,125,58,0.05)",
  warnMuted: "rgba(160,125,58,0.10)",
  warnText: "#8A6A2E",
  alert: "#B05A4A",
  accent: "#A07D3A",
  
  serif: "'Source Serif 4', Georgia, serif",
  sans: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
  mono: "'IBM Plex Mono', ui-monospace, Menlo, monospace",
};

// ─── Mock data (matches james.ts) ────────────────────────────────────────────
const AL_SCORE = 64;
const DOMAINS = [
  { name: "Autonomic", z: 1.82, label: "Flag active" },
  { name: "Sleep", z: 0.94, label: "Watch" },
  { name: "Metabolic", z: -0.12, label: "Stable" },
  { name: "Inflammatory", z: 0.08, label: "Stable" },
];

const NARRATIVE = {
  title: "You are carrying three nights of incomplete recovery.",
  body: "Resting HR has been +4 bpm for three consecutive nights, HRV sits 11 ms below your 30-day mean, and skin temperature has crept +0.4 °C. The signature resembles the early phase of your February setback.",
  action: "Convert today's scheduled lactate session into zone-2 or mobility. Protect sleep onset.",
  from: "Darcy O'Sullivan",
  time: "06:14 · 19 Apr",
};

const CORRECTOR = {
  title: "Hold all intensity training",
  body: "Zone-2 only (HR below 135 bpm) or full rest until HRV stabilises above 44 ms for 2 consecutive nights.",
  from: "Darcy",
  issued: "17 Apr",
  day: 3,
  lifecycle: "active",
  lifecycleNext: "Resolves when HRV > 44ms for 2 nights",
};

const NORTHSTAR = {
  label: "Q3 2026 target",
  statement: "Lower ApoB to ≤ 70 mg/dL while holding HRV above 48 ms.",
  daysLeft: 68,
  tracks: [
    { name: "ApoB", now: 84, target: 70, unit: "mg/dL", progress: 0.48, dir: "↓" },
    { name: "HRV floor", now: 41, target: 48, unit: "ms", progress: 0.22, dir: "↑" },
    { name: "VO₂max", now: 47.8, target: 50, unit: "ml/kg/min", progress: 0.36, dir: "↑" },
    { name: "Visceral fat", now: 6.1, target: 5.0, unit: "%", progress: 0.55, dir: "↓" },
  ],
};

const WEEK = [
  { dow: "Mon", day: "20", today: true, type: "rest", label: "Rest day", hr: null },
  { dow: "Tue", day: "21", today: false, type: "zone2", label: "Zone-2 run", hr: "45 min" },
  { dow: "Wed", day: "22", today: false, type: "test", label: "DEXA + VO₂max", hr: "08:30" },
  { dow: "Thu", day: "23", today: false, type: "zone2", label: "Zone-2", hr: "45 min" },
  { dow: "Fri", day: "24", today: false, type: "mobility", label: "Mobility", hr: "30 min" },
  { dow: "Sat", day: "25", today: false, type: "zone2", label: "Zone-2 run", hr: "50 min" },
  { dow: "Sun", day: "26", today: false, type: "rest", label: "Rest", hr: null },
];

const DIRECTIVES = [
  { body: "Jamie — write in this morning's check-in how board-cycle stress feels different this quarter than Q1. We may need to formalise a pre-quarter protocol before the July cycle.", time: "17 Apr · 06:14", lifecycle: "signed" },
  { body: "Your resting HR elevation over the past 72 hours is tracking the board prep cycle. An 8-minute breathing sequence at 14:45 today, before the coaching call, will help.", time: "17 Apr · 06:16", lifecycle: "signed" },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
const domainColor = (z) => z > 1 ? T.alert : z > 0.3 ? T.warnText : T.okText;
const typeColor = { zone2: T.okText, test: T.warnText, mobility: T.accent, rest: T.ink4, recovery: T.ink3 };

// ─── Lifecycle chip (light theme) ────────────────────────────────────────────
function LifecycleChip({ status, showTooltip = true }) {
  const [hover, setHover] = useState(false);
  const configs = {
    active: { label: "Active", color: T.warnText, bg: T.warnSubtle, def: "Live intervention — compliance tracking in progress" },
    signed: { label: "Signed", color: T.okText, bg: T.okSubtle, def: "Approved by Darcy — visible to you" },
    draft: { label: "Draft", color: T.ink3, bg: "rgba(0,0,0,0.04)", def: "Under review — not yet published" },
    pending: { label: "Pending", color: T.ink3, bg: "rgba(0,0,0,0.04)", def: "Awaiting enough data to evaluate" },
    effective: { label: "Effective", color: T.okText, bg: T.okSubtle, def: "Protocol is working — sustained improvement detected" },
    monitoring: { label: "Monitoring", color: T.warnText, bg: T.warnSubtle, def: "Data accumulating — trend not yet conclusive" },
    partial: { label: "Partial", color: T.ink3, bg: "rgba(0,0,0,0.04)", def: "Some improvement, below target threshold" },
  };
  const c = configs[status] || configs.pending;
  return (
    <span
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ position: "relative", display: "inline-flex", alignItems: "center" }}
    >
      <span style={{
        display: "inline-flex", alignItems: "center", gap: 5,
        fontSize: 11, fontFamily: T.sans, fontWeight: 500, letterSpacing: "0.02em",
        color: c.color, padding: "3px 10px",
        background: c.bg, borderRadius: 20,
      }}>
        <span style={{ width: 5, height: 5, borderRadius: "50%", background: c.color }} />
        {c.label}
      </span>
      {showTooltip && hover && (
        <span style={{
          position: "absolute", bottom: "calc(100% + 8px)", left: 0,
          background: T.surface, border: `1px solid ${T.borderMed}`,
          padding: "8px 12px", borderRadius: 8, fontSize: 12, color: T.ink2,
          lineHeight: 1.5, width: 220, zIndex: 10,
          boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
        }}>
          {c.def}
        </span>
      )}
    </span>
  );
}

// ─── Progress ring (light) ───────────────────────────────────────────────────
function ScoreRing({ score, size = 140 }) {
  const band = score >= 70 ? { label: "Elevated", color: T.alert }
    : score >= 50 ? { label: "Watch", color: T.warnText }
    : { label: "Stable", color: T.okText };
  const r = (size - 12) / 2;
  const c = Math.PI * 2 * r;
  const pct = score / 100;
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={T.borderMed} strokeWidth={4} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={band.color} strokeWidth={4}
          strokeDasharray={`${pct * c} ${c}`} strokeLinecap="round"
          style={{ transition: "stroke-dasharray 1s ease" }} />
      </svg>
      <div style={{
        position: "absolute", inset: 0, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
      }}>
        <span style={{ fontFamily: T.mono, fontSize: 36, fontWeight: 300, color: band.color, lineHeight: 1, letterSpacing: "-0.03em" }}>
          {score}
        </span>
        <span style={{ fontFamily: T.sans, fontSize: 11, color: band.color, marginTop: 2, fontWeight: 500 }}>
          {band.label}
        </span>
      </div>
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────
export default function ClientDashboardLight() {
  const [correctorAck, setCorrectorAck] = useState(false);

  return (
    <div style={{
      minHeight: "100vh",
      background: T.bg,
      color: T.ink,
      fontFamily: T.sans,
      fontSize: 14,
      lineHeight: 1.65,
      WebkitFontSmoothing: "antialiased",
    }}>
      <div style={{ display: "flex" }}>
        {/* ── Sidebar ── */}
        <div style={{
          width: 200, minWidth: 200, height: "100vh", position: "sticky", top: 0,
          borderRight: `1px solid ${T.borderSubtle}`,
          padding: "28px 20px", display: "flex", flexDirection: "column",
          background: T.surface,
        }}>
          <div style={{ fontFamily: T.serif, fontSize: 18, color: T.ink, marginBottom: 4 }}>
            Allostatic<span style={{ fontStyle: "italic", color: T.ink3 }}>.</span>
          </div>
          <div style={{ fontSize: 11, color: T.okText, fontWeight: 500, marginBottom: 32 }}>
            Your programme
          </div>
          
          {["Dashboard", "Command", "Check-in", "Trends", "Medical", "Team"].map((item, i) => (
            <div key={item} style={{
              padding: "10px 12px", marginBottom: 2, borderRadius: 8,
              fontSize: 13, color: i === 0 ? T.ink : T.ink3,
              background: i === 0 ? T.surfaceRaised : "transparent",
              cursor: "pointer", transition: "all 0.15s",
              fontWeight: i === 0 ? 500 : 400,
            }}>
              {item}
            </div>
          ))}
          
          <div style={{ marginTop: "auto" }}>
            <div style={{ fontSize: 12, color: T.ink3, marginBottom: 4 }}>Jamie Garis · 54M</div>
            <div style={{
              display: "flex", alignItems: "center", gap: 6,
              fontSize: 11, color: T.okText,
            }}>
              <span style={{
                width: 6, height: 6, borderRadius: "50%", background: T.okText,
                animation: "pulse-light 2.4s ease-in-out infinite",
              }} />
              Synced 06:41
            </div>
          </div>
        </div>

        {/* ── Main content ── */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* ── Topbar ── */}
          <div style={{
            height: 52, borderBottom: `1px solid ${T.borderSubtle}`,
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "0 40px", position: "sticky", top: 0, zIndex: 10,
            background: T.bg,
          }}>
            <span style={{ fontSize: 12, color: T.ink3 }}>
              Sunday 19 April 2026
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <span style={{ fontSize: 11, color: T.ink4 }}>
                Garmin · Oura · Withings
              </span>
              <button style={{
                fontSize: 12, color: T.ink, background: T.surface,
                border: `1px solid ${T.borderMed}`, padding: "6px 14px", borderRadius: 8,
                cursor: "pointer", fontFamily: T.sans, fontWeight: 500,
              }}>
                Daily check-in
              </button>
            </div>
          </div>

          <div style={{ padding: "48px 48px 80px", maxWidth: 960, margin: "0 auto" }}>
            
            {/* ═══ SECTION 1: Morning card ═══ */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 48, alignItems: "start", marginBottom: 56 }}>
              <div>
                <div style={{ fontSize: 12, color: T.ink3, marginBottom: 12 }}>
                  Morning briefing · from {NARRATIVE.from}
                </div>
                <h1 style={{
                  fontFamily: T.serif, fontSize: 28, fontWeight: 300,
                  lineHeight: 1.4, letterSpacing: "-0.02em",
                  color: T.ink, margin: "0 0 16px", maxWidth: 520,
                }}>
                  {NARRATIVE.title}
                </h1>
                <p style={{ fontSize: 14, color: T.ink2, lineHeight: 1.75, margin: "0 0 20px", maxWidth: 520 }}>
                  {NARRATIVE.body}
                </p>
                <div style={{
                  padding: "14px 18px", borderRadius: 10,
                  background: T.okSubtle,
                  borderLeft: `3px solid ${T.okText}`,
                  maxWidth: 520,
                }}>
                  <div style={{ fontSize: 11, color: T.okText, fontWeight: 500, marginBottom: 4 }}>
                    What to do today
                  </div>
                  <div style={{ fontSize: 14, color: T.ink, lineHeight: 1.6 }}>
                    {NARRATIVE.action}
                  </div>
                </div>
              </div>
              
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, paddingTop: 8 }}>
                <div style={{ fontSize: 11, color: T.ink3, marginBottom: 4 }}>Allostatic load</div>
                <ScoreRing score={AL_SCORE} />
                <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8, width: "100%" }}>
                  {DOMAINS.map(d => {
                    const pct = Math.max(0, Math.min(100, Math.round(50 + (d.z / 3) * 50)));
                    return (
                      <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 11, color: T.ink3, width: 80, textAlign: "right" }}>{d.name}</span>
                        <div style={{ flex: 1, height: 3, background: T.borderMed, borderRadius: 2, overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${pct}%`, background: domainColor(d.z), borderRadius: 2, transition: "width 0.8s ease" }} />
                        </div>
                        <span style={{ fontSize: 10, color: domainColor(d.z), width: 36, fontFamily: T.mono }}>{d.z > 0 ? "+" : ""}{d.z.toFixed(1)}σ</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* ═══ SECTION 2: Active corrector ═══ */}
            {!correctorAck && (
              <div style={{
                padding: "28px 32px", borderRadius: 12,
                background: T.warnSubtle,
                border: `1px solid ${T.warnMuted}`,
                marginBottom: 56,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <LifecycleChip status="active" />
                    <span style={{ fontSize: 12, color: T.ink3 }}>Day {CORRECTOR.day} · issued {CORRECTOR.issued}</span>
                  </div>
                  <span style={{ fontSize: 11, color: T.ink4 }}>from {CORRECTOR.from}</span>
                </div>
                
                <h3 style={{ fontFamily: T.serif, fontSize: 20, fontWeight: 400, margin: "0 0 8px", color: T.ink }}>
                  {CORRECTOR.title}
                </h3>
                <p style={{ fontSize: 14, color: T.ink2, lineHeight: 1.7, margin: "0 0 16px", maxWidth: 560 }}>
                  {CORRECTOR.body}
                </p>
                
                <div style={{
                  display: "flex", alignItems: "center", gap: 8,
                  fontSize: 11, color: T.ink3, marginBottom: 20,
                  padding: "10px 14px", background: "rgba(0,0,0,0.03)", borderRadius: 8,
                }}>
                  <span style={{ color: T.ink4 }}>Draft</span>
                  <span style={{ color: T.ink4 }}>→</span>
                  <span style={{ color: T.warnText, fontWeight: 500 }}>● Active</span>
                  <span style={{ color: T.ink4 }}>→</span>
                  <span style={{ color: T.ink4 }}>Acknowledged</span>
                  <span style={{ color: T.ink4 }}>→</span>
                  <span style={{ color: T.ink4 }}>Resolved</span>
                  <span style={{ marginLeft: "auto", color: T.ink4, fontSize: 10 }}>
                    {CORRECTOR.lifecycleNext}
                  </span>
                </div>
                
                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    onClick={() => setCorrectorAck(true)}
                    style={{
                      fontFamily: T.sans, fontSize: 13, fontWeight: 500,
                      background: T.okText, color: "#fff", border: "none",
                      padding: "10px 24px", borderRadius: 8, cursor: "pointer",
                    }}
                  >
                    Acknowledge
                  </button>
                  <button style={{
                    fontFamily: T.sans, fontSize: 13,
                    background: "transparent", color: T.ink2,
                    border: `1px solid ${T.borderMed}`, padding: "10px 20px",
                    borderRadius: 8, cursor: "pointer",
                  }}>
                    Ask Darcy about this
                  </button>
                </div>
              </div>
            )}
            
            {correctorAck && (
              <div style={{
                padding: "16px 24px", borderRadius: 10,
                background: T.okSubtle, border: `1px solid ${T.okMuted}`,
                marginBottom: 56, display: "flex", alignItems: "center", gap: 12,
              }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: T.okText }} />
                <span style={{ fontSize: 13, color: T.okText }}>
                  Corrector acknowledged — Darcy has been notified. Compliance tracking active.
                </span>
              </div>
            )}

            {/* ═══ SECTION 3: North star ═══ */}
            <div style={{
              padding: "32px 36px", borderRadius: 14,
              background: T.surface,
              border: `1px solid ${T.border}`,
              marginBottom: 56,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
                <span style={{ fontSize: 11, color: T.ink3 }}>{NORTHSTAR.label}</span>
                <span style={{ fontSize: 11, color: T.ink3 }}>{NORTHSTAR.daysLeft} days remaining</span>
              </div>
              <p style={{
                fontFamily: T.serif, fontSize: 22, fontWeight: 300,
                lineHeight: 1.5, margin: "0 0 28px", color: T.ink,
                letterSpacing: "-0.01em", maxWidth: 480,
              }}>
                {NORTHSTAR.statement}
              </p>
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px 32px" }}>
                {NORTHSTAR.tracks.map(t => (
                  <div key={t.name}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
                      <span style={{ fontSize: 13, color: T.ink2 }}>{t.name}</span>
                      <span style={{ fontSize: 13, fontFamily: T.mono, color: T.ink }}>
                        {t.now} <span style={{ fontSize: 11, color: T.ink3 }}>{t.unit}</span>
                      </span>
                    </div>
                    <div style={{ height: 4, background: T.borderMed, borderRadius: 2, overflow: "hidden", marginBottom: 6 }}>
                      <div style={{
                        height: "100%", width: `${t.progress * 100}%`,
                        background: t.progress > 0.4 ? T.okText : T.warnText,
                        borderRadius: 2, transition: "width 0.8s ease",
                      }} />
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: T.ink4 }}>
                      <span>{t.dir} Target: {t.target} {t.unit}</span>
                      <span>{Math.round(t.progress * 100)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ═══ SECTION 4: Week strip ═══ */}
            <div style={{ marginBottom: 56 }}>
              <div style={{ fontSize: 12, color: T.ink3, marginBottom: 16 }}>
                This week · 20–26 Apr
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8 }}>
                {WEEK.map(d => (
                  <div key={d.day} style={{
                    padding: "14px 12px", borderRadius: 10,
                    background: d.today ? T.surface : T.surfaceRaised,
                    border: d.today ? `1px solid ${T.accent}44` : `1px solid ${T.border}`,
                    boxShadow: d.today ? `0 1px 4px rgba(160,125,58,0.08)` : "none",
                    cursor: "pointer", transition: "all 0.15s",
                  }}>
                    <div style={{ fontSize: 10, color: T.ink4, marginBottom: 2 }}>{d.dow}</div>
                    <div style={{
                      fontFamily: T.mono, fontSize: 20, fontWeight: 300,
                      color: d.today ? T.accent : T.ink, lineHeight: 1,
                      marginBottom: 10, letterSpacing: "-0.02em",
                    }}>
                      {d.day}
                    </div>
                    <div style={{
                      fontSize: 11, color: typeColor[d.type] || T.ink3,
                      lineHeight: 1.3, fontWeight: 500,
                    }}>
                      {d.label}
                    </div>
                    {d.hr && (
                      <div style={{ fontSize: 10, color: T.ink4, marginTop: 2 }}>{d.hr}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* ═══ SECTION 5: Directives ═══ */}
            <div style={{ marginBottom: 56 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 16 }}>
                <span style={{ fontSize: 12, color: T.ink3 }}>Directives from Darcy</span>
                <span style={{ fontSize: 11, color: T.ink4 }}>{DIRECTIVES.length} active</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {DIRECTIVES.map((d, i) => (
                  <div key={i} style={{
                    padding: "20px 24px", borderRadius: 12,
                    background: T.surface,
                    border: `1px solid ${T.border}`,
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                      <LifecycleChip status={d.lifecycle} />
                      <span style={{ fontSize: 11, color: T.ink4 }}>{d.time}</span>
                    </div>
                    <p style={{ fontSize: 14, color: T.ink2, lineHeight: 1.7, margin: 0 }}>
                      {d.body}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* ═══ SECTION 6: Sleep summary ═══ */}
            <div>
              <div style={{ fontSize: 12, color: T.ink3, marginBottom: 16 }}>
                Last night · sleep summary
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                {[
                  { label: "Total", value: "6h 12m", sub: null },
                  { label: "Deep", value: "54 min", sub: "below target" },
                  { label: "Efficiency", value: "82%", sub: null },
                  { label: "HRV overnight", value: "41 ms", sub: "−11 vs baseline" },
                ].map(m => (
                  <div key={m.label} style={{
                    padding: "16px 18px", borderRadius: 10,
                    background: T.surface,
                    border: `1px solid ${T.border}`,
                  }}>
                    <div style={{ fontSize: 11, color: T.ink3, marginBottom: 6 }}>{m.label}</div>
                    <div style={{ fontFamily: T.mono, fontSize: 22, fontWeight: 300, color: T.ink, letterSpacing: "-0.02em" }}>
                      {m.value}
                    </div>
                    {m.sub && <div style={{ fontSize: 11, color: T.warnText, marginTop: 4 }}>{m.sub}</div>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:ital,wght@0,300;0,400;1,300&family=DM+Sans:wght@400;500&family=IBM+Plex+Mono:wght@300;400&display=swap');
        @keyframes pulse-light { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: ${T.bg}; }
        ::-webkit-scrollbar-thumb { background: ${T.borderMed}; }
      `}</style>
    </div>
  );
}
