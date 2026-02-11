import { useState } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

function ReportGenerator({ group, pledges, members, contributions }) {
  const [generating, setGenerating] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [reportType, setReportType] = useState('summary');

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatAmount = (amount) => {
    return parseFloat(amount || 0).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const getCurrencySymbol = () => {
    const symbols = { USD: '$', EUR: '€', GBP: '£', UGX: 'UGX ', KES: 'KES ' };
    return symbols[group?.currency] || (group?.currency || 'USD') + ' ';
  };

  const generatePDF = async () => {
    setGenerating(true);

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let yPos = 20;

      // Helper function to add page if needed
      const checkPageBreak = (needed = 30) => {
        if (yPos + needed > pageHeight - 20) {
          doc.addPage();
          yPos = 20;
        }
      };

      // Header
      doc.setFillColor(102, 126, 234);
      doc.rect(0, 0, pageWidth, 45, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('Webale', 14, 20);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Private Group Fundraising', 14, 28);
      
      doc.setFontSize(12);
      doc.text(group?.name || 'Group Report', 14, 38);
      
      doc.setFontSize(10);
      doc.text(`Generated: ${formatDate(new Date())}`, pageWidth - 60, 38);

      yPos = 55;
      doc.setTextColor(0, 0, 0);

      // Group Summary Section
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Group Summary', 14, yPos);
      yPos += 10;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');

      const totalPledged = pledges.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
      const totalReceived = pledges.reduce((sum, p) => sum + parseFloat(p.amount_paid || 0), 0);
      const goalAmount = parseFloat(group?.goal_amount || 0);
      const pledgedProgress = goalAmount > 0 ? ((totalPledged / goalAmount) * 100).toFixed(1) : 0;
      const receivedProgress = goalAmount > 0 ? ((totalReceived / goalAmount) * 100).toFixed(1) : 0;

      const summaryData = [
        ['Group Name', group?.name || 'N/A'],
        ['Description', group?.description || 'N/A'],
        ['Goal Amount', `${getCurrencySymbol()}${formatAmount(goalAmount)}`],
        ['Total Pledged', `${getCurrencySymbol()}${formatAmount(totalPledged)} (${pledgedProgress}%)`],
        ['Total Received', `${getCurrencySymbol()}${formatAmount(totalReceived)} (${receivedProgress}%)`],
        ['Total Members', members.length.toString()],
        ['Total Pledges', pledges.length.toString()],
        ['Deadline', formatDate(group?.deadline)],
        ['Created', formatDate(group?.created_at)]
      ];

      doc.autoTable({
        startY: yPos,
        head: [],
        body: summaryData,
        theme: 'plain',
        styles: { fontSize: 10, cellPadding: 3 },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 40 },
          1: { cellWidth: 'auto' }
        }
      });

      yPos = doc.lastAutoTable.finalY + 15;

      // Progress Bar Visual
      checkPageBreak(30);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Progress', 14, yPos);
      yPos += 8;

      // Pledged progress bar
      doc.setFillColor(226, 232, 240);
      doc.rect(14, yPos, pageWidth - 28, 8, 'F');
      doc.setFillColor(56, 178, 172);
      doc.rect(14, yPos, (pageWidth - 28) * (pledgedProgress / 100), 8, 'F');
      doc.setFontSize(8);
      doc.text(`Pledged: ${pledgedProgress}%`, 16, yPos + 6);
      yPos += 12;

      // Received progress bar
      doc.setFillColor(226, 232, 240);
      doc.rect(14, yPos, pageWidth - 28, 8, 'F');
      doc.setFillColor(72, 187, 120);
      doc.rect(14, yPos, (pageWidth - 28) * (receivedProgress / 100), 8, 'F');
      doc.text(`Received: ${receivedProgress}%`, 16, yPos + 6);
      yPos += 20;

      // Pledges Table
      if (reportType === 'summary' || reportType === 'pledges') {
        checkPageBreak(50);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Pledges', 14, yPos);
        yPos += 8;

        const pledgeTableData = pledges.map((p, idx) => [
          (idx + 1).toString(),
          p.is_anonymous ? 'Anonymous' : `${p.first_name || ''} ${p.last_name || ''}`.trim(),
          `${getCurrencySymbol()}${formatAmount(p.amount)}`,
          `${getCurrencySymbol()}${formatAmount(p.amount_paid || 0)}`,
          (p.status || 'pending').charAt(0).toUpperCase() + (p.status || 'pending').slice(1),
          formatDate(p.created_at)
        ]);

        doc.autoTable({
          startY: yPos,
          head: [['#', 'Member', 'Pledged', 'Paid', 'Status', 'Date']],
          body: pledgeTableData,
          theme: 'grid',
          styles: { fontSize: 9, cellPadding: 3 },
          headStyles: { fillColor: [102, 126, 234], textColor: 255 },
          alternateRowStyles: { fillColor: [247, 250, 252] }
        });

        yPos = doc.lastAutoTable.finalY + 15;
      }

      // Members Table
      if (reportType === 'summary' || reportType === 'members') {
        checkPageBreak(50);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Members', 14, yPos);
        yPos += 8;

        const memberTableData = members.map((m, idx) => [
          (idx + 1).toString(),
          `${m.first_name || ''} ${m.last_name || ''}`.trim(),
          m.email || 'N/A',
          (m.role || 'member').charAt(0).toUpperCase() + (m.role || 'member').slice(1),
          formatDate(m.joined_at || m.created_at)
        ]);

        doc.autoTable({
          startY: yPos,
          head: [['#', 'Name', 'Email', 'Role', 'Joined']],
          body: memberTableData,
          theme: 'grid',
          styles: { fontSize: 9, cellPadding: 3 },
          headStyles: { fillColor: [102, 126, 234], textColor: 255 },
          alternateRowStyles: { fillColor: [247, 250, 252] }
        });

        yPos = doc.lastAutoTable.finalY + 15;
      }

      // Statistics Summary
      checkPageBreak(60);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Statistics', 14, yPos);
      yPos += 10;

      const paidPledges = pledges.filter(p => p.status === 'paid').length;
      const pendingPledges = pledges.filter(p => p.status === 'pending').length;
      const partialPledges = pledges.filter(p => p.status === 'partial').length;

      const statsData = [
        ['Metric', 'Value'],
        ['Collection Rate', `${totalPledged > 0 ? ((totalReceived / totalPledged) * 100).toFixed(1) : 0}%`],
        ['Paid Pledges', paidPledges.toString()],
        ['Pending Pledges', pendingPledges.toString()],
        ['Partial Pledges', partialPledges.toString()],
        ['Average Pledge', `${getCurrencySymbol()}${pledges.length > 0 ? formatAmount(totalPledged / pledges.length) : '0.00'}`],
        ['Remaining to Goal', `${getCurrencySymbol()}${formatAmount(Math.max(0, goalAmount - totalReceived))}`]
      ];

      doc.autoTable({
        startY: yPos,
        head: [statsData[0]],
        body: statsData.slice(1),
        theme: 'striped',
        styles: { fontSize: 10, cellPadding: 4 },
        headStyles: { fillColor: [102, 126, 234], textColor: 255 }
      });

      // Footer on all pages
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(
          `Page ${i} of ${pageCount} | Generated by Webale - Private Group Fundraising`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
      }

      // Save the PDF
      const filename = `${group?.name?.replace(/[^a-z0-9]/gi, '_') || 'group'}_report_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(filename);

      setShowModal(false);
    } catch (error) {
      console.error('PDF generation error:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="btn"
        style={{
          background: '#e53e3e',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
      >
        📄 Generate Report
      </button>

      {showModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            className="card"
            style={{ maxWidth: '420px', width: '90%' }}
            onClick={e => e.stopPropagation()}
          >
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              📄 Generate PDF Report
            </h2>

            <p style={{ color: '#718096', marginBottom: '20px', fontSize: '14px' }}>
              Generate a professional PDF report for your group's fundraising progress.
            </p>

            {/* Report Type Selection */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600', fontSize: '14px' }}>
                Report Contents
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  { value: 'summary', label: '📊 Full Summary', desc: 'All data including pledges and members' },
                  { value: 'pledges', label: '💰 Pledges Only', desc: 'Focus on pledge details and payments' },
                  { value: 'members', label: '👥 Members Only', desc: 'Focus on member list and roles' }
                ].map(opt => (
                  <label
                    key={opt.value}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      padding: '12px',
                      background: reportType === opt.value ? '#ebf8ff' : '#f7fafc',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      border: reportType === opt.value ? '2px solid #4299e1' : '2px solid transparent'
                    }}
                  >
                    <input
                      type="radio"
                      name="reportType"
                      value={opt.value}
                      checked={reportType === opt.value}
                      onChange={(e) => setReportType(e.target.value)}
                      style={{ marginTop: '2px' }}
                    />
                    <div>
                      <span style={{ fontWeight: '600', fontSize: '14px' }}>{opt.label}</span>
                      <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#718096' }}>{opt.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Preview Info */}
            <div style={{
              padding: '14px',
              background: '#f7fafc',
              borderRadius: '8px',
              marginBottom: '20px',
              fontSize: '13px'
            }}>
              <p style={{ margin: '0 0 8px', fontWeight: '600' }}>Report will include:</p>
              <ul style={{ margin: 0, paddingLeft: '20px', color: '#718096' }}>
                <li>Group summary and progress</li>
                {(reportType === 'summary' || reportType === 'pledges') && (
                  <li>{pledges.length} pledges with payment status</li>
                )}
                {(reportType === 'summary' || reportType === 'members') && (
                  <li>{members.length} members with roles</li>
                )}
                <li>Collection statistics</li>
              </ul>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setShowModal(false)}
                className="btn"
                style={{ flex: 1, background: '#e2e8f0', color: '#4a5568' }}
              >
                Cancel
              </button>
              <button
                onClick={generatePDF}
                disabled={generating}
                className="btn"
                style={{
                  flex: 1,
                  background: '#e53e3e',
                  color: 'white'
                }}
              >
                {generating ? 'Generating...' : '📄 Download PDF'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ReportGenerator;
