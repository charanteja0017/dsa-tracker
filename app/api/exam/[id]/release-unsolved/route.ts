import { revalidateTag } from "next/cache";
import { sql } from "@/lib/db";
import { recomputeCooldown } from "@/lib/examRepo";
import { TAG_EXAM } from "@/lib/cache";
import { requireAuth } from "@/lib/auth";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Return this exam's UNSOLVED problems to the pool (keep the exam record). Their
// cooldown is recomputed ignoring THIS exam's usage, so the ones you couldn't
// solve become eligible to come back around; solved problems stay cooled down.
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = requireAuth(req);
  if (denied) return denied;
  const { id } = await params;

  const rows = (await sql`
    SELECT external_id FROM exam_items WHERE exam_id = ${id} AND NOT solved;
  `) as { external_id: number }[];
  const ids = rows.map((r) => r.external_id);

  await recomputeCooldown(ids, id); // free them as if this exam hadn't used them

  revalidateTag(TAG_EXAM);
  return NextResponse.json({ ok: true, released: ids.length });
}
