"use client";

import { useEffect, useRef, useState } from "react";
import HeatMap from "@uiw/react-heat-map";
import { HEAT_RAMP } from "@/lib/tokens";

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

  const startDate = new Date(start);
  const endDate = new Date(end);
  const weeks =
    Math.ceil((endDate.getTime() - startDate.getTime()) / (7 * 864e5)) + 1;
  const space = 3;
  const gutter = 28; // week-label column
  const rectSize = Math.max(
    9,
    Math.min(22, Math.floor((width - gutter) / weeks) - space)
  );

  const value = daily.map((d) => ({
    date: d.date.replace(/-/g, "/"),
    count: d.count,
  }));

  return (
    <div className="flex flex-col gap-2">
      <div ref={ref} className="w-full overflow-hidden">
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
          rectRender={(props, data) => (
            <rect {...props}>
              <title>{`${data.date} · ${data.count ?? 0} solved`}</title>
            </rect>
          )}
        />
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
