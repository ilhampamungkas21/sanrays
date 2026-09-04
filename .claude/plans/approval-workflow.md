# Plan: Event Approval Workflow Feature

## Overview
Fitur approval dimana stakeholder DAN super_admin harus menyetujui event sebelum bisa di-publish ke landing page.

---

## Alur Approval

```
Creator buat event (draft)
       ↓
  Status: draft
       ↓
  Creator klik "Ajukan Persetujuan"
       ↓
  Status: pending_approval
       ↓
  Semua stakeholder & super_admin lihat di dashboard
       ↓
  Masing-masing klik ✅ atau ❌ dengan catatan
       ↓
  ┌─────────────────────────────────────────────┐
  │ CHECK: Semua stakeholder + super_admin       │
  │       sudah approve?                        │
  └─────────────────────────────────────────────┘
       ↓
  ✅ Ya semua → Status: approved → published = true → Tampil di Landing Page
  ❌ Ada yang tolak → Status: rejected → Creator revisi
```

---

## Aturan Approval

| Role | Harus Approve? | Bisa Aksi? |
|------|:--------------:|:-----------:|
| super_admin | ✅ Ya | ✅ Ya |
| stakeholder | ✅ Ya | ✅ Ya |
| admin | ❌ Tidak | ❌ Tidak |
| event_manager | ❌ Tidak | ❌ Tidak |
| finance | ❌ Tidak | ❌ Tidak |

---

## File yang Akan Dibuat/Modifikasi

### Phase 1: Database & Types

#### 1.1 Tabel Baru: `event_approvals`

```sql
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

CREATE INDEX idx_event_approvals_event ON event_approvals(event_id);
CREATE INDEX idx_event_approvals_user ON event_approvals(user_id);
CREATE INDEX idx_event_approvals_status ON event_approvals(status);
```

#### 1.2 TypeScript Types

**File:** `src/lib/types/approval.ts`
```typescript
export interface EventApproval {
  id: string;
  eventId: string;
  userId: string;
  userRole: 'super_admin' | 'stakeholder';
  userName: string;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApprovalStatus {
  totalRequired: number;
  totalApproved: number;
  totalRejected: number;
  totalPending: number;
  allApproved: boolean;
  approvers: EventApproval[];
}
```

#### 1.3 Update Types

**File:** `src/lib/types.ts` - Tambah event status:
```typescript
// Update EventStatus
type EventStatus = 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'preparation' | 'active' | 'completed' | 'cancelled';
```

---

### Phase 2: API Endpoints

#### 2.1 Create Approval Record

**File:** `src/app/api/approvals/route.ts` (POST)

```typescript
// POST /api/approvals - Create/update approval record
// Called when user with approval authority acts on an event
// Body: { eventId, action: 'approve' | 'reject', notes? }
```

#### 2.2 Get Approvals

**File:** `src/app/api/approvals/route.ts` (GET)

```typescript
// GET /api/approvals?eventId=xxx
// Returns all approval records for an event
```

#### 2.3 Get Events Pending Approval (for stakeholder dashboard)

**File:** `src/app/api/approvals/my-pending/route.ts`

```typescript
// GET /api/approvals/my-pending
// Returns events user still needs to approve
```

#### 2.4 Update Event Publish Status

**File:** `src/app/api/approvals/check-publish/route.ts`

```typescript
// GET /api/approvals/check-publish?eventId=xxx
// Checks if all required approvers have approved
// If yes, updates event status to 'approved' and published=true
```

#### 2.5 Submit for Approval (from creator)

**File:** `src/app/api/events/[id]/submit-approval/route.ts`

```typescript
// POST /api/events/[id]/submit-approval
// Creator submits event for approval
// Creates initial approval records for all required approvers
```

---

### Phase 3: Helper Functions

**File:** `src/lib/db/approval.ts`

```typescript
// Helper functions:
// - createInitialApprovalRecords(eventId) - Create pending records for all required approvers
// - getApprovalStatus(eventId) - Get current approval status
// - canUserApprove(eventId, userId, userRole) - Check if user can approve
// - checkAllApproved(eventId) - Check if all required have approved
// - setEventApproved(eventId) - Update event to approved and published
// - setEventRejected(eventId) - Update event to rejected
```

---

### Phase 4: Dashboard Pages

#### 4.1 Approval Dashboard Page

**File:** `src/app/dashboard/approvals/page.tsx`

Halaman utama untuk stakeholder dan super_admin melihat event yang perlu di-approve.

**Fitur:**
- Tab "Menunggu Persetujuan Saya" - Event yang belum di-approve user ini
- Tab "Riwayat" - Event yang sudah di-approve/ditolak
- Card event dengan tombol Setuju/Tolak
- Progress indicator (2/5 approve)
- Catatan opsional

#### 4.2 ApprovalSection Component

**File:** `src/components/ApprovalSection.tsx`

Komponen reusable untuk menampilkan status approval di event detail.

**Props:**
```typescript
interface ApprovalSectionProps {
  eventId: string;
  eventStatus: string;
  userRole: string;
}
```

**Display:**
- Status badge (Pending, Approved, Rejected)
- List approvers dengan status masing-masing
- Tombol Setuju/Tolak (hanya untuk approver yang belum aksi)

---

### Phase 5: Modify Existing Files

#### 5.1 Update Event Detail Page

**File:** `src/app/dashboard/events/[event_id]/page.tsx`

Tambah `ApprovalSection` component di bagian atas event detail.

#### 5.2 Update Event Create/Edit (Admin)

**File:** `src/app/admin/events/page.tsx`

Tambah tombol "Ajukan Persetujuan" untuk event dengan status 'draft'.

#### 5.3 Update RBAC

**File:** `src/lib/rbac.ts`

Tambah permissions baru:
```typescript
'approval:view': ['super_admin', 'stakeholder'],
'approval:create': ['super_admin', 'stakeholder'],
```

#### 5.4 Update Sidebar Navigation

**File:** `src/components/Sidebar.tsx` & `src/components/MobileSidebar.tsx`

Tambah menu "Persetujuan" untuk role super_admin dan stakeholder.

#### 5.5 Update MobileSidebar

**File:** `src/components/MobileSidebar.tsx`

Sama dengan Sidebar.

---

### Phase 6: Landing Page Update

**File:** `src/app/page.tsx` & `src/components/EventsSection.tsx`

Landing page sudah menampilkan `published=true` events. Tidak perlu ubah query.

Hanya event dengan `published=true` yang tampil di landing page.

---

## Ringkasan File

| # | File | Aksi |
|---|------|------|
| 1 | `database/event-approvals.sql` | CREATE |
| 2 | `src/lib/types/approval.ts` | CREATE |
| 3 | `src/lib/types.ts` | MODIFY |
| 4 | `src/lib/rbac.ts` | MODIFY |
| 5 | `src/lib/db/approval.ts` | CREATE |
| 6 | `src/app/api/approvals/route.ts` | CREATE |
| 7 | `src/app/api/approvals/my-pending/route.ts` | CREATE |
| 8 | `src/app/api/approvals/check-publish/route.ts` | CREATE |
| 9 | `src/app/api/events/[id]/submit-approval/route.ts` | CREATE |
| 10 | `src/components/ApprovalSection.tsx` | CREATE |
| 11 | `src/app/dashboard/approvals/page.tsx` | CREATE |
| 12 | `src/app/dashboard/events/[event_id]/page.tsx` | MODIFY |
| 13 | `src/app/admin/events/page.tsx` | MODIFY |
| 14 | `src/components/Sidebar.tsx` | MODIFY |
| 15 | `src/components/MobileSidebar.tsx` | MODIFY |

---

## Estimasi Effort

- Phase 1 (DB & Types): 10 menit
- Phase 2 (API): 30 menit
- Phase 3 (Helpers): 15 menit
- Phase 4 (Dashboard): 45 menit
- Phase 5 (Modify Existing): 20 menit
- Phase 6 (Landing): 0 menit (sudah benar)

**Total: ~2 jam**

---

## Testing Checklist

- [ ] Buat event baru → status draft
- [ ] Submit event untuk approval → status pending_approval
- [ ] Login stakeholder → lihat event di halaman approvals
- [ ] Approve event sebagai stakeholder
- [ ] Login super_admin → approve event
- [ ] Verifikasi semua approve → event status = approved, published = true
- [ ] Verifikasi event tampil di landing page
- [ ] Test reject flow → event status = rejected
