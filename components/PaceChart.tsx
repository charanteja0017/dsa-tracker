"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceDot,
} from "recharts";
import type { Analytics } from "@/lib/types";
import { ACCENT, TEXT } from "@/lib/tokens";
import { APP_TZ } from "@/lib/tz";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const ts = (day: string) => Date.parse(`${day}T00:00:00Z`);
const fmtDay = (t: number) => {
  const d = new Date(t);
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}`;
};
const fmtFull = (t: number) => {
  const d = new Date(t);
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
};
function addDays(day: string, n: number): string {
  const d = new Date(`${day}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
const minDay = (a: string, b: string) => (a < b ? a : b);
const maxDay = (a: string, b: string) => (a > b ? a : b);

// Near-term cumulative-solved (actual) vs the ideal pace line, zoomed to a few
// days back through next week. One point per day so hover shows that day's
// target + solved, and the actual line steps up with each completion.
export function PaceChart({
  cumulative,
  range,
  solved,
}: {
  cumulative: Analytics["cumulative"];
  range: Analytics["range"];
  solved: number;
}) {
  const planStartTs = ts(range.start);
  const phase1Ts = ts(range.phase1);
  const span = phase1Ts - planStartTs || 1;
  const idealAt = (t: number) =>
    Math.round(range.total * Math.min(1, Math.max(0, (t - planStartTs) / span)));

  const today = new Intl.DateTimeFormat("en-CA", { timeZone: APP_TZ }).format(
    new Date()
  );
  const earliest = cumulative.length ? cumulative[0].date : today;

  // Window: ~2 days back (or first activity, capped at a week back) → 1 week ahead.
  const windowStart = maxDay(
    addDays(today, -7),
    minDay(addDays(today, -2), earliest)
  );
  const windowEnd = minDay(range.phase1, addDays(today, 7));

  const data: { t: number; ideal: number; actual: number | null }[] = [];
  let di = 0;
  let running = 0;
  for (let day = windowStart; day <= windowEnd; day = addDays(day, 1)) {
    while (di < cumulative.length && cumulative[di].date <= day) {
      running = cumulative[di].total;
      di++;
    }
    const t = ts(day);
    let actual: number | null = day > today ? null : running;
    if (day === today) actual = Math.max(running, solved); // live count
    data.push({ t, ideal: idealAt(t), actual });
  }

  const todayTs = ts(today);
  const solvedNow = Math.max(running, solved);
  const yMax = Math.max(5, solvedNow, idealAt(ts(windowEnd)));
  const niceMax = Math.ceil((yMax + 1) / 5) * 5;

  const ticks: number[] = [];
  for (let day = windowStart; day <= windowEnd; day = addDays(day, 2)) {
    ticks.push(ts(day));
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 10, right: 14, bottom: 0, left: -16 }}>
        <CartesianGrid stroke={TEXT.grid} strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="t"
          type="number"
          domain={[ts(windowStart), ts(windowEnd)]}
          ticks={ticks}
          tickFormatter={fmtDay}
          tick={{ fill: TEXT.muted, fontSize: 11 }}
          stroke={TEXT.grid}
          minTickGap={16}
        />
        <YAxis
          domain={[0, niceMax]}
          allowDecimals={false}
          tick={{ fill: TEXT.muted, fontSize: 11 }}
          stroke={TEXT.grid}
          width={34}
        />
        <Tooltip
          contentStyle={{
            background: "#14141c",
            border: "1px solid #1f1f2a",
            borderRadius: 8,
            fontSize: 12,
          }}
          labelStyle={{ color: "#cbd5e1" }}
          labelFormatter={(t) => fmtFull(t as number)}
          formatter={(value, name) => [
            value as number,
            name === "ideal" ? "Target" : "Solved",
          ]}
        />
        <Line
          type="monotone"
          dataKey="ideal"
          name="ideal"
          stroke={TEXT.muted}
          strokeWidth={1.5}
          strokeDasharray="5 4"
          dot={false}
          isAnimationActive={false}
        />
        <Line
          type="monotone"
          dataKey="actual"
          name="actual"
          stroke={ACCENT}
          strokeWidth={2.5}
          dot={{ r: 2.5, fill: ACCENT, strokeWidth: 0 }}
          connectNulls={false}
          isAnimationActive={false}
        />
        <ReferenceDot
          x={todayTs}
          y={solvedNow}
          r={4}
          fill={ACCENT}
          stroke="#0a0a0f"
          strokeWidth={2}
          label={{
            value: String(solvedNow),
            position: "top",
            fill: "#a5f3fc",
            fontSize: 11,
          }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
