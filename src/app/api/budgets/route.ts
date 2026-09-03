import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db/supabase';
import { getAuthUser } from '@/lib/auth';
import { toCamelCase, toCamelCaseArray, generateId } from '@/lib/db';

// GET /api/budgets
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('event_id');

    let query = supabase.from('budgets').select('*');

    if (eventId) {
      query = query.eq('event_id', eventId);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) throw error;

    const budgets = toCamelCaseArray<Record<string, unknown>>(data || []);

    return NextResponse.json({ data: budgets });
  } catch (err) {
    console.error('Get budgets error:', err);
    return NextResponse.json({ error: 'Gagal mengambil budgets' }, { status: 500 });
  }
}

// POST /api/budgets
export async function POST(request: Request) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Tidak memiliki akses' }, { status: 401 });
    }

    const body = await request.json();

    const dbData = {
      id: generateId(),
      event_id: body.eventId || null,
      category: body.category,
      planned_amount: body.plannedAmount || 0,
      actual_amount: body.actualAmount || 0,
      notes: body.notes || null,
    };

    const { data, error } = await supabase
      .from('budgets')
      .insert(dbData)
      .select()
      .single();

    if (error) throw error;

    const budget = toCamelCase<Record<string, unknown>>(data);

    return NextResponse.json({ data: budget }, { status: 201 });
  } catch (err) {
    console.error('Create budget error:', err);
    return NextResponse.json({ error: 'Gagal membuat budget' }, { status: 500 });
  }
}
