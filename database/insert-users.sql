-- ============================================
-- SANRAYS EVENT - Insert Semua User
-- Run di MySQL setelah mysql-schema.sql
-- ============================================

USE sanrays_event;

-- Password: admin123 (hashed with bcrypt, cost 12)
-- Hash ini sesuai dengan plaintext "admin123"

-- Hapus user yang ada (optional - jika ingin reset)
-- DELETE FROM users WHERE email IN ('ahmad@sanrays.com', 'sarah@sanrays.com', 'budi@sanrays.com', 'diana@sanrays.com', 'fitri@sanrays.com', 'gunawan@sanrays.com', 'irwan@sanrays.com');

-- Insert Semua User
INSERT INTO users (id, name, email, password_hash, role) VALUES
(
  UUID(),
  'Ahmad Super Admin',
  'ahmad@sanrays.com',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewKyDA0v9V3fH3V6',
  'super_admin'
),
(
  UUID(),
  'Sarah Admin',
  'sarah@sanrays.com',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewKyDA0v9V3fH3V6',
  'admin'
),
(
  UUID(),
  'Budi Admin',
  'budi@sanrays.com',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewKyDA0v9V3fH3V6',
  'admin'
),
(
  UUID(),
  'Diana Event Manager',
  'diana@sanrays.com',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewKyDA0v9V3fH3V6',
  'event_manager'
),
(
  UUID(),
  'Fitri Finance',
  'fitri@sanrays.com',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewKyDA0v9V3fH3V6',
  'finance'
),
(
  UUID(),
  'Gunawan Finance',
  'gunawan@sanrays.com',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewKyDA0v9V3fH3V6',
  'finance'
),
(
  UUID(),
  'Irwan Stakeholder',
  'irwan@sanrays.com',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewKyDA0v9V3fH3V6',
  'stakeholder'
);

-- Verifikasi
SELECT id, name, email, role FROM users;
