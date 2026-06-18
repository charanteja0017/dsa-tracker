"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Analytics, Problem, Recruiter, Stats } from "@/lib/types";
import { difficultyStats, patternStats } from "@/lib/study";
import { projectCompletion } from "@/lib/projection";
import { APP_TZ } from "@/lib/tz";
import { celebrate } from "@/lib/celebrate";
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
import { Celebration } from "@/components/Celebration";
import { ProjectionNote } from "@/components/ProjectionNote";

// Percent milestones → which Lottie plays when crossed (upward).
const MILESTONE_LOTTIE: Record<number, string> = {
  25: "/animations/confetti.lottie",
  50: "/animations/success-burst.lottie",
  75: "/animations/confetti.lottie",
  100: "/animations/winner-badge.lottie",
};

// Streak day-counts that trigger the fire celebration.
const STREAK_MILESTONES = [3, 7, 14, 30, 50, 100];

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

  // Pace chart view: near-term window vs. the full plan.
  const [paceMode, setPaceMode] = useState<"near" | "full">("near");

  // Milestone celebration overlay (a Lottie that plays once).
  const [celebration, setCelebration] = useState<string | null>(null);
  const prevPct = useRef<number | null>(null);
  const prevWeekDone = useRef<boolean | null>(null);
  const prevStreak = useRef<number | null>(null);

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
      if (done) celebrate(); // 🎉 confetti + chime on completing a problem
      load();
    },
    [load, canEdit]
  );

  // Star/unstar a problem for revision. Optimistic; doesn't affect stats so no
  // reload needed.
  const toggleStar = useCallback(
    async (id: number, starred: boolean) => {
      if (!canEdit) return;
      setProblems((prev) =>
        prev.map((x) => (x.id === id ? { ...x, starred } : x))
      );
      const res = await fetch("/api/problems", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, starred }),
      });
      if (!res.ok) {
        setProblems((prev) =>
          prev.map((x) => (x.id === id ? { ...x, starred: !starred } : x))
        );
        if (res.status === 401) setCanEdit(false);
      }
    },
    [canEdit]
  );

  // Problem-derived series — recompute instantly on every toggle.
  const byPattern = useMemo(() => patternStats(problems), [problems]);
  const byDifficulty = useMemo(() => difficultyStats(problems), [problems]);

  // Local stats fall back to derived values before the first fetch resolves, so
  // the hero shows live numbers immediately on toggle.
  const solved = stats?.solved ?? problems.filter((p) => p.done).length;
  const total = analytics?.range.total ?? problems.length;

  // Forecast finish date from a recency-weighted solving rate (recomputes live
  // as you solve, since `solved` updates optimistically).
  const projection = useMemo(() => {
    if (!analytics) return null;
    const today = new Intl.DateTimeFormat("en-CA", { timeZone: APP_TZ }).format(
      new Date()
    );
    return projectCompletion(analytics.daily, today, solved, total);
  }, [analytics, solved, total]);

  // Fire a celebration when a week is finished or a % milestone is crossed.
  useEffect(() => {
    const totalLive = analytics?.range.total ?? problems.length;
    const solvedLive = problems.filter((p) => p.done).length;
    const pct = totalLive > 0 ? Math.round((solvedLive / totalLive) * 100) : 0;
    const wk = stats?.weekNum;
    const weekProblems = wk ? problems.filter((p) => p.week === wk) : [];
    const weekDone = weekProblems.length > 0 && weekProblems.every((p) => p.done);
    const streak = stats?.streak ?? 0;

    // First data load: record baseline without firing.
    if (prevPct.current === null) {
      prevPct.current = pct;
      prevWeekDone.current = weekDone;
      prevStreak.current = streak;
      return;
    }

    const fire = (src: string) => {
      if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
      setCelebration(src);
    };

    const crossedPct = [100, 75, 50, 25].find(
      (m) => pct >= m && (prevPct.current ?? 0) < m
    );
    const crossedStreak = STREAK_MILESTONES.find(
      (m) => streak >= m && (prevStreak.current ?? 0) < m
    );

    if (weekDone && prevWeekDone.current === false) {
      fire("/animations/trophy.lottie");
    } else if (crossedPct) {
      fire(MILESTONE_LOTTIE[crossedPct]);
    } else if (crossedStreak) {
      fire("/animations/fire.lottie");
    }

    prevPct.current = pct;
    prevWeekDone.current = weekDone;
    prevStreak.current = streak;
  }, [problems, analytics?.range.total, stats?.weekNum, stats?.streak]);

  // Auto-dismiss the celebration after it plays.
  useEffect(() => {
    if (!celebration) return;
    const t = setTimeout(() => setCelebration(null), 2800);
    return () => clearTimeout(t);
  }, [celebration]);

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
        className={`rounded-md px-2 py-0.5 text-xs font-medium backdrop-blur-sm ${
          ahead
            ? "bg-emerald-500/20 text-emerald-300"
            : "bg-amber-500/20 text-amber-300"
        }`}
      >
        {ahead ? `+${diff} ahead` : `${Math.abs(diff)} behind`}
      </span>
    );
  })();

  return (
    <>
      {celebration && <Celebration src={celebration} />}

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
          <section className="relative flex h-full min-h-[240px] flex-col overflow-hidden rounded-xl border border-edge bg-panel shadow-card transition-colors duration-200 hover:border-slate-700/70">
            {/* Chart fills the card but is squashed in from the sides so it
                doesn't run to the rounded edges; labels float on top of it. */}
            <div className="absolute inset-y-0 left-2 right-3">
              {analytics ? (
                <PaceChart
                  cumulative={analytics.cumulative}
                  range={analytics.range}
                  solved={solved}
                  mode={paceMode}
                  projectedFinish={projection?.finishDate ?? null}
                />
              ) : (
                <Skeleton className="h-full rounded-none border-0 bg-transparent" />
              )}
            </div>

            {/* Floating header: title + Week/Full toggle + ahead badge. */}
            <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-center justify-between gap-2 px-4 py-3">
              <h3 className="text-sm font-semibold text-slate-200 [text-shadow:0_1px_6px_rgba(8,8,14,0.95)]">
                Pace
              </h3>
              <div className="pointer-events-auto flex items-center gap-2">
                <div className="flex rounded-md border border-edge bg-ink/70 p-0.5 text-[11px] backdrop-blur">
                  {(["near", "full"] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPaceMode(m)}
                      className={`rounded px-2 py-0.5 font-medium transition duration-150 active:scale-95 ${
                        paceMode === m
                          ? "bg-accent/20 text-accent-fg"
                          : "text-slate-500 hover:text-slate-300"
                      }`}
                    >
                      {m === "near" ? "Week" : "Full"}
                    </button>
                  ))}
                </div>
                {paceBadge}
              </div>
            </div>

            {/* Floating footer: projected-finish caption. */}
            {analytics && projection && (
              <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 px-4 py-3">
                <ProjectionNote
                  projection={projection}
                  phase1={analytics.range.phase1}
                />
              </div>
            )}
          </section>
        </Span>

        {/* Row 2 — this week's problems (2) + heatmap & difficulty stacked (1) */}
        <Span cols={2}>
          {stats ? (
            <WeekFocusPanel
              weekNum={stats.weekNum}
              problems={problems}
              onToggle={toggle}
              onToggleStar={toggleStar}
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
            onToggleStar={toggleStar}
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
