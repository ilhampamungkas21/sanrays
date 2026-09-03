"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getAuthState, authFetch } from "@/lib/auth/client";

const statusColors: Record<string, { bg: string; text: string; dot: string }> = {
  completed: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  active: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
  preparation: { bg: "bg-orange-50", text: "text-orange-700", dot: "bg-orange-500" },
  draft: { bg: "bg-gray-50", text: "text-gray-500", dot: "bg-gray-400" },
  cancelled: { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500" },
};

const statusLabels: Record<string, string> = {
  completed: "Selesai",
  active: "Berlangsung",
  preparation: "Persiapan",
  draft: "Draft",
  cancelled: "Dibatalkan",
};

const statusFilters = [
  { value: "all", label: "Semua" },
  { value: "active", label: "Berlangsung" },
  { value: "preparation", label: "Persiapan" },
  { value: "completed", label: "Selesai" },
  { value: "draft", label: "Draft" },
];

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

interface Event {
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
  // Extra UI properties
  participants?: number;
  budget?: number;
  spent?: number;
  csat?: number;
  progress?: number;
  checklistDone?: number;
  checklistTotal?: number;
}

export default function EventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    const authState = getAuthState();
    if (!authState.isAuthenticated) {
      router.push("/login");
      return;
    }
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

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (event.location?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
      (event.theme?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    const matchesFilter = activeFilter === "all" || event.status === activeFilter;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Daftar Event</h1>
          <p className="text-sm text-gray-500 mt-1">
            {events.length} event terdaftar · Klik event untuk melihat detail
          </p>
        </div>
        <Link
          href="/admin/events"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-orange-500 text-white text-sm font-semibold rounded-xl hover:bg-orange-600 transition-colors shadow-sm shadow-orange-200"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Tambah Event Baru
        </Link>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 flex items-center gap-2 px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200 focus-within:border-orange-300 focus-within:ring-2 focus-within:ring-orange-100 transition-all">
            <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Cari nama event, lokasi, atau tema..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-sm text-gray-700 outline-none w-full placeholder:text-gray-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* View toggle */}
          <div className="flex items-center bg-gray-50 rounded-xl border border-gray-200 p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === "grid"
                  ? "bg-white text-orange-600 shadow-sm"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === "list"
                  ? "bg-white text-orange-600 shadow-sm"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Status Filter Pills */}
        <div className="flex flex-wrap gap-2 mt-4">
          {statusFilters.map((filter) => {
            const count =
              filter.value === "all"
                ? events.length
                : events.filter((e) => e.status === filter.value).length;
            return (
              <button
                key={filter.value}
                onClick={() => setActiveFilter(filter.value)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all ${
                  activeFilter === filter.value
                    ? "bg-orange-500 text-white shadow-sm shadow-orange-200"
                    : "bg-gray-50 text-gray-600 border border-gray-200 hover:border-orange-300 hover:text-orange-600"
                }`}
              >
                {filter.label}
                <span
                  className={`px-1.5 py-0.5 text-[10px] rounded-full ${
                    activeFilter === filter.value
                      ? "bg-white/20 text-white"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid View */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredEvents.map((event) => {
            const sc = statusColors[event.status] || statusColors.draft;
            const budgetUsed = event.budget && event.budget > 0 ? Math.round(((event.spent || 0) / event.budget) * 100) : 0;
            return (
              <Link
                key={event.id}
                href={`/dashboard/events/${event.id}`}
                className="group bg-white rounded-2xl border border-gray-100 hover:border-orange-200 hover:shadow-lg hover:shadow-orange-100/50 transition-all duration-300 overflow-hidden"
              >
                {/* Color strip top */}
                <div
                  className={`h-1.5 ${
                    event.status === "completed"
                      ? "bg-gradient-to-r from-emerald-400 to-emerald-500"
                      : event.status === "active"
                      ? "bg-gradient-to-r from-blue-400 to-blue-500"
                      : event.status === "preparation"
                      ? "bg-gradient-to-r from-orange-400 to-orange-500"
                      : "bg-gradient-to-r from-gray-300 to-gray-400"
                  }`}
                />

                <div className="p-5">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full ${sc.bg} ${sc.text}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                          {statusLabels[event.status]}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-gray-900 group-hover:text-orange-600 transition-colors truncate">
                        {event.name}
                      </h3>
                    </div>
                    <svg
                      className="w-5 h-5 text-gray-300 group-hover:text-orange-500 group-hover:translate-x-0.5 transition-all shrink-0 mt-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-gray-500 mt-2 line-clamp-2 leading-relaxed">
                    {event.shortDescription || event.description}
                  </p>

                  {/* Meta info */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {event.date}
                      {event.endDate && ` - ${event.endDate}`}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      {event.location || "-"}
                    </span>
                  </div>

                  {/* Theme badge */}
                  {event.theme && (
                    <div className="mt-3">
                      <span className="inline-flex px-2 py-0.5 text-[10px] font-medium bg-orange-50 text-orange-600 rounded-md">
                        {event.theme}
                      </span>
                    </div>
                  )}

                  {/* Stats row */}
                  <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-gray-100">
                    <div className="text-center">
                      <div className="text-sm font-bold text-gray-900">{event.participants || 0}</div>
                      <div className="text-[10px] text-gray-400">Peserta</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-bold text-gray-900">{budgetUsed}%</div>
                      <div className="text-[10px] text-gray-400">Budget</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-bold text-orange-600">
                        {(event.csat && event.csat > 0) ? event.csat : "—"}
                      </div>
                      <div className="text-[10px] text-gray-400">CSAT</div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-[10px] mb-1">
                      <span className="text-gray-400">Progress</span>
                      <span className="font-semibold text-gray-600">{event.progress || 0}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          event.progress === 100
                            ? "bg-emerald-500"
                            : (event.progress || 0) >= 50
                            ? "bg-orange-500"
                            : "bg-orange-300"
                        }`}
                        style={{ width: `${event.progress || 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">
                    Event
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">
                    Tanggal
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">
                    Lokasi
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">
                    Status
                  </th>
                  <th className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">
                    Progress
                  </th>
                  <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">
                    Peserta
                  </th>
                  <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">
                    CSAT
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredEvents.map((event) => {
                  const sc = statusColors[event.status] || statusColors.draft;
                  return (
                    <tr
                      key={event.id}
                      className="hover:bg-orange-50/30 transition-colors cursor-pointer"
                    >
                      <td className="px-5 py-4">
                        <Link href={`/dashboard/events/${event.id}`} className="block">
                          <div className="text-sm font-semibold text-gray-900 hover:text-orange-600 transition-colors">
                            {event.name}
                          </div>
                          <div className="text-[10px] text-gray-400 mt-0.5">
                            {event.id} · {event.theme || "-"}
                          </div>
                        </Link>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-600">
                        {event.date}
                        {event.endDate && ` - ${event.endDate}`}
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-600">{event.location || "-"}</td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-semibold rounded-full ${sc.bg} ${sc.text}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                          {statusLabels[event.status]}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 w-24">
                          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                event.progress === 100 ? "bg-emerald-500" : "bg-orange-500"
                              }`}
                              style={{ width: `${event.progress || 0}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-semibold text-gray-500 w-6 text-right">
                            {event.progress || 0}%
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm font-medium text-gray-900 text-right">
                        {event.participants || 0}
                      </td>
                      <td className="px-5 py-4 text-sm font-medium text-orange-600 text-right">
                        {(event.csat && event.csat > 0) ? event.csat : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty state */}
      {filteredEvents.length === 0 && (
        <div className="text-center py-16">
          <div className="text-4xl mb-4">📭</div>
          <h3 className="text-lg font-semibold text-gray-900">Tidak ada event ditemukan</h3>
          <p className="text-sm text-gray-500 mt-1">
            Coba ubah filter atau kata kunci pencarian Anda
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setActiveFilter("all");
            }}
            className="mt-4 px-4 py-2 text-sm font-medium text-orange-600 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
          >
            Reset Filter
          </button>
        </div>
      )}
    </div>
  );
}
