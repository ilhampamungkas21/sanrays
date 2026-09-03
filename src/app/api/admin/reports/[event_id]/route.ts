import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db/supabase';
import { getAuthUser } from '@/lib/auth';
import { hasPermission } from '@/lib/rbac';
import { toCamelCase, toCamelCaseArray } from '@/lib/db';

// Helper to safely parse JSON
function safeParse(value: unknown): unknown {
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }
  return value;
}

// GET /api/admin/reports/[event_id] - Get comprehensive event report
export async function GET(
  request: Request,
  { params }: { params: Promise<{ event_id: string }> }
) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Tidak memiliki akses' }, { status: 401 });
    }

    if (!hasPermission(authUser.role, 'report:view')) {
      return NextResponse.json({ error: 'Forbidden: Anda tidak memiliki akses ke laporan' }, { status: 403 });
    }

    const { event_id } = await params;

    // Get event details
    const { data: eventData, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', event_id)
      .single();

    if (eventError || !eventData) {
      return NextResponse.json({ error: 'Event tidak ditemukan' }, { status: 404 });
    }

    const event = toCamelCase<Record<string, unknown>>(eventData);
    event.highlights = safeParse(eventData.highlights);

    // Get participants
    const { data: participantData } = await supabase
      .from('participants')
      .select('*')
      .eq('event_id', event_id)
      .order('registration_date', { ascending: false });

    const participants = toCamelCaseArray<Record<string, unknown>>(participantData || []);

    // Get checklists
    const { data: checklistData } = await supabase
      .from('checklists')
      .select('*')
      .eq('event_id', event_id)
      .order('due_date', { ascending: true, nullsFirst: false });

    const checklists = toCamelCaseArray<Record<string, unknown>>(checklistData || []);

    // Get transactions
    const { data: transactionData } = await supabase
      .from('transactions')
      .select('*')
      .eq('event_id', event_id)
      .order('transaction_date', { ascending: false, nullsFirst: false });

    const transactions = toCamelCaseArray<Record<string, unknown>>(transactionData || []);

    // Get feedback
    const { data: feedbackData } = await supabase
      .from('feedback')
      .select('*')
      .eq('event_id', event_id)
      .order('submitted_at', { ascending: false });

    const feedback = toCamelCaseArray<Record<string, unknown>>(feedbackData || []);

    // Get custom questions
    const { data: questionData } = await supabase
      .from('feedback_questions')
      .select('*')
      .eq('event_id', event_id)
      .order('order_num', { ascending: true })
      .order('created_at', { ascending: true });

    const customQuestions = (questionData || []).map(row => {
      const q = toCamelCase<Record<string, unknown>>(row);
      q.options = safeParse(row.options);
      return q;
    });

    // Get custom answers
    if (feedback.length > 0 && customQuestions.length > 0) {
      const feedbackIds = feedback.map(f => f.id as string);
      const { data: answerData } = await supabase
        .from('feedback_answers')
        .select('*')
        .in('feedback_id', feedbackIds);

      const answersMap: Record<string, unknown[]> = {};
      if (answerData) {
        for (const row of answerData) {
          const answer = toCamelCase<Record<string, unknown>>(row);
          const fbId = row.feedback_id as string;
          if (!answersMap[fbId]) {
            answersMap[fbId] = [];
          }
          answersMap[fbId].push(answer);
        }
      }

      for (const f of feedback) {
        (f as Record<string, unknown>).customAnswers = answersMap[f.id as string] || [];
      }
    }

    // Calculate statistics
    const stats = {
      totalParticipants: participants.length,
      confirmedParticipants: participants.filter(p => ['confirmed', 'attended'].includes(p.status as string)).length,
      attendedParticipants: participants.filter(p => p.status === 'attended').length,
      cancelledParticipants: participants.filter(p => p.status === 'cancelled').length,
      attendanceRate: participants.length > 0
        ? Math.round((participants.filter(p => p.status === 'attended').length / participants.length) * 100)
        : 0,

      totalChecklists: checklists.length,
      completedChecklists: checklists.filter(c => c.status === 'completed').length,
      inProgressChecklists: checklists.filter(c => c.status === 'in_progress').length,
      pendingChecklists: checklists.filter(c => c.status === 'pending').length,
      checklistProgress: checklists.length > 0
        ? Math.round((checklists.filter(c => c.status === 'completed').length / checklists.length) * 100)
        : 0,

      totalIncome: transactions
        .filter(t => t.category === 'income')
        .reduce((sum, t) => sum + parseFloat(String(t.amount)), 0),
      totalExpense: transactions
        .filter(t => t.category === 'expense')
        .reduce((sum, t) => sum + parseFloat(String(t.amount)), 0),
      paidExpense: transactions
        .filter(t => t.category === 'expense' && t.status === 'paid')
        .reduce((sum, t) => sum + parseFloat(String(t.amount)), 0),
      pendingExpense: transactions
        .filter(t => t.category === 'expense' && t.status !== 'paid')
        .reduce((sum, t) => sum + parseFloat(String(t.amount)), 0),
      balance: transactions
        .filter(t => t.category === 'income')
        .reduce((sum, t) => sum + parseFloat(String(t.amount)), 0)
        - transactions
        .filter(t => t.category === 'expense')
        .reduce((sum, t) => sum + parseFloat(String(t.amount)), 0),

      totalFeedback: feedback.length,
      avgRatingOverall: feedback.length > 0
        ? (feedback.reduce((sum: number, f: Record<string, unknown>) => sum + (Number(f.ratingOverall) || 0), 0) / feedback.length).toFixed(1)
        : 0,
      avgRatingContent: feedback.length > 0
        ? (feedback.reduce((sum: number, f: Record<string, unknown>) => sum + (Number(f.ratingContent) || 0), 0) / feedback.length).toFixed(1)
        : 0,
      avgRatingFacility: feedback.length > 0
        ? (feedback.reduce((sum: number, f: Record<string, unknown>) => sum + (Number(f.ratingFacility) || 0), 0) / feedback.length).toFixed(1)
        : 0,
      avgRatingPemateri: feedback.length > 0
        ? (feedback.reduce((sum: number, f: Record<string, unknown>) => sum + (Number(f.ratingPemateri) || 0), 0) / feedback.length).toFixed(1)
        : 0,

      checklistsByCategory: categories.reduce((acc, cat) => {
        const catItems = checklists.filter(c => c.category === cat);
        acc[cat] = {
          total: catItems.length,
          completed: catItems.filter(c => c.status === 'completed').length,
        };
        return acc;
      }, {} as Record<string, { total: number; completed: number }>),
    };

    // Group transactions by month
    const transactionsByMonth: Record<string, { income: number; expense: number }> = {};
    for (const t of transactions) {
      const month = new Date(t.transactionDate as string).toLocaleString('id-ID', { month: 'long', year: 'numeric' });
      if (!transactionsByMonth[month]) transactionsByMonth[month] = { income: 0, expense: 0 };
      if (t.category === 'income') {
        transactionsByMonth[month].income += parseFloat(String(t.amount));
      } else {
        transactionsByMonth[month].expense += parseFloat(String(t.amount));
      }
    }

    return NextResponse.json({
      data: {
        event,
        participants,
        checklists,
        transactions,
        feedback,
        customQuestions,
        stats,
        transactionsByMonth,
      }
    });
  } catch (err) {
    console.error('Get report error:', err);
    return NextResponse.json({ error: 'Gagal mengambil report' }, { status: 500 });
  }
}

const categories = ['acara', 'konsumsi', 'perlengkapan', 'humas', 'keuangan', 'dokumentasi', 'timing', 'lainnya'];
