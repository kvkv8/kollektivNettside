import "server-only";
import { requireSession } from "./auth";
import { sql, type Transaction } from "./db";
import type { QuoteInput } from "./validation";

export type QuoteRow = {
  id: string;
  text: string;
  said_on: string | null;
  context: string | null;
  created_at: Date;
  speaker: string;
};

// Every read filters deleted_at IS NULL (D6).

export async function listQuotes(): Promise<QuoteRow[]> {
  await requireSession();
  // D10: order by when it was said, falling back to the Oslo date it was added.
  return sql<QuoteRow[]>`
    SELECT q.id, q.text, q.said_on, q.context, q.created_at, s.name AS speaker
    FROM quote q JOIN speaker s ON s.id = q.speaker_id
    WHERE q.deleted_at IS NULL
    ORDER BY COALESCE(q.said_on, (q.created_at AT TIME ZONE 'Europe/Oslo')::date) DESC,
             q.created_at DESC
  `;
}

export async function getRandomQuote(): Promise<QuoteRow | null> {
  await requireSession();
  // ORDER BY random() is a full scan, which is fine for small tables.
  const [row] = await sql<QuoteRow[]>`
    SELECT q.id, q.text, q.said_on, q.context, q.created_at, s.name AS speaker
    FROM quote q JOIN speaker s ON s.id = q.speaker_id
    WHERE q.deleted_at IS NULL
    ORDER BY random()
    LIMIT 1
  `;
  return row ?? null;
}

export async function getQuote(id: string): Promise<QuoteRow | null> {
  await requireSession();
  const [row] = await sql<QuoteRow[]>`
    SELECT q.id, q.text, q.said_on, q.context, q.created_at, s.name AS speaker
    FROM quote q JOIN speaker s ON s.id = q.speaker_id
    WHERE q.id = ${id} AND q.deleted_at IS NULL
  `;
  return row ?? null;
}

/** Speakers with at least one visible quote, most-quoted first. */
export async function listSpeakerNames(): Promise<string[]> {
  await requireSession();
  const rows = await sql<{ name: string }[]>`
    SELECT s.name
    FROM speaker s JOIN quote q ON q.speaker_id = s.id AND q.deleted_at IS NULL
    GROUP BY s.id
    ORDER BY count(*) DESC, s.name
  `;
  return rows.map((r) => r.name);
}

/**
 * Get-or-create a speaker by name, case-insensitively (D3, D4).
 * ON CONFLICT ... DO NOTHING returns no row on conflict, so a no-op DO UPDATE is used to
 * always get the id back.
 */
async function speakerId(tx: Transaction, name: string): Promise<string> {
  const [row] = await tx<{ id: string }[]>`
    INSERT INTO speaker (name) VALUES (${name})
    ON CONFLICT ((lower(name))) DO UPDATE SET name = speaker.name
    RETURNING id
  `;
  return row.id;
}

export async function createQuote(input: QuoteInput): Promise<void> {
  await requireSession();
  await sql.begin(async (tx) => {
    const speaker = await speakerId(tx, input.speaker);
    await tx`
      INSERT INTO quote (text, speaker_id, said_on, context)
      VALUES (${input.text}, ${speaker}, ${input.saidOn}, ${input.context})
    `;
  });
}

/** Returns false if the quote doesn't exist (or is deleted). */
export async function updateQuote(id: string, input: QuoteInput): Promise<boolean> {
  await requireSession();
  // A speaker left with no quotes stays in the table; autocomplete ignores them.
  return sql.begin(async (tx) => {
    const speaker = await speakerId(tx, input.speaker);
    const result = await tx`
      UPDATE quote
      SET text = ${input.text}, speaker_id = ${speaker}, said_on = ${input.saidOn},
          context = ${input.context}, updated_at = now()
      WHERE id = ${id} AND deleted_at IS NULL
    `;
    return result.count > 0;
  });
}

/** Soft delete. Restore by hand: UPDATE quote SET deleted_at = NULL WHERE id = …; */
export async function deleteQuote(id: string): Promise<void> {
  await requireSession();
  await sql`UPDATE quote SET deleted_at = now() WHERE id = ${id} AND deleted_at IS NULL`;
}
