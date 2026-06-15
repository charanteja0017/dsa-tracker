import { sql, initSchema } from "@/lib/db";
import { SEED_PROBLEMS } from "@/lib/seedData";
import { SEED_RECRUITERS } from "@/lib/recruiterData";
import { requireAuth } from "@/lib/auth";
import { NextResponse } from "next/server";

// Hits the database, so it must never be prerendered/executed at build time.
export const dynamic = "force-dynamic";

// Visit /api/init after deploy (and after editing the seed) to create tables
// and UPSERT the problems & recruiters. Re-running refreshes metadata
// (companies/difficulty/pattern/week/link) but NEVER touches done / done_at,
// so completion state survives re-seeds.
export async function GET(req: Request) {
  const denied = requireAuth(req);
  if (denied) return denied;

  try {
    await initSchema();

    for (const p of SEED_PROBLEMS) {
      await sql`
        INSERT INTO problems (title, companies, difficulty, pattern, week, link, youtube)
        VALUES (${p.title}, ${p.companies}, ${p.difficulty}, ${p.pattern}, ${p.week}, ${p.link}, ${p.youtube})
        ON CONFLICT (title) DO UPDATE SET
          companies  = EXCLUDED.companies,
          difficulty = EXCLUDED.difficulty,
          pattern    = EXCLUDED.pattern,
          week       = EXCLUDED.week,
          link       = EXCLUDED.link,
          youtube    = EXCLUDED.youtube;
      `;
    }

    // Reconcile: drop problems no longer in the seed so COUNT(problems) always
    // equals the seed size (the source of truth). Rows that remain keep their
    // done / done_at.
    const titles = SEED_PROBLEMS.map((p) => p.title);
    await sql`DELETE FROM problems WHERE NOT (title = ANY(${titles}));`;

    for (const r of SEED_RECRUITERS) {
      await sql`
        INSERT INTO recruiters (company, hires, type, dsa_bar, pattern, focus, sort_idx)
        VALUES (${r.company}, ${r.hires}, ${r.type}, ${r.dsa_bar}, ${r.pattern}, ${r.focus}, ${r.sort_idx})
        ON CONFLICT (company) DO UPDATE SET
          hires    = EXCLUDED.hires,
          type     = EXCLUDED.type,
          dsa_bar  = EXCLUDED.dsa_bar,
          pattern  = EXCLUDED.pattern,
          focus    = EXCLUDED.focus,
          sort_idx = EXCLUDED.sort_idx;
      `;
    }

    const [{ count }] = await sql`SELECT COUNT(*)::int AS count FROM problems;`;
    const [{ rcount }] = await sql`SELECT COUNT(*)::int AS rcount FROM recruiters;`;
    return NextResponse.json({ ok: true, problems: count, recruiters: rcount });
  } catch (e) {
    const message = e instanceof Error ? e.message : "unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
