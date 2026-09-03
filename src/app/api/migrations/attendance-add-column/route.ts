import { NextResponse } from 'next/server';

// POST /api/migrations/attendance-add-column - Add participant_name column
export async function POST() {
  // For Supabase, the schema already includes this column
  return NextResponse.json({
    data: {
      message: 'Untuk Supabase, kolom participant_name sudah termasuk dalam schema. Jalankan postgresql-schema.sql di Supabase Dashboard.'
    }
  });
}
