import { sql, initExamSchema } from "@/lib/db";
import { seedExamPool } from "@/lib/examRepo";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// One-time (idempotent) setup for exam mode: create the exam_* tables and UPSERT
// the A2Z bank into exam_pool. Upsert-only on static fields — never touches the
// study-plan tables, and never resets times_used / last_used_at / solved state.
export async function GET() {
  try {
    await initExamSchema();
    await seedExamPool();
    const [{ count }] = (await sql`
      SELECT COUNT(*)::int AS count FROM exam_pool;
    `) as { count: number }[];
    return NextResponse.json({ ok: true, pool: count });
  } catch (e) {
    const message = e instanceof Error ? e.message : "unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
