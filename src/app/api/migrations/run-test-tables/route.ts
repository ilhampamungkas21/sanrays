import { NextResponse } from 'next/server';

export async function POST() {
  // For Supabase, these tables should be created through the SQL Editor
  // This endpoint is kept for backward compatibility

  return NextResponse.json({
    success: true,
    message: 'Untuk Supabase, jalankan SQL schema di Supabase Dashboard > SQL Editor. Tabel test sudah termasuk dalam postgresql-schema.sql.'
  });
}
