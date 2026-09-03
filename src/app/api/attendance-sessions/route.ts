import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db/supabase';
import { toCamelCase, toCamelCaseArray, generateId } from '@/lib/db';
import { getAuthToken } from '@/lib/auth/api-utils';

// GET /api/attendance-sessions?event_id=xxx - List attendance sessions
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('event_id');
    const sessionId = searchParams.get('id');

    if (sessionId) {
      const { data, error } = await supabase
        .from('attendance_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (error || !data) {
        return NextResponse.json({ error: 'Session not found' }, { status: 404 });
      }

      const session = toCamelCase<Record<string, unknown>>(data);
      session.isActive = Boolean(data.is_active);

      return NextResponse.json({ data: session });
    }

    if (!eventId) {
      return NextResponse.json({ error: 'event_id is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('attendance_sessions')
      .select('*')
      .eq('event_id', eventId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const sessions = (data || []).map((s) => {
      const session = toCamelCase<Record<string, unknown>>(s);
      session.isActive = Boolean(s.is_active);
      return session;
    });

    return NextResponse.json({ data: sessions });
  } catch (err) {
    console.error('Get attendance sessions error:', err);
    return NextResponse.json({ error: 'Gagal mengambil sessions' }, { status: 500 });
  }
}

// POST /api/attendance-sessions - Create attendance session
export async function POST(request: Request) {
  const token = await getAuthToken(request);
  if (!token) {
    return NextResponse.json({ error: 'Tidak memiliki akses' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { eventId, sessionName } = body;

    if (!eventId || !sessionName) {
      return NextResponse.json({ error: 'eventId and sessionName are required' }, { status: 400 });
    }

    // Generate unique session code
    const sessionCode = generateId().substring(0, 8).toUpperCase();

    const { data, error } = await supabase
      .from('attendance_sessions')
      .insert({
        id: generateId(),
        event_id: eventId,
        session_name: sessionName,
        session_code: sessionCode,
        is_active: true,
      })
      .select()
      .single();

    if (error) throw error;

    const session = toCamelCase<Record<string, unknown>>(data);
    session.isActive = Boolean(data.is_active);

    return NextResponse.json({ data: session }, { status: 201 });
  } catch (err: any) {
    console.error('Create attendance session error:', err);
    return NextResponse.json({ error: 'Gagal membuat session: ' + (err?.message || 'Terjadi kesalahan') }, { status: 500 });
  }
}
