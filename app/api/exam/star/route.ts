import { revalidateTag } from "next/cache";
import { sql } from "@/lib/db";
import { TAG_EXAM } from "@/lib/cache";
import { requireAuth } from "@/lib/auth";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Favorite / unfavorite a question in the bank. Body: { externalId, starred }.
export async function PATCH(req: Request) {
  const denied = requireAuth(req);
  if (denied) return denied;

  const { externalId, starred } = (await req.json()) as {
    externalId: number;
    starred: boolean;
  };
  if (typeof externalId !== "number" || typeof starred !== "boolean") {
    return NextResponse.json(
      { ok: false, error: "externalId and starred required" },
      { status: 400 }
    );
  }
  await sql`UPDATE exam_pool SET starred = ${starred} WHERE external_id = ${externalId};`;
  revalidateTag(TAG_EXAM);
  return NextResponse.json({ ok: true });
}
