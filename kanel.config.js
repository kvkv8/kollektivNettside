/* eslint-disable @typescript-eslint/no-require-imports -- kanel loads its config with require() */
// Generates TS types from the live schema: `npm run db:types` (after `npm run db:migrate`).
const { existsSync } = require("node:fs");
const { makePgTsGenerator } = require("kanel");

if (existsSync(".env")) process.loadEnvFile(".env");

/** @type {import("kanel").ConfigV4} */
module.exports = {
  connection: process.env.DATABASE_URL,
  schemaNames: ["public"],
  outputPath: "./src/db/schema",
  preDeleteOutputFolder: true,
  typescriptConfig: { enumStyle: "literal-union" },
  generators: [
    makePgTsGenerator({
      // Match the parsers in src/lib/db.ts: dates and times stay as strings
      // ("2026-09-30", "19:00:00"), since they are local house time, not instants (D13).
      customTypeMap: {
        "pg_catalog.date": "string",
        "pg_catalog.time": "string",
      },
      // dbmate's bookkeeping table is not part of the app schema.
      filter: (pgType) => pgType.name !== "schema_migrations",
    }),
  ],
};
