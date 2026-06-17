"use client";

import { useEffect, useRef, useState } from "react";
import HeatMap from "@uiw/react-heat-map";
import { HEAT_RAMP } from "@/lib/tokens";
import { APP_TZ } from "@/lib/tz";

// Maps completion counts to the cyan ramp (highest key <= count wins).
const panelColors: Record<number, string> = {
  0: HEAT_RAMP[0],
  1: HEAT_RAMP[1],
  3: HEAT_RAMP[2],
  5: HEAT_RAMP[3],
  7: HEAT_RAMP[4],
};

// GitHub-style heatmap of completions per day, via @uiw/react-heat-map. The SVG
// width tracks the panel so cells flex to fill the available space.
export function ContributionHeatmap({
  daily,
  start,
  end,
}: {
  daily: { date: string; count: number }[];
  start: string;
  end: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(720);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      setWidth(Math.max(320, Math.floor(entries[0].contentRect.width)));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // One-time intro sweep: cells fade/scale in left→right, then we stop tagging
  // them so later data refreshes (on toggles) don't re-animate. Skipped under
  // reduced motion.
  const [intro, setIntro] = useState(true);
  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setIntro(false);
      return;
    }
    const t = setTimeout(() => setIntro(false), 900);
    return () => clearTimeout(t);
  }, []);

  // Today in the app timezone, in @uiw's slash format, to mark/pulse its cell.
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: APP_TZ })
    .format(new Date())
    .replace(/-/g, "/");

  // Extend the window back to cover any activity logged before the plan start
  // (e.g. prep done before the official start date) so those cells are visible.
  const earliest = daily.reduce(
    (min, d) => (d.date < min ? d.date : min),
    start
  );
  const startDate = new Date(earliest);
  const endDate = new Date(end);
  const weeks =
    Math.ceil((endDate.getTime() - startDate.getTime()) / (7 * 864e5)) + 1;
  const space = 4; // gap between cells — a touch more breathing room
  const gutter = 28; // week-label column
  const rectSize = Math.max(
    9,
    Math.min(22, Math.floor((width - gutter) / weeks) - space)
  );

  const value = daily.map((d) => ({
    date: d.date.replace(/-/g, "/"),
    count: d.count,
  }));

  const [tip, setTip] = useState<{
    x: number;
    y: number;
    w: number;
    label: string;
  } | null>(null);

  return (
    <div className="flex flex-col gap-3 py-1">
      <div ref={ref} className="relative w-full">
        <HeatMap
          value={value}
          width={width}
          startDate={startDate}
          endDate={endDate}
          rectSize={rectSize}
          space={space}
          legendCellSize={0}
          panelColors={panelColors}
          rectProps={{ rx: 2 }}
          style={{ color: "#94a3b8", fontSize: 10 }}
          rectRender={(props, data) => {
            const isToday = data.date === today;
            const delay = intro
              ? Math.min(500, (Number(props.x) / Math.max(1, width)) * 500)
              : 0;
            return (
              <rect
                {...props}
                className={`heat-cell${intro ? " heat-cell-in" : ""}${
                  isToday ? " heat-today" : ""
                }`}
                style={intro ? { animationDelay: `${delay}ms` } : undefined}
                onMouseEnter={() =>
                  setTip({
                    x: Number(props.x),
                    y: Number(props.y),
                    w: Number(props.width),
                    label: `${data.date} · ${data.count ?? 0} solved`,
                  })
                }
                onMouseLeave={() => setTip(null)}
              />
            );
          }}
        />
        {tip && (
          <div
            className="heat-tip"
            style={{ left: tip.x + tip.w / 2, top: tip.y }}
          >
            {tip.label}
          </div>
        )}
      </div>
      <div className="flex items-center justify-end gap-1.5 text-[10px] text-slate-500">
        <span>Less</span>
        {HEAT_RAMP.map((c, i) => (
          <span
            key={i}
            className="h-[11px] w-[11px] rounded-[2px]"
            style={{ background: c }}
          />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
