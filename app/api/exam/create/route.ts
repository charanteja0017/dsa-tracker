import { sql } from "@/lib/db";
import {
  ensureExamReady,
  genExamId,
  poolForSampling,
  readExam,
} from "@/lib/examRepo";
import { revalidateTag } from "next/cache";
import { buildExam } from "@/lib/examSampling";
import { EXAM_TOPICS } from "@/lib/examSeedData";
import { TAG_EXAM } from "@/lib/cache";
import {
  completedPatterns,
  coveredTopics,
  openTopics,
  problemUnlocked,
} from "@/lib/topicMap";
import { requireAuth } from "@/lib/auth";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const MIN_SIZE = 1;
const MAX_SIZE = 50;

// Create a new exam (or replay an existing one).
// Body: { size?: number, examId?: string, kind?: "standard" | "weekly" }
//  - examId of an EXISTING exam → returns it unchanged (deterministic replay).
//  - kind: "weekly" → restrict the candidate pool to problems whose topic is
//    UNLOCKED by the study plan (topic + its prerequisites all completed).
//  - otherwise generate a fresh standard exam from the whole pool.
// Selected problems get times_used++ / last_used_at = now() (the cooldown signal).
export async function POST(req: Request) {
  const denied = requireAuth(req);
  if (denied) return denied;
  try {
    await ensureExamReady();

    const body = (await req.json().catch(() => ({}))) as {
      size?: number;
      examId?: string;
      kind?: "standard" | "weekly";
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
    const weekly = body.kind === "weekly";

    // Candidate pool. For a weekly exam, keep only problems whose A2Z topic is
    // unlocked by the completed study-plan patterns (+ any override topics).
    let pool = await poolForSampling();
    let unlocked: string[] = [];
    if (weekly) {
      const rows = (await sql`
        SELECT pattern, done FROM problems;
      `) as { pattern: string; done: boolean }[];
      const completed = completedPatterns(rows);
      const covered = coveredTopics(completed);
      const open = openTopics(completed);
      unlocked = [...open];
      if (open.size === 0) {
        return NextResponse.json(
          {
            ok: false,
            error: "No topics unlocked yet — finish a topic in the study plan first.",
          },
          { status: 400 }
        );
      }
      pool = pool.filter((p) => problemUnlocked(p.title, p.topic, covered, open));
      if (pool.length === 0) {
        return NextResponse.json(
          { ok: false, error: "No fresh questions in your unlocked topics." },
          { status: 400 }
        );
      }
    }

    // Allocate a unique id (this string seeds the PRNG).
    let id = body.examId ?? genExamId();
    for (let tries = 0; tries < 8; tries++) {
      const clash = (await sql`
        SELECT 1 FROM exams WHERE id = ${id} LIMIT 1;
      `) as unknown[];
      if (clash.length === 0) break;
      id = genExamId();
    }

    const nowMs = Date.now();
    const ids = buildExam(pool, size, id, nowMs, EXAM_TOPICS);
    if (ids.length === 0) {
      return NextResponse.json(
        { ok: false, error: "exam pool is empty — run /api/exam/init" },
        { status: 400 }
      );
    }

    await sql`
      INSERT INTO exams (id, size, status, seed, kind, topics)
      VALUES (${id}, ${ids.length}, 'active', ${id},
              ${weekly ? "weekly" : "standard"}, ${unlocked});
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

    revalidateTag(TAG_EXAM);
    const exam = await readExam(id);
    return NextResponse.json(exam, { status: 201 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
