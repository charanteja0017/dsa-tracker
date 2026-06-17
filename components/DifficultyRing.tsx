"use client";

import { useEffect, useState } from "react";
import type { DifficultyStat } from "@/lib/types";
import { DIFF_HEX, DIFF_LABEL, TEXT } from "@/lib/tokens";
import { useCountUp } from "@/lib/useCountUp";

// LeetCode-style ring: colored arcs sized by solved-per-difficulty over a gray
// track (full circle = total problems), total solved big in the center. Arcs
// draw in on mount (staggered easy→med→hard) and re-flow when a value changes;
// the center number counts up.
export function DifficultyRing({
  byDifficulty,
}: {
  byDifficulty: DifficultyStat[];
}) {
  const total = byDifficulty.reduce((s, d) => s + d.total, 0);
  const solved = byDifficulty.reduce((s, d) => s + d.done, 0);
  const centerNum = useCountUp(solved);

  // Start arcs collapsed, then flip on after first paint so the dash-array
  // transition runs (grow from the start point). Reduced motion = instant.
  const [drawn, setDrawn] = useState(false);
  useEffect(() => {
    const reduce = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduce) {
      setDrawn(true);
      return;
    }
    const id = requestAnimationFrame(() => setDrawn(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const size = 132;
  const stroke = 12;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const center = size / 2;

  let acc = 0;
  const segments = byDifficulty.map((d, i) => {
    const start = total > 0 ? (acc / total) * c : 0;
    const len = total > 0 ? (d.done / total) * c : 0;
    acc += d.done;
    return { key: d.difficulty, color: DIFF_HEX[d.difficulty], len, start, i };
  });

  return (
    <div className="flex items-center justify-center gap-5">
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
            {segments.map((s) => {
              const len = drawn ? s.len : 0;
              return (
                <circle
                  key={s.key}
                  cx={center}
                  cy={center}
                  r={r}
                  fill="none"
                  stroke={s.color}
                  strokeWidth={stroke}
                  strokeDasharray={`${len} ${c - len}`}
                  strokeDashoffset={-s.start}
                  strokeLinecap="butt"
                  style={{
                    transition: "stroke-dasharray 700ms ease-out",
                    transitionDelay: `${s.i * 120}ms`,
                  }}
                />
              );
            })}
          </g>
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-3xl font-black leading-none tabular-nums text-slate-50">
            {centerNum}
          </span>
          <span className="mt-0.5 text-[11px] text-slate-500">of {total}</span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-1.5">
        {byDifficulty.map((d) => (
          <div
            key={d.difficulty}
            className="flex items-center gap-2 text-sm"
          >
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ background: DIFF_HEX[d.difficulty] }}
            />
            <span className="flex-1 text-slate-300">
              {DIFF_LABEL[d.difficulty]}
            </span>
            <span className="font-mono tabular-nums text-slate-500">
              {d.done}/{d.total}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
