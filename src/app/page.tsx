import Link from "next/link";
import EventsSection from "@/components/EventsSection";

/* ────────────────────────────────────────────────────────────────────
 *  SANRAYS LANDING PAGE
 *  Theme: Clean & Modern Orange
 * ──────────────────────────────────────────────────────────────────── */

const features = [
  {
    title: "Persiapan Tanpa Stres",
    description: "Checklist otomatis, bagi tugas ke tim, dan pantau progress — biar nggak ada yang terlewat.",
  },
  {
    title: "Keuangan Transparan",
    description: "Setiap rupiah tercatat. Dari budget awal sampai realisasinya, semua bisa dilihat.",
  },
  {
    title: "Evaluasi Peserta",
    description: "Pre-test, post-test, CSAT score — ukur dampak event kamu secara data.",
  },
  {
    title: "Dokumentasi Terpusat",
    description: "Foto, materi, sertifikat, semua dalam satu tempat. Tinggal download kapan aja.",
  },
  {
    title: "Laporan Otomatis",
    description: "LPJ tinggal export. Tinggal edit dikit, langsung kirim ke stakeholder.",
  },
];

const stats = [
  { number: "50+", label: "Event Terselesaikan" },
  { number: "5.000+", label: "Peserta Terbantu" },
  { number: "100%", label: "Data Tersimpan" },
  { number: "24/7", label: "Akses Kapan Saja" },
];

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

            <div className="hidden md:flex items-center gap-8">
              <a href="#fitur" className="text-sm font-medium text-gray-600 hover:text-orange-600 transition-colors">
                Fitur
              </a>
              <a href="#event-publik" className="text-sm font-medium text-gray-600 hover:text-orange-600 transition-colors">
                Event
              </a>
              <a href="#tentang" className="text-sm font-medium text-gray-600 hover:text-orange-600 transition-colors">
                Tentang
              </a>
              <Link
                href="/dashboard"
                className="px-5 py-2 bg-orange-500 text-white text-sm font-semibold rounded-full hover:bg-orange-600 transition-colors"
              >
                Masuk Dashboard
              </Link>
            </div>

            <button className="md:hidden p-2 text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-white to-orange-100">
        <div className="absolute top-20 left-10 w-72 h-72 bg-orange-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-orange-300/20 rounded-full blur-3xl" />

        <div className="max-w-6xl mx-auto px-6 py-24 lg:py-32 relative">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full mb-6">
              <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
              Platform Event Management
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              Event Lebih{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-700">
                Teratur
              </span>
              <br />
              Keputusan Lebih Tepat
            </h1>

            <p className="mt-6 text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
              Nggak perlu khawatir checklist di spreadsheet, keuangan di notes, dan dokumentasi di berbagai folder.
              Semuanya di satu tempat, bisa diakses kapan aja.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/dashboard"
                className="px-8 py-3.5 bg-orange-500 text-white font-semibold rounded-full hover:bg-orange-600 transition-all shadow-lg shadow-orange-200 text-base"
              >
                Lihat Dashboard
              </Link>
              <a
                href="#fitur"
                className="px-8 py-3.5 bg-white text-gray-700 font-semibold rounded-full border border-gray-200 hover:border-orange-300 hover:text-orange-600 transition-all text-base"
              >
                Pelajari Cara Kami
              </a>
            </div>

            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl font-bold text-orange-600">{stat.number}</div>
                  <div className="mt-1 text-sm text-gray-500">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="fitur" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-sm font-semibold text-orange-600 tracking-wide uppercase">
              Kenapa Memilih Kami
            </span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-bold text-gray-900">
              Dari Mulai Sampai Selesai
            </h2>
            <p className="mt-4 text-gray-500">
              Dari planning sampai laporan, semua bisa kamu handle di sini.
              Biar kerjaan event kamu lebih fokus, bukan lebih ribet.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="group p-6 bg-white rounded-2xl border border-gray-100 hover:border-orange-200 shadow-sm hover:shadow-lg transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {idx === 0 && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />}
                    {idx === 1 && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />}
                    {idx === 2 && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />}
                    {idx === 3 && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />}
                    {idx === 4 && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />}
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="mt-3 text-sm text-gray-500 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}

            {/* CTA Card */}
            <div className="p-6 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl text-white flex flex-col items-center justify-center text-center">
              <h3 className="text-lg font-bold">Mau Tau Lebih?</h3>
              <p className="mt-2 text-orange-100 text-sm">
                Chat kami aja. Kami siap bantu jelaskan sesuai kebutuhan event kamu.
              </p>
              <Link
                href="/dashboard"
                className="mt-6 px-6 py-2.5 bg-white text-orange-600 font-semibold rounded-full hover:bg-orange-50 transition-all text-sm"
              >
                Mulai Sekarang
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* WHY ATTEND */}
      <section id="tentang" className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-sm font-semibold text-orange-600 tracking-wide uppercase">
                Kenapa Ikut Event Kami
              </span>
              <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-gray-900">
                Karena Yang Kamu Pelajari
                <br />
                <span className="text-orange-600">Bisa Langsung Dipakai</span>
              </h2>
              <p className="mt-5 text-gray-500 leading-relaxed">
                Nggak cuma teori. Nggak cuma sertifikat doang. Di setiap event kami, kamu dapet
                materi yang bisa langsung kamu pake di kerjaan, plus praktik langsung biar nagel.
              </p>

              <div className="mt-8 space-y-4">
                {[
                  {
                    title: "Praktisi, Bukan Teoris",
                    desc: "Pemateri kami orang yang udah jalan di lapangan. Mereka cerita dari pengalaman nyata, bukan cuma dari buku.",
                  },
                  {
                    title: "Materi Updated",
                    desc: "Konten selalu di-update sesuai perkembangan industri. Yang kamu belajar masih relevan sekarang.",
                  },
                  {
                    title: "Networking",
                    desc: "Kenalan sama orang-orang serius yang mau berkembang. Siapa tau jadi kolaborasi di kemudian hari.",
                  },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-4 p-4 bg-white rounded-xl border border-gray-100">
                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{item.title}</div>
                      <div className="text-sm text-gray-500 mt-1">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Testimonial */}
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                <div className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-6">
                  Kata Mereka Yang Sudah Ikut
                </div>

                <div className="p-5 bg-orange-50 rounded-xl mb-4">
                  <div className="flex gap-1 mb-3">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <svg key={s} className="w-4 h-4 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-gray-700">
                    "Dulu suka gugup pas presentasi. Habis ikut workshop ini, sekarang lebih pede.
                    Praktiknya banyak, nggak cuma dengerin teori doang."
                  </p>
                  <div className="mt-3 text-sm">
                    <span className="font-semibold text-gray-900">Sari Dewi</span>
                    <span className="text-gray-500"> — HR Manager, IndoTech</span>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-orange-600">4.6</div>
                    <div className="text-xs text-gray-500">CSAT Score</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-orange-600">50+</div>
                    <div className="text-xs text-gray-500">Event</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-orange-600">5000+</div>
                    <div className="text-xs text-gray-500">Peserta</div>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-orange-200 rounded-full blur-xl opacity-60" />
            </div>
          </div>
        </div>
      </section>

      {/* TECH STACK */}
      <section className="py-16 bg-white border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-8">
            <span className="text-sm font-semibold text-gray-400 tracking-wide uppercase">
              Powered By
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 text-gray-400">
            {["Next.js", "TypeScript", "Tailwind CSS", "MySQL"].map((tech) => (
              <span key={tech} className="text-sm font-medium px-4 py-2 bg-gray-50 rounded-full border border-gray-100">
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* EVENTS SECTION */}
      <EventsSection />

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-orange-500 to-orange-600">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            Siap Bikin Event yang Lebih Teratur?
          </h2>
          <p className="mt-4 text-orange-100 text-lg">
            Nggak perlu lagi catat di kertas atau spreadsheet yang bikin pusing.
            Mulai pakai dashboard kami dan fokus bikin event yang keren.
          </p>
          <Link
            href="/dashboard"
            className="mt-8 inline-flex px-8 py-3.5 bg-white text-orange-600 font-semibold rounded-full hover:bg-orange-50 transition-all shadow-lg text-base"
          >
            Buka Dashboard
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
                <span className="text-lg font-bold text-white">Sanrays</span>
              </div>
              <p className="text-sm leading-relaxed">
                Bantu bikin event kamu lebih teratur, dari planning sampai laporan.
              </p>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Navigasi</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#fitur" className="hover:text-orange-400 transition-colors">Fitur</a></li>
                <li><a href="#event-publik" className="hover:text-orange-400 transition-colors">Event</a></li>
                <li><a href="#tentang" className="hover:text-orange-400 transition-colors">Tentang</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Hubungi Kami</h4>
              <ul className="space-y-2 text-sm">
                <li>PT Sanrays</li>
                <li>info@sanrays.co.id</li>
                <li>Jakarta, Indonesia</li>
              </ul>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-gray-800 text-center text-xs text-gray-500">
            &copy; {new Date().getFullYear()} PT Sanrays. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
