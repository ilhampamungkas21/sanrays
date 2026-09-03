-- ============================================
-- SANRAYS EVENT DASHBOARD - MySQL Schema
-- Run this in MySQL Database
-- ============================================

-- ============================================
-- Create Database
-- ============================================
CREATE DATABASE IF NOT EXISTS sanrays_event;
USE sanrays_event;

-- ============================================
-- USERS TABLE (Auth)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('super_admin', 'admin', 'event_manager', 'finance', 'stakeholder') DEFAULT 'admin',
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================
-- EVENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS events (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  date DATE NOT NULL,
  end_date DATE,
  location VARCHAR(255),
  theme VARCHAR(255),
  status ENUM('draft', 'preparation', 'active', 'completed', 'cancelled') DEFAULT 'draft',
  event_type ENUM('public', 'internal') DEFAULT 'public',
  description TEXT,
  short_description TEXT,
  organizer VARCHAR(255),
  cover_gradient VARCHAR(100) DEFAULT 'from-orange-400 to-orange-600',
  highlights JSON,
  max_participants INT DEFAULT 50,
  price DECIMAL(10, 2) DEFAULT 0,
  early_bird_price DECIMAL(10, 2),
  early_bird_deadline DATE,
  payment_methods JSON,
  published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================
-- PARTICIPANTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS participants (
  id CHAR(36) PRIMARY KEY,
  event_id CHAR(36),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  company VARCHAR(255),
  position VARCHAR(255),
  gender VARCHAR(20),
  age_group VARCHAR(20),
  city VARCHAR(100),
  registration_date DATE,
  status ENUM('registered', 'confirmed', 'attended', 'cancelled') DEFAULT 'registered',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

-- ============================================
-- CHECKLISTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS checklists (
  id CHAR(36) PRIMARY KEY,
  event_id CHAR(36),
  category ENUM('acara', 'konsumsi', 'perlengkapan', 'humas', 'keuangan', 'dokumentasi', 'timing', 'lainnya') NOT NULL,
  task VARCHAR(500) NOT NULL,
  pic VARCHAR(255),
  status ENUM('pending', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
  due_date DATE,
  priority ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

-- ============================================
-- ATTENDANCE TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS attendance (
  id CHAR(36) PRIMARY KEY,
  event_id CHAR(36),
  participant_id CHAR(36),
  session_name VARCHAR(255),
  date DATE,
  check_in_time TIMESTAMP NULL,
  check_out_time TIMESTAMP NULL,
  status ENUM('present', 'absent', 'late', 'permission') DEFAULT 'absent',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  FOREIGN KEY (participant_id) REFERENCES participants(id) ON DELETE CASCADE
);

-- ============================================
-- EVALUATIONS TABLE (Pre/Post Test Scores)
-- ============================================
CREATE TABLE IF NOT EXISTS evaluations (
  id CHAR(36) PRIMARY KEY,
  event_id CHAR(36),
  participant_id CHAR(36),
  test_type ENUM('pre_test', 'post_test'),
  score DECIMAL(5, 2),
  answers JSON,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  FOREIGN KEY (participant_id) REFERENCES participants(id) ON DELETE CASCADE
);

-- ============================================
-- FEEDBACK TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS feedback (
  id CHAR(36) PRIMARY KEY,
  event_id CHAR(36),
  participant_name VARCHAR(255),
  participant_email VARCHAR(255),
  rating_overall DECIMAL(2, 1) CHECK (rating_overall >= 1 AND rating_overall <= 5),
  rating_content DECIMAL(2, 1) CHECK (rating_content >= 1 AND rating_content <= 5),
  rating_facility DECIMAL(2, 1) CHECK (rating_facility >= 1 AND rating_facility <= 5),
  rating_pemateri DECIMAL(2, 1) CHECK (rating_pemateri >= 1 AND rating_pemateri <= 5),
  comments TEXT,
  suggestions TEXT,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

-- ============================================
-- TRANSACTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS transactions (
  id CHAR(36) PRIMARY KEY,
  event_id CHAR(36),
  category ENUM('income', 'expense') NOT NULL,
  type VARCHAR(100) NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  description TEXT,
  vendor VARCHAR(255),
  receipt_url TEXT,
  transaction_date DATE,
  status ENUM('pending', 'approved', 'rejected', 'paid', 'cancelled') DEFAULT 'pending',
  paid_by VARCHAR(255),
  approved_by VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

-- ============================================
-- BUDGETS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS budgets (
  id CHAR(36) PRIMARY KEY,
  event_id CHAR(36),
  category VARCHAR(100) NOT NULL,
  planned_amount DECIMAL(15, 2) DEFAULT 0,
  actual_amount DECIMAL(15, 2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

-- ============================================
-- DOCUMENTS TABLE (Assets, Sertifikat, Materi, LPJ)
-- ============================================
CREATE TABLE IF NOT EXISTS documents (
  id CHAR(36) PRIMARY KEY,
  event_id CHAR(36),
  category ENUM('sertifikat', 'materi', 'foto', 'video', 'lpj', 'kontrak', 'lainnya') NOT NULL,
  name VARCHAR(255) NOT NULL,
  file_url TEXT,
  description TEXT,
  uploaded_by VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

-- ============================================
-- SESSIONS TABLE (for JWT refresh tokens)
-- ============================================
CREATE TABLE IF NOT EXISTS sessions (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  refresh_token VARCHAR(500),
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_participants_event_id ON participants(event_id);
CREATE INDEX idx_checklists_event_id ON checklists(event_id);
CREATE INDEX idx_attendance_event_id ON attendance(event_id);
CREATE INDEX idx_transactions_event_id ON transactions(event_id);
CREATE INDEX idx_feedback_event_id ON feedback(event_id);
CREATE INDEX idx_evaluations_event_id ON evaluations(event_id);
CREATE INDEX idx_documents_event_id ON documents(event_id);
CREATE INDEX idx_budgets_event_id ON budgets(event_id);
CREATE INDEX idx_events_published ON events(published);
CREATE INDEX idx_events_date ON events(date);

-- ============================================
-- DONE!
-- ============================================
