"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronRight, ExternalLink, Search, Star } from "lucide-react";
import type { ExamBankItem } from "@/lib/examTypes";
import { A2Z_TOPICS } from "@/lib/topicMap";
import { DIFFICULTIES, DIFF_LABEL, DIFF_TAG, topicColor, rgba } from "@/lib/tokens";
import { Tag } from "../Tag";
import { Collapse } from "../Collapse";
import { YouTubeIcon } from "../YouTubeIcon";

// Browsable A2Z question bank below the exam history — for quickly looking up a
// problem. Grouped by topic, with difficulty / topic / starred filters and a
// search box. Star a question to favorite it (shared with exam rows).
export function ExamBank() {
  const [items, setItems] = useState<ExamBankItem[] | null>(null);
  const [diffs, setDiffs] = useState<Set<string>>(new Set());
  const [topics, setTopics] = useState<Set<string>>(new Set());
  const [starredOnly, setStarredOnly] = useState(false);
  const [query, setQuery] = useState("");
  const [overrides, setOverrides] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetch("/api/exam/bank")
      .then((r) => (r.ok ? (r.json() as Promise<ExamBankItem[]>) : []))
      .then(setItems)
      .catch(() => setItems([]));
  }, []);

  const toggleStar = async (it: ExamBankItem) => {
    const starred = !it.starred;
    setItems((prev) =>
      prev
        ? prev.map((x) =>
            x.externalId === it.externalId ? { ...x, starred } : x
          )
        : prev
    );
    await fetch("/api/exam/star", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ externalId: it.externalId, starred }),
    }).catch(() => {});
  };

  const toggleSet = <T,>(set: Set<T>, v: T): Set<T> => {
    const next = new Set(set);
    if (next.has(v)) next.delete(v);
    else next.add(v);
    return next;
  };

  const filtered = useMemo(() => {
    if (!items) return [];
    const q = query.trim().toLowerCase();
    return items.filter(
      (it) =>
        (diffs.size === 0 || diffs.has(it.difficulty)) &&
        (topics.size === 0 || topics.has(it.topic)) &&
        (!starredOnly || it.starred) &&
        (!q || it.title.toLowerCase().includes(q))
    );
  }, [items, diffs, topics, starredOnly, query]);

  const groups = useMemo(() => {
    const m = new Map<string, ExamBankItem[]>();
    for (const it of filtered) {
      const arr = m.get(it.topic);
      if (arr) arr.push(it);
      else m.set(it.topic, [it]);
    }
    return A2Z_TOPICS.filter((t) => m.has(t)).map((t) => ({
      topic: t,
      items: m.get(t)!,
    }));
  }, [filtered]);

  const isOpen = (t: string) => overrides[t] ?? true;
  const allTopics = items
    ? A2Z_TOPICS.filter((t) => items.some((i) => i.topic === t))
    : [];

  return (
    <section className="flex max-h-[760px] flex-col rounded-xl border border-edge bg-panel shadow-card">
      <div className="border-b border-edge px-4 py-2.5">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-slate-200">
            Question bank · A2Z
          </h3>
          <span className="font-mono text-xs tabular-nums text-slate-500">
            {filtered.length}
            {items ? `/${items.length}` : ""}
          </span>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto scroll-thin">
        {/* Sticky filter bar */}
        <div className="sticky top-0 z-10 space-y-2 border-b border-edge bg-panel/95 px-3 py-2.5 backdrop-blur">
          <div className="flex flex-wrap items-center gap-1.5">
            {DIFFICULTIES.map((d) => {
              const active = diffs.has(d);
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDiffs((s) => toggleSet(s, d))}
                  className={`rounded-md border px-2.5 py-1 text-xs font-medium transition duration-150 active:scale-95 ${
                    active
                      ? DIFF_TAG[d]
                      : "border-edge text-slate-400 hover:border-slate-600 hover:text-slate-200"
                  }`}
                >
                  {DIFF_LABEL[d]}
                </button>
              );
            })}
            <span className="mx-1 h-5 w-px bg-edge" aria-hidden />
            <button
              type="button"
              onClick={() => setStarredOnly((v) => !v)}
              className={`flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-medium transition duration-150 active:scale-95 ${
                starredOnly
                  ? "border-amber-500/40 bg-amber-500/15 text-amber-300"
                  : "border-edge text-slate-400 hover:border-slate-600 hover:text-slate-200"
              }`}
            >
              <Star
                className="h-3.5 w-3.5"
                strokeWidth={2}
                fill={starredOnly ? "currentColor" : "none"}
              />
              Starred
            </button>
            <div className="relative ml-auto">
              <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-600" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search…"
                className="w-40 rounded-md border border-edge bg-panel2 py-1 pl-7 pr-2 text-xs text-slate-100 placeholder:text-slate-600 focus:border-accent/50 focus:outline-none"
              />
            </div>
          </div>
          {allTopics.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              {allTopics.map((t) => {
                const active = topics.has(t);
                const col = topicColor(t);
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTopics((s) => toggleSet(s, t))}
                    className="rounded-md border px-2 py-0.5 text-xs transition duration-150 active:scale-95"
                    style={
                      active
                        ? {
                            color: col,
                            backgroundColor: rgba(col, 0.15),
                            borderColor: rgba(col, 0.45),
                          }
                        : undefined
                    }
                  >
                    <span className={active ? "" : "text-slate-500"}>{t}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="space-y-1.5 p-3">
          {!items ? (
            <p className="py-6 text-center text-sm text-slate-600">Loading…</p>
          ) : groups.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-600">
              No questions match these filters.
            </p>
          ) : (
            groups.map((g) => {
              const open = isOpen(g.topic);
              const solved = g.items.filter((i) => i.solved).length;
              return (
                <div
                  key={g.topic}
                  className="overflow-hidden rounded-lg border border-edge bg-panel/30"
                >
                  <button
                    type="button"
                    onClick={() =>
                      setOverrides((o) => ({ ...o, [g.topic]: !open }))
                    }
                    className="flex w-full items-center gap-2 px-3 py-2 text-left transition-colors hover:bg-panel2/50"
                  >
                    <ChevronRight
                      className={`h-4 w-4 shrink-0 text-slate-500 transition-transform ${
                        open ? "rotate-90" : ""
                      }`}
                    />
                    <Tag variant="topic" value={g.topic} />
                    <span className="ml-auto font-mono text-xs tabular-nums text-slate-500">
                      {solved}/{g.items.length}
                    </span>
                  </button>
                  <Collapse open={open}>
                    <div className="space-y-1 border-t border-edge p-2">
                      {g.items.map((it) => (
                        <BankRow
                          key={it.externalId}
                          item={it}
                          onToggleStar={() => toggleStar(it)}
                        />
                      ))}
                    </div>
                  </Collapse>
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}

function BankRow({
  item: it,
  onToggleStar,
}: {
  item: ExamBankItem;
  onToggleStar: () => void;
}) {
  return (
    <div className="flex items-center gap-2.5 rounded-lg border border-edge/70 bg-panel/40 px-2.5 py-2 transition-colors hover:border-slate-700 hover:bg-panel2/60">
      <span
        className={`h-1.5 w-1.5 shrink-0 rounded-full ${
          it.solved
            ? "bg-emerald-400"
            : it.timesUsed > 0
              ? "bg-cyan-500/60"
              : "bg-slate-700"
        }`}
        title={
          it.solved
            ? "Solved in an exam"
            : it.timesUsed > 0
              ? `Seen in ${it.timesUsed} exam(s)`
              : "Not seen yet"
        }
      />
      <a
        href={it.article}
        target="_blank"
        rel="noreferrer"
        title="Open problem"
        className="flex min-w-0 flex-1 items-center gap-1.5 text-sm text-slate-100 hover:text-accent-fg"
      >
        <span className="truncate">{it.title}</span>
        {it.mostAsked && (
          <span title="Most asked" className="shrink-0 text-amber-400">
            ★
          </span>
        )}
        <ExternalLink className="h-3 w-3 shrink-0 text-slate-600" />
      </a>
      {it.youtube && (
        <a
          href={it.youtube}
          target="_blank"
          rel="noreferrer"
          aria-label={`Watch ${it.title}`}
          className="shrink-0 text-red-600 transition-opacity hover:opacity-80"
        >
          <YouTubeIcon className="h-4 w-4" />
        </a>
      )}
      <Tag
        variant="difficulty"
        value={it.difficulty}
        className="hidden sm:inline-flex"
      />
      <button
        type="button"
        onClick={onToggleStar}
        aria-label={it.starred ? "Unstar" : "Star"}
        className={`shrink-0 rounded transition active:scale-90 ${
          it.starred ? "text-amber-400" : "text-slate-600 hover:text-amber-300"
        }`}
      >
        <Star
          className="h-4 w-4"
          strokeWidth={2}
          fill={it.starred ? "currentColor" : "none"}
        />
      </button>
    </div>
  );
}
