import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { sql } from "./db";
import { env } from "./env";

export const SESSION_COOKIE = "session";
export const SESSION_MAX_AGE_SECONDS = 365 * 24 * 60 * 60;

type SessionPayload = {
  /** password_version at login. A password change bumps it, invalidating this cookie. */
  v: number;
  /** Expiry, unix seconds. */
  exp: number;
};

function hmac(data: string) {
  return createHmac("sha256", env().SESSION_SECRET).update(data).digest("base64url");
}

/** `base64url(json).base64url(hmac)` */
export function signSession(passwordVersion: number): string {
  const payload: SessionPayload = {
    v: passwordVersion,
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS,
  };
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${data}.${hmac(data)}`;
}

/** Checks signature and expiry only. Returns the payload, or null. */
function verifySignature(cookie: string): SessionPayload | null {
  const [data, signature, ...rest] = cookie.split(".");
  if (!data || !signature || rest.length > 0) return null;

  const expected = Buffer.from(hmac(data));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;

  try {
    const payload = JSON.parse(Buffer.from(data, "base64url").toString()) as SessionPayload;
    if (typeof payload.v !== "number" || typeof payload.exp !== "number") return null;
    if (payload.exp * 1000 < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function getPasswordVersion(): Promise<number | null> {
  const [row] = await sql<{ password_version: number }[]>`
    SELECT password_version FROM site_password
  `;
  return row?.password_version ?? null;
}

/** Full check: signature, expiry, and that the password hasn't changed since login. */
export async function isValidSession(cookie: string | undefined): Promise<boolean> {
  if (!cookie) return false;
  const payload = verifySignature(cookie);
  if (!payload) return false;
  return payload.v === (await getPasswordVersion());
}
