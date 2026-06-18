import { sql } from "@/lib/db";
import {
  ensureExamReady,
  genExamId,
  poolForSampling,
  readExam,
} from "@/lib/examRepo";
import { buildExam } from "@/lib/examSampling";
import { EXAM_TOPICS } from "@/lib/examSeedData";
import { requireAuth } from "@/lib/auth";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const MIN_SIZE = 1;
const MAX_SIZE = 50;

// Create a new exam (or replay an existing one).
// Body: { size?: number, examId?: string }
//  - examId of an EXISTING exam → returns it unchanged (deterministic replay;
//    no re-roll, no extra cooldown).
//  - otherwise generate a fresh exam: a readable id is the RNG seed, so the
//    selection is reproducible from it given the pool snapshot. Selected
//    problems get times_used++ / last_used_at = now() (the cooldown signal).
export async function POST(req: Request) {
  const denied = requireAuth(req);
  if (denied) return denied;
  try {
    await ensureExamReady();

    const body = (await req.json().catch(() => ({}))) as {
      size?: number;
      examId?: string;
    };

    // Replay path: a known id just returns the stored exam.
    if (body.examId) {
      const existing = await readExam(body.examId);
      if (existing) return NextResponse.json(existing);
    }

    const size = Math.max(
      MIN_SIZE,
      Math.min(MAX_SIZE, Math.floor(body.size ?? 10))
    );

    // Allocate a unique id (this string seeds the PRNG).
    let id = body.examId ?? genExamId();
    for (let tries = 0; tries < 8; tries++) {
      const clash = (await sql`
        SELECT 1 FROM exams WHERE id = ${id} LIMIT 1;
      `) as unknown[];
      if (clash.length === 0) break;
      id = genExamId();
    }

    const pool = await poolForSampling();
    const nowMs = Date.now();
    const ids = buildExam(pool, size, id, nowMs, EXAM_TOPICS);
    if (ids.length === 0) {
      return NextResponse.json(
        { ok: false, error: "exam pool is empty — run /api/exam/init" },
        { status: 400 }
      );
    }

    await sql`
      INSERT INTO exams (id, size, status, seed)
      VALUES (${id}, ${ids.length}, 'active', ${id});
    `;
    for (let i = 0; i < ids.length; i++) {
      await sql`
        INSERT INTO exam_items (exam_id, external_id, position)
        VALUES (${id}, ${ids[i]}, ${i});
      `;
    }
    // Cooldown bookkeeping for the chosen problems.
    await sql`
      UPDATE exam_pool
      SET times_used = times_used + 1, last_used_at = now()
      WHERE external_id = ANY(${ids});
    `;

    const exam = await readExam(id);
    return NextResponse.json(exam, { status: 201 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
