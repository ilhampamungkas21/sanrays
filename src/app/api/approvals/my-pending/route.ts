import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { hasPermission } from '@/lib/rbac';
import { getEventApprovals } from '@/lib/db/approval';
import { supabase } from '@/lib/db/supabase';

interface ApproverStatus {
  userId: string;
  userName: string;
  userRole: string;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
}

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
      // Get ALL events that are pending approval
      const { data: events, error } = await supabase
        .from('events')
        .select('*')
        .eq('status', 'pending_approval')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching pending events:', error);
        return NextResponse.json({ error: 'Gagal mengambil data' }, { status: 500 });
      }

      // Enrich with all approvers status for each event
      const enrichedEvents = await Promise.all(
        (events || []).map(async (event) => {
          const allApprovals = await getEventApprovals(event.id);

          const approvers: ApproverStatus[] = allApprovals.map(a => ({
            userId: a.userId,
            userName: a.userName,
            userRole: a.userRole,
            status: a.status,
            notes: a.notes,
          }));

          // Find current user's approval
          const currentUserApproval = allApprovals.find(a => a.userId === authUser.userId);
          const userHasActed = currentUserApproval?.status !== 'pending';

          return {
            eventId: event.id,
            eventName: event.name,
            eventDate: event.date,
            location: event.location,
            status: event.status,
            coverGradient: event.cover_gradient,
            shortDescription: event.short_description,
            userApprovalStatus: currentUserApproval?.status || 'pending',
            userHasActed,
            userHasRejected: currentUserApproval?.status === 'rejected',
            approvers,
            pendingApprovers: approvers.filter(a => a.status === 'pending').map(a => a.userName),
            approvedCount: approvers.filter(a => a.status === 'approved').length,
            totalApprovers: approvers.length,
          };
        })
      );

      return NextResponse.json({
        data: enrichedEvents,
        count: enrichedEvents.length,
        type,
      });
    } else {
      // Get events that user has already actioned
      const { data: approvals, error } = await supabase
        .from('event_approvals')
        .select('event_id, status, notes')
        .eq('user_id', authUser.userId)
        .neq('status', 'pending');

      if (error) {
        console.error('Error fetching actioned approvals:', error);
        return NextResponse.json({ error: 'Gagal mengambil data' }, { status: 500 });
      }

      if (!approvals || approvals.length === 0) {
        return NextResponse.json({ data: [], count: 0, type });
      }

      const eventIds = approvals.map(a => a.event_id);

      const { data: events, error: eventsError } = await supabase
        .from('events')
        .select('*')
        .in('id', eventIds);

      if (eventsError) {
        console.error('Error fetching events:', eventsError);
        return NextResponse.json({ error: 'Gagal mengambil data' }, { status: 500 });
      }

      const enrichedEvents = events?.map(event => {
        const approval = approvals.find(a => a.event_id === event.id);
        return {
          eventId: event.id,
          eventName: event.name,
          eventDate: event.date,
          location: event.location,
          status: event.status,
          coverGradient: event.cover_gradient,
          shortDescription: event.short_description,
          userApprovalStatus: approval?.status || 'pending',
          notes: approval?.notes || undefined,
        };
      });

      return NextResponse.json({
        data: enrichedEvents || [],
        count: enrichedEvents?.length || 0,
        type,
      });
    }
  } catch (err) {
    console.error('Get pending approvals error:', err);
    return NextResponse.json({ error: 'Gagal mengambil data' }, { status: 500 });
  }
}
