"use client";

import { useEffect, useState, useCallback } from "react";

type Stats = {
  mustDoDone: number; mustDoTotal: number; totalSolved: number;
  totalMinutes: number; streak: number; weekNum: number;
  daysToPhase1: number; target: number;
  byPattern: { pattern: string; total: number; done: number }[];
};
type Problem = {
  id: number; title: string; companies: number; difficulty: string;
  pattern: string; week: number; link: string; done: boolean;
};
type Recruiter = {
  company: string; hires: number; type: string;
  dsa_bar: string; pattern: string; focus: string;
};

const DIFF_COLOR: Record<string, string> = {
  EASY: "text-emerald-400", MEDIUM: "text-amber-400", HARD: "text-rose-400",
};
const TYPE_COLOR: Record<string, string> = {
  "Product/Lab": "bg-blue-500/20 text-blue-300",
  "AI/ML firm": "bg-fuchsia-500/20 text-fuchsia-300",
  "Service/Consult": "bg-amber-500/20 text-amber-300",
};

export default function Home() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [recruiters, setRecruiters] = useState<Recruiter[]>([]);
  const [filter, setFilter] = useState<string>("ALL");
  const [today, setToday] = useState({ solved: "", minutes: "", confidence: "", topic: "", notes: "" });
  const [saved, setSaved] = useState(false);
  const [openCo, setOpenCo] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [s, p, r] = await Promise.all([
      fetch("/api/stats").then((r) => r.json()),
      fetch("/api/problems").then((r) => r.json()),
      fetch("/api/recruiters").then((r) => r.json()),
    ]);
    setStats(s); setProblems(p); setRecruiters(r);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function toggle(id: number, done: boolean) {
    setProblems((prev) => prev.map((x) => (x.id === id ? { ...x, done } : x)));
    await fetch("/api/problems", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, done }),
    });
    load();
  }

  async function saveDay() {
    const d = new Date().toISOString().slice(0, 10);
    await fetch("/api/log", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: d,
        solved: Number(today.solved) || 0,
        minutes: Number(today.minutes) || 0,
        confidence: today.confidence ? Number(today.confidence) : null,
        topic: today.topic || null,
        notes: today.notes || null,
      }),
    });
    setSaved(true); setTimeout(() => setSaved(false), 1500);
    load();
  }

  const patterns = ["ALL", ...Array.from(new Set(problems.map((p) => p.pattern)))];
  const shown = filter === "ALL" ? problems : problems.filter((p) => p.pattern === filter);
  const pct = stats ? Math.round((stats.totalSolved / stats.target) * 100) : 0;

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-1">DSA Placement Tracker</h1>
      <p className="text-slate-400 text-sm mb-6">23-week plan &middot; Jun 22 &rarr; Phase 1 on Dec 1</p>

      {/* Stat cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <Card label="Week" value={`${stats.weekNum} / 23`} />
          <Card label="Days to Phase 1" value={stats.daysToPhase1} />
          <Card label="Streak" value={`${stats.streak} 🔥`} />
          <Card label="Total solved" value={stats.totalSolved} />
        </div>
      )}

      {/* Progress to target */}
      {stats && (
        <div className="mb-8">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-slate-300">Progress to {stats.target} problems</span>
            <span className="text-slate-400">{stats.totalSolved} ({pct}%)</span>
          </div>
          <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500" style={{ width: `${Math.min(pct, 100)}%` }} />
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Must-do 60 list: {stats.mustDoDone}/{stats.mustDoTotal} done &middot;{" "}
            {Math.round(stats.totalMinutes / 60)} hrs logged
          </p>
        </div>
      )}

      {/* Today's log */}
      <section className="mb-8 bg-slate-900/60 rounded-xl p-4 border border-slate-800">
        <h2 className="font-semibold mb-3">Log today</h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-2">
          <Input ph="Solved" v={today.solved} on={(v) => setToday({ ...today, solved: v })} />
          <Input ph="Minutes" v={today.minutes} on={(v) => setToday({ ...today, minutes: v })} />
          <Input ph="Conf 1-5" v={today.confidence} on={(v) => setToday({ ...today, confidence: v })} />
          <Input ph="Topic" v={today.topic} on={(v) => setToday({ ...today, topic: v })} />
          <button onClick={saveDay} className="bg-blue-600 hover:bg-blue-500 rounded px-3 py-2 text-sm font-medium">
            {saved ? "Saved ✓" : "Save"}
          </button>
        </div>
        <input
          placeholder="Notes / weak spots"
          value={today.notes}
          onChange={(e) => setToday({ ...today, notes: e.target.value })}
          className="w-full bg-slate-800 rounded px-3 py-2 text-sm outline-none"
        />
      </section>

      {/* Per-pattern progress */}
      {stats && (
        <section className="mb-8">
          <h2 className="font-semibold mb-3">By pattern</h2>
          <div className="grid sm:grid-cols-2 gap-2">
            {stats.byPattern.map((p) => (
              <div key={p.pattern} className="flex items-center gap-2 text-sm">
                <span className="w-40 shrink-0 text-slate-300">{p.pattern}</span>
                <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500" style={{ width: `${(p.done / p.total) * 100}%` }} />
                </div>
                <span className="text-slate-500 w-12 text-right">{p.done}/{p.total}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Senior recruiters (AI dept 2026) */}
      {recruiters.length > 0 && (
        <section className="mb-8">
          <h2 className="font-semibold mb-1">Senior recruiters &middot; AI Dept 2026</h2>
          <p className="text-xs text-slate-500 mb-3">
            Tap a company for its interview pattern & your prep focus. Directional (one cohort, ~35 students).
          </p>
          <div className="space-y-1">
            {recruiters.map((r) => (
              <div key={r.company} className="bg-slate-900/40 rounded border border-slate-800/60">
                <button
                  onClick={() => setOpenCo(openCo === r.company ? null : r.company)}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-left"
                >
                  <span className="flex-1 font-medium">{r.company}</span>
                  <span className={`text-xs px-2 py-0.5 rounded ${TYPE_COLOR[r.type] ?? ""}`}>{r.type}</span>
                  <span className="text-slate-500 text-xs w-20 text-right">{r.dsa_bar}</span>
                  <span className="text-slate-600 text-xs w-12 text-right">{r.hires} hire{r.hires > 1 ? "s" : ""}</span>
                  <span className="text-slate-600">{openCo === r.company ? "▾" : "▸"}</span>
                </button>
                {openCo === r.company && (
                  <div className="px-3 pb-3 text-sm space-y-2 border-t border-slate-800/60 pt-2">
                    <div>
                      <span className="text-slate-500 text-xs uppercase tracking-wide">Pattern</span>
                      <p className="text-slate-300">{r.pattern}</p>
                    </div>
                    <div>
                      <span className="text-blue-400 text-xs uppercase tracking-wide">Your focus</span>
                      <p className="text-slate-200">{r.focus}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Must-do problems */}
      <section>
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <h2 className="font-semibold">Must-do problems</h2>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-slate-800 rounded px-2 py-1 text-sm"
          >
            {patterns.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div className="space-y-1">
          {shown.map((p) => (
            <div key={p.id} className="flex items-center gap-3 bg-slate-900/40 rounded px-3 py-2 text-sm border border-slate-800/60">
              <input type="checkbox" checked={p.done} onChange={(e) => toggle(p.id, e.target.checked)} className="w-4 h-4 accent-blue-500" />
              <a href={p.link} target="_blank" rel="noreferrer" className={`flex-1 ${p.done ? "line-through text-slate-600" : "hover:underline"}`}>
                {p.title}
              </a>
              <span className="text-slate-500 hidden sm:inline">{p.pattern}</span>
              <span className={`${DIFF_COLOR[p.difficulty]} w-16 text-right text-xs`}>{p.difficulty}</span>
              <span className="text-slate-600 text-xs w-12 text-right">W{p.week}</span>
              <span className="text-slate-500 text-xs w-10 text-right">{p.companies}co</span>
            </div>
          ))}
        </div>
      </section>

      <footer className="mt-10 text-center text-xs text-slate-600">
        First run? Visit <code className="text-slate-400">/api/init</code> once to set up the database.
      </footer>
    </main>
  );
}

function Card({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-800">
      <div className="text-slate-400 text-xs mb-1">{label}</div>
      <div className="text-xl font-bold">{value}</div>
    </div>
  );
}

function Input({ ph, v, on }: { ph: string; v: string; on: (v: string) => void }) {
  return (
    <input
      placeholder={ph}
      value={v}
      onChange={(e) => on(e.target.value)}
      className="bg-slate-800 rounded px-3 py-2 text-sm outline-none w-full"
    />
  );
}
