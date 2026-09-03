import Link from "next/link";

/* ────────────────────────────────────────────────────────────────
 *  EXECUTIVE SUMMARY DASHBOARD (Modul 1)
 * ──────────────────────────────────────────────────────────────── */

const events = [
  {
    id: "EVT001",
    name: "Workshop Public Speaking 2024",
    date: "15-16 Sep 2024",
    location: "Hotel X, Jakarta",
    status: "completed" as const,
    statusLabel: "Selesai",
    progress: 100,
    participants: 47,
    budget: 40000000,
    spent: 17000000,
    csat: 4.6,
  },
  {
    id: "EVT002",
    name: "Kelas Coaching Batch 5",
    date: "1-5 Okt 2024",
    location: "Sanrays Office",
    status: "active" as const,
    statusLabel: "Berlangsung",
    progress: 65,
    participants: 32,
    budget: 25000000,
    spent: 12000000,
    csat: 4.3,
  },
  {
    id: "EVT003",
    name: "Team Building Q4 2024",
    date: "15-17 Nov 2024",
    location: "Villa Bintang",
    status: "preparation" as const,
    statusLabel: "Persiapan",
    progress: 40,
    participants: 25,
    budget: 35000000,
    spent: 5000000,
    csat: 0,
  },
];

const quickStats = [
  {
    label: "Total Event",
    value: "3",
    change: "+1 bulan ini",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    color: "bg-orange-100 text-orange-600",
  },
  {
    label: "Total Peserta",
    value: "104",
    change: "+12 minggu ini",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 6v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    color: "bg-blue-100 text-blue-600",
  },
  {
    label: "Total Anggaran",
    value: "Rp 100 Jt",
    change: "3 event aktif",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: "bg-emerald-100 text-emerald-600",
  },
  {
    label: "Rata-rata CSAT",
    value: "4.5",
    change: "Sangat Baik",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: "bg-amber-100 text-amber-600",
  },
];

const statusColors = {
  completed: "bg-emerald-100 text-emerald-700",
  active: "bg-blue-100 text-blue-700",
  preparation: "bg-orange-100 text-orange-700",
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
          {events.map((event) => (
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
                      {event.statusLabel}
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
                      {event.progress}%
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        event.progress === 100
                          ? "bg-emerald-500"
                          : "bg-orange-500"
                      }`}
                      style={{ width: `${event.progress}%` }}
                    />
                  </div>
                </div>

                {/* Metrics */}
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-sm font-bold text-gray-900">
                      {event.participants}
                    </div>
                    <div className="text-[10px] text-gray-400">Peserta</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-bold text-gray-900">
                      {formatCurrency(event.spent)}
                    </div>
                    <div className="text-[10px] text-gray-400">
                      dari {formatCurrency(event.budget)}
                    </div>
                  </div>
                  {event.csat > 0 && (
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
          ))}
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