import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db/supabase';
import { toCamelCase, toCamelCaseArray, generateId } from '@/lib/db';
import { getAuthToken } from '@/lib/auth/api-utils';

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

// GET /api/event-tests?event_id=xxx
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('event_id');
    const testId = searchParams.get('id');

    if (testId) {
      // Get single test with questions
      const { data: testData, error: testError } = await supabase
        .from('event_tests')
        .select('*')
        .eq('id', testId)
        .single();

      if (testError || !testData) {
        return NextResponse.json({ error: 'Test not found' }, { status: 404 });
      }

      const test = toCamelCase<Record<string, unknown>>(testData);
      test.isActive = Boolean(testData.is_active);

      // Get questions
      const { data: questionData } = await supabase
        .from('test_questions')
        .select('*')
        .eq('test_id', testId)
        .order('order_num', { ascending: true });

      const questions = (questionData || []).map((row) => {
        const q = toCamelCase<Record<string, unknown>>(row);
        q.options = safeParse(row.options);
        return q;
      });

      return NextResponse.json({ data: { ...test, questions } });
    }

    if (!eventId) {
      return NextResponse.json({ error: 'event_id atau id wajib diisi' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('event_tests')
      .select('*')
      .eq('event_id', eventId)
      .order('test_type', { ascending: true });

    if (error) throw error;

    const tests = (data || []).map((t) => {
      const test = toCamelCase<Record<string, unknown>>(t);
      test.isActive = Boolean(t.is_active);
      return test;
    });

    return NextResponse.json({ data: tests });
  } catch (err) {
    console.error('Get tests error:', err);
    return NextResponse.json({ error: 'Gagal mengambil tests' }, { status: 500 });
  }
}

// POST /api/event-tests - Create new test
export async function POST(request: Request) {
  const token = await getAuthToken(request);
  if (!token) {
    return NextResponse.json({ error: 'Tidak memiliki akses' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { eventId, testType, title, description, timeLimitMinutes } = body;

    if (!eventId || !testType || !title) {
      return NextResponse.json({ error: 'eventId, testType, dan title wajib diisi' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('event_tests')
      .insert({
        id: generateId(),
        event_id: eventId,
        test_type: testType,
        title,
        description: description || null,
        time_limit_minutes: timeLimitMinutes || null,
      })
      .select()
      .single();

    if (error) throw error;

    const test = toCamelCase<Record<string, unknown>>(data);
    test.isActive = Boolean(data.is_active);

    return NextResponse.json({ data: test }, { status: 201 });
  } catch (err: any) {
    console.error('Create test error:', err);
    return NextResponse.json({ error: 'Gagal membuat test: ' + (err?.message || 'Terjadi kesalahan') }, { status: 500 });
  }
}
