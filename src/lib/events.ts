import "server-only";
import { requireSession } from "./auth";
import { sql } from "./db";
import type { EventInput } from "./validation";

export type EventRow = {
  id: string;
  title: string;
  event_date: string;
  start_time: string | null;
  description: string | null;
};

/** Events today and later, soonest first. current_date is Oslo time (session TimeZone). */
export async function listUpcomingEvents(limit?: number): Promise<EventRow[]> {
  await requireSession();
  return sql<EventRow[]>`
    SELECT id, title, event_date, start_time, description
    FROM event
    WHERE deleted_at IS NULL AND event_date >= current_date
    ORDER BY event_date, start_time NULLS FIRST
    ${limit ? sql`LIMIT ${limit}` : sql``}
  `;
}

export async function getEvent(id: string): Promise<EventRow | null> {
  await requireSession();
  const [row] = await sql<EventRow[]>`
    SELECT id, title, event_date, start_time, description
    FROM event
    WHERE id = ${id} AND deleted_at IS NULL
  `;
  return row ?? null;
}

export async function createEvent(input: EventInput): Promise<void> {
  await requireSession();
  await sql`
    INSERT INTO event (title, event_date, start_time, description)
    VALUES (${input.title}, ${input.eventDate}, ${input.startTime}, ${input.description})
  `;
}

/** Returns false if the event doesn't exist (or is deleted). */
export async function updateEvent(id: string, input: EventInput): Promise<boolean> {
  await requireSession();
  const result = await sql`
    UPDATE event
    SET title = ${input.title}, event_date = ${input.eventDate}, start_time = ${input.startTime},
        description = ${input.description}, updated_at = now()
    WHERE id = ${id} AND deleted_at IS NULL
  `;
  return result.count > 0;
}

/** Soft delete. Restore by hand: UPDATE event SET deleted_at = NULL WHERE id = …; */
export async function deleteEvent(id: string): Promise<void> {
  await requireSession();
  await sql`UPDATE event SET deleted_at = now() WHERE id = ${id} AND deleted_at IS NULL`;
}
