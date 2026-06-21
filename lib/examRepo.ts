import { sql, initExamSchema } from "./db";
import { EXAM_PROBLEMS } from "./examSeedData";
import { pointsFor } from "./examScore";
import type { PoolItem } from "./examSampling";
import type { Exam, ExamItem, ExamStatus } from "./examTypes";

// Days since last use after which a problem counts as "fresh" again (UI stat).
export const FRESH_DAYS = 14;

// Crockford-ish alphabet (no I/L/O/U) for readable, unambiguous exam ids/seeds.
const ID_ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

export function genExamId(rand: () => number = Math.random): string {
  let s = "";
  for (let i = 0; i < 6; i++) {
    s += ID_ALPHABET[Math.floor(rand() * ID_ALPHABET.length)];
  }
  return `EXAM-${s}`;
}

const toMs = (v: unknown): number | null => {
  if (v == null) return null;
  if (v instanceof Date) return v.getTime();
  const t = Date.parse(String(v));
  return Number.isNaN(t) ? null : t;
};

const toIso = (v: unknown): string | null => {
  const ms = toMs(v);
  return ms === null ? null : new Date(ms).toISOString();
};

// Upsert the A2Z bank into exam_pool in ONE round-trip (UNNEST of column
// arrays). ON CONFLICT updates only the STATIC fields — never times_used /
// last_used_at (the cooldown signal). Safe to re-run.
export async function seedExamPool(): Promise<void> {
  const ids = EXAM_PROBLEMS.map((p) => p.externalId);
  const titles = EXAM_PROBLEMS.map((p) => p.title);
  const topics = EXAM_PROBLEMS.map((p) => p.topic);
  const diffs = EXAM_PROBLEMS.map((p) => p.difficulty);
  const mostAsked = EXAM_PROBLEMS.map((p) => p.mostAsked);
  const weights = EXAM_PROBLEMS.map((p) => p.weight);
  const youtubes = EXAM_PROBLEMS.map((p) => p.youtube);
  const articles = EXAM_PROBLEMS.map((p) => p.article);
  await sql`
    INSERT INTO exam_pool
      (external_id, title, topic, difficulty, most_asked, weight, youtube, article)
    SELECT * FROM UNNEST(
      ${ids}::int[],
      ${titles}::text[],
      ${topics}::text[],
      ${diffs}::text[],
      ${mostAsked}::boolean[],
      ${weights}::int[],
      ${youtubes}::text[],
      ${articles}::text[]
    )
    ON CONFLICT (external_id) DO UPDATE SET
      title      = EXCLUDED.title,
      topic      = EXCLUDED.topic,
      difficulty = EXCLUDED.difficulty,
      most_asked = EXCLUDED.most_asked,
      weight     = EXCLUDED.weight,
      youtube    = EXCLUDED.youtube,
      article    = EXCLUDED.article;
  `;
}

// Make sure the exam tables exist and the pool is populated (auto-seed on first
// use so exam mode works without a manual /api/exam/init step). Memoized per
// serverless instance so it runs once, not on every request.
let examReady: Promise<void> | null = null;
export function ensureExamReady(): Promise<void> {
  examReady ??= (async () => {
    await initExamSchema();
    const [{ count }] = (await sql`
      SELECT COUNT(*)::int AS count FROM exam_pool;
    `) as { count: number }[];
    if (count === 0) await seedExamPool();
  })();
  return examReady;
}

// Recompute cooldown bookkeeping (times_used + last_used_at) for the given
// problems straight from remaining exam usage — so when an exam is deleted (or
// its unsolved problems are released), those problems return to the pool with an
// accurate count. `excludeExamId` ignores one exam's usage (used by
// release-unsolved, which keeps the exam but frees its unsolved problems).
// A problem with no remaining usage resets to fully fresh (0 / NULL).
export async function recomputeCooldown(
  externalIds: number[],
  excludeExamId: string | null = null
): Promise<void> {
  if (externalIds.length === 0) return;
  await sql`
    UPDATE exam_pool p SET
      times_used = u.cnt,
      last_used_at = u.last_used
    FROM (
      SELECT pid AS external_id,
        (SELECT COUNT(*)::int FROM exam_items ei
           WHERE ei.external_id = pid
             AND (${excludeExamId}::text IS NULL OR ei.exam_id <> ${excludeExamId})
        ) AS cnt,
        (SELECT MAX(e.created_at) FROM exam_items ei
           JOIN exams e ON e.id = ei.exam_id
           WHERE ei.external_id = pid
             AND (${excludeExamId}::text IS NULL OR ei.exam_id <> ${excludeExamId})
        ) AS last_used
      FROM UNNEST(${externalIds}::int[]) AS pid
    ) u
    WHERE p.external_id = u.external_id;
  `;
}

export async function poolForSampling(): Promise<PoolItem[]> {
  const rows = (await sql`
    SELECT external_id, title, topic, weight, times_used, last_used_at FROM exam_pool;
  `) as {
    external_id: number;
    title: string;
    topic: string;
    weight: number;
    times_used: number;
    last_used_at: unknown;
  }[];
  return rows.map((r) => ({
    externalId: r.external_id,
    title: r.title,
    topic: r.topic,
    weight: r.weight,
    timesUsed: r.times_used,
    lastUsedMs: toMs(r.last_used_at),
  }));
}

// Fetch an exam + ordered items. Solution links are withheld while the exam is
// active (anti-peek); revealed once submitted.
export async function readExam(id: string): Promise<Exam | null> {
  const examRows = (await sql`
    SELECT id, created_at, size, status, seed, kind, topics FROM exams WHERE id = ${id};
  `) as {
    id: string;
    created_at: unknown;
    size: number;
    status: ExamStatus;
    seed: string;
    kind: string;
    topics: string[] | null;
  }[];
  if (examRows.length === 0) return null;
  const e = examRows[0];
  const active = e.status === "active";

  const itemRows = (await sql`
    SELECT ei.id AS item_id, ei.position, ei.solved, ei.solved_at,
           p.external_id, p.title, p.topic, p.difficulty, p.youtube, p.article, p.starred
    FROM exam_items ei
    JOIN exam_pool p ON p.external_id = ei.external_id
    WHERE ei.exam_id = ${id}
    ORDER BY ei.position ASC;
  `) as {
    item_id: number;
    position: number;
    solved: boolean;
    solved_at: unknown;
    external_id: number;
    title: string;
    topic: string;
    difficulty: string;
    youtube: string | null;
    article: string | null;
    starred: boolean;
  }[];

  const items: ExamItem[] = itemRows.map((r) => ({
    itemId: r.item_id,
    position: r.position,
    solved: r.solved,
    solvedAt: toIso(r.solved_at),
    externalId: r.external_id,
    title: r.title,
    topic: r.topic,
    difficulty: r.difficulty,
    starred: r.starred,
    // The walkthrough video is a spoiler — hide it until submit. The problem
    // page itself stays available so you can actually open and solve it during
    // the exam.
    youtube: active ? null : r.youtube,
    article: r.article,
  }));

  const score = items.reduce(
    (s, it) => s + (it.solved ? pointsFor(it.difficulty) : 0),
    0
  );
  const maxScore = items.reduce((s, it) => s + pointsFor(it.difficulty), 0);

  return {
    id: e.id,
    createdAt: toIso(e.created_at) ?? new Date().toISOString(),
    size: e.size,
    status: e.status,
    seed: e.seed,
    kind: e.kind === "weekly" ? "weekly" : "standard",
    topics: e.topics ?? [],
    score,
    maxScore,
    items,
  };
}
