import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db/supabase';
import { getAuthUser } from '@/lib/auth';
import { toCamelCase } from '@/lib/db';

// GET /api/checklists/[id]
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data, error } = await supabase
      .from('checklists')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Checklist tidak ditemukan' }, { status: 404 });
    }

    const checklist = toCamelCase<Record<string, unknown>>(data);

    return NextResponse.json({ data: checklist });
  } catch (err) {
    console.error('Get checklist error:', err);
    return NextResponse.json({ error: 'Gagal mengambil checklist' }, { status: 500 });
  }
}

// PUT /api/checklists/[id]
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
    if (body.category !== undefined) updates.category = body.category;
    if (body.task !== undefined) updates.task = body.task;
    if (body.pic !== undefined) updates.pic = body.pic;
    if (body.status !== undefined) updates.status = body.status;
    if (body.dueDate !== undefined) updates.due_date = body.dueDate;
    if (body.priority !== undefined) updates.priority = body.priority;
    if (body.notes !== undefined) updates.notes = body.notes;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('checklists')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!data) {
      return NextResponse.json({ error: 'Checklist tidak ditemukan' }, { status: 404 });
    }

    const checklist = toCamelCase<Record<string, unknown>>(data);

    return NextResponse.json({ data: checklist });
  } catch (err) {
    console.error('Update checklist error:', err);
    return NextResponse.json({ error: 'Gagal memperbarui checklist' }, { status: 500 });
  }
}

// DELETE /api/checklists/[id]
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
      .from('checklists')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: 'Checklist berhasil dihapus' });
  } catch (err) {
    console.error('Delete checklist error:', err);
    return NextResponse.json({ error: 'Gagal menghapus checklist' }, { status: 500 });
  }
}
