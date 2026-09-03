"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { use } from "react";

function formatCurrency(num: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

interface Document {
  id: string;
  name: string;
  category: string;
  url: string;
  type: "photo" | "video" | "certificate" | "material" | "report" | "other";
}

interface Event {
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
  earlyBirdPrice?: number;
  earlyBirdDeadline?: string;
  paymentMethods?: string[];
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
  documents?: Document[];
}

export default function EventDetailPage({ params }: { params: Promise<{ event_id: string }> }) {
  const { event_id } = use(params);
  const [event, setEvent] = useState<Event | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeDocTab, setActiveDocTab] = useState<string>("all");

  useEffect(() => {
    Promise.all([
      fetch(`/api/events/${event_id}`).then(r => r.json()),
      fetch(`/api/documents?event_id=${event_id}`).then(r => r.json()).catch(() => ({ data: [] }))
    ])
      .then(([eventData, docData]) => {
        if (eventData.data) {
          setEvent(eventData.data);
          // Set documents from API if available
          if (docData.data && docData.data.length > 0) {
            setDocuments(docData.data.map((d: any) => ({
              id: d.id,
              name: d.name || d.fileUrl?.split('/').pop() || 'Document',
              category: d.category || 'other',
              url: d.fileUrl || d.url || '#',
              type: getDocType(d.category)
            })));
          }
        } else {
          setError("Event tidak ditemukan");
        }
      })
      .catch(() => setError("Gagal memuat data"))
      .finally(() => setLoading(false));
  }, [event_id]);

  function getDocType(category: string): Document["type"] {
    const cat = category?.toLowerCase() || "";
    if (cat.includes("foto") || cat.includes("photo")) return "photo";
    if (cat.includes("video")) return "video";
    if (cat.includes("sertifikat") || cat.includes("certificate")) return "certificate";
    if (cat.includes("materi") || cat.includes("material")) return "material";
    if (cat.includes("lpj") || cat.includes("report")) return "report";
    return "other";
  }

  function getDocIcon(type: Document["type"]) {
    switch (type) {
      case "photo":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case "video":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        );
      case "certificate":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
        );
      case "material":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        );
      case "report":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        );
    }
  }

  function getDocLabel(category: string): string {
    const cat = category?.toLowerCase() || "";
    if (cat.includes("foto") || cat.includes("photo")) return "Foto";
    if (cat.includes("video")) return "Video";
    if (cat.includes("sertifikat") || cat.includes("certificate")) return "Sertifikat";
    if (cat.includes("materi") || cat.includes("material")) return "Materi";
    if (cat.includes("lpj") || cat.includes("report")) return "Laporan";
    return "Lainnya";
  }

  const filteredDocs = activeDocTab === "all"
    ? documents
    : documents.filter(d => d.type === activeDocTab);

  const docTabs = [
    { key: "all", label: "Semua" },
    { key: "photo", label: "Foto" },
    { key: "video", label: "Video" },
    { key: "certificate", label: "Sertifikat" },
    { key: "material", label: "Materi" },
    { key: "report", label: "Laporan" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Event Tidak Ditemukan</h1>
          <p className="text-gray-500 mb-4">Link mungkin salah atau event sudah tidak tersedia.</p>
          <Link href="/" className="text-orange-600 hover:underline">Kembali ke Beranda</Link>
        </div>
      </div>
    );
  }

  const price = event.earlyBirdPrice && event.earlyBirdPrice < event.price ? event.earlyBirdPrice : event.price;
  const statusLabel = event.status === "completed" ? "Selesai" : event.status === "active" ? "Berlangsung" : "Akan Datang";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-orange-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3">
              <img src="/logo-sanrays.png" alt="Sanrays" className="w-10 h-10 rounded-lg object-contain" />
              <span className="text-xl font-bold text-gray-900">Sanrays</span>
            </Link>
            <Link href="/" className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Kembali
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className={`relative overflow-hidden bg-gradient-to-br ${event.coverGradient}`}>
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-48 h-48 bg-white/5 rounded-full blur-2xl" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <nav className="flex items-center gap-2 text-white/80 text-sm mb-4">
            <Link href="/" className="hover:text-white transition-colors">Beranda</Link>
            <span>/</span>
            <span>Event</span>
          </nav>
          <div className="flex items-center gap-3 mb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-semibold text-white">
              <span className={`w-2 h-2 rounded-full ${event.status === "completed" ? "bg-emerald-400" : event.status === "active" ? "bg-blue-400 animate-pulse" : "bg-orange-400"}`} />
              {statusLabel}
            </span>
            {event.eventType === "internal" && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-xs font-semibold text-white/80">
                Internal Only
              </span>
            )}
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-3">{event.name}</h1>
          {event.theme && <p className="text-lg text-white/90 font-medium mb-4">"{event.theme}"</p>}
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {event.date}{event.endDate && ` - ${event.endDate}`}
            </div>
            {event.location && (
              <div className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                {event.location}
              </div>
            )}
            {event.maxParticipants > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {event.maxParticipants} Peserta
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CONTENT SECTION */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* About */}
        {event.description && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 lg:p-8 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Tentang Event</h2>
            <p className="text-gray-600 leading-relaxed text-lg">{event.description}</p>
          </div>
        )}

        {/* Highlights */}
        {event.highlights && event.highlights.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 lg:p-8 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Highlights</h2>
            <div className="flex flex-wrap gap-2">
              {event.highlights.map((h, i) => (
                <span key={i} className="px-3 py-1.5 bg-orange-50 text-orange-700 rounded-lg text-sm font-medium">
                  {h}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Documents Section */}
        {documents.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 lg:p-8 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Dokumentasi</h2>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-100 pb-4">
              {docTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveDocTab(tab.key)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeDocTab === tab.key
                      ? "bg-orange-500 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {tab.label}
                  {tab.key !== "all" && (
                    <span className="ml-1.5 text-xs opacity-70">
                      ({documents.filter(d => d.type === tab.key).length})
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Document Grid */}
            {filteredDocs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredDocs.map((doc) => (
                  <a
                    key={doc.id}
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-orange-200 hover:bg-orange-50/50 transition-all"
                  >
                    <div className="w-12 h-12 bg-white rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 group-hover:text-orange-500 group-hover:border-orange-200 transition-colors">
                      {getDocIcon(doc.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate group-hover:text-orange-600 transition-colors">
                        {doc.name}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {getDocLabel(doc.category)}
                      </div>
                    </div>
                    <svg className="w-4 h-4 text-gray-400 group-hover:text-orange-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Tidak ada dokumen dalam kategori ini
              </div>
            )}
          </div>
        )}

        {/* No Documents Placeholder - Only show for completed events */}
        {documents.length === 0 && event.status === "completed" && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 lg:p-8 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Dokumentasi</h2>
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-gray-500">Dokumentasi event akan segera ditambahkan</p>
            </div>
          </div>
        )}

        {/* Pricing - public Events Only */}
        {event.status !== "completed" && event.eventType === "public" && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 lg:p-8 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Investasi</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {event.earlyBirdPrice && event.earlyBirdPrice < event.price && (
                <div className="relative p-6 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl text-white overflow-hidden">
                  <div className="absolute top-3 right-3">
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-bold">EARLY BIRD</span>
                  </div>
                  <div className="text-sm text-emerald-100 mb-1">Harga Early Bird</div>
                  <div className="text-3xl font-extrabold mb-1">{formatCurrency(event.earlyBirdPrice)}</div>
                  {event.earlyBirdDeadline && (
                    <div className="text-sm text-emerald-200">Hingga {event.earlyBirdDeadline}</div>
                  )}
                </div>
              )}
              <div className={`p-6 rounded-2xl border-2 ${event.earlyBirdPrice && event.earlyBirdPrice < event.price ? "border-gray-200 bg-gray-50" : "bg-gradient-to-br from-orange-500 to-orange-600 text-white"}`}>
                <div className={`text-sm mb-1 ${event.earlyBirdPrice && event.earlyBirdPrice < event.price ? "text-gray-500" : "text-orange-100"}`}>Harga Normal</div>
                <div className={`text-3xl font-extrabold mb-1 ${event.earlyBirdPrice && event.earlyBirdPrice < event.price ? "text-gray-900" : ""}`}>
                  {formatCurrency(event.price)}
                </div>
                {event.earlyBirdPrice && event.earlyBirdPrice < event.price && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="line-through text-gray-400">{formatCurrency(event.price)}</span>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-xs font-medium">
                      Hemat {Math.round((1 - event.earlyBirdPrice / event.price) * 100)}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* CTA */}
        {event.status !== "completed" && (
          <div className={`rounded-2xl p-6 lg:p-8 ${event.eventType === "public" ? "bg-gradient-to-br from-gray-900 to-gray-800 text-white" : "bg-gradient-to-br from-gray-700 to-gray-800 text-white"}`}>
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Tertarik dengan Event Ini?</h2>
              <p className="text-gray-400 mb-6">Hubungi kami untuk informasi lebih lanjut</p>
              <button className="inline-flex items-center gap-2 px-8 py-4 bg-orange-500 text-white font-semibold rounded-full hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/30 text-lg">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.674c-.047 1.011-.07 1.999-.07 3.088 0 2.115 1.264 3.978 3.102 5.107l1.003 2.188c.445.99.668 1.869.668 2.682 0 .813-.246 1.632-.736 2.315-.49.681-1.14 1.23-1.895 1.642-.755.412-1.543.629-2.43.629-.887 0-1.76-.216-2.554-.629a6.957 6.957 0 01-1.895-1.642 4.987 4.987 0 01-.736-2.315c0-.813.223-1.692.668-2.682.444-.99.995-1.869 1.346-2.405a10.027 10.027 0 00.746-2.315c0-1.089-.024-2.077-.07-3.088a10.01 10.01 0 00-2.893-6.674"/>
                </svg>
                Hubungi via WhatsApp
              </button>
            </div>
          </div>
        )}
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-gray-400 py-10 mt-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="text-lg font-bold text-white">Sanrays</span>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <Link href="/" className="hover:text-orange-400 transition-colors">Beranda</Link>
              <Link href="/dashboard" className="hover:text-orange-400 transition-colors">Dashboard</Link>
            </div>
            <div className="text-sm text-gray-500">© {new Date().getFullYear()} Sanrays</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
