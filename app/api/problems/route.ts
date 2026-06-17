import { sql, ensureColumns } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  await ensureColumns();
  const rows = await sql`
    SELECT id, title, companies, difficulty, pattern, week, link, youtube, done, starred
    FROM problems
    ORDER BY week ASC, companies DESC, title ASC;
  `;
  return NextResponse.json(rows);
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
  return NextResponse.json({ ok: true });
}
