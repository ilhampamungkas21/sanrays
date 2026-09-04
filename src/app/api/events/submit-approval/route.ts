import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { hasPermission } from '@/lib/rbac';
import { submitEventForApproval } from '@/lib/db/approval';
import { query } from '@/lib/db/mysql';
import { RowDataPacket } from 'mysql2/promise';

// POST /api/events/submit-approval - Submit event for approval
export async function POST(request: Request) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Tidak memiliki akses' }, { status: 401 });
    }

    // Check if user can submit for approval
    if (!hasPermission(authUser.role, 'approval:submit')) {
      return NextResponse.json(
        { error: 'Anda tidak memiliki permission untuk submit event' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { eventId } = body;

    if (!eventId) {
      return NextResponse.json({ error: 'eventId diperlukan' }, { status: 400 });
    }

    // Get event details
    const rows = await query<RowDataPacket[]>(
      `SELECT id, name, status, organizer FROM events WHERE id = ?`,
      [eventId]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Event tidak ditemukan' }, { status: 404 });
    }

    const event = rows[0];

    // Check if event is in draft status
    if (event.status !== 'draft') {
      return NextResponse.json(
        { error: 'Hanya event dengan status draft yang bisa diajukan untuk persetujuan' },
        { status: 400 }
      );
    }

    // Submit for approval
    await submitEventForApproval(eventId);

    return NextResponse.json({
      success: true,
      message: 'Event berhasil diajukan untuk persetujuan. Semua stakeholder dan super admin akan melihat event ini untuk diberikan persetujuan.',
    });
  } catch (err) {
    console.error('Submit for approval error:', err);
    return NextResponse.json({ error: 'Gagal submit event untuk persetujuan' }, { status: 500 });
  }
}
