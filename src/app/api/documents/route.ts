import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db/supabase';
import { getAuthUser } from '@/lib/auth';
import { toCamelCase, toCamelCaseArray, generateId } from '@/lib/db';
import { hasPermission } from '@/lib/rbac';

// GET /api/documents
export async function GET(request: Request) {
  try {
    // Allow public access for viewing documents (event detail pages)
    const authUser = getAuthUser(request);

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('event_id');

    // If event_id is provided, allow public access
    // Otherwise, require authentication
    if (!eventId && !authUser) {
      return NextResponse.json({ error: 'Tidak memiliki akses' }, { status: 401 });
    }

    let query = supabase.from('documents').select('*');

    if (eventId) {
      query = query.eq('event_id', eventId);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) throw error;

    const documents = toCamelCaseArray<Record<string, unknown>>(data || []);

    return NextResponse.json({ data: documents });
  } catch (err) {
    console.error('Get documents error:', err);
    return NextResponse.json({ error: 'Gagal mengambil documents' }, { status: 500 });
  }
}

// POST /api/documents
export async function POST(request: Request) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Tidak memiliki akses' }, { status: 401 });
    }

    if (!hasPermission(authUser.role, 'document:upload')) {
      return NextResponse.json({ error: 'Forbidden: Anda tidak memiliki akses untuk upload dokumen' }, { status: 403 });
    }

    const body = await request.json();

    const dbData = {
      id: generateId(),
      event_id: body.eventId || null,
      category: body.category,
      name: body.name,
      file_url: body.fileUrl || null,
      description: body.description || null,
      uploaded_by: body.uploadedBy || null,
    };

    const { data, error } = await supabase
      .from('documents')
      .insert(dbData)
      .select()
      .single();

    if (error) throw error;

    const document = toCamelCase<Record<string, unknown>>(data);

    return NextResponse.json({ data: document }, { status: 201 });
  } catch (err) {
    console.error('Create document error:', err);
    return NextResponse.json({ error: 'Gagal membuat document' }, { status: 500 });
  }
}
