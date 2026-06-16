import { ImageResponse } from "next/og";
import { sql, PLAN, APP_TZ } from "@/lib/db";
import { currentStreak } from "@/lib/streak";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const alt = "DSA Placement Tracker — live progress";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Snapshot = {
  solved: number;
  total: number;
  percent: number;
  streak: number;
  weekNum: number;
  daysToPhase1: number;
};

async function snapshot(): Promise<Snapshot> {
  const [{ solved, total }] = await sql`
    SELECT COUNT(*) FILTER (WHERE done)::int AS solved, COUNT(*)::int AS total
    FROM problems;
  `;
  const rows = await sql`
    SELECT DISTINCT to_char((done_at AT TIME ZONE ${APP_TZ})::date, 'YYYY-MM-DD') AS d
    FROM problems WHERE done AND done_at IS NOT NULL;
  `;
  const streak = currentStreak(new Set(rows.map((r) => r.d as string)));
  const dayMs = 864e5;
  const weekNum = Math.max(
    1,
    Math.floor((Date.now() - new Date(PLAN.startDate).getTime()) / (7 * dayMs)) + 1
  );
  const daysToPhase1 = Math.ceil(
    (new Date(PLAN.phase1Date).getTime() - Date.now()) / dayMs
  );
  return {
    solved,
    total,
    percent: total > 0 ? Math.round((solved / total) * 100) : 0,
    streak,
    weekNum,
    daysToPhase1,
  };
}

function Stat({
  value,
  label,
  color,
}: {
  value: string;
  label: string;
  color: string;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ fontSize: 132, fontWeight: 800, lineHeight: 1, color }}>
        {value}
      </div>
      <div style={{ fontSize: 26, color: "#94a3b8", marginTop: 10 }}>{label}</div>
    </div>
  );
}

export default async function OgImage() {
  let s: Snapshot;
  try {
    s = await snapshot();
  } catch {
    s = { solved: 0, total: 0, percent: 0, streak: 0, weekNum: 1, daysToPhase1: 0 };
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #0a0a0f 0%, #14141c 100%)",
          color: "#e6e9ef",
          padding: 64,
          fontFamily: "sans-serif",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div
              style={{
                display: "flex",
                width: 60,
                height: 60,
                borderRadius: 14,
                background: "#0f1620",
                border: "1px solid #1f1f2a",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
                <path
                  d="M5 12.5l4.2 4.2L19 7.3"
                  stroke="#22d3ee"
                  strokeWidth="3.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: 38, fontWeight: 800, color: "#f8fafc" }}>
                CDSA
              </div>
              <div style={{ fontSize: 22, color: "#94a3b8" }}>
                DSA Placement Tracker
              </div>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              fontSize: 24,
              color: "#cbd5e1",
              border: "1px solid #1f1f2a",
              borderRadius: 999,
              padding: "12px 24px",
              background: "#14141c",
            }}
          >
            Week {s.weekNum} of 23 · {s.daysToPhase1}d to Phase 1
          </div>
        </div>

        {/* Stats */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 30px",
          }}
        >
          <Stat value={`${s.solved}`} label={`solved of ${s.total}`} color="#f8fafc" />
          <div style={{ display: "flex", width: 1, height: 150, background: "#1f1f2a" }} />
          <Stat value={`${s.streak}`} label="day streak" color="#fb923c" />
          <div style={{ display: "flex", width: 1, height: 150, background: "#1f1f2a" }} />
          <Stat value={`${s.percent}%`} label="complete" color="#22d3ee" />
        </div>

        {/* Progress bar */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 22,
              color: "#94a3b8",
            }}
          >
            <div style={{ display: "flex" }}>Progress to {s.total}</div>
            <div style={{ display: "flex" }}>
              {s.solved}/{s.total}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              width: "100%",
              height: 28,
              borderRadius: 999,
              background: "#1a1a24",
              border: "1px solid #1f1f2a",
            }}
          >
            <div
              style={{
                display: "flex",
                width: `${Math.max(2, s.percent)}%`,
                height: "100%",
                borderRadius: 999,
                background: "#22d3ee",
              }}
            />
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
