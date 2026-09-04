/**
 * Event Approval Helper Functions - MySQL Version
 * Provides functions for managing event approvals
 */

import { query, generateId } from './mysql';
import { RowDataPacket } from 'mysql2/promise';

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

/**
 * Get all approvers (users with approval-required roles)
 */
export async function getApprovers(): Promise<{ id: string; name: string; role: string }[]> {
  const rows = await query<RowDataPacket[]>(
    `SELECT id, name, role FROM users WHERE role IN (${APPROVAL_REQUIRED_ROLES.map(() => '?').join(',')})`,
    APPROVAL_REQUIRED_ROLES
  );
  return rows.map((row) => ({
    id: row.id as string,
    name: row.name as string,
    role: row.role as string,
  }));
}

/**
 * Create initial approval records for an event
 * Called when event is submitted for approval
 */
export async function createInitialApprovalRecords(eventId: string): Promise<EventApproval[]> {
  const approvers = await getApprovers();

  for (const approver of approvers) {
    const id = generateId();
    await query(
      `INSERT INTO event_approvals (id, event_id, user_id, user_role, user_name, status) VALUES (?, ?, ?, ?, ?, 'pending')`,
      [id, eventId, approver.id, approver.role, approver.name]
    );
  }

  return getEventApprovals(eventId);
}

/**
 * Get all approval records for an event
 */
export async function getEventApprovals(eventId: string): Promise<EventApproval[]> {
  const rows = await query<RowDataPacket[]>(
    `SELECT * FROM event_approvals WHERE event_id = ? ORDER BY created_at ASC`,
    [eventId]
  );
  return rows.map(formatApproval);
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
  const rows = await query<RowDataPacket[]>(
    `SELECT * FROM event_approvals WHERE event_id = ? AND user_id = ?`,
    [eventId, userId]
  );
  return rows.length > 0 ? formatApproval(rows[0]) : null;
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

  await query(
    `UPDATE event_approvals SET status = ?, notes = ?, updated_at = NOW() WHERE event_id = ? AND user_id = ?`,
    [status, notes || null, eventId, userId]
  );

  const approval = await getUserApproval(eventId, userId);
  if (!approval) throw new Error('Approval not found');
  return approval;
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
  await query(
    `UPDATE events SET status = 'approved', published = 1 WHERE id = ?`,
    [eventId]
  );
}

/**
 * Set event to rejected status
 */
export async function setEventRejected(eventId: string): Promise<void> {
  await query(
    `UPDATE events SET status = 'rejected' WHERE id = ?`,
    [eventId]
  );
}

/**
 * Submit event for approval (from event creator)
 */
export async function submitEventForApproval(eventId: string): Promise<boolean> {
  // Update event status to pending_approval
  await query(
    `UPDATE events SET status = 'pending_approval' WHERE id = ?`,
    [eventId]
  );

  // Create initial approval records
  await createInitialApprovalRecords(eventId);

  return true;
}

/**
 * Get events pending user's approval
 */
export async function getEventsPendingApproval(userId: string): Promise<{ eventId: string; eventName: string; eventDate: string }[]> {
  const rows = await query<RowDataPacket[]>(
    `SELECT ea.event_id, e.name, e.date
     FROM event_approvals ea
     JOIN events e ON e.id = ea.event_id
     WHERE ea.user_id = ? AND ea.status = 'pending' AND e.status = 'pending_approval'`,
    [userId]
  );
  return rows.map((row) => ({
    eventId: row.event_id as string,
    eventName: row.name as string,
    eventDate: row.date as string,
  }));
}

/**
 * Get events that user has already approved/rejected
 */
export async function getEventsActionedByUser(userId: string): Promise<{ eventId: string; eventName: string; eventDate: string; status: string; notes?: string }[]> {
  const rows = await query<RowDataPacket[]>(
    `SELECT ea.event_id, ea.status, ea.notes, e.name, e.date
     FROM event_approvals ea
     JOIN events e ON e.id = ea.event_id
     WHERE ea.user_id = ? AND ea.status != 'pending'`,
    [userId]
  );
  return rows.map((row) => ({
    eventId: row.event_id as string,
    eventName: row.name as string,
    eventDate: row.date as string,
    status: row.status as string,
    notes: row.notes as string | undefined,
  }));
}
