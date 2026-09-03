import { NextResponse } from 'next/server';

// POST /api/migrations/transaction-photos - Add photo columns to transactions
export async function POST() {
  // For Supabase, these columns are already included in the schema
  return NextResponse.json({
    data: {
      message: 'Untuk Supabase, kolom item_photo_url dan purchase_link sudah termasuk dalam schema transactions. Jalankan postgresql-schema.sql di Supabase Dashboard.'
    }
  });
}
