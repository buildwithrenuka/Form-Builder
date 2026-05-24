ALTER TABLE forms ADD COLUMN payment_config TEXT;

ALTER TABLE responses ADD COLUMN payment_order_id TEXT;
ALTER TABLE responses ADD COLUMN payment_id TEXT;
ALTER TABLE responses ADD COLUMN payment_amount INTEGER;
ALTER TABLE responses ADD COLUMN payment_currency TEXT;