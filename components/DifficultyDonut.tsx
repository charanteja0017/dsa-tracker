"use client";

import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import type { Analytics } from "@/lib/types";
import { DIFF_HEX } from "@/lib/colors";
import { Tag } from "./Tag";

// Donut of solved counts by difficulty, with total in the center.
export function DifficultyDonut({
  byDifficulty,
}: {
  byDifficulty: Analytics["byDifficulty"];
}) {
  const order = ["EASY", "MEDIUM", "HARD"] as const;
  const rows = order
    .map((d) => byDifficulty.find((b) => b.difficulty === d))
    .filter((r): r is Analytics["byDifficulty"][number] => Boolean(r));
  const data = rows.map((r) => ({
    name: r.difficulty,
    value: r.done,
    color: DIFF_HEX[r.difficulty],
  }));
  const totalDone = rows.reduce((s, r) => s + r.done, 0);
  const hasData = data.some((d) => d.value > 0);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative h-[150px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={hasData ? data : [{ name: "none", value: 1, color: "#1f1f2a" }]}
              dataKey="value"
              nameKey="name"
              innerRadius={48}
              outerRadius={68}
              paddingAngle={hasData ? 2 : 0}
              stroke="none"
            >
              {(hasData ? data : [{ name: "none", value: 1, color: "#1f1f2a" }]).map(
                (d) => (
                  <Cell key={d.name} fill={d.color} />
                )
              )}
            </Pie>
            {hasData && (
              <Tooltip
                contentStyle={{
                  background: "#14141c",
                  border: "1px solid #1f1f2a",
                  borderRadius: 8,
                  fontSize: 12,
                }}
                labelStyle={{ color: "#cbd5e1" }}
              />
            )}
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono text-2xl font-semibold tabular-nums text-slate-100">
            {totalDone}
          </span>
          <span className="text-[10px] uppercase tracking-wide text-slate-500">
            solved
          </span>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        {rows.map((r) => (
          <span key={r.difficulty} className="flex items-center gap-1">
            <Tag variant="difficulty" value={r.difficulty} />
            <span className="font-mono text-xs tabular-nums text-slate-400">
              {r.done}/{r.total}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
