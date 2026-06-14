import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const rows = await sql`
    SELECT id, title, companies, difficulty, pattern, week, link, youtube, done
    FROM problems
    ORDER BY week ASC, companies DESC, title ASC;
  `;
  return NextResponse.json(rows);
}

// Toggle a problem's done state. Body: { id: number, done: boolean }
export async function PATCH(req: Request) {
  const { id, done } = await req.json();
  await sql`
    UPDATE problems
    SET done = ${done}, done_at = ${done ? new Date().toISOString() : null}
    WHERE id = ${id};
  `;
  return NextResponse.json({ ok: true });
}
