-- ============================================
-- SANRAYS EVENT - Event Approvals Table
-- Run ini setelah mysql-schema.sql
-- ============================================

USE sanrays_event;

-- ============================================
-- EVENT APPROVALS TABLE
-- Track who approved/rejected each event
-- ============================================
CREATE TABLE IF NOT EXISTS event_approvals (
  id CHAR(36) PRIMARY KEY,
  event_id CHAR(36) NOT NULL,
  user_id CHAR(36) NOT NULL,
  user_role VARCHAR(50) NOT NULL,
  user_name VARCHAR(255) NOT NULL,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_event_user (event_id, user_id)
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_event_approvals_event_id ON event_approvals(event_id);
CREATE INDEX idx_event_approvals_user_id ON event_approvals(user_id);
CREATE INDEX idx_event_approvals_status ON event_approvals(status);
CREATE INDEX idx_event_approvals_user_role ON event_approvals(user_role);

-- ============================================
-- DONE!
-- ============================================
