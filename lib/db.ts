import { neon } from "@neondatabase/serverless";

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
// IST; override with APP_TZ (an IANA name like "America/New_York").
export const APP_TZ = process.env.APP_TZ || "Asia/Kolkata";

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
      done_at     TIMESTAMPTZ
    );
  `;
  // Migrate existing tables that predate the youtube column.
  await sql`ALTER TABLE problems ADD COLUMN IF NOT EXISTS youtube TEXT;`;
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
