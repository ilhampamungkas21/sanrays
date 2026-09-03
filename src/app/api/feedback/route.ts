import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db/supabase';
import { toCamelCase, toCamelCaseArray, generateId } from '@/lib/db';

// GET /api/feedback
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('event_id');

    let query = supabase.from('feedback').select('*');

    if (eventId) {
      query = query.eq('event_id', eventId);
    }

    query = query.order('submitted_at', { ascending: false });

    const { data, error } = await query;

    if (error) throw error;

    const feedback = toCamelCaseArray<Record<string, unknown>>(data || []);

    // Fetch custom answers for each feedback
    if (feedback.length > 0) {
      const feedbackIds = feedback.map(f => f.id as string);

      const { data: answersData } = await supabase
        .from('feedback_answers')
        .select('*')
        .in('feedback_id', feedbackIds);

      const answersMap: Record<string, unknown[]> = {};
      if (answersData) {
        for (const row of answersData) {
          const answer = toCamelCase<Record<string, unknown>>(row);
          const fbId = row.feedback_id as string;
          if (!answersMap[fbId]) {
            answersMap[fbId] = [];
          }
          answersMap[fbId].push(answer);
        }
      }

      for (const f of feedback) {
        (f as Record<string, unknown>).customAnswers = answersMap[f.id as string] || [];
      }
    }

    return NextResponse.json({ data: feedback });
  } catch (err) {
    console.error('Get feedback error:', err);
    return NextResponse.json({ error: 'Gagal mengambil feedback' }, { status: 500 });
  }
}

// POST /api/feedback
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { eventId, participantName, participantEmail, ratingOverall, ratingContent, ratingFacility, ratingPemateri, comments, suggestions, customAnswers } = body;

    const id = generateId();

    // Insert main feedback
    const { error: feedbackError } = await supabase
      .from('feedback')
      .insert({
        id,
        event_id: eventId,
        participant_name: participantName || null,
        participant_email: participantEmail || null,
        rating_overall: ratingOverall || null,
        rating_content: ratingContent || null,
        rating_facility: ratingFacility || null,
        rating_pemateri: ratingPemateri || null,
        comments: comments || null,
        suggestions: suggestions || null,
      });

    if (feedbackError) throw feedbackError;

    // Insert custom answers if any
    if (customAnswers && Array.isArray(customAnswers) && customAnswers.length > 0) {
      const answersToInsert = customAnswers
        .filter((answer: Record<string, unknown>) =>
          answer.questionId && (answer.answerValue !== undefined || answer.ratingValue !== undefined)
        )
        .map((answer: Record<string, unknown>) => ({
          id: generateId(),
          feedback_id: id,
          question_id: answer.questionId,
          answer_value: answer.answerValue || null,
          rating_value: answer.ratingValue || null,
        }));

      if (answersToInsert.length > 0) {
        await supabase.from('feedback_answers').insert(answersToInsert);
      }
    }

    // Fetch the created feedback
    const { data: feedbackData } = await supabase
      .from('feedback')
      .select('*')
      .eq('id', id)
      .single();

    if (!feedbackData) {
      return NextResponse.json({ error: 'Gagal membuat feedback' }, { status: 500 });
    }

    const feedback = toCamelCase<Record<string, unknown>>(feedbackData);

    // Fetch custom answers
    const { data: answersData } = await supabase
      .from('feedback_answers')
      .select('*')
      .eq('feedback_id', id);

    const customAnswersList = (answersData || []).map(row =>
      toCamelCase<Record<string, unknown>>(row)
    );

    return NextResponse.json({ data: { ...feedback, customAnswers: customAnswersList } }, { status: 201 });
  } catch (err) {
    console.error('Create feedback error:', err);
    return NextResponse.json({ error: 'Gagal membuat feedback' }, { status: 500 });
  }
}
