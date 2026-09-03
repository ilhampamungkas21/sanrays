-- ============================================
-- SANRAYS EVENT DASHBOARD - Seed Data
-- Run setelah mysql-schema.sql
-- ============================================

USE sanrays_event;

-- ============================================
-- Insert Sample Admin User
-- Password: admin123 (hashed with bcrypt)
-- ============================================
INSERT INTO users (id, name, email, password_hash, role) VALUES
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Admin Sanrays', 'admin@sanrays.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewKyDA0v9V3fH3V6', 'admin');

-- ============================================
-- Insert Sample Events
-- ============================================
INSERT INTO events (id, name, date, end_date, location, theme, status, event_type, description, short_description, organizer, cover_gradient, highlights, max_participants, price, early_bird_price, early_bird_deadline, payment_methods, published) VALUES
(
  'evt-001-0000-0000-0000-000000000001',
  'Workshop Public Speaking 2024',
  '2024-09-15',
  '2024-09-16',
  'Hotel Mulia, Jakarta',
  'Speak with Confidence',
  'completed',
  'public',
  'Workshop intensif public speaking selama 2 hari dengan pemateri profesional dari berbagai kalangan. Peserta akan belajar teknik berbicara di depan umum, mengatasi rasa gugup, dan membangun kepercayaan diri.',
  'Workshop intensif 2 hari tentang teknik public speaking.',
  'Sarah - Event Manager',
  'from-orange-400 to-orange-600',
  '["47 Peserta", "CSAT 4.6", "Peningkatan +19 poin"]',
  50,
  1500000,
  1200000,
  '2024-08-31',
  '["Transfer Bank", "OVO", "GoPay"]',
  true
),
(
  'evt-002-0000-0000-0000-000000000002',
  'Kelas Coaching Batch 5',
  '2024-10-01',
  '2024-10-05',
  'Sanrays Office, Jakarta',
  'Leadership Mastery',
  'active',
  'public',
  'Program coaching leadership selama 5 hari untuk team leaders dan middle management. Belajar tentang fundamental kepemimpinan, team dynamics, decision making, dan coaching techniques.',
  'Program coaching leadership 5 hari untuk team leaders.',
  'Sarah - Event Manager',
  'from-blue-400 to-blue-600',
  '["32 Peserta", "5 Hari", "Leadership Focus"]',
  40,
  3500000,
  2800000,
  '2024-09-15',
  '["Transfer Bank", "Kartu Kredit"]',
  true
),
(
  'evt-003-0000-0000-0000-000000000003',
  'Team Building Q4 2024',
  '2024-11-15',
  '2024-11-17',
  'Villa Bintang, Puncak',
  'Build Stronger Team',
  'preparation',
  'internal',
  'Team building 3 hari 2 malam di villa untuk mempererat kebersamaan tim. Activities include outdoor games, workshop, dan fireside chat.',
  'Team building 3 hari 2 malam di villa Puncak.',
  'HR Team',
  'from-emerald-400 to-emerald-600',
  '["25 Peserta", "3 Hari 2 Malam", "Outdoor Activities"]',
  30,
  0,
  NULL,
  NULL,
  '[]',
  true
),
(
  'evt-004-0000-0000-0000-000000000004',
  'Seminar Digital Marketing 2025',
  '2025-01-20',
  '2025-01-20',
  'Aula Utama, Universitas Indonesia',
  'Digital Marketing Mastery',
  'draft',
  'public',
  'Seminar satu hari tentang strategi digital marketing terbaru. Cocok untuk pelaku UMKM dan profesional yang ingin meningkatkan kemampuan marketing online.',
  'Seminar strategi digital marketing terbaru.',
  'Marketing Team',
  'from-purple-400 to-pink-500',
  '["100 Peserta", "1 Hari", "Hands-on Workshop"]',
  100,
  500000,
  350000,
  '2025-01-10',
  '["Transfer Bank", "OVO", "DANA"]',
  false
);

-- ============================================
-- Insert Sample Participants
-- ============================================
INSERT INTO participants (id, event_id, name, email, phone, company, position, registration_date, status) VALUES
('p-001-0000-0000-0000-000000000001', 'evt-001-0000-0000-0000-000000000001', 'Andi Wijaya', 'andi.wijaya@email.com', '081234567890', 'PT IndoTech', 'HR Manager', '2024-08-01', 'attended'),
('p-001-0000-0000-0000-000000000002', 'evt-001-0000-0000-0000-000000000001', 'Budi Santoso', 'budi.s@email.com', '081234567891', 'StartupXYZ', 'Team Leader', '2024-08-02', 'attended'),
('p-001-0000-0000-0000-000000000003', 'evt-001-0000-0000-0000-000000000001', 'Rina Dewi', 'rina.dewi@email.com', '081234567892', 'PT Maju Bersama', 'Supervisor', '2024-08-03', 'attended'),
('p-002-0000-0000-0000-000000000001', 'evt-002-0000-0000-0000-000000000002', 'Jessica Chen', 'jessica.chen@email.com', '081234567893', 'CorpABC', 'Department Head', '2024-09-01', 'attended'),
('p-002-0000-0000-0000-000000000002', 'evt-002-0000-0000-0000-000000000002', 'Michael Tan', 'michael.tan@email.com', '081234567894', 'TechCorp', 'Senior Manager', '2024-09-02', 'attended'),
('p-003-0000-0000-0000-000000000001', 'evt-003-0000-0000-0000-000000000003', 'Dewi Lestari', 'dewi.lestari@email.com', '081234567895', 'Sanrays', 'Senior Lead', '2024-10-15', 'confirmed'),
('p-003-0000-0000-0000-000000000002', 'evt-003-0000-0000-0000-000000000003', 'Ahmad Fadillah', 'ahmad.f@email.com', '081234567896', 'Sanrays', 'Lead', '2024-10-16', 'confirmed');

-- ============================================
-- Insert Sample Checklists
-- ============================================
INSERT INTO checklists (id, event_id, category, task, pic, status, due_date, priority, notes) VALUES
('cl-001-0000-0000-0000-000000000001', 'evt-003-0000-0000-0000-000000000003', 'acara', 'Booking villa untuk 30 orang', 'Dewi', 'completed', '2024-10-20', 'high', 'Sudah dibooking via travel agent'),
('cl-001-0000-0000-0000-000000000002', 'evt-003-0000-0000-0000-000000000003', 'konsumsi', 'Siapkan menu makan 3 hari 2 malam', 'Kitchen Team', 'in_progress', '2024-10-25', 'high', 'Minta menu vegetarian juga'),
('cl-001-0000-0000-0000-000000000003', 'evt-003-0000-0000-0000-000000000003', 'transportasi', 'Sewa 2 bus untuk transportasi', 'HR', 'pending', '2024-10-28', 'high', 'Estimasi 30 pax + 5 crew'),
('cl-001-0000-0000-0000-000000000004', 'evt-003-0000-0000-0000-000000000003', 'perlengkapan', 'Siapkan alat outbound', 'Logistics', 'pending', '2024-11-01', 'normal', 'Contact vendor outbound'),
('cl-001-0000-0000-0000-000000000005', 'evt-003-0000-0000-0000-000000000003', 'dokumentasi', 'Booking fotografer', 'Marketing', 'pending', '2024-11-05', 'normal', ''),
('cl-004-0000-0000-0000-000000000001', 'evt-004-0000-0000-0000-000000000004', 'acara', 'Booking aula', 'Marketing Team', 'pending', '2025-01-01', 'urgent', ''),
('cl-004-0000-0000-0000-000000000002', 'evt-004-0000-0000-0000-000000000004', 'acara', 'Booking sound system', 'Marketing Team', 'pending', '2025-01-10', 'normal', ''),
('cl-004-0000-0000-0000-000000000003', 'evt-004-0000-0000-0000-000000000004', 'humas', 'Promosi di social media', 'Marketing Team', 'pending', '2025-01-05', 'high', '');

-- ============================================
-- Insert Sample Transactions
-- ============================================
INSERT INTO transactions (id, event_id, category, type, amount, description, vendor, transaction_date, status) VALUES
('tx-001-0000-0000-0000-000000000001', 'evt-001-0000-0000-0000-000000000001', 'income', 'Registrasi Peserta', 70500000, 'Total dari 47 peserta x 1.5jt', NULL, '2024-09-15', 'paid'),
('tx-001-0000-0000-0000-000000000002', 'evt-001-0000-0000-0000-000000000001', 'expense', 'Sewa Venue', 10000000, 'Hotel Mulia - 2 hari', 'Hotel Mulia', '2024-09-01', 'paid'),
('tx-001-0000-0000-0000-000000000003', 'evt-001-0000-0000-0000-000000000001', 'expense', 'Konsumsi', 5000000, 'Coffee break + lunch 47 pax', 'Catering XYZ', '2024-09-15', 'paid'),
('tx-001-0000-0000-0000-000000000004', 'evt-001-0000-0000-0000-000000000001', 'expense', 'Honor Pemateri', 1500000, '2 pemateri x 750rb', NULL, '2024-09-15', 'paid'),
('tx-002-0000-0000-0000-000000000001', 'evt-002-0000-0000-0000-000000000002', 'income', 'Registrasi Peserta', 112000000, 'Total dari 32 peserta x 3.5jt', NULL, '2024-10-01', 'pending'),
('tx-002-0000-0000-0000-000000000002', 'evt-002-0000-0000-0000-000000000002', 'expense', 'Konsumsi', 16000000, '5 hari x 32 pax', 'Catering ABC', '2024-09-25', 'paid'),
('tx-002-0000-0000-0000-000000000003', 'evt-002-0000-0000-0000-000000000002', 'expense', 'Material Workshop', 5000000, 'Print modul + stationery', 'Office Depot', '2024-09-20', 'paid'),
('tx-003-0000-0000-0000-000000000001', 'evt-003-0000-0000-0000-000000000003', 'expense', 'Sewa Villa', 15000000, '3 hari 2 malam', 'Villa Bintang', '2024-10-15', 'paid'),
('tx-003-0000-0000-0000-000000000002', 'evt-003-0000-0000-0000-000000000003', 'expense', 'Transportasi', 5000000, 'Sewa bus', 'PO Sumber Jaya', '2024-10-20', 'pending');

-- ============================================
-- Insert Sample Documents
-- ============================================
INSERT INTO documents (id, event_id, category, name, description, uploaded_by) VALUES
('doc-001-0000-0000-0000-000000000001', 'evt-001-0000-0000-0000-000000000001', 'sertifikat', 'Template Sertifikat Workshop', 'Template sertifikat editable', 'Admin'),
('doc-001-0000-0000-0000-000000000002', 'evt-001-0000-0000-0000-000000000001', 'materi', 'Modul Public Speaking.pdf', 'Modul lengkap 50 halaman', 'Admin'),
('doc-001-0000-0000-0000-000000000003', 'evt-001-0000-0000-0000-000000000001', 'foto', 'Dokumentasi Event 1', 'Foto-foto workshop day 1 & 2', 'Admin'),
('doc-002-0000-0000-0000-000000000001', 'evt-002-0000-0000-0000-000000000002', 'materi', 'Leadership Framework.pdf', 'Kerangka kerja kepemimpinan', 'Admin');

-- ============================================
-- Insert Sample Feedback
-- ============================================
INSERT INTO feedback (id, event_id, participant_name, participant_email, rating_overall, rating_content, rating_facility, rating_pemateri, comments, suggestions) VALUES
('fb-001-0000-0000-0000-000000000001', 'evt-001-0000-0000-0000-000000000001', 'Andi Wijaya', 'andi.wijaya@email.com', 5.0, 5.0, 4.0, 5.0, 'Workshop sangat bermanfaat! Teknik public speaking yang diajarkan langsung bisa saya praktikkan.', 'Saran:，下次多加一些实际演练环节'),
('fb-001-0000-0000-0000-000000000002', 'evt-001-0000-0000-0000-000000000001', 'Rina Dewi', 'rina.dewi@email.com', 4.5, 5.0, 4.5, 4.0, 'Materinya sangat komprehensif. Pemateri juga sangat berpengalaman.', 'Semoga ada workshop lanjutan untuk level intermediate.'),
('fb-002-0000-0000-0000-000000000001', 'evt-002-0000-0000-0000-000000000002', 'Jessica Chen', 'jessica.chen@email.com', 4.5, 4.0, 5.0, 5.0, 'Kelas coaching ini memberikan perspective baru tentang kepemimpinan. Sangat recommended untuk para leader!', 'Waktu 5 hari mungkin bisa ditambah untuk lebih deep dive.');

-- ============================================
-- Insert Sample Evaluations (Pre/Post Test)
-- ============================================
INSERT INTO evaluations (id, event_id, participant_id, test_type, score, answers, submitted_at) VALUES
('eval-001-0000-0000-0000-000000000001', 'evt-001-0000-0000-0000-000000000001', 'p-001-0000-0000-0000-000000000001', 'pre_test', 55, '{"q1":"b","q2":"a","q3":"c","q4":"b","q5":"a"}', '2024-09-15 08:00:00'),
('eval-001-0000-0000-0000-000000000002', 'evt-001-0000-0000-0000-000000000001', 'p-001-0000-0000-0000-000000000001', 'post_test', 85, '{"q1":"a","q2":"a","q3":"a","q4":"a","q5":"a"}', '2024-09-16 16:00:00'),
('eval-001-0000-0000-0000-000000000003', 'evt-001-0000-0000-0000-000000000001', 'p-001-0000-0000-0000-000000000002', 'pre_test', 60, '{"q1":"c","q2":"b","q3":"b","q4":"c","q5":"a"}', '2024-09-15 08:00:00'),
('eval-001-0000-0000-0000-000000000004', 'evt-001-0000-0000-0000-000000000001', 'p-001-0000-0000-0000-000000000002', 'post_test', 80, '{"q1":"a","q2":"a","q3":"a","q4":"a","q5":"b"}', '2024-09-16 16:00:00');

-- ============================================
-- Insert Sample Budgets
-- ============================================
INSERT INTO budgets (id, event_id, category, planned_amount, actual_amount, notes) VALUES
('budget-001-0000-0000-0000-000000000001', 'evt-001-0000-0000-0000-000000000001', 'Venue', 15000000, 10000000, 'Budget untuk sewa venue dan ruangan'),
('budget-001-0000-0000-0000-000000000002', 'evt-001-0000-0000-0000-000000000001', 'Konsumsi', 8000000, 5000000, 'Budget untuk coffee break dan lunch'),
('budget-001-0000-0000-0000-000000000003', 'evt-001-0000-0000-0000-000000000001', 'Honor Pemateri', 3000000, 1500000, 'Budget untuk fee pemateri'),
('budget-001-0000-0000-0000-000000000004', 'evt-001-0000-0000-0000-000000000001', 'Marketing', 5000000, 3500000, 'Budget untuk promosi event'),
('budget-002-0000-0000-0000-000000000001', 'evt-002-0000-0000-0000-000000000002', 'Venue', 10000000, 5000000, 'Pakai kantor sendiri'),
('budget-002-0000-0000-0000-000000000002', 'evt-002-0000-0000-0000-000000000002', 'Konsumsi', 25000000, 16000000, '5 hari x 32 pax'),
('budget-002-0000-0000-0000-000000000003', 'evt-002-0000-0000-0000-000000000002', 'Material', 8000000, 5000000, 'Modul dan stationery');

-- ============================================
-- DONE!
-- ============================================
