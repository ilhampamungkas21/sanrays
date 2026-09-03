import { NextResponse } from 'next/server';
import { registerUser } from '@/lib/auth';
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

    const { email, password, name } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Nama, email, dan password diperlukan' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password minimal 6 karakter' },
        { status: 400 }
      );
    }

    const result = await registerUser(name, email, password);

    return NextResponse.json({
      user: result.user,
      token: result.token,
      message: 'Akun berhasil dibuat'
    }, { status: 201 });

  } catch (err) {
    console.error('Register error:', err);
    const error = err as Error;
    if (error.message === 'Email sudah terdaftar') {
      return NextResponse.json(
        { error: 'Email sudah terdaftar' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
