import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Mark an exam item solved/unsolved. Body: { itemId, solved }. Only mutable
// while the parent exam is still active (submitted exams are frozen).
export async function PATCH(req: Request) {
  const { itemId, solved } = (await req.json()) as {
    itemId: number;
    solved: boolean;
  };
  if (typeof itemId !== "number" || typeof solved !== "boolean") {
    return NextResponse.json(
      { ok: false, error: "itemId and solved required" },
      { status: 400 }
    );
  }
  await sql`
    UPDATE exam_items
    SET solved = ${solved}, solved_at = ${solved ? new Date().toISOString() : null}
    WHERE id = ${itemId}
      AND exam_id IN (SELECT id FROM exams WHERE status = 'active');
  `;
  return NextResponse.json({ ok: true });
}
