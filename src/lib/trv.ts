import "server-only";
import { z } from "zod";
import { env } from "./env";

// Unofficial TRV endpoint (§7). It has moved before (v1 → v2), so parse defensively.
const responseSchema = z.object({
  calendar: z.array(
    z.object({
      dato: z.string().regex(/^\d{4}-\d{2}-\d{2}/),
      fraksjon: z.string(),
    }),
  ),
});

export type Collection = { date: string; wasteTypes: string[] };

/**
 * The next collection on or after `today`, or null if TRV is down, the plan for the year
 * isn't published yet, or the response looks wrong. Never throws.
 */
export async function getNextCollection(today: string): Promise<Collection | null> {
  try {
    const res = await fetch(`https://trv.no/wp-json/wasteplan/v2/calendar/${env().TRV_ADDRESS_ID}`, {
      headers: { "User-Agent": "kollektiv-side (private house website; Eidsvolls gate 5)" },
      next: { revalidate: 86400 },
    });
    if (!res.ok) return null;

    const parsed = responseSchema.safeParse(await res.json());
    if (!parsed.success) return null;

    const byDate = new Map<string, string[]>();
    for (const item of parsed.data.calendar) {
      const date = item.dato.slice(0, 10);
      if (date < today) continue;
      byDate.set(date, [...(byDate.get(date) ?? []), item.fraksjon]);
    }

    const [next] = [...byDate.keys()].sort();
    return next ? { date: next, wasteTypes: byDate.get(next)! } : null;
  } catch {
    return null;
  }
}
