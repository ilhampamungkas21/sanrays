-- ============================================
-- SANRAYS EVENT - Event Approvals Table
-- For Supabase (PostgreSQL)
-- ============================================

-- ============================================
-- EVENT APPROVALS TABLE
-- Track who approved/rejected each event
-- ============================================
CREATE TABLE IF NOT EXISTS event_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_role VARCHAR(50) NOT NULL,
  user_name VARCHAR(255) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(event_id, user_id)
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_event_approvals_event_id ON event_approvals(event_id);
CREATE INDEX IF NOT EXISTS idx_event_approvals_user_id ON event_approvals(user_id);
CREATE INDEX IF NOT EXISTS idx_event_approvals_status ON event_approvals(status);
CREATE INDEX IF NOT EXISTS idx_event_approvals_user_role ON event_approvals(user_role);

-- ============================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================
ALTER TABLE event_approvals ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations (adjust as needed for production)
CREATE POLICY "Allow all access to event_approvals" ON event_approvals
  FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- DONE!
-- ============================================
