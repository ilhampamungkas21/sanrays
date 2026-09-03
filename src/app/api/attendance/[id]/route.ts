import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db/supabase';
import { getAuthUser } from '@/lib/auth';
import { toCamelCase } from '@/lib/db';

// GET /api/attendance/[id]
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Attendance tidak ditemukan' }, { status: 404 });
    }

    const attendance = toCamelCase<Record<string, unknown>>(data);

    return NextResponse.json({ data: attendance });
  } catch (err) {
    console.error('Get attendance error:', err);
    return NextResponse.json({ error: 'Gagal mengambil attendance' }, { status: 500 });
  }
}

// PUT /api/attendance/[id]
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Tidak memiliki akses' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const updates: Record<string, unknown> = {};

    if (body.eventId !== undefined) updates.event_id = body.eventId;
    if (body.participantId !== undefined) updates.participant_id = body.participantId;
    if (body.sessionName !== undefined) updates.session_name = body.sessionName;
    if (body.date !== undefined) updates.date = body.date;
    if (body.checkInTime !== undefined) updates.check_in_time = body.checkInTime;
    if (body.checkOutTime !== undefined) updates.check_out_time = body.checkOutTime;
    if (body.status !== undefined) updates.status = body.status;
    if (body.notes !== undefined) updates.notes = body.notes;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'Tidak ada data yang diperbarui' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('attendance')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!data) {
      return NextResponse.json({ error: 'Attendance tidak ditemukan' }, { status: 404 });
    }

    const attendance = toCamelCase<Record<string, unknown>>(data);

    return NextResponse.json({ data: attendance });
  } catch (err) {
    console.error('Update attendance error:', err);
    return NextResponse.json({ error: 'Gagal memperbarui attendance' }, { status: 500 });
  }
}

// DELETE /api/attendance/[id]
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Tidak memiliki akses' }, { status: 401 });
    }

    const { id } = await params;

    const { error } = await supabase
      .from('attendance')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: 'Attendance berhasil dihapus' });
  } catch (err) {
    console.error('Delete attendance error:', err);
    return NextResponse.json({ error: 'Gagal menghapus attendance' }, { status: 500 });
  }
}
