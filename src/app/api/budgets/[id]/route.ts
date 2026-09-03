import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db/supabase';
import { getAuthUser } from '@/lib/auth';
import { toCamelCase } from '@/lib/db';

// GET /api/budgets/[id]
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Budget tidak ditemukan' }, { status: 404 });
    }

    const budget = toCamelCase<Record<string, unknown>>(data);

    return NextResponse.json({ data: budget });
  } catch (err) {
    console.error('Get budget error:', err);
    return NextResponse.json({ error: 'Gagal mengambil budget' }, { status: 500 });
  }
}

// PUT /api/budgets/[id]
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
    if (body.plannedAmount !== undefined) updates.planned_amount = body.plannedAmount;
    if (body.actualAmount !== undefined) updates.actual_amount = body.actualAmount;
    if (body.notes !== undefined) updates.notes = body.notes;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('budgets')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!data) {
      return NextResponse.json({ error: 'Budget tidak ditemukan' }, { status: 404 });
    }

    const budget = toCamelCase<Record<string, unknown>>(data);

    return NextResponse.json({ data: budget });
  } catch (err) {
    console.error('Update budget error:', err);
    return NextResponse.json({ error: 'Gagal memperbarui budget' }, { status: 500 });
  }
}

// DELETE /api/budgets/[id]
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
      .from('budgets')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: 'Budget berhasil dihapus' });
  } catch (err) {
    console.error('Delete budget error:', err);
    return NextResponse.json({ error: 'Gagal menghapus budget' }, { status: 500 });
  }
}
