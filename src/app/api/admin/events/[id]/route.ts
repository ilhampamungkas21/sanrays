import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db/supabase';
import { getAuthUser } from '@/lib/auth';
import { hasPermission } from '@/lib/rbac';
import { toCamelCase } from '@/lib/db';

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

// GET /api/admin/events/[id]
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Tidak memiliki akses' }, { status: 401 });
    }

    if (!hasPermission(authUser.role, 'event:view')) {
      return NextResponse.json({ error: 'Forbidden: Anda tidak memiliki akses' }, { status: 403 });
    }

    const { id } = await params;

    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Event tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ data: formatEvent(data) });
  } catch (err) {
    console.error('Get admin event error:', err);
    return NextResponse.json({ error: 'Gagal mengambil event' }, { status: 500 });
  }
}

// PUT /api/admin/events/[id]
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Tidak memiliki akses' }, { status: 401 });
    }

    if (!hasPermission(authUser.role, 'event:edit')) {
      return NextResponse.json({ error: 'Forbidden: Anda tidak memiliki akses untuk mengedit event' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();

    const updates: Record<string, unknown> = {};

    if (body.name !== undefined) updates.name = body.name;
    if (body.date !== undefined) updates.date = body.date;
    if (body.endDate !== undefined) updates.end_date = body.endDate;
    if (body.location !== undefined) updates.location = body.location;
    if (body.theme !== undefined) updates.theme = body.theme;
    if (body.status !== undefined) updates.status = body.status;
    if (body.eventType !== undefined) updates.event_type = body.eventType;
    if (body.description !== undefined) updates.description = body.description;
    if (body.shortDescription !== undefined) updates.short_description = body.shortDescription;
    if (body.organizer !== undefined) updates.organizer = body.organizer;
    if (body.coverGradient !== undefined) updates.cover_gradient = body.coverGradient;
    if (body.highlights !== undefined) updates.highlights = JSON.stringify(body.highlights);
    if (body.maxParticipants !== undefined) updates.max_participants = body.maxParticipants;
    if (body.price !== undefined) updates.price = body.price;
    if (body.earlyBirdPrice !== undefined) updates.early_bird_price = body.earlyBirdPrice;
    if (body.earlyBirdDeadline !== undefined) updates.early_bird_deadline = body.earlyBirdDeadline;
    if (body.paymentMethods !== undefined) updates.payment_methods = JSON.stringify(body.paymentMethods);
    if (body.published !== undefined) updates.published = body.published;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('events')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!data) {
      return NextResponse.json({ error: 'Event tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ data: formatEvent(data) });
  } catch (err) {
    console.error('Update admin event error:', err);
    return NextResponse.json({ error: 'Gagal memperbarui event' }, { status: 500 });
  }
}

// DELETE /api/admin/events/[id]
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Tidak memiliki akses' }, { status: 401 });
    }

    if (!hasPermission(authUser.role, 'event:delete')) {
      return NextResponse.json({ error: 'Forbidden: Anda tidak memiliki akses untuk menghapus event' }, { status: 403 });
    }

    const { id } = await params;

    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: 'Event berhasil dihapus' });
  } catch (err) {
    console.error('Delete admin event error:', err);
    return NextResponse.json({ error: 'Gagal menghapus event' }, { status: 500 });
  }
}
