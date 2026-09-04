/**
 * Event Approval Types
 */

export interface EventApproval {
  id: string;
  eventId: string;
  userId: string;
  userRole: 'super_admin' | 'stakeholder';
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

export interface SubmitApprovalRequest {
  action: 'approve' | 'reject';
  notes?: string;
}

export interface SubmitApprovalResponse {
  success: boolean;
  message: string;
  approval?: EventApproval;
  eventApproved?: boolean;
  eventPublished?: boolean;
}

// API Response types
export interface ApprovalListResponse {
  data: EventApproval[];
  count: number;
}

export interface ApprovalStatusResponse {
  data: ApprovalStatus;
}
