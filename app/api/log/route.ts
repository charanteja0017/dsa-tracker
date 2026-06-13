import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const rows = await sql`
    SELECT id, log_date, solved, minutes, confidence, topic, notes
    FROM daily_log
    ORDER BY log_date DESC
    LIMIT 60;
  `;
  return NextResponse.json(rows);
}

// Upsert a day. Body: { date, solved, minutes, confidence, topic, notes }
export async function POST(req: Request) {
  const { date, solved, minutes, confidence, topic, notes } = await req.json();
  await sql`
    INSERT INTO daily_log (log_date, solved, minutes, confidence, topic, notes)
    VALUES (${date}, ${solved ?? 0}, ${minutes ?? 0}, ${confidence ?? null}, ${topic ?? null}, ${notes ?? null})
    ON CONFLICT (log_date) DO UPDATE SET
      solved = EXCLUDED.solved,
      minutes = EXCLUDED.minutes,
      confidence = EXCLUDED.confidence,
      topic = EXCLUDED.topic,
      notes = EXCLUDED.notes;
  `;
  return NextResponse.json({ ok: true });
}
