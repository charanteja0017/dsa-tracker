import { sql, initExamSchema } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// EXAM-ONLY reset. Clears generated exams + items, and (optionally) the cooldown
// counters on the pool. Requires unlock AND an explicit { confirm: true }.
// It only ever references exam_* tables — the study-plan problems/done state is
// never touched here.
export async function POST(req: Request) {
  const denied = requireAuth(req);
  if (denied) return denied;

  const body = (await req.json().catch(() => ({}))) as {
    confirm?: boolean;
    resetCooldown?: boolean;
  };
  if (body.confirm !== true) {
    return NextResponse.json(
      { ok: false, error: "pass { confirm: true } to reset exams" },
      { status: 400 }
    );
  }

  await initExamSchema();
  // CASCADE on exam_items handles children; clear exams explicitly too.
  await sql`DELETE FROM exam_items;`;
  await sql`DELETE FROM exams;`;
  if (body.resetCooldown === true) {
    await sql`UPDATE exam_pool SET times_used = 0, last_used_at = NULL;`;
  }
  return NextResponse.json({ ok: true, resetCooldown: body.resetCooldown === true });
}
