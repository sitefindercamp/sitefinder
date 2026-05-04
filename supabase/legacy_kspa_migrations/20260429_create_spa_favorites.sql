CREATE TABLE IF NOT EXISTS spa_favorites (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  spa_id      uuid NOT NULL REFERENCES spas(id) ON DELETE CASCADE,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, spa_id)
);

ALTER TABLE spa_favorites ENABLE ROW LEVEL SECURITY;

-- Users can read only their own favorites
CREATE POLICY "Users can view their own favorites"
  ON spa_favorites FOR SELECT
  USING (auth.uid() = user_id);

-- Users can save their own favorites
CREATE POLICY "Users can insert their own favorites"
  ON spa_favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can remove their own favorites
CREATE POLICY "Users can delete their own favorites"
  ON spa_favorites FOR DELETE
  USING (auth.uid() = user_id);
