"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { use } from "react";
import { authFetch } from "@/lib/auth/client";

interface Transaction {
  id: string;
  eventId?: string;
  category: string;
  type: string;
  amount: number;
  description?: string;
  transactionDate?: string;
  status: string;
}

interface Budget {
  id: string;
  category: string;
  plannedAmount: number;
  actualAmount: number;
}

interface Event {
  id: string;
  name: string;
  budget?: number;
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function FinancialPage({ params }: { params: Promise<{ event_id: string }> }) {
  const { event_id } = use(params);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "transactions" | "budget">("overview");

  useEffect(() => {
    fetchData();
  }, [event_id]);

  const fetchData = async () => {
    try {
      const [eventRes, txRes, budgetRes] = await Promise.all([
        authFetch(`/api/admin/events/${event_id}`),
        authFetch(`/api/transactions?event_id=${event_id}`),
        authFetch(`/api/budgets?event_id=${event_id}`),
      ]);

      const [eventData, txData, budgetData] = await Promise.all([
        eventRes.json(),
        txRes.json(),
        budgetRes.json(),
      ]);

      if (eventData.data) setEvent(eventData.data);
      if (txData.data) setTransactions(txData.data);
      if (budgetData.data) setBudgets(budgetData.data);
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

  const totalIncome = transactions.filter(t => t.category === "income").reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions.filter(t => t.category === "expense").reduce((sum, t) => sum + t.amount, 0);
  const netProfit = totalIncome - totalExpense;
  const budget = event?.budget || 0;
  const budgetRemaining = budget - totalExpense;
  const utilization = budget > 0 ? Math.round((totalExpense / budget) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link href="/dashboard/events" className="text-orange-600 hover:text-orange-700 font-medium">Daftar Event</Link>
        <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        <Link href={`/dashboard/events/${event_id}`} className="text-orange-600 hover:text-orange-700 font-medium">{event?.name || "Event"}</Link>
        <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        <span className="text-gray-500">Keuangan</span>
      </div>

      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">💰 Keuangan</h1>
        <p className="text-sm text-gray-500 mt-1">
          Income, expense, dan anggaran <span className="font-semibold text-orange-600">{event?.name}</span>
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="text-xs text-gray-500">Budget</div>
          <div className="text-lg font-bold text-gray-900 mt-1">{formatCurrency(budget)}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="text-xs text-gray-500">Pemasukan</div>
          <div className="text-lg font-bold text-emerald-600 mt-1">{formatCurrency(totalIncome)}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="text-xs text-gray-500">Pengeluaran</div>
          <div className="text-lg font-bold text-red-600 mt-1">{formatCurrency(totalExpense)}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="text-xs text-gray-500">Net Profit</div>
          <div className={`text-lg font-bold mt-1 ${netProfit >= 0 ? "text-emerald-600" : "text-red-600"}`}>{formatCurrency(netProfit)}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="text-xs text-gray-500">Utilisasi</div>
          <div className="text-lg font-bold text-orange-600 mt-1">{utilization}%</div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mt-2">
            <div className="h-full bg-orange-500 rounded-full" style={{ width: `${utilization}%` }} />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
        {[
          { key: "overview" as const, label: "Overview" },
          { key: "transactions" as const, label: "Transaksi" },
          { key: "budget" as const, label: "Budget" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${
              activeTab === tab.key ? "bg-white text-orange-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Budget vs Actual</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Total Budget</span>
                <span className="font-semibold text-gray-900">{formatCurrency(budget)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Pengeluaran</span>
                <span className="font-semibold text-red-600">{formatCurrency(totalExpense)}</span>
              </div>
              <div className="h-px bg-gray-100" />
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Sisa Budget</span>
                <span className={`font-semibold ${budgetRemaining >= 0 ? "text-emerald-600" : "text-red-600"}`}>{formatCurrency(budgetRemaining)}</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden mt-2">
                <div className={`h-full rounded-full ${utilization > 90 ? "bg-red-500" : "bg-orange-500"}`} style={{ width: `${utilization}%` }} />
              </div>
              <div className="text-[10px] text-gray-400 text-right">{utilization}% terpakai</div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Ringkasan</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-emerald-50 rounded-xl text-center">
                <div className="text-lg font-bold text-emerald-600">{formatCurrency(totalIncome)}</div>
                <div className="text-[10px] text-gray-500">Pemasukan</div>
              </div>
              <div className="p-3 bg-red-50 rounded-xl text-center">
                <div className="text-lg font-bold text-red-600">{formatCurrency(totalExpense)}</div>
                <div className="text-[10px] text-gray-500">Pengeluaran</div>
              </div>
              <div className="p-3 bg-blue-50 rounded-xl text-center">
                <div className="text-lg font-bold text-blue-600">{transactions.length}</div>
                <div className="text-[10px] text-gray-500">Transaksi</div>
              </div>
              <div className="p-3 bg-orange-50 rounded-xl text-center">
                <div className={`text-lg font-bold ${netProfit >= 0 ? "text-emerald-600" : "text-red-600"}`}>{formatCurrency(netProfit)}</div>
                <div className="text-[10px] text-gray-500">Net Profit</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transactions */}
      {activeTab === "transactions" && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">Daftar Transaksi ({transactions.length})</h3>
          </div>
          <div className="overflow-x-auto">
            {transactions.length > 0 ? (
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3">Tanggal</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3">Deskripsi</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3">Kategori</th>
                    <th className="text-right text-xs font-semibold text-gray-500 uppercase px-5 py-3">Jumlah</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-orange-50/20 transition-colors">
                      <td className="px-5 py-3.5 text-sm text-gray-600">{tx.transactionDate || "-"}</td>
                      <td className="px-5 py-3.5 text-sm font-medium text-gray-900">{tx.description || tx.type}</td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex px-2.5 py-0.5 text-[10px] font-semibold rounded-full ${
                          tx.category === "income" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                        }`}>
                          {tx.category}
                        </span>
                      </td>
                      <td className={`px-5 py-3.5 text-sm font-semibold text-right ${tx.amount >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                        {tx.amount >= 0 ? "+" : ""}{formatCurrency(tx.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-center text-gray-400">
                <div className="text-3xl mb-2">💰</div>
                <p className="text-sm">Belum ada transaksi</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Budget */}
      {activeTab === "budget" && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Budget Breakdown</h3>
          {budgets.length > 0 ? (
            <div className="space-y-4">
              {budgets.map((b) => (
                <div key={b.id}>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="text-gray-600">{b.category}</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(b.actualAmount)} / {formatCurrency(b.plannedAmount)}</span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full"
                      style={{ width: `${b.plannedAmount > 0 ? Math.min((b.actualAmount / b.plannedAmount) * 100, 100) : 0}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-gray-400 mt-0.5">
                    {b.plannedAmount > 0 ? Math.round((b.actualAmount / b.plannedAmount) * 100) : 0}% dari budget
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <div className="text-3xl mb-2">📊</div>
              <p className="text-sm">Belum ada data budget</p>
            </div>
          )}
        </div>
      )}

      {/* Back */}
      <div className="text-center pt-2">
        <Link href={`/dashboard/events/${event_id}`} className="inline-flex items-center gap-2 text-sm font-medium text-orange-600 hover:text-orange-700">
          ← Kembali ke Detail Event
        </Link>
      </div>
    </div>
  );
}
