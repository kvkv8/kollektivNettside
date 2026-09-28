// Sets (or changes) the shared site password. Every existing session is logged out.
//
//   npm run set-password                               # uses DATABASE_URL from .env
//   DATABASE_URL=postgres://…neon… npm run set-password # production
import { hash } from "@node-rs/argon2";
import postgres from "postgres";
import { stdin, stdout } from "node:process";

/** Reads a line from the terminal without echoing it. */
function promptHidden(question: string): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!stdin.isTTY) {
      reject(new Error("Run this in an interactive terminal."));
      return;
    }
    stdout.write(question);
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding("utf8");

    let input = "";
    const onData = (chunk: string) => {
      for (const char of chunk) {
        if (char === "\r" || char === "\n") {
          stdin.setRawMode(false);
          stdin.pause();
          stdin.off("data", onData);
          stdout.write("\n");
          resolve(input);
          return;
        } else if (char === "\u0003") {
          // Ctrl+C
          stdout.write("\n");
          process.exit(130);
        } else if (char === "\u007f" || char === "\b") {
          input = input.slice(0, -1);
        } else {
          input += char;
        }
      }
    };
    stdin.on("data", onData);
  });
}

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set.");

  const password = await promptHidden("Nytt passord: ");
  if (password.length < 8) throw new Error("Passordet må være minst 8 tegn.");
  if ((await promptHidden("Gjenta passord: ")) !== password) {
    throw new Error("Passordene er ikke like.");
  }

  const passwordHash = await hash(password); // argon2id with the library's defaults

  const sql = postgres(url, { max: 1 });
  try {
    // Upsert the single row (D8). On change, bump the version so every cookie becomes invalid.
    const [row] = await sql<{ password_version: number }[]>`
      INSERT INTO site_password (password_hash) VALUES (${passwordHash})
      ON CONFLICT (id) DO UPDATE
        SET password_hash    = EXCLUDED.password_hash,
            password_version = site_password.password_version + 1,
            updated_at       = now()
      RETURNING password_version
    `;
    console.log(`Passord satt (versjon ${row.password_version}). Alle enheter er logget ut.`);
  } finally {
    await sql.end();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
