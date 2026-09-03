"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Event } from "@/lib/types";

function EventCard({ event, variant }: { event: Event; variant: "public" | "internal" }) {
  const fmt = (n: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    } as Intl.NumberFormatOptions).format(n);

  const price =
    event.earlyBirdPrice && event.earlyBirdPrice < event.price
      ? event.earlyBirdPrice
      : event.price;

  const isPublic = variant === "public";
  const accentColor = isPublic ? "orange" : "slate";

  const statusLabel = event.status === "completed" ? "Selesai"
    : event.status === "active" ? "Berlangsung" : "Akan Datang";

  const dateStr = event.date ? event.date.split("T")[0] : "";

  return (
    <Link
      href={`/events/${event.id}`}
      className={`group bg-white rounded-2xl border-2 ${
        isPublic ? "border-orange-100 hover:border-orange-300" : "border-slate-200 hover:border-slate-400"
      } overflow-hidden hover:shadow-xl transition-all duration-300`}
    >
      <div className={`h-2 bg-gradient-to-r ${event.coverGradient}`} />
      <div className="p-6">
        <div className="flex items-center justify-between mb-3">
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold bg-${accentColor}-100 text-${accentColor}-700`}>
            {statusLabel}
          </span>
          <span className="text-xs text-gray-400">{dateStr}</span>
        </div>
        <h3 className="text-lg font-bold text-gray-900">{event.name}</h3>
        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
          {event.shortDescription || event.description?.slice(0, 60)}
        </p>
        <div className="flex flex-wrap gap-2 my-3">
          {(event.highlights || []).slice(0, 3).map((h, i) => (
            <span key={i} className={`px-2 py-1 bg-${accentColor}-50 text-${accentColor}-600 rounded-lg text-xs font-medium`}>
              {h}
            </span>
          ))}
        </div>
        {isPublic && event.status !== "completed" && (
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div>
              <div className="text-xs text-gray-400">Investasi</div>
              <div className="text-xl font-bold text-orange-600">
                {price > 0 ? fmt(price) : "Gratis"}
              </div>
            </div>
            <span className="text-sm font-semibold text-orange-500 group-hover:translate-x-1 transition-transform">
              Lihat Detail
            </span>
          </div>
        )}
        {!isPublic && (
          <div className="text-right pt-4 border-t border-slate-100">
            <span className="text-sm text-slate-500 group-hover:text-slate-700 transition-colors">
              Lihat Detail
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}

export default function EventsSection() {
  const [publicEvents, setPublic] = useState<Event[]>([]);
  const [internalEvents, setInternal] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/events?eventType=public")
      .then((r) => r.json())
      .then(({ data }) => {
        setPublic(data || []);
      })
      .catch(() => setPublic([]))
      .finally(() => setLoading(false));

    fetch("/api/events?eventType=internal")
      .then((r) => r.json())
      .then(({ data }) => {
        setInternal(data || []);
      })
      .catch(() => setInternal([]));
  }, []);

  if (loading) {
    return (
      <div className="py-12 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {publicEvents.length > 0 && (
        <section className="py-12 bg-white">
          <div className="max-w-6xl mx-auto px-6">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-8 mb-8 text-white">
              <h2 className="text-2xl font-bold mb-1">Jadwal Event</h2>
              <p className="text-orange-100">Workshop & Kelas Terbuka</p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {publicEvents.map((e) => (
                <EventCard key={e.id} event={e} variant="public" />
              ))}
            </div>
          </div>
        </section>
      )}
      {internalEvents.length > 0 && (
        <section className="py-12 bg-slate-50">
          <div className="max-w-6xl mx-auto px-6">
            <div className="bg-gradient-to-r from-slate-600 to-slate-700 rounded-2xl p-8 mb-8 text-white">
              <h2 className="text-2xl font-bold mb-1">Event Internal</h2>
              <p className="text-slate-300">Program untuk Karyawan & Stakeholder</p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {internalEvents.map((e) => (
                <EventCard key={e.id} event={e} variant="internal" />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
