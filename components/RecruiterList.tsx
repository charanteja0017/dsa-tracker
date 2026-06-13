"use client";

import type { Recruiter } from "@/lib/types";

const TYPE_COLOR: Record<string, string> = {
  "Product/Lab": "bg-blue-500/20 text-blue-300",
  "AI/ML firm": "bg-fuchsia-500/20 text-fuchsia-300",
  "Service/Consult": "bg-amber-500/20 text-amber-300",
};

// Recruiters accordion — tap a company to reveal its interview pattern + your
// prep focus. Restyled to match the study-plan cards; mobile-friendly layout.
export function RecruiterList({
  recruiters,
  openCompany,
  onToggle,
}: {
  recruiters: Recruiter[];
  openCompany: string | null;
  onToggle: (company: string | null) => void;
}) {
  return (
    <div className="space-y-1.5">
      {recruiters.map((r) => {
        const open = openCompany === r.company;
        return (
          <div
            key={r.company}
            className="bg-slate-900/40 rounded-xl border border-slate-800/60 overflow-hidden"
          >
            <button
              type="button"
              aria-expanded={open}
              onClick={() => onToggle(open ? null : r.company)}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-left hover:bg-slate-800/30 transition-colors"
            >
              <span className="flex-1 min-w-0 font-medium truncate">
                {r.company}
              </span>
              <span
                className={`text-[11px] px-2 py-0.5 rounded-full shrink-0 ${
                  TYPE_COLOR[r.type] ?? "bg-slate-700/40 text-slate-300"
                }`}
              >
                {r.type}
              </span>
              <span className="text-slate-500 text-xs shrink-0">
                {r.hires} hire{r.hires > 1 ? "s" : ""}
              </span>
            </button>
            {open && (
              <div className="px-3 pb-3 text-sm space-y-2 border-t border-slate-800/60 pt-2.5">
                <p className="text-[11px] text-slate-500">
                  DSA bar:{" "}
                  <span className="text-slate-300">{r.dsa_bar}</span>
                </p>
                <div>
                  <span className="text-slate-500 text-[11px] uppercase tracking-wide">
                    Pattern
                  </span>
                  <p className="text-slate-300 mt-0.5">{r.pattern}</p>
                </div>
                <div>
                  <span className="text-blue-400 text-[11px] uppercase tracking-wide">
                    Your focus
                  </span>
                  <p className="text-slate-200 mt-0.5">{r.focus}</p>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
