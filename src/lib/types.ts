// Shared types for SanRays Event Dashboard

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'admin' | 'event_manager' | 'finance' | 'stakeholder';
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Event {
  id: string;
  name: string;
  date: string;
  endDate?: string;
  location?: string;
  theme?: string;
  status: 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'preparation' | 'active' | 'completed' | 'cancelled';
  eventType: 'public' | 'internal';
  description?: string;
  shortDescription?: string;
  organizer?: string;
  coverGradient: string;
  highlights?: string[];
  maxParticipants: number;
  price: number;
  earlyBirdPrice?: number;
  earlyBirdDeadline?: string;
  paymentMethods?: string[];
  published: boolean;
  createdAt: string;
  updatedAt: string;
  // Extra properties for UI (from mock data)
  participants?: number;
  budget?: number;
  spent?: number;
  csat?: number;
  progress?: number;
  checklistDone?: number;
  checklistTotal?: number;
  preTestAvg?: number;
  postTestAvg?: number;
}

export interface Participant {
  id: string;
  eventId?: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  position?: string;
  gender?: string;
  ageGroup?: string;
  city?: string;
  registrationDate?: string;
  status: 'registered' | 'confirmed' | 'attended' | 'cancelled';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Checklist {
  id: string;
  eventId?: string;
  category: 'acara' | 'konsumsi' | 'perlengkapan' | 'humas' | 'keuangan' | 'dokumentasi' | 'timing' | 'lainnya';
  task: string;
  pic?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  dueDate?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  eventId?: string;
  category: 'income' | 'expense';
  type: string;
  amount: number;
  description?: string;
  vendor?: string;
  receiptUrl?: string;
  transactionDate?: string;
  status: 'pending' | 'approved' | 'rejected' | 'paid' | 'cancelled';
  paidBy?: string;
  approvedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Document {
  id: string;
  eventId?: string;
  category: 'sertifikat' | 'materi' | 'foto' | 'video' | 'lpj' | 'kontrak' | 'lainnya';
  name: string;
  fileUrl?: string;
  description?: string;
  uploadedBy?: string;
  createdAt: string;
}

export interface Attendance {
  id: string;
  eventId?: string;
  participantId?: string;
  sessionName?: string;
  date?: string;
  checkInTime?: string;
  checkOutTime?: string;
  status: 'present' | 'absent' | 'late' | 'permission';
  notes?: string;
  createdAt: string;
}

export interface Feedback {
  id: string;
  eventId?: string;
  participantName?: string;
  participantEmail?: string;
  ratingOverall?: number;
  ratingContent?: number;
  ratingFacility?: number;
  ratingPemateri?: number;
  comments?: string;
  suggestions?: string;
  submittedAt: string;
}

export interface Evaluation {
  id: string;
  eventId?: string;
  participantId?: string;
  testType: 'pre_test' | 'post_test';
  score?: number;
  answers?: Record<string, unknown>;
  submittedAt: string;
}
