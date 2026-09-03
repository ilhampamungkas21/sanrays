"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { getAuthState, authFetch } from "@/lib/auth/client";
import Link from "next/link";
import { hasPermission, getRoleLabel } from "@/lib/rbac";
import QRCode from "qrcode";

const categories = ['acara', 'konsumsi', 'perlengkapan', 'humas', 'keuangan', 'dokumentasi', 'timing', 'lainnya'];
const transactionCategories = ['income', 'expense'];
const docCategories = ['sertifikat', 'materi', 'foto', 'video', 'lpj', 'kontrak', 'lainnya'];
const questionTypes = ['text', 'rating', 'multiple_choice'];

interface FeedbackQuestion {
  id: string;
  eventId: string;
  questionText: string;
  questionType: string;
  options: string[] | null;
  isRequired: boolean;
  orderNum: number;
}

interface EventTest {
  id: string;
  eventId: string;
  testType: string;
  title: string;
  description: string | null;
  timeLimitMinutes: number | null;
  isActive: boolean;
  questionCount?: number;
}

interface TestQuestion {
  id: string;
  testId: string;
  questionText: string;
  questionType: string;
  options: string[] | null;
  orderNum: number;
}

export default function EventKelolaPage({ params }: { params: Promise<{ event_id: string }> }) {
  const router = useRouter();
  const [eventId, setEventId] = useState("");
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("peserta");
  const [userRole, setUserRole] = useState<string>("");

  // Permission states
  const canView = hasPermission(userRole, 'event:view');
  const canEdit = hasPermission(userRole, 'event:edit');
  const canManageParticipants = hasPermission(userRole, 'participant:edit');
  const canManageFinance = hasPermission(userRole, 'finance:edit');
  const canManageChecklist = hasPermission(userRole, 'checklist:edit');

  // Data states
  const [participants, setParticipants] = useState<any[]>([]);
  const [checklists, setChecklists] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [feedback, setFeedback] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [feedbackQuestions, setFeedbackQuestions] = useState<FeedbackQuestion[]>([]);
  const [eventTests, setEventTests] = useState<EventTest[]>([]);
  const [selectedTest, setSelectedTest] = useState<EventTest | null>(null);
  const [testQuestions, setTestQuestions] = useState<TestQuestion[]>([]);
  const [copiedTestId, setCopiedTestId] = useState<string | null>(null);

  // Attendance sessions state
  const [attendanceSessions, setAttendanceSessions] = useState<any[]>([]);
  const [selectedSession, setSelectedSession] = useState<any | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sessionModalOpen, setSessionModalOpen] = useState(false);
  const [sessionFormData, setSessionFormData] = useState({ sessionName: '' });
  const [sessionAttendance, setSessionAttendance] = useState<any[]>([]);
  const [sessionAttendanceCounts, setSessionAttendanceCounts] = useState<Record<string, number>>({});
  const [copiedSessionId, setCopiedSessionId] = useState<string | null>(null);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [editItem, setEditItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [feedbackLink, setFeedbackLink] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);

  useEffect(() => {
    params.then(({ event_id }) => setEventId(event_id));
  }, [params]);

  useEffect(() => {
    if (!eventId) return;
    checkAuth();
    fetchEvent();
    fetchAllData();
  }, [eventId]);

  const checkAuth = async () => {
    const authState = getAuthState();
    if (!authState.isAuthenticated) {
      router.push("/login");
      return;
    }

    // Set user role
    const role = authState.user?.role || '';
    setUserRole(role);

    // Check permission
    if (!hasPermission(role, 'event:view')) {
      alert(`Akses ditolak. Role "${getRoleLabel(role)}" tidak memiliki akses ke halaman ini.`);
      router.push("/dashboard");
      return;
    }
  };

  const fetchEvent = async () => {
    try {
      const response = await authFetch(`/api/admin/events/${eventId}`);
      const data = await response.json();
      if (data.data) {
        setEvent(data.data);
      }
    } catch (err) {
      console.error("Error fetching event:", err);
    }
  };

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [pRes, cRes, tRes, dRes, fRes, aRes, qRes, testRes] = await Promise.all([
        authFetch(`/api/participants?event_id=${eventId}`),
        authFetch(`/api/checklists?event_id=${eventId}`),
        authFetch(`/api/transactions?event_id=${eventId}`),
        authFetch(`/api/documents?event_id=${eventId}`),
        authFetch(`/api/feedback?event_id=${eventId}`),
        authFetch(`/api/attendance?event_id=${eventId}`),
        authFetch(`/api/feedback-questions?event_id=${eventId}`),
        authFetch(`/api/event-tests?event_id=${eventId}`),
      ]);

      const [p, c, t, d, f, a, q, tests] = await Promise.all([
        pRes.json(),
        cRes.json(),
        tRes.json(),
        dRes.json(),
        fRes.json(),
        aRes.json(),
        qRes.json(),
        testRes.json(),
      ]);

      setParticipants(p.data || []);
      setChecklists(c.data || []);
      setTransactions(t.data || []);
      setDocuments(d.data || []);
      setFeedback(f.data || []);
      setAttendance(a.data || []);
      setFeedbackQuestions(q.data || []);

      // Fetch question counts for all tests
      const testList = tests.data || [];
      if (testList.length > 0) {
        const questionCounts = await Promise.all(
          testList.map(async (test: any) => {
            try {
              const res = await authFetch(`/api/test-questions?test_id=${test.id}`);
              const data = await res.json();
              return { testId: test.id, count: (data.data || []).length };
            } catch {
              return { testId: test.id, count: 0 };
            }
          })
        );
        const countMap = new Map(questionCounts.map(qc => [qc.testId, qc.count]));
        const testsWithCounts = testList.map((test: any) => ({
          ...test,
          questionCount: countMap.get(test.id) || 0
        }));
        setEventTests(testsWithCounts);
      } else {
        setEventTests([]);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    }
    setLoading(false);
  };

  const fetchTestQuestions = async (testId: string) => {
    try {
      const res = await authFetch(`/api/test-questions?test_id=${testId}`);
      const data = await res.json();
      const questions = data.data || [];
      setTestQuestions(questions);

      // Update question count on the test in the list
      setEventTests(prev => prev.map(t =>
        t.id === testId ? { ...t, questionCount: questions.length } : t
      ));
    } catch (err) {
      console.error("Error fetching test questions:", err);
    }
  };

  const openModal = (type: string, item?: any) => {
    setModalType(type);
    setEditItem(item);
    setFormData(item || getDefaultForm(type));
    setShowModal(true);
  };

  const getDefaultForm = (type: string) => {
    switch (type) {
      case 'participant': return { name: '', email: '', phone: '', company: '', status: 'registered' };
      case 'checklist': return { category: 'acara', task: '', status: 'pending', priority: 'normal' };
      case 'transaction': return { category: 'expense', type: '', amount: 0, status: 'pending' };
      case 'document': return { category: 'foto', name: '' };
      case 'attendance': return { participantId: '', sessionName: '', status: 'absent' };
      case 'question': return { questionText: '', questionType: 'text', options: '', isRequired: true, orderNum: 0 };
      case 'test': return { testType: 'pre_test', title: '', description: '', timeLimitMinutes: '' };
      case 'testQuestion': return { questionText: '', questionType: 'multiple_choice', options: '', orderNum: 0 };
      default: return {};
    }
  };

  const handleSubmit = async () => {
    const payload = { ...formData, eventId };
    let url = '';
    let method = '';

    switch (modalType) {
      case 'participant':
        url = editItem?.id ? `/api/participants/${editItem.id}` : '/api/participants';
        method = editItem?.id ? 'PUT' : 'POST';
        break;
      case 'checklist':
        url = editItem?.id ? `/api/checklists/${editItem.id}` : '/api/checklists';
        method = editItem?.id ? 'PUT' : 'POST';
        break;
      case 'transaction':
        url = editItem?.id ? `/api/transactions/${editItem.id}` : '/api/transactions';
        method = editItem?.id ? 'PUT' : 'POST';
        break;
      case 'document':
        url = editItem?.id ? `/api/documents/${editItem.id}` : '/api/documents';
        method = editItem?.id ? 'PUT' : 'POST';
        break;
      case 'attendance':
        url = editItem?.id ? `/api/attendance/${editItem.id}` : '/api/attendance';
        method = editItem?.id ? 'PUT' : 'POST';
        break;
      case 'question':
        url = editItem?.id ? `/api/feedback-questions/${editItem.id}` : '/api/feedback-questions';
        method = editItem?.id ? 'PUT' : 'POST';
        // Parse options for multiple choice
        if (formData.questionType === 'multiple_choice' && formData.options) {
          payload.options = formData.options.split(',').map((o: string) => o.trim()).filter(Boolean);
        }
        break;
      case 'test':
        url = editItem?.id ? `/api/event-tests/${editItem.id}` : '/api/event-tests';
        method = editItem?.id ? 'PUT' : 'POST';
        if (formData.timeLimitMinutes === '') payload.timeLimitMinutes = null;
        break;
      case 'testQuestion':
        url = editItem?.id ? `/api/test-questions/${editItem.id}` : '/api/test-questions';
        method = editItem?.id ? 'PUT' : 'POST';
        payload.testId = selectedTest?.id;
        if (formData.questionType !== 'multiple_choice') {
          payload.options = null;
        } else if (formData.options) {
          payload.options = formData.options.split(',').map((o: string) => o.trim()).filter(Boolean);
        }
        break;
    }

    if (url) {
      await authFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    }

    setShowModal(false);

    // Refresh test questions if we just saved a test question
    if (modalType === 'testQuestion' && selectedTest?.id) {
      await fetchTestQuestions(selectedTest.id);
    }

    fetchAllData();
  };

  const handleDelete = async (type: string, id: string) => {
    if (!confirm('Hapus ini?')) return;

    let url = '';
    switch (type) {
      case 'participant': url = `/api/participants/${id}`; break;
      case 'checklist': url = `/api/checklists/${id}`; break;
      case 'transaction': url = `/api/transactions/${id}`; break;
      case 'document': url = `/api/documents/${id}`; break;
      case 'attendance': url = `/api/attendance/${id}`; break;
      case 'question': url = `/api/feedback-questions/${id}`; break;
      case 'test': url = `/api/event-tests/${id}`; break;
      case 'testQuestion': url = `/api/test-questions/${id}`; break;
    }

    if (url) {
      await authFetch(url, { method: 'DELETE' });
    }

    // Refresh test questions if we just deleted a test question
    if (type === 'testQuestion' && selectedTest?.id) {
      await fetchTestQuestions(selectedTest.id);
    }

    fetchAllData();
  };

  // Handle image upload for transactions
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: 'receiptUrl' | 'itemPhotoUrl') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await authFetch('/api/upload/transaction-image', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.data?.url) {
        setFormData((prev: any) => ({ ...prev, [fieldName]: data.data.url }));
      } else {
        alert(data.error || 'Gagal mengunggah gambar');
      }
    } catch (err) {
      console.error('Upload error:', err);
      alert('Gagal mengunggah gambar');
    }
  };

  const generateFeedbackLink = () => {
    if (!eventId) return;
    const baseUrl = window.location.origin;
    const link = `${baseUrl}/feedback/${eventId}`;
    setFeedbackLink(link);
    navigator.clipboard.writeText(link);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const copyTestLink = (testId: string) => {
    const baseUrl = window.location.origin;
    const link = `${baseUrl}/tests/${testId}`;
    navigator.clipboard.writeText(link);
    setCopiedTestId(testId);
    setTimeout(() => setCopiedTestId(null), 2000);
  };

  // Attendance Sessions
  const fetchAttendanceSessions = async () => {
    try {
      const res = await authFetch(`/api/attendance-sessions?event_id=${eventId}`);
      const data = await res.json();
      setAttendanceSessions(data.data || []);

      // Fetch attendance counts for all sessions
      const sessions = data.data || [];
      const counts: Record<string, number> = {};
      for (const session of sessions) {
        try {
          const res = await authFetch(`/api/attendance?event_id=${eventId}&session_id=${session.id}`);
          const attData = await res.json();
          counts[session.id] = (attData.data || []).length;
        } catch {
          counts[session.id] = 0;
        }
      }
      setSessionAttendanceCounts(counts);
    } catch (err) {
      console.error("Error fetching attendance sessions:", err);
    }
  };

  const generateSessionQR = async (sessionId: string) => {
    try {
      const baseUrl = window.location.origin;
      const url = `${baseUrl}/presensi/${sessionId}`;
      const canvas = document.createElement('canvas');
      await QRCode.toCanvas(canvas, url, {
        width: 280,
        margin: 2,
        color: { dark: '#1f2937', light: '#ffffff' },
      });
      return canvas.toDataURL('image/png');
    } catch (err) {
      console.error("QR generation error:", err);
      return '';
    }
  };

  const openSessionModal = async (session: any | null) => {
    if (session) {
      setSelectedSession(session);
      const qr = await generateSessionQR(session.id);
      setQrDataUrl(qr);
      // Fetch attendance for this session
      try {
        const res = await authFetch(`/api/attendance?event_id=${eventId}&session_id=${session.id}`);
        const data = await res.json();
        setSessionAttendance(data.data || []);
      } catch (err) {
        console.error("Error fetching session attendance:", err);
        setSessionAttendance([]);
      }
    } else {
      setSelectedSession(null);
      setQrDataUrl('');
      setSessionAttendance([]);
    }
    setSessionModalOpen(true);
  };

  const closeSessionModal = () => {
    setSessionModalOpen(false);
    setSelectedSession(null);
    setQrDataUrl('');
    setIsFullscreen(false);
    setSessionFormData({ sessionName: '' });
    setSessionAttendance([]);
  };

  const copySessionLink = (sessionId: string) => {
    const baseUrl = window.location.origin;
    const link = `${baseUrl}/presensi/${sessionId}`;
    navigator.clipboard.writeText(link);
    setCopiedSessionId(sessionId);
    setTimeout(() => setCopiedSessionId(null), 2000);
  };

  const createSession = async () => {
    if (!sessionFormData.sessionName.trim()) return;
    try {
      const res = await authFetch('/api/attendance-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, sessionName: sessionFormData.sessionName }),
      });
      const data = await res.json();
      if (data.data) {
        await fetchAttendanceSessions();
        setAttendance(prev => [...prev]); // Refresh attendance list
        closeSessionModal();
      }
    } catch (err) {
      console.error("Error creating session:", err);
    }
  };

  const deleteSession = async (sessionId: string) => {
    if (!confirm('Hapus sesi presensi ini?')) return;
    try {
      await authFetch(`/api/attendance-sessions/${sessionId}`, { method: 'DELETE' });
      await fetchAttendanceSessions();
      if (selectedSession?.id === sessionId) {
        closeSessionModal();
      }
    } catch (err) {
      console.error("Error deleting session:", err);
    }
  };

  const downloadSessionQR = (sessionName: string) => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.download = `QR-Presensi-${sessionName || 'Event'}.png`;
    link.href = qrDataUrl;
    link.click();
  };

  useEffect(() => {
    if (eventId) {
      fetchAttendanceSessions();
    }
  }, [eventId]);

  const formatRupiah = (n: number) => {
    if (!n && n !== 0) return '-';
    return 'Rp ' + n.toLocaleString('id-ID');
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin/events" className="text-sm text-orange-600 hover:underline">← Kelola Event</Link>
          <h1 className="text-2xl font-bold text-gray-900">{event?.name || 'Event'}</h1>
          <p className="text-gray-500">{event?.location} • {event?.date}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/admin/kelola/${event?.id}/laporan`}
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Laporan
          </Link>
          <button
            onClick={generateFeedbackLink}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.5 9 10.5c0-2 1.5-3.5 3.5-3.5h3.5M17 15l2 2 3-3m-6-3l3.5 3.5m-1.5-1.5h0M3 19l2-2-2-2M12 5.5a4.5 4.5 0 100-9 4.5 4.5 0 010 9m-9-4.5a4.5 4.5 0 110 9 4.5 4.5 0 010-9m9-4.5h0m-3 4.5l-2 2" />
            </svg>
            {linkCopied ? 'Tersalin!' : 'Bagikan Link Feedback'}
          </button>
          <button onClick={() => openModal('checklist')} className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600">
            + Checklist
          </button>
          {canManageFinance && (
            <button onClick={() => openModal('transaction')} className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600">
              + Transaksi
            </button>
          )}
          <button onClick={() => openModal('document')} className="px-4 py-2 bg-purple-500 text-white rounded-lg text-sm font-medium hover:bg-purple-600">
            + Dokumen
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-4">
          {['peserta', 'checklist', 'transaksi', 'dokumen', 'pertanyaan', 'test', 'presensi'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors capitalize ${activeTab === tab ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              {tab === 'test' ? 'Pre/Post Test' : tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content based on tab */}
      {activeTab === 'peserta' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-4 flex justify-between items-center border-b border-gray-200">
            <span className="text-sm font-medium text-gray-700">{participants.length} Peserta</span>
            {canManageParticipants && (
              <button onClick={() => openModal('participant')} className="px-3 py-1.5 bg-orange-500 text-white rounded-lg text-sm hover:bg-orange-600">
                + Tambah
              </button>
            )}
          </div>
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                {canManageParticipants && (
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {participants.map(p => (
                <tr key={p.id}>
                  <td className="px-4 py-3 text-sm text-gray-900">{p.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{p.email}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${p.status === 'attended' ? 'bg-green-100 text-green-700' : p.status === 'confirmed' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                      {p.status}
                    </span>
                  </td>
                  {canManageParticipants && (
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => openModal('participant', p)} className="text-blue-500 hover:underline text-sm">Edit</button>
                      <button onClick={() => handleDelete('participant', p.id)} className="text-red-500 hover:underline text-sm ml-3">Hapus</button>
                    </td>
                  )}
                </tr>
              ))}
              {participants.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-500">Belum ada peserta</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'checklist' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-4 flex justify-between items-center border-b border-gray-200">
            <span className="text-sm font-medium text-gray-700">{checklists.length} Checklist</span>
            {canManageChecklist && (
              <button onClick={() => openModal('checklist')} className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600">
                + Tambah
              </button>
            )}
          </div>
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Task</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kategori</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                {canManageChecklist && (
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {checklists.map(c => (
                <tr key={c.id}>
                  <td className="px-4 py-3 text-sm text-gray-900">{c.task}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{c.category}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${c.status === 'completed' ? 'bg-green-100 text-green-700' : c.status === 'in_progress' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                      {c.status}
                    </span>
                  </td>
                  {canManageChecklist && (
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => openModal('checklist', c)} className="text-blue-500 hover:underline text-sm">Edit</button>
                      <button onClick={() => handleDelete('checklist', c.id)} className="text-red-500 hover:underline text-sm ml-3">Hapus</button>
                    </td>
                  )}
                </tr>
              ))}
              {checklists.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-500">Belum ada checklist</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'transaksi' && (
        <div className="space-y-4">
          {/* Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-xs text-gray-500 uppercase">Total Income</p>
              <p className="text-lg font-bold text-green-600">
                {formatRupiah(transactions.filter(t => t.category === 'income').reduce((sum, t) => sum + (Number(t.amount) || 0), 0))}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-xs text-gray-500 uppercase">Total Expense</p>
              <p className="text-lg font-bold text-red-600">
                {formatRupiah(transactions.filter(t => t.category === 'expense').reduce((sum, t) => sum + (Number(t.amount) || 0), 0))}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-xs text-gray-500 uppercase">Balance</p>
              <p className="text-lg font-bold text-blue-600">
                {formatRupiah(
                  transactions.filter(t => t.category === 'income').reduce((sum, t) => sum + (Number(t.amount) || 0), 0) -
                  transactions.filter(t => t.category === 'expense').reduce((sum, t) => sum + (Number(t.amount) || 0), 0)
                )}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-center">
              {canManageFinance && (
                <button onClick={() => openModal('transaction')} className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600">
                  + Tambah Transaksi
                </button>
              )}
            </div>
          </div>

          {/* Transaction Cards */}
          <div className="space-y-3">
            {transactions.map(t => (
              <div key={t.id} className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-start gap-4">
                  {/* Photos */}
                  <div className="flex gap-2 flex-shrink-0">
                    {t.receiptUrl && (
                      <img
                        src={t.receiptUrl}
                        alt="Kwitansi"
                        className="w-16 h-16 object-cover rounded-lg border cursor-pointer hover:opacity-80"
                        onClick={() => window.open(t.receiptUrl, '_blank')}
                      />
                    )}
                    {t.itemPhotoUrl && (
                      <img
                        src={t.itemPhotoUrl}
                        alt="Barang"
                        className="w-16 h-16 object-cover rounded-lg border cursor-pointer hover:opacity-80"
                        onClick={() => window.open(t.itemPhotoUrl, '_blank')}
                      />
                    )}
                    {!t.receiptUrl && !t.itemPhotoUrl && (
                      <div className="w-16 h-16 bg-gray-100 rounded-lg border flex items-center justify-center">
                        <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-gray-900 truncate">{t.description || t.type}</p>
                        <p className="text-xs text-gray-500 mt-1">{t.type}</p>
                        {t.purchaseLink && (
                          <a
                            href={t.purchaseLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-500 hover:underline mt-1 block truncate max-w-xs"
                          >
                            {t.purchaseLink}
                          </a>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className={`font-bold ${t.category === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                          {t.category === 'income' ? '+' : '-'} {formatRupiah(Number(t.amount) || 0)}
                        </p>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          t.status === 'paid' ? 'bg-green-100 text-green-700' :
                          t.status === 'approved' ? 'bg-blue-100 text-blue-700' :
                          t.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-500'
                        }`}>
                          {t.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  {canManageFinance && (
                    <div className="flex gap-1 flex-shrink-0">
                      <button onClick={() => openModal('transaction', t)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button onClick={() => handleDelete('transaction', t.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {transactions.length === 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                <p className="text-gray-500">Belum ada transaksi</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'dokumen' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-4 flex justify-between items-center border-b border-gray-200">
            <span className="text-sm font-medium text-gray-700">{documents.length} Dokumen</span>
            {canManageChecklist && (
              <button onClick={() => openModal('document')} className="px-3 py-1.5 bg-purple-500 text-white rounded-lg text-sm hover:bg-purple-600">
                + Tambah
              </button>
            )}
          </div>
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kategori</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Link</th>
                {canManageChecklist && (
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {documents.map(d => (
                <tr key={d.id}>
                  <td className="px-4 py-3 text-sm text-gray-900">{d.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    <span className="px-2 py-1 bg-gray-100 rounded text-xs">{d.category}</span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {d.fileUrl ? (
                      <a
                        href={d.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-orange-500 hover:underline flex items-center gap-1"
                      >
                        Buka Link
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    ) : (
                      <span className="text-gray-400 text-xs">-</span>
                    )}
                  </td>
                  {canManageChecklist && (
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => openModal('document', d)} className="text-blue-500 hover:underline text-sm">Edit</button>
                      <button onClick={() => handleDelete('document', d.id)} className="text-red-500 hover:underline text-sm ml-3">Hapus</button>
                    </td>
                  )}
                </tr>
              ))}
              {documents.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-500">Belum ada dokumen</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab Pertanyaan Feedback */}
      {activeTab === 'pertanyaan' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-4 flex justify-between items-center border-b border-gray-200">
            <div>
              <span className="text-sm font-medium text-gray-700">{feedbackQuestions.length} Pertanyaan</span>
              <p className="text-xs text-gray-500 mt-1">Kelola pertanyaan feedback kustom untuk event ini</p>
            </div>
            {canManageChecklist && (
              <button onClick={() => openModal('question')} className="px-3 py-1.5 bg-orange-500 text-white rounded-lg text-sm hover:bg-orange-600">
                + Tambah Pertanyaan
              </button>
            )}
          </div>
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pertanyaan</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipe</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Wajib</th>
                {canManageChecklist && (
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {feedbackQuestions.map((q, idx) => (
                <tr key={q.id}>
                  <td className="px-4 py-3 text-sm text-gray-500">{idx + 1}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{q.questionText}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      q.questionType === 'rating' ? 'bg-yellow-100 text-yellow-700' :
                      q.questionType === 'multiple_choice' ? 'bg-purple-100 text-purple-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {q.questionType === 'rating' ? 'Rating Bintang' :
                       q.questionType === 'multiple_choice' ? 'Pilihan Ganda' : 'Teks'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {q.isRequired ? (
                      <span className="text-red-500">Ya</span>
                    ) : (
                      <span className="text-gray-400">Tidak</span>
                    )}
                  </td>
                  {canManageChecklist && (
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => openModal('question', q)} className="text-blue-500 hover:underline text-sm">Edit</button>
                      <button onClick={() => handleDelete('question', q.id)} className="text-red-500 hover:underline text-sm ml-3">Hapus</button>
                    </td>
                  )}
                </tr>
              ))}
              {feedbackQuestions.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center">
                    <div className="text-gray-500 mb-2">Belum ada pertanyaan kustom</div>
                    <p className="text-xs text-gray-400">Tambahkan pertanyaan untuk feedback peserta</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab Pre/Post Test */}
      {activeTab === 'test' && (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Pre-Test & Post-Test</h2>
              <p className="text-sm text-gray-500">1 Link = Banyak Pertanyaan (Seperti Google Form)</p>
            </div>
            {canManageChecklist && (
              <button onClick={() => { setSelectedTest(null); setTestQuestions([]); openModal('test'); }} className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600">
                + Buat Test Baru
              </button>
            )}
          </div>

          {/* Test Cards */}
          <div className="space-y-4">
            {eventTests.map(t => {
              const isCopied = copiedTestId === t.id;
              const isSelected = selectedTest?.id === t.id;
              return (
                <div key={t.id} className={`bg-white rounded-xl border-2 overflow-hidden ${isSelected ? 'border-orange-400' : 'border-gray-200'}`}>
                  {/* Test Header */}
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${t.testType === 'pre_test' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                        {t.testType === 'pre_test' ? 'P' : 'P'}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{t.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${t.testType === 'pre_test' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                            {t.testType === 'pre_test' ? 'Pre-Test' : 'Post-Test'}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${t.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                            {t.isActive ? 'Aktif' : 'Nonaktif'}
                          </span>
                          {t.questionCount !== undefined && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                              {t.questionCount} pertanyaan
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {canManageChecklist && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => copyTestLink(t.id)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            isCopied
                              ? 'bg-green-500 text-white'
                              : 'bg-orange-500 text-white hover:bg-orange-600'
                          }`}
                        >
                          {isCopied ? '✓ Link Tersalin' : 'Salin Link'}
                        </button>
                        <button
                          onClick={() => {
                            if (isSelected) {
                              setSelectedTest(null);
                              setTestQuestions([]);
                            } else {
                              setSelectedTest(t);
                              fetchTestQuestions(t.id);
                            }
                          }}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            isSelected
                              ? 'bg-green-500 text-white'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                        >
                          {isSelected ? 'Tutup' : 'Kelola Pertanyaan'}
                        </button>
                        <button onClick={() => openModal('test', t)} className="p-2 text-gray-400 hover:text-blue-500">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button onClick={() => handleDelete('test', t.id)} className="p-2 text-gray-400 hover:text-red-500">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Questions Panel */}
                  {isSelected && (
                    <div className="border-t border-gray-100 bg-gray-50">
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-sm font-medium text-gray-700">
                            {testQuestions.length} Pertanyaan
                          </span>
                          {canManageChecklist && (
                            <button onClick={() => openModal('testQuestion')} className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-xs font-medium hover:bg-blue-600">
                              + Tambah Pertanyaan
                            </button>
                          )}
                        </div>

                        {testQuestions.length > 0 ? (
                          <div className="space-y-2">
                            {testQuestions.map((q, idx) => (
                              <div key={q.id} className="bg-white rounded-lg border border-gray-200 p-3 flex items-start gap-3">
                                <span className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium text-gray-600 flex-shrink-0">
                                  {idx + 1}
                                </span>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm text-gray-900 truncate">{q.questionText}</p>
                                  <span className="text-xs text-gray-500 mt-1 block">
                                    {q.questionType === 'multiple_choice' ? 'Pilihan Ganda' : q.questionType === 'true_false' ? 'Benar/Salah' : 'Essay'}
                                  </span>
                                </div>
                                {canManageChecklist && (
                                  <div className="flex gap-1">
                                    <button onClick={() => openModal('testQuestion', q)} className="p-1 text-gray-400 hover:text-blue-500">
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                      </svg>
                                    </button>
                                    <button onClick={() => handleDelete('testQuestion', q.id)} className="p-1 text-gray-400 hover:text-red-500">
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                      </svg>
                                    </button>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <p className="mb-2">Belum ada pertanyaan</p>
                            <button onClick={() => openModal('testQuestion')} className="text-blue-500 hover:underline text-sm">
                              + Tambahkan pertanyaan pertama
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {eventTests.length === 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Belum Ada Test</h3>
                <p className="text-gray-500 mb-4">Buat test seperti Google Form - 1 link untuk banyak pertanyaan</p>
                {canManageChecklist && (
                  <button onClick={() => openModal('test')} className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600">
                    + Buat Test Baru
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab Presensi */}
      {activeTab === 'presensi' && (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Presensi Peserta</h2>
              <p className="text-sm text-gray-500">Scan QR Code untuk mencatat kehadiran</p>
            </div>
            {canManageChecklist && (
              <button onClick={() => { setSelectedSession(null); setQrDataUrl(''); setSessionModalOpen(true); setSessionFormData({ sessionName: '' }); }}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600">
                + Buat Sesi Presensi
              </button>
            )}
          </div>

          {/* Sessions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {attendanceSessions.map(session => (
              <div key={session.id} className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${session.isActive ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{session.sessionName}</h3>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${session.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                            {session.isActive ? 'Aktif' : 'Ditutup'}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                            {sessionAttendanceCounts[session.id] || 0} hadir
                          </span>
                        </div>
                      </div>
                    </div>
                    {canManageChecklist && (
                      <button onClick={() => deleteSession(session.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">Code: <span className="font-mono font-bold">{session.sessionCode}</span></p>
                </div>
                <div className="bg-gray-50 px-4 py-3 border-t border-gray-100">
                  <Link
                    href={`/admin/kelola/${eventId}/presensi/${session.id}`}
                    className="block w-full px-3 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                    Lihat Detail & QR
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {attendanceSessions.length === 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Belum Ada Sesi Presensi</h3>
              <p className="text-gray-500 mb-4">Buat sesi presensi dan bagikan QR Code ke peserta</p>
              {canManageChecklist && (
                <button onClick={() => { setSelectedSession(null); setQrDataUrl(''); setSessionModalOpen(true); setSessionFormData({ sessionName: '' }); }}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600">
                  + Buat Sesi Presensi
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Session QR Modal */}
      {sessionModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={(e) => e.target === e.currentTarget && closeSessionModal()}>
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-bold text-gray-900">
                {!selectedSession ? 'Buat Sesi Presensi' : 'QR Code Presensi'}
              </h3>
              <button onClick={closeSessionModal} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>

            {/* Create Session Form */}
            {!selectedSession ? (
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Sesi</label>
                  <input
                    type="text"
                    value={sessionFormData.sessionName}
                    onChange={e => setSessionFormData({ sessionName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                    placeholder="Contoh: Presensi Masuk, Istirahat, Pulang"
                  />
                </div>
                <button
                  onClick={createSession}
                  disabled={!sessionFormData.sessionName.trim()}
                  className="w-full px-4 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 disabled:opacity-50"
                >
                  Buat Sesi
                </button>
              </div>
            ) : (
              <>
                {/* Session Info */}
                <div className="p-6 text-center">
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 ${selectedSession.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    <span className={`w-2 h-2 rounded-full ${selectedSession.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                    {selectedSession.isActive ? 'Sesi Aktif' : 'Sesi Ditutup'}
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedSession.sessionName}</h2>
                  <p className="text-sm text-gray-500 mt-1">Code: <span className="font-mono font-bold">{selectedSession.sessionCode}</span></p>
                </div>

                {/* QR Code */}
                <div className="bg-gray-50 px-6 py-4">
                  <div className="flex justify-center mb-4">
                    <div
                      className={`bg-white p-4 rounded-2xl border-2 border-gray-200 cursor-pointer transition-transform hover:scale-105`}
                      onClick={() => setIsFullscreen(true)}
                    >
                      {qrDataUrl ? (
                        <img src={qrDataUrl} alt="QR Code" className="w-56 h-56" />
                      ) : (
                        <div className="w-56 h-56 flex items-center justify-center">
                          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => downloadSessionQR(selectedSession.sessionName)}
                      disabled={!qrDataUrl}
                      className="flex-1 px-4 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download QR
                    </button>
                    <button
                      onClick={() => copySessionLink(selectedSession.id)}
                      className={`flex-1 px-4 py-3 rounded-xl font-medium flex items-center justify-center gap-2 ${
                        copiedSessionId === selectedSession.id
                          ? 'bg-green-500 text-white'
                          : 'bg-blue-500 text-white hover:bg-blue-600'
                      }`}
                    >
                      {copiedSessionId === selectedSession.id ? (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Tersalin!
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                          </svg>
                          Salin Link
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => setIsFullscreen(true)}
                      className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 flex items-center justify-center"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                      </svg>
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 text-center mt-3">Tap QR untuk tampilkan fullscreen</p>
                </div>

                {/* Attendance List */}
                <div className="border-t border-gray-200 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-gray-900">Daftar Hadir</h4>
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                      {sessionAttendance.length} peserta
                    </span>
                  </div>

                  {sessionAttendance.length > 0 ? (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {sessionAttendance.map((att, idx) => (
                        <div key={att.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                              <span className="text-green-600 font-bold text-sm">{idx + 1}</span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {att.participantName || att.participant_id || 'Peserta'}
                              </p>
                              <p className="text-xs text-gray-500">
                                {att.createdAt ? new Date(att.createdAt).toLocaleString('id-ID', {
                                  day: '2-digit',
                                  month: 'short',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                }) : '-'}
                              </p>
                            </div>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            att.status === 'present' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                          }`}>
                            Hadir
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-500">
                      <p className="text-sm">Belum ada yang presensi</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Fullscreen QR Overlay */}
          {isFullscreen && selectedSession && (
            <div
              className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-8"
              onClick={() => setIsFullscreen(false)}
            >
              <div className="text-center">
                <img
                  src={qrDataUrl}
                  alt="QR Code Fullscreen"
                  className="w-[85vw] max-w-lg mx-auto rounded-2xl"
                />
                <p className="text-white text-xl mt-6 font-bold">{selectedSession.sessionName}</p>
                <p className="text-gray-400 text-sm mt-2">Tap untuk menutup</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-bold text-gray-900">
                {editItem ? 'Edit' : 'Tambah'} {modalType.charAt(0).toUpperCase() + modalType.slice(1)}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="p-6 space-y-4">
              {modalType === 'participant' && (
                <>
                  <input placeholder="Nama" value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-lg" />
                  <input placeholder="Email" value={formData.email || ''} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-lg" />
                  <input placeholder="Telepon" value={formData.phone || ''} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-lg" />
                  <input placeholder="Perusahaan" value={formData.company || ''} onChange={e => setFormData({ ...formData, company: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-lg" />
                  <select value={formData.status || 'registered'} onChange={e => setFormData({ ...formData, status: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-lg">
                    <option value="registered">Registered</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="attended">Attended</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </>
              )}
              {modalType === 'checklist' && (
                <>
                  <select value={formData.category || 'acara'} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-lg">
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <input placeholder="Task" value={formData.task || ''} onChange={e => setFormData({ ...formData, task: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-lg" />
                  <input placeholder="PIC" value={formData.pic || ''} onChange={e => setFormData({ ...formData, pic: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-lg" />
                  <select value={formData.status || 'pending'} onChange={e => setFormData({ ...formData, status: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-lg">
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <select value={formData.priority || 'normal'} onChange={e => setFormData({ ...formData, priority: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-lg">
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </>
              )}
              {modalType === 'transaction' && (
                <>
                  <select value={formData.category || 'expense'} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-lg">
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                  </select>
                  <input placeholder="Tipe/Jenis" value={formData.type || ''} onChange={e => setFormData({ ...formData, type: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-lg" />
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="Jumlah (contoh: 100000)"
                    value={formData.amount || ''}
                    onChange={e => {
                      // Remove leading zeros, allow only numbers
                      let value = e.target.value.replace(/[^0-9]/g, '');
                      if (value.length > 1) {
                        value = value.replace(/^0+/, '');
                      }
                      setFormData({ ...formData, amount: value ? parseInt(value) : 0 });
                    }}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                  />
                  <input placeholder="Deskripsi" value={formData.description || ''} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-lg" />

                  {/* Foto Kwitansi */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Foto Kwitansi</label>
                    {formData.receiptUrl ? (
                      <div className="relative">
                        <img src={formData.receiptUrl} alt="Kwitansi" className="w-full h-32 object-cover rounded-lg border" />
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, receiptUrl: '' })}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                        <div className="flex flex-col items-center justify-center pt-2 pb-3">
                          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <p className="text-xs text-gray-500 mt-1">Upload kwitansi</p>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={e => handleImageUpload(e, 'receiptUrl')}
                        />
                      </label>
                    )}
                  </div>

                  {/* Foto Barang */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Foto Barang</label>
                    {formData.itemPhotoUrl ? (
                      <div className="relative">
                        <img src={formData.itemPhotoUrl} alt="Barang" className="w-full h-32 object-cover rounded-lg border" />
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, itemPhotoUrl: '' })}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                        <div className="flex flex-col items-center justify-center pt-2 pb-3">
                          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <p className="text-xs text-gray-500 mt-1">Upload foto barang</p>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={e => handleImageUpload(e, 'itemPhotoUrl')}
                        />
                      </label>
                    )}
                  </div>

                  {/* Link Pembelian */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Link Pembelian (opsional)</label>
                    <input
                      type="url"
                      placeholder="https://shopee.co.id/..."
                      value={formData.purchaseLink || ''}
                      onChange={e => setFormData({ ...formData, purchaseLink: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                    />
                  </div>

                  <select value={formData.status || 'pending'} onChange={e => setFormData({ ...formData, status: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-lg">
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="paid">Paid</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </>
              )}
              {modalType === 'document' && (
                <>
                  <select value={formData.category || 'foto'} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-lg">
                    {docCategories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <input placeholder="Nama Dokumen" value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-lg" />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Link Google Drive</label>
                    <input
                      type="url"
                      placeholder="https://drive.google.com/..."
                      value={formData.fileUrl || ''}
                      onChange={e => setFormData({ ...formData, fileUrl: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                    />
                    <p className="text-xs text-gray-500 mt-1">Tempelkan link Google Drive dokumen</p>
                  </div>
                </>
              )}
              {modalType === 'question' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pertanyaan</label>
                    <textarea
                      value={formData.questionText || ''}
                      onChange={e => setFormData({ ...formData, questionText: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                      placeholder="Contoh: Bagaimana pendapat Anda tentang durasi event?"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipe Jawaban</label>
                    <select
                      value={formData.questionType || 'text'}
                      onChange={e => setFormData({ ...formData, questionType: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                    >
                      <option value="text">Teks (Jawaban tulisan bebas)</option>
                      <option value="rating">Rating Bintang (1-5)</option>
                      <option value="multiple_choice">Pilihan Ganda</option>
                    </select>
                  </div>
                  {formData.questionType === 'multiple_choice' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Opsi Jawaban</label>
                      <input
                        value={formData.options || ''}
                        onChange={e => setFormData({ ...formData, options: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                        placeholder="Pisahkan dengan koma, contoh: Sangat Baik, Baik, Cukup, Kurang"
                      />
                      <p className="text-xs text-gray-500 mt-1">Pisahkan setiap opsi dengan koma</p>
                    </div>
                  )}
                  <div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isRequired !== false}
                        onChange={e => setFormData({ ...formData, isRequired: e.target.checked })}
                        className="w-4 h-4 text-orange-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700">Wajib diisi</span>
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Urutan</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.orderNum || 0}
                      onChange={e => setFormData({ ...formData, orderNum: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                      placeholder="0"
                    />
                    <p className="text-xs text-gray-500 mt-1">Urutan pertanyaan (0 = pertama)</p>
                  </div>
                </>
              )}
              {modalType === 'test' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama Test</label>
                    <input
                      value={formData.title || ''}
                      onChange={e => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                      placeholder="Contoh: Pre-Test Pengetahuan Dasar"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipe Test</label>
                    <select
                      value={formData.testType || 'pre_test'}
                      onChange={e => setFormData({ ...formData, testType: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                    >
                      <option value="pre_test">Pre-Test</option>
                      <option value="post_test">Post-Test</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi (opsional)</label>
                    <textarea
                      value={formData.description || ''}
                      onChange={e => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                      placeholder="Deskripsi atau instruksi test..."
                      rows={2}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Waktu (menit, opsional)</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.timeLimitMinutes || ''}
                      onChange={e => setFormData({ ...formData, timeLimitMinutes: e.target.value ? parseInt(e.target.value) : '' })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                      placeholder="Tidak terbatas"
                    />
                  </div>
                  {editItem && (
                    <div>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.isActive !== false}
                          onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                          className="w-4 h-4 text-orange-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700">Test aktif</span>
                      </label>
                    </div>
                  )}
                </>
              )}
              {modalType === 'testQuestion' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pertanyaan</label>
                    <textarea
                      value={formData.questionText || ''}
                      onChange={e => setFormData({ ...formData, questionText: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                      placeholder="Ketik pertanyaan..."
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipe Jawaban</label>
                    <select
                      value={formData.questionType || 'multiple_choice'}
                      onChange={e => setFormData({ ...formData, questionType: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                    >
                      <option value="multiple_choice">Pilihan Ganda</option>
                      <option value="true_false">Benar / Salah</option>
                      <option value="essay">Essay</option>
                    </select>
                  </div>
                  {formData.questionType === 'multiple_choice' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Opsi Jawaban</label>
                      <input
                        value={formData.options || ''}
                        onChange={e => setFormData({ ...formData, options: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                        placeholder="Pisahkan dengan koma, contoh: A, B, C, D"
                      />
                      <p className="text-xs text-gray-500 mt-1">Pisahkan setiap opsi dengan koma</p>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Urutan</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.orderNum || 0}
                      onChange={e => setFormData({ ...formData, orderNum: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                    />
                  </div>
                </>
              )}
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Batal</button>
              <button onClick={handleSubmit} className="px-4 py-2 text-white bg-orange-500 rounded-lg hover:bg-orange-600">Simpan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
