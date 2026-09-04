"use client";

import { useState, useEffect } from 'react';
import { authFetch } from '@/lib/auth/client';
import { ApprovalStatus, EventApproval } from '@/lib/types/approval';

interface ApprovalSectionProps {
  eventId: string;
  eventStatus: string;
  userRole: string;
}

export default function ApprovalSection({ eventId, eventStatus, userRole }: ApprovalSectionProps) {
  const [approvalStatus, setApprovalStatus] = useState<ApprovalStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [notes, setNotes] = useState('');
  const [showNotes, setShowNotes] = useState(false);

  useEffect(() => {
    fetchApprovalStatus();
  }, [eventId]);

  const fetchApprovalStatus = async () => {
    try {
      const response = await authFetch(`/api/approvals/check-publish?eventId=${eventId}`);
      const data = await response.json();
      if (data.data) {
        setApprovalStatus(data.data);
      }
    } catch (err) {
      console.error('Error fetching approval status:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (action: 'approve' | 'reject') => {
    if (action === 'reject' && !notes.trim()) {
      setShowNotes(true);
      return;
    }

    setActionLoading(true);
    try {
      const response = await authFetch('/api/approvals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, action, notes: notes.trim() }),
      });

      const data = await response.json();

      if (data.success) {
        alert(data.message);
        fetchApprovalStatus();
        setNotes('');
        setShowNotes(false);
      } else {
        alert(data.error || 'Terjadi kesalahan');
      }
    } catch (err) {
      console.error('Error submitting approval:', err);
      alert('Terjadi kesalahan saat提交 approval');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded w-full"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!approvalStatus) {
    return null;
  }

  // Don't show approval section for events not in approval process
  if (!['pending_approval', 'approved', 'rejected'].includes(eventStatus)) {
    return null;
  }

  const userApproval = approvalStatus.approvers.find((a) => a.status !== 'pending');
  const canUserApprove = userRole === 'super_admin' || userRole === 'stakeholder';
  const userHasActed = userApproval !== undefined;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-700">Approved</span>;
      case 'rejected':
        return <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-red-100 text-red-700">Rejected</span>;
      case 'pending':
        return <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-amber-100 text-amber-700">Menunggu</span>;
      default:
        return null;
    }
  };

  const getEventStatusBadge = (status: string) => {
    switch (status) {
      case 'pending_approval':
        return <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-amber-100 text-amber-700">Menunggu Persetujuan</span>;
      case 'approved':
        return <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-700">Disetujui</span>;
      case 'rejected':
        return <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-red-100 text-red-700">Ditolak</span>;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Status Persetujuan</h3>
              <p className="text-xs text-gray-500">Semua stakeholder & super admin harus approve</p>
            </div>
          </div>
          {getEventStatusBadge(eventStatus)}
        </div>
      </div>

      {/* Progress */}
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">Progress Persetujuan</span>
          <span className="text-sm font-semibold text-gray-900">
            {approvalStatus.totalApproved}/{approvalStatus.totalRequired} approved
          </span>
        </div>
        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-orange-500 rounded-full transition-all duration-500"
            style={{ width: `${(approvalStatus.totalApproved / approvalStatus.totalRequired) * 100}%` }}
          />
        </div>
        {approvalStatus.totalRejected > 0 && (
          <p className="text-xs text-red-600 mt-2">
            {approvalStatus.totalRejected} penolakan
          </p>
        )}
        {approvalStatus.totalPending > 0 && (
          <p className="text-xs text-amber-600 mt-2">
            {approvalStatus.totalPending} belum approve
          </p>
        )}
      </div>

      {/* Approvers List */}
      <div className="px-6 py-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Daftar Approver</h4>
        <div className="space-y-3">
          {approvalStatus.approvers.map((approver) => (
            <div key={approver.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  approver.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                  approver.status === 'rejected' ? 'bg-red-100 text-red-700' :
                  'bg-amber-100 text-amber-700'
                }`}>
                  {approver.userName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{approver.userName}</p>
                  <p className="text-xs text-gray-500 capitalize">{approver.userRole.replace('_', ' ')}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(approver.status)}
                {approver.notes && (
                  <span title={approver.notes} className="text-gray-400 cursor-help">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
        {approvalStatus.totalPending > 0 && (
          <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-100">
            <p className="text-xs text-amber-700">
              <span className="font-semibold">Menunggu persetujuan dari:</span>{' '}
              {approvalStatus.approvers
                .filter(a => a.status === 'pending')
                .map(a => a.userName)
                .join(', ')}
            </p>
          </div>
        )}
      </div>

      {/* Action Buttons - Only show for users who can approve and haven't acted yet */}
      {canUserApprove && eventStatus === 'pending_approval' && !userHasActed && (
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
          {showNotes && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Catatan {actionLoading ? '' : '(wajib untuk penolakan)'}
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Masukkan catatan..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                rows={3}
              />
            </div>
          )}
          <div className="flex gap-3">
            <button
              onClick={() => handleApproval('reject')}
              disabled={actionLoading}
              className="flex-1 px-4 py-2.5 bg-red-50 text-red-600 font-medium rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
            >
              {actionLoading ? 'Memproses...' : 'Tolak'}
            </button>
            <button
              onClick={() => handleApproval('approve')}
              disabled={actionLoading}
              className="flex-1 px-4 py-2.5 bg-emerald-500 text-white font-medium rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50"
            >
              {actionLoading ? 'Memproses...' : 'Setuju'}
            </button>
          </div>
        </div>
      )}

      {/* User already acted */}
      {canUserApprove && userHasActed && (
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Anda telah memberikan keputusan
          </div>
        </div>
      )}

      {/* All approved message */}
      {approvalStatus.allApproved && (
        <div className="px-6 py-4 border-t border-gray-100 bg-emerald-50">
          <div className="flex items-center gap-2 text-sm text-emerald-700">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Event ini sudah disetujui semua approver dan siap dipublish
          </div>
        </div>
      )}
    </div>
  );
}
