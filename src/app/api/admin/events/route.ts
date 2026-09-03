import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db/supabase';
import { getAuthUser } from '@/lib/auth';
import { hasPermission } from '@/lib/rbac';
import { toCamelCase, generateId } from '@/lib/db';

// Helper to safely parse JSON
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

function formatEvent(row: Record<string, unknown>) {
  const event = toCamelCase<Record<string, unknown>>(row);
  event.highlights = safeParse(row.highlights);
  event.paymentMethods = safeParse(row.payment_methods);
  event.published = Boolean(row.published);
  return event;
}

// GET /api/admin/events - Get all events (including unpublished)
export async function GET(request: Request) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Tidak memiliki akses' }, { status: 401 });
    }

    if (!hasPermission(authUser.role, 'event:view')) {
      return NextResponse.json({ error: 'Forbidden: Anda tidak memiliki akses' }, { status: 403 });
    }

    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('date', { ascending: false });

    if (error) throw error;

    const events = (data || []).map(formatEvent);

    return NextResponse.json({ data: events, count: events.length });
  } catch (err) {
    console.error('Get admin events error:', err);
    return NextResponse.json({ error: 'Gagal mengambil events' }, { status: 500 });
  }
}

// POST /api/admin/events - Create new event
export async function POST(request: Request) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Tidak memiliki akses' }, { status: 401 });
    }

    if (!hasPermission(authUser.role, 'event:create')) {
      return NextResponse.json({ error: 'Forbidden: Anda tidak memiliki akses untuk membuat event' }, { status: 403 });
    }

    const body = await request.json();

    const dbData: Record<string, unknown> = {
      id: generateId(),
      name: body.name,
      date: body.date,
      end_date: body.endDate || null,
      location: body.location || null,
      theme: body.theme || null,
      status: body.status || 'draft',
      event_type: body.eventType || 'public',
      description: body.description || null,
      short_description: body.shortDescription || null,
      organizer: body.organizer || null,
      cover_gradient: body.coverGradient || 'from-orange-400 to-orange-600',
      highlights: body.highlights ? JSON.stringify(body.highlights) : null,
      max_participants: body.maxParticipants || 50,
      price: body.price || 0,
      early_bird_price: body.earlyBirdPrice || null,
      early_bird_deadline: body.earlyBirdDeadline || null,
      payment_methods: body.paymentMethods ? JSON.stringify(body.paymentMethods) : null,
      published: body.published || false,
    };

    const { data, error } = await supabase
      .from('events')
      .insert(dbData)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ data: formatEvent(data) }, { status: 201 });
  } catch (err) {
    console.error('Create admin event error:', err);
    return NextResponse.json({ error: 'Gagal membuat event' }, { status: 500 });
  }
}
