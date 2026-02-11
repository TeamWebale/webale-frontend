import { useState } from 'react';
import * as XLSX from 'xlsx';

function ExportData({ groupId, groupName, pledges, members, contributions }) {
  const [exporting, setExporting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [exportType, setExportType] = useState('pledges');
  const [format, setFormat] = useState('xlsx');

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatAmount = (amount) => {
    return parseFloat(amount || 0).toFixed(2);
  };

  const preparePledgesData = () => {
    return pledges.map((p, idx) => ({
      '#': idx + 1,
      'Member Name': p.is_anonymous ? 'Anonymous' : `${p.first_name || ''} ${p.last_name || ''}`.trim(),
      'Email': p.is_anonymous ? 'Hidden' : (p.email || 'N/A'),
      'Amount Pledged': formatAmount(p.amount),
      'Amount Paid': formatAmount(p.amount_paid || 0),
      'Status': p.status || 'pending',
      'Pledge Date': formatDate(p.created_at),
      'Due Date': formatDate(p.due_date),
      'Notes': p.notes || ''
    }));
  };

  const prepareMembersData = () => {
    return members.map((m, idx) => ({
      '#': idx + 1,
      'First Name': m.first_name || '',
      'Last Name': m.last_name || '',
      'Email': m.email || '',
      'Country': m.country || '',
      'Role': m.role || 'member',
      'Joined Date': formatDate(m.joined_at || m.created_at),
      'Total Pledged': formatAmount(m.total_pledged || 0),
      'Total Paid': formatAmount(m.total_paid || 0)
    }));
  };

  const prepareContributionsData = () => {
    if (!contributions || contributions.length === 0) {
      return pledges
        .filter(p => parseFloat(p.amount_paid || 0) > 0)
        .map((p, idx) => ({
          '#': idx + 1,
          'Member Name': p.is_anonymous ? 'Anonymous' : `${p.first_name || ''} ${p.last_name || ''}`.trim(),
          'Amount': formatAmount(p.amount_paid),
          'Date': formatDate(p.paid_at || p.updated_at),
          'Method': p.payment_method || 'Manual',
          'Reference': p.payment_reference || ''
        }));
    }
    return contributions.map((c, idx) => ({
      '#': idx + 1,
      'Member Name': c.is_anonymous ? 'Anonymous' : `${c.first_name || ''} ${c.last_name || ''}`.trim(),
      'Amount': formatAmount(c.amount),
      'Date': formatDate(c.created_at),
      'Method': c.payment_method || 'Manual',
      'Reference': c.reference || ''
    }));
  };

  const prepareSummaryData = () => {
    const totalPledged = pledges.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
    const totalPaid = pledges.reduce((sum, p) => sum + parseFloat(p.amount_paid || 0), 0);
    const paidCount = pledges.filter(p => p.status === 'paid').length;
    const pendingCount = pledges.filter(p => p.status === 'pending').length;

    return [
      { 'Metric': 'Total Members', 'Value': members.length },
      { 'Metric': 'Total Pledges', 'Value': pledges.length },
      { 'Metric': 'Paid Pledges', 'Value': paidCount },
      { 'Metric': 'Pending Pledges', 'Value': pendingCount },
      { 'Metric': 'Total Pledged Amount', 'Value': `$${formatAmount(totalPledged)}` },
      { 'Metric': 'Total Received Amount', 'Value': `$${formatAmount(totalPaid)}` },
      { 'Metric': 'Collection Rate', 'Value': `${totalPledged > 0 ? ((totalPaid / totalPledged) * 100).toFixed(1) : 0}%` }
    ];
  };

  const getData = () => {
    switch (exportType) {
      case 'pledges': return preparePledgesData();
      case 'members': return prepareMembersData();
      case 'contributions': return prepareContributionsData();
      case 'summary': return prepareSummaryData();
      case 'all': return null; // Special case - multiple sheets
      default: return [];
    }
  };

  const exportToCSV = (data, filename) => {
    if (!data || data.length === 0) {
      alert('No data to export');
      return;
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(h => {
          const val = row[h]?.toString() || '';
          // Escape quotes and wrap in quotes if contains comma
          return val.includes(',') || val.includes('"') 
            ? `"${val.replace(/"/g, '""')}"` 
            : val;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.csv`;
    link.click();
  };

  const exportToExcel = (data, filename) => {
    if (exportType === 'all') {
      // Create workbook with multiple sheets
      const wb = XLSX.utils.book_new();
      
      const pledgesWs = XLSX.utils.json_to_sheet(preparePledgesData());
      XLSX.utils.book_append_sheet(wb, pledgesWs, 'Pledges');
      
      const membersWs = XLSX.utils.json_to_sheet(prepareMembersData());
      XLSX.utils.book_append_sheet(wb, membersWs, 'Members');
      
      const contribWs = XLSX.utils.json_to_sheet(prepareContributionsData());
      XLSX.utils.book_append_sheet(wb, contribWs, 'Contributions');
      
      const summaryWs = XLSX.utils.json_to_sheet(prepareSummaryData());
      XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');
      
      XLSX.writeFile(wb, `${filename}.xlsx`);
    } else {
      if (!data || data.length === 0) {
        alert('No data to export');
        return;
      }
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, exportType.charAt(0).toUpperCase() + exportType.slice(1));
      XLSX.writeFile(wb, `${filename}.xlsx`);
    }
  };

  const handleExport = () => {
    setExporting(true);
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `${groupName.replace(/[^a-z0-9]/gi, '_')}_${exportType}_${timestamp}`;
    
    try {
      const data = getData();
      
      if (format === 'csv') {
        if (exportType === 'all') {
          // Export each as separate CSV
          exportToCSV(preparePledgesData(), `${groupName.replace(/[^a-z0-9]/gi, '_')}_pledges_${timestamp}`);
          exportToCSV(prepareMembersData(), `${groupName.replace(/[^a-z0-9]/gi, '_')}_members_${timestamp}`);
          exportToCSV(prepareContributionsData(), `${groupName.replace(/[^a-z0-9]/gi, '_')}_contributions_${timestamp}`);
          exportToCSV(prepareSummaryData(), `${groupName.replace(/[^a-z0-9]/gi, '_')}_summary_${timestamp}`);
        } else {
          exportToCSV(data, filename);
        }
      } else {
        exportToExcel(data, filename);
      }
      
      setShowModal(false);
    } catch (error) {
      console.error('Export error:', error);
      alert('Export failed. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="btn"
        style={{
          background: '#48bb78',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
      >
        📥 Export Data
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
            style={{ maxWidth: '450px', width: '90%' }}
            onClick={e => e.stopPropagation()}
          >
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              📥 Export Data
            </h2>

            {/* Data Type Selection */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>
                What to Export
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  { value: 'pledges', label: '💰 Pledges', count: pledges.length },
                  { value: 'members', label: '👥 Members', count: members.length },
                  { value: 'contributions', label: '💵 Contributions', count: pledges.filter(p => p.amount_paid > 0).length },
                  { value: 'summary', label: '📊 Summary Report', count: null },
                  { value: 'all', label: '📦 All Data (Multiple Sheets)', count: null }
                ].map(opt => (
                  <label
                    key={opt.value}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '12px',
                      background: exportType === opt.value ? '#ebf8ff' : '#f7fafc',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      border: exportType === opt.value ? '2px solid #4299e1' : '2px solid transparent'
                    }}
                  >
                    <input
                      type="radio"
                      name="exportType"
                      value={opt.value}
                      checked={exportType === opt.value}
                      onChange={(e) => setExportType(e.target.value)}
                    />
                    <span style={{ flex: 1 }}>{opt.label}</span>
                    {opt.count !== null && (
                      <span style={{ 
                        background: '#e2e8f0', 
                        padding: '2px 8px', 
                        borderRadius: '10px',
                        fontSize: '12px',
                        color: '#718096'
                      }}>
                        {opt.count}
                      </span>
                    )}
                  </label>
                ))}
              </div>
            </div>

            {/* Format Selection */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>
                File Format
              </label>
              <div style={{ display: 'flex', gap: '12px' }}>
                <label
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '12px',
                    background: format === 'xlsx' ? '#c6f6d5' : '#f7fafc',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    border: format === 'xlsx' ? '2px solid #48bb78' : '2px solid transparent'
                  }}
                >
                  <input
                    type="radio"
                    name="format"
                    value="xlsx"
                    checked={format === 'xlsx'}
                    onChange={(e) => setFormat(e.target.value)}
                    style={{ display: 'none' }}
                  />
                  📗 Excel (.xlsx)
                </label>
                <label
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '12px',
                    background: format === 'csv' ? '#c6f6d5' : '#f7fafc',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    border: format === 'csv' ? '2px solid #48bb78' : '2px solid transparent'
                  }}
                >
                  <input
                    type="radio"
                    name="format"
                    value="csv"
                    checked={format === 'csv'}
                    onChange={(e) => setFormat(e.target.value)}
                    style={{ display: 'none' }}
                  />
                  📄 CSV
                </label>
              </div>
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
                onClick={handleExport}
                disabled={exporting}
                className="btn"
                style={{ 
                  flex: 1, 
                  background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)', 
                  color: 'white' 
                }}
              >
                {exporting ? 'Exporting...' : '📥 Export'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ExportData;
