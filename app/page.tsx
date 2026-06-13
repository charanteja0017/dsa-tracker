"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  DailyDraft,
  Difficulty,
  Problem,
  Recruiter,
  Stats,
} from "@/lib/types";
import { groupProblems } from "@/lib/study";
import { StatCard } from "@/components/StatCard";
import { ProgressBar } from "@/components/ProgressBar";
import { FilterBar } from "@/components/FilterBar";
import { WeekSection } from "@/components/WeekSection";
import { PatternProgress } from "@/components/PatternProgress";
import { RecruiterList } from "@/components/RecruiterList";
import { DailyLog } from "@/components/DailyLog";

const EMPTY_DRAFT: DailyDraft = {
  solved: "",
  minutes: "",
  confidence: "",
  topic: "",
  notes: "",
};

export default function Home() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [recruiters, setRecruiters] = useState<Recruiter[]>([]);

  // Filters + accordion state.
  const [difficulties, setDifficulties] = useState<Set<Difficulty>>(new Set());
  const [hideCompleted, setHideCompleted] = useState(false);
  const [openWeeks, setOpenWeeks] = useState<Set<number>>(new Set());
  const didInitWeeks = useRef(false);

  // Daily-log form + recruiters accordion.
  const [today, setToday] = useState<DailyDraft>(EMPTY_DRAFT);
  const [saved, setSaved] = useState(false);
  const [openCompany, setOpenCompany] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [s, p, r] = await Promise.all([
      fetch("/api/stats").then((res) => res.json() as Promise<Stats>),
      fetch("/api/problems").then((res) => res.json() as Promise<Problem[]>),
      fetch("/api/recruiters").then((res) => res.json() as Promise<Recruiter[]>),
    ]);
    setStats(s);
    setProblems(p);
    setRecruiters(r);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Auto-expand the current week once, the first time data arrives. If the
  // current week has no problems, fall back to the next upcoming week that does
  // (else the last). Runs once so reloads after a toggle don't reset the user.
  useEffect(() => {
    if (didInitWeeks.current || !stats || problems.length === 0) return;
    didInitWeeks.current = true;
    const weeks = Array.from(new Set(problems.map((p) => p.week))).sort(
      (a, b) => a - b
    );
    const cur = stats.weekNum;
    const pick = weeks.includes(cur)
      ? cur
      : weeks.find((w) => w >= cur) ?? weeks[weeks.length - 1];
    if (pick !== undefined) setOpenWeeks(new Set([pick]));
  }, [stats, problems]);

  async function toggle(id: number, done: boolean) {
    setProblems((prev) => prev.map((x) => (x.id === id ? { ...x, done } : x)));
    await fetch("/api/problems", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, done }),
    });
    load();
  }

  async function saveDay() {
    const d = new Date().toISOString().slice(0, 10);
    await fetch("/api/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: d,
        solved: Number(today.solved) || 0,
        minutes: Number(today.minutes) || 0,
        confidence: today.confidence ? Number(today.confidence) : null,
        topic: today.topic || null,
        notes: today.notes || null,
      }),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
    load();
  }

  function toggleDifficulty(d: Difficulty) {
    setDifficulties((prev) => {
      const next = new Set(prev);
      if (next.has(d)) next.delete(d);
      else next.add(d);
      return next;
    });
  }

  function toggleWeek(week: number) {
    setOpenWeeks((prev) => {
      const next = new Set(prev);
      if (next.has(week)) next.delete(week);
      else next.add(week);
      return next;
    });
  }

  const weekGroups = useMemo(
    () => groupProblems(problems, { difficulties, hideCompleted }),
    [problems, difficulties, hideCompleted]
  );

  const pct = stats ? Math.round((stats.totalSolved / stats.target) * 100) : 0;

  return (
    <main className="max-w-3xl mx-auto px-4 py-6 sm:py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold mb-1">DSA Placement Tracker</h1>
        <p className="text-slate-400 text-sm">
          23-week plan &middot; Jun 22 &rarr; Phase 1 on Dec 1
        </p>
      </header>

      {/* Stat cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <StatCard label="Week" value={`${stats.weekNum} / 23`} />
          <StatCard label="Days to Phase 1" value={stats.daysToPhase1} />
          <StatCard
            label="Streak"
            value={`${stats.streak} 🔥`}
            accent="text-amber-300"
          />
          <StatCard
            label="Total solved"
            value={stats.totalSolved}
            accent="text-emerald-300"
          />
        </div>
      )}

      {/* Progress to target */}
      {stats && (
        <div className="mb-8 rounded-2xl bg-slate-900/60 border border-slate-800 p-4">
          <div className="flex justify-between items-baseline text-sm mb-2">
            <span className="text-slate-200 font-medium">
              Progress to {stats.target} problems
            </span>
            <span className="text-slate-400 tabular-nums">
              {stats.totalSolved} ({pct}%)
            </span>
          </div>
          <ProgressBar value={stats.totalSolved} max={stats.target} />
          <p className="text-xs text-slate-500 mt-2">
            Must-do list: {stats.mustDoDone}/{stats.mustDoTotal} done &middot;{" "}
            {Math.round(stats.totalMinutes / 60)} hrs logged
          </p>
        </div>
      )}

      {/* Today's log */}
      <div className="mb-8">
        <DailyLog
          value={today}
          onField={(key, v) => setToday((t) => ({ ...t, [key]: v }))}
          onSave={saveDay}
          saved={saved}
        />
      </div>

      {/* Study plan: week -> pattern -> problem */}
      <section className="mb-8">
        <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
          <h2 className="font-semibold">Study plan</h2>
        </div>
        <div className="mb-3">
          <FilterBar
            difficulties={difficulties}
            onToggleDifficulty={toggleDifficulty}
            hideCompleted={hideCompleted}
            onToggleHideCompleted={() => setHideCompleted((v) => !v)}
          />
        </div>
        {weekGroups.length === 0 ? (
          <p className="text-sm text-slate-500 px-1 py-6 text-center">
            {problems.length === 0
              ? "No problems yet."
              : "No problems match the current filters."}
          </p>
        ) : (
          <div className="space-y-2.5">
            {weekGroups.map((g) => (
              <WeekSection
                key={g.week}
                group={g}
                open={openWeeks.has(g.week)}
                isCurrent={g.week === stats?.weekNum}
                onToggle={toggleWeek}
                onToggleProblem={toggle}
              />
            ))}
          </div>
        )}
      </section>

      {/* Per-pattern progress */}
      {stats && stats.byPattern.length > 0 && (
        <section className="mb-8">
          <h2 className="font-semibold mb-3">By pattern</h2>
          <PatternProgress items={stats.byPattern} />
        </section>
      )}

      {/* Senior recruiters (AI dept 2026) */}
      {recruiters.length > 0 && (
        <section className="mb-8">
          <h2 className="font-semibold mb-1">
            Senior recruiters &middot; AI Dept 2026
          </h2>
          <p className="text-xs text-slate-500 mb-3">
            Tap a company for its interview pattern &amp; your prep focus.
            Directional (one cohort, ~35 students).
          </p>
          <RecruiterList
            recruiters={recruiters}
            openCompany={openCompany}
            onToggle={setOpenCompany}
          />
        </section>
      )}

      <footer className="mt-10 text-center text-xs text-slate-600">
        First run? Visit{" "}
        <code className="text-slate-400">/api/init</code> once to set up the
        database.
      </footer>
    </main>
  );
}
