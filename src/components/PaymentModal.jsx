/**
 * PaymentModal.jsx — src/components/PaymentModal.jsx
 * Mobile Money payment flow for fulfilling pledges
 * Phase 1: MTN MoMo + Airtel Money
 */
import { useState, useEffect } from 'react';
import axios from 'axios';

const API = 'https://webale-api.onrender.com/api';
const headers = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' });

export default function PaymentModal({ isOpen, onClose, pledge, group, onSuccess }) {
  const [step, setStep] = useState('select'); // select, phone, processing, success, failed
  const [provider, setProvider] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');
  const [paymentId, setPaymentId] = useState(null);
  const [pollCount, setPollCount] = useState(0);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep('select');
      setProvider('');
      setPhoneNumber('');
      setError('');
      setPaymentId(null);
      setPollCount(0);
    }
  }, [isOpen]);

  // Poll payment status
  useEffect(() => {
    if (step !== 'processing' || !paymentId) return;
    const interval = setInterval(async () => {
      try {
        const res = await axios.get(`${API}/payments/${paymentId}/status`, { headers: headers() });
        const status = res.data.data?.status;
        if (status === 'completed') {
          setStep('success');
          clearInterval(interval);
          if (onSuccess) setTimeout(onSuccess, 2000);
        } else if (status === 'failed') {
          setStep('failed');
          setError('Payment was not approved or failed. Please try again.');
          clearInterval(interval);
        }
      } catch {}
      setPollCount(c => {
        if (c >= 24) { // 2 minutes (24 * 5s)
          setStep('failed');
          setError('Payment timed out. If you approved it, it may still process. Check back shortly.');
          clearInterval(interval);
        }
        return c + 1;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [step, paymentId]);

  const handleInitiate = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      setError('Please enter a valid phone number');
      return;
    }
    setError('');
    setStep('processing');

    try {
      const res = await axios.post(`${API}/payments/initiate`, {
        groupId: group.id,
        pledgeId: pledge?.id || null,
        amount: parseFloat(pledge?.amount || pledge?.original_amount || 0),
        currency: group.currency || 'UGX',
        provider: provider,
        phoneNumber: phoneNumber,
      }, { headers: headers() });

      if (res.data.success) {
        setPaymentId(res.data.data.paymentId);
      } else {
        setStep('failed');
        setError(res.data.message || 'Failed to initiate payment');
      }
    } catch (err) {
      setStep('failed');
      setError(err.response?.data?.message || 'Failed to initiate payment. Please try again.');
    }
  };

  if (!isOpen) return null;

  const amount = parseFloat(pledge?.amount || pledge?.original_amount || 0);
  const currency = pledge?.pledge_currency || group?.currency || 'UGX';

  return (
    <div style={s.overlay} onClick={onClose}>
      <div style={s.modal} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={s.header}>
          <h3 style={s.title}>
            {step === 'success' ? '✅ Payment Successful' :
             step === 'failed' ? '❌ Payment Failed' :
             '💳 Make Payment'}
          </h3>
          <button onClick={onClose} style={s.closeBtn}>✕</button>
        </div>

        {/* Pledge info */}
        <div style={s.pledgeInfo}>
          <div style={s.pledgeRow}>
            <span style={s.pledgeLabel}>Amount</span>
            <span style={s.pledgeAmount}>{currency} {amount.toLocaleString()}</span>
          </div>
          <div style={s.pledgeRow}>
            <span style={s.pledgeLabel}>Group</span>
            <span style={s.pledgeValue}>{group?.name || 'Unknown'}</span>
          </div>
          {pledge?.donor_name && (
            <div style={s.pledgeRow}>
              <span style={s.pledgeLabel}>Pledged by</span>
              <span style={s.pledgeValue}>{pledge.donor_name}</span>
            </div>
          )}
        </div>

        {/* Step: Select provider */}
        {step === 'select' && (
          <div style={s.body}>
            <p style={s.stepLabel}>Select payment method:</p>
            <div style={s.providerGrid}>
              <button onClick={() => { setProvider('mtn_momo'); setStep('phone'); }} style={s.providerBtn}>
                <span style={{ fontSize: '24px' }}>📱</span>
                <span style={s.providerName}>MTN MoMo</span>
                <span style={s.providerDesc}>Pay with MTN Mobile Money</span>
              </button>
              <button onClick={() => { setProvider('airtel_money'); setStep('phone'); }} style={s.providerBtn}>
                <span style={{ fontSize: '24px' }}>📱</span>
                <span style={s.providerName}>Airtel Money</span>
                <span style={s.providerDesc}>Pay with Airtel Money</span>
              </button>
            </div>
          </div>
        )}

        {/* Step: Enter phone */}
        {step === 'phone' && (
          <div style={s.body}>
            <p style={s.stepLabel}>
              Enter your {provider === 'mtn_momo' ? 'MTN' : 'Airtel'} phone number:
            </p>
            <input
              type="tel"
              value={phoneNumber}
              onChange={e => setPhoneNumber(e.target.value.replace(/[^0-9+]/g, ''))}
              placeholder="e.g. 256771234567"
              style={s.phoneInput}
              autoFocus
            />
            <p style={s.hint}>Include country code (e.g. 256 for Uganda, 254 for Kenya)</p>
            {error && <p style={s.error}>{error}</p>}
            <div style={s.btnRow}>
              <button onClick={() => { setStep('select'); setError(''); }} style={s.backBtn}>← Back</button>
              <button onClick={handleInitiate} style={s.payBtn}>
                Pay {currency} {amount.toLocaleString()}
              </button>
            </div>
          </div>
        )}

        {/* Step: Processing */}
        {step === 'processing' && (
          <div style={s.body}>
            <div style={s.processingWrap}>
              <div style={s.spinner} />
              <p style={s.processingTitle}>Waiting for approval...</p>
              <p style={s.processingDesc}>
                A payment prompt has been sent to <strong>{phoneNumber}</strong>.
                Please check your phone and enter your PIN to approve the payment.
              </p>
              <p style={s.processingTimer}>
                Checking status... ({Math.floor(pollCount * 5)}s)
              </p>
            </div>
          </div>
        )}

        {/* Step: Success */}
        {step === 'success' && (
          <div style={s.body}>
            <div style={s.resultWrap}>
              <div style={s.successIcon}>✓</div>
              <p style={s.resultTitle}>Payment Received!</p>
              <p style={s.resultDesc}>
                {currency} {amount.toLocaleString()} has been received and credited to {group?.name}.
                Thank you for your contribution!
              </p>
            </div>
          </div>
        )}

        {/* Step: Failed */}
        {step === 'failed' && (
          <div style={s.body}>
            <div style={s.resultWrap}>
              <div style={s.failIcon}>✕</div>
              <p style={s.resultTitle}>Payment Not Completed</p>
              <p style={s.resultDesc}>{error || 'The payment could not be completed.'}</p>
              <button onClick={() => { setStep('select'); setError(''); setPollCount(0); }} style={s.retryBtn}>
                Try Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const s = {
  overlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center',
    justifyContent: 'center', zIndex: 1000, padding: '20px',
  },
  modal: {
    background: 'white', borderRadius: '16px', width: '100%', maxWidth: '440px',
    maxHeight: '85vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
  },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '18px 24px', borderBottom: '1px solid #e2e8f0',
  },
  title: { margin: 0, fontSize: '17px', color: '#2d3748', fontWeight: 700 },
  closeBtn: {
    background: '#fed7d7', border: 'none', fontSize: '14px', cursor: 'pointer',
    color: '#e53e3e', width: '28px', height: '28px', borderRadius: '6px',
    fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  pledgeInfo: {
    padding: '16px 24px', background: '#f7fafc', borderBottom: '1px solid #e2e8f0',
  },
  pledgeRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '4px 0',
  },
  pledgeLabel: { fontSize: '13px', color: '#718096' },
  pledgeAmount: { fontSize: '18px', fontWeight: 700, color: '#2d3748' },
  pledgeValue: { fontSize: '14px', fontWeight: 600, color: '#2d3748' },
  body: { padding: '20px 24px' },
  stepLabel: { fontSize: '14px', color: '#4a5568', fontWeight: 600, margin: '0 0 12px' },
  providerGrid: { display: 'flex', flexDirection: 'column', gap: '10px' },
  providerBtn: {
    display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px',
    background: '#f7fafc', border: '2px solid #e2e8f0', borderRadius: '12px',
    cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
  },
  providerName: { fontSize: '15px', fontWeight: 700, color: '#2d3748', display: 'block' },
  providerDesc: { fontSize: '12px', color: '#718096', display: 'block' },
  phoneInput: {
    width: '100%', padding: '12px 14px', fontSize: '16px', border: '2px solid #e2e8f0',
    borderRadius: '10px', outline: 'none', fontFamily: "'Segoe UI', sans-serif",
    boxSizing: 'border-box', letterSpacing: '1px',
  },
  hint: { fontSize: '12px', color: '#a0aec0', margin: '6px 0 0' },
  error: { fontSize: '13px', color: '#e53e3e', margin: '8px 0 0', fontWeight: 600 },
  btnRow: { display: 'flex', gap: '10px', marginTop: '16px' },
  backBtn: {
    padding: '10px 16px', background: '#f7fafc', border: '1px solid #e2e8f0',
    borderRadius: '10px', fontSize: '14px', color: '#4a5568', cursor: 'pointer',
  },
  payBtn: {
    flex: 1, padding: '12px', background: 'linear-gradient(135deg, #48bb78, #38a169)',
    color: 'white', border: 'none', borderRadius: '10px', fontSize: '15px',
    fontWeight: 700, cursor: 'pointer',
  },
  processingWrap: { textAlign: 'center', padding: '20px 0' },
  spinner: {
    width: '40px', height: '40px', border: '4px solid #e2e8f0',
    borderTopColor: '#667eea', borderRadius: '50%',
    animation: 'spin 1s linear infinite', margin: '0 auto 16px',
  },
  processingTitle: { fontSize: '16px', fontWeight: 700, color: '#2d3748', margin: '0 0 8px' },
  processingDesc: { fontSize: '14px', color: '#718096', lineHeight: 1.6, margin: '0 0 12px' },
  processingTimer: { fontSize: '12px', color: '#a0aec0' },
  resultWrap: { textAlign: 'center', padding: '20px 0' },
  successIcon: {
    width: '56px', height: '56px', borderRadius: '50%', background: '#f0fff4',
    border: '3px solid #48bb78', display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontSize: '24px', color: '#48bb78',
    margin: '0 auto 16px', fontWeight: 700,
  },
  failIcon: {
    width: '56px', height: '56px', borderRadius: '50%', background: '#fff5f5',
    border: '3px solid #e53e3e', display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontSize: '24px', color: '#e53e3e',
    margin: '0 auto 16px', fontWeight: 700,
  },
  resultTitle: { fontSize: '18px', fontWeight: 700, color: '#2d3748', margin: '0 0 8px' },
  resultDesc: { fontSize: '14px', color: '#718096', lineHeight: 1.6, margin: '0 0 16px' },
  retryBtn: {
    padding: '10px 24px', background: 'linear-gradient(135deg, #667eea, #764ba2)',
    color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px',
    fontWeight: 600, cursor: 'pointer',
  },
};
