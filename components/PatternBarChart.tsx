"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import type { Analytics } from "@/lib/types";
import { COLORS, patternColor } from "@/lib/colors";

// Solved / total per pattern, sorted by frequency, color-coded. The colored
// segment is "done"; the faint segment is what remains.
export function PatternBarChart({
  byPattern,
}: {
  byPattern: Analytics["byPattern"];
}) {
  const data = byPattern.map((p, i) => ({
    pattern: p.pattern,
    done: p.done,
    remaining: p.total - p.done,
    total: p.total,
    color: patternColor(i),
  }));
  const height = Math.max(220, data.length * 30 + 16);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 0, right: 12, bottom: 0, left: 4 }}
        barCategoryGap={6}
      >
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="pattern"
          width={132}
          tick={{ fill: COLORS.text, fontSize: 11 }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          cursor={{ fill: "#ffffff08" }}
          contentStyle={{
            background: "#14141c",
            border: "1px solid #1f1f2a",
            borderRadius: 8,
            fontSize: 12,
          }}
          labelStyle={{ color: "#cbd5e1" }}
          formatter={(value, name) => [
            value as number,
            name === "done" ? "Done" : "Remaining",
          ]}
        />
        <Bar dataKey="done" stackId="a" radius={[3, 0, 0, 3]}>
          {data.map((d) => (
            <Cell key={d.pattern} fill={d.color} />
          ))}
        </Bar>
        <Bar dataKey="remaining" stackId="a" fill="#1f1f2a" radius={[0, 3, 3, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
