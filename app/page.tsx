"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Analytics, DailyDraft, Problem, Recruiter, Stats } from "@/lib/types";
import { COLORS } from "@/lib/colors";
import { difficultyStats, patternStats } from "@/lib/study";
import { Header } from "@/components/Header";
import { DashboardGrid } from "@/components/DashboardGrid";
import { Panel } from "@/components/Panel";
import { WeekFocusPanel } from "@/components/WeekFocusPanel";
import { StatsGrid } from "@/components/StatsGrid";
import { ContributionHeatmap } from "@/components/ContributionHeatmap";
import { PaceChart } from "@/components/PaceChart";
import { PatternBarChart } from "@/components/PatternBarChart";
import { DifficultyDonut } from "@/components/DifficultyDonut";
import { DailyLog } from "@/components/DailyLog";
import { FullProblemList } from "@/components/FullProblemList";
import { RecruiterList } from "@/components/RecruiterList";

const EMPTY_DRAFT: DailyDraft = {
  solved: "",
  minutes: "",
  confidence: "",
  topic: "",
  notes: "",
};

function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-xl border border-edge bg-panel/60 ${className}`} />
  );
}

export default function Home() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [recruiters, setRecruiters] = useState<Recruiter[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);

  const [today, setToday] = useState<DailyDraft>(EMPTY_DRAFT);
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    const [s, p, r, a] = await Promise.all([
      fetch("/api/stats").then((res) => res.json() as Promise<Stats>),
      fetch("/api/problems").then((res) => res.json() as Promise<Problem[]>),
      fetch("/api/recruiters").then((res) => res.json() as Promise<Recruiter[]>),
      fetch("/api/analytics").then((res) => res.json() as Promise<Analytics>),
    ]);
    setStats(s);
    setProblems(p);
    setRecruiters(r);
    setAnalytics(a);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Optimistic only: update local problems immediately (which re-derives the
  // pattern chart, donut, focus ring and list counts) and persist in the
  // background — no full refetch, so nothing flashes or re-animates.
  const toggle = useCallback(async (id: number, done: boolean) => {
    setProblems((prev) => prev.map((x) => (x.id === id ? { ...x, done } : x)));
    await fetch("/api/problems", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, done }),
    });
  }, []);

  // Problem-derived series — recompute instantly on every toggle.
  const byPattern = useMemo(() => patternStats(problems), [problems]);
  const byDifficulty = useMemo(() => difficultyStats(problems), [problems]);

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
    load(); // refresh stats + analytics so the heatmap cell updates immediately
  }

  return (
    <>
      <Header weekNum={stats?.weekNum} daysToPhase1={stats?.daysToPhase1} />

      <DashboardGrid>
        {/* Top zone: focus + stats, side by side */}
        <div className="col-span-12 md:col-span-7 xl:col-span-8">
          {stats ? (
            <WeekFocusPanel weekNum={stats.weekNum} problems={problems} onToggle={toggle} />
          ) : (
            <Skeleton className="h-72" />
          )}
        </div>
        <div className="col-span-12 md:col-span-5 xl:col-span-4">
          {stats ? <StatsGrid stats={stats} analytics={analytics} /> : <Skeleton className="h-72" />}
        </div>

        {/* Data-viz row */}
        <div className="col-span-12 xl:col-span-7">
          <Panel title="Activity">
            {analytics ? (
              <ContributionHeatmap
                daily={analytics.daily}
                start={analytics.range.start}
                end={analytics.range.phase1}
              />
            ) : (
              <Skeleton className="h-28 border-0" />
            )}
          </Panel>
        </div>
        <div className="col-span-12 md:col-span-6 xl:col-span-5">
          <Panel
            title="Pace to 271"
            right={
              <span className="flex items-center gap-3 text-[11px] text-slate-500">
                <span className="flex items-center gap-1">
                  <span className="h-0.5 w-3" style={{ background: COLORS.accent }} />
                  Actual
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-0.5 w-3" style={{ background: COLORS.muted }} />
                  Ideal
                </span>
              </span>
            }
          >
            <div className="h-[220px]">
              {analytics ? (
                <PaceChart cumulative={analytics.cumulative} range={analytics.range} />
              ) : (
                <Skeleton className="h-full border-0" />
              )}
            </div>
          </Panel>
        </div>
        <div className="col-span-12 md:col-span-6 xl:col-span-6">
          <Panel title="By pattern" bodyClassName="p-3">
            <div className="max-h-[320px] overflow-y-auto scroll-thin">
              {problems.length > 0 ? (
                <PatternBarChart byPattern={byPattern} />
              ) : (
                <Skeleton className="h-56 border-0" />
              )}
            </div>
          </Panel>
        </div>
        <div className="col-span-12 md:col-span-6 xl:col-span-3">
          <Panel title="Difficulty">
            {problems.length > 0 ? (
              <DifficultyDonut byDifficulty={byDifficulty} />
            ) : (
              <Skeleton className="h-44 border-0" />
            )}
          </Panel>
        </div>
        <div className="col-span-12 md:col-span-6 xl:col-span-3">
          <Panel title="Log today">
            <DailyLog
              value={today}
              onField={(key, v) => setToday((t) => ({ ...t, [key]: v }))}
              onSave={saveDay}
              saved={saved}
            />
          </Panel>
        </div>

        {/* Lower zone: full list + recruiters, side by side */}
        <div className="col-span-12 xl:col-span-8">
          <FullProblemList
            problems={problems}
            currentWeek={stats?.weekNum}
            onToggleProblem={toggle}
          />
        </div>
        <div className="col-span-12 xl:col-span-4">
          {recruiters.length > 0 ? (
            <RecruiterList recruiters={recruiters} />
          ) : (
            <Skeleton className="h-72" />
          )}
        </div>
      </DashboardGrid>

      <footer className="mx-auto max-w-[1600px] px-6 pb-8 pt-2 text-center text-xs text-slate-600">
        First run? Visit <code className="text-slate-400">/api/init</code> once to set up the database.
      </footer>
    </>
  );
}
