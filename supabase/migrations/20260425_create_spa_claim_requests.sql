-- Create spa_claim_requests table
CREATE TABLE spa_claim_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  spa_id UUID NOT NULL REFERENCES spas(id) ON DELETE CASCADE,
  requester_name TEXT NOT NULL,
  requester_email TEXT NOT NULL,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for spa_id lookups
CREATE INDEX idx_spa_claim_requests_spa_id ON spa_claim_requests(spa_id);
CREATE INDEX idx_spa_claim_requests_status ON spa_claim_requests(status);
CREATE INDEX idx_spa_claim_requests_created_at ON spa_claim_requests(created_at DESC);

-- Enable RLS
ALTER TABLE spa_claim_requests ENABLE ROW LEVEL SECURITY;

-- Public can insert claim requests
CREATE POLICY "Allow anyone to insert claim requests"
  ON spa_claim_requests
  FOR INSERT
  WITH CHECK (true);

-- Admin can select all claim requests
CREATE POLICY "Allow admin to select all claim requests"
  ON spa_claim_requests
  FOR SELECT
  USING (true);

-- Admin can update claim requests
CREATE POLICY "Allow admin to update claim requests"
  ON spa_claim_requests
  FOR UPDATE
  USING (true);
