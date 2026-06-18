import { sql } from "@/lib/db";
import { readExam, recomputeCooldown } from "@/lib/examRepo";
import { requireAuth } from "@/lib/auth";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Fetch an exam + its ordered items + solved state. The walkthrough video is
// withheld while the exam is active (revealed after submit). Deterministic by id.
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = requireAuth(req);
  if (denied) return denied;
  const { id } = await params;
  const exam = await readExam(id);
  if (!exam) {
    return NextResponse.json({ ok: false, error: "not found" }, { status: 404 });
  }
  return NextResponse.json(exam);
}

// Delete an exam and return ALL its problems to the pool (cooldown recomputed
// from remaining usage, so they're eligible to appear again).
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = requireAuth(req);
  if (denied) return denied;
  const { id } = await params;

  const rows = (await sql`
    SELECT external_id FROM exam_items WHERE exam_id = ${id};
  `) as { external_id: number }[];
  const ids = rows.map((r) => r.external_id);

  await sql`DELETE FROM exams WHERE id = ${id};`; // CASCADE removes its items
  await recomputeCooldown(ids); // exam is gone → count from whatever remains

  return NextResponse.json({ ok: true, returned: ids.length });
}
