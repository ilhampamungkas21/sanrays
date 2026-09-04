/**
 * Role-Based Access Control (RBAC) utilities
 */

export type Role = 'super_admin' | 'admin' | 'event_manager' | 'finance' | 'stakeholder';

// Role hierarchy - higher index = more access
const roleHierarchy: Record<Role, number> = {
  stakeholder: 1,
  finance: 2,
  event_manager: 3,
  admin: 4,
  super_admin: 5,
};

// Define which roles can access which features
export const permissions = {
  // Event Management
  'event:view': ['super_admin', 'admin', 'event_manager', 'finance', 'stakeholder'],
  'event:create': ['super_admin', 'admin', 'event_manager'],
  'event:edit': ['super_admin', 'admin', 'event_manager'],
  'event:delete': ['super_admin', 'admin'],
  'event:edit_own': ['event_manager'], // Can only edit own events

  // Event Approval
  'approval:view': ['super_admin', 'stakeholder'],
  'approval:create': ['super_admin', 'stakeholder'],
  'approval:submit': ['super_admin', 'admin', 'event_manager'], // Can submit for approval

  // User Management
  'user:view': ['super_admin', 'admin'],
  'user:create': ['super_admin', 'admin'],
  'user:edit': ['super_admin', 'admin'],
  'user:delete': ['super_admin'],

  // Finance
  'finance:view': ['super_admin', 'admin', 'finance'],
  'finance:edit': ['super_admin', 'admin', 'finance'],
  'finance:transaction': ['super_admin', 'admin', 'finance'],

  // Dashboard
  'dashboard:view': ['super_admin', 'admin', 'event_manager', 'finance', 'stakeholder'],

  // Reports
  'report:view': ['super_admin', 'admin', 'finance', 'event_manager'],
  'report:export': ['super_admin', 'admin', 'finance'],

  // Participants
  'participant:view': ['super_admin', 'admin', 'event_manager'],
  'participant:edit': ['super_admin', 'admin', 'event_manager'],

  // Checklist
  'checklist:view': ['super_admin', 'admin', 'event_manager'],
  'checklist:edit': ['super_admin', 'admin', 'event_manager'],

  // Documents
  'document:view': ['super_admin', 'admin', 'event_manager', 'stakeholder'],
  'document:upload': ['super_admin', 'admin', 'event_manager'],
};

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: Role | string, permission: keyof typeof permissions): boolean {
  const allowedRoles = permissions[permission];
  return allowedRoles.includes(role as Role);
}

/**
 * Check if role has minimum level (for hierarchical access)
 */
export function hasMinRole(userRole: Role | string, minRole: Role): boolean {
  return (roleHierarchy[userRole as Role] || 0) >= (roleHierarchy[minRole] || 0);
}

/**
 * Get role label
 */
export function getRoleLabel(role: Role | string): string {
  const labels: Record<string, string> = {
    super_admin: 'Super Admin',
    admin: 'Admin',
    event_manager: 'Event Manager',
    finance: 'Finance',
    stakeholder: 'Stakeholder',
  };
  return labels[role] || role;
}

/**
 * Get role badge color
 */
export function getRoleColor(role: Role | string): { bg: string; text: string } {
  const colors: Record<string, { bg: string; text: string }> = {
    super_admin: { bg: 'bg-purple-100', text: 'text-purple-700' },
    admin: { bg: 'orange-100', text: 'text-orange-700' },
    event_manager: { bg: 'bg-blue-100', text: 'text-blue-700' },
    finance: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
    stakeholder: { bg: 'bg-gray-100', text: 'text-gray-700' },
  };
  return colors[role] || { bg: 'bg-gray-100', text: 'text-gray-700' };
}

/**
 * Check if user can edit a specific event (based on ownership)
 * Event Manager can only edit events where they are the organizer
 */
export function canEditEvent(userRole: Role | string, userId: string, eventOrganizer?: string): boolean {
  // Super admin and admin can edit all events
  if (hasPermission(userRole, 'event:edit')) {
    return true;
  }

  // Event manager can only edit if they own the event
  if (userRole === 'event_manager' && eventOrganizer) {
    // Check if user email or name matches organizer field
    return eventOrganizer.toLowerCase().includes(userId.toLowerCase());
  }

  return false;
}
