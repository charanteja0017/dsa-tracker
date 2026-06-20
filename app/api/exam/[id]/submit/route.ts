import { revalidateTag } from "next/cache";
import { sql } from "@/lib/db";
import { readExam } from "@/lib/examRepo";
import { TAG_EXAM } from "@/lib/cache";
import { requireAuth } from "@/lib/auth";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Freeze an exam: flip status to 'submitted'. After this the walkthrough videos
// are revealed (readExam includes them) and items can no longer be toggled.
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = requireAuth(req);
  if (denied) return denied;
  const { id } = await params;
  await sql`UPDATE exams SET status = 'submitted' WHERE id = ${id};`;
  revalidateTag(TAG_EXAM);
  const exam = await readExam(id);
  if (!exam) {
    return NextResponse.json({ ok: false, error: "not found" }, { status: 404 });
  }
  return NextResponse.json(exam);
}
