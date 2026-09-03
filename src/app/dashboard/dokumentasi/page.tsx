"use client";

import { useState } from "react";

const roleAccess = [
  {
    role: "super_admin",
    label: "Super Admin",
    email: "ahmad@sanrays.com",
    badgeBg: "bg-purple-100",
    badgeText: "text-purple-700",
    access: ['event:view', 'event:create', 'event:edit', 'event:delete', 'user:view', 'user:create', 'user:edit', 'user:delete', 'finance:view', 'finance:edit', 'finance:transaction', 'report:view', 'report:export', 'participant:view', 'participant:edit', 'checklist:view', 'checklist:edit', 'document:view', 'document:upload'],
  },
  {
    role: "admin",
    label: "Admin",
    email: "sarah@sanrays.com, budi@sanrays.com",
    badgeBg: "bg-orange-100",
    badgeText: "text-orange-700",
    access: ['event:view', 'event:create', 'event:edit', 'user:view', 'user:edit', 'finance:view', 'finance:edit', 'finance:transaction', 'report:view', 'report:export', 'participant:view', 'participant:edit', 'checklist:view', 'checklist:edit', 'document:view', 'document:upload'],
  },
  {
    role: "event_manager",
    label: "Event Manager",
    email: "diana@sanrays.com",
    badgeBg: "bg-blue-100",
    badgeText: "text-blue-700",
    access: ['event:view', 'event:create', 'event:edit', 'participant:view', 'participant:edit', 'checklist:view', 'checklist:edit', 'document:view', 'document:upload'],
  },
  {
    role: "finance",
    label: "Finance",
    email: "fitri@sanrays.com, gunawan@sanrays.com",
    badgeBg: "bg-emerald-100",
    badgeText: "text-emerald-700",
    access: ['finance:view', 'finance:edit', 'finance:transaction', 'report:view', 'report:export'],
  },
  {
    role: "stakeholder",
    label: "Stakeholder",
    email: "irwan@sanrays.com",
    badgeBg: "bg-gray-100",
    badgeText: "text-gray-700",
    access: ['event:view', 'document:view'],
  },
];

const accessLabels: Record<string, string> = {
  'event:view': 'Lihat Event',
  'event:create': 'Buat Event',
  'event:edit': 'Edit Event (Semua)',
  'event:edit_own': 'Edit Event (Milik Sendiri)',
  'event:delete': 'Hapus Event',
  'user:view': 'Lihat User',
  'user:create': 'Tambah User',
  'user:edit': 'Edit User',
  'user:delete': 'Hapus User',
  'finance:view': 'Lihat Keuangan',
  'finance:edit': 'Edit Keuangan',
  'finance:transaction': 'Kelola Transaksi',
  'report:view': 'Lihat Laporan',
  'report:export': 'Export Laporan',
  'participant:view': 'Lihat Peserta',
  'participant:edit': 'Edit Peserta',
  'checklist:view': 'Lihat Checklist',
  'checklist:edit': 'Edit Checklist',
  'document:view': 'Lihat Dokumen',
  'dashboard:view': 'Lihat Dashboard',
};

const fiturList = [
  { kategori: "Manajemen Event", items: ["Daftar event", "Detail event", "Kelola event", "Status event"] },
  { kategori: "Manajemen Peserta", items: ["Pendaftaran", "Data peserta", "Konfirmasi", "Kehadiran"] },
  { kategori: "Keuangan", items: ["Transaksi", "Pembayaran", "Budget", "Laporan"] },
  { kategori: "Checklist", items: ["Todo list", "Progress", "Tugaskan", "Deadline"] },
  { kategori: "Dokumen", items: ["Upload", "Sertifikat", "Materi", "Arsip"] },
];

const caraPakai = [
  {
    title: "Login",
    desc: "Masuk dengan email dan password yang diberikan. Jika lupa password, hubungi Super Admin.",
  },
  {
    title: "Dashboard",
    desc: "Setelah login, Anda akan melihat ringkasan event dan statistik di halaman utama.",
  },
  {
    title: "Kelola Event",
    desc: "Menu Kelola Event untuk membuat, mengedit, atau menghapus event. Event Manager hanya bisa mengelola event miliknya sendiri.",
  },
  {
    title: "Daftarkan Peserta",
    desc: "Buka detail event, lalu menu Peserta untuk mendaftarkan atau import data peserta (CSV).",
  },
  {
    title: "Kelola Keuangan",
    desc: "Menu Transaksi untuk mencatat pembayaran. Finance dapat input bukti transfer dan konfirmasi.",
  },
  {
    title: "Checklist",
    desc: "Menu Checklist untuk membuat todo list dan memantau progres persiapan event.",
  },
  {
    title: "Export Laporan",
    desc: "Menu Laporan untuk export data dalam format Excel atau PDF.",
  },
];

export default function DokumentasiPage() {
  const [activeTab, setActiveTab] = useState<"hak-akses" | "fitur" | "cara-pakai">("hak-akses");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dokumentasi</h1>
        <p className="text-sm text-gray-500 mt-1">
          Panduan penggunaan aplikasi Sanrays Event
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab("hak-akses")}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            activeTab === "hak-akses"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Hak Akses
        </button>
        <button
          onClick={() => setActiveTab("fitur")}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            activeTab === "fitur"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Fitur
        </button>
        <button
          onClick={() => setActiveTab("cara-pakai")}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            activeTab === "cara-pakai"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Cara Pakai
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "hak-akses" && (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Setiap user memiliki role yang menentukan fitur yang dapat diakses.
          </p>

          {roleAccess.map((role) => (
            <div key={role.role} className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="flex items-center gap-3 mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${role.badgeBg} ${role.badgeText}`}>
                  {role.label}
                </span>
                <span className="text-sm text-gray-500">{role.email}</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {role.access.map((acc) => (
                  <div key={acc} className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    {accessLabels[acc] || acc}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Matriks Akses */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Matriks Akses</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 pr-4 font-medium text-gray-700">Fitur</th>
                    <th className="text-center py-2 px-3 font-medium text-purple-700">Super</th>
                    <th className="text-center py-2 px-3 font-medium text-orange-700">Admin</th>
                    <th className="text-center py-2 px-3 font-medium text-blue-700">Event</th>
                    <th className="text-center py-2 px-3 font-medium text-emerald-700">Finance</th>
                    <th className="text-center py-2 px-3 font-medium text-gray-700">Stake</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100">
                    <td className="py-2 pr-4 text-gray-600">Dashboard</td>
                    <td className="py-2 px-3 text-center text-green-600">Ya</td>
                    <td className="py-2 px-3 text-center text-green-600">Ya</td>
                    <td className="py-2 px-3 text-center text-green-600">Ya</td>
                    <td className="py-2 px-3 text-center text-green-600">Ya</td>
                    <td className="py-2 px-3 text-center text-green-600">Ya</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-2 pr-4 text-gray-600">Kelola Event</td>
                    <td className="py-2 px-3 text-center text-green-600">Ya</td>
                    <td className="py-2 px-3 text-center text-green-600">Ya</td>
                    <td className="py-2 px-3 text-center text-amber-600">Own</td>
                    <td className="py-2 px-3 text-center text-gray-400">-</td>
                    <td className="py-2 px-3 text-center text-gray-400">-</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-2 pr-4 text-gray-600">Manajemen User</td>
                    <td className="py-2 px-3 text-center text-green-600">Ya</td>
                    <td className="py-2 px-3 text-center text-green-600">Ya</td>
                    <td className="py-2 px-3 text-center text-gray-400">-</td>
                    <td className="py-2 px-3 text-center text-gray-400">-</td>
                    <td className="py-2 px-3 text-center text-gray-400">-</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-2 pr-4 text-gray-600">Kelola Keuangan</td>
                    <td className="py-2 px-3 text-center text-green-600">Ya</td>
                    <td className="py-2 px-3 text-center text-green-600">Ya</td>
                    <td className="py-2 px-3 text-center text-gray-400">-</td>
                    <td className="py-2 px-3 text-center text-green-600">Ya</td>
                    <td className="py-2 px-3 text-center text-gray-400">-</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 text-gray-600">Export Laporan</td>
                    <td className="py-2 px-3 text-center text-green-600">Ya</td>
                    <td className="py-2 px-3 text-center text-green-600">Ya</td>
                    <td className="py-2 px-3 text-center text-gray-400">-</td>
                    <td className="py-2 px-3 text-center text-green-600">Ya</td>
                    <td className="py-2 px-3 text-center text-gray-400">-</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-400 mt-3">
              Ya = bisa akses | Own = hanya data sendiri | - = tidak bisa akses
            </p>
          </div>
        </div>
      )}

      {activeTab === "fitur" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {fiturList.map((fitur) => (
            <div key={fitur.kategori} className="bg-white rounded-xl border border-gray-100 p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">{fitur.kategori}</h3>
              <ul className="space-y-2">
                {fitur.items.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {activeTab === "cara-pakai" && (
        <div className="space-y-3">
          {caraPakai.map((step, idx) => (
            <div key={idx} className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="flex items-start gap-4">
                <span className="w-7 h-7 rounded-lg bg-gray-100 text-sm font-medium text-gray-600 flex items-center justify-center flex-shrink-0">
                  {idx + 1}
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">{step.title}</h3>
                  <p className="text-sm text-gray-600">{step.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
