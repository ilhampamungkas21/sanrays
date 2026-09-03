"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { getAuthState, authFetch } from "@/lib/auth/client";
import QRCode from "qrcode";

export default function SessionDetailPage() {
  const params = useParams();
  const event_id = params.event_id as string;
  const session_id = params.session_id as string;
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [event, setEvent] = useState<any>(null);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    checkAuth();
    fetchData();
  }, [event_id, session_id]);

  const checkAuth = () => {
    const authState = getAuthState();
    if (!authState.isAuthenticated) {
      router.push("/login");
    }
  };

  const fetchData = async () => {
    try {
      // Fetch session
      const sessionRes = await authFetch(`/api/attendance-sessions/${session_id}`);
      const sessionData = await sessionRes.json();
      if (sessionData.data) {
        setSession(sessionData.data);
        generateQR(sessionData.data.id);
      }

      // Fetch event
      const eventRes = await authFetch(`/api/admin/events/${event_id}`);
      const eventData = await eventRes.json();
      if (eventData.data) {
        setEvent(eventData.data);
      }

      // Fetch attendance
      const attRes = await authFetch(`/api/attendance?event_id=${event_id}&session_id=${session_id}`);
      const attData = await attRes.json();
      setAttendance(attData.data || []);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const generateQR = async (sid: string) => {
    try {
      const baseUrl = window.location.origin;
      const url = `${baseUrl}/presensi/${sid}`;
      const canvas = document.createElement('canvas');
      await QRCode.toCanvas(canvas, url, {
        width: 300,
        margin: 2,
        color: { dark: '#1f2937', light: '#ffffff' },
      });
      setQrDataUrl(canvas.toDataURL('image/png'));
    } catch (err) {
      console.error("QR generation error:", err);
    }
  };

  const downloadQR = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.download = `QR-Presensi-${session?.sessionName || 'Event'}.png`;
    link.href = qrDataUrl;
    link.click();
  };

  const copyLink = () => {
    const baseUrl = window.location.origin;
    const link = `${baseUrl}/presensi/${session_id}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-xl font-bold text-gray-900 mb-2">Sesi Tidak Ditemukan</h1>
          <Link href={`/admin/kelola/${event_id}`} className="text-orange-600 hover:underline">
            Kembali ke Kelola Event
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <Link href={`/admin/kelola/${event_id}?tab=presensi`} className="text-sm text-orange-600 hover:underline flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Kembali
              </Link>
              <h1 className="text-xl font-bold text-gray-900 mt-1">{session.sessionName}</h1>
              <p className="text-sm text-gray-500">{event?.name}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${session.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {session.isActive ? 'Aktif' : 'Ditutup'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* QR & Info Section */}
          <div className="lg:col-span-1 space-y-6">
            {/* QR Card */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="p-6 text-center">
                <h2 className="text-lg font-bold text-gray-900 mb-4">QR Code Presensi</h2>
                <div className="flex justify-center mb-4">
                  <div className="bg-white p-4 rounded-2xl border-2 border-gray-200">
                    {qrDataUrl ? (
                      <img src={qrDataUrl} alt="QR Code" className="w-48 h-48" />
                    ) : (
                      <div className="w-48 h-48 flex items-center justify-center">
                        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <button
                    onClick={downloadQR}
                    disabled={!qrDataUrl}
                    className="w-full px-4 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download QR
                  </button>
                  <button
                    onClick={copyLink}
                    className={`w-full px-4 py-3 rounded-xl font-medium flex items-center justify-center gap-2 ${
                      copied
                        ? 'bg-green-500 text-white'
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                    }`}
                  >
                    {copied ? (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Link Tersalin!
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                        </svg>
                        Salin Link
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Session Info */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="font-bold text-gray-900 mb-4">Info Sesi</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">Nama Sesi</span>
                  <span className="font-medium text-gray-900">{session.sessionName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Kode</span>
                  <span className="font-mono font-bold text-gray-900">{session.sessionCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status</span>
                  <span className={`font-medium ${session.isActive ? 'text-green-600' : 'text-red-600'}`}>
                    {session.isActive ? 'Aktif' : 'Ditutup'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Total Hadir</span>
                  <span className="font-bold text-orange-600">{attendance.length} orang</span>
                </div>
              </div>
            </div>
          </div>

          {/* Attendance List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Daftar Hadir</h2>
                  <p className="text-sm text-gray-500">{session.sessionName}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                    {attendance.length} peserta
                  </span>
                  <button
                    onClick={fetchData}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                </div>
              </div>

              {attendance.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {attendance.map((att, idx) => (
                    <div key={att.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-green-600 font-bold">{idx + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {att.participantName || att.participant_id || 'Peserta'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {att.createdAt
                              ? new Date(att.createdAt).toLocaleString('id-ID', {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : '-'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          att.status === 'present' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                        }`}>
                          Hadir
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-6 py-16 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">Belum Ada yang Presensi</h3>
                  <p className="text-gray-500">Peserta bisa scan QR Code untuk mencatat kehadiran</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
