-- ============================================
-- SANRAYS EVENT DASHBOARD - Complete Seed Data
-- Run SETELAH mysql-schema.sql
-- ============================================

USE sanrays_event;

-- ============================================
-- USERS (password: admin123 untuk semua)
-- ============================================

-- Super Admin
INSERT INTO users (id, name, email, password_hash, role) VALUES
('usr-0001', 'Ahmad Rizki Pratama', 'ahmad@sanrays.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewKyDA0v9V3fH3V6', 'super_admin'),
-- Admin
('usr-0002', 'Sarah Putri Melinda', 'sarah@sanrays.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewKyDA0v9V3fH3V6', 'admin'),
('usr-0003', 'Budi Santoso', 'budi@sanrays.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewKyDA0v9V3fH3V6', 'admin'),
-- Event Manager
('usr-0004', 'Diana Wulandari', 'diana@sanrays.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewKyDA0v9V3fH3V6', 'event_manager'),
('usr-0005', 'Eko Prasetyo', 'eko@sanrays.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewKyDA0v9V3fH3V6', 'event_manager'),
('usr-0006', 'Fitri Handayani', 'fitri@sanrays.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewKyDA0v9V3fH3V6', 'event_manager'),
-- Finance
('usr-0007', 'Gunawan Hidayat', 'gunawan@sanrays.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewKyDA0v9V3fH3V6', 'finance'),
('usr-0008', 'Esti Kumala', 'esti@sanrays.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewKyDA0v9V3fH3V6', 'finance'),
-- Stakeholder
('usr-0009', 'Irwan Dharmawan', 'irwan@sanrays.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewKyDA0v9V3fH3V6', 'stakeholder'),
('usr-0010', 'Juniarty', 'juniarty@sanrays.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewKyDA0v9V3fH3V6', 'stakeholder');

-- ============================================
-- EVENTS
-- ============================================

INSERT INTO events (id, name, date, end_date, location, theme, status, event_type, description, short_description, organizer, cover_gradient, highlights, max_participants, price, early_bird_price, early_bird_deadline, payment_methods, published) VALUES

-- Event 1: Completed
('evt-001', 'Workshop Public Speaking Profesional', '2024-03-15', '2024-03-16', 'Hotel Mulia Jakarta', 'Speak With Confidence', 'completed', 'public', 'Workshop intensif 2 hari teknik public speaking dengan pemateri profesional. Peserta belajar dari dasar hingga advanced. Include hands-on practice dan sesi feedback langsung.', 'Workshop 2 hari public speaking dari basics', 'Ahmad Rizki', 'from-orange-400 to-orange-600', '["47 Peserta", "CSAT 4.6", "+19 Poin Test Score"]', 50, 1500000, 1200000, '2024-03-01', '["Transfer Bank", "OVO", "DANA"]', true),

-- Event 2: Active
('evt-002', 'Kelas Coaching Batch 8', '2024-06-01', '2024-06-05', 'Sanrays Office', 'Leadership Mastery', 'active', 'public', 'Program coaching leadership 5 hari intensive. Peserta dapat modul, assessment, dan follow-up session.', 'Program coaching 5 hari leadership development', 'Sarah Putri', 'from-blue-400 to-blue-600', '["32 Peserta", "5 Hari", "Assessment Report"]', 40, 3500000, 2800000, '2024-05-15', '["Transfer Bank", "Kartu Kredit"]', true),

-- Event 3: Preparation
('evt-003', 'Team Building Q2 2025', '2025-06-20', '2025-06-22', 'Villa Bintang Puncak', 'Unity & Trust', 'preparation', 'internal', 'Team building 3 hari 2 malam outdoor activities, workshop, dan refleksi. Untuk mempererat tim Sanrays.', 'Team building 3H2M outdoor bonding', 'Diana Wulandari', 'from-emerald-400 to-emerald-600', '["25 Staff", "3H2M", "Outdoor"]', 30, 0, NULL, NULL, '[]', true),

-- Event 4: Draft
('evt-004', 'Seminar Digital Marketing 2025', '2025-08-10', '2025-08-10', 'Aula Utama UI', 'Digital Marketing Mastery', 'draft', 'public', 'Seminar 1 hari full day dengan praktisi digital marketing. Include workshop.\n Materi: SEO, social media, content strategy, ads optimization.', 'Seminar digital marketing full day', 'Fitri Handayani', 'from-purple-400 to-pink-500', '["100 Kuota", "1 Hari", "Workshop Hands-on"]', 100, 500000, 350000, '2025-07-01', '["Transfer", "OVO", "DANA"]', false),

-- Event 5: Completed
('evt-005', 'Workshop Effective Communication', '2024-01-20', '2024-01-20', 'Gedung Serbaguna Jakarta', ' Communicate With Impact', 'completed', 'public', 'Workshop satu hari intensive communication skills. Focus pada presentasi, negosiasi, dan interpersonal.', 'Komunikasi efektif 1 hari', 'Budi Santoso', 'from-amber-400 to-orange-500', '["35 Peserta", "1 Hari", "Roleplay Session"]', 40, 750000, NULL, NULL, '["Transfer Bank"]', true),

-- Event 6: Completed
('evt-006', 'Leadership Bootcamp Batch 3', '2024-09-05', '2024-09-07', 'Resort Lembang', 'Lead With Purpose', 'completed', 'internal', 'Bootcamp 3 hari 2 malam untuk team lead. Include assessment, coaching session, dan action plan.', 'Leadership bootcamp 3H2M untuk team leads', 'Ahmad Rizki', 'from-indigo-400 to-purple-600', '["20 Team Leads", "3H2M", "Assessment"]', 25, 0, NULL, NULL, '[]', true),

-- Event 7: Cancelled
('evt-007', 'Tech Talk AI Basics', '2025-05-15', '2025-05-15', 'Online Zoom', 'Getting Started With AI', 'cancelled', 'public', 'Webinar online AI basics untuk pemula. Include demo dan Q&A.', 'AI basics webinar online', 'Fitri Handayani', 'from-cyan-400 to-blue-500', '["Online", "1 Session", "Beginner Friendly"]', 200, 0, NULL, NULL, '[]', false),

-- Event 8: Preparation
('evt-008', 'Annual Company Gathering 2025', '2025-12-15', '2025-12-17', 'Beach Resort Ancol', 'One Team One Dream', 'preparation', 'internal', 'Annual gathering 3 hari 2 malam. Include team activities, sharing session, dan celebration.', 'Annual gathering all-hands 3H2M', 'Sarah Putri', 'from-orange-400 to-red-500', '["All Staff", "3H2M", "Beach Resort"]', 150, 0, NULL, NULL, '[]', false);

-- ============================================
-- PARTICIPANTS
-- ============================================

INSERT INTO participants (id, event_id, name, email, phone, company, position, gender, age_group, city, registration_date, status) VALUES
-- evt-001 Participants
('p-001', 'evt-001', 'Rina Wati', 'rina.wati@indo-tech.co.id', '081234567890', 'Indo Technology', 'HR Manager', 'Perempuan', '25-35', 'Jakarta', '2024-02-01', 'attended'),
('p-002', 'evt-001', 'Bayu Firmansyah', 'bayu.firmansyah@startupxyz.com', '081234567891', 'StartupXYZ', 'Product Manager', 'Laki-laki', '25-35', 'Jakarta', '2024-02-02', 'attended'),
('p-003', 'evt-001', 'Maya Putri', 'maya.putri@corp-abc.com', '081234567892', 'Corp ABC', 'Marketing Lead', 'Perempuan', '25-35', 'Bandung', '2024-02-03', 'attended'),
('p-004', 'evt-001', 'Dimas Pratama', 'dimas.pratama@email.com', '081234567893', 'Freelancer', 'Public Speaker', 'Laki-laki', '30-40', 'Surabaya', '2024-02-04', 'attended'),
('p-005', 'evt-001', 'Sari Dewi', 'sari.dewi@pt-maju.com', '081234567894', 'PT Maju Bersama', 'Supervisor', 'Perempuan', '25-35', 'Jakarta', '2024-02-05', 'attended'),
('p-006', 'evt-001', 'Fajar Nugroho', 'fajar.nugroho@consultant-id.com', '081234567895', 'Consultant ID', 'Senior Consultant', 'Laki-laki', '30-40', 'Jakarta', '2024-02-06', 'attended'),
('p-007', 'evt-001', 'Lina Marlina', 'lina.marlina@digital-nusantara.com', '081234567896', 'Digital Nusantara', 'Content Creator', 'Perempuan', '20-30', 'Yogyakarta', '2024-02-07', 'confirmed'),
('p-008', 'evt-001', 'Andi Cahyono', 'andi.cahyono@build-tech.io', '081234567897', 'BuildTech', 'Tech Lead', 'Laki-laki', '30-40', 'Semarang', '2024-02-08', 'attended'),
('p-009', 'evt-001', 'Rizky Ramadhan', 'rizky.ramadhan@media-group.com', '081234payload', 'Media Group', 'Reporter', 'Laki-laki', '25-35', 'Jakarta', '2024-02-09', 'attended'),
('p-010', 'evt-001', 'Anisa Zahra', 'anisa.zahra@univ-indonesia.ac.id', '081234567899', 'Universitas Indonesia', 'Dosen', 'Perempuan', '30-40', 'Depok', '2024-02-10', 'attended'),
-- evt-002 Participants
('p-011', 'evt-002', 'Hendra Wijaya', 'hendra.wijaya@pt-indah.com', '081234567900', 'PT Indah Jaya', 'Department Head', 'Laki-laki', '30-40', 'Jakarta', '2024-05-01', 'attended'),
('p-012', 'evt-002', 'Lisa Permata', 'lisa.permata@sanrays.com', '081234567901', 'Sanrays', 'Team Lead', 'Perempuan', '25-35', 'Jakarta', '2024-05-02', 'attended'),
('p-013', 'evt-002', 'Michael Tan', 'michael.tan@corp-abc.com', '081234567902', 'Corp ABC', 'Senior Manager', 'Laki-laki', '35-45', 'Jakarta', '2024-05-03', 'attended'),
('p-014', 'evt-002', 'Jessica Chen', 'jessica.chen@tech-corp.io', '081234567903', 'TechCorp', 'VP Engineering', 'Perempuan', '35-45', 'Jakarta', '2024-05-04', 'attended'),
('p-015', 'evt-002', 'Robert Lee', 'robert.lee@startup-id.com', '081234567904', 'Startup Indonesia', 'Founder', 'Laki-laki', '30-40', 'Jakarta', '2024-05-05', 'confirmed'),
('p-016', 'evt-002', 'Sari Dewi', 'sari.dewi@pt-maju.com', '081234567905', 'PT Maju', 'HR Manager', 'Perempuan', '30-40', 'Jakarta', '2024-05-06', 'attended'),
('p-017', 'evt-002', 'Bayu Firmansyah', 'bayu.firm@startupxyz.com', '081234567906', 'StartupXYZ', 'Product Manager', 'Laki-laki', '25-35', 'Jakarta', '2024-05-07', 'attended'),
-- evt-003 Participants (Internal Staff)
('p-018', 'evt-003', 'Tommy Sutedjo', 'tommy.sutedjo@sanrays.com', '081234567907', 'Sanrays', 'Senior Lead', 'Laki-laki', '30-40', 'Jakarta', '2024-06-01', 'confirmed'),
('p-019', 'evt-003', 'Nina Hartono', 'nina.hartono@sanrays.com', '081234567908', 'Sanrays', 'Lead', 'Perempuan', '25-35', 'Jakarta', '2024-06-02', 'confirmed'),
('p-020', 'evt-003', 'Dedi Kurniawan', 'dedi.kurniawan@sanrays.com', '081234567909', 'Sanrays', 'Specialist', 'Laki-laki', '25-35', 'Bandung', '2024-06-03', 'confirmed'),
('p-021', 'evt-003', 'Wati Rohmah', 'wati.rohmah@sanrays.com', '081234567910', 'Sanrays', 'Coordinator', 'Perempuan', '20-30', 'Jakarta', '2024-06-04', 'registered'),
('p-022', 'evt-003', 'Asep Sukma', 'asep.sukma@sanrays.com', '081234567911', 'Sanrays', 'Officer', 'Laki-laki', '20-30', 'Depok', '2024-06-05', 'registered');

-- ============================================
-- CHECKLISTS
-- ============================================

INSERT INTO checklists (id, event_id, category, task, pic, status, due_date, priority) VALUES
-- evt-001 Checklists
('cl-001', 'evt-001', 'acara', 'Booking Hotel Mulia 2 hari full board', 'Sarah', 'completed', '2024-02-01', 'urgent'),
('cl-002', 'evt-001', 'acara', 'Susun rundown acara', 'Sarah', 'completed', '2024-02-15', 'high'),
('cl-003', 'evt-001', 'acara', 'Booking MC dan moderator', 'Diana', 'completed', '2024-02-20', 'normal'),
('cl-004', 'evt-001', 'konsumsi', 'Kontrak catering lunch + coffee break', 'Wati', 'completed', '2024-02-10', 'high'),
('cl-005', 'evt-001', 'konsumsi', 'Siapkan snack box peserta', 'Wati', 'completed', '2024-03-10', 'normal'),
('cl-006', 'evt-001', 'perlengkapan', 'Booking sound system + LCD', 'Dedi', 'completed', '2024-02-15', 'high'),
('cl-007', 'evt-001', 'perlengkapan', 'Print materi + sertifikat', 'Dedi', 'completed', '2024-03-05', 'normal'),
('cl-008', 'evt-001', 'humas', 'Desain poster + banner', 'Nina', 'completed', '2024-01-20', 'high'),
('cl-009', 'evt-001', 'humas', 'Posting social media campaign', 'Nina', 'completed', '2024-02-01', 'normal'),
('cl-010', 'evt-001', 'keuangan', 'Approval budget', 'Gunawan', 'completed', '2024-01-15', 'urgent'),
-- evt-002 Checklists
('cl-011', 'evt-002', 'acara', 'Booking ruangan + setup 5 hari', 'Diana', 'completed', '2024-04-15', 'urgent'),
('cl-012', 'evt-002', 'acara', 'Susun rundown 5 hari', 'Diana', 'in_progress', '2024-05-15', 'high'),
('cl-013', 'evt-002', 'konsumsi', 'Kontrak catering harian + menu planning', 'Wati', 'pending', '2024-05-20', 'high'),
('cl-014', 'evt-002', 'perlengkapan', 'Siapkan modul + stationery pack', 'Dedi', 'pending', '2024-05-25', 'normal'),
-- evt-003 Checklists
('cl-015', 'evt-003', 'acara', 'Booking villa + accommodation', 'Diana', 'completed', '2024-12-01', 'urgent'),
('cl-016', 'evt-003', 'acara', 'Susun rundown 3 hari', 'Diana', 'in_progress', '2025-06-01', 'high'),
('cl-017', 'evt-003', 'transportasi', 'Sewa bus + antar jemput', 'Dedi', 'pending', '2025-06-10', 'high'),
('cl-018', 'evt-003', 'konsumsi', 'Kontrak menu 3H2M full board', 'Wati', 'pending', '2025-06-05', 'high'),
('cl-019', 'evt-003', 'perlengkapan', 'Booking outdoor activities vendor', 'Dedi', 'pending', '2025-05-20', 'normal'),
-- evt-008 Checklists
('cl-020', 'evt-008', 'acara', 'Booking gedung + sound system', 'Diana', 'pending', '2025-07-01', 'urgent'),
('cl-021', 'evt-008', 'humas', 'Promosi di social media', 'Nina', 'pending', '2025-06-15', 'high'),
('cl-022', 'evt-008', 'dokumentasi', 'Siapkan dokumentasi event', 'Dedi', 'pending', '2025-08-01', 'normal');

-- ============================================
-- TRANSACTIONS
-- ============================================

INSERT INTO transactions (id, event_id, category, type, amount, description, vendor, transaction_date, status) VALUES
-- evt-001 Income
('tx-001', 'evt-001', 'income', 'Registrasi Peserta', 70500000, 'Total 47 peserta x 1.5jt', NULL, '2024-03-15', 'paid'),
-- evt-001 Expense
('tx-002', 'evt-001', 'expense', 'Venue Hotel Mulia', 10000000, '2 hari full board', 'Hotel Mulia Jakarta', '2024-02-28', 'paid'),
('tx-003', 'evt-001', 'expense', 'Catering Lunch + Break', 5000000, '47 pax x 2 hari', 'Catering Bu Sri', '2024-03-14', 'paid'),
('tx-004', 'evt-001', 'expense', 'Honor Pemateri', 2000000, '2 pemateri x 1jt', 'Rina Wati + Dimas', '2024-03-16', 'paid'),
('tx-005', 'evt-001', 'expense', 'Sound System + LCD', 1500000, 'Paket lengkap', 'AV Indonesia', '2024-03-14', 'paid'),
('tx-006', 'evt-001', 'expense', 'Materi Cetak + Sertifikat', 800000, 'Print modul + sertifikat', 'PrintZone', '2024-03-10', 'paid'),
('tx-007', 'evt-001', 'expense', 'Banner + Backdrop', 1200000, '3 banner besar', 'BannerPro', '2024-03-01', 'paid'),
-- evt-002 Income
('tx-008', 'evt-002', 'income', 'Registrasi Batch 8', 112000000, '32 peserta x 3.5jt', NULL, '2024-06-05', 'pending'),
-- evt-002 Expense
('tx-009', 'evt-002', 'expense', 'Ruangan 5 hari', 5000000, 'Office Sanrays', 'Sanrays Office', '2024-05-01', 'paid'),
('tx-010', 'evt-002', 'expense', 'Catering harian', 16000000, '5 hari x 32 pax', 'Catering Bu Wati', '2024-06-05', 'paid'),
('tx-011', 'evt-002', 'expense', 'Modul + Stationery', 2000000, '32 pack modul', 'PrintHub', '2024-05-20', 'paid'),
('tx-012', 'evt-002', 'expense', 'Sound system', 3000000, 'Daily rate 5 hari', 'AudioPro', '2024-05-25', 'pending'),
-- evt-003 Income
('tx-013', 'evt-003', 'income', 'Budget Internal', 50000000, 'Annual budget team building', NULL, '2025-01-01', 'approved'),
-- evt-003 Expense
('tx-014', 'evt-003', 'expense', 'Villa Booking', 20000000, '3H2M full board', 'Villa Bintang Puncak', '2024-12-01', 'paid'),
('tx-015', 'evt-003', 'expense', 'Outdoor Activities', 10000000, 'Team building games', 'OutdoorFun Indonesia', '2025-06-10', 'pending'),
-- evt-008 Income
('tx-016', 'evt-008', 'income', 'Registrasi', 25000000, '50 peserta x 500rb', NULL, '2025-08-10', 'pending');

-- ============================================
-- DOCUMENTS
-- ============================================

INSERT INTO documents (id, event_id, category, name, description, uploaded_by) VALUES
('doc-001', 'evt-001', 'sertifikat', 'Template Sertifikat Workshop', 'Editable template PPTX', 'Sarah'),
('doc-002', 'evt-001', 'materi', 'Modul Public Speaking.pdf', 'Modul 50 halaman full pack', 'Diana'),
('doc-003', 'evt-001', 'foto', 'Dokumentasi Event', 'Foto + video highlights', 'Dedi'),
('doc-004', 'evt-001', 'lpj', 'LPJ Workshop Public Speaking', 'Laporan pertanggungjawaban event', 'Gunawan'),
('doc-005', 'evt-002', 'materi', 'Modul Coaching.pdf', 'Leadership module 5 hari', 'Diana'),
('doc-006', 'evt-002', 'lpj', 'LPJ Coaching Batch 8', 'Laporan pertanggungjawaban event', 'Gunawan'),
('doc-007', 'evt-003', 'lpj', 'Proposal Team Building', 'Proposal + budget plan', 'Diana'),
('doc-008', 'evt-005', 'sertifikat', 'Template Sertifikat', 'Editable template', 'Sarah'),
('doc-009', 'evt-005', 'materi', 'Materi Communication.pdf', 'Workshop deck + handout', 'Diana');

-- ============================================
-- FEEDBACK
-- ============================================

INSERT INTO feedback (id, event_id, participant_name, participant_email, rating_overall, rating_content, rating_facility, rating_pemateri, comments, suggestions) VALUES
('fb-001', 'evt-001', 'Rina Wati', 'rina.wati@indo-tech.co.id', 5.0, 5.0, 4.5, 5.0, 'Workshop sangat bermanfaat. Pematerinya engaging dan materi praktis.', 'Tambah sesi practice lebih banyak.'),
('fb-002', 'evt-001', 'Bayu Firmansyah', 'bayu.firm@startupxyz.com', 4.5, 5.0, 4.0, 4.5, 'Materinya solid. Worth it untuk investment.', 'Durasi bisa ditambah jadi 3 hari.'),
('fb-003', 'evt-001', 'Maya Putri', 'maya.putri@corp-abc.com', 5.0, 4.5, 5.0, 5.0, 'Sempurna execution,venue oke, materi relevant.', 'Lagi-lagi bagus.'),
('fb-004', 'evt-001', 'Dimas Pratama', 'dimas.pratama@email.com', 4.0, 4.5, 4.0, 4.0, 'Good content, facilitator berpengalaman.', 'Semoga ada workshop lanjutan.'),
('fb-005', 'evt-002', 'Hendra Wijaya', 'hendra.wijaya@pt-indah.com', 4.5, 4.0, 5.0, 4.5, 'Kelasnya immersive. Action plan sangat actionable.', 'Follow-up session quarterly.'),
('fb-006', 'evt-002', 'Lisa Permata', 'lisa.permata@sanrays.com', 5.0, 5.0, 5.0, 5.0, 'Best coaching session yang pernah ikut.', 'Saran: alumni network needed.'),
('fb-007', 'evt-005', 'Fajar Nugroho', 'fajar.nugroho@consultant-id.com', 4.0, 4.0, 4.5, 4.5, 'Communication toolkit praktis langsung bisa diaplikasikan.', 'Workshop lanjutan advanced.');

-- ============================================
-- ATTENDANCE
-- ============================================

INSERT INTO attendance (id, event_id, participant_id, session_name, date, status, notes) VALUES
('att-001', 'evt-001', 'p-001', 'Workshop Day 1', '2024-03-15', 'present', NULL),
('att-002', 'evt-001', 'p-002', 'Workshop Day 1', '2024-03-15', 'present', NULL),
('att-003', 'evt-001', 'p-003', 'Workshop Day 1', '2024-03-15', 'present', NULL),
('att-004', 'evt-001', 'p-004', 'Workshop Day 1', '2024-03-15', 'present', NULL),
('att-005', 'evt-001', 'p-005', 'Workshop Day 1', '2024-03-15', 'present', NULL),
('att-006', 'evt-001', 'p-006', 'Workshop Day 1', '2024-03-15', 'late', 'Terlambat 15 menit'),
('att-007', 'evt-001', 'p-007', 'Workshop Day 1', '2024-03-15', 'absent', 'Konfirmasi izin'),
('att-008', 'evt-001', 'p-001', 'Workshop Day 2', '2024-03-16', 'present', NULL),
('att-009', 'evt-001', 'p-002', 'Workshop Day 2', '2024-03-16', 'present', NULL),
('att-010', 'evt-001', 'p-003', 'Workshop Day 2', '2024-03-16', 'present', NULL);

-- ============================================
-- BUDGETS
-- ============================================

INSERT INTO budgets (id, event_id, category, planned_amount, actual_amount, notes) VALUES
('bg-001', 'evt-001', 'Venue', 15000000, 10000000, 'Budget venue + ruangan'),
('bg-002', 'evt-001', 'Konsumsi', 8000000, 5000000, 'Lunch + coffee break 2 hari'),
('bg-003', 'evt-001', 'Honor', 3000000, 2500000, 'Fee pemateri + MC'),
('bg-004', 'evt-001', 'Marketing', 5000000, 3000000, 'Promosi + dokumentasi'),
('bg-005', 'evt-002', 'Venue', 10000000, 5000000, 'Pakai kantor sendiri - cost center internal'),
('bg-006', 'evt-002', 'Konsumsi', 25000000, 16000000, '5 hari full board'),
('bg-007', 'evt-002', 'Material', 8000000, 2000000, 'Modul + stationery + tools'),
('bg-008', 'evt-003', 'Venue', 30000000, 20000000, 'Villa + accommodation'),
('bg-009', 'evt-003', 'Activities', 15000000, 0, 'Outdoor games + facilitator'),
('bg-010', 'evt-003', 'Transport', 8000000, 0, 'Bus + antar jemput');

-- ============================================
-- Evaluations (Pre/Post Test Scores)
-- ============================================

INSERT INTO evaluations (id, event_id, participant_id, test_type, score, answers, submitted_at) VALUES
('ev-001', 'evt-001', 'p-001', 'pre_test', 55, '{"q1":"b","q2":"a","q3":"c"}', '2024-03-15 08:00:00'),
('ev-002', 'evt-001', 'p-001', 'post_test', 85, '{"q1":"a","q2":"a","q3":"a"}', '2024-03-16 16:00:00'),
('ev-003', 'evt-001', 'p-002', 'pre_test', 60, '{"q1":"c","q2":"b","q3":"b"}', '2024-03-15 08:00:00'),
('ev-004', 'evt-001', 'p-002', 'post_test', 80, '{"q1":"a","q2":"a","q3":"a"}', '2024-03-16 16:00:00'),
('ev-005', 'evt-002', 'p-011', 'pre_test', 50, '{"q1":"b","q2":"c","q3":"b"}', '2024-06-01 08:00:00'),
('ev-006', 'evt-002', 'p-011', 'post_test', 75, '{"q1":"a","q2":"a","q3":"a"}', '2024-06-05 17:00:00'),
('ev-007', 'evt-002', 'p-012', 'pre_test', 58, '{"q1":"b","q2":"b","q3":"c"}', '2024-06-01 08:00:00'),
('ev-008', 'evt-002', 'p-012', 'post_test', 78, '{"q1":"a","q2":"a","q3":"a"}', '2024-06-05 17:00:00');
