"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Analytics, Problem, Recruiter, Stats } from "@/lib/types";
import { difficultyStats, patternStats } from "@/lib/study";
import { Header } from "@/components/Header";
import { DashboardGrid, Span } from "@/components/DashboardGrid";
import { Panel } from "@/components/Panel";
import { StatsHero } from "@/components/StatsHero";
import { ContributionHeatmap } from "@/components/ContributionHeatmap";
import { PaceChart } from "@/components/PaceChart";
import { WeekFocusPanel } from "@/components/WeekFocusPanel";
import { PatternBars } from "@/components/PatternBars";
import { DifficultyRing } from "@/components/DifficultyRing";
import { StudyPlan } from "@/components/StudyPlan";
import { RecruiterList } from "@/components/RecruiterList";

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

  // Edit gate: canEdit unlocks the checkboxes; configured tells the lock UI
  // whether EDIT_PASSWORD is set on the server.
  const [canEdit, setCanEdit] = useState(false);
  const [configured, setConfigured] = useState(true);

  useEffect(() => {
    fetch("/api/auth")
      .then((res) => res.json() as Promise<{ authed: boolean; configured: boolean }>)
      .then((a) => {
        setCanEdit(a.authed);
        setConfigured(a.configured);
      })
      .catch(() => {});
  }, []);

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

  // Optimistic only: update local problems immediately so the hero, pattern
  // bars, difficulty ring, focus ring and list counts all react instantly.
  // Stats/analytics (heatmap, pace, streak) refresh in the background.
  const toggle = useCallback(
    async (id: number, done: boolean) => {
      if (!canEdit) return; // locked — checkboxes are disabled, but guard anyway
      setProblems((prev) => prev.map((x) => (x.id === id ? { ...x, done } : x)));
      const res = await fetch("/api/problems", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, done }),
      });
      if (!res.ok) {
        // Revert the optimistic flip; relock if the session expired.
        setProblems((prev) =>
          prev.map((x) => (x.id === id ? { ...x, done: !done } : x))
        );
        if (res.status === 401) setCanEdit(false);
        return;
      }
      load();
    },
    [load, canEdit]
  );

  // Problem-derived series — recompute instantly on every toggle.
  const byPattern = useMemo(() => patternStats(problems), [problems]);
  const byDifficulty = useMemo(() => difficultyStats(problems), [problems]);

  // Local stats fall back to derived values before the first fetch resolves, so
  // the hero shows live numbers immediately on toggle.
  const solved = stats?.solved ?? problems.filter((p) => p.done).length;
  const total = analytics?.range.total ?? problems.length;

  // Ahead/behind vs the ideal linear pace today.
  const paceBadge = (() => {
    if (!analytics) return null;
    const { start, phase1 } = analytics.range;
    const startTs = new Date(start).getTime();
    const span = new Date(phase1).getTime() - startTs || 1;
    const frac = Math.min(1, Math.max(0, (Date.now() - startTs) / span));
    const idealToday = Math.round(total * frac);
    const diff = solved - idealToday;
    const ahead = diff >= 0;
    return (
      <span
        className={`rounded-md px-2 py-0.5 text-xs font-medium ${
          ahead
            ? "bg-emerald-500/15 text-emerald-300"
            : "bg-amber-500/15 text-amber-300"
        }`}
      >
        {ahead ? `+${diff} ahead` : `${Math.abs(diff)} behind`}
      </span>
    );
  })();

  return (
    <>
      <Header
        weekNum={stats?.weekNum}
        daysToPhase1={stats?.daysToPhase1}
        authed={canEdit}
        configured={configured}
        onAuthChange={setCanEdit}
      />

      <DashboardGrid>
        {/* Row 1 — hero (2) + pace (1) side by side */}
        <Span cols={2}>
          {stats ? <StatsHero stats={stats} /> : <Skeleton className="h-44" />}
        </Span>
        <Span cols={1}>
          <Panel title="Pace" right={paceBadge} className="h-full" bodyClassName="flex-1 p-4">
            <div className="h-full min-h-[160px]">
              {analytics ? (
                <PaceChart
                  cumulative={analytics.cumulative}
                  range={analytics.range}
                  solved={solved}
                />
              ) : (
                <Skeleton className="h-full border-0" />
              )}
            </div>
          </Panel>
        </Span>

        {/* Row 2 — this week's problems (2) + heatmap & difficulty stacked (1) */}
        <Span cols={2}>
          {stats ? (
            <WeekFocusPanel
              weekNum={stats.weekNum}
              problems={problems}
              onToggle={toggle}
              canEdit={canEdit}
            />
          ) : (
            <Skeleton className="h-80" />
          )}
        </Span>
        <Span cols={1} className="flex flex-col gap-3.5">
          <Panel title="Activity">
            {analytics ? (
              <ContributionHeatmap
                daily={analytics.daily}
                start={analytics.range.start}
                end={analytics.range.phase1}
              />
            ) : (
              <Skeleton className="h-32 border-0" />
            )}
          </Panel>
          <Panel
            title="Difficulty"
            className="flex-1"
            bodyClassName="flex flex-1 items-center justify-center p-4"
          >
            {problems.length > 0 ? (
              <DifficultyRing byDifficulty={byDifficulty} />
            ) : (
              <Skeleton className="h-52 w-full border-0" />
            )}
          </Panel>
        </Span>

        {/* Row 3 — by pattern (full width, two columns) */}
        <Span cols={3}>
          <Panel title="By pattern" bodyClassName="p-4">
            {problems.length > 0 ? (
              <PatternBars byPattern={byPattern} />
            ) : (
              <Skeleton className="h-40 border-0" />
            )}
          </Panel>
        </Span>

        {/* Row 4 — study plan (2) + recruiters (1) */}
        <Span cols={2}>
          <StudyPlan
            problems={problems}
            currentWeek={stats?.weekNum}
            onToggleProblem={toggle}
            canEdit={canEdit}
          />
        </Span>
        <Span cols={1}>
          {recruiters.length > 0 ? (
            <RecruiterList recruiters={recruiters} />
          ) : (
            <Skeleton className="h-72" />
          )}
        </Span>
      </DashboardGrid>

      <footer className="mx-auto max-w-[1600px] px-6 pb-8 pt-2 text-center text-xs text-slate-600">
        First run or new seed? Visit{" "}
        <code className="text-slate-400">/api/init</code> to load / refresh problems.
      </footer>
    </>
  );
}
