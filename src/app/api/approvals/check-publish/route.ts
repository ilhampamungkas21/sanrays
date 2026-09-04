import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { getApprovalStatus } from '@/lib/db/approval';
import { query } from '@/lib/db/mysql';
import { RowDataPacket } from 'mysql2/promise';

// GET /api/approvals/check-publish?eventId=xxx - Check if event can be published
export async function GET(request: Request) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Tidak memiliki akses' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');

    if (!eventId) {
      return NextResponse.json({ error: 'eventId diperlukan' }, { status: 400 });
    }

    // Get event details
    const rows = await query<RowDataPacket[]>(
      `SELECT id, name, status FROM events WHERE id = ?`,
      [eventId]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Event tidak ditemukan' }, { status: 404 });
    }

    const event = rows[0];
    const approvalStatus = await getApprovalStatus(eventId, event.name as string, event.status as string);

    return NextResponse.json({
      data: approvalStatus,
    });
  } catch (err) {
    console.error('Check publish error:', err);
    return NextResponse.json({ error: 'Gagal memeriksa status' }, { status: 500 });
  }
}
