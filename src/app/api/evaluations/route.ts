import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db/supabase';
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

// GET /api/evaluations
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('event_id');
    const participantId = searchParams.get('participant_id');

    let query = supabase.from('evaluations').select('*');

    if (eventId) {
      query = query.eq('event_id', eventId);
    }

    if (participantId) {
      query = query.eq('participant_id', participantId);
    }

    query = query.order('submitted_at', { ascending: false });

    const { data, error } = await query;

    if (error) throw error;

    const evaluations = (data || []).map(row => {
      const eval_ = toCamelCase<Record<string, unknown>>(row);
      eval_.answers = safeParse(row.answers);
      return eval_;
    });

    return NextResponse.json({ data: evaluations });
  } catch (err) {
    console.error('Get evaluations error:', err);
    return NextResponse.json({ error: 'Gagal mengambil evaluations' }, { status: 500 });
  }
}

// POST /api/evaluations
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const dbData = {
      id: generateId(),
      event_id: body.eventId || null,
      participant_id: body.participantId || null,
      test_type: body.testType || null,
      score: body.score || null,
      answers: body.answers ? JSON.stringify(body.answers) : '{}',
    };

    const { data, error } = await supabase
      .from('evaluations')
      .insert(dbData)
      .select()
      .single();

    if (error) throw error;

    const evaluation = toCamelCase<Record<string, unknown>>(data);
    evaluation.answers = safeParse(data.answers);

    return NextResponse.json({ data: evaluation }, { status: 201 });
  } catch (err) {
    console.error('Create evaluation error:', err);
    return NextResponse.json({ error: 'Gagal membuat evaluation' }, { status: 500 });
  }
}
