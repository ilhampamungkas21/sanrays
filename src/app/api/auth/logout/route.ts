import { NextResponse } from 'next/server';
import { clearAuthData } from '@/lib/auth/client';

export async function POST() {
  try {
    // Clear auth data on server side (if using cookies)
    // Client will clear localStorage via client-side logout

    return NextResponse.json({ message: 'Logout berhasil' });
  } catch (err) {
    console.error('Logout error:', err);
    return NextResponse.json({ error: 'Logout gagal' }, { status: 500 });
  }
}
