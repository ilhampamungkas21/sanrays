"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { use } from "react";

interface TestQuestion {
  id: string;
  questionText: string;
  questionType: string;
  options: string[] | null;
  orderNum: number;
}

interface Test {
  id: string;
  eventId: string;
  testType: string;
  title: string;
  description: string;
  questions: TestQuestion[];
}

interface Answer {
  questionId: string;
  answerValue: string;
}

export default function TestPage({ params }: { params: Promise<{ test_id: string }> }) {
  const { test_id } = use(params);
  const [test, setTest] = useState<Test | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const [participantName, setParticipantName] = useState("");
  const [participantEmail, setParticipantEmail] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);

  useEffect(() => {
    fetchTest();
  }, [test_id]);

  const fetchTest = async () => {
    try {
      const response = await fetch(`/api/participant-tests/${test_id}`);
      const data = await response.json();
      if (data.data) {
        setTest(data.data);
      } else {
        setError(data.error || "Test tidak ditemukan");
      }
    } catch (err) {
      setError("Gagal memuat test");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!participantName.trim()) {
      setError("Nama wajib diisi");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const response = await fetch(`/api/participant-tests/${test_id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          participantName,
          participantEmail,
          answers: Object.entries(answers).map(([questionId, answerValue]) => ({
            questionId,
            answerValue,
          })),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitted(true);
      } else {
        setError(data.error || "Gagal mengirim jawaban");
      }
    } catch (err) {
      setError("Terjadi kesalahan saat mengirim jawaban");
    } finally {
      setSubmitting(false);
    }
  };

  const isAnswered = (questionId: string) => {
    return answers[questionId] && answers[questionId].trim() !== "";
  };

  const answeredCount = test?.questions.filter(q => isAnswered(q.id)).length || 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error && !test) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Test Tidak Ditemukan</h1>
          <p className="text-gray-500 mb-4">{error}</p>
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
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 bg-green-100">
            <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-green-600 mb-2">Terima Kasih!</h2>

          <p className="text-gray-500 mb-6">
            Jawaban kamu telah berhasil dikirim.
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

  if (!test) return null;

  const currentQ = test.questions[currentQuestion];
  const testTypeLabel = test.testType === 'pre_test' ? 'Pre-Test' : 'Post-Test';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/logo-sanrays.png" alt="Sanrays" className="w-11 h-11 rounded-lg object-contain" />
              <div>
                <span className="text-xs text-orange-600 font-medium">{testTypeLabel}</span>
                <h1 className="text-lg font-bold text-gray-900">{test.title}</h1>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              {answeredCount}/{test.questions.length} dijawab
            </div>
          </div>
        </div>
      </nav>

      {/* Progress */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex gap-1">
            {test.questions.map((q, idx) => (
              <button
                key={q.id}
                onClick={() => setCurrentQuestion(idx)}
                className={`flex-1 h-2 rounded-full transition-colors ${
                  idx === currentQuestion
                    ? 'bg-orange-500'
                    : isAnswered(q.id)
                    ? 'bg-green-400'
                    : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit}>
          {/* Participant Info */}
          {currentQuestion === 0 && !participantName && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Identitas Peserta</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Lengkap *
                  </label>
                  <input
                    type="text"
                    required
                    value={participantName}
                    onChange={(e) => setParticipantName(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Nama kamu"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email (opsional)
                  </label>
                  <input
                    type="email"
                    value={participantEmail}
                    onChange={(e) => setParticipantEmail(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="email@email.com"
                  />
                </div>
              </div>
              {test.description && (
                <p className="text-sm text-gray-500 mt-4">{test.description}</p>
              )}
            </div>
          )}

          {/* Question */}
          {currentQ && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-500">
                  Pertanyaan {currentQuestion + 1} dari {test.questions.length}
                </span>
              </div>

              <h3 className="text-lg font-medium text-gray-900 mb-6">
                {currentQ.questionText}
              </h3>

              {currentQ.questionType === 'multiple_choice' && currentQ.options && (
                <div className="space-y-3">
                  {currentQ.options.map((option, idx) => (
                    <label
                      key={idx}
                      className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        answers[currentQ.id] === option
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question_${currentQ.id}`}
                        value={option}
                        checked={answers[currentQ.id] === option}
                        onChange={() => handleAnswerChange(currentQ.id, option)}
                        className="w-5 h-5 text-orange-500"
                      />
                      <span className="text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
              )}

              {currentQ.questionType === 'true_false' && (
                <div className="space-y-3">
                  {['Benar', 'Salah'].map((option) => (
                    <label
                      key={option}
                      className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        answers[currentQ.id] === option
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question_${currentQ.id}`}
                        value={option}
                        checked={answers[currentQ.id] === option}
                        onChange={() => handleAnswerChange(currentQ.id, option)}
                        className="w-5 h-5 text-orange-500"
                      />
                      <span className="text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
              )}

              {currentQ.questionType === 'essay' && (
                <textarea
                  value={answers[currentQ.id] || ''}
                  onChange={(e) => handleAnswerChange(currentQ.id, e.target.value)}
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Ketik jawaban Anda di sini..."
                />
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6">
            <button
              type="button"
              onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
              disabled={currentQuestion === 0}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sebelumnya
            </button>

            <div className="flex gap-2">
              {test.questions.map((q, idx) => (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setCurrentQuestion(idx)}
                  className={`w-8 h-8 rounded-full text-sm font-medium ${
                    idx === currentQuestion
                      ? 'bg-orange-500 text-white'
                      : isAnswered(q.id)
                      ? 'bg-green-400 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>

            {currentQuestion < test.questions.length - 1 ? (
              <button
                type="button"
                onClick={() => setCurrentQuestion(currentQuestion + 1)}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
              >
                Selanjutnya
              </button>
            ) : (
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
              >
                {submitting ? 'Mengirim...' : 'Kirim Jawaban'}
              </button>
            )}
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm text-center">
              {error}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
