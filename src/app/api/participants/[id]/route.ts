import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db/supabase';
import { getAuthUser } from '@/lib/auth';
import { toCamelCase } from '@/lib/db';

// GET /api/participants/[id]
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data, error } = await supabase
      .from('participants')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Participant tidak ditemukan' }, { status: 404 });
    }

    const participant = toCamelCase<Record<string, unknown>>(data);

    return NextResponse.json({ data: participant });
  } catch (err) {
    console.error('Get participant error:', err);
    return NextResponse.json({ error: 'Gagal mengambil participant' }, { status: 500 });
  }
}

// PUT /api/participants/[id]
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
    if (body.name !== undefined) updates.name = body.name;
    if (body.email !== undefined) updates.email = body.email;
    if (body.phone !== undefined) updates.phone = body.phone;
    if (body.company !== undefined) updates.company = body.company;
    if (body.position !== undefined) updates.position = body.position;
    if (body.gender !== undefined) updates.gender = body.gender;
    if (body.ageGroup !== undefined) updates.age_group = body.ageGroup;
    if (body.city !== undefined) updates.city = body.city;
    if (body.registrationDate !== undefined) updates.registration_date = body.registrationDate;
    if (body.status !== undefined) updates.status = body.status;
    if (body.notes !== undefined) updates.notes = body.notes;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'Tidak ada data yang diperbarui' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('participants')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!data) {
      return NextResponse.json({ error: 'Participant tidak ditemukan' }, { status: 404 });
    }

    const participant = toCamelCase<Record<string, unknown>>(data);

    return NextResponse.json({ data: participant });
  } catch (err) {
    console.error('Update participant error:', err);
    return NextResponse.json({ error: 'Gagal memperbarui participant' }, { status: 500 });
  }
}

// DELETE /api/participants/[id]
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
      .from('participants')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: 'Participant berhasil dihapus' });
  } catch (err) {
    console.error('Delete participant error:', err);
    return NextResponse.json({ error: 'Gagal menghapus participant' }, { status: 500 });
  }
}
