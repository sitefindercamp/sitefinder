-- Create spa_owners table
CREATE TABLE spa_owners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  spa_id UUID NOT NULL UNIQUE REFERENCES spas(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for lookups
CREATE INDEX idx_spa_owners_spa_id ON spa_owners(spa_id);
CREATE INDEX idx_spa_owners_email ON spa_owners(email);

-- Enable RLS
ALTER TABLE spa_owners ENABLE ROW LEVEL SECURITY;

-- Owners can select their own spas
CREATE POLICY "Allow owners to select their spa"
  ON spa_owners
  FOR SELECT
  USING (auth.jwt()->>'email' = email);

-- Admin and service role can select all
CREATE POLICY "Allow admin to select all spa owners"
  ON spa_owners
  FOR SELECT
  USING (true);

-- Admin can insert spa owners (when approving claims)
CREATE POLICY "Allow admin to insert spa owners"
  ON spa_owners
  FOR INSERT
  WITH CHECK (true);

-- Admin can update spa owners
CREATE POLICY "Allow admin to update spa owners"
  ON spa_owners
  FOR UPDATE
  USING (true);

-- Admin can delete spa owners
CREATE POLICY "Allow admin to delete spa owners"
  ON spa_owners
  FOR DELETE
  USING (true);
