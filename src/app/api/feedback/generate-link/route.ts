import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db/supabase';
import { getAuthUser } from '@/lib/auth';

// GET /api/feedback/generate-link?event_id=xxx
// Generate a shareable feedback link for an event
export async function GET(request: Request) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Tidak memiliki akses' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('event_id');

    if (!eventId) {
      return NextResponse.json({ error: 'event_id diperlukan' }, { status: 400 });
    }

    // Verify event exists
    const { data, error } = await supabase
      .from('events')
      .select('id, name, date')
      .eq('id', eventId)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Event tidak ditemukan' }, { status: 404 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const feedbackLink = `${baseUrl}/feedback/${eventId}`;

    return NextResponse.json({
      data: {
        eventId: data.id,
        eventName: data.name,
        feedbackLink,
        message: `Link feedback untuk event "${data.name}"`
      }
    });
  } catch (err) {
    console.error('Generate feedback link error:', err);
    return NextResponse.json({ error: 'Failed to generate feedback link' }, { status: 500 });
  }
}
