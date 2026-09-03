import { NextResponse } from 'next/server';

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const jwtSecret = process.env.JWT_SECRET;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  return NextResponse.json({
    hasSupabaseUrl: !!supabaseUrl,
    supabaseUrlPreview: supabaseUrl ? supabaseUrl.substring(0, 30) + '...' : 'NOT SET',
    hasSupabaseKey: !!supabaseKey,
    supabaseKeyPreview: supabaseKey ? supabaseKey.substring(0, 30) + '...' : 'NOT SET',
    hasJwtSecret: !!jwtSecret,
    hasAppUrl: !!appUrl,
    appUrlValue: appUrl || 'NOT SET',
  });
}