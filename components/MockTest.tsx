"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Dices, RotateCw, X } from "lucide-react";
import type { Problem } from "@/lib/types";
import { Tag } from "./Tag";
import { Checkbox } from "./Checkbox";
import { YouTubeIcon } from "./YouTubeIcon";

type Pool = "all" | "unsolved" | "starred";
const COUNTS = [3, 5, 8];
const POOLS: { key: Pool; label: string }[] = [
  { key: "all", label: "All" },
  { key: "unsolved", label: "Unsolved" },
  { key: "starred", label: "Starred" },
];

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const fmtClock = (s: number) =>
  `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

// Random timed practice set. Picks N problems from a chosen pool, shows them as
// a checklist with a running clock. Purely local/ephemeral — no DB writes.
export function MockTest({ problems }: { problems: Problem[] }) {
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(5);
  const [pool, setPool] = useState<Pool>("all");
  const [selected, setSelected] = useState<Problem[] | null>(null);
  const [attempted, setAttempted] = useState<Set<number>>(new Set());
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);

  const poolList = useMemo(() => {
    if (pool === "unsolved") return problems.filter((p) => !p.done);
    if (pool === "starred") return problems.filter((p) => p.starred);
    return problems;
  }, [problems, pool]);

  const generate = useCallback(() => {
    const picked = shuffle(poolList).slice(0, count);
    setSelected(picked);
    setAttempted(new Set());
    setElapsed(0);
    setRunning(picked.length > 0);
  }, [poolList, count]);

  // Clock tick while the test is running.
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(id);
  }, [running]);

  // Stop the clock once every problem has been ticked off.
  useEffect(() => {
    if (selected && selected.length > 0 && attempted.size === selected.length) {
      setRunning(false);
    }
  }, [attempted, selected]);

  // Esc closes the modal.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const mix = useMemo(() => {
    const m: Record<string, number> = { EASY: 0, MEDIUM: 0, HARD: 0 };
    selected?.forEach((p) => (m[p.difficulty] = (m[p.difficulty] ?? 0) + 1));
    return m;
  }, [selected]);

  const toggleAttempt = (id: number) =>
    setAttempted((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const done = selected ? attempted.size : 0;
  const finished =
    selected !== null && selected.length > 0 && done === selected.length;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title="Generate a random timed practice set"
        className="inline-flex items-center gap-1.5 rounded-full border border-edge bg-panel px-2.5 py-1 text-xs font-medium text-slate-300 transition duration-150 hover:border-slate-600 active:scale-95"
      >
        <Dices className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Mock test</span>
      </button>

      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm sm:items-center"
            onClick={() => setOpen(false)}
          >
            <div
              className="celeb-pop my-auto w-full max-w-lg rounded-2xl border border-edge bg-panel shadow-card"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between gap-3 border-b border-edge px-4 py-3">
                <div className="flex items-center gap-2">
                  <Dices className="h-4 w-4 text-accent-fg" />
                  <h2 className="text-sm font-semibold text-slate-100">
                    Mock test
                  </h2>
                </div>
                <div className="flex items-center gap-3">
                  {selected && (
                    <span
                      className={`font-mono text-lg font-bold tabular-nums ${
                        finished ? "text-emerald-400" : "text-slate-100"
                      }`}
                    >
                      {fmtClock(elapsed)}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    aria-label="Close"
                    className="rounded-md p-1 text-slate-500 transition hover:bg-panel2 hover:text-slate-200 active:scale-90"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Controls */}
              <div className="flex flex-wrap items-center gap-2 border-b border-edge px-4 py-3">
                <div className="flex rounded-md border border-edge p-0.5 text-xs">
                  {COUNTS.map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setCount(n)}
                      className={`rounded px-2 py-0.5 font-medium transition duration-150 active:scale-95 ${
                        count === n
                          ? "bg-accent/20 text-accent-fg"
                          : "text-slate-500 hover:text-slate-300"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
                <div className="flex rounded-md border border-edge p-0.5 text-xs">
                  {POOLS.map((p) => (
                    <button
                      key={p.key}
                      type="button"
                      onClick={() => setPool(p.key)}
                      className={`rounded px-2 py-0.5 font-medium transition duration-150 active:scale-95 ${
                        pool === p.key
                          ? "bg-accent/20 text-accent-fg"
                          : "text-slate-500 hover:text-slate-300"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={generate}
                  className="ml-auto inline-flex items-center gap-1.5 rounded-md bg-accent/20 px-3 py-1 text-xs font-semibold text-accent-fg transition duration-150 hover:bg-accent/30 active:scale-95"
                >
                  <RotateCw className="h-3.5 w-3.5" />
                  {selected ? "Re-roll" : "Start"}
                </button>
              </div>

              {/* Body */}
              <div className="max-h-[55vh] overflow-y-auto scroll-thin p-4">
                {!selected ? (
                  <p className="py-8 text-center text-sm text-slate-500">
                    Pick a size and pool, then{" "}
                    <span className="text-slate-300">Start</span> for a random
                    timed set.
                  </p>
                ) : selected.length === 0 ? (
                  <p className="py-8 text-center text-sm text-slate-500">
                    No problems in that pool yet — try a different one.
                  </p>
                ) : (
                  <>
                    <div className="mb-3 flex items-center justify-between text-xs text-slate-500">
                      <span>
                        {done}/{selected.length} attempted
                        {finished && (
                          <span className="ml-2 font-medium text-emerald-400">
                            done in {fmtClock(elapsed)} 🎉
                          </span>
                        )}
                      </span>
                      <span className="font-mono tabular-nums">
                        {mix.EASY}E · {mix.MEDIUM}M · {mix.HARD}H
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      {selected.map((p, i) => (
                        <div
                          key={p.id}
                          className="flex items-center gap-2.5 rounded-lg border border-edge bg-panel/50 px-2.5 py-2 transition-colors hover:border-slate-700"
                        >
                          <span className="w-4 shrink-0 text-center font-mono text-xs text-slate-600">
                            {i + 1}
                          </span>
                          <Checkbox
                            checked={attempted.has(p.id)}
                            onChange={() => toggleAttempt(p.id)}
                            label={`Mark ${p.title} attempted`}
                          />
                          <a
                            href={p.link}
                            target="_blank"
                            rel="noreferrer"
                            className={`min-w-0 flex-1 truncate text-sm ${
                              attempted.has(p.id)
                                ? "text-slate-500 line-through"
                                : "text-slate-100 hover:text-accent-fg"
                            }`}
                          >
                            {p.title}
                          </a>
                          {p.youtube && (
                            <a
                              href={p.youtube}
                              target="_blank"
                              rel="noreferrer"
                              aria-label={`Watch ${p.title} on YouTube`}
                              className="shrink-0 text-red-600 transition-opacity hover:opacity-80"
                            >
                              <YouTubeIcon className="h-4 w-4" />
                            </a>
                          )}
                          <Tag variant="difficulty" value={p.difficulty} />
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
