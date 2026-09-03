import jsPDF from 'jspdf';

interface ReportData {
  event: any;
  participants: any[];
  checklists: any[];
  transactions: any[];
  feedback: any[];
  stats: any;
}

function formatCurrency(num: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(num);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export async function generateEventReportPDF(report: ReportData): Promise<void> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPos = 20;

  const { event, participants, checklists, transactions, feedback, stats } = report;

  // Helper function to add new page if needed
  const checkNewPage = (needed: number) => {
    if (yPos + needed > pageHeight - 20) {
      doc.addPage();
      yPos = 20;
      return true;
    }
    return false;
  };

  // Header
  doc.setFillColor(249, 115, 22); // orange-500
  doc.rect(0, 0, pageWidth, 35, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('LAPORAN EVENT', pageWidth / 2, 15, { align: 'center' });

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Sanrays Event Management', pageWidth / 2, 25, { align: 'center' });

  yPos = 45;
  doc.setTextColor(0, 0, 0);

  // Event Info Section
  doc.setFillColor(245, 245, 245);
  doc.rect(10, yPos, pageWidth - 20, 35, 'F');

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(event.name, 15, yPos + 8);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Tema: ${event.theme || '-'}`, 15, yPos + 16);
  doc.text(`Lokasi: ${event.location || '-'}`, 15, yPos + 22);
  doc.text(`Tanggal: ${formatDate(event.date)} ${event.endDate ? `- ${formatDate(event.endDate)}` : ''}`, 15, yPos + 28);
  doc.text(`Organizer: ${event.organizer || '-'}`, pageWidth / 2, yPos + 16);
  doc.text(`Status: ${event.status.toUpperCase()}`, pageWidth / 2, yPos + 22);

  yPos += 45;

  // Statistics Section
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('STATISTIK RINGKASAN', 15, yPos);
  yPos += 8;

  doc.setFillColor(249, 115, 22);
  doc.rect(10, yPos, pageWidth - 20, 25, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.text(`Total Peserta`, 25, yPos + 8);
  doc.text(`Checklist Progress`, 70, yPos + 8);
  doc.text(`Budget Balance`, 115, yPos + 8);
  doc.text(`Rating`, 160, yPos + 8);
  yPos += 5;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`${stats.totalParticipants} orang`, 25, yPos + 8);
  doc.text(`${stats.checklistProgress}%`, 70, yPos + 8);
  doc.text(formatCurrency(stats.balance), 115, yPos + 8);
  doc.text(`${stats.avgRatingOverall}/5`, 160, yPos + 8);

  yPos += 28;
  doc.setTextColor(0, 0, 0);

  // Participants Section
  checkNewPage(30);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('DAFTAR PESERTA', 15, yPos);
  yPos += 8;

  // Participant table header
  doc.setFillColor(245, 245, 245);
  doc.rect(10, yPos, pageWidth - 20, 8, 'F');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('No', 15, yPos + 5);
  doc.text('Nama', 30, yPos + 5);
  doc.text('Email', 80, yPos + 5);
  doc.text('Perusahaan', 130, yPos + 5);
  doc.text('Status', 175, yPos + 5);

  yPos += 8;
  doc.setFont('helvetica', 'normal');

  participants.slice(0, 30).forEach((p, i) => {
    checkNewPage(7);
    doc.setFontSize(8);
    doc.text(`${i + 1}`, 15, yPos + 5);
    doc.text(p.name.substring(0, 25), 30, yPos + 5);
    doc.text(p.email.substring(0, 25), 80, yPos + 5);
    doc.text((p.company || '-').substring(0, 20), 130, yPos + 5);
    doc.text(p.status, 175, yPos + 5);
    yPos += 6;
  });

  if (participants.length > 30) {
    doc.setFontSize(8);
    doc.text(`... dan ${participants.length - 30} peserta lainnya`, 15, yPos + 5);
    yPos += 8;
  }

  // Financial Section
  checkNewPage(50);
  yPos += 5;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('LAPORAN KEUANGAN', 15, yPos);
  yPos += 8;

  // Financial summary
  doc.setFontSize(9);
  doc.setFillColor(220, 252, 231); // green-100
  doc.rect(10, yPos, 60, 12, 'F');
  doc.setTextColor(22, 163, 74);
  doc.text('Total Income', 15, yPos + 5);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(formatCurrency(stats.totalIncome), 15, yPos + 10);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setFillColor(254, 226, 226); // red-100
  doc.rect(75, yPos, 60, 12, 'F');
  doc.setTextColor(220, 38, 38);
  doc.text('Total Expense', 80, yPos + 5);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(formatCurrency(stats.totalExpense), 80, yPos + 10);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  const balanceColor = stats.balance >= 0 ? [22, 163, 74] : [220, 38, 38];
  doc.setFillColor(stats.balance >= 0 ? 220 : 254, stats.balance >= 0 ? 252 : 226, stats.balance >= 0 ? 231 : 226);
  doc.rect(140, yPos, 60, 12, 'F');
  doc.setTextColor(balanceColor[0], balanceColor[1], balanceColor[2]);
  doc.text('Balance', 145, yPos + 5);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(formatCurrency(stats.balance), 145, yPos + 10);

  yPos += 18;
  doc.setTextColor(0, 0, 0);

  // Transaction table header
  checkNewPage(20);
  doc.setFillColor(245, 245, 245);
  doc.rect(10, yPos, pageWidth - 20, 8, 'F');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('Tanggal', 15, yPos + 5);
  doc.text('Tipe', 45, yPos + 5);
  doc.text('Deskripsi', 70, yPos + 5);
  doc.text('Jumlah', 140, yPos + 5);
  doc.text('Status', 175, yPos + 5);

  yPos += 8;
  doc.setFont('helvetica', 'normal');

  transactions.slice(0, 20).forEach((t) => {
    checkNewPage(7);
    doc.setFontSize(8);
    doc.text(formatDate(t.transactionDate), 15, yPos + 5);
    doc.setTextColor(t.category === 'income' ? 22 : 220, t.category === 'income' ? 163 : 38, t.category === 'income' ? 74 : 38);
    doc.text(t.category.toUpperCase(), 45, yPos + 5);
    doc.setTextColor(0, 0, 0);
    doc.text((t.description || t.type || '-').substring(0, 35), 70, yPos + 5);
    doc.setTextColor(t.category === 'income' ? 22 : 220, t.category === 'income' ? 163 : 38, t.category === 'income' ? 74 : 38);
    doc.text(formatCurrency(parseFloat(t.amount)), 140, yPos + 5);
    doc.setTextColor(0, 0, 0);
    doc.text(t.status, 175, yPos + 5);
    yPos += 6;
  });

  if (transactions.length > 20) {
    doc.setFontSize(8);
    doc.text(`... dan ${transactions.length - 20} transaksi lainnya`, 15, yPos + 5);
    yPos += 8;
  }

  // Checklist Section
  checkNewPage(40);
  yPos += 5;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('PROGRESS CHECKLIST', 15, yPos);
  yPos += 8;

  // Checklist summary
  doc.setFontSize(9);
  doc.text(`Total: ${stats.totalChecklists}`, 15, yPos + 5);
  doc.text(`Selesai: ${stats.completedChecklists}`, 50, yPos + 5);
  doc.text(`In Progress: ${stats.inProgressChecklists || 0}`, 95, yPos + 5);
  doc.text(`Pending: ${stats.pendingChecklists || 0}`, 145, yPos + 5);

  yPos += 12;

  // Checklist items
  checklists.slice(0, 15).forEach((c) => {
    checkNewPage(7);
    doc.setFontSize(8);
    const statusSymbol = c.status === 'completed' ? '[x]' : c.status === 'in_progress' ? '[~]' : '[ ]';
    doc.text(statusSymbol, 15, yPos + 5);
    doc.text((c.task || '-').substring(0, 60), 25, yPos + 5);
    doc.text(c.pic || '-', 130, yPos + 5);
    doc.text(c.status.replace('_', ' '), 170, yPos + 5);
    yPos += 6;
  });

  if (checklists.length > 15) {
    doc.setFontSize(8);
    doc.text(`... dan ${checklists.length - 15} checklist lainnya`, 15, yPos + 5);
    yPos += 8;
  }

  // Feedback Section
  if (feedback.length > 0) {
    checkNewPage(40);
    yPos += 5;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('FEEDBACK & EVALUASI', 15, yPos);
    yPos += 8;

    // Rating summary
    doc.setFillColor(254, 243, 199); // amber-100
    doc.rect(10, yPos, pageWidth - 20, 15, 'F');
    doc.setFontSize(9);
    doc.text(`Total Feedback: ${stats.totalFeedback}`, 15, yPos + 7);
    doc.text(`Rating Overall: ${stats.avgRatingOverall}/5`, 60, yPos + 7);
    doc.text(`Konten: ${stats.avgRatingContent}/5`, 105, yPos + 7);
    doc.text(`Fasilitas: ${stats.avgRatingFacility}/5`, 145, yPos + 7);

    yPos += 18;

    // Feedback comments
    feedback.slice(0, 5).forEach((f) => {
      checkNewPage(15);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text(`${f.participantName} (${f.ratingOverall}/5)`, 15, yPos + 5);
      doc.setFont('helvetica', 'italic');
      doc.setFont('helvetica', 'normal');
      if (f.comments) {
        const lines = doc.splitTextToSize(`"${f.comments}"`, pageWidth - 40);
        doc.text(lines, 15, yPos + 10);
        yPos += 10 + (lines.length * 4);
      } else {
        yPos += 8;
      }
    });
  }

  // Footer
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Generated on ${new Date().toLocaleDateString('id-ID')} - Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }

  // Save the PDF
  const fileName = `Laporan_${event.name.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}
