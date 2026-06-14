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

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

// Cumulative solved (actual) vs the linear ideal pace needed to finish all
// `total` problems by Phase 1. Actual ends at a "now" dot labeled with the
// current solved count; y-axis ceiling is the dynamic total.
export function PaceChart({
  cumulative,
  range,
  solved,
}: {
  cumulative: Analytics["cumulative"];
  range: Analytics["range"];
  solved: number;
}) {
  const startTs = new Date(range.start).getTime();
  const endTs = new Date(range.phase1).getTime();
  const span = endTs - startTs || 1;
  const nowTs = Date.now();
  const idealAt = (t: number) =>
    Math.round(range.total * Math.min(1, Math.max(0, (t - startTs) / span)));

  const data: { t: number; ideal: number; actual: number | null }[] = [
    { t: startTs, ideal: 0, actual: 0 },
  ];
  for (const c of cumulative) {
    const t = new Date(c.date).getTime();
    data.push({ t, ideal: idealAt(t), actual: c.total });
  }
  data.push({ t: nowTs, ideal: idealAt(nowTs), actual: solved });
  data.push({ t: endTs, ideal: range.total, actual: null });
  data.sort((a, b) => a.t - b.t);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -14 }}>
        <CartesianGrid stroke={TEXT.grid} strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="t"
          type="number"
          domain={[startTs, endTs]}
          tickFormatter={(t) => MONTHS[new Date(t).getUTCMonth()]}
          tick={{ fill: TEXT.muted, fontSize: 11 }}
          stroke={TEXT.grid}
          minTickGap={20}
        />
        <YAxis
          domain={[0, range.total]}
          tick={{ fill: TEXT.muted, fontSize: 11 }}
          stroke={TEXT.grid}
          width={40}
        />
        <Tooltip
          contentStyle={{
            background: "#14141c",
            border: "1px solid #1f1f2a",
            borderRadius: 8,
            fontSize: 12,
          }}
          labelStyle={{ color: "#cbd5e1" }}
          labelFormatter={(t) => new Date(t as number).toISOString().slice(0, 10)}
        />
        <Line
          type="monotone"
          dataKey="ideal"
          name="Ideal"
          stroke={TEXT.muted}
          strokeWidth={1.5}
          strokeDasharray="5 4"
          dot={false}
          isAnimationActive={false}
        />
        <Line
          type="monotone"
          dataKey="actual"
          name="Actual"
          stroke={ACCENT}
          strokeWidth={2.5}
          dot={false}
          connectNulls={false}
          isAnimationActive={false}
        />
        <ReferenceDot
          x={nowTs}
          y={solved}
          r={4}
          fill={ACCENT}
          stroke="#0a0a0f"
          strokeWidth={2}
          label={{
            value: String(solved),
            position: "top",
            fill: "#c7d2fe",
            fontSize: 11,
          }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
