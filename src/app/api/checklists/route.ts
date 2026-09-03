import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db/supabase';
import { getAuthUser } from '@/lib/auth';
import { toCamelCase, toCamelCaseArray, generateId } from '@/lib/db';

// GET /api/checklists
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('event_id');

    let query = supabase.from('checklists').select('*');

    if (eventId) {
      query = query.eq('event_id', eventId);
    }

    query = query.order('due_date', { ascending: true, nullsFirst: false })
                 .order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) throw error;

    const checklists = toCamelCaseArray<Record<string, unknown>>(data || []);

    return NextResponse.json({ data: checklists });
  } catch (err) {
    console.error('Get checklists error:', err);
    return NextResponse.json({ error: 'Gagal mengambil checklists' }, { status: 500 });
  }
}

// POST /api/checklists
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
      task: body.task,
      pic: body.pic || null,
      status: body.status || 'pending',
      due_date: body.dueDate || null,
      priority: body.priority || 'normal',
      notes: body.notes || null,
    };

    const { data, error } = await supabase
      .from('checklists')
      .insert(dbData)
      .select()
      .single();

    if (error) throw error;

    const checklist = toCamelCase<Record<string, unknown>>(data);

    return NextResponse.json({ data: checklist }, { status: 201 });
  } catch (err) {
    console.error('Create checklist error:', err);
    return NextResponse.json({ error: 'Gagal membuat checklist' }, { status: 500 });
  }
}
