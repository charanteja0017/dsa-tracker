import crypto from "node:crypto";
import { NextResponse } from "next/server";

// Lightweight shared-password gate for the edit actions. No DB / session store:
// the cookie holds a deterministic HMAC of a constant, keyed by EDIT_PASSWORD,
// so it can be verified statelessly. Fails closed when EDIT_PASSWORD is unset.

export const AUTH_COOKIE = "edit_auth";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function secret(): string | null {
  return process.env.EDIT_PASSWORD || null;
}

export function isConfigured(): boolean {
  return secret() !== null;
}

// The cookie value proving a successful unlock.
export function token(): string | null {
  const key = secret();
  if (!key) return null;
  return crypto.createHmac("sha256", key).update("edit-ok").digest("hex");
}

function timingSafeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}

export function verifyPassword(input: unknown): boolean {
  const key = secret();
  if (!key || typeof input !== "string") return false;
  return timingSafeEqual(input, key);
}

export function isAuthed(req: Request): boolean {
  const expected = token();
  if (!expected) return false;
  const cookie = readCookie(req, AUTH_COOKIE);
  return cookie !== null && timingSafeEqual(cookie, expected);
}

// Route guard: returns a 401 response when not authed, otherwise null.
export function requireAuth(req: Request): NextResponse | null {
  if (isAuthed(req)) return null;
  const message = isConfigured()
    ? "Unlock required."
    : "Editing is not configured (EDIT_PASSWORD unset).";
  return NextResponse.json({ ok: false, error: message }, { status: 401 });
}

export function authCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

export const SET_MAX_AGE = COOKIE_MAX_AGE;

// Minimal cookie reader (avoids pulling request-scoped helpers into shared code).
function readCookie(req: Request, name: string): string | null {
  const header = req.headers.get("cookie");
  if (!header) return null;
  for (const part of header.split(";")) {
    const [k, ...rest] = part.trim().split("=");
    if (k === name) return decodeURIComponent(rest.join("="));
  }
  return null;
}
