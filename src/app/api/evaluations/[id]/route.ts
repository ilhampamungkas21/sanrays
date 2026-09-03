import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db/supabase';
import { getAuthUser } from '@/lib/auth';
import { toCamelCase } from '@/lib/db';

// Helper to parse JSON
function safeParse(value: unknown): unknown {
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }
  return value;
}

// GET /api/evaluations/[id]
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data, error } = await supabase
      .from('evaluations')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Evaluation tidak ditemukan' }, { status: 404 });
    }

    const evaluation = toCamelCase<Record<string, unknown>>(data);
    evaluation.answers = safeParse(data.answers);

    return NextResponse.json({ data: evaluation });
  } catch (err) {
    console.error('Get evaluation error:', err);
    return NextResponse.json({ error: 'Gagal mengambil evaluation' }, { status: 500 });
  }
}

// PUT /api/evaluations/[id]
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

    if (body.participantId !== undefined) updates.participant_id = body.participantId;
    if (body.testType !== undefined) updates.test_type = body.testType;
    if (body.score !== undefined) updates.score = body.score;
    if (body.answers !== undefined) updates.answers = JSON.stringify(body.answers);

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'Tidak ada data yang diperbarui' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('evaluations')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!data) {
      return NextResponse.json({ error: 'Evaluation tidak ditemukan' }, { status: 404 });
    }

    const evaluation = toCamelCase<Record<string, unknown>>(data);
    evaluation.answers = safeParse(data.answers);

    return NextResponse.json({ data: evaluation });
  } catch (err) {
    console.error('Update evaluation error:', err);
    return NextResponse.json({ error: 'Gagal memperbarui evaluation' }, { status: 500 });
  }
}

// DELETE /api/evaluations/[id]
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
      .from('evaluations')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: 'Evaluation berhasil dihapus' });
  } catch (err) {
    console.error('Delete evaluation error:', err);
    return NextResponse.json({ error: 'Gagal menghapus evaluation' }, { status: 500 });
  }
}
