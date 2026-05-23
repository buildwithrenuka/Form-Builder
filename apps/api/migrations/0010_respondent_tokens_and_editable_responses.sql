ALTER TABLE forms ADD COLUMN allow_response_edits INTEGER NOT NULL DEFAULT 0;

ALTER TABLE responses ADD COLUMN respondent_token_hash TEXT;

CREATE INDEX IF NOT EXISTS responses_form_respondent_token_idx
  ON responses(form_id, respondent_token_hash);