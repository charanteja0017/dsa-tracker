"use client";

import { useState } from "react";
import type { ExamTopicStat } from "@/lib/examTypes";
import { A2Z_TOPICS } from "@/lib/topicMap";
import { topicColor, TEXT } from "@/lib/tokens";

// Donut of which topics your exam questions come from, colored per topic. Each
// arc is sized by how many questions you've been written (falls back to the
// pool distribution before you've taken any). Hover an arc/legend row to read
// the topic + count in the center.
export function ExamTopicRing({ byTopic }: { byTopic: ExamTopicStat[] }) {
  const order = new Map(A2Z_TOPICS.map((t, i) => [t, i]));
  const rows = [...byTopic].sort(
    (a, b) => (order.get(a.topic) ?? 99) - (order.get(b.topic) ?? 99)
  );
  const writtenTotal = rows.reduce((s, t) => s + t.written, 0);
  const poolTotal = rows.reduce((s, t) => s + t.total, 0);
  const useWritten = writtenTotal > 0;
  const valueOf = (t: ExamTopicStat) => (useWritten ? t.written : t.total);
  const unit = useWritten ? "written" : "in pool";
  const total = rows.reduce((s, t) => s + valueOf(t), 0) || 1;

  const size = 184;
  const stroke = 16;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const center = size / 2;

  let acc = 0;
  const segs = rows
    .filter((t) => valueOf(t) > 0)
    .map((t) => {
      const v = valueOf(t);
      const start = (acc / total) * c;
      const len = (v / total) * c;
      acc += v;
      return { topic: t.topic, color: topicColor(t.topic), len, start, value: v };
    });

  const [hover, setHover] = useState<string | null>(null);
  const hovered = segs.find((s) => s.topic === hover);

  return (
    <div className="flex flex-wrap items-center gap-6">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle
            cx={center}
            cy={center}
            r={r}
            fill="none"
            stroke={TEXT.grid}
            strokeWidth={stroke}
          />
          <g transform={`rotate(-90 ${center} ${center})`}>
            {segs.map((s) => {
              const len = Math.max(0, s.len - 1.5); // tiny gap between arcs
              return (
                <circle
                  key={s.topic}
                  cx={center}
                  cy={center}
                  r={r}
                  fill="none"
                  stroke={s.color}
                  strokeWidth={hover === s.topic ? stroke + 5 : stroke}
                  strokeDasharray={`${len} ${c - len}`}
                  strokeDashoffset={-s.start}
                  strokeLinecap="butt"
                  opacity={hover && hover !== s.topic ? 0.35 : 1}
                  className="cursor-pointer transition-[stroke-width,opacity] duration-150"
                  onMouseEnter={() => setHover(s.topic)}
                  onMouseLeave={() => setHover(null)}
                />
              );
            })}
          </g>
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
          {hovered ? (
            <>
              <span className="text-sm font-semibold leading-tight text-slate-100">
                {hovered.topic}
              </span>
              <span className="mt-0.5 text-xs text-slate-500">
                {hovered.value} {unit}
              </span>
            </>
          ) : (
            <>
              <span className="font-display text-3xl font-black tabular-nums text-slate-50">
                {useWritten ? writtenTotal : poolTotal}
              </span>
              <span className="mt-0.5 text-[11px] text-slate-500">{unit}</span>
            </>
          )}
        </div>
      </div>

      <div className="grid min-w-[220px] flex-1 grid-cols-1 gap-x-5 gap-y-1 text-xs sm:grid-cols-2">
        {segs.map((s) => (
          <button
            key={s.topic}
            type="button"
            onMouseEnter={() => setHover(s.topic)}
            onMouseLeave={() => setHover(null)}
            className={`flex items-center gap-1.5 text-left transition-colors ${
              hover === s.topic ? "text-slate-100" : "text-slate-400"
            }`}
          >
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ background: s.color }}
            />
            <span className="truncate">{s.topic}</span>
            <span className="ml-auto pl-2 font-mono tabular-nums text-slate-500">
              {s.value}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
