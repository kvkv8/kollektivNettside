-- migrate:up

-- Speakers: anyone who can be quoted (residents, guests, ex-residents).
CREATE TABLE speaker (
    id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name        text NOT NULL
                CHECK (name = btrim(name) AND length(name) BETWEEN 1 AND 50),
    created_at  timestamptz NOT NULL DEFAULT now()
);
-- Case-insensitive uniqueness: "Ola" and "ola" are the same speaker (D4).
CREATE UNIQUE INDEX speaker_name_lower_key ON speaker (lower(name));

CREATE TABLE quote (
    id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    text        text NOT NULL CHECK (length(btrim(text)) BETWEEN 1 AND 1000),
    speaker_id  bigint NOT NULL REFERENCES speaker (id) ON DELETE RESTRICT,
    said_on     date,                       -- optional: when it was said
    context     text CHECK (length(context) <= 300),
    created_at  timestamptz NOT NULL DEFAULT now(),
    updated_at  timestamptz NOT NULL DEFAULT now(),
    deleted_at  timestamptz                 -- NULL = visible (D6)
);
CREATE INDEX quote_speaker_id_idx ON quote (speaker_id);

CREATE TABLE event (
    id           bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title        text NOT NULL CHECK (length(btrim(title)) BETWEEN 1 AND 100),
    event_date   date NOT NULL,
    start_time   time,                      -- optional (D13)
    description  text CHECK (length(description) <= 1000),
    created_at   timestamptz NOT NULL DEFAULT now(),
    updated_at   timestamptz NOT NULL DEFAULT now(),
    deleted_at   timestamptz
);
-- Partial index: only visible events, which is all the app ever queries.
CREATE INDEX event_upcoming_idx ON event (event_date) WHERE deleted_at IS NULL;

-- Exactly one row holding the shared password (D8).
CREATE TABLE site_password (
    id                boolean PRIMARY KEY DEFAULT true CHECK (id),  -- forces a single row
    password_hash     text NOT NULL,                                -- argon2id
    password_version  integer NOT NULL DEFAULT 1,                   -- bumped on every change
    updated_at        timestamptz NOT NULL DEFAULT now()
);

-- migrate:down

DROP TABLE site_password;
DROP TABLE event;
DROP TABLE quote;
DROP TABLE speaker;
