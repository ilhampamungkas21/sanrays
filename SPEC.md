# SPEC.md - Sanrays Integrated Event Lifecycle Dashboard

**Versi:** 1.0  
**Tanggal:** 22 Agustus 2026  
**Status:** Draft for Approval

---

## 1. Pendahuluan

### 1.1 Latar Belakang
PT Sanrays merupakan perusahaan coaching yang memiliki shareholder/stackholder. Untuk memenuhi kebutuhan transparansi pelaporan event dan keuangan, diperlukan sistem terintegrasi yang mampu menyajikan seluruh siklus event secara komprehensif, terstruktur, dan otomatis.

### 1.2 Tujuan Proyek
Membangun **Integrated Event Lifecycle Dashboard** berbasis web yang terintegrasi dengan ekosistem Google untuk:
- Monitoring persiapan event secara real-time
- Transparansi keuangan untuk shareholder
- Dokumentasi dan pelaporan terpusat
- Akses terkontrol berdasarkan role pengguna

### 1.3 Ruang Lingkup

**Include:**
- 5 Modul Dashboard sesuai brief
- Integrasi Google Sheets & Google Drive
- Role-based Access Control (RBAC)
- Dummy data template untuk struktur database
- Panduan penggunaan sistem

**Exclude (for now):**
- Mobile app
- Native Google Forms (hanya integration viewer)
- Payment gateway integration (manual input)

---

## 2. Arsitektur Teknis

### 2.1 Tech Stack

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
│                   Next.js 14 + TypeScript                       │
│              Tailwind CSS + Recharts (Charts)                    │
│              React-PDF + react-file-viewer                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       BACKEND                                   │
│              Next.js API Routes (Serverless)                     │
│              Google Sheets API v4                               │
│              Google Drive API v3                                │
│              Google Auth (OAuth 2.0)                            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DATA LAYER                                   │
│    ┌──────────────────┐    ┌──────────────────────────┐        │
│    │   Google Sheets  │    │      Google Drive        │        │
│    │   (Database)      │    │    (File Storage)        │        │
│    │   - Events        │    │    - Photos              │        │
│    │   - Participants   │    │    - Documents           │        │
│    │   - Finances      │    │    - Certificates        │        │
│    │   - Evaluations   │    │    - Invoices            │        │
│    └──────────────────┘    └──────────────────────────┘        │
│                                                              │
│    ┌──────────────────────────────────────────────────┐        │
│    │              Google Forms (Input)                │        │
│    │   - Registration Form                            │        │
│    │   - Attendance Form                              │        │
│    │   - Feedback Form                                │        │
│    └──────────────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 User Access Control Matrix

| Feature | Super Admin | Admin | Event Manager | Finance | Stakeholder |
|---------|-------------|-------|---------------|---------|-------------|
| View Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ |
| Export PDF | ✅ | ✅ | ❌ | ✅ | ✅ |
| Edit Checklist | ✅ | ✅ | ✅ | ❌ | ❌ |
| View Progress | ✅ | ✅ | ✅ | ✅ | ✅ |
| Upload Documents | ✅ | ✅ | ✅ | ❌ | ❌ |
| Input Attendance | ✅ | ✅ | ✅ | ❌ | ❌ |
| View Demografi | ✅ | ✅ | ✅ | ✅ | ✅ |
| Input Evaluasi | ✅ | ✅ | ✅ | ❌ | ❌ |
| View Feedback | ✅ | ✅ | ✅ | ✅ | ✅ |
| Input Transaksi | ✅ | ✅ | ❌ | ✅ | ❌ |
| View Laporan Keuangan | ✅ | ✅ | ❌ | ✅ | ✅ |
| View Bukti Transaksi | ✅ | ✅ | ❌ | ✅ | ✅ |
| Upload Galeri | ✅ | ✅ | ✅ | ❌ | ❌ |
| View Materi | ✅ | ✅ | ✅ | ✅ | ✅ |
| Download LPJ | ✅ | ✅ | ❌ | ✅ | ✅ |
| User Management | ✅ | ✅ | ❌ | ❌ | ❌ |
| Event Management | ✅ | ✅ | ✅ | ❌ | ❌ |

### 2.3 User Roles Definition

| Role | Deskripsi | Contoh User |
|------|-----------|-------------|
| **Super Admin** | Full access, manage all | Owner/Director |
| **Admin** | Operational management | Operations Manager |
| **Event Manager** | Manage event execution | Event Coordinator |
| **Finance** | Financial data entry & view | Finance Staff |
| **Stakeholder** | View-only for transparency | Shareholders, Board |

---

## 3. Struktur Database (Google Sheets Template)

### 3.1 Overview Sheet Structure

```
📁 SANRAYS_EVENT_DATABASE (Spreadsheet)
├── 📋 SHEET LIST
│   ├── 1. EVENTS - Daftar event
│   ├── 2. PARTICIPANTS - Data peserta
│   ├── 3. ATTENDANCE - Absensi per sesi
│   ├── 4. PRE_TEST - Nilai pre-test
│   ├── 5. POST_TEST - Nilai post-test
│   ├── 6. FEEDBACK - Feedback & CSAT
│   ├── 7. INCOME - Pemasukan
│   ├── 8. EXPENSE - Pengeluaran
│   ├── 9. CHECKLIST - Progress persiapan
│   ├── 10. ADMIN_DOCS - Dokumen administrasi
│   └── 11. USERS - User management
```

### 3.2 Detail Sheet Structures

#### 📋 SHEET 1: EVENTS

| Field | Type | Description |
|-------|------|-------------|
| event_id | String | Unique identifier (EVT001) |
| event_name | String | Nama event |
| date | Date | Tanggal mulai |
| end_date | Date | Tanggal selesai |
| location | String | Lokasi/event platform |
| theme | String | Tema utama event |
| logo_url | URL | URL logo/sponsor |
| status | Enum | draft/preparation/active/completed/cancelled |
| notes | String | Catatan tambahan |

#### 📋 SHEET 2: PARTICIPANTS

| Field | Type | Description |
|-------|------|-------------|
| participant_id | String | P001 |
| event_id | String | FK to Events |
| full_name | String | Nama lengkap |
| email | String | Email |
| phone | String | No. HP |
| company | String | Asal perusahaan |
| city | String | Kota |
| gender | Enum | Male/Female/Other |
| reg_date | Date | Tanggal registrasi |
| status | Enum | registered/confirmed/attended/cancelled/waitlist |

#### 📋 SHEET 3: ATTENDANCE

| Field | Type | Description |
|-------|------|-------------|
| event_id | String | FK to Events |
| date | Date | Tanggal sesi |
| session | String | Nama sesi |
| start_time | Time | Jam mulai |
| end_time | Time | Jam selesai |
| presenter | String | Nama pembicara |
| total_pax | Number | Total hadir |
| notes | String | Catatan |

#### 📋 SHEET 4: PRE_TEST / SHEET 5: POST_TEST

| Field | Type | Description |
|-------|------|-------------|
| participant_id | String | FK to Participants |
| event_id | String | FK to Events |
| score | Number | Nilai (0-100) |
| max_score | Number | Nilai maksimal |
| attempt_date | Date | Tanggal test |
| status | Enum | completed/absent |
| notes | String | Catatan |

#### 📋 SHEET 6: FEEDBACK

| Field | Type | Description |
|-------|------|-------------|
| participant_id | String | FK to Participants |
| event_id | String | FK to Events |
| csat_score | Number | Rating 1-5 |
| content_rating | Number | Rating 1-5 |
| presenter_rating | Number | Rating 1-5 |
| facility_rating | Number | Rating 1-5 |
| suggestion | String | Saran |

#### 📋 SHEET 7: INCOME

| Field | Type | Description |
|-------|------|-------------|
| income_id | String | INC001 |
| event_id | String | FK to Events |
| date | Date | Tanggal transaksi |
| category | Enum | ticket/sponsor/hibah/lain_lain |
| source | String | Sumber dana |
| amount | Number | Jumlah (Rupiah) |
| status | Enum | pending/confirmed/received/cancelled |
| receipt_url | URL | Link bukti |
| notes | String | Catatan |

#### 📋 SHEET 8: EXPENSE

| Field | Type | Description |
|-------|------|-------------|
| expense_id | String | EXP001 |
| event_id | String | FK to Events |
| date | Date | Tanggal transaksi |
| category | Enum | venue/pemateri/konsumsi/equipment/marketing/transportasi/dokumentasi/lain_lain |
| vendor | String | Nama vendor |
| description | String | Deskripsi |
| amount | Number | Jumlah (Rupiah) |
| status | Enum | planned/pending/paid/cancelled |
| receipt_url | URL | Link bukti |
| notes | String | Catatan |

#### 📋 SHEET 9: CHECKLIST

| Field | Type | Description |
|-------|------|-------------|
| item_id | String | CHK001 |
| event_id | String | FK to Events |
| category | Enum | acara/konsumsi/perlengkapan/humas/keuangan/lain |
| task | String | Deskripsi task |
| pic | String | Penanggung jawab |
| status | Enum | pending/in_progress/completed/cancelled |
| due_date | Date | Tenggat waktu |
| notes | String | Catatan |

#### 📋 SHEET 10: ADMIN_DOCS

| Field | Type | Description |
|-------|------|-------------|
| doc_id | String | DOC001 |
| event_id | String | FK to Events |
| doc_type | Enum | sk_panitia/proposal/mou/kontrak/izin/undangan/tor/lpj/lain |
| title | String | Judul dokumen |
| file_url | URL | Link ke Google Drive |
| uploaded_at | Date | Tanggal upload |
| notes | String | Catatan |

#### 📋 SHEET 11: USERS

| Field | Type | Description |
|-------|------|-------------|
| user_id | String | USR001 |
| email | String | Email Google |
| name | String | Nama lengkap |
| role | Enum | super_admin/admin/event_manager/finance/stakeholder |
| event_access | String | all atau specific event IDs |
| google_id | String | OAuth ID |
| created_at | Date | Tanggal dibuat |

---

## 4. Modul Spesifikasi

### 4.1 Modul 1: Executive Summary Dashboard

**Route:** `/dashboard` atau `/`

**Components:**
- Header Event (nama, tanggal, lokasi, tema, logo)
- Progress Kesiapan (progress bar + breakdown per divisi)
- Key Metrics: Anggaran vs Realisasi, Peserta target vs actual, CSAT score
- Quick Actions: View Checklist, Financial Report, Export PDF
- Press Release Preview

### 4.2 Modul 2: Pra-Event Dashboard

**Route:** `/dashboard/pre-event/[event_id]`

**Components:**
- Progress Overview (total % + task count)
- Checklist per Divisi (Acara, Konsumsi, Perlengkapan, humas)
- Task cards dengan status, PIC, due date
- Dokumen Administrasi (SK, Proposal, MoU, dll)
- Vendor & Logistik status tracker
- Tambah/Edit task functionality

### 4.3 Modul 3: Event & Peserta Dashboard

**Route:** `/dashboard/event/[event_id]`

**Components:**
- Demografi Peserta (pie charts: instansi, kota, gender)
- Absensi Real-Time (tabel per sesi dengan filter tanggal)
- Evaluasi Belajar (Pre-test vs Post-test chart, delta score)
- Feedback & CSAT (gauge, rating breakdown, suggestions)
- Interactive filter by date/session

### 4.4 Modul 4: Financial Dashboard

**Route:** `/dashboard/financial/[event_id]`

**Components:**
- Financial Summary (Total Revenue, Expense, Net Profit, Margin %)
- Pemasukan per Sumber (bar chart)
- Pengeluaran per Kategori (pie chart)
- Variansi Anggaran (RAB vs Realisasi table dengan alert)
- Bukti Transaksi (tabel dengan link preview)
- Export functionality

### 4.5 Modul 5: Pasca-Event & LPJ Dashboard

**Route:** `/dashboard/post-event/[event_id]`

**Components:**
- Event Completion Badge
- Galeri Dokumentasi (photo grid, video player)
- Pusat Materi (slides, modul, sertifikat download)
- Pusat Berkas LPJ (checklist + download)
- Press Release Editor

---

## 5. Functional Requirements Tambahan

### 5.1 File Viewer Integration
- Modal popup untuk preview PDF/image
- PDF viewer menggunakan react-pdf
- Image lightbox untuk foto
- Google Drive preview iframe untuk dokumen Office

### 5.2 Export to PDF
- Full Dashboard Summary
- Financial Report Only
- Attendance Report
- LPJ Document
- Menggunakan jspdf + html2canvas

### 5.3 Interactive Filters
- Filter absensi berdasarkan tanggal
- Filter evaluasi berdasarkan sesi
- Search functionality
- Reset filter button

---

## 6. API Endpoints

### Google Sheets Integration
```
GET  /api/events                    - List all events
GET  /api/events/[id]               - Get event details
GET  /api/events/[id]/participants  - Get participants
GET  /api/events/[id]/attendance    - Get attendance data
GET  /api/events/[id]/financial      - Get financial data
GET  /api/events/[id]/checklist      - Get checklist items
POST /api/checklist                 - Create checklist item
PATCH /api/checklist/[id]           - Update checklist item
GET  /api/drive/files               - List Drive files
GET  /api/drive/preview             - Get preview URL
```

### Authentication
```
GET  /api/auth/google               - Initiate OAuth
GET  /api/auth/callback             - OAuth callback
GET  /api/auth/me                   - Get current user
POST /api/auth/logout               - Logout
```

---

## 7. Page Routes

```
/                                  → Landing/Login
/dashboard                         → Executive Summary
/dashboard/[event_id]              → Event Quick View
/dashboard/[event_id]/pre-event    → Modul 2: Pra-Event
/dashboard/[event_id]/event        → Modul 3: Event & Peserta
/dashboard/[event_id]/financial    → Modul 4: Financial
/dashboard/[event_id]/post-event   → Modul 5: Pasca-Event
/admin                             → Admin Dashboard
/admin/events                      → Manage Events
/admin/users                       → User Management
/admin/settings                    → System Settings
```

---

## 8. Development Phases

### Phase 1: Foundation (Week 1-2)
- Project setup (Next.js, TypeScript, Tailwind)
- Google OAuth integration
- Google Sheets API connection
- Basic layout & navigation
- Authentication flow

### Phase 2: Core Modules (Week 3-5)
- Modul 1: Executive Dashboard
- Modul 2: Pra-Event Checklist
- Modul 3: Event & Peserta
- Modul 4: Financial Dashboard
- Modul 5: Pasca-Event & LPJ

### Phase 3: Advanced Features (Week 6-7)
- File viewer modal
- PDF export functionality
- Interactive filters
- Charts & visualizations
- Real-time sync optimization

### Phase 4: Polish & Deploy (Week 8)
- User testing & bug fixes
- Documentation
- Deployment setup
- Training & handover

---

## 9. Google Sheets Dummy Data Template

### Sample Events Data

| event_id | event_name | date | end_date | location | theme | status |
|----------|------------|------|----------|----------|-------|--------|
| EVT001 | Workshop Public Speaking 2024 | 2024-09-15 | 2024-09-16 | Hotel X, Jakarta | Speak with Confidence | completed |
| EVT002 | Kelas Coaching Batch 5 | 2024-10-01 | 2024-10-05 | Sanrays Office | Leadership Mastery | active |
| EVT003 | Team Building Q4 2024 | 2024-11-15 | 2024-11-17 | Villa Bintang | Build Stronger Team | preparation |

### Sample Participants (47 rows for EVT001)

| participant_id | event_id | full_name | email | company | city | gender |
|---------------|----------|-----------|-------|---------|------|--------|
| P001 | EVT001 | dr. Jane Doe | jane.doe@email.com | PT ABC Corp | Jakarta | Female |
| P002 | EVT001 | John Smith | john.s@email.com | CV XYZ Indonesia | Bandung | Male |
| P003 | EVT001 | Mary Jane | mary.jane@email.com | PT DEF Indonesia | Surabaya | Female |
| ... | ... | ... | ... | ... | ... | ... |
| P047 | EVT001 | Ahmad Wijaya | ahmad.w@email.com | PT Sanrays | Jakarta | Male |

### Sample Income (EVT001)

| income_id | event_id | date | category | source | amount | status |
|-----------|----------|------|----------|--------|--------|--------|
| INC001 | EVT001 | 2024-08-01 | ticket | Peserta Individual | 500000 | received |
| INC002 | EVT001 | 2024-08-05 | ticket | PT ABC Corp (5 pax) | 2500000 | received |
| INC003 | EVT001 | 2024-08-10 | sponsor | PT Sponsor Utama | 10000000 | received |
| INC004 | EVT001 | 2024-08-15 | hibah | Kemdikbud | 5000000 | confirmed |
| ... | ... | ... | ... | ... | ... | ... |
| **TOTAL** | | | | | **40000000** | |

### Sample Expense (EVT001)

| expense_id | event_id | date | category | vendor | description | amount | status |
|------------|----------|------|----------|--------|-------------|--------|--------|
| EXP001 | EVT001 | 2024-08-20 | venue | Hotel X | Booking + DP | 5000000 | paid |
| EXP002 | EVT001 | 2024-08-25 | pemateri | dr. John Doe | Fee speaking | 5000000 | paid |
| EXP003 | EVT001 | 2024-09-01 | konsumsi | PT Catering | Lunch Day 1-2 | 2500000 | paid |
| EXP004 | EVT001 | 2024-09-05 | equipment | SoundPro | Sewa sound system | 2000000 | paid |
| EXP005 | EVT001 | 2024-09-10 | marketing | Desain Grafis | Poster + Banner | 1000000 | paid |
| EXP006 | EVT001 | 2024-09-12 | dokumentasi | Studio Photo | Foto + Video | 1500000 | paid |
| **TOTAL** | | | | | | **17000000** | |

### Sample Checklist Items (EVT001)

| item_id | event_id | category | task | pic | status | due_date |
|---------|----------|----------|------|-----|--------|----------|
| CHK001 | EVT001 | acara | Booking venue | Sarah | completed | 2024-08-15 |
| CHK002 | EVT001 | acara | Kontrak venue | Sarah | completed | 2024-08-18 |
| CHK003 | EVT001 | acara | Buat rundown | Sarah | completed | 2024-09-01 |
| CHK004 | EVT001 | acara | Briefing MC | Sarah | completed | 2024-09-10 |
| CHK005 | EVT001 | konsumsi | Kontrak catering | Budi | completed | 2024-08-20 |
| CHK006 | EVT001 | konsumsi | Konfirmasi menu | Budi | completed | 2024-09-05 |
| CHK007 | EVT001 | konsumsi | Layout meja | Budi | completed | 2024-09-12 |
| CHK008 | EVT001 | perlengkapan | Sewa sound system | Cindy | completed | 2024-09-08 |
| CHK009 | EVT001 | perlengkapan | LCD Projector | Cindy | completed | 2024-09-10 |
| CHK010 | EVT001 | perlengkapan | Laptop cadangan | Cindy | completed | 2024-09-12 |
| CHK011 | EVT001 | perlengkapan | Backdrop & banner | Cindy | completed | 2024-09-10 |
| CHK012 | EVT001 | humas | Desain poster | Dina | completed | 2024-08-25 |
| CHK013 | EVT001 | humas | Posting social media | Dina | completed | 2024-09-01 |
| CHK014 | EVT001 | humas | Create WhatsApp Group | Dina | completed | 2024-09-10 |
| CHK015 | EVT001 | humas | Persiapan dokumentasi | Dina | completed | 2024-09-14 |
| CHK016 | EVT001 | keuangan | Budget planning | Finance | completed | 2024-08-01 |
| CHK017 | EVT001 | keuangan | Payment schedule | Finance | completed | 2024-08-15 |
| **TOTAL** | | | 18 items | | **18/18** | |

---

## 10. Next Steps

1. **Approval** - Review SPEC.md, provide feedback/adjustments
2. **Google Workspace Setup** - Create the Google Sheets template
3. **Development** - Start building the application
4. **Testing** - User acceptance testing with team
5. **Deployment** - Launch to production
6. **Training** - Session with admin users

---

**Document Prepared By:** AI Assistant  
**For:** PT Sanrays  
**Date:** 22 Agustus 2026
