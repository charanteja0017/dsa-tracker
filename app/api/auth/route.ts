import { NextResponse } from "next/server";
import {
  AUTH_COOKIE,
  SET_MAX_AGE,
  authCookieOptions,
  isAuthed,
  isConfigured,
  token,
  verifyPassword,
} from "@/lib/auth";

export const dynamic = "force-dynamic";

// Current lock status (drives the header lock control).
export async function GET(req: Request) {
  return NextResponse.json({ authed: isAuthed(req), configured: isConfigured() });
}

// Unlock: verify the password, set the signed cookie.
export async function POST(req: Request) {
  if (!isConfigured()) {
    return NextResponse.json(
      { ok: false, error: "Editing is not configured (EDIT_PASSWORD unset)." },
      { status: 503 }
    );
  }

  let password: unknown;
  try {
    ({ password } = await req.json());
  } catch {
    password = undefined;
  }

  if (!verifyPassword(password)) {
    return NextResponse.json(
      { ok: false, error: "Incorrect password." },
      { status: 401 }
    );
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(AUTH_COOKIE, token() as string, authCookieOptions(SET_MAX_AGE));
  return res;
}

// Lock: clear the cookie.
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(AUTH_COOKIE, "", authCookieOptions(0));
  return res;
}
