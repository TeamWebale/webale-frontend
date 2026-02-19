import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { groupAPI, pledgeAPI, activityAPI, recurringPledgeAPI, auditAPI, subGoalsAPI, messagesAPI } from '../services/api';
import { getCurrencySymbol, getAllCurrencies, convertCurrency, detectUserCurrency } from '../utils/currencyConverter';
import { formatTimeAgo } from '../utils/timeFormatter';
import MainLayout from '../components/MainLayout';
import PaymentButton from '../components/PaymentButton';

// ==================== MODAL COMPONENT ====================
const Modal = ({ isOpen, onClose, title, children, width = '500px' }) => {
  if (!isOpen) return null;
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center',
      justifyContent: 'center', zIndex: 1000, padding: '20px'
    }} onClick={onClose}>
      <div style={{
        background: 'white', borderRadius: '16px', width: '100%', maxWidth: width,
        maxHeight: '85vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }} onClick={e => e.stopPropagation()}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '18px 24px', borderBottom: '1px solid #e2e8f0'
        }}>
          <h3 style={{ margin: 0, fontSize: '17px', color: '#2d3748', fontWeight: '700' }}>{title}</h3>
          <button onClick={onClose} style={{
            background: '#fed7d7', border: 'none', fontSize: '18px', cursor: 'pointer',
            color: '#e53e3e', padding: '4px 10px', lineHeight: 1, borderRadius: '8px',
            fontWeight: '700', transition: 'all 0.2s'
          }}>✕</button>
        </div>
        <div style={{ padding: '24px' }}>{children}</div>
      </div>
    </div>
  );
};

// ==================== FORM INPUT COMPONENT ====================
const FormField = ({ label, children, required }) => (
  <div style={{ marginBottom: '16px' }}>
    <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#4a5568' }}>
      {label} {required && <span style={{ color: '#e53e3e' }}>*</span>}
    </label>
    {children}
  </div>
);

const inputStyle = {
  width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: '8px',
  fontSize: '14px', color: '#2d3748', boxSizing: 'border-box', outline: 'none'
};

const selectStyle = { ...inputStyle, background: 'white' };

const btnPrimary = {
  padding: '10px 20px', background: '#667eea', color: 'white', border: 'none',
  borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', width: '100%'
};

const btnDanger = { ...btnPrimary, background: '#e53e3e' };
const btnSecondary = { ...btnPrimary, background: '#718096' };

function GroupDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  // Data states
  const [loading, setLoading] = useState(true);
  const [group, setGroup] = useState(null);
  const [pledges, setPledges] = useState([]);
  const [members, setMembers] = useState([]);
  const [subGoals, setSubGoals] = useState([]);
  const [activities, setActivities] = useState([]);
  const [recurringPledges, setRecurringPledges] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [detectedCurrency, setDetectedCurrency] = useState('USD');
  const [allCurrencies, setAllCurrencies] = useState(getAllCurrencies());

  // UI states
  const [activeTab, setActiveTab] = useState('overview');

  // Modal states
  const [showPledgeModal, setShowPledgeModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showRecurringModal, setShowRecurringModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showSubGoalModal, setShowSubGoalModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showConverterModal, setShowConverterModal] = useState(false);
  const [converterForm, setConverterForm] = useState({ amount: '', fromCurrency: 'USD', toCurrency: 'EUR' });
  const [showRevisePledgeModal, setShowRevisePledgeModal] = useState(false);
  const [selectedPledge, setSelectedPledge] = useState(null);
  const [showPartPaymentModal, setShowPartPaymentModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showOfflineDonationModal, setShowOfflineDonationModal] = useState(false);

  // Form states
  const [pledgeForm, setPledgeForm] = useState({
    amount: '', fulfillmentDate: '', reminderFrequency: 'none', isAnonymous: false, currency: 'USD'
  });
  const [editForm, setEditForm] = useState({ name: '', description: '', goalAmount: '', deadline: '', currency: 'USD' });
  const [inviteEmails, setInviteEmails] = useState('');
  const [inviteTab, setInviteTab] = useState('email');
  const [inviteLink, setInviteLink] = useState('');
  const [inviteMessage, setInviteMessage] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [inviteGenerated, setInviteGenerated] = useState(false);
  const [recurringForm, setRecurringForm] = useState({ amount: '', frequency: 'monthly', startDate: '', endDate: '' });
  const [subGoalForm, setSubGoalForm] = useState({ name: '', targetAmount: '', description: '' });
  const [messageForm, setMessageForm] = useState({ recipientId: '', content: '' });
  const [revisePledgeForm, setRevisePledgeForm] = useState({ amount: '', notes: '' });
  const [partPaymentForm, setPartPaymentForm] = useState({ amount: '' });
  const [offlineDonationForm, setOfflineDonationForm] = useState({ donorName: '', amount: '', notes: '', date: '', type: 'payment', isAnonymous: false, fulfillmentDate: '' });
  const [formLoading, setFormLoading] = useState(false);

  // Derived values
  const isAdmin = group?.user_role === 'admin' || group?.role === 'admin';
  const currencySymbol = getCurrencySymbol(group?.currency || 'USD');

  // ==================== DATA LOADING ====================
  useEffect(() => {
    loadGroupData();
  }, [id]);

  // Detect user's local currency on mount
  useEffect(() => {
    detectUserCurrency().then(result => {
      setDetectedCurrency(result.currency);
    });
  }, []);

  useEffect(() => {
    if (group) {
      if (activeTab === 'activity') loadActivities();
      if (activeTab === 'recurring') loadRecurring();
      if (activeTab === 'audit') loadAudit();
    }
  }, [activeTab, group]);

  const loadGroupData = async () => {
    try {
      setLoading(true);
      const groupRes = await groupAPI.getById(id);
      const groupData = groupRes.data.data?.group || groupRes.data.group || groupRes.data.data || groupRes.data;
      setGroup(groupData);

      try {
        const pledgesRes = await pledgeAPI.getByGroup(id);
        const pledgesData = pledgesRes.data.data?.pledges || pledgesRes.data.pledges || pledgesRes.data || [];
        setPledges(Array.isArray(pledgesData) ? pledgesData : []);
      } catch (e) { setPledges([]); }

      try {
        const membersRes = await groupAPI.getMembers(id);
        const membersData = membersRes.data.data?.members || membersRes.data.members || membersRes.data || [];
        setMembers(Array.isArray(membersData) ? membersData : []);
      } catch (e) { setMembers([]); }

      try {
        const subGoalsRes = await subGoalsAPI.getByGroup(id);
        const subGoalsData = subGoalsRes.data.data?.subGoals || subGoalsRes.data.data || subGoalsRes.data || [];
        setSubGoals(Array.isArray(subGoalsData) ? subGoalsData : []);
      } catch (e) { setSubGoals([]); }
    } catch (err) {
      console.error('Error loading group:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadActivities = async () => {
    try {
      const res = await activityAPI.getByGroup(id);
      const data = res.data.data?.activities || res.data.activities || res.data.data || res.data || [];
      setActivities(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Load activities error:', e);
      setActivities([]);
    }
  };

  const loadRecurring = async () => {
    try {
      const res = await recurringPledgeAPI.getByGroup(id);
      const data = res.data.data?.recurringPledges || res.data.data || res.data || [];
      setRecurringPledges(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Load recurring error:', e);
      setRecurringPledges([]);
    }
  };

  const loadAudit = async () => {
    try {
      const res = await auditAPI.getLogs(id);
      const data = res.data.data?.logs || res.data.data || res.data || [];
      setAuditLogs(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Load audit error:', e);
      setAuditLogs([]);
    }
  };

  // ==================== HELPER FUNCTIONS ====================
  const formatAmount = (amount) => {
    return parseFloat(amount || 0).toLocaleString('en-US', {
      minimumFractionDigits: 2, maximumFractionDigits: 2
    });
  };

  const pledgedPercent = group?.goal_amount > 0
    ? ((parseFloat(group.pledged_amount || 0) / parseFloat(group.goal_amount)) * 100).toFixed(1) : 0;
  const receivedPercent = group?.goal_amount > 0
    ? ((parseFloat(group.current_amount || 0) / parseFloat(group.goal_amount)) * 100).toFixed(1) : 0;

  const getActivityIcon = (type) => {
    const icons = {
      'pledge_created': '💰', 'group_created': '🎉', 'member_joined': '👤',
      'payment_made': '💳', 'contribution_made': '💵', 'comment_posted': '💬',
      'pledge_cancelled': '❌', 'invitation_sent': '📧', 'pledge_paid': '✅'
    };
    return icons[type] || '📌';
  };

  // ==================== ACTION HANDLERS ====================
  const handleMakePledge = async () => {
    setPledgeForm({ amount: '', fulfillmentDate: '', reminderFrequency: 'none', isAnonymous: false, currency: detectedCurrency || group?.currency || 'USD' });
    setShowPledgeModal(true);
  };

  const submitPledge = async () => {
    if (!pledgeForm.amount || parseFloat(pledgeForm.amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    setFormLoading(true);
    try {
      const pledgeAmount = parseFloat(pledgeForm.amount);
      const groupCurrency = group?.currency || 'USD';
      let finalAmount = pledgeAmount;
      let originalAmount = pledgeAmount;

      // If pledge currency differs from group currency, convert
      if (pledgeForm.currency && pledgeForm.currency !== groupCurrency) {
        const converted = convertCurrency(pledgeAmount, pledgeForm.currency, groupCurrency);
        finalAmount = converted.converted;
        originalAmount = pledgeAmount;
      }

      await pledgeAPI.create(id, {
        amount: finalAmount,
        fulfillmentDate: pledgeForm.fulfillmentDate || null,
        reminderFrequency: pledgeForm.reminderFrequency,
        isAnonymous: pledgeForm.isAnonymous,
        currency: pledgeForm.currency,
        originalAmount: originalAmount
      });
      setShowPledgeModal(false);
      loadGroupData();
      alert('Pledge created successfully!');
    } catch (err) {
      alert('Failed to create pledge: ' + (err.response?.data?.message || err.message));
    } finally {
      setFormLoading(false);
    }
  };

  const handleMarkPaid = async (pledgeId) => {
    if (!window.confirm('Mark this pledge as fully paid?')) return;
    try {
      await pledgeAPI.markAsPaid(id, pledgeId);
      loadGroupData();
    } catch (err) {
      alert('Failed to mark as paid');
    }
  };

  const handlePartPayment = async () => {
    if (!partPaymentForm.amount || parseFloat(partPaymentForm.amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    setFormLoading(true);
    try {
      await pledgeAPI.addContribution(id, {
        pledgeId: selectedPledge.id,
        amount: parseFloat(partPaymentForm.amount)
      });
      setShowPartPaymentModal(false);
      setSelectedPledge(null);
      loadGroupData();
      alert('Part payment recorded!');
    } catch (err) {
      alert('Failed to record payment: ' + (err.response?.data?.message || err.message));
    } finally {
      setFormLoading(false);
    }
  };

  const openRevisePledge = (pledge) => {
    setSelectedPledge(pledge);
    setRevisePledgeForm({ amount: pledge.amount, notes: pledge.notes || '' });
    setShowRevisePledgeModal(true);
  };

  const submitRevisePledge = async () => {
    if (!revisePledgeForm.amount || parseFloat(revisePledgeForm.amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    setFormLoading(true);
    try {
      await pledgeAPI.update(id, selectedPledge.id, {
        amount: parseFloat(revisePledgeForm.amount),
        notes: revisePledgeForm.notes
      });
      setShowRevisePledgeModal(false);
      setSelectedPledge(null);
      loadGroupData();
      alert('Pledge revised successfully!');
    } catch (err) {
      alert('Failed to revise pledge: ' + (err.response?.data?.message || err.message));
    } finally {
      setFormLoading(false);
    }
  };

  const handleCancelPledge = async () => {
    if (!window.confirm('Are you sure you want to cancel this pledge? This action will be tracked.')) return;
    setFormLoading(true);
    try {
      await pledgeAPI.delete(id, selectedPledge.id);
      setShowRevisePledgeModal(false);
      setSelectedPledge(null);
      loadGroupData();
      alert('Pledge cancelled successfully.');
    } catch (err) {
      alert('Failed to cancel pledge: ' + (err.response?.data?.message || err.message));
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditGroup = () => {
    setEditForm({
      name: group.name || '', description: group.description || '',
      goalAmount: group.goal_amount || '', deadline: group.deadline ? group.deadline.split('T')[0] : '',
      currency: group.currency || 'USD'
    });
    setShowEditModal(true);
  };

  const submitEditGroup = async () => {
    if (!editForm.name) { alert('Group name is required'); return; }
    setFormLoading(true);
    try {
      await groupAPI.update(id, {
        name: editForm.name, description: editForm.description,
        goalAmount: parseFloat(editForm.goalAmount) || 0,
        deadline: editForm.deadline || null, currency: editForm.currency
      });
      setShowEditModal(false);
      loadGroupData();
      alert('Group updated!');
    } catch (err) {
      alert('Failed to update group: ' + (err.response?.data?.message || err.message));
    } finally {
      setFormLoading(false);
    }
  };

  const handleInvite = async () => {
    const userName = `${currentUser.first_name || ''} ${currentUser.last_name || ''}`.trim() || 'A member';
    const groupName = group?.name || 'our fundraising group';
    const defaultMessage = `${userName} cordially invites you to join "${groupName}" a private fundraising group on Webale platform. Follow this link to sign-in/sign-up, accept and join; see you there! 🤝`;
    setInviteMessage(defaultMessage);
    setInviteEmails('');
    setInviteLink('');
    setQrCodeUrl('');
    setInviteGenerated(false);
    setShowInviteModal(true);

    // Auto-generate invite link immediately
    try {
      const res = await groupAPI.invite(id, { emails: ['invite@webale.app'] });
      const invitations = res.data.data?.invitations || [];
      if (invitations.length > 0) {
        const link = invitations[0].inviteLink;
        setInviteLink(link);
        setQrCodeUrl(generateQRCode(link));
        setInviteGenerated(true);
      }
    } catch (err) {
      console.error('Failed to generate invite link:', err);
    }
  };

  const generateQRCode = (text) => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(text)}`;
  };

  const submitInvite = async () => {
    if (inviteTab === 'email') {
      const emails = inviteEmails.split(/[,\n]/).map(e => e.trim()).filter(Boolean);
      if (emails.length === 0) { alert('Please enter at least one email'); return; }
      setFormLoading(true);
      try {
        const res = await groupAPI.invite(id, { emails });
        const invitations = res.data.data?.invitations || [];
        if (invitations.length > 0) {
          const link = invitations[0].inviteLink;
          setInviteLink(link);
          setQrCodeUrl(generateQRCode(link));
          setInviteGenerated(true);
        }
      } catch (err) {
        alert('Failed to send invitations: ' + (err.response?.data?.message || err.message));
      } finally {
        setFormLoading(false);
      }
    } else {
      // For WhatsApp and QR, generate a generic invite link
      setFormLoading(true);
      try {
        const res = await groupAPI.invite(id, { emails: ['invite@webale.app'] });
        const invitations = res.data.data?.invitations || [];
        if (invitations.length > 0) {
          const link = invitations[0].inviteLink;
          setInviteLink(link);
          setQrCodeUrl(generateQRCode(link));
          setInviteGenerated(true);
        }
      } catch (err) {
        alert('Failed to generate invite link: ' + (err.response?.data?.message || err.message));
      } finally {
        setFormLoading(false);
      }
    }
  };

  const handleSetupRecurring = () => {
    setRecurringForm({ amount: '', frequency: 'monthly', startDate: '', endDate: '' });
    setShowRecurringModal(true);
  };

  const submitRecurring = async () => {
    if (!recurringForm.amount || parseFloat(recurringForm.amount) <= 0) {
      alert('Please enter a valid amount'); return;
    }
    setFormLoading(true);
    try {
      await recurringPledgeAPI.create(id, {
        amount: parseFloat(recurringForm.amount),
        frequency: recurringForm.frequency,
        startDate: recurringForm.startDate || null,
        endDate: recurringForm.endDate || null
      });
      setShowRecurringModal(false);
      loadRecurring();
      alert('Recurring pledge created!');
    } catch (err) {
      alert('Failed to create recurring pledge: ' + (err.response?.data?.message || err.message));
    } finally {
      setFormLoading(false);
    }
  };

  const handleCreateSubGoal = () => {
    setSubGoalForm({ name: '', targetAmount: '', description: '' });
    setShowSubGoalModal(true);
  };

  const submitSubGoal = async () => {
    if (!subGoalForm.name || !subGoalForm.targetAmount) {
      alert('Name and target amount are required'); return;
    }
    setFormLoading(true);
    try {
      await subGoalsAPI.create(id, {
        name: subGoalForm.name,
        targetAmount: parseFloat(subGoalForm.targetAmount),
        description: subGoalForm.description
      });
      setShowSubGoalModal(false);
      loadGroupData();
      alert('Sub-goal created!');
    } catch (err) {
      alert('Failed to create sub-goal: ' + (err.response?.data?.message || err.message));
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteGroup = async () => {
    setFormLoading(true);
    try {
      await groupAPI.delete(id);
      alert('Group deleted');
      navigate('/dashboard');
    } catch (err) {
      alert('Failed to delete group: ' + (err.response?.data?.message || err.message));
    } finally {
      setFormLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleExportData = () => {
    setShowExportModal(true);
  };

  const exportAsCSV = () => {
    try {
      const csvRows = ['Name,Email,Amount,Paid,Status,Date'];
      pledges.forEach(p => {
        csvRows.push(`"${p.first_name || ''} ${p.last_name || ''}","${p.email || ''}",${p.amount},${p.amount_paid || 0},${p.status},"${new Date(p.created_at).toLocaleDateString()}"`);
      });
      const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${group.name || 'group'}-pledges.csv`;
      a.click();
      URL.revokeObjectURL(url);
      setShowExportModal(false);
    } catch (err) {
      alert('Failed to export CSV');
    }
  };

  const exportAsPDF = async () => {
    try {
      // Dynamically load jsPDF from CDN
      if (!window.jspdf) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
        // Also load autotable plugin for tables
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js';
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }

      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      let y = 20;

      // Title bar
      doc.setFillColor(102, 126, 234);
      doc.rect(0, 0, pageWidth, 40, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text('WEBALE', 14, 18);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Private Group Fundraising', 14, 26);
      doc.setFontSize(11);
      doc.text(`Report: ${group.name || 'Group'}`, 14, 35);
      doc.setFontSize(9);
      doc.text(`Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, pageWidth - 14, 35, { align: 'right' });

      y = 52;

      // Summary section
      doc.setTextColor(45, 55, 72);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Fundraising Summary', 14, y);
      y += 10;

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      const summaryData = [
        ['Group Name', group.name || 'N/A'],
        ['Goal Amount', `${currencySymbol}${formatAmount(group.goal_amount)}`],
        ['Total Pledged', `${currencySymbol}${formatAmount(group.pledged_amount)} (${pledgedPercent}%)`],
        ['Total Received', `${currencySymbol}${formatAmount(group.current_amount)} (${receivedPercent}%)`],
        ['Outstanding', `${currencySymbol}${formatAmount((group.pledged_amount || 0) - (group.current_amount || 0))}`],
        ['Members', `${members.length}`],
        ['Total Pledges', `${pledges.length}`],
        ['Currency', group.currency || 'USD'],
        ['Deadline', group.deadline ? new Date(group.deadline).toLocaleDateString() : 'No deadline'],
        ['Status', group.status || 'Active'],
      ];

      doc.autoTable({
        startY: y,
        head: [],
        body: summaryData,
        theme: 'plain',
        styles: { fontSize: 10, cellPadding: 4 },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 50, textColor: [100, 100, 100] },
          1: { textColor: [45, 55, 72] }
        },
        margin: { left: 14, right: 14 },
      });

      y = doc.lastAutoTable.finalY + 14;

      // Progress bars (visual)
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Progress', 14, y);
      y += 8;

      // Pledged bar
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`Pledged: ${pledgedPercent}%`, 14, y);
      y += 4;
      doc.setFillColor(226, 232, 240);
      doc.roundedRect(14, y, pageWidth - 28, 6, 3, 3, 'F');
      doc.setFillColor(72, 187, 120);
      const pledgedWidth = Math.min(parseFloat(pledgedPercent) / 100, 1) * (pageWidth - 28);
      if (pledgedWidth > 0) doc.roundedRect(14, y, pledgedWidth, 6, 3, 3, 'F');
      y += 12;

      // Received bar
      doc.text(`Received: ${receivedPercent}%`, 14, y);
      y += 4;
      doc.setFillColor(226, 232, 240);
      doc.roundedRect(14, y, pageWidth - 28, 6, 3, 3, 'F');
      doc.setFillColor(102, 126, 234);
      const receivedWidth = Math.min(parseFloat(receivedPercent) / 100, 1) * (pageWidth - 28);
      if (receivedWidth > 0) doc.roundedRect(14, y, receivedWidth, 6, 3, 3, 'F');
      y += 16;

      // Pledges Table
      if (pledges.length > 0) {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Pledge Details', 14, y);
        y += 4;

        const tableData = pledges.map(p => [
          p.is_anonymous ? 'John Doe' : `${p.first_name || ''} ${p.last_name || ''}`,
          p.email || '-',
          `${currencySymbol}${formatAmount(p.amount)}`,
          `${currencySymbol}${formatAmount(p.amount_paid || 0)}`,
          p.status?.toUpperCase() || 'PLEDGED',
          new Date(p.created_at).toLocaleDateString()
        ]);

        doc.autoTable({
          startY: y,
          head: [['Name', 'Email', 'Pledged', 'Paid', 'Status', 'Date']],
          body: tableData,
          theme: 'grid',
          headStyles: { fillColor: [102, 126, 234], textColor: 255, fontStyle: 'bold', fontSize: 9 },
          styles: { fontSize: 9, cellPadding: 4 },
          alternateRowStyles: { fillColor: [247, 250, 252] },
          columnStyles: {
            2: { halign: 'right' },
            3: { halign: 'right' },
            4: { halign: 'center' },
          },
          margin: { left: 14, right: 14 },
        });

        y = doc.lastAutoTable.finalY + 12;
      }

      // Members section
      if (members.length > 0) {
        if (y > 240) { doc.addPage(); y = 20; }
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Members', 14, y);
        y += 4;

        const memberData = members.map(m => [
          `${m.first_name || ''} ${m.last_name || ''}`,
          m.email || '-',
          m.role || 'member',
          m.joined_at ? new Date(m.joined_at).toLocaleDateString() : '-'
        ]);

        doc.autoTable({
          startY: y,
          head: [['Name', 'Email', 'Role', 'Joined']],
          body: memberData,
          theme: 'grid',
          headStyles: { fillColor: [159, 122, 234], textColor: 255, fontStyle: 'bold', fontSize: 9 },
          styles: { fontSize: 9, cellPadding: 4 },
          alternateRowStyles: { fillColor: [250, 245, 255] },
          margin: { left: 14, right: 14 },
        });
      }

      // Footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(160, 174, 192);
        doc.text(`Webale Fundraising Report - ${group.name} | Page ${i} of ${pageCount}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
      }

      doc.save(`${group.name || 'group'}-report.pdf`);
      setShowExportModal(false);
    } catch (err) {
      console.error('PDF export error:', err);
      alert('Failed to export PDF. Please try again.');
    }
  };

  const handleGenerateReport = () => {
    setShowExportModal(true);
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm('Remove this member from the group?')) return;
    try {
      await groupAPI.removeMember(id, userId);
      loadGroupData();
      alert('Member removed');
    } catch (err) {
      alert('Failed to remove member: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleOfflineDonation = async () => {
    if (!offlineDonationForm.amount || parseFloat(offlineDonationForm.amount) <= 0) {
      alert('Please enter a valid amount'); return;
    }
    setFormLoading(true);
    try {
      const isPledge = offlineDonationForm.type === 'pledge';
      const isAnon = offlineDonationForm.isAnonymous || !offlineDonationForm.donorName;

      // Create a pledge entry
      await pledgeAPI.create(id, {
        amount: parseFloat(offlineDonationForm.amount),
        isAnonymous: isAnon,
        fulfillmentDate: isPledge ? (offlineDonationForm.fulfillmentDate || null) : null,
        reminderFrequency: 'none',
        currency: group?.currency || 'USD'
      });

      // If it's a payment (not a pledge), immediately mark as paid
      if (!isPledge) {
        const pledgesRes = await pledgeAPI.getByGroup(id);
        const allPledges = pledgesRes.data.data?.pledges || pledgesRes.data.pledges || [];
        if (allPledges.length > 0) {
          const latestPledge = allPledges[0];
          try {
            await pledgeAPI.markAsPaid(id, latestPledge.id);
          } catch (e) {
            console.log('Note: pledge created but not auto-marked as paid');
          }
        }
      }

      setShowOfflineDonationModal(false);
      setOfflineDonationForm({ donorName: '', amount: '', notes: '', date: '', type: 'payment', isAnonymous: false, fulfillmentDate: '' });
      loadGroupData();
      alert(isPledge ? 'Offshore pledge recorded! It will be tracked in the progress bars.' : 'Offshore payment recorded and marked as received!');
    } catch (err) {
      alert('Failed to record: ' + (err.response?.data?.message || err.message));
    } finally {
      setFormLoading(false);
    }
  };

  // ==================== RIGHT SIDEBAR ====================
  const RightSidebar = () => (
    <>
      {/* Live Donor Feed */}
      <div style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #f7fafc 100%)', borderRadius: '12px', padding: '16px',
        marginBottom: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              width: '10px', height: '10px', borderRadius: '50%', background: '#e53e3e',
              animation: 'pulse 2s infinite', display: 'inline-block'
            }} />
            <h3 style={{ margin: 0, fontSize: '15px', color: '#2d3748', fontWeight: '700' }}>Live Donor Feed</h3>
          </div>
        </div>
        {pledges.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '16px', color: '#a0aec0' }}>
            <p style={{ margin: '0 0 8px', fontSize: '13px' }}>No recent pledges yet</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
            {pledges.slice(0, 5).map(pledge => (
              <div key={pledge.id} style={{ padding: '10px', background: '#f7fafc', borderRadius: '8px', fontSize: '13px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: '600', color: '#2d3748' }}>
                    {pledge.is_anonymous ? 'John Doe' : pledge.first_name}
                  </span>
                  <span style={{ color: '#48bb78', fontWeight: '600' }}>
                    {currencySymbol}{formatAmount(pledge.amount)}
                  </span>
                </div>
                <span style={{ fontSize: '11px', color: '#a0aec0' }}>{formatTimeAgo(pledge.created_at)}</span>
              </div>
            ))}
          </div>
        )}
        <div style={{ padding: '8px 12px', background: '#faf5ff', borderRadius: '20px', textAlign: 'center' }}>
          <span style={{ fontSize: '12px', color: '#9f7aea' }}>💡 Updates every 30 seconds</span>
        </div>
        {isAdmin && (
          <button onClick={handleCreateSubGoal} style={{
            width: '100%', marginTop: '12px', padding: '8px', background: 'none', border: 'none',
            color: '#667eea', fontSize: '13px', fontWeight: '600', cursor: 'pointer', textAlign: 'right'
          }}>+ Add Sub-Goal</button>
        )}
      </div>

      {/* Milestones */}
      <div style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #faf5ff 100%)', borderRadius: '12px', padding: '16px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0'
      }}>
        <h3 style={{ margin: '0 0 12px', fontSize: '15px', color: '#2d3748', fontWeight: '700' }}>Milestones</h3>
        {subGoals.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <div style={{ fontSize: '48px', marginBottom: '8px' }}>🎯</div>
            <p style={{ color: '#a0aec0', fontSize: '13px', margin: '0 0 12px' }}>No sub-goals yet</p>
            {isAdmin && (
              <button onClick={handleCreateSubGoal} className="btn btn-primary"
                style={{ width: '100%', padding: '10px', fontSize: '13px' }}>
                Create First Sub-Goal
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {subGoals.map(goal => (
              <div key={goal.id} style={{ padding: '12px', background: '#f7fafc', borderRadius: '8px' }}>
                <p style={{ fontWeight: '600', margin: '0 0 4px', fontSize: '13px' }}>{goal.name}</p>
                <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${Math.min(((goal.current_amount || 0) / (goal.target_amount || 1)) * 100, 100)}%`,
                    background: '#48bb78', borderRadius: '3px'
                  }} />
                </div>
                <p style={{ fontSize: '11px', color: '#718096', margin: '4px 0 0' }}>
                  {currencySymbol}{formatAmount(goal.current_amount)} / {currencySymbol}{formatAmount(goal.target_amount)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
      <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>
    </>
  );

  // ==================== TAB DEFINITIONS ====================
  const tabs = [
    { id: 'overview', icon: '📊', label: 'Overview', show: true },
    { id: 'pledges', icon: '💰', label: 'Pledges', show: true },
    { id: 'members', icon: '👥', label: 'Members', show: true },
    { id: 'activity', icon: '📈', label: 'Activity', show: true },
    { id: 'recurring', icon: '🔄', label: 'Recurring', show: true },
    { id: 'audit', icon: '📋', label: 'Audit', show: isAdmin },
    { id: 'admin', icon: '⚙️', label: 'Admin', show: isAdmin },
  ];

  // ==================== LOADING STATE ====================
  if (loading) {
    return (
      <MainLayout>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <div className="spinner"></div>
        </div>
      </MainLayout>
    );
  }

  if (!group) {
    return (
      <MainLayout>
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>😕</div>
          <h2>Group Not Found</h2>
          <button onClick={() => navigate('/dashboard')} className="btn btn-primary">← Back to Dashboard</button>
        </div>
      </MainLayout>
    );
  }

  // ==================== MAIN RENDER ====================
  return (
    <MainLayout rightSidebar={<RightSidebar />} showProfileBanner={true}>

      {/* Group Header */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '12px', padding: '20px', marginBottom: '16px', color: 'white'
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '16px' }}>
          <div style={{
            width: '50px', height: '50px', borderRadius: '10px',
            background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '24px', fontWeight: 'bold'
          }}>
            {group.name?.charAt(0) || 'G'}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: 'white' }}>{group.name}</h2>
              <span style={{
                padding: '3px 10px', background: isAdmin ? '#ed8936' : '#48bb78',
                borderRadius: '10px', fontSize: '11px', fontWeight: '600'
              }}>
                {isAdmin ? 'Admin' : 'Member'}
              </span>
            </div>
            <p style={{ opacity: 0.85, fontSize: '13px', margin: 0, lineHeight: '1.4' }}>
              {group.description || 'One For All, All For One!'}
            </p>
          </div>
        </div>

        {/* Action Buttons Row 1 */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
          {isAdmin && (
            <button onClick={handleEditGroup} className="btn" style={{ background: '#4299e1', color: 'white', padding: '8px 14px', fontSize: '13px' }}>
              ✏️ Edit / Delete Group
            </button>
          )}
          <button onClick={handleInvite} className="btn" style={{ background: '#667eea', color: 'white', padding: '8px 14px', fontSize: '13px' }}>
            👥 Invite Participants
          </button>
          {isAdmin && (
            <button onClick={() => { setOfflineDonationForm({ donorName: '', amount: '', notes: '', date: new Date().toISOString().split('T')[0], type: 'payment', isAnonymous: false, fulfillmentDate: '' }); setShowOfflineDonationModal(true); }} className="btn" style={{ background: '#ed8936', color: 'white', padding: '8px 14px', fontSize: '13px' }}>
              💵 Offshore Donations
            </button>
          )}
          <button onClick={handleExportData} className="btn" style={{ background: '#e53e3e', color: 'white', padding: '8px 14px', fontSize: '13px' }}>
            📊 Get Data/Report
          </button>
        </div>

        {/* Action Buttons Row 2 */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button onClick={handleMakePledge} className="btn" style={{ background: '#38b2ac', color: 'white', padding: '8px 14px', fontSize: '13px' }}>
            💰 Make Pledge
          </button>
          <button onClick={() => setShowMessageModal(true)} className="btn" style={{ background: '#667eea', color: 'white', padding: '8px 14px', fontSize: '13px' }}>
            💬 Interactions
          </button>
          <button onClick={() => setShowConverterModal(true)} className="btn" style={{ background: '#718096', color: 'white', padding: '8px 14px', fontSize: '13px' }}>
            💱 Convert $-€-£-¥
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #f0fff4 100%)', borderRadius: '12px', padding: '16px',
        marginBottom: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <span style={{ color: '#48bb78', fontWeight: '600', fontSize: '14px' }}>
            💰 {currencySymbol}{formatAmount(group.pledged_amount || 0)} pledged
          </span>
          <span style={{ color: '#a0aec0', fontSize: '13px' }}>{pledgedPercent}%</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <span style={{ color: '#667eea', fontWeight: '600', fontSize: '14px' }}>
            💵 {currencySymbol}{formatAmount(group.current_amount || 0)} received
          </span>
          <span style={{ color: '#a0aec0', fontSize: '13px' }}>{receivedPercent}%</span>
        </div>
        {/* Progress bars with color */}
        <div style={{ marginBottom: '4px' }}>
          <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden', marginBottom: '4px' }}>
            <div style={{
              height: '100%', width: `${Math.min(pledgedPercent, 100)}%`,
              background: 'linear-gradient(90deg, #48bb78, #38b2ac)', borderRadius: '4px',
              transition: 'width 0.5s ease'
            }} />
          </div>
          <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: `${Math.min(receivedPercent, 100)}%`,
              background: 'linear-gradient(90deg, #667eea, #764ba2)', borderRadius: '4px',
              transition: 'width 0.5s ease'
            }} />
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#718096', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
          <span>🎯 Goal: {currencySymbol}{formatAmount(group.goal_amount)}</span>
          <span>👥 {members.length || 0} members</span>
          <span>📅 {group.deadline ? new Date(group.deadline).toLocaleDateString() : 'No deadline'}</span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{ display: 'flex', borderBottom: '2px solid #e2e8f0', marginBottom: '16px', overflowX: 'auto' }}>
        {tabs.filter(tab => tab.show).map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            padding: '10px 16px', border: 'none', background: 'none',
            borderBottom: activeTab === tab.id ? '3px solid #667eea' : '3px solid transparent',
            color: activeTab === tab.id ? '#667eea' : '#718096',
            fontWeight: '600', fontSize: '13px', cursor: 'pointer', whiteSpace: 'nowrap',
            display: 'flex', alignItems: 'center', gap: '5px'
          }}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div id="tab-content" style={{
        background: 'white', borderRadius: '12px', padding: '20px',
        minHeight: '250px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
      }}>

        {/* ==================== OVERVIEW TAB ==================== */}
        {activeTab === 'overview' && (
          <div>
            <h3 style={{ marginBottom: '12px', color: '#2d3748', fontSize: '16px' }}>📊 Group Overview</h3>
            <p style={{ color: '#718096', fontSize: '14px' }}>{group.description || 'Welcome to this group!'}</p>
            {pledges.length > 0 && (
              <div style={{ marginTop: '16px' }}>
                <h4 style={{ marginBottom: '10px', color: '#4a5568', fontSize: '14px' }}>Recent Pledges</h4>
                {pledges.slice(0, 3).map(pledge => (
                  <div key={pledge.id} style={{
                    display: 'flex', justifyContent: 'space-between', padding: '10px',
                    background: '#f7fafc', borderRadius: '8px', marginBottom: '6px', fontSize: '13px'
                  }}>
                    <span>{pledge.is_anonymous ? 'John Doe' : `${pledge.first_name} ${pledge.last_name}`}</span>
                    <span style={{ fontWeight: '600', color: '#48bb78' }}>{currencySymbol}{formatAmount(pledge.amount)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ==================== PLEDGES TAB ==================== */}
        {activeTab === 'pledges' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
              <h3 style={{ margin: 0, color: '#2d3748', fontSize: '16px' }}>💰 All Pledges ({pledges.length})</h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                {isAdmin && (
                  <button onClick={() => { setOfflineDonationForm({ donorName: '', amount: '', notes: '', date: new Date().toISOString().split('T')[0], type: 'payment', isAnonymous: false, fulfillmentDate: '' }); setShowOfflineDonationModal(true); }}
                    style={{ fontSize: '12px', padding: '7px 12px', background: '#ed8936', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}>
                    💵 Offshore Donations
                  </button>
                )}
                <button onClick={handleMakePledge} className="btn btn-primary" style={{ fontSize: '13px', padding: '8px 14px' }}>
                  + New Pledge
                </button>
              </div>
            </div>
            {pledges.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px', color: '#a0aec0' }}>
                <div style={{ fontSize: '40px', marginBottom: '10px' }}>💰</div>
                <p>No pledges yet</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {pledges.map(pledge => {
                  const isMyPledge = pledge.user_id === currentUser.id;
                  const remaining = parseFloat(pledge.amount) - parseFloat(pledge.amount_paid || 0);
                  return (
                    <div key={pledge.id} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '12px', background: '#f7fafc', borderRadius: '10px',
                      borderLeft: `4px solid ${pledge.status === 'paid' ? '#48bb78' : pledge.status === 'partial' ? '#ed8936' : '#e53e3e'}`,
                      flexWrap: 'wrap', gap: '10px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '36px', height: '36px', borderRadius: '50%',
                          background: pledge.is_anonymous ? '#a0aec0' : '#667eea',
                          color: 'white', display: 'flex', alignItems: 'center',
                          justifyContent: 'center', fontWeight: 'bold', fontSize: '14px'
                        }}>
                          {pledge.is_anonymous ? '?' : (pledge.first_name?.charAt(0) || '?')}
                        </div>
                        <div>
                          <p style={{ fontWeight: '600', color: '#2d3748', margin: 0, fontSize: '13px' }}>
                            {pledge.is_anonymous ? 'John Doe' : `${pledge.first_name} ${pledge.last_name}`}
                            {isMyPledge && <span style={{ color: '#667eea', fontSize: '11px' }}> (you)</span>}
                          </p>
                          <p style={{ fontSize: '11px', color: '#a0aec0', margin: 0 }}>{formatTimeAgo(pledge.created_at)}</p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ fontWeight: 'bold', color: '#2d3748', margin: 0, fontSize: '14px' }}>{currencySymbol}{formatAmount(pledge.amount)}</p>
                          <p style={{ fontSize: '11px', color: '#48bb78', margin: 0 }}>Paid: {currencySymbol}{formatAmount(pledge.amount_paid || 0)}</p>
                        </div>
                        <span style={{
                          padding: '3px 10px', borderRadius: '10px', fontSize: '11px', fontWeight: '600',
                          background: pledge.status === 'paid' ? '#c6f6d5' : pledge.status === 'partial' ? '#feebc8' : '#fed7d7',
                          color: pledge.status === 'paid' ? '#276749' : pledge.status === 'partial' ? '#c05621' : '#c53030'
                        }}>
                          {pledge.status}
                        </span>
                        {/* Revise Pledge button for own pledges */}
                        {isMyPledge && pledge.status !== 'paid' && (
                          <button onClick={() => openRevisePledge(pledge)} style={{
                            padding: '5px 10px', background: '#667eea', color: 'white',
                            border: 'none', borderRadius: '6px', fontSize: '11px', cursor: 'pointer'
                          }}>✏️ Revise Pledge</button>
                        )}
                        {isMyPledge && remaining > 0 && (
                          <PaymentButton pledge={pledge} group={group} onPaymentComplete={loadGroupData} variant="small" />
                        )}
                        {/* Admin: Part Payment */}
                        {isAdmin && pledge.status !== 'paid' && (
                          <button onClick={() => { setSelectedPledge(pledge); setPartPaymentForm({ amount: '' }); setShowPartPaymentModal(true); }} style={{
                            padding: '5px 10px', background: '#ed8936', color: 'white',
                            border: 'none', borderRadius: '6px', fontSize: '11px', cursor: 'pointer'
                          }}>💵 Part Payment</button>
                        )}
                        {isAdmin && pledge.status !== 'paid' && (
                          <button onClick={() => handleMarkPaid(pledge.id)} style={{
                            padding: '5px 10px', background: '#48bb78', color: 'white',
                            border: 'none', borderRadius: '6px', fontSize: '11px', cursor: 'pointer'
                          }}>✓ Mark Paid</button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ==================== MEMBERS TAB ==================== */}
        {activeTab === 'members' && (
          <div>
            <h3 style={{ marginBottom: '14px', color: '#2d3748', fontSize: '16px' }}>👥 Members ({members.length})</h3>
            {members.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px', color: '#a0aec0' }}>
                <div style={{ fontSize: '40px', marginBottom: '10px' }}>👥</div>
                <p>No members data</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '10px' }}>
                {members.map((member, idx) => (
                  <div key={member.id || idx} style={{ padding: '14px', background: '#f7fafc', borderRadius: '10px', textAlign: 'center', position: 'relative' }}>
                    <div style={{
                      width: '44px', height: '44px', borderRadius: '50%',
                      background: member.role === 'admin' ? '#9f7aea' : '#667eea',
                      color: 'white', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontWeight: 'bold', fontSize: '16px', margin: '0 auto 8px'
                    }}>
                      {member.first_name?.charAt(0) || '?'}
                    </div>
                    <p style={{ fontWeight: '600', color: '#2d3748', margin: '0 0 4px', fontSize: '13px' }}>
                      {member.first_name} {member.last_name}
                    </p>
                    <span style={{
                      padding: '2px 8px', borderRadius: '8px', fontSize: '10px', fontWeight: '600',
                      background: member.role === 'admin' ? '#9f7aea' : '#e2e8f0',
                      color: member.role === 'admin' ? 'white' : '#4a5568'
                    }}>
                      {member.role || 'member'}
                    </span>
                    {isAdmin && member.user_id !== currentUser.id && member.role !== 'admin' && (
                      <button onClick={() => handleRemoveMember(member.user_id)} style={{
                        position: 'absolute', top: '6px', right: '6px', background: '#fed7d7',
                        border: 'none', borderRadius: '50%', width: '22px', height: '22px',
                        fontSize: '11px', cursor: 'pointer', color: '#e53e3e'
                      }}>×</button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ==================== ACTIVITY TAB ==================== */}
        {activeTab === 'activity' && (
          <div>
            <h3 style={{ marginBottom: '14px', color: '#2d3748', fontSize: '16px' }}>📈 Activity Feed</h3>
            {activities.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px', color: '#a0aec0' }}>
                <div style={{ fontSize: '40px', marginBottom: '10px' }}>📭</div>
                <p>No recent activity</p>
                <p style={{ fontSize: '12px' }}>Activities will appear here as members make pledges, payments, and more.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {activities.map((activity, idx) => (
                  <div key={activity.id || idx} style={{
                    display: 'flex', gap: '12px', padding: '12px',
                    background: '#f7fafc', borderRadius: '10px', alignItems: 'flex-start'
                  }}>
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '50%', background: '#ebf8ff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0
                    }}>
                      {getActivityIcon(activity.activity_type)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontSize: '13px', color: '#2d3748', fontWeight: '500' }}>
                        {activity.description || activity.activity_type?.replace(/_/g, ' ') || 'Activity'}
                      </p>
                      {activity.amount && (
                        <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#48bb78', fontWeight: '600' }}>
                          {currencySymbol}{formatAmount(activity.amount)}
                        </p>
                      )}
                      <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#a0aec0' }}>
                        {formatTimeAgo(activity.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ==================== RECURRING TAB ==================== */}
        {activeTab === 'recurring' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ margin: 0, color: '#2d3748', fontSize: '16px' }}>🔄 Recurring Pledges</h3>
              <button onClick={handleSetupRecurring} className="btn btn-primary" style={{ fontSize: '13px', padding: '8px 14px' }}>
                + Set Up Recurring
              </button>
            </div>
            {recurringPledges.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px', color: '#a0aec0' }}>
                <div style={{ fontSize: '40px', marginBottom: '10px' }}>🔄</div>
                <p>No recurring pledges</p>
                <p style={{ fontSize: '12px' }}>Set up automatic recurring pledges to contribute regularly.</p>
                <button onClick={handleSetupRecurring} className="btn btn-primary" style={{ marginTop: '10px', fontSize: '13px' }}>
                  + Set Up Recurring
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {recurringPledges.map((rp, idx) => (
                  <div key={rp.id || idx} style={{
                    padding: '14px', background: '#f7fafc', borderRadius: '10px',
                    borderLeft: `4px solid ${rp.status === 'active' ? '#48bb78' : '#a0aec0'}`
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <p style={{ margin: 0, fontWeight: '600', color: '#2d3748', fontSize: '14px' }}>
                          {currencySymbol}{formatAmount(rp.amount)} / {rp.frequency}
                        </p>
                        <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#718096' }}>
                          Next: {rp.next_date ? new Date(rp.next_date).toLocaleDateString() : 'Pending'}
                        </p>
                      </div>
                      <span style={{
                        padding: '3px 10px', borderRadius: '10px', fontSize: '11px', fontWeight: '600',
                        background: rp.status === 'active' ? '#c6f6d5' : '#e2e8f0',
                        color: rp.status === 'active' ? '#276749' : '#718096'
                      }}>
                        {rp.status || 'active'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ==================== AUDIT TAB ==================== */}
        {activeTab === 'audit' && isAdmin && (
          <div>
            <h3 style={{ marginBottom: '14px', color: '#2d3748', fontSize: '16px' }}>📋 Audit Trail</h3>
            {auditLogs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px', color: '#a0aec0' }}>
                <div style={{ fontSize: '40px', marginBottom: '10px' }}>📋</div>
                <p>No audit logs yet</p>
                <p style={{ fontSize: '12px' }}>All group actions (pledges, payments, member changes) are tracked here.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {auditLogs.map((log, idx) => (
                  <div key={log.id || idx} style={{
                    padding: '10px 14px', background: '#f7fafc', borderRadius: '8px',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px'
                  }}>
                    <div>
                      <span style={{ fontWeight: '600', color: '#2d3748' }}>{log.action || log.activity_type}</span>
                      {log.user_name && <span style={{ color: '#718096' }}> by {log.user_name}</span>}
                    </div>
                    <span style={{ color: '#a0aec0', fontSize: '11px' }}>{formatTimeAgo(log.created_at)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ==================== ADMIN TAB ==================== */}
        {activeTab === 'admin' && isAdmin && (
          <div>
            <h3 style={{ marginBottom: '14px', color: '#2d3748', fontSize: '16px' }}>⚙️ Admin Settings</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button onClick={handleEditGroup} className="btn" style={{ background: '#4299e1', color: 'white', padding: '12px', textAlign: 'left', border: 'none', borderRadius: '8px', fontSize: '14px', cursor: 'pointer' }}>
                ✏️ Edit Group Details
              </button>
              <button onClick={() => setActiveTab('members')} className="btn" style={{ background: '#9f7aea', color: 'white', padding: '12px', textAlign: 'left', border: 'none', borderRadius: '8px', fontSize: '14px', cursor: 'pointer' }}>
                👥 Manage Members
              </button>
              <button onClick={handleCreateSubGoal} className="btn" style={{ background: '#ed8936', color: 'white', padding: '12px', textAlign: 'left', border: 'none', borderRadius: '8px', fontSize: '14px', cursor: 'pointer' }}>
                🎯 Manage Sub-Goals
              </button>
              <button onClick={() => setShowDeleteConfirm(true)} className="btn" style={{ background: '#e53e3e', color: 'white', padding: '12px', textAlign: 'left', border: 'none', borderRadius: '8px', fontSize: '14px', cursor: 'pointer' }}>
                🗑️ Delete Group
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ==================== ALL MODALS ==================== */}

      {/* Make Pledge Modal */}
      <Modal isOpen={showPledgeModal} onClose={() => setShowPledgeModal(false)} title="Make a Pledge">
        <FormField label="Currency">
          <select style={selectStyle}
            value={pledgeForm.currency} onChange={e => setPledgeForm({ ...pledgeForm, currency: e.target.value })}>
            {allCurrencies.map(c => (
              <option key={c.code} value={c.code}>{c.flag} {c.code} - {c.name} ({c.symbol})</option>
            ))}
          </select>
        </FormField>
        <FormField label="Pledge Amount" required>
          <input type="number" style={inputStyle} placeholder="Enter amount" min="0" step="0.01"
            value={pledgeForm.amount} onChange={e => setPledgeForm({ ...pledgeForm, amount: e.target.value })} />
        </FormField>
        {/* Auto-conversion display when pledge currency differs from group currency */}
        {pledgeForm.currency && pledgeForm.currency !== (group?.currency || 'USD') && pledgeForm.amount && parseFloat(pledgeForm.amount) > 0 && (
          <div style={{
            padding: '12px', background: 'linear-gradient(135deg, #ebf8ff 0%, #e9d8fd 100%)',
            borderRadius: '10px', marginBottom: '16px', border: '1px solid #bee3f8'
          }}>
            <p style={{ margin: '0 0 4px', fontSize: '11px', fontWeight: '700', color: '#667eea', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Estimated Equivalent
            </p>
            <p style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#2d3748' }}>
              {convertCurrency(parseFloat(pledgeForm.amount), pledgeForm.currency, group?.currency || 'USD').display}
            </p>
            <p style={{ margin: '4px 0 0', fontSize: '10px', color: '#718096' }}>
              in group currency ({group?.currency || 'USD'}) &bull; Rates are approximate
            </p>
          </div>
        )}
        <FormField label="Proposed Fulfillment Date (optional)">
          <input type="date" style={inputStyle}
            value={pledgeForm.fulfillmentDate} onChange={e => setPledgeForm({ ...pledgeForm, fulfillmentDate: e.target.value })} />
        </FormField>
        <FormField label="Reminder / Notification Frequency (optional)">
          <select style={selectStyle}
            value={pledgeForm.reminderFrequency} onChange={e => setPledgeForm({ ...pledgeForm, reminderFrequency: e.target.value })}>
            <option value="none">No reminders</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="biweekly">Bi-Weekly</option>
            <option value="triweekly">Tri-Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </FormField>
        <FormField label="">
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
            <input type="checkbox" checked={pledgeForm.isAnonymous}
              onChange={e => setPledgeForm({ ...pledgeForm, isAnonymous: e.target.checked })} />
            Make this pledge anonymous (shown as "John Doe" on activity boards)
          </label>
        </FormField>
        <button onClick={submitPledge} disabled={formLoading} style={{ ...btnPrimary, opacity: formLoading ? 0.7 : 1 }}>
          {formLoading ? 'Creating...' : '💰 Submit Pledge'}
        </button>
      </Modal>

      {/* Revise Pledge Modal */}
      <Modal isOpen={showRevisePledgeModal} onClose={() => setShowRevisePledgeModal(false)} title="Revise Your Pledge">
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-16px', marginBottom: '12px' }}>
          <button onClick={handleCancelPledge} disabled={formLoading} style={{
            padding: '6px 14px', background: '#fed7d7', color: '#c53030', border: 'none',
            borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer'
          }}>
            ❌ Cancel Pledge
          </button>
        </div>
        <FormField label="Revised Amount" required>
          <input type="number" style={inputStyle} placeholder="Enter new amount" min="0" step="0.01"
            value={revisePledgeForm.amount} onChange={e => setRevisePledgeForm({ ...revisePledgeForm, amount: e.target.value })} />
        </FormField>
        <FormField label="Notes">
          <textarea style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }} placeholder="Reason for revision..."
            value={revisePledgeForm.notes} onChange={e => setRevisePledgeForm({ ...revisePledgeForm, notes: e.target.value })} />
        </FormField>
        <button onClick={submitRevisePledge} disabled={formLoading} style={{ ...btnPrimary, opacity: formLoading ? 0.7 : 1 }}>
          {formLoading ? 'Updating...' : '✏️ Revise Pledge'}
        </button>
      </Modal>

      {/* Part Payment Modal (Admin) */}
      <Modal isOpen={showPartPaymentModal} onClose={() => setShowPartPaymentModal(false)} title="Record Part Payment">
        {selectedPledge && (
          <div style={{ padding: '12px', background: '#f7fafc', borderRadius: '8px', marginBottom: '16px', fontSize: '13px' }}>
            <p style={{ margin: 0 }}>Pledge: <strong>{currencySymbol}{formatAmount(selectedPledge.amount)}</strong></p>
            <p style={{ margin: '4px 0 0' }}>Already paid: <strong>{currencySymbol}{formatAmount(selectedPledge.amount_paid || 0)}</strong></p>
            <p style={{ margin: '4px 0 0', color: '#e53e3e' }}>
              Remaining: <strong>{currencySymbol}{formatAmount(parseFloat(selectedPledge.amount) - parseFloat(selectedPledge.amount_paid || 0))}</strong>
            </p>
          </div>
        )}
        <FormField label="Payment Amount" required>
          <input type="number" style={inputStyle} placeholder="Enter payment amount" min="0" step="0.01"
            value={partPaymentForm.amount} onChange={e => setPartPaymentForm({ amount: e.target.value })} />
        </FormField>
        <button onClick={handlePartPayment} disabled={formLoading} style={{ ...btnPrimary, background: '#ed8936', opacity: formLoading ? 0.7 : 1 }}>
          {formLoading ? 'Recording...' : '💵 Record Part Payment'}
        </button>
      </Modal>

      {/* Edit Group Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Group Details">
        <FormField label="Group Name" required>
          <input type="text" style={inputStyle} value={editForm.name}
            onChange={e => setEditForm({ ...editForm, name: e.target.value })} />
        </FormField>
        <FormField label="Description">
          <textarea style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }} value={editForm.description}
            onChange={e => setEditForm({ ...editForm, description: e.target.value })} />
        </FormField>
        <FormField label="Goal Amount">
          <input type="number" style={inputStyle} value={editForm.goalAmount}
            onChange={e => setEditForm({ ...editForm, goalAmount: e.target.value })} />
        </FormField>
        <FormField label="Deadline">
          <input type="date" style={inputStyle} value={editForm.deadline}
            onChange={e => setEditForm({ ...editForm, deadline: e.target.value })} />
        </FormField>
        <FormField label="Currency">
          <select style={selectStyle} value={editForm.currency}
            onChange={e => setEditForm({ ...editForm, currency: e.target.value })}>
            {allCurrencies.map(c => (
              <option key={c.code} value={c.code}>{c.flag} {c.code} - {c.name}</option>
            ))}
          </select>
        </FormField>
        <button onClick={submitEditGroup} disabled={formLoading} style={{ ...btnPrimary, opacity: formLoading ? 0.7 : 1 }}>
          {formLoading ? 'Saving...' : '💾 Save Changes'}
        </button>
        {isAdmin && (
          <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '2px solid #fed7d7' }}>
            <p style={{ fontSize: '12px', color: '#e53e3e', marginBottom: '10px', fontWeight: '600' }}>⚠️ Danger Zone</p>
            <button onClick={() => { setShowEditModal(false); setShowDeleteConfirm(true); }} style={{
              width: '100%', padding: '12px', background: '#fff5f5', color: '#e53e3e',
              border: '2px solid #fed7d7', borderRadius: '8px', fontSize: '14px',
              fontWeight: '600', cursor: 'pointer'
            }}>
              🗑️ Delete This Group
            </button>
          </div>
        )}
      </Modal>

      {/* Enhanced Invite Modal */}
      <Modal isOpen={showInviteModal} onClose={() => setShowInviteModal(false)} title="👥 Invite Members" width="520px">
        
        {!inviteGenerated ? (
          <div style={{ textAlign: 'center', padding: '30px 0' }}>
            <div className="spinner" style={{ margin: '0 auto 12px' }}></div>
            <p style={{ color: '#718096', fontSize: '13px' }}>Generating invite link...</p>
          </div>
        ) : (
          <>
            {/* TOP: WhatsApp + QR Code buttons side by side */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
              <button onClick={() => {
                const whatsappMsg = encodeURIComponent(inviteMessage + '\n\n' + inviteLink);
                window.open('https://wa.me/?text=' + whatsappMsg, '_blank');
              }} style={{
                flex: 1, padding: '14px', background: '#25D366', color: 'white', border: 'none',
                borderRadius: '10px', fontSize: '15px', fontWeight: '700', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
              }}>
                💬 WhatsApp
              </button>
              <button onClick={() => setInviteTab(inviteTab === 'qrcode' ? '' : 'qrcode')} style={{
                flex: 1, padding: '14px', background: '#2d3748', color: 'white', border: 'none',
                borderRadius: '10px', fontSize: '15px', fontWeight: '700', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
              }}>
                📱 QR Code
              </button>
            </div>

            {/* QR Code display (toggles on click) */}
            {inviteTab === 'qrcode' && (
              <div style={{
                textAlign: 'center', padding: '20px', marginBottom: '16px',
                background: '#f7fafc', borderRadius: '12px', border: '1px solid #e2e8f0'
              }}>
                <div style={{
                  padding: '20px', background: 'white', borderRadius: '12px',
                  display: 'inline-block', boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                  border: '2px solid #667eea'
                }}>
                  <img src={qrCodeUrl} alt="QR Code" style={{ width: '200px', height: '200px', display: 'block' }} />
                </div>
                <p style={{ margin: '12px 0 0', fontSize: '13px', color: '#667eea', fontWeight: '700' }}>
                  Scan to join "{group?.name}"
                </p>
                <button onClick={() => {
                  const link = document.createElement('a');
                  link.href = qrCodeUrl;
                  link.download = (group?.name || 'group') + '-qr-invite.png';
                  link.click();
                }} style={{
                  marginTop: '10px', padding: '8px 20px', background: '#667eea', color: 'white',
                  border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer'
                }}>
                  📥 Download QR Image
                </button>
              </div>
            )}

            {/* Personalized Invite Message Preview */}
            <div style={{
              padding: '14px', background: 'linear-gradient(135deg, #ebf8ff 0%, #faf5ff 100%)',
              borderRadius: '10px', marginBottom: '16px', border: '1px solid #e2e8f0'
            }}>
              <p style={{ margin: '0 0 6px', fontSize: '11px', fontWeight: '700', color: '#667eea', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                📨 Invite Message Preview
              </p>
              <textarea
                value={inviteMessage}
                onChange={e => setInviteMessage(e.target.value)}
                style={{
                  width: '100%', border: 'none', background: 'transparent', fontSize: '13px',
                  color: '#2d3748', lineHeight: '1.6', resize: 'vertical', minHeight: '65px',
                  outline: 'none', boxSizing: 'border-box', fontStyle: 'italic'
                }}
              />
            </div>

            {/* Copy Link Button + Invite Link */}
            <div style={{ marginBottom: '16px' }}>
              <button onClick={() => {
                navigator.clipboard.writeText(inviteMessage + '\n\n' + inviteLink);
                alert('Invite message + link copied to clipboard!');
              }} style={{
                width: '100%', padding: '12px', background: '#9f7aea', color: 'white', border: 'none',
                borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: 'pointer',
                marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
              }}>
                📋 Copy Invite Message + Link
              </button>
              <div style={{
                padding: '10px 14px', background: '#f7fafc', borderRadius: '8px',
                border: '1px solid #e2e8f0', wordBreak: 'break-all'
              }}>
                <p style={{ margin: '0 0 4px', fontSize: '10px', fontWeight: '700', color: '#a0aec0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Invite Link
                </p>
                <p style={{ margin: 0, fontSize: '12px', color: '#4a5568' }}>{inviteLink}</p>
              </div>
            </div>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }}></div>
              <span style={{ fontSize: '11px', color: '#a0aec0', fontWeight: '600' }}>OR INVITE VIA EMAIL</span>
              <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }}></div>
            </div>

            {/* Email Section at Bottom */}
            <div style={{
              padding: '16px', background: '#f7fafc', borderRadius: '10px', border: '1px solid #e2e8f0'
            }}>
              <FormField label="Email Addresses (one per line or comma-separated)">
                <textarea style={{ ...inputStyle, minHeight: '70px', resize: 'vertical', background: 'white' }}
                  placeholder={"john@example.com\njane@example.com"}
                  value={inviteEmails} onChange={e => setInviteEmails(e.target.value)} />
              </FormField>
              <button onClick={async () => {
                const emails = inviteEmails.split(/[,\n]/).map(e => e.trim()).filter(Boolean);
                if (emails.length === 0) { alert('Please enter at least one email'); return; }
                setFormLoading(true);
                try {
                  await groupAPI.invite(id, { emails });
                  setInviteEmails('');
                  alert(`${emails.length} email invitation(s) sent successfully!`);
                } catch (err) {
                  alert('Failed to send: ' + (err.response?.data?.message || err.message));
                } finally { setFormLoading(false); }
              }} disabled={formLoading} style={{
                width: '100%', padding: '10px', background: '#4299e1', color: 'white', border: 'none',
                borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                opacity: formLoading ? 0.7 : 1
              }}>
                {formLoading ? 'Sending...' : '📧 Send Email Invitations'}
              </button>
            </div>
          </>
        )}
      </Modal>

      {/* Recurring Pledge Modal */}
      <Modal isOpen={showRecurringModal} onClose={() => setShowRecurringModal(false)} title="Set Up Recurring Pledge">
        <FormField label="Amount per Period" required>
          <input type="number" style={inputStyle} placeholder="Enter amount" min="0" step="0.01"
            value={recurringForm.amount} onChange={e => setRecurringForm({ ...recurringForm, amount: e.target.value })} />
        </FormField>
        <FormField label="Frequency" required>
          <select style={selectStyle} value={recurringForm.frequency}
            onChange={e => setRecurringForm({ ...recurringForm, frequency: e.target.value })}>
            <option value="weekly">Weekly</option>
            <option value="biweekly">Bi-Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
          </select>
        </FormField>
        <FormField label="Start Date">
          <input type="date" style={inputStyle} value={recurringForm.startDate}
            onChange={e => setRecurringForm({ ...recurringForm, startDate: e.target.value })} />
        </FormField>
        <FormField label="End Date (optional)">
          <input type="date" style={inputStyle} value={recurringForm.endDate}
            onChange={e => setRecurringForm({ ...recurringForm, endDate: e.target.value })} />
        </FormField>
        <button onClick={submitRecurring} disabled={formLoading} style={{ ...btnPrimary, opacity: formLoading ? 0.7 : 1 }}>
          {formLoading ? 'Creating...' : '🔄 Start Recurring Pledge'}
        </button>
      </Modal>

      {/* Sub-Goal Modal */}
      <Modal isOpen={showSubGoalModal} onClose={() => setShowSubGoalModal(false)} title="Create Sub-Goal">
        <FormField label="Sub-Goal Name" required>
          <input type="text" style={inputStyle} placeholder="e.g., Phase 1 Funding"
            value={subGoalForm.name} onChange={e => setSubGoalForm({ ...subGoalForm, name: e.target.value })} />
        </FormField>
        <FormField label="Target Amount" required>
          <input type="number" style={inputStyle} placeholder="Enter target amount" min="0" step="0.01"
            value={subGoalForm.targetAmount} onChange={e => setSubGoalForm({ ...subGoalForm, targetAmount: e.target.value })} />
        </FormField>
        <FormField label="Description">
          <textarea style={{ ...inputStyle, minHeight: '60px', resize: 'vertical' }} placeholder="Describe this milestone..."
            value={subGoalForm.description} onChange={e => setSubGoalForm({ ...subGoalForm, description: e.target.value })} />
        </FormField>
        <button onClick={submitSubGoal} disabled={formLoading} style={{ ...btnPrimary, background: '#ed8936', opacity: formLoading ? 0.7 : 1 }}>
          {formLoading ? 'Creating...' : '🎯 Create Sub-Goal'}
        </button>
      </Modal>

      {/* Message Modal */}
      <Modal isOpen={showMessageModal} onClose={() => setShowMessageModal(false)} title="Send Message">
        <FormField label="To" required>
          <select style={selectStyle} value={messageForm.recipientId}
            onChange={e => setMessageForm({ ...messageForm, recipientId: e.target.value })}>
            <option value="">Select a member...</option>
            {members.filter(m => m.user_id !== currentUser.id).map(m => (
              <option key={m.user_id || m.id} value={m.user_id || m.id}>
                {m.first_name} {m.last_name}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Message" required>
          <textarea style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }} placeholder="Type your message..."
            value={messageForm.content} onChange={e => setMessageForm({ ...messageForm, content: e.target.value })} />
        </FormField>
        <button onClick={async () => {
          if (!messageForm.recipientId || !messageForm.content.trim()) {
            alert('Please select a recipient and type a message'); return;
          }
          setFormLoading(true);
          try {
            await messagesAPI.sendMessage(id, { recipientId: messageForm.recipientId, content: messageForm.content });
            setShowMessageModal(false);
            alert('Message sent!');
          } catch (err) {
            alert('Failed to send message: ' + (err.response?.data?.message || err.message));
          } finally { setFormLoading(false); }
        }} disabled={formLoading} style={{ ...btnPrimary, opacity: formLoading ? 0.7 : 1 }}>
          {formLoading ? 'Sending...' : '📨 Send Message'}
        </button>
      </Modal>

      {/* Offshore Donations Modal (Admin) */}
      <Modal isOpen={showOfflineDonationModal} onClose={() => setShowOfflineDonationModal(false)} title="Offshore Donations" width="500px">
        <div style={{ padding: '12px', background: '#fffbeb', borderRadius: '8px', marginBottom: '16px', border: '1px solid #fefcbf', fontSize: '12px', color: '#975a16' }}>
          <strong>Offshore:</strong> Record donations or pledges from non-platform sources (cash, bank transfer, mobile money, etc.)
        </div>
        <FormField label="What are you recording?" required>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => setOfflineDonationForm({ ...offlineDonationForm, type: 'payment' })} style={{ flex: 1, padding: '14px', border: '2px solid', borderColor: offlineDonationForm.type === 'payment' ? '#48bb78' : '#e2e8f0', background: offlineDonationForm.type === 'payment' ? '#f0fff4' : 'white', borderRadius: '10px', cursor: 'pointer', textAlign: 'center' }}>
              <div style={{ fontSize: '24px', marginBottom: '6px' }}>{'💰'}</div>
              <p style={{ margin: 0, fontWeight: '700', fontSize: '13px', color: offlineDonationForm.type === 'payment' ? '#276749' : '#4a5568' }}>Payment</p>
              <p style={{ margin: '4px 0 0', fontSize: '10px', color: '#718096' }}>Money already received</p>
            </button>
            <button onClick={() => setOfflineDonationForm({ ...offlineDonationForm, type: 'pledge' })} style={{ flex: 1, padding: '14px', border: '2px solid', borderColor: offlineDonationForm.type === 'pledge' ? '#667eea' : '#e2e8f0', background: offlineDonationForm.type === 'pledge' ? '#ebf8ff' : 'white', borderRadius: '10px', cursor: 'pointer', textAlign: 'center' }}>
              <div style={{ fontSize: '24px', marginBottom: '6px' }}>{'🤝'}</div>
              <p style={{ margin: 0, fontWeight: '700', fontSize: '13px', color: offlineDonationForm.type === 'pledge' ? '#2b6cb0' : '#4a5568' }}>Pledge</p>
              <p style={{ margin: '4px 0 0', fontSize: '10px', color: '#718096' }}>Promise to pay later</p>
            </button>
          </div>
        </FormField>
        <FormField label="Donor Name">
          <input type="text" style={{ ...inputStyle, opacity: offlineDonationForm.isAnonymous ? 0.5 : 1 }} placeholder="e.g., John Smith" disabled={offlineDonationForm.isAnonymous} value={offlineDonationForm.donorName} onChange={e => setOfflineDonationForm({ ...offlineDonationForm, donorName: e.target.value })} />
        </FormField>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: '#4a5568' }}>
            <input type="checkbox" checked={offlineDonationForm.isAnonymous} onChange={e => setOfflineDonationForm({ ...offlineDonationForm, isAnonymous: e.target.checked, donorName: e.target.checked ? '' : offlineDonationForm.donorName })} />
            Record as anonymous (shown as "John Doe")
          </label>
        </div>
        <FormField label="Amount" required>
          <div style={{ display: 'flex', gap: '8px' }}>
            <span style={{ padding: '10px 14px', background: '#f7fafc', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', fontWeight: '600', color: '#4a5568' }}>{currencySymbol}</span>
            <input type="number" style={{ ...inputStyle, flex: 1 }} placeholder="Enter amount" min="0" step="0.01" value={offlineDonationForm.amount} onChange={e => setOfflineDonationForm({ ...offlineDonationForm, amount: e.target.value })} />
          </div>
        </FormField>
        {offlineDonationForm.type === 'payment' && (
          <FormField label="Date Received">
            <input type="date" style={inputStyle} value={offlineDonationForm.date} onChange={e => setOfflineDonationForm({ ...offlineDonationForm, date: e.target.value })} />
          </FormField>
        )}
        {offlineDonationForm.type === 'pledge' && (
          <FormField label="Expected Payment Date (optional)">
            <input type="date" style={inputStyle} value={offlineDonationForm.fulfillmentDate} onChange={e => setOfflineDonationForm({ ...offlineDonationForm, fulfillmentDate: e.target.value })} />
          </FormField>
        )}
        <FormField label="Notes (optional)">
          <textarea style={{ ...inputStyle, minHeight: '50px', resize: 'vertical' }} placeholder={offlineDonationForm.type === 'payment' ? 'e.g., Cash received at Sunday meeting...' : 'e.g., Promised at fundraiser event...'} value={offlineDonationForm.notes} onChange={e => setOfflineDonationForm({ ...offlineDonationForm, notes: e.target.value })} />
        </FormField>
        <button onClick={handleOfflineDonation} disabled={formLoading} style={{ ...btnPrimary, background: offlineDonationForm.type === 'payment' ? '#48bb78' : '#667eea', opacity: formLoading ? 0.7 : 1 }}>
          {formLoading ? 'Recording...' : offlineDonationForm.type === 'payment' ? 'Record Payment' : 'Record Pledge'}
        </button>
      </Modal>

      {/* Export Data / Generate Report Modal */}
      <Modal isOpen={showExportModal} onClose={() => setShowExportModal(false)} title="📊 Export Data & Reports" width="460px">
        <p style={{ color: '#718096', fontSize: '13px', marginBottom: '20px' }}>
          Choose your preferred export format for <strong>{group?.name}</strong> data.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* PDF Option */}
          <button onClick={exportAsPDF} style={{
            display: 'flex', alignItems: 'center', gap: '14px', padding: '16px',
            background: 'linear-gradient(135deg, #e53e3e 0%, #c53030 100%)', color: 'white',
            border: 'none', borderRadius: '12px', cursor: 'pointer', textAlign: 'left'
          }}>
            <div style={{
              width: '44px', height: '44px', background: 'rgba(255,255,255,0.2)',
              borderRadius: '10px', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: '22px', flexShrink: 0
            }}>📄</div>
            <div>
              <p style={{ margin: 0, fontWeight: '700', fontSize: '15px' }}>Export as PDF</p>
              <p style={{ margin: '3px 0 0', fontSize: '11px', opacity: 0.85 }}>
                Professional report with summary, progress bars, pledge table & member list
              </p>
            </div>
          </button>

          {/* CSV Option */}
          <button onClick={exportAsCSV} style={{
            display: 'flex', alignItems: 'center', gap: '14px', padding: '16px',
            background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)', color: 'white',
            border: 'none', borderRadius: '12px', cursor: 'pointer', textAlign: 'left'
          }}>
            <div style={{
              width: '44px', height: '44px', background: 'rgba(255,255,255,0.2)',
              borderRadius: '10px', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: '22px', flexShrink: 0
            }}>📊</div>
            <div>
              <p style={{ margin: 0, fontWeight: '700', fontSize: '15px' }}>Export as CSV</p>
              <p style={{ margin: '3px 0 0', fontSize: '11px', opacity: 0.85 }}>
                Spreadsheet-ready data file — open in Excel, Google Sheets, etc.
              </p>
            </div>
          </button>
        </div>

        <div style={{
          marginTop: '16px', padding: '12px', background: '#f7fafc',
          borderRadius: '8px', border: '1px solid #e2e8f0'
        }}>
          <p style={{ margin: 0, fontSize: '11px', color: '#718096' }}>
            📌 <strong>Tip:</strong> PDF includes a formatted report with visuals. CSV is best for data analysis and filtering.
          </p>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} title="⚠️ Delete Group" width="400px">
        <p style={{ color: '#e53e3e', fontSize: '14px', marginBottom: '16px' }}>
          Are you sure you want to delete <strong>{group.name}</strong>? This action cannot be undone.
          All pledges, members, and data will be permanently removed.
        </p>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => setShowDeleteConfirm(false)} style={{ ...btnSecondary, flex: 1 }}>Cancel</button>
          <button onClick={handleDeleteGroup} disabled={formLoading} style={{ ...btnDanger, flex: 1, opacity: formLoading ? 0.7 : 1 }}>
            {formLoading ? 'Deleting...' : '🗑️ Delete Forever'}
          </button>
        </div>
      </Modal>

      {/* Currency Converter Modal */}
      <Modal isOpen={showConverterModal} onClose={() => setShowConverterModal(false)} title="💱 Currency Converter" width="420px">
        <FormField label="Amount">
          <input type="number" style={inputStyle} placeholder="Enter amount" min="0" step="0.01"
            value={converterForm.amount} onChange={e => setConverterForm({ ...converterForm, amount: e.target.value })} />
        </FormField>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '10px', alignItems: 'end', marginBottom: '16px' }}>
          <FormField label="From">
            <select style={selectStyle} value={converterForm.fromCurrency}
              onChange={e => setConverterForm({ ...converterForm, fromCurrency: e.target.value })}>
              {allCurrencies.map(c => (
                <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
              ))}
            </select>
          </FormField>
          <button onClick={() => setConverterForm({ ...converterForm, fromCurrency: converterForm.toCurrency, toCurrency: converterForm.fromCurrency })}
            style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', marginBottom: '20px', color: '#667eea' }}>⇄</button>
          <FormField label="To">
            <select style={selectStyle} value={converterForm.toCurrency}
              onChange={e => setConverterForm({ ...converterForm, toCurrency: e.target.value })}>
              {allCurrencies.map(c => (
                <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
              ))}
            </select>
          </FormField>
        </div>
        {converterForm.amount && parseFloat(converterForm.amount) > 0 && (
          <div style={{
            padding: '20px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '12px', textAlign: 'center', color: 'white'
          }}>
            <p style={{ margin: '0 0 4px', fontSize: '12px', opacity: 0.8 }}>
              {getCurrencySymbol(converterForm.fromCurrency)} {parseFloat(converterForm.amount).toLocaleString()} {converterForm.fromCurrency} =
            </p>
            <p style={{ margin: 0, fontSize: '28px', fontWeight: '700' }}>
              {convertCurrency(parseFloat(converterForm.amount), converterForm.fromCurrency, converterForm.toCurrency).display}
            </p>
            <p style={{ margin: '8px 0 0', fontSize: '11px', opacity: 0.7 }}>Rates are approximate</p>
          </div>
        )}
      </Modal>

    </MainLayout>
  );
}

export default GroupDetails;
