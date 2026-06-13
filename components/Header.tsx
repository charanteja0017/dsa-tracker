import { CalendarDays } from "lucide-react";

// Compact sticky header: title, today's date, and a "Week N of 23 · X days to
// Phase 1" pill. Quiet by design.
export function Header({
  weekNum,
  daysToPhase1,
}: {
  weekNum?: number;
  daysToPhase1?: number;
}) {
  const date = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <header className="sticky top-0 z-30 border-b border-edge bg-ink/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-[1600px] items-center gap-4 px-4 sm:px-6">
        <h1 className="text-sm font-semibold tracking-tight text-slate-100">
          DSA Placement Tracker
        </h1>
        <span
          suppressHydrationWarning
          className="hidden items-center gap-1.5 text-xs text-slate-500 sm:flex"
        >
          <CalendarDays className="h-3.5 w-3.5" />
          {date}
        </span>

        {weekNum !== undefined && (
          <span className="ml-auto inline-flex items-center gap-2 rounded-full border border-edge bg-panel px-3 py-1 text-xs">
            <span className="font-medium text-slate-200">
              Week {weekNum} <span className="text-slate-500">of 23</span>
            </span>
            {daysToPhase1 !== undefined && (
              <>
                <span className="h-3 w-px bg-edge" aria-hidden />
                <span className="font-mono tabular-nums text-accent-fg">
                  {daysToPhase1}d
                </span>
                <span className="text-slate-500">to Phase 1</span>
              </>
            )}
          </span>
        )}
      </div>
    </header>
  );
}
