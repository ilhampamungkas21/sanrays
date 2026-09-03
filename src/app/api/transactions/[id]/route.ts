import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db/supabase';
import { getAuthUser } from '@/lib/auth';
import { toCamelCase } from '@/lib/db';

// GET /api/transactions/[id]
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Transaction tidak ditemukan' }, { status: 404 });
    }

    const transaction = toCamelCase<Record<string, unknown>>(data);

    return NextResponse.json({ data: transaction });
  } catch (err) {
    console.error('Get transaction error:', err);
    return NextResponse.json({ error: 'Gagal mengambil transaction' }, { status: 500 });
  }
}

// PUT /api/transactions/[id]
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Tidak memiliki akses' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const updates: Record<string, unknown> = {};

    if (body.eventId !== undefined) updates.event_id = body.eventId;
    if (body.category !== undefined) updates.category = body.category;
    if (body.type !== undefined) updates.type = body.type;
    if (body.amount !== undefined) updates.amount = body.amount;
    if (body.description !== undefined) updates.description = body.description;
    if (body.vendor !== undefined) updates.vendor = body.vendor;
    if (body.receiptUrl !== undefined) updates.receipt_url = body.receiptUrl;
    if (body.itemPhotoUrl !== undefined) updates.item_photo_url = body.itemPhotoUrl;
    if (body.purchaseLink !== undefined) updates.purchase_link = body.purchaseLink;
    if (body.transactionDate !== undefined) updates.transaction_date = body.transactionDate;
    if (body.status !== undefined) updates.status = body.status;
    if (body.paidBy !== undefined) updates.paid_by = body.paidBy;
    if (body.approvedBy !== undefined) updates.approved_by = body.approvedBy;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('transactions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!data) {
      return NextResponse.json({ error: 'Transaction tidak ditemukan' }, { status: 404 });
    }

    const transaction = toCamelCase<Record<string, unknown>>(data);

    return NextResponse.json({ data: transaction });
  } catch (err) {
    console.error('Update transaction error:', err);
    return NextResponse.json({ error: 'Gagal memperbarui transaction' }, { status: 500 });
  }
}

// DELETE /api/transactions/[id]
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Tidak memiliki akses' }, { status: 401 });
    }

    const { id } = await params;

    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: 'Transaction berhasil dihapus' });
  } catch (err) {
    console.error('Delete transaction error:', err);
    return NextResponse.json({ error: 'Gagal menghapus transaction' }, { status: 500 });
  }
}
