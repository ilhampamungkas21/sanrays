"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { use } from "react";
import { authFetch } from "@/lib/auth/client";
import { generateEventReportPDF } from "@/lib/pdf-report";

interface Stats {
  totalParticipants: number;
  confirmedParticipants: number;
  attendedParticipants: number;
  attendanceRate: number;
  totalChecklists: number;
  completedChecklists: number;
  inProgressChecklists: number;
  pendingChecklists: number;
  checklistProgress: number;
  totalIncome: number;
  totalExpense: number;
  paidExpense: number;
  pendingExpense: number;
  balance: number;
  totalFeedback: number;
  avgRatingOverall: number;
  avgRatingContent: number;
  avgRatingFacility: number;
  avgRatingPemateri: number;
  checklistsByCategory: Record<string, { total: number; completed: number }>;
}

interface ReportData {
  event: any;
  participants: any[];
  checklists: any[];
  transactions: any[];
  feedback: any[];
  customQuestions: any[];
  stats: Stats;
  transactionsByMonth: Record<string, { income: number; expense: number }>;
}

function formatCurrency(num: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function getCustomAnswer(feedback: any, questionId: string) {
  const answer = feedback.customAnswers?.find((a: any) => a.questionId === questionId);
  if (!answer) return null;
  if (answer.ratingValue) return { value: answer.ratingValue, type: 'rating' };
  if (answer.answerValue) return { value: answer.answerValue, type: 'text' };
  return null;
}

export default function LaporanPage({ params }: { params: Promise<{ event_id: string }> }) {
  const { event_id } = use(params);
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "peserta" | "keuangan" | "checklist" | "evaluasi">("overview");
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    const authState = JSON.parse(localStorage.getItem("sanrays_auth_user") || "{}");
    setUserRole(authState.role || "");
    fetchReport();
  }, [event_id]);

  const fetchReport = async () => {
    try {
      const response = await authFetch(`/api/admin/reports/${event_id}`);
      const data = await response.json();
      if (data.data) {
        setReport(data.data);
      }
    } catch (err) {
      console.error("Error fetching report:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!report) return;
    setDownloading(true);
    try {
      await generateEventReportPDF(report);
    } catch (err) {
      console.error("Error generating PDF:", err);
      alert("Gagal generate PDF");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Gagal memuat laporan</p>
      </div>
    );
  }

  const { event, participants, checklists, transactions, feedback, customQuestions, stats } = report;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <Link href={`/admin/kelola/${event_id}`} className="hover:text-orange-500">
              Kelola Event
            </Link>
            <span>/</span>
            <span>Laporan</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{event.name}</h1>
          <p className="text-sm text-gray-500 mt-1">
            {formatDate(event.date)} {event.endDate && `- ${formatDate(event.endDate)}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadPDF}
            disabled={downloading}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 disabled:opacity-50 transition-colors"
          >
            {downloading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            )}
            {downloading ? 'Generating...' : 'Download PDF'}
          </button>
          <Link
            href={`/admin/kelola/${event_id}`}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200"
          >
            Kembali
          </Link>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-xl w-fit">
        {[
          { key: "overview", label: "Ringkasan" },
          { key: "peserta", label: "Peserta" },
          { key: "keuangan", label: "Keuangan" },
          { key: "checklist", label: "Checklist" },
          { key: "evaluasi", label: "Evaluasi" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === tab.key
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="text-sm text-gray-500 mb-1">Total Peserta</div>
              <div className="text-3xl font-bold text-gray-900">{stats.totalParticipants}</div>
              <div className="text-xs text-gray-500 mt-1">{stats.attendedParticipants} hadir</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="text-sm text-gray-500 mb-1">Checklist</div>
              <div className="text-3xl font-bold text-gray-900">{stats.checklistProgress}%</div>
              <div className="text-xs text-gray-500 mt-1">{stats.completedChecklists}/{stats.totalChecklists} selesai</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="text-sm text-gray-500 mb-1">Budget</div>
              <div className={`text-3xl font-bold ${stats.balance >= 0 ? "text-green-600" : "text-red-600"}`}>
                {formatCurrency(stats.balance)}
              </div>
              <div className="text-xs text-gray-500 mt-1">Balance</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="text-sm text-gray-500 mb-1">Rating</div>
              <div className="text-3xl font-bold text-gray-900">{stats.avgRatingOverall}</div>
              <div className="text-xs text-gray-500 mt-1">dari {stats.totalFeedback} feedback</div>
            </div>
          </div>

          {/* Event Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Informasi Event</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-500">Tema</div>
                <div className="font-medium text-gray-900">{event.theme || "-"}</div>
              </div>
              <div>
                <div className="text-gray-500">Lokasi</div>
                <div className="font-medium text-gray-900">{event.location || "-"}</div>
              </div>
              <div>
                <div className="text-gray-500">Organizer</div>
                <div className="font-medium text-gray-900">{event.organizer || "-"}</div>
              </div>
              <div>
                <div className="text-gray-500">Status</div>
                <div className="font-medium text-gray-900 capitalize">{event.status}</div>
              </div>
            </div>
            {event.description && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="text-gray-500 text-sm mb-2">Deskripsi</div>
                <p className="text-sm text-gray-700">{event.description}</p>
              </div>
            )}
          </div>

          {/* Quick Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white">
              <div className="text-sm opacity-80">Total Income</div>
              <div className="text-2xl font-bold mt-1">{formatCurrency(stats.totalIncome)}</div>
            </div>
            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-5 text-white">
              <div className="text-sm opacity-80">Total Expense</div>
              <div className="text-2xl font-bold mt-1">{formatCurrency(stats.totalExpense)}</div>
            </div>
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-5 text-white">
              <div className="text-sm opacity-80">Feedback</div>
              <div className="text-2xl font-bold mt-1">{stats.totalFeedback} Peserta</div>
            </div>
          </div>
        </div>
      )}

      {/* Participants Tab */}
      {activeTab === "peserta" && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h2 className="font-bold text-gray-900">Daftar Peserta ({participants.length})</h2>
            </div>
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Perusahaan</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {participants.map((p) => (
                  <tr key={p.id}>
                    <td className="px-4 py-3 text-sm text-gray-900">{p.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{p.email}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{p.company || "-"}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        p.status === "attended" ? "bg-green-100 text-green-700" :
                        p.status === "confirmed" ? "bg-blue-100 text-blue-700" :
                        p.status === "cancelled" ? "bg-red-100 text-red-700" :
                        "bg-gray-100 text-gray-700"
                      }`}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {participants.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-gray-500">Belum ada peserta</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Keuangan Tab */}
      {activeTab === "keuangan" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 rounded-xl border border-green-200 p-5">
              <div className="text-sm text-green-600 mb-1">Total Income</div>
              <div className="text-2xl font-bold text-green-700">{formatCurrency(stats.totalIncome)}</div>
            </div>
            <div className="bg-red-50 rounded-xl border border-red-200 p-5">
              <div className="text-sm text-red-600 mb-1">Total Expense</div>
              <div className="text-2xl font-bold text-red-700">{formatCurrency(stats.totalExpense)}</div>
            </div>
            <div className={`${stats.balance >= 0 ? "bg-green" : "bg-red"}-50 rounded-xl border ${stats.balance >= 0 ? "border-green-200" : "border-red-200"} p-5`}>
              <div className={`text-sm ${stats.balance >= 0 ? "text-green" : "text-red"}-600 mb-1`}>Balance</div>
              <div className={`text-2xl font-bold ${stats.balance >= 0 ? "text-green" : "text-red"}-700`}>
                {formatCurrency(stats.balance)}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h2 className="font-bold text-gray-900">Daftar Transaksi ({transactions.length})</h2>
            </div>
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipe</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deskripsi</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Jumlah</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {transactions.map((t) => (
                  <tr key={t.id}>
                    <td className="px-4 py-3 text-sm text-gray-500">{formatDate(t.transactionDate)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        t.category === "income" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}>
                        {t.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{t.description || t.type}</td>
                    <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                      <span className={t.category === "income" ? "text-green-600" : "text-red-600"}>
                        {t.category === "income" ? "+" : "-"}
                        {formatCurrency(parseFloat(t.amount))}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        t.status === "paid" || t.status === "approved" ? "bg-green-100 text-green-700" :
                        t.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                        "bg-gray-100 text-gray-700"
                      }`}>
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {transactions.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">Belum ada transaksi</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Checklist Tab */}
      {activeTab === "checklist" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="text-sm text-gray-500 mb-1">Total</div>
              <div className="text-2xl font-bold text-gray-900">{stats.totalChecklists}</div>
            </div>
            <div className="bg-green-50 rounded-xl border border-green-200 p-5">
              <div className="text-sm text-green-600 mb-1">Selesai</div>
              <div className="text-2xl font-bold text-green-700">{stats.completedChecklists}</div>
            </div>
            <div className="bg-blue-50 rounded-xl border border-blue-200 p-5">
              <div className="text-sm text-blue-600 mb-1">In Progress</div>
              <div className="text-2xl font-bold text-blue-700">
                {stats.inProgressChecklists || checklists.filter(c => c.status === "in_progress").length}
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-5">
              <div className="text-sm text-gray-500 mb-1">Pending</div>
              <div className="text-2xl font-bold text-gray-700">
                {stats.pendingChecklists || checklists.filter(c => c.status === "pending").length}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h2 className="font-bold text-gray-900">Daftar Checklist ({checklists.length})</h2>
            </div>
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Task</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kategori</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">PIC</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {checklists.map((c) => (
                  <tr key={c.id}>
                    <td className="px-4 py-3 text-sm text-gray-900">{c.task}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-gray-100 rounded text-xs">{c.category}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{c.pic || "-"}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        c.status === "completed" ? "bg-green-100 text-green-700" :
                        c.status === "in_progress" ? "bg-blue-100 text-blue-700" :
                        "bg-gray-100 text-gray-700"
                      }`}>
                        {c.status.replace("_", " ")}
                      </span>
                    </td>
                  </tr>
                ))}
                {checklists.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-gray-500">Belum ada checklist</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Evaluasi Tab */}
      {activeTab === "evaluasi" && (
        <div className="space-y-6">
          {stats.totalFeedback > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-orange-50 rounded-xl border border-orange-200 p-5 text-center">
                  <div className="text-4xl font-bold text-orange-700">{stats.avgRatingOverall}</div>
                  <div className="text-sm text-orange-600 mt-1">Rating Overall</div>
                </div>
                <div className="bg-blue-50 rounded-xl border border-blue-200 p-5 text-center">
                  <div className="text-4xl font-bold text-blue-700">{stats.avgRatingContent}</div>
                  <div className="text-sm text-blue-600 mt-1">Konten</div>
                </div>
                <div className="bg-green-50 rounded-xl border border-green-200 p-5 text-center">
                  <div className="text-4xl font-bold text-green-700">{stats.avgRatingFacility}</div>
                  <div className="text-sm text-green-600 mt-1">Fasilitas</div>
                </div>
                <div className="bg-purple-50 rounded-xl border border-purple-200 p-5 text-center">
                  <div className="text-4xl font-bold text-purple-700">{stats.avgRatingPemateri}</div>
                  <div className="text-sm text-purple-600 mt-1">Pemateri</div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-200">
                  <h2 className="font-bold text-gray-900">Feedback Peserta ({feedback.length})</h2>
                </div>
                <div className="divide-y divide-gray-100">
                  {feedback.map((f) => (
                    <div key={f.id} className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium text-gray-900">{f.participantName}</div>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <svg key={s} className={`w-4 h-4 ${s <= (f.ratingOverall || 0) ? "text-orange-400" : "text-gray-300"}`} fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                      </div>
                      {f.comments && (
                        <p className="text-sm text-gray-600 italic mb-2">"{f.comments}"</p>
                      )}

                      {/* Custom Answers */}
                      {customQuestions.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {customQuestions.sort((a, b) => a.orderNum - b.orderNum).map((q: any) => {
                              const answer = getCustomAnswer(f, q.id);
                              return (
                                <div key={q.id} className="bg-gray-50 rounded-lg p-3">
                                  <div className="text-xs text-gray-500 mb-1">{q.questionText}</div>
                                  {answer ? (
                                    answer.type === 'rating' ? (
                                      <div className="flex items-center gap-1">
                                        {[1, 2, 3, 4, 5].map((s) => (
                                          <svg key={s} className={`w-3 h-3 ${s <= answer.value ? "text-yellow-400" : "text-gray-300"}`} fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                          </svg>
                                        ))}
                                        <span className="text-xs text-gray-500 ml-1">({answer.value}/5)</span>
                                      </div>
                                    ) : (
                                      <div className="text-sm text-gray-700">{answer.value}</div>
                                    )
                                  ) : (
                                    <div className="text-xs text-gray-400 italic">Tidak dijawab</div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <div className="text-gray-400 mb-2">Belum ada feedback</div>
              <p className="text-sm text-gray-500">Feedback akan muncul setelah peserta mengisi evaluasi</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
