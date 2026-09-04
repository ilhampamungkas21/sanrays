"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { authFetch, getAuthState } from '@/lib/auth/client';
import { hasPermission } from '@/lib/rbac';

interface PendingEvent {
  eventId: string;
  eventName: string;
  eventDate: string;
  location?: string;
  status?: string;
  coverGradient?: string;
  shortDescription?: string;
}

interface ActionedEvent extends PendingEvent {
  status: string;
  notes?: string;
}

export default function ApprovalsPage() {
  const [activeTab, setActiveTab] = useState<'pending' | 'actioned'>('pending');
  const [pendingEvents, setPendingEvents] = useState<PendingEvent[]>([]);
  const [actionedEvents, setActionedEvents] = useState<ActionedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<PendingEvent | null>(null);
  const [notes, setNotes] = useState('');

  const authState = getAuthState();
  const canViewApproval = authState.user && hasPermission(authState.user.role, 'approval:view');

  useEffect(() => {
    fetchEvents();
  }, [activeTab]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await authFetch(`/api/approvals/my-pending?type=${activeTab}`);
      const data = await response.json();
      if (data.data) {
        if (activeTab === 'pending') {
          setPendingEvents(data.data);
        } else {
          setActionedEvents(data.data);
        }
      }
    } catch (err) {
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (eventId: string, action: 'approve' | 'reject') => {
    if (action === 'reject' && !notes.trim()) {
      setSelectedEvent(pendingEvents.find((e) => e.eventId === eventId) || null);
      return;
    }

    setActionLoading(eventId);
    try {
      const response = await authFetch('/api/approvals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, action, notes: notes.trim() }),
      });

      const data = await response.json();

      if (data.success) {
        alert(data.message);
        setNotes('');
        setSelectedEvent(null);
        fetchEvents();
      } else {
        alert(data.error || 'Terjadi kesalahan');
      }
    } catch (err) {
      console.error('Error submitting approval:', err);
      alert('Terjadi kesalahan saat提交 approval');
    } finally {
      setActionLoading(null);
    }
  };

  if (!canViewApproval) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-4xl mb-3">🔒</div>
          <p className="text-sm font-medium text-gray-900">Akses Ditolak</p>
          <p className="text-xs text-gray-500 mt-1">Anda tidak memiliki权限 untuk melihat halaman ini</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Persetujuan Event</h1>
        <p className="text-sm text-gray-500 mt-1">
          Review dan setujui event sebelum dipublish ke landing page
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('pending')}
          className={`pb-3 px-1 text-sm font-medium transition-colors relative ${
            activeTab === 'pending'
              ? 'text-orange-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Menunggu Persetujuan
          {pendingEvents.length > 0 && (
            <span className="ml-2 px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-100 text-amber-700">
              {pendingEvents.length}
            </span>
          )}
          {activeTab === 'pending' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('actioned')}
          className={`pb-3 px-1 text-sm font-medium transition-colors relative ${
            activeTab === 'actioned'
              ? 'text-orange-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Riwayat
          {activeTab === 'actioned' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500" />
          )}
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 p-6 animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-1/3 mb-3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/4"></div>
            </div>
          ))}
        </div>
      ) : activeTab === 'pending' ? (
        pendingEvents.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-10 text-center">
            <div className="text-4xl mb-3">✅</div>
            <p className="text-sm font-medium text-gray-900">Semua sudah approve!</p>
            <p className="text-xs text-gray-500 mt-1">Tidak ada event yang menunggu persetujuan Anda</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingEvents.map((event) => (
              <div
                key={event.eventId}
                className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className={`h-1.5 bg-gradient-to-r ${event.coverGradient || 'from-orange-400 to-orange-600'}`} />
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {event.eventName}
                      </h3>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {event.eventDate}
                        </span>
                        {event.location && (
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            </svg>
                            {event.location}
                          </span>
                        )}
                      </div>
                      {event.shortDescription && (
                        <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                          {event.shortDescription}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Notes input for reject */}
                  {selectedEvent?.eventId === event.eventId && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Catatan Penolakan (wajib)
                      </label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Masukkan alasan penolakan..."
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        rows={3}
                      />
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => setSelectedEvent(null)}
                          className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800"
                        >
                          Batal
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="mt-6 flex gap-3">
                    <button
                      onClick={() => {
                        setSelectedEvent(event);
                        setNotes('');
                      }}
                      disabled={actionLoading === event.eventId}
                      className="flex-1 px-4 py-2.5 bg-red-50 text-red-600 font-medium rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                    >
                      {actionLoading === event.eventId ? 'Memproses...' : 'Tolak'}
                    </button>
                    <button
                      onClick={() => handleApproval(event.eventId, 'approve')}
                      disabled={actionLoading === event.eventId}
                      className="flex-1 px-4 py-2.5 bg-emerald-500 text-white font-medium rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50"
                    >
                      {actionLoading === event.eventId ? 'Memproses...' : 'Setuju'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : actionedEvents.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-10 text-center">
          <div className="text-4xl mb-3">📋</div>
          <p className="text-sm font-medium text-gray-900">Belum ada riwayat</p>
          <p className="text-xs text-gray-500 mt-1">Event yang sudah Anda setujui/ditolak akan muncul di sini</p>
        </div>
      ) : (
        <div className="space-y-4">
          {actionedEvents.map((event) => (
            <Link
              key={event.eventId}
              href={`/dashboard/events/${event.eventId}`}
              className="block bg-white rounded-xl border border-gray-100 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{event.eventName}</h3>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <span>{event.eventDate}</span>
                    {event.location && <span>{event.location}</span>}
                  </div>
                </div>
                <span
                  className={`px-3 py-1 text-sm font-semibold rounded-full ${
                    event.status === 'approved'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {event.status === 'approved' ? 'Disetujui' : 'Ditolak'}
                </span>
              </div>
              {event.notes && (
                <p className="mt-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                  <span className="font-medium">Catatan:</span> {event.notes}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
