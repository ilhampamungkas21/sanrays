/**
 * Event Approval Helper Functions
 * Provides functions for managing event approvals (Supabase)
 */

import { supabase, generateId } from '../db/supabase';

// Roles that are required to approve events
const APPROVAL_REQUIRED_ROLES = ['super_admin', 'stakeholder'];

// Types
export interface EventApproval {
  id: string;
  eventId: string;
  userId: string;
  userRole: string;
  userName: string;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApprovalStatus {
  eventId: string;
  eventName: string;
  eventStatus: string;
  totalRequired: number;
  totalApproved: number;
  totalRejected: number;
  totalPending: number;
  allApproved: boolean;
  canApprove: boolean;
  userApproval?: EventApproval;
  approvers: EventApproval[];
}

// Convert database row to EventApproval
function formatApproval(row: Record<string, unknown>): EventApproval {
  return {
    id: row.id as string,
    eventId: row.event_id as string,
    userId: row.user_id as string,
    userRole: row.user_role as string,
    userName: row.user_name as string,
    status: row.status as 'pending' | 'approved' | 'rejected',
    notes: row.notes as string | undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

// Helper to format error
function formatError(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'object' && error !== null) return JSON.stringify(error);
  return String(error);
}

/**
 * Get all approvers (users with approval-required roles)
 */
export async function getApprovers(): Promise<{ id: string; name: string; role: string }[]> {
  const { data, error } = await supabase
    .from('users')
    .select('id, name, role')
    .in('role', APPROVAL_REQUIRED_ROLES);

  if (error) {
    console.error('Error fetching approvers:', JSON.stringify(error));
    throw new Error('Gagal mengambil approvers: ' + formatError(error));
  }

  return (data || []).map((user) => ({
    id: user.id,
    name: user.name,
    role: user.role,
  }));
}

/**
 * Create initial approval records for an event
 * Called when event is submitted for approval
 */
export async function createInitialApprovalRecords(eventId: string): Promise<EventApproval[]> {
  const approvers = await getApprovers();
  console.log('Approvers found:', approvers);

  const records = approvers.map((approver) => ({
    id: generateId(),
    event_id: eventId,
    user_id: approver.id,
    user_role: approver.role,
    user_name: approver.name,
    status: 'pending' as const,
  }));

  console.log('Creating approval records:', records);

  const { data, error } = await supabase
    .from('event_approvals')
    .insert(records)
    .select();

  console.log('Insert result:', data, error);

  if (error) {
    console.error('Error creating approval records:', JSON.stringify(error));
    throw new Error('Gagal membuat approval records: ' + formatError(error));
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
    console.error('Error fetching event approvals:', JSON.stringify(error));
    throw new Error('Gagal mengambil approvals: ' + formatError(error));
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
    console.error('Error fetching user approval:', JSON.stringify(error));
    throw new Error('Gagal mengambil user approval: ' + formatError(error));
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
    })
    .eq('event_id', eventId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error submitting approval:', JSON.stringify(error));
    throw new Error('Gagal submit approval: ' + formatError(error));
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
    console.error('Error approving event:', JSON.stringify(error));
    throw new Error('Gagal approve event: ' + formatError(error));
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
    console.error('Error rejecting event:', JSON.stringify(error));
    throw new Error('Gagal reject event: ' + formatError(error));
  }
}

/**
 * Submit event for approval (from event creator)
 */
export async function submitEventForApproval(eventId: string): Promise<boolean> {
  console.log('Updating event status to pending_approval...');

  // Update event status to pending_approval
  const { error: updateError } = await supabase
    .from('events')
    .update({
      status: 'pending_approval',
    })
    .eq('id', eventId);

  if (updateError) {
    console.error('Error updating event status:', JSON.stringify(updateError));
    throw new Error('Gagal update status event: ' + formatError(updateError));
  }

  console.log('Creating initial approval records...');
  // Create initial approval records
  await createInitialApprovalRecords(eventId);

  return true;
}

/**
 * Get events pending user's approval
 */
export async function getEventsPendingApproval(userId: string): Promise<{ eventId: string; eventName: string; eventDate: string }[]> {
  const { data: approvals, error } = await supabase
    .from('event_approvals')
    .select('event_id, status')
    .eq('user_id', userId)
    .eq('status', 'pending');

  if (error) {
    console.error('Error fetching pending approvals:', JSON.stringify(error));
    throw new Error('Gagal mengambil pending approvals: ' + formatError(error));
  }

  if (!approvals || approvals.length === 0) {
    return [];
  }

  const eventIds = approvals.map((a) => a.event_id);

  const { data: events, error: eventsError } = await supabase
    .from('events')
    .select('id, name, date')
    .in('id', eventIds)
    .eq('status', 'pending_approval');

  if (eventsError) {
    console.error('Error fetching events:', JSON.stringify(eventsError));
    throw new Error('Gagal mengambil events: ' + formatError(eventsError));
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
    console.error('Error fetching actioned approvals:', JSON.stringify(error));
    throw new Error('Gagal mengambil actioned approvals: ' + formatError(error));
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
    console.error('Error fetching events:', JSON.stringify(eventsError));
    throw new Error('Gagal mengambil events: ' + formatError(eventsError));
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
