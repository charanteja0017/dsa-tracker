import { neon } from "@neondatabase/serverless";
import { APP_TZ as DEFAULT_TZ } from "./tz";

// Single shared SQL client. On Vercel, DATABASE_URL is injected by the
// Neon integration. Locally, put it in .env (see .env.example).
export const sql = neon(process.env.DATABASE_URL!);

// Plan constants. The problem-count target is dynamic (COUNT(problems)), so
// there is no hardcoded total here — only the roadmap dates.
export const PLAN = {
  startDate: "2026-06-22",
  phase1Date: "2026-12-01",
};

// Timezone that defines "a day" for the streak + activity heatmap. Defaults to
// IST (shared in lib/tz); override with the APP_TZ env (an IANA name).
export const APP_TZ = process.env.APP_TZ || DEFAULT_TZ;

// Lightweight, idempotent column migrations that run on demand (memoized per
// serverless instance) so feature columns appear WITHOUT re-running /api/init —
// existing rows keep their done/done_at. ADD COLUMN IF NOT EXISTS is a no-op
// once the column is there.
let columnsReady: Promise<unknown> | null = null;
export function ensureColumns(): Promise<unknown> {
  columnsReady ??= sql`
    ALTER TABLE problems ADD COLUMN IF NOT EXISTS starred BOOLEAN NOT NULL DEFAULT FALSE;
  `;
  return columnsReady;
}

// Creates tables if they don't exist. Safe to call repeatedly. Completion state
// (done / done_at) is the single input now; there is no daily_log.
export async function initSchema() {
  await sql`
    CREATE TABLE IF NOT EXISTS problems (
      id          SERIAL PRIMARY KEY,
      title       TEXT NOT NULL UNIQUE,
      companies   INT  NOT NULL DEFAULT 0,
      difficulty  TEXT NOT NULL,
      pattern     TEXT NOT NULL,
      week        INT  NOT NULL,
      link        TEXT,
      youtube     TEXT,
      done        BOOLEAN NOT NULL DEFAULT FALSE,
      done_at     TIMESTAMPTZ,
      starred     BOOLEAN NOT NULL DEFAULT FALSE
    );
  `;
  // Migrate existing tables that predate later columns.
  await sql`ALTER TABLE problems ADD COLUMN IF NOT EXISTS youtube TEXT;`;
  await sql`ALTER TABLE problems ADD COLUMN IF NOT EXISTS starred BOOLEAN NOT NULL DEFAULT FALSE;`;
  await sql`
    CREATE TABLE IF NOT EXISTS recruiters (
      id        SERIAL PRIMARY KEY,
      company   TEXT NOT NULL UNIQUE,
      hires     INT  NOT NULL DEFAULT 0,
      type      TEXT NOT NULL,
      dsa_bar   TEXT,
      pattern   TEXT,
      focus     TEXT,
      sort_idx  INT  NOT NULL DEFAULT 0
    );
  `;
}

// EXAM MODE — completely separate tables from the study plan. Creating or
// (re)seeding these NEVER touches `problems`/`done`/`done_at`. exam_pool holds
// the A2Z question bank + cooldown bookkeeping (times_used/last_used_at); exams
// and exam_items hold generated, reproducible exams and their solved state.
export async function initExamSchema() {
  await sql`
    CREATE TABLE IF NOT EXISTS exam_pool (
      external_id  INT PRIMARY KEY,
      title        TEXT NOT NULL,
      topic        TEXT NOT NULL,
      difficulty   TEXT NOT NULL,
      most_asked   BOOLEAN NOT NULL DEFAULT FALSE,
      weight       INT NOT NULL DEFAULT 1,
      youtube      TEXT,
      article      TEXT,
      times_used   INT NOT NULL DEFAULT 0,
      last_used_at TIMESTAMPTZ
    );
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS exams (
      id         TEXT PRIMARY KEY,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      size       INT NOT NULL,
      status     TEXT NOT NULL DEFAULT 'active',
      seed       TEXT NOT NULL,
      kind       TEXT NOT NULL DEFAULT 'standard',
      topics     TEXT[] NOT NULL DEFAULT '{}'
    );
  `;
  // Migrate exam tables that predate the weekly-exam columns.
  await sql`ALTER TABLE exams ADD COLUMN IF NOT EXISTS kind TEXT NOT NULL DEFAULT 'standard';`;
  await sql`ALTER TABLE exams ADD COLUMN IF NOT EXISTS topics TEXT[] NOT NULL DEFAULT '{}';`;
  await sql`
    CREATE TABLE IF NOT EXISTS exam_items (
      id          SERIAL PRIMARY KEY,
      exam_id     TEXT NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
      external_id INT  NOT NULL REFERENCES exam_pool(external_id),
      position    INT  NOT NULL,
      solved      BOOLEAN NOT NULL DEFAULT FALSE,
      solved_at   TIMESTAMPTZ
    );
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS exam_items_exam_id_idx ON exam_items (exam_id);
  `;
}
