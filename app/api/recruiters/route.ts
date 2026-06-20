import { unstable_cache } from "next/cache";
import { sql } from "@/lib/db";
import { TAG_RECRUITERS, REVALIDATE_RECRUITERS } from "@/lib/cache";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Recruiters only change on /api/init, so cache them and invalidate there.
const getRecruiters = unstable_cache(
  async () =>
    sql`
      SELECT company, hires, type, dsa_bar, pattern, focus
      FROM recruiters
      ORDER BY sort_idx ASC;
    `,
  ["recruiters"],
  { tags: [TAG_RECRUITERS], revalidate: REVALIDATE_RECRUITERS }
);

export async function GET() {
  return NextResponse.json(await getRecruiters());
}
