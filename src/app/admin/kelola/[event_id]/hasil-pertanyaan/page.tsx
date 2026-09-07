"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { use } from "react";
import { authFetch } from "@/lib/auth/client";

interface CustomQuestion {
  id: string;
  questionText: string;
  questionType: string;
  options: string[] | null;
  isRequired: boolean;
  orderIndex: number;
}

interface FeedbackAnswer {
  id: string;
  feedbackId: string;
  questionId: string;
  answerValue: string | null;
  ratingValue: number | null;
  createdAt: string;
}

interface Feedback {
  id: string;
  participantName: string;
  participantEmail: string;
  submittedAt: string;
  ratingOverall: number;
  ratingContent: number;
  ratingFacility: number;
  ratingPemateri: number;
  comments: string;
  customAnswers: FeedbackAnswer[];
}

export default function HasilPertanyaanPage({ params }: { params: Promise<{ event_id: string }> }) {
  const { event_id } = use(params);
  const [event, setEvent] = useState<any>(null);
  const [questions, setQuestions] = useState<CustomQuestion[]>([]);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuestion, setSelectedQuestion] = useState<CustomQuestion | null>(null);

  useEffect(() => {
    fetchData();
  }, [event_id]);

  const fetchData = async () => {
    try {
      // Fetch event
      const eventRes = await authFetch(`/api/admin/events/${event_id}`);
      const eventData = await eventRes.json();
      if (eventData.data) {
        setEvent(eventData.data);
      }

      // Fetch custom questions
      const questionsRes = await authFetch(`/api/feedback-questions?event_id=${event_id}`);
      const questionsData = await questionsRes.json();
      const sortedQuestions = (questionsData.data || []).sort((a: any, b: any) =>
        (a.orderIndex || 0) - (b.orderIndex || 0)
      );
      setQuestions(sortedQuestions);
      if (sortedQuestions.length > 0 && !selectedQuestion) {
        setSelectedQuestion(sortedQuestions[0]);
      }

      // Fetch all feedback
      const feedbackRes = await authFetch(`/api/feedback?event_id=${event_id}`);
      const feedbackData = await feedbackRes.json();
      setFeedback(feedbackData.data || []);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const getAnswersForQuestion = (questionId: string) => {
    return feedback
      .map(f => {
        const answer = f.customAnswers?.find((a: any) => a.questionId === questionId);
        return answer ? { feedback: f, answer } : null;
      })
      .filter(Boolean);
  };

  const getAnswerStats = (questionId: string) => {
    const answers = getAnswersForQuestion(questionId);
    const answeredCount = answers.length;
    const totalResponses = feedback.length;
    const unansweredCount = totalResponses - answeredCount;
    return { answeredCount, unansweredCount, totalResponses };
  };

  const getRatingStats = (questionId: string) => {
    const answers = getAnswersForQuestion(questionId);
    const ratings = answers
      .map((a: any) => a.answer.ratingValue)
      .filter((r: number | null) => r !== null && r > 0);

    if (ratings.length === 0) return null;

    const sum = ratings.reduce((a: number, b: number) => a + b, 0);
    const avg = sum / ratings.length;
    const distribution = [0, 0, 0, 0, 0];
    ratings.forEach((r: number) => {
      if (r >= 1 && r <= 5) distribution[r - 1]++;
    });

    return { avg: avg.toFixed(1), distribution, total: ratings.length };
  };

  const getTextAnswers = (questionId: string) => {
    const answers = getAnswersForQuestion(questionId);
    return answers
      .map((a: any) => ({
        name: a.feedback.participantName || 'Anonim',
        answer: a.answer.answerValue
      }))
      .filter((a: any) => a.answer);
  };

  const getMultipleChoiceStats = (question: CustomQuestion) => {
    const answers = getAnswersForQuestion(question.id);
    const options = question.options || [];
    const counts: Record<string, number> = {};
    options.forEach(opt => counts[opt] = 0);

    answers.forEach((a: any) => {
      if (a.answer.answerValue && counts.hasOwnProperty(a.answer.answerValue)) {
        counts[a.answer.answerValue]++;
      }
    });

    return { counts, total: answers.length };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <Link href={`/admin/kelola/${event_id}`} className="hover:text-orange-500">
              Kelola Event
            </Link>
            <span>/</span>
            <span>Hasil Pertanyaan</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Hasil Pertanyaan Kustom</h1>
          <p className="text-sm text-gray-500 mt-1">{event?.name}</p>
        </div>
        <Link
          href={`/admin/kelola/${event_id}`}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200"
        >
          Kembali
        </Link>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-orange-50 rounded-xl border border-orange-200 p-5">
          <div className="text-sm text-orange-600 mb-1">Total Pertanyaan</div>
          <div className="text-3xl font-bold text-orange-700">{questions.length}</div>
        </div>
        <div className="bg-blue-50 rounded-xl border border-blue-200 p-5">
          <div className="text-sm text-blue-600 mb-1">Total Feedback</div>
          <div className="text-3xl font-bold text-blue-700">{feedback.length}</div>
        </div>
        <div className="bg-green-50 rounded-xl border border-green-200 p-5">
          <div className="text-sm text-green-600 mb-1">Rating Rata-rata</div>
          <div className="text-3xl font-bold text-green-700">
            {feedback.length > 0
              ? (feedback.reduce((sum, f) => sum + (f.ratingOverall || 0), 0) / feedback.length).toFixed(1)
              : '-'
            }
          </div>
        </div>
      </div>

      {/* Questions List */}
      {questions.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Question List Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h2 className="font-bold text-gray-900">Daftar Pertanyaan</h2>
                <p className="text-xs text-gray-500 mt-1">Klik untuk melihat jawaban</p>
              </div>
              <div className="divide-y divide-gray-100">
                {questions.map((q, idx) => {
                  const stats = getAnswerStats(q.id);
                  return (
                    <button
                      key={q.id}
                      onClick={() => setSelectedQuestion(q)}
                      className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                        selectedQuestion?.id === q.id ? 'bg-orange-50' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          selectedQuestion?.id === q.id
                            ? 'bg-orange-500 text-white'
                            : 'bg-gray-200 text-gray-600'
                        }`}>
                          {idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 line-clamp-2">
                            {q.questionText}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`px-2 py-0.5 rounded text-xs ${
                              q.questionType === 'rating'
                                ? 'bg-yellow-100 text-yellow-700'
                                : q.questionType === 'multiple_choice'
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}>
                              {q.questionType === 'rating' ? 'Rating' :
                               q.questionType === 'multiple_choice' ? 'Pilihan Ganda' : 'Teks'}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {stats.answeredCount}/{stats.totalResponses} menjawab
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Question Detail */}
          <div className="lg:col-span-2">
            {selectedQuestion ? (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{selectedQuestion.questionText}</h3>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          selectedQuestion.questionType === 'rating'
                            ? 'bg-yellow-100 text-yellow-700'
                            : selectedQuestion.questionType === 'multiple_choice'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {selectedQuestion.questionType === 'rating' ? 'Rating Bintang' :
                           selectedQuestion.questionType === 'multiple_choice' ? 'Pilihan Ganda' : 'Jawaban Teks'}
                        </span>
                        {selectedQuestion.isRequired && (
                          <span className="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-700">
                            Wajib
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  {/* Rating Question */}
                  {selectedQuestion.questionType === 'rating' && (
                    <div className="space-y-4">
                      {(() => {
                        const stats = getRatingStats(selectedQuestion.id);
                        if (!stats) {
                          return (
                            <div className="text-center py-8 text-gray-500">
                              Belum ada jawaban rating
                            </div>
                          );
                        }
                        return (
                          <>
                            <div className="text-center">
                              <div className="text-5xl font-bold text-orange-600">{stats.avg}</div>
                              <div className="text-sm text-gray-500 mt-1">dari 5</div>
                              <div className="flex items-center justify-center gap-1 mt-2">
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <svg key={s} className={`w-6 h-6 ${s <= Math.round(Number(stats.avg)) ? 'text-orange-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                ))}
                              </div>
                            </div>
                            <div className="space-y-2">
                              {[5, 4, 3, 2, 1].map((star) => {
                                const percentage = stats.total > 0 ? (stats.distribution[star - 1] / stats.total) * 100 : 0;
                                return (
                                  <div key={star} className="flex items-center gap-3">
                                    <div className="w-8 text-sm text-gray-600">{star} ★</div>
                                    <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                                      <div
                                        className="h-full bg-yellow-400 rounded-full"
                                        style={{ width: `${percentage}%` }}
                                      />
                                    </div>
                                    <div className="w-16 text-sm text-gray-500 text-right">
                                      {stats.distribution[star - 1]} ({percentage.toFixed(0)}%)
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  )}

                  {/* Multiple Choice Question */}
                  {selectedQuestion.questionType === 'multiple_choice' && (
                    <div className="space-y-4">
                      {(() => {
                        const mcStats = getMultipleChoiceStats(selectedQuestion);
                        const maxCount = Math.max(...Object.values(mcStats.counts), 1);
                        return (
                          <div className="space-y-3">
                            {selectedQuestion.options?.map((option, idx) => {
                              const count = mcStats.counts[option] || 0;
                              const percentage = mcStats.total > 0 ? (count / mcStats.total) * 100 : 0;
                              return (
                                <div key={idx}>
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm font-medium text-gray-700">
                                      {option}
                                    </span>
                                    <span className="text-sm text-gray-500">
                                      {count} ({percentage.toFixed(0)}%)
                                    </span>
                                  </div>
                                  <div className="h-6 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-purple-500 rounded-full transition-all"
                                      style={{ width: `${percentage}%` }}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {/* Text Question */}
                  {selectedQuestion.questionType === 'text' && (
                    <div className="space-y-4">
                      {(() => {
                        const textAnswers = getTextAnswers(selectedQuestion.id);
                        if (textAnswers.length === 0) {
                          return (
                            <div className="text-center py-8 text-gray-500">
                              Belum ada jawaban teks
                            </div>
                          );
                        }
                        return (
                          <div className="space-y-3">
                            {textAnswers.map((item: any, idx: number) => (
                              <div key={idx} className="bg-gray-50 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                                    <span className="text-orange-600 font-bold text-sm">
                                      {item.name.charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                  <span className="text-sm font-medium text-gray-900">{item.name}</span>
                                </div>
                                <p className="text-gray-700">{item.answer}</p>
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <div className="text-gray-400 mb-2">Pilih pertanyaan</div>
                <p className="text-sm text-gray-500">Klik pertanyaan di samping untuk melihat jawaban</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="font-bold text-gray-900 mb-2">Belum Ada Pertanyaan Kustom</h3>
          <p className="text-gray-500 mb-4">Tambahkan pertanyaan kustom untuk feedback peserta</p>
          <Link
            href={`/admin/kelola/${event_id}?tab=pertanyaan`}
            className="inline-block px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600"
          >
            Kelola Pertanyaan
          </Link>
        </div>
      )}
    </div>
  );
}
