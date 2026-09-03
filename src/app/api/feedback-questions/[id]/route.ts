import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db/supabase';
import { getAuthToken } from '@/lib/auth/api-utils';
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

// PUT /api/feedback-questions/[id]
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
    const { questionText, questionType, options, isRequired, orderNum } = body;

    const updates: Record<string, unknown> = {};
    if (questionText !== undefined) updates.question_text = questionText;
    if (questionType !== undefined) updates.question_type = questionType;
    if (options !== undefined) updates.options = options ? JSON.stringify(options) : null;
    if (isRequired !== undefined) updates.is_required = isRequired ? true : false;
    if (orderNum !== undefined) updates.order_num = orderNum;

    const { data, error } = await supabase
      .from('feedback_questions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!data) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    const question = toCamelCase<Record<string, unknown>>(data);
    question.options = safeParse(data.options);
    question.isRequired = Boolean(data.is_required);

    return NextResponse.json({ data: question });
  } catch (err) {
    console.error('Update question error:', err);
    return NextResponse.json({ error: 'Gagal memperbarui question' }, { status: 500 });
  }
}

// DELETE /api/feedback-questions/[id]
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

    const { error } = await supabase
      .from('feedback_questions')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Delete question error:', err);
    return NextResponse.json({ error: 'Gagal menghapus question' }, { status: 500 });
  }
}
