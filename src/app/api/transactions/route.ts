import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db/supabase';
import { getAuthUser } from '@/lib/auth';
import { toCamelCase, toCamelCaseArray, generateId } from '@/lib/db';

// GET /api/transactions
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('event_id');

    let query = supabase.from('transactions').select('*');

    if (eventId) {
      query = query.eq('event_id', eventId);
    }

    query = query.order('transaction_date', { ascending: false, nullsFirst: false })
                 .order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) throw error;

    const transactions = toCamelCaseArray<Record<string, unknown>>(data || []);

    return NextResponse.json({ data: transactions });
  } catch (err) {
    console.error('Get transactions error:', err);
    return NextResponse.json({ error: 'Gagal mengambil transactions' }, { status: 500 });
  }
}

// POST /api/transactions
export async function POST(request: Request) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Tidak memiliki akses' }, { status: 401 });
    }

    const body = await request.json();

    const dbData = {
      id: generateId(),
      event_id: body.eventId || null,
      category: body.category,
      type: body.type,
      amount: body.amount,
      description: body.description || null,
      vendor: body.vendor || null,
      receipt_url: body.receiptUrl || null,
      item_photo_url: body.itemPhotoUrl || null,
      purchase_link: body.purchaseLink || null,
      transaction_date: body.transactionDate || null,
      status: body.status || 'pending',
      paid_by: body.paidBy || null,
      approved_by: body.approvedBy || null,
    };

    const { data, error } = await supabase
      .from('transactions')
      .insert(dbData)
      .select()
      .single();

    if (error) throw error;

    const transaction = toCamelCase<Record<string, unknown>>(data);

    return NextResponse.json({ data: transaction }, { status: 201 });
  } catch (err) {
    console.error('Create transaction error:', err);
    return NextResponse.json({ error: 'Gagal membuat transaction' }, { status: 500 });
  }
}
