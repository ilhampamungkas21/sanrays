"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { use } from "react";

interface FeedbackQuestion {
  id: string;
  eventId: string;
  questionText: string;
  questionType: string;
  options: string[] | null;
  isRequired: boolean;
  orderNum: number;
}

interface CustomAnswer {
  questionId: string;
  answerValue?: string;
  ratingValue?: number;
}

interface FeedbackFormData {
  participantName: string;
  participantEmail: string;
  ratingOverall: number;
  ratingContent: number;
  ratingFacility: number;
  ratingPemateri: number;
  comments: string;
  suggestions: string;
  customAnswers: CustomAnswer[];
}

export default function FeedbackPage({ params }: { params: Promise<{ event_id: string }> }) {
  const { event_id } = use(params);
  const [event, setEvent] = useState<any>(null);
  const [customQuestions, setCustomQuestions] = useState<FeedbackQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState<FeedbackFormData>({
    participantName: "",
    participantEmail: "",
    ratingOverall: 5,
    ratingContent: 5,
    ratingFacility: 5,
    ratingPemateri: 5,
    comments: "",
    suggestions: "",
    customAnswers: [],
  });

  useEffect(() => {
    fetchEventAndQuestions();
  }, [event_id]);

  const fetchEventAndQuestions = async () => {
    try {
      const [eventRes, questionsRes] = await Promise.all([
        fetch(`/api/events/${event_id}`),
        fetch(`/api/feedback-questions?event_id=${event_id}`),
      ]);

      const eventData = await eventRes.json();
      const questionsData = await questionsRes.json();

      if (eventData.data) {
        setEvent(eventData.data);
      }

      if (questionsData.data && questionsData.data.length > 0) {
        setCustomQuestions(questionsData.data);
        // Initialize custom answers
        setFormData(prev => ({
          ...prev,
          customAnswers: questionsData.data.map((q: FeedbackQuestion) => ({
            questionId: q.id,
            answerValue: q.questionType === 'text' ? '' : undefined,
            ratingValue: q.questionType === 'rating' ? 5 : undefined,
          })),
        }));
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomAnswerChange = (questionId: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      customAnswers: prev.customAnswers.map(a =>
        a.questionId === questionId
          ? {
              ...a,
              answerValue: typeof value === 'string' ? value : undefined,
              ratingValue: typeof value === 'number' ? value : undefined,
            }
          : a
      ),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    // Validate required custom questions
    const requiredQuestions = customQuestions.filter(q => q.isRequired);
    for (const q of requiredQuestions) {
      const answer = formData.customAnswers.find(a => a.questionId === q.id);
      if (q.questionType === 'rating') {
        if (!answer?.ratingValue) {
          setError(`Pertanyaan "${q.questionText}" wajib diisi`);
          setSubmitting(false);
          return;
        }
      } else {
        if (!answer?.answerValue?.trim()) {
          setError(`Pertanyaan "${q.questionText}" wajib diisi`);
          setSubmitting(false);
          return;
        }
      }
    }

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: event_id,
          participantName: formData.participantName,
          participantEmail: formData.participantEmail,
          ratingOverall: formData.ratingOverall,
          ratingContent: formData.ratingContent,
          ratingFacility: formData.ratingFacility,
          ratingPemateri: formData.ratingPemateri,
          comments: formData.comments,
          suggestions: formData.suggestions,
          customAnswers: formData.customAnswers,
        }),
      });

      if (response.ok) {
        setSubmitted(true);
      } else {
        const data = await response.json();
        setError(data.error || "Gagal mengirim feedback");
      }
    } catch (err) {
      setError("Terjadi kesalahan saat mengirim feedback");
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (
    value: number,
    onChange: (val: number) => void,
    label: string
  ) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className={`text-3xl transition-colors ${
              star <= value ? "text-yellow-400" : "text-gray-300"
            }`}
          >
            ★
          </button>
        ))}
        <span className="ml-2 text-sm text-gray-500 self-center">{value}/5</span>
      </div>
    </div>
  );

  const renderCustomQuestion = (question: FeedbackQuestion) => {
    const answer = formData.customAnswers.find(a => a.questionId === question.id);

    switch (question.questionType) {
      case 'rating':
        return (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {question.questionText}
              {question.isRequired && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleCustomAnswerChange(question.id, star)}
                  className={`text-2xl transition-colors ${
                    star <= (answer?.ratingValue || 0) ? "text-yellow-400" : "text-gray-300"
                  }`}
                >
                  ★
                </button>
              ))}
              <span className="ml-2 text-sm text-gray-500 self-center">
                {answer?.ratingValue || 0}/5
              </span>
            </div>
          </div>
        );

      case 'multiple_choice':
        return (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {question.questionText}
              {question.isRequired && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="space-y-2">
              {question.options?.map((option, idx) => (
                <label key={idx} className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50">
                  <input
                    type="radio"
                    name={`question_${question.id}`}
                    value={option}
                    checked={answer?.answerValue === option}
                    onChange={() => handleCustomAnswerChange(question.id, option)}
                    className="w-4 h-4 text-orange-500 border-gray-300"
                  />
                  <span className="text-sm text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </div>
        );

      default:
        return (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {question.questionText}
              {question.isRequired && <span className="text-red-500 ml-1">*</span>}
            </label>
            <textarea
              value={answer?.answerValue || ''}
              onChange={(e) => handleCustomAnswerChange(question.id, e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="Ketik jawaban Anda..."
            />
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Event Tidak Ditemukan</h1>
          <p className="text-gray-500 mb-4">Link feedback mungkin salah atau sudah kadaluarsa.</p>
          <Link href="/" className="text-orange-600 hover:underline">
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Terima Kasih!</h2>
          <p className="text-gray-500 mb-6">
            Feedback kamu telah berhasil dikirim. Masukan kamu sangat berharga untuk meningkatkan kualitas event kami.
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition-colors"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <Link href="/" className="flex items-center gap-3">
            <img src="/logo-sanrays.png" alt="Sanrays" className="w-10 h-10 rounded-lg object-contain" />
            <span className="text-xl font-bold text-gray-900">Sanrays</span>
          </Link>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="mb-8">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold mb-4">
              Form Feedback
            </span>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Feedback Event: {event.name}
            </h1>
            <p className="text-gray-500">
              Mohon isi feedback kamu untuk membantu kami meningkatkan kualitas event di masa depan.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Data Diri */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Diri</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Lengkap *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.participantName}
                    onChange={(e) => setFormData({ ...formData, participantName: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Nama kamu"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.participantEmail}
                    onChange={(e) => setFormData({ ...formData, participantEmail: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="email@email.com"
                  />
                </div>
              </div>
            </div>

            {/* Rating */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Penilaian</h3>
              <p className="text-sm text-gray-500 mb-4">Berikan rating 1-5 bintang untuk setiap aspek:</p>

              {renderStars(
                formData.ratingOverall,
                (val) => setFormData({ ...formData, ratingOverall: val }),
                "Penilaian Overall"
              )}
              {renderStars(
                formData.ratingContent,
                (val) => setFormData({ ...formData, ratingContent: val }),
                "Kualitas Konten/Materi"
              )}
              {renderStars(
                formData.ratingPemateri,
                (val) => setFormData({ ...formData, ratingPemateri: val }),
                "Penampilan Pemateri"
              )}
              {renderStars(
                formData.ratingFacility,
                (val) => setFormData({ ...formData, ratingFacility: val }),
                "Fasilitas & Tempat"
              )}
            </div>

            {/* Custom Questions */}
            {customQuestions.length > 0 && (
              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Pertanyaan Tambahan</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Jawab pertanyaan berikut sesuai pengalaman kamu:
                </p>

                {customQuestions
                  .sort((a, b) => a.orderNum - b.orderNum)
                  .map(question => (
                    <div key={question.id}>
                      {renderCustomQuestion(question)}
                    </div>
                  ))}
              </div>
            )}

            {/* Komentar */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Komentar & Saran</h3>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Komentar
                </label>
                <textarea
                  value={formData.comments}
                  onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Ceritakan pengalaman kamu mengikuti event ini..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Saran untuk Event Selanjutnya
                </label>
                <textarea
                  value={formData.suggestions}
                  onChange={(e) => setFormData({ ...formData, suggestions: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Saran atau masukan untuk meningkatkan kualitas event..."
                />
              </div>
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-3 pt-4">
              <Link
                href="/"
                className="px-6 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
              >
                Batal
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="px-8 py-3 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition-colors disabled:opacity-50"
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Mengirim...
                  </span>
                ) : (
                  "Kirim Feedback"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
