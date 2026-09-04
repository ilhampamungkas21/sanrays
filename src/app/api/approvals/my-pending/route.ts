import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { hasPermission } from '@/lib/rbac';
import { getEventsPendingApproval, getEventsActionedByUser, getEventApprovals } from '@/lib/db/approval';
import { supabase } from '@/lib/db/supabase';

// GET /api/approvals/my-pending?type=pending - Get events pending approval
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
    const type = searchParams.get('type') || 'pending';

    if (type === 'pending') {
      // Get ALL events that are pending approval (not just user's pending)
      const { data: events, error } = await supabase
        .from('events')
        .select('*')
        .eq('status', 'pending_approval')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching pending events:', error);
        return NextResponse.json({ error: 'Gagal mengambil data' }, { status: 500 });
      }

      // Enrich with approval info for current user
      const enrichedEvents = await Promise.all(
        (events || []).map(async (event) => {
          const userApproval = await getUserApprovalForEvent(event.id, authUser.userId);
          return {
            eventId: event.id,
            eventName: event.name,
            eventDate: event.date,
            location: event.location,
            status: event.status,
            coverGradient: event.cover_gradient,
            shortDescription: event.short_description,
            userApprovalStatus: userApproval?.status || 'pending',
            userHasActed: userApproval?.status !== 'pending',
          };
        })
      );

      return NextResponse.json({
        data: enrichedEvents,
        count: enrichedEvents.length,
        type,
      });
    } else {
      // Get events that user has already actioned (approved/rejected)
      const events = await getEventsActionedByUser(authUser.userId);

      return NextResponse.json({
        data: events,
        count: events.length,
        type,
      });
    }
  } catch (err) {
    console.error('Get pending approvals error:', err);
    return NextResponse.json({ error: 'Gagal mengambil data' }, { status: 500 });
  }
}

// Helper to get user's approval for a specific event
async function getUserApprovalForEvent(eventId: string, userId: string): Promise<{ status: string } | null> {
  const { data, error } = await supabase
    .from('event_approvals')
    .select('status')
    .eq('event_id', eventId)
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching user approval:', error);
    return null;
  }

  return data ? { status: data.status } : null;
}
