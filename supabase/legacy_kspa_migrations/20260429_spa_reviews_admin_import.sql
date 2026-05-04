-- Allow reviews without a linked user account (admin imports from old site)
ALTER TABLE spa_reviews ALTER COLUMN user_id DROP NOT NULL;

-- Store the reviewer's name directly for admin-imported reviews
ALTER TABLE spa_reviews ADD COLUMN IF NOT EXISTS reviewer_name text;
