import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { isValidSession, SESSION_COOKIE } from "./session";

/**
 * Defence in depth (§6): proxy.ts already checks every request, but every data-loading
 * function and server action calls this too, so the app never relies on the proxy alone.
 * Cached per request, so several calls in one render cost one DB lookup.
 */
export const requireSession = cache(async (): Promise<void> => {
  const cookieStore = await cookies();
  if (!(await isValidSession(cookieStore.get(SESSION_COOKIE)?.value))) {
    redirect("/login");
  }
});
