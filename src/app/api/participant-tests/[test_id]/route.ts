import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db/supabase';
import { toCamelCase, generateId } from '@/lib/db';

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

// GET /api/participant-tests/[test_id] - Get test for participant to take
export async function GET(
  request: Request,
  { params }: { params: Promise<{ test_id: string }> }
) {
  try {
    const { test_id } = await params;

    // Get test info
    const { data: testData, error: testError } = await supabase
      .from('event_tests')
      .select('*')
      .eq('id', test_id)
      .eq('is_active', true)
      .single();

    if (testError || !testData) {
      return NextResponse.json({ error: 'Test tidak ditemukan atau tidak aktif' }, { status: 404 });
    }

    const test = toCamelCase<Record<string, unknown>>(testData);

    // Get questions
    const { data: questionData } = await supabase
      .from('test_questions')
      .select('id, test_id, question_text, question_type, options, order_num')
      .eq('test_id', test_id)
      .order('order_num', { ascending: true });

    const questions = (questionData || []).map(q => {
      const question = toCamelCase<Record<string, unknown>>(q);
      let options = null;
      if (question.options) {
        options = safeParse(question.options);
      }
      return {
        id: question.id,
        questionText: question.questionText,
        questionType: question.questionType,
        options,
        orderNum: question.orderNum,
      };
    });

    return NextResponse.json({
      data: {
        ...test,
        isActive: Boolean(testData.is_active),
        questions,
      }
    });
  } catch (err) {
    console.error('Get participant test error:', err);
    return NextResponse.json({ error: 'Gagal mengambil test' }, { status: 500 });
  }
}

// POST /api/participant-tests/[test_id] - Submit test answers
export async function POST(
  request: Request,
  { params }: { params: Promise<{ test_id: string }> }
) {
  try {
    const { test_id } = await params;
    const body = await request.json();
    const { participantName, participantEmail, answers } = body;

    if (!participantName || !answers || !Array.isArray(answers)) {
      return NextResponse.json({ error: 'Nama dan jawaban wajib diisi' }, { status: 400 });
    }

    // Check test exists and is active
    const { data: testData } = await supabase
      .from('event_tests')
      .select('id')
      .eq('id', test_id)
      .eq('is_active', true)
      .single();

    if (!testData) {
      return NextResponse.json({ error: 'Test tidak ditemukan atau tidak aktif' }, { status: 404 });
    }

    // Create result record
    const resultId = generateId();

    await supabase.from('participant_test_results').insert({
      id: resultId,
      test_id,
      participant_name: participantName,
      participant_email: participantEmail || null,
      completed_at: new Date().toISOString(),
    });

    // Save answers
    const answersToInsert = answers
      .filter((answer: Record<string, unknown>) => answer.questionId && answer.answerValue !== undefined)
      .map((answer: Record<string, unknown>) => ({
        id: generateId(),
        result_id: resultId,
        question_id: answer.questionId,
        answer_value: answer.answerValue || null,
      }));

    if (answersToInsert.length > 0) {
      await supabase.from('participant_test_answers').insert(answersToInsert);
    }

    return NextResponse.json({
      data: {
        resultId,
        message: 'Test berhasil dikirim',
      }
    }, { status: 201 });
  } catch (err: any) {
    console.error('Submit test error:', err);
    return NextResponse.json({ error: 'Gagal mengirim test: ' + (err?.message || 'Terjadi kesalahan') }, { status: 500 });
  }
}
