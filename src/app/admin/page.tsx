import Link from "next/link";

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          Panel administrasi untuk mengelola event dan pengguna
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/admin/events"
          className="group bg-white rounded-xl border border-gray-100 p-6 hover:border-orange-200 hover:shadow-md transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-orange-100 group-hover:bg-orange-500 flex items-center justify-center text-orange-600 group-hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">
                Kelola Event
              </h2>
              <p className="text-sm text-gray-500">
                Tambah, edit, dan manage seluruh event
              </p>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/users"
          className="group bg-white rounded-xl border border-gray-100 p-6 hover:border-orange-200 hover:shadow-md transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 group-hover:bg-blue-500 flex items-center justify-center text-blue-600 group-hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 6v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">
                Kelola Pengguna
              </h2>
              <p className="text-sm text-gray-500">
                Manajemen role & akses pengguna
              </p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}