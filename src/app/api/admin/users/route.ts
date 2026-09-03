import { NextResponse } from 'next/server';
import { getAllUsers, createUser, getAuthUser } from '@/lib/auth';
import { hasPermission } from '@/lib/rbac';

// GET /api/admin/users - Get all users
export async function GET(request: Request) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Tidak memiliki akses' }, { status: 401 });
    }

    if (!hasPermission(authUser.role, 'user:view')) {
      return NextResponse.json({ error: 'Forbidden: Anda tidak memiliki akses ke manajemen user' }, { status: 403 });
    }

    const users = await getAllUsers();
    return NextResponse.json({ data: users, count: users.length });
  } catch (err) {
    console.error('Get admin users error:', err);
    return NextResponse.json({ error: 'Gagal mengambil users' }, { status: 500 });
  }
}

// POST /api/admin/users - Create new user
export async function POST(request: Request) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Tidak memiliki akses' }, { status: 401 });
    }

    if (!hasPermission(authUser.role, 'user:create')) {
      return NextResponse.json({ error: 'Forbidden: Anda tidak memiliki akses untuk membuat user' }, { status: 403 });
    }

    const { name, email, password, role } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, dan password diperlukan' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password minimal 6 karakter' },
        { status: 400 }
      );
    }

    // Only super_admin can create super_admin or admin roles
    if ((role === 'super_admin' || role === 'admin') && authUser.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Hanya Super Admin yang bisa membuat role Admin/Super Admin' },
        { status: 403 }
      );
    }

    const user = await createUser(name, email, password, role || 'admin');
    const { passwordHash: _, ...userWithoutPassword } = user;

    return NextResponse.json({ data: userWithoutPassword }, { status: 201 });
  } catch (err) {
    console.error('Create admin user error:', err);
    const error = err as Error;
    if (error.message === 'Email sudah terdaftar') {
      return NextResponse.json({ error: 'Email sudah terdaftar' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Gagal membuat user' }, { status: 500 });
  }
}
