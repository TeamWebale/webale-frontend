/**
 * SubscriptionModal.jsx — src/components/SubscriptionModal.jsx
 * Pops up when user tries to pledge without subscription (after 3 free pledges)
 * Offers payment options to subscribe: $3/quarter per group
 */
import { useState } from 'react';
import axios from 'axios';

const API = 'https://webale-api.onrender.com/api';
const headers = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' });

export default function SubscriptionModal({ isOpen, onClose, groupId, groupName, onSubscribed }) {
  const [step, setStep] = useState('info'); // info, phone, processing, success, failed
  const [provider, setProvider] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);

  if (!isOpen) return null;

  const handleSubscribe = async () => {
    if (provider === 'mtn_momo' || provider === 'airtel_money') {
      if (!phoneNumber || phoneNumber.length < 10) {
        setError('Please enter a valid phone number');
        return;
      }
    }

    setError('');
    setProcessing(true);

    try {
      // First initiate payment for subscription
      const payRes = await axios.post(`${API}/payments/initiate`, {
        groupId,
        amount: 3.00,
        currency: 'USD',
        provider,
        phoneNumber: phoneNumber || undefined,
      }, { headers: headers() });

      if (payRes.data.success) {
        // For sandbox testing, activate subscription immediately
        // In production, this would happen via webhook after payment confirmation
        const subRes = await axios.post(`${API}/subscriptions/subscribe`, {
          groupId,
          paymentId: payRes.data.data.paymentId,
        }, { headers: headers() });

        if (subRes.data.success) {
          setStep('success');
          if (onSubscribed) setTimeout(onSubscribed, 2000);
        } else {
          setStep('failed');
          setError(subRes.data.message || 'Failed to activate subscription');
        }
      } else {
        setStep('failed');
        setError(payRes.data.message || 'Payment failed');
      }
    } catch (err) {
      setStep('failed');
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div style={s.overlay} onClick={onClose}>
      <div style={s.modal} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={s.header}>
          <h3 style={s.title}>
            {step === 'success' ? '🎉 Subscribed!' : '🔒 Subscription Required'}
          </h3>
          <button onClick={onClose} style={s.closeBtn}>✕</button>
        </div>

        {/* Info step */}
        {step === 'info' && (
          <div style={s.body}>
            <div style={s.badge}>FREE TRIAL ENDED</div>
            <p style={s.desc}>
              You've used your <strong>3 free pledges</strong>. To continue making pledges and contributions in <strong>{groupName}</strong>, subscribe to unlock unlimited access.
            </p>

            <div style={s.priceCard}>
              <div style={s.priceTop}>
                <span style={s.priceAmount}>$1</span>
                <span style={s.pricePer}>/month</span>
              </div>
              <p style={s.priceBilled}>Billed quarterly — <strong>$3 per 90 days</strong></p>
              <div style={s.priceFeatures}>
                <p style={s.feature}>✓ Unlimited pledges in this group</p>
                <p style={s.feature}>✓ Make and fulfill contributions</p>
                <p style={s.feature}>✓ Full access to all group features</p>
                <p style={s.feature}>✓ Cancel anytime</p>
              </div>
            </div>

            <p style={s.methodLabel}>Choose payment method:</p>

            <div style={s.methods}>
              <button onClick={() => { setProvider('mtn_momo'); setStep('phone'); }} style={s.methodBtn}>
                <span style={s.methodIcon}>📱</span>
                <div>
                  <span style={s.methodName}>MTN Mobile Money</span>
                  <span style={s.methodDesc}>Pay with MTN MoMo</span>
                </div>
              </button>
              <button onClick={() => { setProvider('airtel_money'); setStep('phone'); }} style={s.methodBtn}>
                <span style={s.methodIcon}>📱</span>
                <div>
                  <span style={s.methodName}>Airtel Money</span>
                  <span style={s.methodDesc}>Pay with Airtel Money</span>
                </div>
              </button>
            </div>

            <p style={s.footnote}>
              Registration, group creation, joining groups, and messaging are always free.
            </p>
          </div>
        )}

        {/* Phone step */}
        {step === 'phone' && (
          <div style={s.body}>
            <p style={s.desc}>
              Enter your {provider === 'mtn_momo' ? 'MTN' : 'Airtel'} phone number to pay <strong>$3.00</strong> for 90 days access to <strong>{groupName}</strong>:
            </p>
            <input
              type="tel"
              value={phoneNumber}
              onChange={e => setPhoneNumber(e.target.value.replace(/[^0-9+]/g, ''))}
              placeholder="e.g. 256771234567"
              style={s.phoneInput}
              autoFocus
            />
            <p style={s.hint}>Include country code (e.g. 256 for Uganda)</p>
            {error && <p style={s.error}>{error}</p>}
            <div style={s.btnRow}>
              <button onClick={() => { setStep('info'); setError(''); }} style={s.backBtn}>← Back</button>
              <button onClick={handleSubscribe} disabled={processing} style={s.payBtn}>
                {processing ? 'Processing...' : 'Pay $3.00'}
              </button>
            </div>
          </div>
        )}

        {/* Success step */}
        {step === 'success' && (
          <div style={s.body}>
            <div style={s.resultWrap}>
              <div style={s.successIcon}>✓</div>
              <p style={s.resultTitle}>Subscription Active!</p>
              <p style={s.resultDesc}>
                You now have unlimited access to pledge and contribute in <strong>{groupName}</strong> for the next 90 days. Go make an impact!
              </p>
            </div>
          </div>
        )}

        {/* Failed step */}
        {step === 'failed' && (
          <div style={s.body}>
            <div style={s.resultWrap}>
              <div style={s.failIcon}>✕</div>
              <p style={s.resultTitle}>Payment Failed</p>
              <p style={s.resultDesc}>{error}</p>
              <button onClick={() => { setStep('info'); setError(''); }} style={s.retryBtn}>Try Again</button>
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
    background: 'white', borderRadius: '16px', width: '100%', maxWidth: '420px',
    maxHeight: '90vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
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
  body: { padding: '20px 24px' },
  badge: {
    display: 'inline-block', background: '#fff5f5', color: '#e53e3e', fontSize: '11px',
    fontWeight: 700, padding: '4px 12px', borderRadius: '12px', border: '1px solid #fed7d7',
    marginBottom: '12px', letterSpacing: '0.5px',
  },
  desc: { fontSize: '14px', color: '#4a5568', lineHeight: 1.6, margin: '0 0 16px' },
  priceCard: {
    background: 'linear-gradient(135deg, #1B2D4F, #4A7FC1)', borderRadius: '14px',
    padding: '20px', color: 'white', marginBottom: '16px', textAlign: 'center',
  },
  priceTop: { display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '2px' },
  priceAmount: { fontSize: '42px', fontWeight: 800 },
  pricePer: { fontSize: '16px', opacity: 0.8 },
  priceBilled: { fontSize: '13px', opacity: 0.7, margin: '4px 0 16px' },
  priceFeatures: { textAlign: 'left' },
  feature: { fontSize: '13px', margin: '4px 0', opacity: 0.9 },
  methodLabel: { fontSize: '14px', color: '#4a5568', fontWeight: 600, margin: '0 0 10px' },
  methods: { display: 'flex', flexDirection: 'column', gap: '8px' },
  methodBtn: {
    display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px',
    background: '#f7fafc', border: '2px solid #e2e8f0', borderRadius: '12px',
    cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s', width: '100%',
  },
  methodIcon: { fontSize: '22px' },
  methodName: { fontSize: '14px', fontWeight: 700, color: '#2d3748', display: 'block' },
  methodDesc: { fontSize: '11px', color: '#718096', display: 'block' },
  footnote: { fontSize: '11px', color: '#a0aec0', marginTop: '14px', textAlign: 'center', lineHeight: 1.5 },
  phoneInput: {
    width: '100%', padding: '12px 14px', fontSize: '16px', border: '2px solid #e2e8f0',
    borderRadius: '10px', outline: 'none', boxSizing: 'border-box', letterSpacing: '1px',
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
