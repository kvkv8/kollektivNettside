import { z } from "zod";

const schema = z.object({
  DATABASE_URL: z.string().min(1),
  SESSION_SECRET: z.string().min(32, "SESSION_SECRET must be 32+ characters"),
  TRV_ADDRESS_ID: z.uuid(),
});

let cached: z.infer<typeof schema> | undefined;

/** Validated env. Parsed lazily so `next build` doesn't need every variable. */
export function env() {
  cached ??= schema.parse(process.env);
  return cached;
}
