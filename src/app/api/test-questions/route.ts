import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db/supabase';
import { getAuthToken } from '@/lib/auth/api-utils';
import { toCamelCase, toCamelCaseArray, generateId } from '@/lib/db';

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

// GET /api/test-questions?test_id=xxx
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const testId = searchParams.get('test_id');

    if (!testId) {
      return NextResponse.json({ error: 'test_id is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('test_questions')
      .select('*')
      .eq('test_id', testId)
      .order('order_num', { ascending: true });

    if (error) throw error;

    const questions = (data || []).map((q) => {
      const question = toCamelCase<Record<string, unknown>>(q);
      question.options = safeParse(q.options);
      return question;
    });

    return NextResponse.json({ data: questions });
  } catch (err) {
    console.error('Get questions error:', err);
    return NextResponse.json({ error: 'Gagal mengambil questions' }, { status: 500 });
  }
}

// POST /api/test-questions
export async function POST(request: Request) {
  const token = await getAuthToken(request);
  if (!token) {
    return NextResponse.json({ error: 'Tidak memiliki akses' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { testId, questionText, questionType, options, orderNum } = body;

    if (!testId || !questionText) {
      return NextResponse.json({ error: 'testId and questionText are required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('test_questions')
      .insert({
        id: generateId(),
        test_id: testId,
        question_text: questionText,
        question_type: questionType || 'multiple_choice',
        options: options ? JSON.stringify(options) : null,
        order_num: orderNum || 0,
      })
      .select()
      .single();

    if (error) throw error;

    const question = toCamelCase<Record<string, unknown>>(data);
    question.options = safeParse(data.options);

    return NextResponse.json({ data: question }, { status: 201 });
  } catch (err: any) {
    console.error('Create question error:', err);
    return NextResponse.json({ error: 'Gagal membuat question: ' + (err?.message || 'Terjadi kesalahan') }, { status: 500 });
  }
}
