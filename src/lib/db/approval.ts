/**
 * Event Approval Helper Functions
 * Provides functions for managing event approvals
 */

import { supabase, generateId, toCamelCase, toCamelCaseArray } from '../db/supabase';
import { EventApproval, ApprovalStatus } from '@/lib/types/approval';

// Roles that are required to approve events
const APPROVAL_REQUIRED_ROLES = ['super_admin', 'stakeholder'] as const;
type ApprovalRequiredRole = typeof APPROVAL_REQUIRED_ROLES[number];

// Convert database row to EventApproval
function formatApproval(row: Record<string, unknown>): EventApproval {
  return {
    id: row.id as string,
    eventId: row.event_id as string,
    userId: row.user_id as string,
    userRole: row.user_role as ApprovalRequiredRole,
    userName: row.user_name as string,
    status: row.status as 'pending' | 'approved' | 'rejected',
    notes: row.notes as string | undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

/**
 * Get all approvers (users with approval-required roles)
 */
export async function getApprovers(): Promise<{ id: string; name: string; role: ApprovalRequiredRole }[]> {
  const { data, error } = await supabase
    .from('users')
    .select('id, name, role')
    .in('role', APPROVAL_REQUIRED_ROLES);

  if (error) {
    console.error('Error fetching approvers:', error);
    throw error;
  }

  return (data || []).map((user) => ({
    id: user.id,
    name: user.name,
    role: user.role as ApprovalRequiredRole,
  }));
}

/**
 * Create initial approval records for an event
 * Called when event is submitted for approval
 */
export async function createInitialApprovalRecords(eventId: string): Promise<EventApproval[]> {
  const approvers = await getApprovers();

  const records = approvers.map((approver) => ({
    id: generateId(),
    event_id: eventId,
    user_id: approver.id,
    user_role: approver.role,
    user_name: approver.name,
    status: 'pending' as const,
  }));

  const { data, error } = await supabase
    .from('event_approvals')
    .insert(records)
    .select();

  if (error) {
    console.error('Error creating approval records:', error);
    throw error;
  }

  return (data || []).map(formatApproval);
}

/**
 * Get all approval records for an event
 */
export async function getEventApprovals(eventId: string): Promise<EventApproval[]> {
  const { data, error } = await supabase
    .from('event_approvals')
    .select('*')
    .eq('event_id', eventId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching event approvals:', error);
    throw error;
  }

  return (data || []).map(formatApproval);
}

/**
 * Get approval status for an event
 */
export async function getApprovalStatus(
  eventId: string,
  eventName: string,
  eventStatus: string
): Promise<ApprovalStatus> {
  const approvals = await getEventApprovals(eventId);

  const totalApproved = approvals.filter((a) => a.status === 'approved').length;
  const totalRejected = approvals.filter((a) => a.status === 'rejected').length;
  const totalPending = approvals.filter((a) => a.status === 'pending').length;

  return {
    eventId,
    eventName,
    eventStatus,
    totalRequired: approvals.length,
    totalApproved,
    totalRejected,
    totalPending,
    allApproved: totalPending === 0 && totalRejected === 0 && totalApproved > 0,
    canApprove: totalPending > 0,
    approvers: approvals,
  };
}

/**
 * Get user's approval record for an event
 */
export async function getUserApproval(
  eventId: string,
  userId: string
): Promise<EventApproval | null> {
  const { data, error } = await supabase
    .from('event_approvals')
    .select('*')
    .eq('event_id', eventId)
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    // PGRST116 = no rows found
    console.error('Error fetching user approval:', error);
    throw error;
  }

  return data ? formatApproval(data) : null;
}

/**
 * Submit approval or rejection
 */
export async function submitApproval(
  eventId: string,
  userId: string,
  action: 'approve' | 'reject',
  notes?: string
): Promise<EventApproval> {
  const status = action === 'approve' ? 'approved' : 'rejected';

  const { data, error } = await supabase
    .from('event_approvals')
    .update({
      status,
      notes: notes || null,
      updated_at: new Date().toISOString(),
    })
    .eq('event_id', eventId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error submitting approval:', error);
    throw error;
  }

  return formatApproval(data);
}

/**
 * Check if all required approvers have approved
 * Returns true if event can be published
 */
export async function checkAllApproved(eventId: string): Promise<boolean> {
  const approvals = await getEventApprovals(eventId);

  if (approvals.length === 0) return false;

  // All must be approved (none pending or rejected)
  return approvals.every((a) => a.status === 'approved');
}

/**
 * Set event to approved status and publish it
 */
export async function setEventApproved(eventId: string): Promise<void> {
  const { error } = await supabase
    .from('events')
    .update({
      status: 'approved',
      published: true,
    })
    .eq('id', eventId);

  if (error) {
    console.error('Error approving event:', error);
    throw error;
  }
}

/**
 * Set event to rejected status
 */
export async function setEventRejected(eventId: string): Promise<void> {
  const { error } = await supabase
    .from('events')
    .update({
      status: 'rejected',
    })
    .eq('id', eventId);

  if (error) {
    console.error('Error rejecting event:', error);
    throw error;
  }
}

/**
 * Submit event for approval (from event creator)
 */
export async function submitEventForApproval(eventId: string): Promise<boolean> {
  // Update event status to pending_approval
  const { error: updateError } = await supabase
    .from('events')
    .update({
      status: 'pending_approval',
    })
    .eq('id', eventId);

  if (updateError) {
    console.error('Error updating event status:', updateError);
    throw updateError;
  }

  // Create initial approval records
  await createInitialApprovalRecords(eventId);

  return true;
}

/**
 * Get events pending user's approval
 */
export async function getEventsPendingApproval(userId: string): Promise<{ eventId: string; eventName: string; eventDate: string }[]> {
  // Get user's pending approvals
  const { data: approvals, error } = await supabase
    .from('event_approvals')
    .select('event_id, status')
    .eq('user_id', userId)
    .eq('status', 'pending');

  if (error) {
    console.error('Error fetching pending approvals:', error);
    throw error;
  }

  if (!approvals || approvals.length === 0) {
    return [];
  }

  const eventIds = approvals.map((a) => a.event_id);

  // Get event details
  const { data: events, error: eventsError } = await supabase
    .from('events')
    .select('id, name, date')
    .in('id', eventIds)
    .eq('status', 'pending_approval');

  if (eventsError) {
    console.error('Error fetching events:', eventsError);
    throw eventsError;
  }

  return (events || []).map((event) => ({
    eventId: event.id,
    eventName: event.name,
    eventDate: event.date,
  }));
}

/**
 * Get events that user has already approved/rejected
 */
export async function getEventsActionedByUser(userId: string): Promise<{ eventId: string; eventName: string; eventDate: string; status: string; notes?: string }[]> {
  const { data: approvals, error } = await supabase
    .from('event_approvals')
    .select('event_id, status, notes')
    .eq('user_id', userId)
    .neq('status', 'pending');

  if (error) {
    console.error('Error fetching actioned approvals:', error);
    throw error;
  }

  if (!approvals || approvals.length === 0) {
    return [];
  }

  const eventIds = approvals.map((a) => a.event_id);

  const { data: events, error: eventsError } = await supabase
    .from('events')
    .select('id, name, date')
    .in('id', eventIds);

  if (eventsError) {
    console.error('Error fetching events:', eventsError);
    throw eventsError;
  }

  return (events || []).map((event) => {
    const approval = approvals.find((a) => a.event_id === event.id);
    return {
      eventId: event.id,
      eventName: event.name,
      eventDate: event.date,
      status: approval?.status || 'pending',
      notes: approval?.notes || undefined,
    };
  });
}
