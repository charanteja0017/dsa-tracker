import { unstable_cache, revalidateTag } from "next/cache";
import { sql, ensureColumns } from "@/lib/db";
import { TAG_PROBLEMS, REVALIDATE_PROBLEMS } from "@/lib/cache";
import { requireAuth } from "@/lib/auth";
import { NextResponse } from "next/server";

const getProblems = unstable_cache(
  async () =>
    sql`
      SELECT id, title, companies, difficulty, pattern, week, link, youtube, done, starred
      FROM problems
      ORDER BY week ASC, companies DESC, title ASC;
    `,
  ["problems-list"],
  { tags: [TAG_PROBLEMS], revalidate: REVALIDATE_PROBLEMS }
);

export async function GET() {
  await ensureColumns();
  return NextResponse.json(await getProblems());
}

// Update a problem. Body: { id, done?, starred? } — `done` toggles completion
// (and stamps done_at); `starred` flags it for revision. Either or both.
export async function PATCH(req: Request) {
  const denied = requireAuth(req);
  if (denied) return denied;

  await ensureColumns();
  const { id, done, starred } = await req.json();

  if (typeof done === "boolean") {
    await sql`
      UPDATE problems
      SET done = ${done}, done_at = ${done ? new Date().toISOString() : null}
      WHERE id = ${id};
    `;
  }
  if (typeof starred === "boolean") {
    await sql`UPDATE problems SET starred = ${starred} WHERE id = ${id};`;
  }
  revalidateTag(TAG_PROBLEMS); // stats / analytics / list recompute on next read
  return NextResponse.json({ ok: true });
}
