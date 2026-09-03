"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { use } from "react";
import { authFetch } from "@/lib/auth/client";

interface Checklist {
  id: string;
  eventId?: string;
  category: string;
  task: string;
  pic?: string;
  status: string;
  dueDate?: string;
  priority: string;
}

interface Event {
  id: string;
  name: string;
}

const categories = ["all", "acara", "konsumsi", "perlengkapan", "humas", "keuangan", "dokumentasi", "timing", "lainnya"];

const statusConfig: Record<string, { label: string; color: string }> = {
  completed: { label: "Selesai", color: "bg-emerald-100 text-emerald-700" },
  in_progress: { label: "Dikerjakan", color: "bg-blue-100 text-blue-700" },
  pending: { label: "Pending", color: "bg-gray-100 text-gray-600" },
  cancelled: { label: "Batal", color: "bg-red-100 text-red-600" },
};

const categoryColors: Record<string, string> = {
  acara: "bg-orange-100 text-orange-700",
  konsumsi: "bg-amber-100 text-amber-700",
  perlengkapan: "bg-blue-100 text-blue-700",
  humas: "bg-purple-100 text-purple-700",
  keuangan: "bg-emerald-100 text-emerald-700",
  dokumentasi: "bg-pink-100 text-pink-700",
  timing: "bg-cyan-100 text-cyan-700",
  lainnya: "bg-gray-100 text-gray-700",
};

export default function PreEventDetailPage({ params }: { params: Promise<{ event_id: string }> }) {
  const { event_id } = use(params);
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");

  useEffect(() => {
    fetchData();
  }, [event_id]);

  const fetchData = async () => {
    try {
      const [eventRes, checklistRes] = await Promise.all([
        authFetch(`/api/admin/events/${event_id}`),
        authFetch(`/api/checklists?event_id=${event_id}`),
      ]);

      const [eventData, checklistData] = await Promise.all([
        eventRes.json(),
        checklistRes.json(),
      ]);

      if (eventData.data) setEvent(eventData.data);
      if (checklistData.data) setChecklists(checklistData.data);
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

  const completed = checklists.filter((i) => i.status === "completed").length;
  const percentage = checklists.length > 0 ? Math.round((completed / checklists.length) * 100) : 0;

  const filtered = activeCategory === "all" ? checklists : checklists.filter((item) => item.category === activeCategory);

  const categoryStats = categories.slice(1).map((cat) => {
    const catItems = checklists.filter((i) => i.category === cat);
    const catDone = catItems.filter((i) => i.status === "completed").length;
    return { cat, done: catDone, total: catItems.length };
  });

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
        <span className="text-gray-500">Pra-Event</span>
      </div>

      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">✅ Pra-Event Checklist</h1>
        <p className="text-sm text-gray-500 mt-1">
          Progress persiapan <span className="font-semibold text-orange-600">{event?.name || "Event"}</span>
        </p>
      </div>

      {/* progress Overview */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Total Progress Persiapan</h2>
            <p className="text-xs text-gray-400 mt-0.5">{completed} dari {checklists.length} task selesai</p>
          </div>
          <div className="text-3xl font-bold text-orange-600">{percentage}%</div>
        </div>
        <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full transition-all duration-700"
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Per-divisi breakdown */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
          {categoryStats.filter(s => s.total > 0).map(({ cat, done, total }) => (
            <div key={cat} className="p-3 bg-gray-50 rounded-xl text-center hover:bg-orange-50 transition-colors">
              <div className="text-xs text-gray-500 capitalize font-medium">{cat}</div>
              <div className="text-lg font-bold text-gray-900 mt-1">
                {done}<span className="text-gray-400 font-normal">/{total}</span>
              </div>
              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden mt-2">
                <div
                  className="h-full bg-orange-500 rounded-full"
                  style={{ width: `${total > 0 ? (done / total) * 100 : 0}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 text-sm font-medium rounded-xl transition-all ${
              activeCategory === cat
                ? "bg-orange-500 text-white shadow-sm shadow-orange-200"
                : "bg-white text-gray-600 border border-gray-200 hover:border-orange-300"
            }`}
          >
            {cat === "all" ? "Semua" : cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3">Task</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3">Kategori</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3">PIC</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3">Status</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3">Due Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-orange-50/20 transition-colors">
                  <td className="px-5 py-3.5">
                    <span className="text-sm font-medium text-gray-900">{item.task}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex px-2.5 py-0.5 text-[10px] font-semibold rounded-full capitalize ${categoryColors[item.category] || "bg-gray-100 text-gray-600"}`}>
                      {item.category}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-600">{item.pic || "-"}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex px-2.5 py-0.5 text-[10px] font-semibold rounded-full ${statusConfig[item.status]?.color || "bg-gray-100 text-gray-600"}`}>
                      {statusConfig[item.status]?.label || item.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-500">{item.dueDate || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            Tidak ada checklist untuk kategori ini
          </div>
        )}
      </div>

      {/* Back */}
      <div className="text-center pt-2">
        <Link href={`/dashboard/events/${event_id}`} className="inline-flex items-center gap-2 text-sm font-medium text-orange-600 hover:text-orange-700">
          ← Kembali ke Detail Event
        </Link>
      </div>
    </div>
  );
}
