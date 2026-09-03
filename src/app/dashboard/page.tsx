"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getAuthState, authFetch } from "@/lib/auth/client";

/* ────────────────────────────────────────────────────────────────
 *  EXECUTIVE SUMMARY DASHBOARD (Modul 1)
 * ──────────────────────────────────────────────────────────────── */

interface DashboardEvent {
  id: string;
  name: string;
  date: string;
  endDate?: string;
  location?: string;
  theme?: string;
  status: string;
  description?: string;
  shortDescription?: string;
  organizer?: string;
  coverGradient: string;
  highlights?: string[];
  maxParticipants: number;
  price: number;
  earlyBirdPrice?: number;
  published: boolean;
  participants?: number;
  budget?: number;
  spent?: number;
  csat?: number;
  progress?: number;
  checklistDone?: number;
  checklistTotal?: number;
}

const statusLabels: Record<string, string> = {
  completed: "Selesai",
  active: "Berlangsung",
  preparation: "Persiapan",
  draft: "Draft",
  cancelled: "Dibatalkan",
};


const statusColors: Record<string, string> = {
  completed: "bg-emerald-100 text-emerald-700",
  active: "bg-blue-100 text-blue-700",
  preparation: "bg-orange-100 text-orange-700",
  draft: "bg-gray-100 text-gray-500",
  cancelled: "bg-red-100 text-red-700",
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function DashboardPage() {
  const [events, setEvents] = useState<DashboardEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const authState = getAuthState();
    if (!authState.isAuthenticated) return;
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await authFetch("/api/admin/events");
      const data = await response.json();
      if (data.data) {
        setEvents(data.data);
      }
    } catch (err) {
      console.error("Error fetching events:", err);
    } finally {
      setLoading(false);
    }
  };

  // Compute stats dynamically from real data
  const totalEvents = events.length;
  const totalParticipants = events.reduce((sum, e) => sum + (e.participants || 0), 0);
  const totalBudget = events.reduce((sum, e) => sum + (e.budget || 0), 0);
  const totalSpent = events.reduce((sum, e) => sum + (e.spent || 0), 0);
  const eventsWithCsat = events.filter((e) => e.csat && e.csat > 0);
  const avgCsat =
    eventsWithCsat.length > 0
      ? eventsWithCsat.reduce((sum, e) => sum + (e.csat || 0), 0) / eventsWithCsat.length
      : 0;
  const activeEvents = events.filter(
    (e) => e.status === "active" || e.status === "preparation"
  ).length;

  const quickStats = [
    {
      label: "Total Event",
      value: String(totalEvents),
      change: `${activeEvents} event aktif`,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      color: "bg-orange-100 text-orange-600",
    },
    {
      label: "Total Peserta",
      value: String(totalParticipants),
      change: totalEvents > 0 ? `dari ${totalEvents} event` : "Belum ada data",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 6v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      color: "bg-blue-100 text-blue-600",
    },
    {
      label: "Total Anggaran",
      value: totalBudget > 0 ? formatCurrency(totalBudget) : "Rp 0",
      change: totalSpent > 0 ? `Terpakai ${formatCurrency(totalSpent)}` : "Belum ada pengeluaran",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: "bg-emerald-100 text-emerald-600",
    },
    {
      label: "Rata-rata CSAT",
      value: avgCsat > 0 ? avgCsat.toFixed(1) : "—",
      change: avgCsat >= 4 ? "Sangat Baik" : avgCsat >= 3 ? "Baik" : eventsWithCsat.length > 0 ? "Perlu Ditingkatkan" : "Belum ada data",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: "bg-amber-100 text-amber-600",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Executive Summary</h1>
        <p className="text-sm text-gray-500 mt-1">
          Ringkasan seluruh event dan performa PT Sanrays
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stat.value}
                </p>
                <p className="text-xs text-gray-400 mt-1">{stat.change}</p>
              </div>
              <div
                className={`${stat.color} w-12 h-12 rounded-xl flex items-center justify-center text-xl`}
              >
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Event List */}
      <div className="bg-white rounded-xl border border-gray-100">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Daftar Event
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Klik event untuk melihat detail
            </p>
          </div>
          <Link
            href="/admin/events"
            className="text-sm font-medium text-orange-600 hover:text-orange-700 transition-colors"
          >
            Lihat Semua Event →
          </Link>
        </div>

        <div className="divide-y divide-gray-50">
          {events.length === 0 ? (
            <div className="p-10 text-center">
              <div className="text-4xl mb-3">📭</div>
              <p className="text-sm font-medium text-gray-900">Belum ada event</p>
              <p className="text-xs text-gray-400 mt-1">
                Mulai buat event pertama Anda
              </p>
              <Link
                href="/admin/events"
                className="inline-block mt-4 px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-colors"
              >
                + Buat Event
              </Link>
            </div>
          ) : (
          events.map((event) => (
            <Link
              key={event.id}
              href={`/dashboard/events/${event.id}`}
              className="block p-5 hover:bg-orange-50/30 transition-colors"
            >
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                {/* Event info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <h3 className="text-sm font-semibold text-gray-900 truncate">
                      {event.name}
                    </h3>
                    <span
                      className={`px-2.5 py-0.5 text-[10px] font-semibold rounded-full ${
                        statusColors[event.status]
                      }`}
                    >
                      {statusLabels[event.status] || event.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {event.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {event.location}
                    </span>
                  </div>
                </div>

                {/* Progress */}
                <div className="w-full lg:w-48">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-500">Progress</span>
                    <span className="font-semibold text-gray-700">
                       {event.progress || 0}%
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        event.progress === 100
                          ? "bg-emerald-500"
                          : "bg-orange-500"
                      }`}
                      style={{ width: `${event.progress || 0}%` }}
                    />
                  </div>
                </div>

                {/* Metrics */}
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-sm font-bold text-gray-900">
                      {event.participants || 0}
                    </div>
                    <div className="text-[10px] text-gray-400">Peserta</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-bold text-gray-900">
                      {formatCurrency(event.spent || 0)}
                    </div>
                    <div className="text-[10px] text-gray-400">
                      dari {formatCurrency(event.budget || 0)}
                    </div>
                  </div>
                  {event.csat && event.csat > 0 && (
                    <div className="text-center">
                      <div className="text-sm font-bold text-orange-600">
                        {event.csat}
                      </div>
                      <div className="text-[10px] text-gray-400">CSAT</div>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          )))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/dashboard/events"
          className="group bg-white rounded-xl border border-gray-100 p-5 hover:border-orange-200 hover:shadow-md transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 group-hover:bg-amber-500 flex items-center justify-center text-amber-600 group-hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">
                Semua Event
              </div>
              <div className="text-xs text-gray-400">Daftar & kelola event</div>
            </div>
          </div>
        </Link>

      </div>
    </div>
  );
}