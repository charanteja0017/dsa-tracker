import { sql } from "@/lib/db";
import { readExam } from "@/lib/examRepo";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Freeze an exam: flip status to 'submitted'. After this the solution links are
// revealed (readExam includes them) and items can no longer be toggled.
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await sql`UPDATE exams SET status = 'submitted' WHERE id = ${id};`;
  const exam = await readExam(id);
  if (!exam) {
    return NextResponse.json({ ok: false, error: "not found" }, { status: 404 });
  }
  return NextResponse.json(exam);
}
