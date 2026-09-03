import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db/supabase';
import { generateId } from '@/lib/db';

// POST /api/attendance-sessions/[session_id]/mark - Mark attendance
export async function POST(
  request: Request,
  { params }: { params: Promise<{ session_id: string }> }
) {
  try {
    const { session_id } = await params;
    const body = await request.json();
    const { participantId, participantName } = body;

    // Check session exists and is active
    const { data: session, error: sessionError } = await supabase
      .from('attendance_sessions')
      .select('*')
      .eq('id', session_id)
      .eq('is_active', true)
      .single();

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Sesi presensi tidak ditemukan atau tidak aktif' }, { status: 404 });
    }

    // Mark attendance
    if (participantId) {
      // Check if already marked
      const { data: existing } = await supabase
        .from('attendance')
        .select('id')
        .eq('session_name', session.session_name)
        .eq('participant_id', participantId)
        .single();

      if (existing) {
        return NextResponse.json({ error: 'Presensi sudah dilakukan sebelumnya' }, { status: 400 });
      }

      await supabase.from('attendance').insert({
        id: generateId(),
        event_id: session.event_id,
        participant_id: participantId,
        session_name: session.session_name,
        status: 'present',
      });

      return NextResponse.json({ data: { message: 'Presensi berhasil', sessionName: session.session_name } }, { status: 201 });
    } else if (participantName) {
      await supabase.from('attendance').insert({
        id: generateId(),
        event_id: session.event_id,
        participant_name: participantName,
        session_name: session.session_name,
        status: 'present',
      });

      return NextResponse.json({ data: { message: 'Presensi berhasil', sessionName: session.session_name } }, { status: 201 });
    } else {
      return NextResponse.json({ error: 'Nama atau ID peserta wajib diisi' }, { status: 400 });
    }
  } catch (err: any) {
    console.error('Mark attendance error:', err);
    return NextResponse.json({ error: 'Gagal mencatat presensi: ' + (err?.message || 'Terjadi kesalahan') }, { status: 500 });
  }
}
