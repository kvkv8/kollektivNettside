import "server-only";
import postgres from "postgres";
import { env } from "./env";

function connect() {
  return postgres(env().DATABASE_URL, {
    // Session timezone, so current_date and now()::date are Norwegian dates (Neon defaults to UTC).
    connection: { TimeZone: "Europe/Oslo" },
    types: {
      // Keep date and time as plain strings ("2026-09-30", "19:00:00") instead of JS Dates.
      // They are local house time, not instants (D13), and a Date would drag a timezone in.
      date: { to: 1082, from: [1082], serialize: (x: string) => x, parse: (x: string) => x },
      time: { to: 1083, from: [1083], serialize: (x: string) => x, parse: (x: string) => x },
    },
  });
}

// postgres.js connects lazily, on the first query. Reuse one pool across hot reloads in dev.
const globalForDb = globalThis as unknown as { sql?: ReturnType<typeof connect> };

export const sql = globalForDb.sql ?? connect();
export type Transaction = postgres.TransactionSql<{ date: string; time: string }>;
if (process.env.NODE_ENV !== "production") globalForDb.sql = sql;

/** True if the DB rejected a write because of a CHECK constraint (the final authority on input). */
export function isCheckViolation(error: unknown): boolean {
  return error instanceof postgres.PostgresError && error.code === "23514";
}
