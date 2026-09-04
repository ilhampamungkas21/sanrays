import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { hasPermission } from '@/lib/rbac';
import {
  getEventApprovals,
  submitApproval,
  getUserApproval,
} from '@/lib/db/approval';
import { checkAllApproved, setEventApproved, setEventRejected } from '@/lib/db/approval';
import { supabase } from '@/lib/db/supabase';

// GET /api/approvals?eventId=xxx - Get approvals for an event
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

    const approvals = await getEventApprovals(eventId);

    return NextResponse.json({
      data: approvals,
      count: approvals.length,
    });
  } catch (err) {
    console.error('Get approvals error:', err);
    return NextResponse.json({ error: 'Gagal mengambil data approval' }, { status: 500 });
  }
}

// POST /api/approvals - Submit approval or rejection
export async function POST(request: Request) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Tidak memiliki akses' }, { status: 401 });
    }

    // Check if user has approval permission
    if (!hasPermission(authUser.role, 'approval:create')) {
      return NextResponse.json(
        { error: 'Anda tidak memiliki权限 untuk approval' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { eventId, action, notes } = body;

    if (!eventId || !action) {
      return NextResponse.json(
        { error: 'eventId dan action diperlukan' },
        { status: 400 }
      );
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Action harus approve atau reject' },
        { status: 400 }
      );
    }

    // Get event details
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, name, status')
      .eq('id', eventId)
      .single();

    if (eventError || !event) {
      return NextResponse.json({ error: 'Event tidak ditemukan' }, { status: 404 });
    }

    // Check if event is in pending_approval status
    if (event.status !== 'pending_approval') {
      return NextResponse.json(
        { error: 'Event tidak dalam tahap persetujuan' },
        { status: 400 }
      );
    }

    // Check if user already approved/rejected
    const existingApproval = await getUserApproval(eventId, authUser.id);
    if (existingApproval && existingApproval.status !== 'pending') {
      return NextResponse.json(
        { error: 'Anda sudah memberikan keputusan untuk event ini' },
        { status: 400 }
      );
    }

    // Submit the approval/rejection
    const approval = await submitApproval(eventId, authUser.id, action, notes);

    let eventApproved = false;
    let eventPublished = false;
    let eventRejected = false;

    // Check if all have approved
    const allApproved = await checkAllApproved(eventId);

    if (allApproved) {
      // All approved - publish the event
      await setEventApproved(eventId);
      eventApproved = true;
      eventPublished = true;
    } else if (action === 'reject') {
      // Someone rejected - mark event as rejected
      await setEventRejected(eventId);
      eventRejected = true;
    }

    return NextResponse.json({
      success: true,
      message: eventApproved
        ? 'Event berhasil disetujui dan dipublish'
        : eventRejected
        ? 'Event ditolak'
        : 'Approval berhasil dicatat',
      approval,
      eventApproved,
      eventPublished,
      eventRejected,
    });
  } catch (err) {
    console.error('Submit approval error:', err);
    return NextResponse.json({ error: 'Gagal提交 approval' }, { status: 500 });
  }
}
