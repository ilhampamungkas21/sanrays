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

// GET /api/feedback-questions?event_id=xxx
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('event_id');

    if (!eventId) {
      return NextResponse.json({ error: 'event_id is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('feedback_questions')
      .select('*')
      .eq('event_id', eventId)
      .order('order_num', { ascending: true })
      .order('created_at', { ascending: true });

    if (error) throw error;

    const questions = (data || []).map((q) => {
      const question = toCamelCase<Record<string, unknown>>(q);
      question.options = safeParse(q.options);
      question.isRequired = Boolean(q.is_required);
      return question;
    });

    return NextResponse.json({ data: questions });
  } catch (err) {
    console.error('Get questions error:', err);
    return NextResponse.json({ error: 'Gagal mengambil questions' }, { status: 500 });
  }
}

// POST /api/feedback-questions
export async function POST(request: Request) {
  const token = await getAuthToken(request);
  if (!token) {
    return NextResponse.json({ error: 'Tidak memiliki akses' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { eventId, questionText, questionType, options, isRequired, orderNum } = body;

    if (!eventId || !questionText) {
      return NextResponse.json({ error: 'eventId and questionText are required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('feedback_questions')
      .insert({
        id: generateId(),
        event_id: eventId,
        question_text: questionText,
        question_type: questionType || 'text',
        options: options ? JSON.stringify(options) : null,
        is_required: isRequired ? true : false,
        order_num: orderNum || 0,
      })
      .select()
      .single();

    if (error) throw error;

    const question = toCamelCase<Record<string, unknown>>(data);
    question.options = safeParse(data.options);
    question.isRequired = Boolean(data.is_required);

    return NextResponse.json({ data: question }, { status: 201 });
  } catch (err: any) {
    console.error('Create question error:', err);
    return NextResponse.json({ error: 'Gagal membuat question: ' + (err?.message || 'Unknown error') }, { status: 500 });
  }
}
