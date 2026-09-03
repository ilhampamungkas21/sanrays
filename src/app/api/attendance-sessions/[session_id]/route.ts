import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db/supabase';
import { toCamelCase } from '@/lib/db';
import { getAuthToken } from '@/lib/auth/api-utils';

// GET /api/attendance-sessions/[session_id]
export async function GET(
  request: Request,
  { params }: { params: Promise<{ session_id: string }> }
) {
  try {
    const { session_id } = await params;

    const { data: sessionData, error: sessionError } = await supabase
      .from('attendance_sessions')
      .select('*')
      .eq('id', session_id)
      .single();

    if (sessionError || !sessionData) {
      return NextResponse.json({ error: 'Sesi tidak ditemukan' }, { status: 404 });
    }

    const session = toCamelCase<Record<string, unknown>>(sessionData);
    session.isActive = Boolean(sessionData.is_active);

    // Get event info
    const { data: eventData } = await supabase
      .from('events')
      .select('id, name, date, location')
      .eq('id', sessionData.event_id)
      .single();

    const event = eventData ? toCamelCase<Record<string, unknown>>(eventData) : null;

    return NextResponse.json({
      data: {
        ...session,
        event,
      }
    });
  } catch (err) {
    console.error('Get attendance session error:', err);
    return NextResponse.json({ error: 'Gagal mengambil session' }, { status: 500 });
  }
}

// DELETE /api/attendance-sessions/[session_id]
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ session_id: string }> }
) {
  const token = await getAuthToken(request);
  if (!token) {
    return NextResponse.json({ error: 'Tidak memiliki akses' }, { status: 401 });
  }

  try {
    const { session_id } = await params;

    // Delete attendance records first
    await supabase.from('attendance').delete().eq('session_name', session_id);

    // Delete session
    await supabase.from('attendance_sessions').delete().eq('id', session_id);

    return NextResponse.json({ data: { message: 'Session deleted' } });
  } catch (err: any) {
    console.error('Delete session error:', err);
    return NextResponse.json({ error: 'Gagal menghapus session' }, { status: 500 });
  }
}
