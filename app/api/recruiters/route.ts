import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const rows = await sql`
    SELECT company, hires, type, dsa_bar, pattern, focus
    FROM recruiters
    ORDER BY sort_idx ASC;
  `;
  return NextResponse.json(rows);
}
