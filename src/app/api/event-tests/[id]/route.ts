import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db/supabase';
import { toCamelCase } from '@/lib/db';
import { getAuthToken } from '@/lib/auth/api-utils';

// PUT /api/event-tests/[id]
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = await getAuthToken(request);
  if (!token) {
    return NextResponse.json({ error: 'Tidak memiliki akses' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { title, description, timeLimitMinutes, isActive } = body;

    const updates: Record<string, unknown> = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (timeLimitMinutes !== undefined) updates.time_limit_minutes = timeLimitMinutes;
    if (isActive !== undefined) updates.is_active = isActive ? true : false;

    const { data, error } = await supabase
      .from('event_tests')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!data) {
      return NextResponse.json({ error: 'Test not found' }, { status: 404 });
    }

    const test = toCamelCase<Record<string, unknown>>(data);
    test.isActive = Boolean(data.is_active);

    return NextResponse.json({ data: test });
  } catch (err: any) {
    console.error('Update test error:', err);
    return NextResponse.json({ error: 'Gagal memperbarui test' }, { status: 500 });
  }
}

// DELETE /api/event-tests/[id]
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = await getAuthToken(request);
  if (!token) {
    return NextResponse.json({ error: 'Tidak memiliki akses' }, { status: 401 });
  }

  try {
    const { id } = await params;

    // Delete related answers first
    await supabase.from('participant_test_answers').delete().in('result_id',
      (await supabase.from('participant_test_results').select('id').eq('test_id', id)).data?.map(r => r.id) || []
    );
    await supabase.from('participant_test_results').delete().eq('test_id', id);
    await supabase.from('test_questions').delete().eq('test_id', id);
    await supabase.from('event_tests').delete().eq('id', id);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Delete test error:', err);
    return NextResponse.json({ error: 'Gagal menghapus test' }, { status: 500 });
  }
}
