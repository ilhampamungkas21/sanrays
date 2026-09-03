import { NextResponse } from 'next/server';

export async function POST() {
  // For Supabase, these tables should be created through the SQL Editor
  return NextResponse.json({
    success: true,
    message: 'Untuk Supabase, jalankan SQL schema di Supabase Dashboard > SQL Editor. Tabel feedback_questions dan feedback_answers sudah termasuk dalam postgresql-schema.sql.'
  });
}
