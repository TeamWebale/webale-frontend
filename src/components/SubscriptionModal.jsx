/**
 * SubscriptionModal.jsx — src/components/SubscriptionModal.jsx
 * Paywall popup when user exhausts 3 free pledges
 * Uses user's profile country for local currency conversion
 */
import { useState, useEffect } from 'react';
import axios from 'axios';
import { convertCurrency, getCurrencySymbol } from '../utils/currencyConverter';

const API = 'https://webale-api.onrender.com/api';
const headers = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' });

// Map common countries to their currency codes
const COUNTRY_CURRENCY = {
  'Uganda': 'UGX', 'Kenya': 'KES', 'Tanzania': 'TZS', 'Rwanda': 'RWF',
  'Ghana': 'GHS', 'Nigeria': 'NGN', 'South Africa': 'ZAR', 'Cameroon': 'XAF',
  'Ethiopia': 'ETB', 'Zambia': 'ZMW', 'Malawi': 'MWK', 'Mozambique': 'MZN',
  'Zimbabwe': 'ZWL', 'Botswana': 'BWP', 'Namibia': 'NAD', 'Senegal': 'XOF',
  'DRC': 'CDF', 'Congo': 'CDF', 'Angola': 'AOA', 'Sudan': 'SDG',
  'Egypt': 'EGP', 'Morocco': 'MAD', 'Tunisia': 'TND', 'Algeria': 'DZD',
  'India': 'INR', 'Pakistan': 'PKR', 'Bangladesh': 'BDT', 'Sri Lanka': 'LKR',
  'Philippines': 'PHP', 'Indonesia': 'IDR', 'Malaysia': 'MYR', 'Thailand': 'THB',
  'Vietnam': 'VND', 'China': 'CNY', 'Japan': 'JPY', 'South Korea': 'KRW',
  'United Kingdom': 'GBP', 'UK': 'GBP', 'Germany': 'EUR', 'France': 'EUR',
  'Italy': 'EUR', 'Spain': 'EUR', 'Netherlands': 'EUR', 'Belgium': 'EUR',
  'Austria': 'EUR', 'Ireland': 'EUR', 'Portugal': 'EUR', 'Greece': 'EUR',
  'Sweden': 'SEK', 'Norway': 'NOK', 'Denmark': 'DKK', 'Poland': 'PLN',
  'Czech Republic': 'CZK', 'Hungary': 'HUF', 'Romania': 'RON',
  'Canada': 'CAD', 'Mexico': 'MXN', 'Brazil': 'BRL', 'Argentina': 'ARS',
  'Colombia': 'COP', 'Chile': 'CLP', 'Peru': 'PEN',
  'Australia': 'AUD', 'New Zealand': 'NZD',
  'UAE': 'AED', 'United Arab Emirates': 'AED', 'Saudi Arabia': 'SAR',
  'Israel': 'ILS', 'Turkey': 'TRY', 'Russia': 'RUB', 'Ukraine': 'UAH',
  'United States': 'USD', 'USA': 'USD',
};

function getUserCurrency() {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const country = user.country || '';
    // Try exact match first
    if (COUNTRY_CURRENCY[country]) return COUNTRY_CURRENCY[country];
    // Try partial match
    for (const [key, curr] of Object.entries(COUNTRY_CURRENCY)) {
      if (country.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(country.toLowerCase())) {
        return curr;
      }
    }
    return null;
  } catch { return null; }
}

export default function SubscriptionModal({ isOpen, onClose, groupId, groupName, onSubscribed }) {
  const [step, setStep] = useState('info');
  const [provider, setProvider] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);
  const [localAmount, setLocalAmount] = useState(null);
  const [localCurrency, setLocalCurrency] = useState('');
  const [localSymbol, setLocalSymbol] = useState('');

  useEffect(() => {
    if (isOpen) {
      setStep('info'); setProvider(''); setPhoneNumber(''); setError(''); setProcessing(false);
      const uc = getUserCurrency();
      if (uc && uc !== 'USD') {
        setLocalCurrency(uc);
        setLocalSymbol(getCurrencySymbol(uc));
        try {
          const converted = convertCurrency(3.00, 'USD', uc);
          const amt = typeof converted === 'number' ? converted : (converted?.converted ?? converted?.amount ?? null);
          if (amt && !isNaN(amt) && amt > 0) setLocalAmount(Math.ceil(amt));
          else setLocalAmount(null);
        } catch { setLocalAmount(null); }
      } else {
        setLocalCurrency(''); setLocalSymbol(''); setLocalAmount(null);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const localStr = localAmount && localCurrency ? ` (≈ ${localSymbol}${localAmount.toLocaleString()} ${localCurrency})` : '';

  const handleSubscribe = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      setError('Please enter a valid phone number'); return;
    }
    setError(''); setProcessing(true);
    try {
      const payRes = await axios.post(`${API}/payments/initiate`, {
        groupId, amount: 3.00, currency: 'USD', provider,
        phoneNumber: phoneNumber || undefined,
      }, { headers: headers() });

      if (payRes.data.success) {
        const subRes = await axios.post(`${API}/subscriptions/subscribe`, {
          groupId, paymentId: payRes.data.data.paymentId,
        }, { headers: headers() });
        if (subRes.data.success) {
          setStep('success');
          if (onSubscribed) setTimeout(onSubscribed, 2000);
        } else { setStep('failed'); setError(subRes.data.message || 'Failed to activate subscription'); }
      } else { setStep('failed'); setError(payRes.data.message || 'Payment failed'); }
    } catch (err) {
      setStep('failed'); setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally { setProcessing(false); }
  };

  const MtnIcon = () => (
    <div style={{ width: 40, height: 40, borderRadius: 10, background: '#FFCC00', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <span style={{ fontWeight: 900, fontSize: 11, color: '#003087', fontFamily: 'Arial, sans-serif', lineHeight: 1, textAlign: 'center' }}>MTN<br/><span style={{ fontSize: 7, fontWeight: 700 }}>MoMo</span></span>
    </div>
  );

  const AirtelIcon = () => (
    <div style={{ width: 40, height: 40, borderRadius: 10, background: '#ED1C24', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <span style={{ fontWeight: 900, fontSize: 10, color: 'white', fontFamily: 'Arial, sans-serif', lineHeight: 1, textAlign: 'center' }}>airtel<br/><span style={{ fontSize: 7 }}>money</span></span>
    </div>
  );

  return (
    <div style={s.overlay} onClick={onClose}>
      <div style={s.modal} onClick={e => e.stopPropagation()}>

        <div style={s.header}>
          <h3 style={s.title}>
            {step === 'success' ? '🎉 Subscribed!' : '🔓 Upgrade to Continue'}
          </h3>
          <button onClick={onClose} style={s.closeBtn}>✕</button>
        </div>

        {step === 'info' && (
          <div style={s.body}>
            <p style={s.mainMsg}>
              You have used up your <strong>3 free Actions</strong> in this group. For more of any/all Actions in <strong>{groupName}</strong> subscribe for <strong>$1/month</strong> (billed quarterly — $3{localStr}) or continue with the free 'view only' membership.
            </p>

            <div style={s.priceCard}>
              <div style={s.priceTop}>
                <span style={s.priceAmount}>$1</span>
                <span style={s.pricePer}>/month</span>
              </div>
              <p style={s.priceBilled}>Billed quarterly — <strong>$3 per 90 days</strong></p>
              {localAmount && localCurrency && (
                <p style={s.localPrice}>≈ {localSymbol}{localAmount.toLocaleString()} {localCurrency}</p>
              )}
              <div style={s.priceFeatures}>
                <p style={s.feature}>✓ Unlimited pledges in this group</p>
                <p style={s.feature}>✓ Make and fulfill contributions</p>
                <p style={s.feature}>✓ Full access to all group actions</p>
                <p style={s.feature}>✓ Cancel anytime</p>
              </div>
            </div>

            <p style={s.methodLabel}>Pay with:</p>
            <div style={s.methods}>
              <button onClick={() => { setProvider('mtn_momo'); setStep('phone'); }} style={{ ...s.methodBtn, borderColor: '#FFCC00' }}>
                <MtnIcon />
                <div>
                  <span style={s.methodName}>MTN Mobile Money</span>
                  <span style={s.methodDesc}>Uganda, Ghana, Rwanda, Cameroon</span>
                </div>
              </button>
              <button onClick={() => { setProvider('airtel_money'); setStep('phone'); }} style={{ ...s.methodBtn, borderColor: '#ED1C24' }}>
                <AirtelIcon />
                <div>
                  <span style={s.methodName}>Airtel Money</span>
                  <span style={s.methodDesc}>Uganda, Kenya, Tanzania, Nigeria</span>
                </div>
              </button>
            </div>

            <p style={s.freeNote}>
              <strong>Free features:</strong> Registration, group creation, joining groups, messaging, and viewing group activity remain free forever.
            </p>
          </div>
        )}

        {step === 'phone' && (
          <div style={s.body}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              {provider === 'mtn_momo' ? <MtnIcon /> : <AirtelIcon />}
              <span style={{ fontSize: 15, fontWeight: 700, color: '#2d3748' }}>
                {provider === 'mtn_momo' ? 'MTN Mobile Money' : 'Airtel Money'}
              </span>
            </div>
            <p style={s.desc}>
              Enter your {provider === 'mtn_momo' ? 'MTN' : 'Airtel'} number to pay <strong>$3.00{localStr}</strong> for 90 days in <strong>{groupName}</strong>:
            </p>
            <input
              type="tel" value={phoneNumber}
              onChange={e => setPhoneNumber(e.target.value.replace(/[^0-9+]/g, ''))}
              placeholder="e.g. 256771234567" style={s.phoneInput} autoFocus
            />
            <p style={s.hint}>Include country code (e.g. 256 for Uganda, 254 for Kenya)</p>
            {error && <p style={s.error}>{error}</p>}
            <div style={s.btnRow}>
              <button onClick={() => { setStep('info'); setError(''); }} style={s.backBtn}>← Back</button>
              <button onClick={handleSubscribe} disabled={processing} style={{
                ...s.payBtn,
                background: provider === 'mtn_momo'
                  ? 'linear-gradient(135deg, #FFCC00, #e6b800)'
                  : 'linear-gradient(135deg, #ED1C24, #c41920)',
                color: provider === 'mtn_momo' ? '#003087' : 'white',
              }}>
                {processing ? 'Processing...' : `Pay $3.00${localStr}`}
              </button>
            </div>
          </div>
        )}

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

        {step === 'failed' && (
          <div style={s.body}>
            <div style={s.resultWrap}>
              <div style={s.failIcon}>✕</div>
              <p style={s.resultTitle}>Payment Not Completed</p>
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
  mainMsg: { fontSize: '15px', color: '#2d3748', lineHeight: 1.7, margin: '0 0 16px' },
  priceCard: {
    background: 'linear-gradient(135deg, #1B2D4F, #4A7FC1)', borderRadius: '14px',
    padding: '20px', color: 'white', marginBottom: '16px', textAlign: 'center',
  },
  priceTop: { display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '2px' },
  priceAmount: { fontSize: '42px', fontWeight: 800 },
  pricePer: { fontSize: '16px', opacity: 0.8 },
  priceBilled: { fontSize: '13px', opacity: 0.7, margin: '4px 0 4px' },
  localPrice: {
    fontSize: '14px', fontWeight: 700, color: '#00E5CC',
    margin: '2px 0 14px', background: 'rgba(0,229,204,0.15)',
    borderRadius: '8px', padding: '6px 12px', display: 'inline-block',
  },
  priceFeatures: { textAlign: 'left', marginTop: '10px' },
  feature: { fontSize: '13px', margin: '4px 0', opacity: 0.9 },
  methodLabel: { fontSize: '14px', color: '#4a5568', fontWeight: 600, margin: '0 0 10px' },
  methods: { display: 'flex', flexDirection: 'column', gap: '8px' },
  methodBtn: {
    display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px',
    background: '#fff', border: '2px solid #e2e8f0', borderRadius: '12px',
    cursor: 'pointer', textAlign: 'left', width: '100%',
  },
  methodName: { fontSize: '14px', fontWeight: 700, color: '#2d3748', display: 'block' },
  methodDesc: { fontSize: '11px', color: '#718096', display: 'block' },
  freeNote: {
    fontSize: '12px', color: '#718096', marginTop: '16px', lineHeight: 1.6,
    background: '#f7fafc', borderRadius: '8px', padding: '10px 14px', border: '1px solid #e2e8f0',
  },
  desc: { fontSize: '14px', color: '#4a5568', lineHeight: 1.6, margin: '0 0 12px' },
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
    flex: 1, padding: '12px', border: 'none', borderRadius: '10px', fontSize: '15px',
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
