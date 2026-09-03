"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { use } from "react";
import { authFetch } from "@/lib/auth/client";

interface Participant {
  id: string;
  name: string;
  email?: string;
  company?: string;
  city?: string;
  gender?: string;
  status: string;
}

interface Event {
  id: string;
  name: string;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  attended: { label: "Hadir", color: "bg-emerald-100 text-emerald-700" },
  confirmed: { label: "Dikonfirmasi", color: "bg-blue-100 text-blue-700" },
  registered: { label: "Terdaftar", color: "bg-gray-100 text-gray-600" },
  cancelled: { label: "Dibatalkan", color: "bg-red-100 text-red-600" },
};

export default function EventDetailPesertaPage({ params }: { params: Promise<{ event_id: string }> }) {
  const { event_id } = use(params);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchData();
  }, [event_id]);

  const fetchData = async () => {
    try {
      const [eventRes, participantRes] = await Promise.all([
        authFetch(`/api/admin/events/${event_id}`),
        authFetch(`/api/participants?event_id=${event_id}`),
      ]);

      const [eventData, participantData] = await Promise.all([
        eventRes.json(),
        participantRes.json(),
      ]);

      if (eventData.data) setEvent(eventData.data);
      if (participantData.data) setParticipants(participantData.data);
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

  const filtered = participants.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.company?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
      (p.city?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
  );

  // Demographics
  const companies = [...new Set(participants.map((p) => p.company).filter(Boolean))]
    .map((c) => ({
      name: c,
      count: participants.filter((p) => p.company === c).length,
    }))
    .sort((a, b) => b.count - a.count);

  const cities = [...new Set(participants.map((p) => p.city).filter(Boolean))]
    .map((c) => ({
      name: c,
      count: participants.filter((p) => p.city === c).length,
    }))
    .sort((a, b) => b.count - a.count);

  const maleCount = participants.filter((p) => p.gender?.toLowerCase() === "male" || p.gender?.toLowerCase() === "laki-laki").length;
  const femaleCount = participants.filter((p) => p.gender?.toLowerCase() === "female" || p.gender?.toLowerCase() === "perempuan").length;
  const attendedCount = participants.filter((p) => p.status === "attended").length;

  const maxCompany = companies[0]?.count || 1;
  const maxCity = cities[0]?.count || 1;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link href="/dashboard/events" className="text-orange-600 hover:text-orange-700 font-medium">Daftar Event</Link>
        <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        <Link href={`/dashboard/events/${event_id}`} className="text-orange-600 hover:text-orange-700 font-medium">{event?.name || "Event"}</Link>
        <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        <span className="text-gray-500">Peserta & Event</span>
      </div>

      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">👥 Peserta & Event</h1>
        <p className="text-sm text-gray-500 mt-1">
          Demografi dan data peserta <span className="font-semibold text-orange-600">{event?.name}</span>
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">{participants.length}</div>
          <div className="text-xs text-gray-500 mt-1">Total Peserta</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
          <div className="text-2xl font-bold text-emerald-600">{attendedCount}</div>
          <div className="text-xs text-gray-500 mt-1">Hadir</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{companies.length}</div>
          <div className="text-xs text-gray-500 mt-1">Perusahaan</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">{cities.length}</div>
          <div className="text-xs text-gray-500 mt-1">Kota</div>
        </div>
      </div>

      {/* Demographics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Perusahaan</h3>
          {companies.length > 0 ? (
            <div className="space-y-2.5">
              {companies.slice(0, 5).map((c) => (
                <div key={c.name}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-600 truncate">{c.name}</span>
                    <span className="font-semibold text-gray-900 ml-2">{c.count}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full" style={{ width: `${(c.count / maxCompany) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-4">Belum ada data</p>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Kota Asal</h3>
          {cities.length > 0 ? (
            <div className="space-y-2.5">
              {cities.slice(0, 5).map((c) => (
                <div key={c.name}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-600">{c.name}</span>
                    <span className="font-semibold text-gray-900">{c.count}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-400 to-blue-500 rounded-full" style={{ width: `${(c.count / maxCity) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-4">Belum ada data</p>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Gender</h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-gray-600">Laki-laki</span>
                <span className="font-semibold text-gray-900">{maleCount} orang</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${participants.length > 0 ? (maleCount / participants.length) * 100 : 0}%` }} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-gray-600">Perempuan</span>
                <span className="font-semibold text-gray-900">{femaleCount} orang</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-pink-500 rounded-full" style={{ width: `${participants.length > 0 ? (femaleCount / participants.length) * 100 : 0}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Participants Table */}
      <div className="bg-white rounded-2xl border border-gray-100">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900">Daftar Peserta ({filtered.length})</h3>
          <input
            type="text"
            placeholder="Cari nama, perusahaan, kota..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 w-64"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3">Nama</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3">Perusahaan</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3">Kota</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-orange-50/20 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="text-sm font-medium text-gray-900">{p.name}</div>
                    <div className="text-xs text-gray-400">{p.email}</div>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-600">{p.company || "-"}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-600">{p.city || "-"}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex px-2.5 py-0.5 text-[10px] font-semibold rounded-full ${statusConfig[p.status]?.color || "bg-gray-100 text-gray-600"}`}>
                      {statusConfig[p.status]?.label || p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="p-8 text-center text-gray-400">
              <div className="text-3xl mb-2">👥</div>
              <p className="text-sm">Tidak ada peserta ditemukan</p>
            </div>
          )}
        </div>
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
