import { NextResponse } from 'next/server';
import { loginUser } from '@/lib/auth';
import { checkConnection } from '@/lib/db/supabase';

export async function POST(request: Request) {
  try {
    // Check database connection
    const isConnected = await checkConnection();
    if (!isConnected) {
      return NextResponse.json(
        { error: 'Database tidak terhubung. Pastikan Supabase sudah dikonfigurasi.' },
        { status: 503 }
      );
    }

    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email dan password diperlukan' },
        { status: 400 }
      );
    }

    const result = await loginUser(email, password);

    if (!result) {
      return NextResponse.json(
        { error: 'Email atau password salah' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      user: result.user,
      token: result.token
    });
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
