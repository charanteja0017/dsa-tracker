import { sql } from "@/lib/db";
import { ensureExamReady, FRESH_DAYS } from "@/lib/examRepo";
import { requireAuth } from "@/lib/auth";
import type { ExamListResponse, ExamSummary } from "@/lib/examTypes";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// List past exams (newest first) with their solved counts, plus pool stats so
// the start screen can show how many "fresh" (not recently used) problems remain.
export async function GET(req: Request) {
  const denied = requireAuth(req);
  if (denied) return denied;
  try {
    await ensureExamReady();

    const exams = (await sql`
      SELECT e.id, e.created_at, e.size, e.status, e.kind,
             (SELECT COUNT(*) FROM exam_items i
              WHERE i.exam_id = e.id AND i.solved)::int AS solved
      FROM exams e
      ORDER BY e.created_at DESC
      LIMIT 50;
    `) as {
      id: string;
      created_at: unknown;
      size: number;
      status: ExamSummary["status"];
      kind: string;
      solved: number;
    }[];

    const [{ total }] = (await sql`
      SELECT COUNT(*)::int AS total FROM exam_pool;
    `) as { total: number }[];
    const [{ fresh }] = (await sql`
      SELECT COUNT(*)::int AS fresh FROM exam_pool
      WHERE last_used_at IS NULL
         OR last_used_at < now() - (${FRESH_DAYS} || ' days')::interval;
    `) as { fresh: number }[];

    const body: ExamListResponse = {
      exams: exams.map((e) => ({
        id: e.id,
        createdAt: new Date(e.created_at as string).toISOString(),
        size: e.size,
        status: e.status,
        kind: e.kind === "weekly" ? "weekly" : "standard",
        solved: e.solved,
      })),
      poolTotal: total,
      poolFresh: fresh,
    };
    return NextResponse.json(body);
  } catch (e) {
    const message = e instanceof Error ? e.message : "unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
