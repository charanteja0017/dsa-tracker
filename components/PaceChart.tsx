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
const fmtMonth = (t: number) => MONTHS[new Date(t).getUTCMonth()];
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

function dayTicks(start: string, end: string, step: number): number[] {
  const out: number[] = [];
  for (let day = start; day <= end; day = addDays(day, step)) out.push(ts(day));
  return out;
}
function monthTicks(start: string, end: string): number[] {
  const out: number[] = [];
  const s = new Date(`${start}T00:00:00Z`);
  let cur = Date.UTC(s.getUTCFullYear(), s.getUTCMonth(), 1);
  while (cur < ts(start)) {
    const d = new Date(cur);
    cur = Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1);
  }
  while (cur <= ts(end)) {
    out.push(cur);
    const d = new Date(cur);
    cur = Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1);
  }
  return out;
}

// Cumulative solved (actual) vs the ideal pace line. `mode` switches between a
// near-term rolling window (a few days back → next week) and the full plan
// (start → Phase 1). One point per day, so hover shows each day's target +
// solved, and the actual line steps up with every completion.
export function PaceChart({
  cumulative,
  range,
  solved,
  mode = "near",
  projectedFinish = null,
}: {
  cumulative: Analytics["cumulative"];
  range: Analytics["range"];
  solved: number;
  mode?: "near" | "full";
  projectedFinish?: string | null;
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

  const full = mode === "full";
  // In the full view, trace a dashed projection from today to the forecast
  // finish (extending the axis past Phase 1 if you're trending late). Cap how
  // far it can stretch the axis so a very slow pace can't blow up the chart —
  // the caption below still reports the true date.
  const projCap = addDays(range.phase1, 180);
  const projFinish =
    full && projectedFinish && projectedFinish <= projCap
      ? maxDay(projectedFinish, today)
      : null;
  const windowStart = full
    ? minDay(earliest, range.start)
    : maxDay(addDays(today, -7), minDay(addDays(today, -2), earliest));
  const windowEnd = full
    ? maxDay(range.phase1, projFinish ?? range.phase1)
    : minDay(range.phase1, addDays(today, 7));

  const data: {
    t: number;
    ideal: number;
    actual: number | null;
    projected: number | null;
  }[] = [];
  let di = 0;
  let running = 0;
  for (let day = windowStart; day <= windowEnd; day = addDays(day, 1)) {
    while (di < cumulative.length && cumulative[di].date <= day) {
      running = cumulative[di].total;
      di++;
    }
    const t = ts(day);
    let actual: number | null = day > today ? null : running;
    let projected: number | null = null;
    if (day === today) {
      actual = Math.max(running, solved); // live count
      if (projFinish) projected = actual; // projection starts at today's total
    } else if (projFinish && day === projFinish) {
      projected = range.total; // …and ends when everything is solved
    }
    data.push({ t, ideal: idealAt(t), actual, projected });
  }

  const todayTs = ts(today);
  const solvedNow = Math.max(running, solved);
  const niceMax = full
    ? range.total
    : Math.ceil((Math.max(5, solvedNow, idealAt(ts(windowEnd))) + 1) / 5) * 5;
  const ticks = full
    ? monthTicks(windowStart, windowEnd)
    : dayTicks(windowStart, windowEnd, 2);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 34, right: 16, bottom: 24, left: -14 }}>
        <CartesianGrid stroke={TEXT.grid} strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="t"
          type="number"
          domain={[ts(windowStart), ts(windowEnd)]}
          ticks={ticks}
          tickFormatter={full ? fmtMonth : fmtDay}
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
            name === "ideal"
              ? "Target"
              : name === "projected"
              ? "Projected"
              : "Solved",
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
        {projFinish && (
          <Line
            type="linear"
            dataKey="projected"
            name="projected"
            stroke={ACCENT}
            strokeWidth={1.5}
            strokeDasharray="2 5"
            strokeOpacity={0.55}
            dot={false}
            connectNulls
            isAnimationActive={false}
          />
        )}
        <Line
          type="monotone"
          dataKey="actual"
          name="actual"
          stroke={ACCENT}
          strokeWidth={2.5}
          dot={full ? false : { r: 2.5, fill: ACCENT, strokeWidth: 0 }}
          connectNulls={false}
          isAnimationActive={false}
        />
        {projFinish && (
          <ReferenceDot
            x={ts(projFinish)}
            y={range.total}
            r={3.5}
            fill="#0a0a0f"
            stroke={ACCENT}
            strokeWidth={1.5}
          />
        )}
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
