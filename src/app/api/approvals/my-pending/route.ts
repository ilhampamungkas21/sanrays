import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { hasPermission } from '@/lib/rbac';
import { getEventsPendingApproval, getEventsActionedByUser } from '@/lib/db/approval';
import { supabase } from '@/lib/db/supabase';

// GET /api/approvals/my-pending - Get events pending user's approval
export async function GET(request: Request) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Tidak memiliki akses' }, { status: 401 });
    }

    // Check if user has approval permission
    if (!hasPermission(authUser.role, 'approval:view')) {
      return NextResponse.json(
        { error: 'Anda tidak memiliki permission untuk melihat approval' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'pending'; // 'pending' or 'actioned'

    let events: { eventId: string; eventName: string; eventDate: string; status?: string; notes?: string; location?: string; coverGradient?: string; shortDescription?: string }[] = [];

    if (type === 'pending') {
      events = await getEventsPendingApproval(authUser.userId);
    } else {
      events = await getEventsActionedByUser(authUser.userId);
    }

    // Enrich with event details
    if (events.length > 0) {
      const eventIds = events.map((e) => e.eventId);

      const { data: eventDetails, error } = await supabase
        .from('events')
        .select('id, location, status, cover_gradient, short_description')
        .in('id', eventIds);

      if (error) {
        console.error('Error fetching event details:', error);
      }

      const eventMap = new Map((eventDetails || []).map((e) => [e.id, e]));

      const enrichedEvents = events.map((e) => {
        const details = eventMap.get(e.eventId);
        if (!details) return e;

        return {
          ...e,
          location: details.location,
          status: details.status,
          coverGradient: details.cover_gradient,
          shortDescription: details.short_description,
        };
      });

      return NextResponse.json({
        data: enrichedEvents,
        count: enrichedEvents.length,
        type,
      });
    }

    return NextResponse.json({
      data: events,
      count: events.length,
      type,
    });
  } catch (err) {
    console.error('Get pending approvals error:', err);
    return NextResponse.json({ error: 'Gagal mengambil data' }, { status: 500 });
  }
}
