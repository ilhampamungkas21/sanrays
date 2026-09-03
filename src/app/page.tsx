import Link from "next/link";
import EventsSection from "@/components/EventsSection";

/* ────────────────────────────────────────────────────────────────────
 *  SANRAYS - INTERNAL EVENT MANAGEMENT DASHBOARD
 *  PT. Insan Berdaya Asia
 * ──────────────────────────────────────────────────────────────────── */

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <img src="/logo-sanrays.png" alt="Sanrays" className="w-10 h-10 rounded-lg object-contain" />
              <span className="text-xl font-bold text-gray-900">Sanrays</span>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <a href="#tentang" className="text-sm font-medium text-gray-600 hover:text-orange-600 transition-colors">Tentang Kami</a>
              <a href="#jadwal-event" className="text-sm font-medium text-gray-600 hover:text-orange-600 transition-colors">Jadwal Event</a>
              <Link href="/login" className="px-5 py-2 bg-orange-500 text-white text-sm font-semibold rounded-full hover:bg-orange-600 transition-colors shadow-sm">Masuk</Link>
            </div>
            <button className="md:hidden p-2 text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-white to-orange-100/50">
        <div className="absolute top-10 left-0 w-96 h-96 bg-orange-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-orange-300/15 rounded-full blur-3xl" />
        <div className="max-w-6xl mx-auto px-6 py-20 lg:py-28 relative">
          <div className="text-center max-w-3xl mx-auto">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold tracking-wide mb-6">
              <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
              Internal Dashboard
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight">
              Kelola Event{" "}
              <span className="text-orange-500">Training</span>
              <br />Lebih Mudah &amp; Terstruktur
            </h1>
            <p className="mt-6 text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
              Dashboard internal untuk tim PT. Insan Berdaya Asia (Sanrays).
              Pantau jadwal training, workshop, dan seminar dalam satu tempat.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/login" className="w-full sm:w-auto px-8 py-3.5 bg-orange-500 text-white font-semibold rounded-full hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/25 text-base">
                Masuk ke Dashboard
              </Link>
              <a href="#jadwal-event" className="w-full sm:w-auto px-8 py-3.5 bg-white text-gray-700 font-semibold rounded-full border border-gray-200 hover:border-orange-300 hover:text-orange-600 transition-all text-base">
                Lihat Jadwal Event
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* TENTANG SANRAYS */}
      <section id="tentang" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-sm font-semibold text-orange-600 tracking-wide uppercase">Tentang Kami</span>
              <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-gray-900">
                PT. Insan Berdaya Asia
                <br />
                <span className="text-orange-600">(Sanrays)</span>
              </h2>
              <p className="mt-5 text-gray-500 leading-relaxed">
                Telah lebih dari 15 tahun berkiprah di tanah air, dengan berfokus pada
                penyelenggaraan Training, Seminar, dan Workshop baik di dalam negeri
                maupun mancanegara. Training yang didesain ditujukan untuk para Leader
                serta seluruh pegawai di korporasi, perusahaan multinasional, dan
                instansi pemerintahan.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Jakarta Selatan &amp; Klaten
                </span>
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  0811 2640 778
                </span>
              </div>
            </div>
            {/* Training Products */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { name: "Leadership", icon: "👔", desc: "Soulful Leader" },
                { name: "Service Excellent", icon: "⭐", desc: "Pelayanan Prima" },
                { name: "Public Speaking", icon: "🎤", desc: "Berbicara di Depan Umum" },
                { name: "Achievement Motivation", icon: "🚀", desc: "Motivasi Prestasi" },
                { name: "Digital Marketing", icon: "📱", desc: "Pemasaran Digital" },
                { name: "Outbound", icon: "🏔️", desc: "Team Building" },
              ].map((product, idx) => (
                <div key={idx} className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-orange-200 hover:bg-orange-50/50 transition-all">
                  <div className="text-2xl mb-2">{product.icon}</div>
                  <div className="text-sm font-bold text-gray-900">{product.name}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{product.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* VISI & MISI */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-sm font-semibold text-orange-600 tracking-wide uppercase">Visi &amp; Misi</span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-gray-900">
              Menjadi Institusi Pengembangan SDM
              <br />
              <span className="text-orange-600">Terkemuka di Asia</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: "Pelatihan Berkualitas Tinggi", desc: "Menyediakan program pelatihan berbasis riset dan relevan dengan kebutuhan industri." },
              { title: "Kompetensi Profesional", desc: "Membantu individu dan organisasi mengembangkan kompetensi untuk bersaing di pasar global." },
              { title: "Inovasi Pembelajaran", desc: "Mengadopsi teknologi terbaru dan metode pembelajaran inovatif untuk pengalaman pelatihan yang efektif." },
            ].map((item, idx) => (
              <div key={idx} className="p-6 bg-white rounded-2xl border border-gray-100 hover:border-orange-200 hover:shadow-lg transition-all">
                <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center mb-4">
                  <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900">{item.title}</h3>
                <p className="mt-2 text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* EVENTS SECTION */}
      <div id="jadwal-event">
        <EventsSection />
      </div>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-orange-500 to-orange-600">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">Kelola Event Training Lebih Mudah</h2>
          <p className="mt-4 text-orange-100 text-lg">Akses dashboard untuk mengelola jadwal training, peserta, dan laporan event.</p>
          <Link href="/login" className="mt-8 inline-flex px-8 py-3.5 bg-white text-orange-600 font-semibold rounded-full hover:bg-orange-50 transition-all shadow-lg text-base">
            Masuk ke Dashboard
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img src="/logo-sanrays.png" alt="Sanrays" className="w-10 h-10 rounded-lg object-contain" />
                <span className="text-lg font-bold text-white">PT. Insan Berdaya Asia</span>
              </div>
              <p className="text-sm leading-relaxed">Training, Seminar, dan Workshop untuk korporasi, perusahaan multinasional, dan instansi pemerintahan.</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Kantor</h4>
              <ul className="space-y-2 text-sm">
                <li>Jl. Wijaya V No. VI, Melawai</li>
                <li>Kebayoran Baru, Jakarta Selatan</li>
                <li>Gayamprit, Klaten Selatan, Klaten</li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Hubungi Kami</h4>
              <ul className="space-y-2 text-sm">
                <li>0811 2640 778</li>
                <li>sanraysofficial@gmail.com</li>
                <li>www.sanrays.co.id</li>
                <li className="flex gap-3 pt-1">
                  <a href="https://instagram.com/pt.sanrays" target="_blank" rel="noopener noreferrer" className="hover:text-orange-400 transition-colors">@pt.sanrays</a>
                  <a href="https://instagram.com/soulful.leaders" target="_blank" rel="noopener noreferrer" className="hover:text-orange-400 transition-colors">@soulful.leaders</a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-10 pt-6 border-t border-gray-800 text-center text-xs text-gray-500">
            &copy; {new Date().getFullYear()} PT. Insan Berdaya Asia (Sanrays). All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
 
