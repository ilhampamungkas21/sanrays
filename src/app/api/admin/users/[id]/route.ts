import { NextResponse } from 'next/server';
import { getUserById, updateUser, deleteUser, getAuthUser, hashPassword } from '@/lib/auth';
import { supabase } from '@/lib/db/supabase';
import { hasPermission } from '@/lib/rbac';

// GET /api/admin/users/[id]
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Tidak memiliki akses' }, { status: 401 });
    }

    if (!hasPermission(authUser.role, 'user:view')) {
      return NextResponse.json({ error: 'Forbidden: Anda tidak memiliki akses' }, { status: 403 });
    }

    const { id } = await params;

    const user = await getUserById(id);
    if (!user) {
      return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 });
    }

    const { passwordHash: _, ...userWithoutPassword } = user;

    return NextResponse.json({ data: userWithoutPassword });
  } catch (err) {
    console.error('Get admin user error:', err);
    return NextResponse.json({ error: 'Gagal mengambil user' }, { status: 500 });
  }
}

// PUT /api/admin/users/[id]
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Tidak memiliki akses' }, { status: 401 });
    }

    if (!hasPermission(authUser.role, 'user:edit')) {
      return NextResponse.json({ error: 'Forbidden: Anda tidak memiliki akses untuk mengedit user' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();

    // Only super_admin can change roles
    if (body.role && authUser.role !== 'super_admin') {
      return NextResponse.json({ error: 'Hanya Super Admin yang bisa mengubah role' }, { status: 403 });
    }

    // Only super_admin can edit super_admin
    const targetUser = await getUserById(id);
    if (targetUser?.role === 'super_admin' && authUser.role !== 'super_admin') {
      return NextResponse.json({ error: 'Tidak dapat mengedit Super Admin' }, { status: 403 });
    }

    // Handle password update separately
    if (body.password) {
      if (body.password.length < 6) {
        return NextResponse.json({ error: 'Password minimal 6 karakter' }, { status: 400 });
      }
      const passwordHash = await hashPassword(body.password);
      await supabase.from('users').update({ password_hash: passwordHash }).eq('id', id);
    }

    // Update other fields
    const { password, ...updateData } = body;
    const updatedUser = await updateUser(id, updateData);

    if (!updatedUser) {
      return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 });
    }

    const { passwordHash: _, ...userWithoutPassword } = updatedUser;

    return NextResponse.json({ data: userWithoutPassword });
  } catch (err) {
    console.error('Update admin user error:', err);
    return NextResponse.json({ error: 'Gagal memperbarui user' }, { status: 500 });
  }
}

// DELETE /api/admin/users/[id]
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Tidak memiliki akses' }, { status: 401 });
    }

    if (!hasPermission(authUser.role, 'user:delete')) {
      return NextResponse.json({ error: 'Forbidden: Anda tidak memiliki akses untuk menghapus user' }, { status: 403 });
    }

    const { id } = await params;

    // Prevent self-deletion
    if (id === authUser.userId) {
      return NextResponse.json({ error: 'Tidak dapat menghapus akun sendiri' }, { status: 400 });
    }

    // Cannot delete super_admin
    const targetUser = await getUserById(id);
    if (targetUser?.role === 'super_admin') {
      return NextResponse.json({ error: 'Tidak dapat menghapus Super Admin' }, { status: 403 });
    }

    const success = await deleteUser(id);
    if (!success) {
      return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ message: 'User berhasil dihapus' });
  } catch (err) {
    console.error('Delete admin user error:', err);
    return NextResponse.json({ error: 'Gagal menghapus user' }, { status: 500 });
  }
}
