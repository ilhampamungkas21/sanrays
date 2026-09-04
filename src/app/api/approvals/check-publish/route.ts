import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { getApprovalStatus } from '@/lib/db/approval';
import { supabase } from '@/lib/db/supabase';

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
    const { data: event, error } = await supabase
      .from('events')
      .select('id, name, status')
      .eq('id', eventId)
      .single();

    if (error || !event) {
      return NextResponse.json({ error: 'Event tidak ditemukan' }, { status: 404 });
    }

    const approvalStatus = await getApprovalStatus(eventId, event.name, event.status);

    return NextResponse.json({
      data: approvalStatus,
    });
  } catch (err) {
    console.error('Check publish error:', err);
    return NextResponse.json({ error: 'Gagal memeriksa status' }, { status: 500 });
  }
}
