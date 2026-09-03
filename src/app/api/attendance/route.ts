import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db/supabase';
import { getAuthUser } from '@/lib/auth';
import { toCamelCase, toCamelCaseArray, generateId } from '@/lib/db';

// GET /api/attendance
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('event_id');
    const sessionId = searchParams.get('session_id');

    let query = supabase.from('attendance').select('*');

    if (eventId) {
      query = query.eq('event_id', eventId);
    }

    if (sessionId) {
      // First get session names for this session_id
      const { data: sessionData } = await supabase
        .from('attendance_sessions')
        .select('session_name')
        .eq('id', sessionId);

      if (sessionData && sessionData.length > 0) {
        const sessionNames = sessionData.map(s => s.session_name);
        query = query.in('session_name', sessionNames);
      }
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) throw error;

    const attendance = toCamelCaseArray<Record<string, unknown>>(data || []);

    return NextResponse.json({ data: attendance });
  } catch (err) {
    console.error('Get attendance error:', err);
    return NextResponse.json({ error: 'Gagal mengambil attendance' }, { status: 500 });
  }
}

// POST /api/attendance
export async function POST(request: Request) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Tidak memiliki akses' }, { status: 401 });
    }

    const body = await request.json();

    const dbData = {
      id: generateId(),
      event_id: body.eventId || null,
      participant_id: body.participantId || null,
      session_name: body.sessionName || null,
      date: body.date || null,
      check_in_time: body.checkInTime || null,
      check_out_time: body.checkOutTime || null,
      status: body.status || 'absent',
      notes: body.notes || null,
    };

    const { data, error } = await supabase
      .from('attendance')
      .insert(dbData)
      .select()
      .single();

    if (error) throw error;

    const attendance = toCamelCase<Record<string, unknown>>(data);

    return NextResponse.json({ data: attendance }, { status: 201 });
  } catch (err) {
    console.error('Create attendance error:', err);
    return NextResponse.json({ error: 'Gagal membuat attendance' }, { status: 500 });
  }
}
