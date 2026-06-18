import { readExam } from "@/lib/examRepo";
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
