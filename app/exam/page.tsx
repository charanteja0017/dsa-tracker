"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Check,
  Copy,
  Dices,
  ExternalLink,
  GraduationCap,
  Lock,
  Trash2,
} from "lucide-react";
import type {
  Exam,
  ExamListResponse,
  ExamTopicStat,
} from "@/lib/examTypes";
import type { Problem } from "@/lib/types";
import {
  A2Z_TOPICS,
  completedPatterns,
  topicStatuses,
  type TopicStatus,
} from "@/lib/topicMap";
import { topicColor, rgba } from "@/lib/tokens";
import { Tag } from "@/components/Tag";
import { Checkbox } from "@/components/Checkbox";
import { HatchedBar } from "@/components/HatchedBar";
import { YouTubeIcon } from "@/components/YouTubeIcon";

const SIZES = [5, 10, 15, 20];

const fmtClock = (s: number) =>
  `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export default function ExamPage() {
  const [list, setList] = useState<ExamListResponse | null>(null);
  const [current, setCurrent] = useState<Exam | null>(null);
  const [size, setSize] = useState(10);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [replayId, setReplayId] = useState("");
  const [copied, setCopied] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [notice, setNotice] = useState<string | null>(null);
  const [study, setStudy] = useState<Problem[] | null>(null);
  // Exam mode is locked behind the edit password — null = checking.
  const [authed, setAuthed] = useState<boolean | null>(null);

  // Which A2Z topics are unlocked by the completed study-plan patterns.
  const statuses = useMemo(() => {
    const rows = (study ?? []).map((p) => ({ pattern: p.pattern, done: p.done }));
    return topicStatuses(completedPatterns(rows));
  }, [study]);
  const unlockedTopics = statuses.filter((s) => s.open);
  const lockedTopics = statuses.filter((s) => !s.open);

  const loadList = useCallback(async () => {
    try {
      const res = await fetch("/api/exam");
      if (res.status === 401) {
        setAuthed(false);
        return;
      }
      if (res.ok) setList((await res.json()) as ExamListResponse);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    fetch("/api/auth")
      .then((r) => r.json() as Promise<{ authed: boolean }>)
      .then((a) => setAuthed(!!a.authed))
      .catch(() => setAuthed(false));
  }, []);

  useEffect(() => {
    if (!authed) return;
    loadList();
    fetch("/api/problems")
      .then((r) => (r.ok ? (r.json() as Promise<Problem[]>) : []))
      .then(setStudy)
      .catch(() => setStudy([]));
  }, [authed, loadList]);

  // Session timer while an exam is active.
  useEffect(() => {
    if (current?.status !== "active") return;
    setElapsed(0);
    const id = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(id);
  }, [current?.id, current?.status]);

  const create = useCallback(
    async (kind: "standard" | "weekly") => {
      setBusy(true);
      setError(null);
      try {
        const res = await fetch("/api/exam/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ size, kind }),
        });
        if (res.status === 401) {
          setAuthed(false);
          return;
        }
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "failed to create exam");
        setCurrent(data as Exam);
        loadList();
      } catch (e) {
        setError(e instanceof Error ? e.message : "failed");
      } finally {
        setBusy(false);
      }
    },
    [size, loadList]
  );
  const createExam = useCallback(() => create("standard"), [create]);
  const createWeekly = useCallback(() => create("weekly"), [create]);

  const openExam = useCallback(async (id: string) => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/exam/${encodeURIComponent(id)}`);
      if (res.status === 401) {
        setAuthed(false);
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "not found");
      setCurrent(data as Exam);
    } catch (e) {
      setError(e instanceof Error ? e.message : "failed");
    } finally {
      setBusy(false);
    }
  }, []);

  const toggleItem = useCallback(
    async (itemId: number, solved: boolean) => {
      setCurrent((prev) =>
        prev
          ? {
              ...prev,
              items: prev.items.map((it) =>
                it.itemId === itemId ? { ...it, solved } : it
              ),
            }
          : prev
      );
      await fetch("/api/exam/item", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, solved }),
      }).catch(() => {});
    },
    []
  );

  const submitExam = useCallback(async () => {
    if (!current) return;
    if (!confirm("Submit this exam? Solutions will be revealed and it freezes."))
      return;
    setBusy(true);
    try {
      const res = await fetch(
        `/api/exam/${encodeURIComponent(current.id)}/submit`,
        { method: "POST" }
      );
      const data = await res.json();
      if (res.ok) {
        setCurrent(data as Exam);
        loadList();
      }
    } finally {
      setBusy(false);
    }
  }, [current, loadList]);

  const copyId = useCallback(() => {
    if (!current) return;
    navigator.clipboard?.writeText(current.id).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      },
      () => {}
    );
  }, [current]);

  const backToStart = useCallback(() => {
    setCurrent(null);
    setError(null);
    loadList();
  }, [loadList]);

  const deleteExam = useCallback(
    async (id: string) => {
      if (!confirm("Delete this exam? Its problems return to the pool."))
        return;
      const res = await fetch(`/api/exam/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (res.status === 401) {
        setAuthed(false);
        return;
      }
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setNotice(`Deleted — ${data.returned ?? 0} problems returned to pool.`);
        setCurrent((c) => (c?.id === id ? null : c));
        loadList();
      }
    },
    [loadList]
  );

  const releaseUnsolved = useCallback(
    async (id: string) => {
      const res = await fetch(
        `/api/exam/${encodeURIComponent(id)}/release-unsolved`,
        { method: "POST" }
      );
      if (res.status === 401) {
        setAuthed(false);
        return;
      }
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setNotice(`${data.released ?? 0} unsolved problems returned to pool.`);
        loadList();
      }
    },
    [loadList]
  );

  // Auto-dismiss the success notice.
  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), 3500);
    return () => clearTimeout(t);
  }, [notice]);

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-edge bg-ink/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-[1600px] items-center gap-4 px-4 sm:px-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 transition-colors hover:text-slate-200"
          >
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Link>
          <h1 className="flex items-center gap-2 text-sm font-semibold tracking-tight text-slate-100">
            <Dices className="h-4 w-4 text-accent-fg" />
            Exam Mode
          </h1>
          <span className="hidden text-xs text-slate-500 sm:inline">
            Unseen A2Z practice · reproducible · weighted · topic-balanced
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6">
        {error && (
          <div className="mb-4 rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
            {error}
          </div>
        )}
        {notice && (
          <div className="mb-4 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
            {notice}
          </div>
        )}

        {authed === null ? (
          <div className="py-20 text-center text-sm text-slate-500">Loading…</div>
        ) : authed === false ? (
          <LockedView />
        ) : !current ? (
          <StartView
            size={size}
            setSize={setSize}
            busy={busy}
            onStart={createExam}
            onStartWeekly={createWeekly}
            unlockedTopics={unlockedTopics}
            lockedTopics={lockedTopics}
            list={list}
            replayId={replayId}
            setReplayId={setReplayId}
            onOpen={openExam}
            onDelete={deleteExam}
          />
        ) : current.status === "active" ? (
          <ActiveView
            exam={current}
            elapsed={elapsed}
            busy={busy}
            copied={copied}
            onCopyId={copyId}
            onToggle={toggleItem}
            onSubmit={submitExam}
            onCancel={backToStart}
            onDelete={deleteExam}
          />
        ) : (
          <ResultsView
            exam={current}
            copied={copied}
            onCopyId={copyId}
            onNew={backToStart}
            onDelete={deleteExam}
            onReleaseUnsolved={releaseUnsolved}
          />
        )}
      </main>
    </div>
  );
}

// ── Locked (not unlocked) ──────────────────────────────────────────────────
function LockedView() {
  return (
    <div className="mx-auto mt-12 max-w-md rounded-xl border border-edge bg-panel p-8 text-center shadow-card">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/15 text-amber-300">
        <Lock className="h-6 w-6" />
      </div>
      <h2 className="text-lg font-semibold text-slate-100">
        Exam mode is locked
      </h2>
      <p className="mt-1.5 text-sm text-slate-400">
        Unlock editing on the dashboard (the lock in the header) with your
        password, then come back to generate and take exams.
      </p>
      <Link
        href="/"
        className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-bold text-ink transition hover:brightness-110 active:scale-95"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to dashboard
      </Link>
    </div>
  );
}

// ── Start ──────────────────────────────────────────────────────────────────
function StartView({
  size,
  setSize,
  busy,
  onStart,
  onStartWeekly,
  unlockedTopics,
  lockedTopics,
  list,
  replayId,
  setReplayId,
  onOpen,
  onDelete,
}: {
  size: number;
  setSize: (n: number) => void;
  busy: boolean;
  onStart: () => void;
  onStartWeekly: () => void;
  unlockedTopics: TopicStatus[];
  lockedTopics: TopicStatus[];
  list: ExamListResponse | null;
  replayId: string;
  setReplayId: (s: string) => void;
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  // study patterns to finish next to unlock more topics
  const nextNeeds = [...new Set(lockedTopics.flatMap((t) => t.needs))].slice(0, 6);

  return (
    <div className="space-y-5">
      {list && <ExamProgressHero list={list} />}
      <div className="grid items-start gap-5 md:grid-cols-2 xl:grid-cols-3">
      <section className="rounded-xl border border-accent/40 bg-gradient-to-b from-panel2 to-panel p-6 shadow-card ring-1 ring-accent/10">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-accent-fg" />
          <h2 className="text-xl font-semibold text-slate-100">Weekly exam</h2>
        </div>
        <p className="mt-1 text-sm text-slate-400">
          Tested only on topics you&apos;ve finished — Striver problems for the
          LeetCode tags you&apos;ve completed. A topic opens once it and its
          prerequisites are done.
        </p>

        {unlockedTopics.length > 0 ? (
          <>
            <div className="mt-4 text-xs font-semibold uppercase tracking-wide text-emerald-300">
              Unlocked ({unlockedTopics.length})
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {unlockedTopics.map((t) => (
                <Tag key={t.topic} variant="topic" value={t.topic} />
              ))}
            </div>
            <button
              type="button"
              onClick={onStartWeekly}
              disabled={busy}
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-bold text-ink transition duration-150 hover:brightness-110 active:scale-95 disabled:opacity-50"
            >
              <GraduationCap className="h-4 w-4" />
              {busy ? "Generating…" : `Start weekly exam (${size})`}
            </button>
          </>
        ) : (
          <div className="mt-4 rounded-lg border border-dashed border-edge bg-panel/50 p-3 text-sm text-slate-400">
            No topics unlocked yet — finish a topic in the{" "}
            <Link href="/" className="text-accent-fg hover:underline">
              study plan
            </Link>{" "}
            to unlock its exam.
          </div>
        )}

        {lockedTopics.length > 0 && (
          <p className="mt-3 text-xs text-slate-500">
            <Lock className="mr-1 inline h-3 w-3" />
            {lockedTopics.length} locked
            {nextNeeds.length > 0 && (
              <> · finish next: {nextNeeds.join(", ")}</>
            )}
          </p>
        )}
      </section>

      <section className="rounded-xl border border-edge bg-panel p-6 shadow-card">
        <h2 className="text-xl font-semibold text-slate-100">Random exam</h2>
        <p className="mt-1 text-sm text-slate-400">
          A fresh, weighted, topic-balanced set drawn from the whole 327-question
          A2Z bank. Solutions stay hidden until you submit.
        </p>

        <div className="mt-5 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Questions
        </div>
        <div className="mt-2 flex gap-2">
          {SIZES.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setSize(n)}
              className={`h-11 w-14 rounded-lg border text-base font-bold tabular-nums transition duration-150 active:scale-95 ${
                size === n
                  ? "border-accent/50 bg-accent/20 text-accent-fg"
                  : "border-edge text-slate-400 hover:border-slate-600 hover:text-slate-200"
              }`}
            >
              {n}
            </button>
          ))}
        </div>

        {list && (
          <p className="mt-4 text-xs text-slate-500">
            <span className="font-semibold text-emerald-300">
              {list.poolFresh}
            </span>{" "}
            fresh of {list.poolTotal} problems available
          </p>
        )}

        <button
          type="button"
          onClick={onStart}
          disabled={busy}
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-bold text-ink transition duration-150 hover:brightness-110 active:scale-95 disabled:opacity-50"
        >
          <Dices className="h-4 w-4" />
          {busy ? "Generating…" : "Start exam"}
        </button>

        <div className="mt-6 border-t border-edge pt-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Replay by id
          </div>
          <div className="mt-2 flex gap-2">
            <input
              value={replayId}
              onChange={(e) => setReplayId(e.target.value.trim().toUpperCase())}
              placeholder="EXAM-XXXXXX"
              className="min-w-0 flex-1 rounded-lg border border-edge bg-panel2 px-3 py-2 font-mono text-sm text-slate-100 placeholder:text-slate-600 focus:border-accent/50 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => replayId && onOpen(replayId)}
              className="rounded-lg border border-edge px-3 py-2 text-sm font-medium text-slate-300 transition hover:border-slate-600 active:scale-95"
            >
              Open
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-edge bg-panel p-5 shadow-card">
        <h3 className="text-sm font-semibold text-slate-200">History</h3>
        <p className="mt-0.5 text-xs text-slate-500">
          Every exam is reproducible from its id.
        </p>
        <div className="mt-3 space-y-1.5">
          {!list || list.exams.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-600">
              No exams yet — start your first above.
            </p>
          ) : (
            list.exams.map((e) => (
              <div
                key={e.id}
                className="group flex items-center gap-3 rounded-lg border border-edge bg-panel/50 px-3 py-2 transition hover:border-slate-700 hover:bg-panel2/60"
              >
                <button
                  type="button"
                  onClick={() => onOpen(e.id)}
                  className="flex min-w-0 flex-1 items-center gap-3 text-left active:scale-[0.99]"
                >
                  <span className="font-mono text-xs font-semibold text-accent-fg">
                    {e.id}
                  </span>
                  {e.kind === "weekly" && (
                    <span
                      title="Weekly exam"
                      className="inline-flex items-center gap-0.5 rounded bg-accent/15 px-1 py-0.5 text-[10px] font-medium text-accent-fg"
                    >
                      <GraduationCap className="h-3 w-3" />
                    </span>
                  )}
                  <span className="hidden text-xs text-slate-500 sm:inline">
                    {fmtDate(e.createdAt)}
                  </span>
                  <span className="ml-auto font-mono text-xs tabular-nums text-slate-400">
                    {e.solved}/{e.size}
                  </span>
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${
                      e.status === "submitted"
                        ? "bg-emerald-500/15 text-emerald-300"
                        : "bg-amber-500/15 text-amber-300"
                    }`}
                  >
                    {e.status === "submitted" ? "done" : "active"}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(e.id)}
                  title="Delete exam (returns its problems to the pool)"
                  className="shrink-0 rounded p-1 text-slate-600 transition hover:text-rose-400 active:scale-90"
                  aria-label={`Delete ${e.id}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </section>
      </div>
      {list && list.byTopic.length > 0 && (
        <ByTopicStats byTopic={list.byTopic} />
      )}
    </div>
  );
}

// ── Exam pool stats ─────────────────────────────────────────────────────────
function ExamProgressHero({ list }: { list: ExamListResponse }) {
  const pct = list.poolTotal
    ? Math.round((list.solvedTotal / list.poolTotal) * 100)
    : 0;
  const stat = (
    value: number,
    label: string,
    sub: string,
    color: string
  ) => (
    <div className="flex items-baseline gap-2">
      <span
        className={`font-display text-5xl font-black leading-none tracking-tighter tabular-nums ${color}`}
      >
        {value}
      </span>
      <span className="flex flex-col text-sm leading-tight text-slate-400">
        <span className="font-semibold text-slate-200">{label}</span>
        <span>{sub}</span>
      </span>
    </div>
  );
  return (
    <section className="rounded-xl border border-edge bg-panel px-6 py-5 shadow-card">
      <div className="flex flex-wrap items-center gap-x-12 gap-y-5">
        {stat(list.solvedTotal, "solved", `/${list.poolTotal}`, "text-slate-50")}
        {stat(list.writtenTotal, "written", "in exams", "text-accent")}
        {stat(list.poolFresh, "fresh", "available", "text-emerald-300")}
      </div>
      <div className="mt-5">
        <div className="mb-1.5 flex items-end justify-between">
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
            Exam progress
          </span>
          <span className="font-display text-3xl font-black leading-none tracking-tighter tabular-nums text-accent">
            {pct}%
          </span>
        </div>
        <HatchedBar percent={pct} />
      </div>
    </section>
  );
}

function ByTopicStats({ byTopic }: { byTopic: ExamTopicStat[] }) {
  const order = new Map(A2Z_TOPICS.map((t, i) => [t, i]));
  const rows = [...byTopic].sort(
    (a, b) => (order.get(a.topic) ?? 99) - (order.get(b.topic) ?? 99)
  );
  return (
    <section className="rounded-xl border border-edge bg-panel shadow-card">
      <div className="flex items-center justify-between border-b border-edge px-4 py-2.5">
        <h3 className="text-sm font-semibold text-slate-200">
          By topic · written &amp; solved
        </h3>
        <div className="flex items-center gap-3 text-[11px] text-slate-500">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-slate-400" /> solved
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-slate-600" /> written
          </span>
        </div>
      </div>
      <div className="columns-1 gap-x-10 p-4 md:columns-2 xl:columns-3">
        {rows.map((t) => {
          const c = topicColor(t.topic);
          const wr = t.total ? (t.written / t.total) * 100 : 0;
          const sv = t.total ? (t.solved / t.total) * 100 : 0;
          return (
            <div
              key={t.topic}
              className="mb-2.5 flex items-center gap-3 break-inside-avoid text-sm"
            >
              <span
                className="w-44 shrink-0 truncate text-slate-300"
                title={t.topic}
              >
                {t.topic}
              </span>
              <div className="relative h-2.5 flex-1 overflow-hidden rounded-full bg-panel2">
                <div
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{ width: `${wr}%`, background: rgba(c, 0.35) }}
                />
                <div
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{ width: `${sv}%`, background: c }}
                />
              </div>
              <span className="w-14 shrink-0 text-right font-mono text-xs tabular-nums text-slate-500">
                {t.solved}/{t.total}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ── Active ─────────────────────────────────────────────────────────────────
function ActiveView({
  exam,
  elapsed,
  busy,
  copied,
  onCopyId,
  onToggle,
  onSubmit,
  onCancel,
  onDelete,
}: {
  exam: Exam;
  elapsed: number;
  busy: boolean;
  copied: boolean;
  onCopyId: () => void;
  onToggle: (itemId: number, solved: boolean) => void;
  onSubmit: () => void;
  onCancel: () => void;
  onDelete: (id: string) => void;
}) {
  const solved = exam.items.filter((i) => i.solved).length;
  return (
    <div>
      <ExamHeader exam={exam} copied={copied} onCopyId={onCopyId} onDelete={onDelete}>
        <span className="rounded-md bg-amber-500/15 px-2 py-0.5 text-xs font-medium text-amber-300">
          Active
        </span>
        <span className="font-mono text-lg font-bold tabular-nums text-slate-100">
          {fmtClock(elapsed)}
        </span>
      </ExamHeader>

      <div className="mb-3 flex items-center justify-between text-sm text-slate-400">
        <span>
          {solved}/{exam.items.length} solved
        </span>
        <span className="text-xs text-slate-600">
          Open a problem to solve it · walkthroughs hidden until submit
        </span>
      </div>

      <div className="space-y-1.5">
        {exam.items.map((it) => (
          <div
            key={it.itemId}
            className="group flex items-center gap-3 rounded-lg border border-edge bg-panel/50 px-3 py-2.5 transition-colors hover:border-slate-700"
          >
            <span className="w-5 shrink-0 text-center font-mono text-xs text-slate-600">
              {it.position + 1}
            </span>
            <Checkbox
              checked={it.solved}
              onChange={(v) => onToggle(it.itemId, v)}
              label={`Mark ${it.title} solved`}
            />
            {it.article ? (
              <a
                href={it.article}
                target="_blank"
                rel="noreferrer"
                title="Open problem to solve"
                className={`flex min-w-0 flex-1 items-center gap-1.5 text-sm ${
                  it.solved
                    ? "text-slate-500 line-through"
                    : "text-slate-100 hover:text-accent-fg"
                }`}
              >
                <span className="truncate">{it.title}</span>
                <ExternalLink className="h-3.5 w-3.5 shrink-0 text-slate-600 transition-colors group-hover:text-accent-fg" />
              </a>
            ) : (
              <span
                className={`min-w-0 flex-1 truncate text-sm ${
                  it.solved ? "text-slate-500 line-through" : "text-slate-100"
                }`}
              >
                {it.title}
              </span>
            )}
            <Tag
              variant="topic"
              value={it.topic}
              className="hidden sm:inline-flex"
            />
            <Tag variant="difficulty" value={it.difficulty} />
          </div>
        ))}
      </div>

      <div className="mt-5 flex items-center gap-3">
        <button
          type="button"
          onClick={onSubmit}
          disabled={busy}
          className="rounded-lg bg-accent px-5 py-2.5 text-sm font-bold text-ink transition hover:brightness-110 active:scale-95 disabled:opacity-50"
        >
          Submit exam
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="text-sm text-slate-500 transition-colors hover:text-slate-300"
        >
          Back
        </button>
      </div>
    </div>
  );
}

// ── Results ────────────────────────────────────────────────────────────────
function ResultsView({
  exam,
  copied,
  onCopyId,
  onNew,
  onDelete,
  onReleaseUnsolved,
}: {
  exam: Exam;
  copied: boolean;
  onCopyId: () => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  onReleaseUnsolved: (id: string) => void;
}) {
  const solved = exam.items.filter((i) => i.solved).length;
  const unsolved = exam.items.length - solved;
  const pct = exam.items.length
    ? Math.round((solved / exam.items.length) * 100)
    : 0;

  const byTopic = useMemo(() => {
    const m = new Map<string, { done: number; total: number }>();
    for (const it of exam.items) {
      const e = m.get(it.topic) ?? { done: 0, total: 0 };
      e.total++;
      if (it.solved) e.done++;
      m.set(it.topic, e);
    }
    return [...m.entries()];
  }, [exam.items]);

  return (
    <div>
      <ExamHeader
        exam={exam}
        copied={copied}
        onCopyId={onCopyId}
        onDelete={onDelete}
      >
        {unsolved > 0 && (
          <button
            type="button"
            onClick={() => onReleaseUnsolved(exam.id)}
            title="Put the problems you didn't solve back into the pool"
            className="rounded-md border border-edge px-2 py-1 text-xs font-medium text-slate-300 transition hover:border-amber-500/40 hover:text-amber-300 active:scale-95"
          >
            Return {unsolved} unsolved
          </button>
        )}
        <span className="rounded-md bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-300">
          Submitted
        </span>
      </ExamHeader>

      <div className="grid gap-4 md:grid-cols-[200px_1fr]">
        <div className="rounded-xl border border-edge bg-panel p-5 text-center shadow-card">
          <div className="font-display text-5xl font-black tabular-nums text-slate-50">
            {pct}%
          </div>
          <div className="mt-1 text-sm text-slate-400">
            {solved} / {exam.items.length} solved
          </div>
          <button
            type="button"
            onClick={onNew}
            className="mt-4 w-full rounded-lg bg-accent px-4 py-2 text-sm font-bold text-ink transition hover:brightness-110 active:scale-95"
          >
            New exam
          </button>
        </div>

        <div className="rounded-xl border border-edge bg-panel p-4 shadow-card">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            By topic
          </h3>
          <div className="grid grid-cols-1 gap-x-6 gap-y-1.5 sm:grid-cols-2">
            {byTopic.map(([topic, s]) => (
              <div key={topic} className="flex items-center gap-2 text-sm">
                <Tag variant="topic" value={topic} />
                <span className="ml-auto font-mono text-xs tabular-nums text-slate-500">
                  {s.done}/{s.total}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <h3 className="mb-2 mt-5 text-xs font-semibold uppercase tracking-wide text-slate-500">
        Review · solutions revealed
      </h3>
      <div className="space-y-1.5">
        {exam.items.map((it) => (
          <div
            key={it.itemId}
            className="flex items-center gap-3 rounded-lg border border-edge bg-panel/50 px-3 py-2.5"
          >
            <span className="w-5 shrink-0 text-center font-mono text-xs text-slate-600">
              {it.position + 1}
            </span>
            <span
              className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${
                it.solved ? "bg-emerald-500/20 text-emerald-400" : "text-slate-600"
              }`}
            >
              {it.solved ? <Check className="h-3 w-3" strokeWidth={3} /> : "·"}
            </span>
            <span className="min-w-0 flex-1 truncate text-sm text-slate-100">
              {it.title}
            </span>
            {it.youtube && (
              <a
                href={it.youtube}
                target="_blank"
                rel="noreferrer"
                title="Striver walkthrough"
                className="shrink-0 text-red-600 transition-opacity hover:opacity-80"
              >
                <YouTubeIcon className="h-4 w-4" />
              </a>
            )}
            {it.article && (
              <a
                href={it.article}
                target="_blank"
                rel="noreferrer"
                title="Article"
                className="shrink-0 text-slate-400 transition-colors hover:text-slate-200"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
            <Tag
              variant="topic"
              value={it.topic}
              className="hidden sm:inline-flex"
            />
            <Tag variant="difficulty" value={it.difficulty} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Shared exam header (id is the reproducible seed) ────────────────────────
function ExamHeader({
  exam,
  copied,
  onCopyId,
  onDelete,
  children,
}: {
  exam: Exam;
  copied: boolean;
  onCopyId: () => void;
  onDelete: (id: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={onCopyId}
        title="Copy exam id (reproducible seed)"
        className="inline-flex items-center gap-2 rounded-lg border border-edge bg-panel2 px-3 py-1.5 font-mono text-sm font-bold text-accent-fg transition hover:border-slate-600 active:scale-95"
      >
        {exam.id}
        {copied ? (
          <Check className="h-3.5 w-3.5 text-emerald-400" />
        ) : (
          <Copy className="h-3.5 w-3.5 text-slate-500" />
        )}
      </button>
      <span className="text-xs text-slate-500">{exam.size} questions</span>
      {exam.kind === "weekly" && (
        <span className="inline-flex items-center gap-1 rounded-md bg-accent/15 px-2 py-0.5 text-xs font-medium text-accent-fg">
          <GraduationCap className="h-3.5 w-3.5" />
          Weekly
        </span>
      )}
      <div className="ml-auto flex items-center gap-3">
        {children}
        <button
          type="button"
          onClick={() => onDelete(exam.id)}
          title="Delete exam (returns its problems to the pool)"
          className="inline-flex items-center gap-1 rounded-md border border-edge px-2 py-1 text-xs font-medium text-slate-400 transition hover:border-rose-500/40 hover:text-rose-300 active:scale-95"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Delete</span>
        </button>
      </div>
    </div>
  );
}
