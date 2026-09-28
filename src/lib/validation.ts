import { z } from "zod";

/** Optional text input: trimmed, and "" becomes null. */
const optionalText = (max: number, message: string) =>
  z
    .string()
    .trim()
    .max(max, message)
    .transform((s) => (s === "" ? null : s));

const optionalDate = z
  .string()
  .trim()
  .refine((s) => s === "" || /^\d{4}-\d{2}-\d{2}$/.test(s), "Ugyldig dato.")
  .transform((s) => (s === "" ? null : s));

// These mirror the CHECK constraints in the migration, which remain the final authority.
export const quoteSchema = z.object({
  text: z.string().trim().min(1, "Skriv inn sitatet.").max(1000, "Maks 1000 tegn."),
  speaker: z.string().trim().min(1, "Hvem sa det?").max(50, "Maks 50 tegn."),
  saidOn: optionalDate,
  context: optionalText(300, "Maks 300 tegn."),
});
export type QuoteInput = z.infer<typeof quoteSchema>;

export const eventSchema = z.object({
  title: z.string().trim().min(1, "Skriv inn en tittel.").max(100, "Maks 100 tegn."),
  eventDate: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, "Velg en dato."),
  startTime: z
    .string()
    .trim()
    .refine((s) => s === "" || /^\d{2}:\d{2}(:\d{2})?$/.test(s), "Ugyldig klokkeslett.")
    .transform((s) => (s === "" ? null : s)),
  description: optionalText(1000, "Maks 1000 tegn."),
});
export type EventInput = z.infer<typeof eventSchema>;

/** Route ids are bigints, carried as strings. */
export const isId = (id: string) => /^\d{1,18}$/.test(id);

/** Form state shared by the quote and event forms. */
export type FormState = {
  errors?: Record<string, string[] | undefined>;
  formError?: string;
  values?: Record<string, string>;
};

export function formValues(formData: FormData): Record<string, string> {
  const values: Record<string, string> = {};
  for (const [key, value] of formData) if (typeof value === "string") values[key] = value;
  return values;
}
