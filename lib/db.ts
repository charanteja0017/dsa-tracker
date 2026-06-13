import { neon } from "@neondatabase/serverless";

// Single shared SQL client. On Vercel, DATABASE_URL is injected by the
// Neon integration. Locally, put it in .env (see .env.example).
export const sql = neon(process.env.DATABASE_URL!);

// Plan constants derived from your 23-week roadmap.
export const PLAN = {
  startDate: "2026-06-22",
  phase1Date: "2026-12-01",
  targetProblems: 271,
};

// Creates tables if they don't exist. Safe to call repeatedly.
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
      done        BOOLEAN NOT NULL DEFAULT FALSE,
      done_at     TIMESTAMPTZ
    );
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS daily_log (
      id          SERIAL PRIMARY KEY,
      log_date    DATE NOT NULL UNIQUE,
      solved      INT  NOT NULL DEFAULT 0,
      minutes     INT  NOT NULL DEFAULT 0,
      confidence  INT,
      topic       TEXT,
      notes       TEXT
    );
  `;
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
