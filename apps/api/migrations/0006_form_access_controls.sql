ALTER TABLE forms ADD COLUMN expires_at INTEGER;

ALTER TABLE forms ADD COLUMN response_limit INTEGER;

ALTER TABLE forms ADD COLUMN access_password_hash TEXT;