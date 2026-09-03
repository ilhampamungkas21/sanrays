"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { use } from "react";
import { authFetch } from "@/lib/auth/client";

const statusColors: Record<string, { bg: string; text: string; dot: string }> = {
  completed: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  active: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
  preparation: { bg: "bg-orange-50", text: "text-orange-700", dot: "bg-orange-500" },
  draft: { bg: "bg-gray-50", text: "text-gray-500", dot: "bg-gray-400" },
  cancelled: { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500" },
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

interface EventDetail {
  id: string;
  name: string;
  date: string;
  endDate?: string;
  location?: string;
  theme?: string;
  status: string;
  eventType: string;
  description?: string;
  shortDescription?: string;
  organizer?: string;
  coverGradient: string;
  highlights?: string[];
  maxParticipants: number;
  price: number;
  published: boolean;
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

export default function EventDetailPage({
  params,
}: {
  params: Promise<{ event_id: string }>;
}) {
  const { event_id } = use(params);
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchEvent();
  }, [event_id]);

  const fetchEvent = async () => {
    try {
      const response = await authFetch(`/api/admin/events/${event_id}`);
      const data = await response.json();

      if (response.ok && data.data) {
        setEvent(data.data);
      } else {
        setError(data.error || "Event tidak ditemukan");
      }
    } catch (err) {
      setError("Gagal memuat data event");
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

  if (error || !event) {
    return (
      <div className="text-center py-20">
        <div className="text-5xl mb-4">❌</div>
        <h2 className="text-xl font-bold text-gray-900">Event Tidak Ditemukan</h2>
        <p className="text-sm text-gray-500 mt-2">
          Event dengan ID <span className="font-mono font-semibold">{event_id}</span> tidak ada.
        </p>
        <Link
          href="/dashboard/events"
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-orange-500 text-white text-sm font-semibold rounded-xl hover:bg-orange-600 transition-colors"
        >
          ← Kembali ke Daftar Event
        </Link>
      </div>
    );
  }

  const sc = statusColors[event.status] || statusColors.draft;
  const netProfit = (event.budget || 0) - (event.spent || 0);
  const budgetPct = event.budget && event.budget > 0 ? Math.round(((event.spent || 0) / event.budget) * 100) : 0;
  const learningDelta = (event.postTestAvg || 0) - (event.preTestAvg || 0);

  const modules = [
    {
      icon: "✅",
      title: "Pra-Event",
      subtitle: "Checklist & persiapan",
      href: `/dashboard/events/${event_id}/pre-event`,
      stat: `${event.checklistDone || 0}/${event.checklistTotal || 0}`,
      statLabel: "task selesai",
      color: "from-orange-400 to-orange-500",
    },
    {
      icon: "👥",
      title: "Peserta & Event",
      subtitle: "Demografi, absensi, evaluasi",
      href: `/dashboard/events/${event_id}/event`,
      stat: `${event.participants || 0}`,
      statLabel: "peserta",
      color: "from-blue-400 to-blue-500",
    },
    {
      icon: "💰",
      title: "Keuangan",
      subtitle: "Income, expense, anggaran",
      href: `/dashboard/events/${event_id}/financial`,
      stat: formatCurrency(netProfit),
      statLabel: "net profit",
      color: "from-emerald-400 to-emerald-500",
    },
    {
      icon: "📁",
      title: "Pasca-Event & LPJ",
      subtitle: "Galeri, materi, dokumen",
      href: `/dashboard/events/${event_id}/post-event`,
      stat: event.status === "completed" ? "Terbaru" : "—",
      statLabel: "dokumentasi",
      color: "from-purple-400 to-purple-500",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link
          href="/dashboard/events"
          className="text-orange-600 hover:text-orange-700 font-medium"
        >
          Daftar Event
        </Link>
        <span className="text-gray-400">/</span>
        <span className="text-gray-500 font-medium truncate">{event.name}</span>
      </div>

      {/* Header Card */}
      <div className={`rounded-2xl bg-gradient-to-r ${event.coverGradient} p-6 text-white`}>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold bg-white/20`}>
                {event.status === "completed" ? "Selesai" :
                 event.status === "active" ? "Berlangsung" :
                 event.status === "preparation" ? "Persiapan" : "Draft"}
              </span>
              {event.eventType === "internal" && (
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white/20">
                  Internal
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold mb-1">{event.name}</h1>
            <p className="text-white/80 text-sm">{event.location || "-"}</p>
          </div>
          <Link
            href={`/admin/kelola/${event.id}`}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-medium transition-colors"
          >
            Kelola Event
          </Link>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="text-2xl font-bold text-gray-900">{event.participants || 0}</div>
          <div className="text-sm text-gray-500">Peserta</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="text-2xl font-bold text-gray-900">{event.date}</div>
          <div className="text-sm text-gray-500">Tanggal Event</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="text-2xl font-bold text-emerald-600">{formatCurrency(netProfit)}</div>
          <div className="text-sm text-gray-500">Net Profit</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="text-2xl font-bold text-orange-600">
            {event.csat ? event.csat : "—"}
          </div>
          <div className="text-sm text-gray-500">CSAT Score</div>
        </div>
      </div>

      {/* Module Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {modules.map((mod) => (
          <Link
            key={mod.href}
            href={mod.href}
            className="group bg-white rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all overflow-hidden"
          >
            <div className={`h-1.5 bg-gradient-to-r ${mod.color}`} />
            <div className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl">{mod.icon}</span>
                <svg
                  className="w-5 h-5 text-gray-300 group-hover:text-orange-500 group-hover:translate-x-1 transition-all"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <div className="text-lg font-bold text-gray-900 mb-1">{mod.title}</div>
              <div className="text-sm text-gray-500 mb-3">{mod.subtitle}</div>
              <div className="text-xl font-bold text-gray-900">{mod.stat}</div>
              <div className="text-xs text-gray-400">{mod.statLabel}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Progress Section */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Progress Event</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Progress Keseluruhan</span>
              <span className="font-semibold text-gray-900">{event.progress || 0}%</span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  event.progress === 100 ? "bg-emerald-500" : "bg-orange-500"
                }`}
                style={{ width: `${event.progress || 0}%` }}
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {event.checklistDone || 0}/{event.checklistTotal || 0}
              </div>
              <div className="text-sm text-gray-500">Checklist Selesai</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {event.preTestAvg || 0} → {event.postTestAvg || 0}
              </div>
              <div className="text-sm text-gray-500">Test Score</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-emerald-600">
                {learningDelta > 0 ? `+${learningDelta}` : learningDelta}
              </div>
              <div className="text-sm text-gray-500">Learning Delta</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
