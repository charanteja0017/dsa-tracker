import { readExam } from "@/lib/examRepo";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Fetch an exam + its ordered items + solved state. Solution links are withheld
// while the exam is active (revealed after submit). Deterministic by id.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const exam = await readExam(id);
  if (!exam) {
    return NextResponse.json({ ok: false, error: "not found" }, { status: 404 });
  }
  return NextResponse.json(exam);
}
