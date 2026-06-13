"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import type { Analytics } from "@/lib/types";
import { COLORS } from "@/lib/colors";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];
const fmt = (d: string) => MONTHS[new Date(d).getUTCMonth()];

// Cumulative solved (actual) vs the linear ideal pace needed to hit `target`
// by Phase 1 — so I can see at a glance whether I'm ahead or behind.
export function PaceChart({
  cumulative,
  range,
}: {
  cumulative: Analytics["cumulative"];
  range: Analytics["range"];
}) {
  const tStart = new Date(range.start).getTime();
  const tEnd = new Date(range.phase1).getTime();
  const span = tEnd - tStart || 1;
  const idealAt = (date: string) => {
    const frac = Math.min(1, Math.max(0, (new Date(date).getTime() - tStart) / span));
    return Math.round(range.target * frac);
  };

  const last = cumulative.length ? cumulative[cumulative.length - 1].total : 0;
  const data = [
    { date: range.start, actual: 0, ideal: 0 },
    ...cumulative.map((c) => ({ date: c.date, actual: c.total, ideal: idealAt(c.date) })),
    { date: range.phase1, actual: last, ideal: range.target },
  ];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 6, right: 8, bottom: 0, left: -18 }}>
        <CartesianGrid stroke={COLORS.grid} strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={fmt}
          tick={{ fill: COLORS.text, fontSize: 11 }}
          stroke={COLORS.grid}
          minTickGap={24}
        />
        <YAxis
          domain={[0, range.target]}
          tick={{ fill: COLORS.text, fontSize: 11 }}
          stroke={COLORS.grid}
          width={42}
        />
        <Tooltip
          contentStyle={{
            background: "#14141c",
            border: "1px solid #1f1f2a",
            borderRadius: 8,
            fontSize: 12,
          }}
          labelStyle={{ color: "#cbd5e1" }}
          labelFormatter={(d) => new Date(d as string).toISOString().slice(0, 10)}
        />
        <Line
          type="monotone"
          dataKey="ideal"
          name="Ideal"
          stroke={COLORS.muted}
          strokeWidth={1.5}
          strokeDasharray="5 4"
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="actual"
          name="Actual"
          stroke={COLORS.accent}
          strokeWidth={2.5}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
