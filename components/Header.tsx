import { CalendarDays } from "lucide-react";
import { APP_TZ } from "@/lib/tz";
import { EditLock } from "./EditLock";

// Compact sticky header: title, today's date, the "Week N of 23 · X days to
// Phase 1" pill, and the edit lock control. Quiet by design.
export function Header({
  weekNum,
  daysToPhase1,
  authed,
  configured,
  onAuthChange,
}: {
  weekNum?: number;
  daysToPhase1?: number;
  authed: boolean;
  configured: boolean;
  onAuthChange: (authed: boolean) => void;
}) {
  const date = new Date().toLocaleDateString("en-US", {
    timeZone: APP_TZ,
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

        <div className="ml-auto flex items-center gap-3">
          {weekNum !== undefined && (
            <span className="inline-flex items-center gap-2 rounded-full border border-edge bg-panel px-3 py-1 text-xs">
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
          <EditLock
            authed={authed}
            configured={configured}
            onChange={onAuthChange}
          />
        </div>
      </div>
    </header>
  );
}
