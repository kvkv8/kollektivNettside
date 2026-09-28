# Kollektiv site — v1 spec

A small private website for a 5-person student kollektiv in Trondheim (Eidsvolls gate 5, 7030).
It saves the things people say, shows whose turn it is to take out the trash, when TRV collects
the bins, and what's happening in the house.

Status: **specced, not implemented.** Everything under "Later" is explicitly out of scope for v1.

---

## 1. Goals

1. A fun, low-friction place to save quotes and scroll back through them.
2. Answer the everyday kitchen questions: *whose trash week is it?*, *which bins go out on Wednesday?*, *is anyone having guests this weekend?*
3. A learning project: PostgreSQL (coming from MySQL in coursework), hand-written SQL and migrations, and TypeScript/Next.js (coming from Python/Django).

Non-goals for v1: search, statistics, user accounts, strong security. The site is protected by
*trust*, not by per-person authentication.

---

## 2. Users & access

- **One shared password** for the whole house. Knowing it = access. There are no user accounts,
  and the site does not know *who* is using it.
- Everyone with access can **create, edit and (soft-)delete** quotes and events.
- **Only the admin (Kristoffer)** changes the password, via a CLI script (`npm run set-password`).
  There is no admin UI.
- Changing the password **logs out every device** (see §6).
- A login lasts **1 year** per device.

---

## 3. Pages

UI language: **Norwegian (bokmål)**. Layout: **mobile-first**, bottom navigation bar with three tabs.

| Route        | Tab      | Contents |
|--------------|----------|----------|
| `/login`     | —        | A single password field ("Passord") and a "Logg inn" button. The only page reachable without a session. |
| `/`          | Hjem     | **Søppeluke:** who has trash duty this week (and next week). **Neste tømming:** next TRV collection date and waste types, e.g. "Onsdag 30. sep: Restavfall, Matavfall". **Kommende:** the next 3 events. **Tilfeldig sitat:** one random quote. |
| `/sitater`   | Sitater  | All quotes, ordered newest first (see D10). A "+ Nytt sitat" button opens the create form. Each quote can be edited or deleted. |
| `/kalender`  | Kalender | A list of upcoming events (today and later), soonest first. A "+ Ny hendelse" button. Each event can be edited or deleted. |

### Forms

**New/edit quote**
| Field | Norwegian label | Required | Notes |
|---|---|---|---|
| Quote text | Sitat | yes | 1–1000 chars |
| Speaker | Hvem sa det? | yes | Free text, 1–50 chars. Autocomplete suggests existing speakers. |
| Date said | Dato | no | Date picker, empty by default |
| Context | Kontekst | no | 0–300 chars, e.g. "på hyttetur, kl. 03" |

**New/edit event**
| Field | Norwegian label | Required | Notes |
|---|---|---|---|
| Title | Tittel | yes | 1–100 chars, e.g. "Ola har besøk" |
| Date | Dato | yes | |
| Time | Klokkeslett | no | |
| Description | Beskrivelse | no | 0–1000 chars |

Delete asks for confirmation ("Er du sikker?") and is a **soft delete** (see D6).

### Empty and error states
- No quotes yet: "Ingen sitater ennå — legg til det første!"
- No upcoming events: "Ingenting planlagt."
- TRV data unavailable (TRV down, or the new year's plan not published yet): "Ingen tømmedatoer tilgjengelig." The rest of the page still renders.

---

## 4. Data model

### ER overview

```
speaker 1 ──── * quote
event            (standalone)
site_password    (exactly one row)
```

Trash rotation and TRV collection dates are **not** stored in the database (D7, D9).

### Schema sketch (PostgreSQL)

This is the target schema for the first migration. It is a sketch; the real migration files are
written by hand during implementation.

```sql
-- Speakers: anyone who can be quoted (residents, guests, ex-residents).
CREATE TABLE speaker (
    id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name        text NOT NULL
                CHECK (name = btrim(name) AND length(name) BETWEEN 1 AND 50),
    created_at  timestamptz NOT NULL DEFAULT now()
);
-- Case-insensitive uniqueness: "Ola" and "ola" are the same speaker.
CREATE UNIQUE INDEX speaker_name_lower_key ON speaker (lower(name));

CREATE TABLE quote (
    id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    text        text NOT NULL CHECK (length(btrim(text)) BETWEEN 1 AND 1000),
    speaker_id  bigint NOT NULL REFERENCES speaker (id) ON DELETE RESTRICT,
    said_on     date,                       -- optional: when it was said
    context     text CHECK (length(context) <= 300),
    created_at  timestamptz NOT NULL DEFAULT now(),
    updated_at  timestamptz NOT NULL DEFAULT now(),
    deleted_at  timestamptz                 -- NULL = visible
);
CREATE INDEX quote_speaker_id_idx ON quote (speaker_id);

CREATE TABLE event (
    id           bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title        text NOT NULL CHECK (length(btrim(title)) BETWEEN 1 AND 100),
    event_date   date NOT NULL,
    start_time   time,                      -- optional
    description  text CHECK (length(description) <= 1000),
    created_at   timestamptz NOT NULL DEFAULT now(),
    updated_at   timestamptz NOT NULL DEFAULT now(),
    deleted_at   timestamptz
);
-- Partial index: only visible events, which is all the app ever queries.
CREATE INDEX event_upcoming_idx ON event (event_date) WHERE deleted_at IS NULL;

-- Exactly one row holding the shared password.
CREATE TABLE site_password (
    id                boolean PRIMARY KEY DEFAULT true CHECK (id),  -- forces a single row
    password_hash     text NOT NULL,                                -- argon2id
    password_version  integer NOT NULL DEFAULT 1,                   -- bumped on every change
    updated_at        timestamptz NOT NULL DEFAULT now()
);
```

### Key queries (sketches)

```sql
-- Get-or-create a speaker by name (case-insensitive).
-- Gotcha: ON CONFLICT ... DO NOTHING returns *no row* on conflict, so we use a
-- no-op DO UPDATE to always get the id back.
INSERT INTO speaker (name) VALUES ($1)
ON CONFLICT ((lower(name))) DO UPDATE SET name = speaker.name
RETURNING id;

-- Quote list (Sitater).
SELECT q.id, q.text, q.said_on, q.context, q.created_at, s.name AS speaker
FROM quote q JOIN speaker s ON s.id = q.speaker_id
WHERE q.deleted_at IS NULL
ORDER BY COALESCE(q.said_on, (q.created_at AT TIME ZONE 'Europe/Oslo')::date) DESC,
         q.created_at DESC;

-- Random quote (Hjem). ORDER BY random() is a full scan, which is fine for small tables.
SELECT ... FROM quote q JOIN speaker s ON s.id = q.speaker_id
WHERE q.deleted_at IS NULL ORDER BY random() LIMIT 1;

-- Upcoming events.
SELECT id, title, event_date, start_time, description
FROM event
WHERE deleted_at IS NULL AND event_date >= $today
ORDER BY event_date, start_time NULLS FIRST
LIMIT $n;

-- Speaker autocomplete: all speakers who have at least one visible quote, most-quoted first.
SELECT s.name
FROM speaker s JOIN quote q ON q.speaker_id = s.id AND q.deleted_at IS NULL
GROUP BY s.id ORDER BY count(*) DESC, s.name;

-- Soft delete / admin restore.
UPDATE quote SET deleted_at = now() WHERE id = $1;
UPDATE quote SET deleted_at = NULL  WHERE id = 42;   -- restore, run by hand in psql
```

Editing a quote's speaker goes through get-or-create again. A speaker left with no quotes stays
in the table. That's harmless, because autocomplete only lists speakers who have quotes.

---

## 5. Trash rotation

- Five first names in a fixed order, plus an **anchor Monday** (the week the first name starts),
  kept in a config file in the repo (`src/config/rotation.ts`). The repo is public, and first
  names are fine there.
- Weeks run **Monday–Sunday**, Europe/Oslo time.
- Duty for a date `d`:
  ```
  weeks = floor((mondayOf(d) − anchorMonday) / 7 days)
  person = names[((weeks mod n) + n) mod n]      // double-mod handles dates before the anchor
  ```
- Nothing is stored. No swaps, no "done" button, no reminders.
- When someone moves out, edit the config and redeploy. Past weeks may then show the wrong
  person, and that's accepted.
- *To fill in during implementation:* the five names, their order, and the anchor Monday.

---

## 6. Authentication design

- The password hash is stored in `site_password` using **argon2id**. It is set and changed only
  with `npm run set-password`, which prompts for the new password, hashes it, upserts the row,
  and increments `password_version`.
- **Login:** a server action verifies the password against the hash. On success it sets a cookie
  `session = sign({ v: password_version, exp: now + 1 year })`:
  - signed with HMAC-SHA256 using `SESSION_SECRET`
  - `HttpOnly`, `Secure`, `SameSite=Lax`, max-age 1 year
- **Every request:** check the signature and expiry, then check that `v` equals the current
  `password_version`. Changing the password increments the version, so every existing cookie
  becomes invalid, which logs out every device.
  - The check runs in Next.js request interception (`proxy.ts`/middleware, Node runtime), which
    redirects to `/login`.
  - It runs again inside every server action and data-loading function. This is defence in
    depth, so the app never relies on middleware alone.
- **Brute force:** argon2id is slow by design, which is enough for v1. Rate limiting is in "Later".
- **Lost password:** the admin runs `npm run set-password` against the production
  `DATABASE_URL`.

---

## 7. TRV waste collection

- **Source:** Trondheim Renholdsverk (TRV), not Min Renovasjon.
  `GET https://trv.no/wp-json/wasteplan/v2/calendar/{TRV_ADDRESS_ID}`. No key or auth is needed.
  - `TRV_ADDRESS_ID` for Eidsvolls Gate 5 is `8843e8c5-6268-4c6f-bd7c-27b7dd1e1d03`. It lives in
    env, not code.
  - The ID was found with `GET https://trv.no/wp-json/wasteplan/v2/adress?s=Eidsvolls%20gate%205`.
- **Response:** use `calendar[]`, where each item has `dato` (e.g. `2026-09-30T00:00:00`) and
  `fraksjon` (e.g. "Restavfall"). Ignore the top-level `errors` field, which appears even on
  success.
- **Display:** group items by date and show the first date that is today or later. Collection at
  this address is on Wednesdays.
- **Fetching:**
  - server-side only, with `fetch(url, { next: { revalidate: 86400 } })`, i.e. cached by Next.js
    for 24 hours
  - with a descriptive `User-Agent`
  - never called from the browser
- **Failure modes:** handle each by showing the "Ingen tømmedatoer tilgjengelig" state instead of
  failing:
  - network error or non-200 response
  - an empty `calendar`, since TRV only publishes up to the end of the current year
  - an unexpected response shape
- **Caveat:** this is an unofficial endpoint and may change without notice (it has already moved
  from v1 to v2). The per-address ICS feed `https://trv.no/calendar/{id}/` is a known fallback,
  but it is not implemented in v1.

---

## 8. Tech stack & project setup

| Concern | Choice |
|---|---|
| Language | TypeScript (strict) |
| Framework | Next.js (App Router), server components + server actions |
| Database | PostgreSQL: Docker (`postgres:18`) locally, **Neon** (free tier) in production |
| DB access | **Raw SQL** with `postgres.js` tagged templates (parameterised, so no string concatenation) |
| Migrations | **Hand-written `.sql` files** with `dbmate` (`db/migrations/`, `-- migrate:up` / `-- migrate:down`) |
| DB types | Generated from the live schema with `kanel`, so TS types always match the DB |
| Validation | `zod` on form input. The DB `CHECK` constraints are the final authority. |
| Password hashing | argon2id (`@node-rs/argon2`) |
| Hosting | **Vercel** (free), deploy on push to `main` |
| Domain | Custom domain bought at **Domeneshop**, DNS pointed at Vercel |
| Repo | Public GitHub repository |

**Connection timezone:** set the Postgres session `TimeZone` to `Europe/Oslo` on connect, so
`current_date` and `now()::date` match Norwegian dates. Neon defaults to UTC.

### Environment variables
| Name | Purpose |
|---|---|
| `DATABASE_URL` | Postgres connection string (local Docker / Neon) |
| `SESSION_SECRET` | 32+ random bytes, used to sign session cookies |
| `TRV_ADDRESS_ID` | TRV address UUID |

### Scripts
| Script | Does |
|---|---|
| `npm run dev` | Next.js dev server |
| `npm run db:up` | Start local Postgres (docker compose) |
| `npm run db:migrate` | `dbmate up` |
| `npm run db:types` | Regenerate TS types with kanel |
| `npm run set-password` | Prompt for and set the shared password |

---

## 9. Decision log

Each entry is a decision, with a short database note where one is useful.

**D1 — PostgreSQL rather than MySQL.** Chosen to learn something different from the course.
- *Postgres vs MySQL notes that matter here:*
  - `GENERATED ALWAYS AS IDENTITY` is the SQL-standard replacement for `AUTO_INCREMENT`.
  - `text` has no performance penalty compared with `varchar(n)`. Length limits go in `CHECK`
    constraints instead.
  - `timestamptz` stores an absolute instant and converts to the session timezone.
  - DDL is **transactional**, so a failed migration rolls back completely. In MySQL, DDL commits
    implicitly.

**D2 — Shared password, anonymous usage.** Five friends, low stakes. There are no `user` or
`created_by` columns, because nothing depends on *who* entered something.

**D3 — Speaker is its own table (3NF) instead of a text column on `quote`.**
- *Recap:* storing the name on every quote repeats the fact "this person exists" in every row.
  Typos then create phantom people ("Ola" ≠ "ola ").
- A separate table with a foreign key stores that fact once. Renaming or merging a speaker then
  touches one row.
- The UI is still free text. The server does get-or-create.

**D4 — Case-insensitive uniqueness via an expression index** on `lower(name)`, plus a
`CHECK (name = btrim(name))`.
- *Note:* Postgres can index the result of an expression. It is normally case-sensitive, unlike
  MySQL's default collations.
- The alternative is the `citext` extension. The expression index was chosen because it makes
  the rule visible.

**D5 — `ON DELETE RESTRICT` on `quote.speaker_id`.** A speaker can't be deleted while quotes
point at them, so the database prevents orphaned quotes, not just the app.

**D6 — Soft delete (`deleted_at timestamptz NULL`) on quotes and events.**
- Anyone can delete, so mistakes must be recoverable. Restoring is done only with SQL, by the
  admin.
- There is no audit history in v1.
- *Note:* every query must filter `deleted_at IS NULL`. **Partial indexes**
  (`... WHERE deleted_at IS NULL`) keep indexes limited to the rows that are actually queried.

**D7 — Trash rotation is computed from config, not stored.**
- This is derived data versus stored data. The schedule is a pure function of (names, anchor,
  date), so a table would just be a cache that could drift.
- The trade-off: changing the list rewrites history. That's accepted for v1.

**D8 — `site_password` is a single-row table** (`id boolean PRIMARY KEY CHECK (id)`).
- *Note:* the primary key can only ever be `true`, so a second row is impossible. The database
  enforces "exactly one config row", not the app.
- `password_version` exists so sessions can be revoked without a sessions table.

**D9 — TRV data is cached by Next.js, not stored in Postgres.** This is simplest. A Postgres table
refreshed with upserts is noted in "Later".

**D10 — Quote ordering.** Order by `COALESCE(said_on, created_at in Oslo time)` descending, so a
quote added today about last month lands in the right place. Quotes without a date sort by when
they were added.

**D11 — Raw SQL + hand-written migrations, no ORM.**
- The point is to learn SQL, so every table, constraint, index and query is written by hand and
  visible.
- `postgres.js` tagged templates keep queries parameterised, so SQL injection is prevented by
  construction.
- `kanel` generates types from the schema, so type safety comes *from* the database rather than
  the reverse.

**D12 — Load all quotes on `/sitater` (no pagination) in v1.** A kollektiv produces hundreds, not
millions. Keyset pagination is noted in "Later".

**D13 — `DATE` + optional `TIME` for events, not `timestamptz`.** An event is "Saturday" or
"Saturday 19:00" in local house time, not an absolute instant. Storing a date and an optional
time avoids timezone surprises and makes "all-day" the natural default.

---

## 10. Implementation order

1. Scaffold Next.js + TS, docker compose Postgres, dbmate, env handling.
2. First migration (schema §4), kanel types, `set-password` script.
3. Auth: login page, session cookie, request check, and a re-check in actions.
4. Sitater: list, create, edit, soft delete, speaker autocomplete.
5. Kalender: list, create, edit, soft delete.
6. Trash rotation config + TRV fetch module.
7. Hjem page composing all of the above.
8. Deploy: Neon database, Vercel project, env vars, Domeneshop DNS.

---

## 11. Later (explicitly out of scope for v1)

- **Search & filtering:** full-text search with Postgres' `norwegian` config, `tsvector` + GIN
  index, ranking. Possibly `pg_trgm` for fuzzy speaker names. Date filtering. Done properly
  together with the information retrieval course.
- **Wrapped per school year (Aug–Jun):** most-quoted person, busiest month, most-used words,
  etc. Live for the current year, frozen (e.g. a materialized view) for past years.
- **Husinfo page:** editable markdown (wifi, landlord, …).
- **Audit history** of edits, via triggers.
- **Trash/restore page** for soft-deleted items.
- **Store TRV dates in Postgres,** refreshed daily with `INSERT ... ON CONFLICT` upserts. Allows
  SQL joins with the rotation and survives TRV outages. Also an ICS fallback.
- **ICS calendar subscription** for events, collections and duty.
- **Kiosk/fridge screen** view (e.g. on the old Mac).
- **Login rate limiting.**
- **Keyset pagination** for quotes.
- **Reminders** for trash duty.
