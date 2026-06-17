import { sql, initExamSchema } from "./db";
import { EXAM_PROBLEMS } from "./examSeedData";
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

// Upsert the A2Z bank into exam_pool. ON CONFLICT updates only the STATIC fields
// — never times_used / last_used_at (the cooldown signal). Safe to re-run.
export async function seedExamPool(): Promise<void> {
  for (const p of EXAM_PROBLEMS) {
    await sql`
      INSERT INTO exam_pool
        (external_id, title, topic, difficulty, most_asked, weight, youtube, article)
      VALUES
        (${p.externalId}, ${p.title}, ${p.topic}, ${p.difficulty}, ${p.mostAsked}, ${p.weight}, ${p.youtube}, ${p.article})
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
}

// Make sure the exam tables exist and the pool is populated (auto-seed on first
// use so exam mode works without a manual /api/exam/init step).
export async function ensureExamReady(): Promise<void> {
  await initExamSchema();
  const [{ count }] = (await sql`
    SELECT COUNT(*)::int AS count FROM exam_pool;
  `) as { count: number }[];
  if (count === 0) await seedExamPool();
}

export async function poolForSampling(): Promise<PoolItem[]> {
  const rows = (await sql`
    SELECT external_id, topic, weight, times_used, last_used_at FROM exam_pool;
  `) as {
    external_id: number;
    topic: string;
    weight: number;
    times_used: number;
    last_used_at: unknown;
  }[];
  return rows.map((r) => ({
    externalId: r.external_id,
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
    SELECT id, created_at, size, status, seed FROM exams WHERE id = ${id};
  `) as {
    id: string;
    created_at: unknown;
    size: number;
    status: ExamStatus;
    seed: string;
  }[];
  if (examRows.length === 0) return null;
  const e = examRows[0];
  const active = e.status === "active";

  const itemRows = (await sql`
    SELECT ei.id AS item_id, ei.position, ei.solved, ei.solved_at,
           p.external_id, p.title, p.topic, p.difficulty, p.youtube, p.article
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
    youtube: active ? null : r.youtube,
    article: active ? null : r.article,
  }));

  return {
    id: e.id,
    createdAt: toIso(e.created_at) ?? new Date().toISOString(),
    size: e.size,
    status: e.status,
    seed: e.seed,
    items,
  };
}
