import { unstable_cache } from "next/cache";
import { sql } from "@/lib/db";
import { ensureExamReady } from "@/lib/examRepo";
import { TAG_EXAM, REVALIDATE_EXAM } from "@/lib/cache";
import { requireAuth } from "@/lib/auth";
import type { ExamBankItem } from "@/lib/examTypes";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// The full A2Z question bank with each question's exam status (how many exams
// it's appeared in, whether it's ever been solved, and whether it's starred).
const getBank = unstable_cache(
  async (): Promise<ExamBankItem[]> => {
    const rows = (await sql`
      SELECT p.external_id, p.title, p.topic, p.difficulty, p.most_asked,
             p.youtube, p.article, p.times_used, p.starred,
             EXISTS (
               SELECT 1 FROM exam_items i
               WHERE i.external_id = p.external_id AND i.solved
             ) AS solved
      FROM exam_pool p
      ORDER BY p.external_id ASC;
    `) as {
      external_id: number;
      title: string;
      topic: string;
      difficulty: string;
      most_asked: boolean;
      youtube: string;
      article: string;
      times_used: number;
      starred: boolean;
      solved: boolean;
    }[];
    return rows.map((r) => ({
      externalId: r.external_id,
      title: r.title,
      topic: r.topic,
      difficulty: r.difficulty,
      mostAsked: r.most_asked,
      youtube: r.youtube,
      article: r.article,
      timesUsed: r.times_used,
      solved: r.solved,
      starred: r.starred,
    }));
  },
  ["exam-bank"],
  { tags: [TAG_EXAM], revalidate: REVALIDATE_EXAM }
);

export async function GET(req: Request) {
  const denied = requireAuth(req);
  if (denied) return denied;
  await ensureExamReady();
  return NextResponse.json(await getBank());
}
