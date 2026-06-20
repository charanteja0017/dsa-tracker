import { revalidateTag } from "next/cache";
import { sql, initExamSchema } from "@/lib/db";
import { seedExamPool } from "@/lib/examRepo";
import { TAG_EXAM } from "@/lib/cache";
import { requireAuth } from "@/lib/auth";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// One-time (idempotent) setup for exam mode: create the exam_* tables and UPSERT
// the A2Z bank into exam_pool. Upsert-only on static fields — never touches the
// study-plan tables, and never resets times_used / last_used_at / solved state.
// Locked: requires unlock (EDIT_PASSWORD), like the rest of exam mode.
export async function GET(req: Request) {
  const denied = requireAuth(req);
  if (denied) return denied;
  try {
    await initExamSchema();
    await seedExamPool();
    const [{ count }] = (await sql`
      SELECT COUNT(*)::int AS count FROM exam_pool;
    `) as { count: number }[];
    revalidateTag(TAG_EXAM);
    return NextResponse.json({ ok: true, pool: count });
  } catch (e) {
    const message = e instanceof Error ? e.message : "unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
