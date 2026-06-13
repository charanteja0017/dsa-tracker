import { sql, initSchema } from "@/lib/db";
import { SEED_PROBLEMS } from "@/lib/seedData";
import { SEED_RECRUITERS } from "@/lib/recruiterData";
import { NextResponse } from "next/server";

// Visit /api/init once after deploy to create tables + load the problems & recruiters.
export async function GET() {
  try {
    await initSchema();
    for (const p of SEED_PROBLEMS) {
      await sql`
        INSERT INTO problems (title, companies, difficulty, pattern, week, link)
        VALUES (${p.title}, ${p.companies}, ${p.difficulty}, ${p.pattern}, ${p.week}, ${p.link})
        ON CONFLICT (title) DO NOTHING;
      `;
    }
    for (const r of SEED_RECRUITERS) {
      await sql`
        INSERT INTO recruiters (company, hires, type, dsa_bar, pattern, focus, sort_idx)
        VALUES (${r.company}, ${r.hires}, ${r.type}, ${r.dsa_bar}, ${r.pattern}, ${r.focus}, ${r.sort_idx})
        ON CONFLICT (company) DO NOTHING;
      `;
    }
    const [{ count }] = await sql`SELECT COUNT(*)::int AS count FROM problems;`;
    const [{ rcount }] = await sql`SELECT COUNT(*)::int AS rcount FROM recruiters;`;
    return NextResponse.json({ ok: true, problems: count, recruiters: rcount });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
