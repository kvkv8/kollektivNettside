"use server";

import { verify } from "@node-rs/argon2";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { sql } from "@/lib/db";
import { SESSION_COOKIE, SESSION_MAX_AGE_SECONDS, signSession } from "@/lib/session";

export type LoginState = { error?: string };

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const password = formData.get("password");
  if (typeof password !== "string" || password === "") return { error: "Skriv inn passordet." };

  const [row] = await sql<{ password_hash: string; password_version: number }[]>`
    SELECT password_hash, password_version FROM site_password
  `;
  if (!row) return { error: "Passordet er ikke satt ennå." };
  if (!(await verify(row.password_hash, password))) return { error: "Feil passord." };

  (await cookies()).set(SESSION_COOKIE, signSession(row.password_version), {
    httpOnly: true,
    // Browsers treat http://localhost as secure, but not a LAN IP (e.g. testing on a phone).
    secure: process.env.NODE_ENV !== "development",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE_SECONDS,
    path: "/",
  });
  redirect("/");
}
