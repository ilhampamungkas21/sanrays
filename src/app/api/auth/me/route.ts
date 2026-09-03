import { NextResponse } from 'next/server';
import { getAuthUser, getUserById } from '@/lib/auth';
import { checkConnection } from '@/lib/db/supabase';

export async function GET(request: Request) {
  try {
    const isConnected = await checkConnection();
    if (!isConnected) {
      return NextResponse.json({ error: 'Database tidak terhubung' }, { status: 503 });
    }

    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Tidak memiliki akses' }, { status: 401 });
    }

    const user = await getUserById(authUser.userId);
    if (!user) {
      return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 });
    }

    const { passwordHash: _, ...userWithoutPassword } = user;
    return NextResponse.json({ user: userWithoutPassword });
  } catch (err) {
    console.error('Get user error:', err);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
