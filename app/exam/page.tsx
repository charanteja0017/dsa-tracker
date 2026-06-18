"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Check,
  Copy,
  Dices,
  ExternalLink,
  Lock,
  Trash2,
} from "lucide-react";
import type { Exam, ExamListResponse } from "@/lib/examTypes";
import { Tag } from "@/components/Tag";
import { Checkbox } from "@/components/Checkbox";
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
  // Exam mode is locked behind the edit password — null = checking.
  const [authed, setAuthed] = useState<boolean | null>(null);

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
    if (authed) loadList();
  }, [authed, loadList]);

  // Session timer while an exam is active.
  useEffect(() => {
    if (current?.status !== "active") return;
    setElapsed(0);
    const id = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(id);
  }, [current?.id, current?.status]);

  const createExam = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/exam/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ size }),
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
  }, [size, loadList]);

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
        <div className="mx-auto flex h-14 max-w-[1100px] items-center gap-4 px-4 sm:px-6">
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

      <main className="mx-auto max-w-[1100px] px-4 py-6 sm:px-6">
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
  list: ExamListResponse | null;
  replayId: string;
  setReplayId: (s: string) => void;
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="grid gap-5 md:grid-cols-[1.1fr_0.9fr]">
      <section className="rounded-xl border border-accent/40 bg-gradient-to-b from-panel2 to-panel p-6 shadow-card ring-1 ring-accent/10">
        <h2 className="text-xl font-semibold text-slate-100">New exam</h2>
        <p className="mt-1 text-sm text-slate-400">
          A fresh, weighted, topic-balanced set drawn from the 327-question A2Z
          bank. Solutions stay hidden until you submit.
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
