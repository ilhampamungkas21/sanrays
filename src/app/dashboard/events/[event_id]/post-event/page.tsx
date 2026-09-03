"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { use } from "react";
import { authFetch } from "@/lib/auth/client";

interface Document {
  id: string;
  category: string;
  name: string;
  fileUrl?: string;
  description?: string;
  uploadedBy?: string;
  createdAt: string;
}

interface Event {
  id: string;
  name: string;
  status: string;
}

interface Feedback {
  id: string;
  participantName?: string;
  participantEmail?: string;
  ratingOverall?: number;
  ratingContent?: number;
  ratingFacility?: number;
  ratingPemateri?: number;
  comments?: string;
  suggestions?: string;
}

export default function PostEventPage({ params }: { params: Promise<{ event_id: string }> }) {
  const { event_id } = use(params);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"dokumen" | "feedback" | "evaluasi">("dokumen");

  useEffect(() => {
    fetchData();
  }, [event_id]);

  const fetchData = async () => {
    try {
      const [eventRes, docRes, feedbackRes] = await Promise.all([
        authFetch(`/api/admin/events/${event_id}`),
        authFetch(`/api/documents?event_id=${event_id}`),
        authFetch(`/api/feedback?event_id=${event_id}`),
      ]);

      const [eventData, docData, feedbackData] = await Promise.all([
        eventRes.json(),
        docRes.json(),
        feedbackRes.json(),
      ]);

      if (eventData.data) setEvent(eventData.data);
      if (docData.data) setDocuments(docData.data);
      if (feedbackData.data) setFeedback(feedbackData.data);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Calculate feedback stats
  const avgRating = feedback.length > 0
    ? feedback.reduce((sum, f) => sum + (f.ratingOverall || 0), 0) / feedback.length
    : 0;
  const avgContent = feedback.filter(f => f.ratingContent).length > 0
    ? feedback.reduce((sum, f) => sum + (f.ratingContent || 0), 0) / feedback.filter(f => f.ratingContent).length
    : 0;
  const avgFacility = feedback.filter(f => f.ratingFacility).length > 0
    ? feedback.reduce((sum, f) => sum + (f.ratingFacility || 0), 0) / feedback.filter(f => f.ratingFacility).length
    : 0;
  const avgPemateri = feedback.filter(f => f.ratingPemateri).length > 0
    ? feedback.reduce((sum, f) => sum + (f.ratingPemateri || 0), 0) / feedback.filter(f => f.ratingPemateri).length
    : 0;

  // Group documents by category
  const docsByCategory = documents.reduce((acc, doc) => {
    const cat = doc.category || "lainnya";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(doc);
    return acc;
  }, {} as Record<string, Document[]>);

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link href="/dashboard/events" className="text-orange-600 hover:text-orange-700 font-medium">
          Daftar Event
        </Link>
        <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <Link href={`/dashboard/events/${event_id}`} className="text-orange-600 hover:text-orange-700 font-medium">
          {event?.name || "Event"}
        </Link>
        <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-gray-500">Pasca-Event</span>
      </div>

      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">📁 Pasca-Event & LPJ</h1>
        <p className="text-sm text-gray-500 mt-1">
          Dokumentasi dan evaluasi <span className="font-semibold text-orange-600">{event?.name}</span>
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">{documents.length}</div>
          <div className="text-xs text-gray-500">Dokumen</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{feedback.length}</div>
          <div className="text-xs text-gray-500">Feedback</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
          <div className="text-2xl font-bold text-emerald-600">{avgRating.toFixed(1)}/5</div>
          <div className="text-xs text-gray-500">Avg Rating</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
          <div className="text-2xl font-bold text-orange-600">{event?.status === "completed" ? "✅" : "⏳"}</div>
          <div className="text-xs text-gray-500">{event?.status === "completed" ? "Selesai" : "Dalam Proses"}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
        {[
          { key: "dokumen" as const, label: "Dokumen", icon: "📄" },
          { key: "feedback" as const, label: "Feedback", icon: "💬" },
          { key: "evaluasi" as const, label: "Evaluasi", icon: "📊" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${
              activeTab === tab.key
                ? "bg-white text-orange-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Dokumen Tab */}
      {activeTab === "dokumen" && (
        <div className="space-y-4">
          {Object.keys(docsByCategory).length > 0 ? (
            Object.entries(docsByCategory).map(([category, docs]) => (
              <div key={category} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-700 capitalize">{category} ({docs.length})</h3>
                </div>
                <div className="divide-y divide-gray-50">
                  {docs.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between px-5 py-3 hover:bg-orange-50/20 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">
                          {doc.category === "sertifikat" ? "📜" :
                           doc.category === "materi" ? "📚" :
                           doc.category === "foto" ? "📷" :
                           doc.category === "video" ? "🎬" :
                           doc.category === "lpj" ? "📋" : "📎"}
                        </span>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{doc.name}</div>
                          {doc.uploadedBy && (
                            <div className="text-xs text-gray-400">Uploaded oleh {doc.uploadedBy}</div>
                          )}
                        </div>
                      </div>
                      {doc.fileUrl && (
                        <a
                          href={doc.fileUrl}
                          target="_blank"
                          className="px-3 py-1.5 text-xs font-medium bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition-colors"
                        >
                          Download
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-xl border border-gray-100 p-10 text-center">
              <div className="text-4xl mb-3">📁</div>
              <p className="text-sm text-gray-500">Belum ada dokumen</p>
            </div>
          )}
        </div>
      )}

      {/* Feedback Tab */}
      {activeTab === "feedback" && (
        <div className="space-y-4">
          {feedback.length > 0 ? (
            <>
              {/* Rating Summary */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
                  <div className="text-2xl font-bold text-orange-600">{avgRating.toFixed(1)}</div>
                  <div className="text-xs text-gray-500">Overall</div>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{avgContent.toFixed(1)}</div>
                  <div className="text-xs text-gray-500">Konten</div>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
                  <div className="text-2xl font-bold text-emerald-600">{avgFacility.toFixed(1)}</div>
                  <div className="text-xs text-gray-500">Fasilitas</div>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">{avgPemateri.toFixed(1)}</div>
                  <div className="text-xs text-gray-500">Pemateri</div>
                </div>
              </div>

              {/* Feedback List */}
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="divide-y divide-gray-50">
                  {feedback.slice(0, 10).map((f) => (
                    <div key={f.id} className="p-5">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {f.participantName || "Anonim"}
                          </div>
                          <div className="text-xs text-gray-400">{f.participantEmail || ""}</div>
                        </div>
                        <div className="flex gap-1">
                          {f.ratingOverall && (
                            <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded">
                              {f.ratingOverall}/5
                            </span>
                          )}
                        </div>
                      </div>
                      {f.comments && (
                        <p className="mt-2 text-sm text-gray-600">{f.comments}</p>
                      )}
                      {f.suggestions && (
                        <p className="mt-1 text-xs text-gray-400 italic">Saran: {f.suggestions}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-xl border border-gray-100 p-10 text-center">
              <div className="text-4xl mb-3">📝</div>
              <p className="text-sm text-gray-500">Belum ada feedback</p>
            </div>
          )}
        </div>
      )}

      {/* Evaluasi Tab */}
      {activeTab === "evaluasi" && (
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Ringkasan Evaluasi Event</h3>
          {feedback.length > 0 ? (
            <div className="space-y-3">
              <div className="p-4 bg-emerald-50 rounded-xl">
                <div className="text-sm font-medium text-emerald-700 mb-2">💡 Tips</div>
                <ul className="text-sm text-emerald-800 space-y-1 list-disc list-inside">
                  <li>Rating rata-rata: {avgRating.toFixed(1)}/5 dari {feedback.length} feedback</li>
                  <li>Feedback positif: {feedback.filter(f => (f.ratingOverall || 0) >= 4).length} dari {feedback.length}</li>
                </ul>
              </div>
              <div className="p-4 bg-amber-50 rounded-xl">
                <div className="text-sm font-medium text-amber-700 mb-2">📝 Saran Perbaikan</div>
                <ul className="text-sm text-amber-800 space-y-1 list-disc list-inside">
                  {feedback.slice(0, 3).map((f, i) => (
                    <li key={i}>{f.suggestions || "Belum ada saran"}</li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <div className="text-3xl mb-2">📊</div>
              <p className="text-sm">Belum ada data evaluasi</p>
            </div>
          )}
        </div>
      )}

      {/* Back */}
      <div className="text-center pt-2">
        <Link
          href={`/dashboard/events/${event_id}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-orange-600 hover:text-orange-700"
        >
          ← Kembali ke Detail Event
        </Link>
      </div>
    </div>
  );
}
