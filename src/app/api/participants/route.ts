import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db/supabase';
import { getAuthUser } from '@/lib/auth';
import { toCamelCase, toCamelCaseArray, generateId } from '@/lib/db';

// GET /api/participants - Get all participants
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('event_id');

    let query = supabase.from('participants').select('*');

    if (eventId) {
      query = query.eq('event_id', eventId);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) throw error;

    const participants = toCamelCaseArray<Record<string, unknown>>(data || []);

    return NextResponse.json({ data: participants });
  } catch (err) {
    console.error('Get participants error:', err);
    return NextResponse.json({ error: 'Gagal mengambil participants' }, { status: 500 });
  }
}

// POST /api/participants - Create new participant
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
      name: body.name,
      email: body.email || null,
      phone: body.phone || null,
      company: body.company || null,
      position: body.position || null,
      gender: body.gender || null,
      age_group: body.ageGroup || null,
      city: body.city || null,
      registration_date: body.registrationDate || null,
      status: body.status || 'registered',
      notes: body.notes || null,
    };

    const { data, error } = await supabase
      .from('participants')
      .insert(dbData)
      .select()
      .single();

    if (error) throw error;

    const participant = toCamelCase<Record<string, unknown>>(data);

    return NextResponse.json({ data: participant }, { status: 201 });
  } catch (err) {
    console.error('Create participant error:', err);
    return NextResponse.json({ error: 'Gagal membuat participant' }, { status: 500 });
  }
}
