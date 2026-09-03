import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db/supabase';
import { getAuthUser } from '@/lib/auth';
import { toCamelCase } from '@/lib/db';
import { hasPermission } from '@/lib/rbac';

// GET /api/documents/[id]
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Tidak memiliki akses' }, { status: 401 });
    }

    if (!hasPermission(authUser.role, 'document:view')) {
      return NextResponse.json({ error: 'Forbidden: Anda tidak memiliki akses' }, { status: 403 });
    }

    const { id } = await params;

    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Document tidak ditemukan' }, { status: 404 });
    }

    const document = toCamelCase<Record<string, unknown>>(data);

    return NextResponse.json({ data: document });
  } catch (err) {
    console.error('Get document error:', err);
    return NextResponse.json({ error: 'Gagal mengambil document' }, { status: 500 });
  }
}

// PUT /api/documents/[id]
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Tidak memiliki akses' }, { status: 401 });
    }

    if (!hasPermission(authUser.role, 'document:upload')) {
      return NextResponse.json({ error: 'Forbidden: Anda tidak memiliki akses untuk edit dokumen' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();

    const updates: Record<string, unknown> = {};

    if (body.eventId !== undefined) updates.event_id = body.eventId;
    if (body.category !== undefined) updates.category = body.category;
    if (body.name !== undefined) updates.name = body.name;
    if (body.fileUrl !== undefined) updates.file_url = body.fileUrl;
    if (body.description !== undefined) updates.description = body.description;
    if (body.uploadedBy !== undefined) updates.uploaded_by = body.uploadedBy;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('documents')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!data) {
      return NextResponse.json({ error: 'Document tidak ditemukan' }, { status: 404 });
    }

    const document = toCamelCase<Record<string, unknown>>(data);

    return NextResponse.json({ data: document });
  } catch (err) {
    console.error('Update document error:', err);
    return NextResponse.json({ error: 'Gagal memperbarui document' }, { status: 500 });
  }
}

// DELETE /api/documents/[id]
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Tidak memiliki akses' }, { status: 401 });
    }

    if (!hasPermission(authUser.role, 'document:upload')) {
      return NextResponse.json({ error: 'Forbidden: Anda tidak memiliki akses untuk hapus dokumen' }, { status: 403 });
    }

    const { id } = await params;

    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: 'Document berhasil dihapus' });
  } catch (err) {
    console.error('Delete document error:', err);
    return NextResponse.json({ error: 'Gagal menghapus document' }, { status: 500 });
  }
}
