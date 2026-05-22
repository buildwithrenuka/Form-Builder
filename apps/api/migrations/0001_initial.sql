-- FormVerse — initial schema for Cloudflare D1
-- Apply with: wrangler d1 migrations apply formquest-db

CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at    INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS forms (
  id          TEXT PRIMARY KEY,
  creator_id  TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  description TEXT,
  slug        TEXT NOT NULL UNIQUE,
  visibility  TEXT NOT NULL DEFAULT 'unlisted'
                CHECK(visibility IN ('public', 'unlisted')),
  published   INTEGER NOT NULL DEFAULT 0,
  schema      TEXT NOT NULL DEFAULT '[]',
  world_theme TEXT,
  created_at  INTEGER NOT NULL,
  updated_at  INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS responses (
  id           TEXT PRIMARY KEY,
  form_id      TEXT NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  data         TEXT NOT NULL,
  ip_hash      TEXT,
  submitted_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS rate_limits (
  id        TEXT PRIMARY KEY,
  key       TEXT NOT NULL,
  timestamp INTEGER NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_forms_creator    ON forms(creator_id);
CREATE INDEX IF NOT EXISTS idx_forms_slug       ON forms(slug);
CREATE INDEX IF NOT EXISTS idx_responses_form   ON responses(form_id);
CREATE INDEX IF NOT EXISTS idx_rate_limits_key  ON rate_limits(key);
CREATE INDEX IF NOT EXISTS idx_rate_limits_time ON rate_limits(timestamp);
