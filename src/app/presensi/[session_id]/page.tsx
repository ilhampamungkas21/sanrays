"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { use } from "react";

export default function AttendancePage({ params }: { params: Promise<{ session_id: string }> }) {
  const { session_id } = use(params);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [participantName, setParticipantName] = useState("");

  useEffect(() => {
    fetchSession();
  }, [session_id]);

  const fetchSession = async () => {
    try {
      const response = await fetch(`/api/attendance-sessions/${session_id}`);
      const data = await response.json();
      if (data.data) {
        setSession(data.data);
      } else {
        setError(data.error || "Sesi tidak ditemukan");
      }
    } catch (err) {
      setError("Gagal memuat sesi");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAttendance = async () => {
    if (!participantName.trim()) {
      setError("Nama wajib diisi");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const response = await fetch(`/api/attendance-sessions/${session_id}/mark`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participantName: participantName.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitted(true);
      } else {
        setError(data.error || "Gagal mencatat presensi");
      }
    } catch (err) {
      setError("Terjadi kesalahan");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error && !session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100 p-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Sesi Tidak Ditemukan</h1>
          <p className="text-gray-500 mb-4">{error}</p>
          <Link href="/" className="text-orange-600 hover:underline">
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100 p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 bg-green-100">
            <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-green-600 mb-2">Berhasil!</h2>
          <p className="text-gray-500 mb-2">Presensi untuk sesi "{session?.sessionName}" telah tercatat.</p>
          <p className="text-lg font-medium text-gray-900 mb-6">{participantName}</p>
          <button
            onClick={() => { setSubmitted(false); setParticipantName(""); }}
            className="inline-block px-6 py-3 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition-colors"
          >
            Presensi Lagi
          </button>
        </div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
      {/* Header */}
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <img src="/logo-sanrays.png" alt="Sanrays" className="w-12 h-12 rounded-xl object-contain" />
            <div>
              <span className="text-xs text-orange-600 font-medium">PRESENSI</span>
              <h1 className="text-lg font-bold text-gray-900">{session.event?.name || 'Event'}</h1>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-lg mx-auto px-4 py-8">
        {/* Session Info */}
        <div className="text-center mb-8">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 ${
            session.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            <span className={`w-2 h-2 rounded-full ${session.isActive ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
            {session.isActive ? 'Sesi Aktif' : 'Sesi Ditutup'}
          </div>
          <h2 className="text-2xl font-bold text-gray-900">{session.sessionName}</h2>
          {session.event?.location && (
            <p className="text-gray-500 mt-2">{session.event.location}</p>
          )}
          {session.event?.date && (
            <p className="text-sm text-gray-400 mt-1">
              {new Date(session.event.date).toLocaleDateString('id-ID', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          )}
        </div>

        {/* Form */}
        {session.isActive ? (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="font-bold text-gray-900 mb-4 text-center">Isi Presensi</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Lengkap *
                </label>
                <input
                  type="text"
                  value={participantName}
                  onChange={(e) => {
                    setParticipantName(e.target.value);
                    setError("");
                  }}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-lg"
                  placeholder="Ketik nama lengkap Anda"
                  disabled={submitting}
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                  {error}
                </div>
              )}

              <button
                onClick={handleMarkAttendance}
                disabled={submitting || !participantName.trim()}
                className="w-full px-4 py-4 bg-green-500 text-white rounded-xl font-bold text-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Tandai Hadir
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Sesi Ditutup</h3>
            <p className="text-gray-500">Presensi untuk sesi ini sudah ditutup.</p>
          </div>
        )}
      </div>
    </div>
  );
}
