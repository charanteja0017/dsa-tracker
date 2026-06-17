"use client";

import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Building2 } from "lucide-react";
import { companiesFor } from "@/lib/companies";

// Company-count pill that, on hover/focus, floats a popover listing a
// representative set of recruiters as animated chips. Rendered in a portal so
// it escapes the focus list's scroll clipping; purely visual (pointer-events
// off) so it never gets in the way.
export function CompanyBadge({ count }: { count: number }) {
  const ref = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const companies = companiesFor(count);

  const open = () => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const half = 130; // keep the centered popover on-screen near edges
    const x = Math.min(
      window.innerWidth - half - 8,
      Math.max(half + 8, r.left + r.width / 2)
    );
    setPos({ x, y: r.top });
  };
  const close = () => setPos(null);

  return (
    <>
      <button
        ref={ref}
        type="button"
        onMouseEnter={open}
        onMouseLeave={close}
        onFocus={open}
        onBlur={close}
        aria-label={`Asked at ~${count} top recruiters`}
        className="hidden shrink-0 items-center gap-1 rounded-md border border-edge bg-panel2/60 px-1.5 py-0.5 text-[11px] font-medium tabular-nums text-slate-400 transition-colors hover:border-slate-600 hover:text-slate-200 sm:inline-flex"
      >
        <Building2 className="h-3 w-3" />
        {count}
      </button>

      {pos &&
        companies.length > 0 &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="company-pop pointer-events-none fixed z-[60] w-max max-w-[260px] rounded-lg border border-edge bg-ink/95 p-2.5 shadow-xl backdrop-blur"
            style={{ left: pos.x, top: pos.y - 8 }}
          >
            <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Tagged by ~{count} top recruiters
            </div>
            <div className="flex max-w-[236px] flex-wrap gap-1">
              {companies.map((c, i) => (
                <span
                  key={c.name}
                  className="company-chip flex items-center gap-1 rounded-full border border-edge bg-panel2/70 px-1.5 py-0.5 text-[11px] text-slate-200"
                  style={{ animationDelay: `${i * 28}ms` }}
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: c.color }}
                  />
                  {c.name}
                </span>
              ))}
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
