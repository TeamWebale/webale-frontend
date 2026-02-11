import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { getCurrencySymbol } from '../utils/currencyConverter';
import { paymentAPI } from '../services/api';

function PaymentModal({
  pledge,
  group,
  onClose,
  onPaymentComplete
}) {
  const { t } = useLanguage();
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [step, setStep] = useState('select'); // 'select', 'details', 'processing', 'success', 'failed'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Payment form states
  const [amount, setAmount] = useState(
    parseFloat(pledge?.amount || 0) - parseFloat(pledge?.amount_paid || 0)
  );
  
  // Mobile Money
  const [mobileProvider, setMobileProvider] = useState('mtn');
  const [phoneNumber, setPhoneNumber] = useState('');
  
  // Card
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardName, setCardName] = useState('');
  
  // Bank Transfer
  const [transferReference, setTransferReference] = useState('');

  const currencySymbol = getCurrencySymbol(group?.currency || 'USD');
  const remainingAmount = parseFloat(pledge?.amount || 0) - parseFloat(pledge?.amount_paid || 0);

  const paymentMethods = [
    {
      id: 'mobile_money',
      name: 'Mobile Money',
      icon: '📱',
      description: 'MTN, Airtel, or other mobile wallets',
      color: '#f59e0b'
    },
    {
      id: 'card',
      name: 'Card Payment',
      icon: '💳',
      description: 'Visa, Mastercard, or other cards',
      color: '#3b82f6'
    },
    {
      id: 'bank_transfer',
      name: 'Bank Transfer',
      icon: '🏦',
      description: 'Direct bank transfer',
      color: '#10b981'
    }
  ];

  const mobileProviders = [
    { id: 'mtn', name: 'MTN Mobile Money', color: '#ffcc00', icon: '🟡' },
    { id: 'airtel', name: 'Airtel Money', color: '#ff0000', icon: '🔴' },
    { id: 'africell', name: 'Africell Money', color: '#ff6600', icon: '🟠' },
    { id: 'mpesa', name: 'M-Pesa', color: '#4caf50', icon: '🟢' }
  ];

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(' ') : value;
  };

  const formatExpiry = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const validateMobilePayment = () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      setError('Please enter a valid phone number');
      return false;
    }
    if (amount <= 0 || amount > remainingAmount) {
      setError('Please enter a valid amount');
      return false;
    }
    return true;
  };

  const validateCardPayment = () => {
    if (!cardNumber || cardNumber.replace(/\s/g, '').length < 16) {
      setError('Please enter a valid card number');
      return false;
    }
    if (!cardExpiry || cardExpiry.length < 5) {
      setError('Please enter a valid expiry date');
      return false;
    }
    if (!cardCvc || cardCvc.length < 3) {
      setError('Please enter a valid CVC');
      return false;
    }
    if (!cardName) {
      setError('Please enter the cardholder name');
      return false;
    }
    return true;
  };

  const handlePayment = async () => {
    setError('');
    
    if (paymentMethod === 'mobile_money' && !validateMobilePayment()) return;
    if (paymentMethod === 'card' && !validateCardPayment()) return;

    setStep('processing');
    setLoading(true);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // In production, call actual payment API
      // const response = await paymentAPI.process({
      //   pledgeId: pledge.id,
      //   groupId: group.id,
      //   amount,
      //   method: paymentMethod,
      //   details: paymentMethod === 'mobile_money' 
      //     ? { provider: mobileProvider, phone: phoneNumber }
      //     : { last4: cardNumber.slice(-4) }
      // });

      setStep('success');
      
      // Notify parent after delay
      setTimeout(() => {
        onPaymentComplete?.({
          amount,
          method: paymentMethod,
          reference: `TXN${Date.now()}`
        });
      }, 2000);

    } catch (err) {
      setError(err.message || 'Payment failed. Please try again.');
      setStep('failed');
    } finally {
      setLoading(false);
    }
  };

  const renderMethodSelection = () => (
    <div>
      <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#4a5568', marginBottom: '16px' }}>
        Choose Payment Method
      </h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {paymentMethods.map(method => (
          <button
            key={method.id}
            onClick={() => {
              setPaymentMethod(method.id);
              setStep('details');
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '16px',
              background: '#f7fafc',
              border: '2px solid #e2e8f0',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              textAlign: 'left'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = method.color;
              e.currentTarget.style.background = `${method.color}10`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#e2e8f0';
              e.currentTarget.style.background = '#f7fafc';
            }}
          >
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '12px',
              background: `${method.color}20`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px'
            }}>
              {method.icon}
            </div>
            <div>
              <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#2d3748', margin: 0 }}>
                {method.name}
              </h4>
              <p style={{ fontSize: '13px', color: '#718096', margin: '4px 0 0' }}>
                {method.description}
              </p>
            </div>
            <span style={{ marginLeft: 'auto', color: '#a0aec0', fontSize: '20px' }}>→</span>
          </button>
        ))}
      </div>
    </div>
  );

  const renderMobileMoneyForm = () => (
    <div>
      <button
        onClick={() => { setStep('select'); setPaymentMethod(null); }}
        style={{
          background: 'none',
          border: 'none',
          color: '#667eea',
          cursor: 'pointer',
          fontSize: '14px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}
      >
        ← Back
      </button>

      <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#2d3748', marginBottom: '20px' }}>
        📱 Mobile Money Payment
      </h3>

      {/* Provider Selection */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px', color: '#4a5568' }}>
          Select Provider
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
          {mobileProviders.map(provider => (
            <button
              key={provider.id}
              onClick={() => setMobileProvider(provider.id)}
              style={{
                padding: '12px',
                border: mobileProvider === provider.id ? `2px solid ${provider.color}` : '2px solid #e2e8f0',
                borderRadius: '10px',
                background: mobileProvider === provider.id ? `${provider.color}15` : 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span style={{ fontSize: '18px' }}>{provider.icon}</span>
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#2d3748' }}>{provider.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Phone Number */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px', color: '#4a5568' }}>
          Phone Number
        </label>
        <input
          type="tel"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9+]/g, ''))}
          placeholder="+256 700 123 456"
          className="input"
          style={{ fontSize: '18px', padding: '14px' }}
        />
      </div>

      {/* Amount */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px', color: '#4a5568' }}>
          Amount ({currencySymbol})
        </label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(Math.min(parseFloat(e.target.value) || 0, remainingAmount))}
          max={remainingAmount}
          className="input"
          style={{ fontSize: '24px', padding: '14px', fontWeight: 'bold' }}
        />
        <p style={{ fontSize: '12px', color: '#718096', marginTop: '4px' }}>
          Remaining: {currencySymbol}{remainingAmount.toLocaleString()}
        </p>
      </div>

      {error && (
        <div style={{ padding: '12px', background: '#fed7d7', color: '#c53030', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>
          ⚠️ {error}
        </div>
      )}

      <button
        onClick={handlePayment}
        disabled={loading}
        className="btn btn-primary"
        style={{ width: '100%', padding: '16px', fontSize: '16px' }}
      >
        {loading ? 'Processing...' : `Pay ${currencySymbol}${amount.toLocaleString()}`}
      </button>

      <p style={{ fontSize: '12px', color: '#a0aec0', textAlign: 'center', marginTop: '12px' }}>
        You will receive a prompt on your phone to confirm the payment
      </p>
    </div>
  );

  const renderCardForm = () => (
    <div>
      <button
        onClick={() => { setStep('select'); setPaymentMethod(null); }}
        style={{
          background: 'none',
          border: 'none',
          color: '#667eea',
          cursor: 'pointer',
          fontSize: '14px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}
      >
        ← Back
      </button>

      <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#2d3748', marginBottom: '20px' }}>
        💳 Card Payment
      </h3>

      {/* Card Number */}
      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px', color: '#4a5568' }}>
          Card Number
        </label>
        <input
          type="text"
          value={cardNumber}
          onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
          placeholder="1234 5678 9012 3456"
          maxLength="19"
          className="input"
          style={{ fontSize: '18px', padding: '14px', letterSpacing: '2px' }}
        />
      </div>

      {/* Expiry & CVC */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px', color: '#4a5568' }}>
            Expiry Date
          </label>
          <input
            type="text"
            value={cardExpiry}
            onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
            placeholder="MM/YY"
            maxLength="5"
            className="input"
            style={{ fontSize: '16px', padding: '14px' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px', color: '#4a5568' }}>
            CVC
          </label>
          <input
            type="text"
            value={cardCvc}
            onChange={(e) => setCardCvc(e.target.value.replace(/[^0-9]/g, '').slice(0, 4))}
            placeholder="123"
            maxLength="4"
            className="input"
            style={{ fontSize: '16px', padding: '14px' }}
          />
        </div>
      </div>

      {/* Cardholder Name */}
      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px', color: '#4a5568' }}>
          Cardholder Name
        </label>
        <input
          type="text"
          value={cardName}
          onChange={(e) => setCardName(e.target.value)}
          placeholder="John Doe"
          className="input"
          style={{ fontSize: '16px', padding: '14px' }}
        />
      </div>

      {/* Amount */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px', color: '#4a5568' }}>
          Amount ({currencySymbol})
        </label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(Math.min(parseFloat(e.target.value) || 0, remainingAmount))}
          max={remainingAmount}
          className="input"
          style={{ fontSize: '24px', padding: '14px', fontWeight: 'bold' }}
        />
      </div>

      {error && (
        <div style={{ padding: '12px', background: '#fed7d7', color: '#c53030', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>
          ⚠️ {error}
        </div>
      )}

      <button
        onClick={handlePayment}
        disabled={loading}
        className="btn btn-primary"
        style={{ width: '100%', padding: '16px', fontSize: '16px' }}
      >
        {loading ? 'Processing...' : `Pay ${currencySymbol}${amount.toLocaleString()}`}
      </button>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '16px' }}>
        <span style={{ fontSize: '24px' }}>💳</span>
        <span style={{ fontSize: '24px' }}>📱</span>
        <span style={{ fontSize: '11px', color: '#a0aec0', alignSelf: 'center' }}>Secured by SSL</span>
      </div>
    </div>
  );

  const renderBankTransfer = () => (
    <div>
      <button
        onClick={() => { setStep('select'); setPaymentMethod(null); }}
        style={{
          background: 'none',
          border: 'none',
          color: '#667eea',
          cursor: 'pointer',
          fontSize: '14px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}
      >
        ← Back
      </button>

      <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#2d3748', marginBottom: '20px' }}>
        🏦 Bank Transfer
      </h3>

      <div style={{ 
        padding: '20px', 
        background: '#f0fff4', 
        borderRadius: '12px', 
        border: '1px solid #c6f6d5',
        marginBottom: '20px'
      }}>
        <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#276749', marginBottom: '12px' }}>
          Transfer to these account details:
        </h4>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#4a5568' }}>Bank Name:</span>
            <span style={{ fontWeight: '600', color: '#2d3748' }}>Standard Chartered</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#4a5568' }}>Account Name:</span>
            <span style={{ fontWeight: '600', color: '#2d3748' }}>Webale Fundraising</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#4a5568' }}>Account Number:</span>
            <span style={{ fontWeight: '600', color: '#2d3748', fontFamily: 'monospace' }}>1234567890</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#4a5568' }}>Reference:</span>
            <span style={{ fontWeight: '600', color: '#667eea', fontFamily: 'monospace' }}>
              {pledge?.id ? `PLG-${pledge.id}` : 'N/A'}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#4a5568' }}>Amount:</span>
            <span style={{ fontWeight: '600', color: '#2d3748' }}>
              {currencySymbol}{remainingAmount.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      <div style={{ 
        padding: '16px', 
        background: '#fffaf0', 
        borderRadius: '10px',
        border: '1px solid #feebc8',
        marginBottom: '20px'
      }}>
        <p style={{ fontSize: '13px', color: '#c05621', margin: 0 }}>
          ⚠️ <strong>Important:</strong> Include the reference number in your transfer. 
          Payments are usually confirmed within 1-2 business days.
        </p>
      </div>

      {/* Confirmation */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px', color: '#4a5568' }}>
          Transfer Reference (optional)
        </label>
        <input
          type="text"
          value={transferReference}
          onChange={(e) => setTransferReference(e.target.value)}
          placeholder="Enter your bank transfer reference"
          className="input"
        />
        <p style={{ fontSize: '12px', color: '#718096', marginTop: '4px' }}>
          Enter the reference from your bank if you've already made the transfer
        </p>
      </div>

      <button
        onClick={() => {
          setStep('success');
          setTimeout(() => {
            onPaymentComplete?.({
              amount: remainingAmount,
              method: 'bank_transfer',
              reference: transferReference || `BANK-${Date.now()}`,
              status: 'pending'
            });
          }, 2000);
        }}
        className="btn"
        style={{ width: '100%', padding: '16px', fontSize: '16px', background: '#48bb78', color: 'white' }}
      >
        I've Made the Transfer
      </button>
    </div>
  );

  const renderProcessing = () => (
    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
      <div className="spinner" style={{ width: '60px', height: '60px', margin: '0 auto 20px' }}></div>
      <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#2d3748', marginBottom: '8px' }}>
        Processing Payment
      </h3>
      <p style={{ color: '#718096', fontSize: '14px' }}>
        Please wait while we process your payment...
      </p>
      {paymentMethod === 'mobile_money' && (
        <p style={{ color: '#667eea', fontSize: '14px', marginTop: '16px' }}>
          📱 Check your phone for the payment prompt
        </p>
      )}
    </div>
  );

  const renderSuccess = () => (
    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
      <div style={{
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 20px',
        fontSize: '40px'
      }}>
        ✓
      </div>
      <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: '#2d3748', marginBottom: '8px' }}>
        Payment Successful!
      </h3>
      <p style={{ color: '#718096', fontSize: '16px', marginBottom: '8px' }}>
        {currencySymbol}{amount.toLocaleString()} has been processed
      </p>
      <p style={{ color: '#a0aec0', fontSize: '14px', marginBottom: '24px' }}>
        Reference: TXN{Date.now()}
      </p>
      
      <button
        onClick={onClose}
        className="btn btn-primary"
        style={{ padding: '14px 40px', fontSize: '16px' }}
      >
        Done
      </button>
    </div>
  );

  const renderFailed = () => (
    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
      <div style={{
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #fc8181 0%, #e53e3e 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 20px',
        fontSize: '40px',
        color: 'white'
      }}>
        ✕
      </div>
      <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: '#2d3748', marginBottom: '8px' }}>
        Payment Failed
      </h3>
      <p style={{ color: '#718096', fontSize: '14px', marginBottom: '24px' }}>
        {error || 'Something went wrong. Please try again.'}
      </p>
      
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
        <button
          onClick={() => setStep('details')}
          className="btn btn-primary"
          style={{ padding: '12px 24px' }}
        >
          Try Again
        </button>
        <button
          onClick={onClose}
          className="btn"
          style={{ padding: '12px 24px', background: '#e2e8f0', color: '#4a5568' }}
        >
          Cancel
        </button>
      </div>
    </div>
  );

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'white',
          borderRadius: '20px',
          maxWidth: '480px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#2d3748', margin: 0 }}>
              💳 Make Payment
            </h2>
            <p style={{ fontSize: '13px', color: '#718096', margin: '4px 0 0' }}>
              {group?.name}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: '#f7fafc',
              border: 'none',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              cursor: 'pointer',
              fontSize: '18px',
              color: '#718096'
            }}
          >
            ✕
          </button>
        </div>

        {/* Amount Summary */}
        {step !== 'success' && step !== 'failed' && step !== 'processing' && (
          <div style={{
            padding: '16px 24px',
            background: '#f7fafc',
            borderBottom: '1px solid #e2e8f0'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: '#718096' }}>Pledge Amount:</span>
              <span style={{ fontWeight: '600', color: '#2d3748' }}>
                {currencySymbol}{parseFloat(pledge?.amount || 0).toLocaleString()}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: '#718096' }}>Already Paid:</span>
              <span style={{ fontWeight: '600', color: '#48bb78' }}>
                {currencySymbol}{parseFloat(pledge?.amount_paid || 0).toLocaleString()}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px dashed #e2e8f0' }}>
              <span style={{ fontWeight: '600', color: '#2d3748' }}>Remaining:</span>
              <span style={{ fontWeight: 'bold', color: '#667eea', fontSize: '18px' }}>
                {currencySymbol}{remainingAmount.toLocaleString()}
              </span>
            </div>
          </div>
        )}

        {/* Content */}
        <div style={{ padding: '24px' }}>
          {step === 'select' && renderMethodSelection()}
          {step === 'details' && paymentMethod === 'mobile_money' && renderMobileMoneyForm()}
          {step === 'details' && paymentMethod === 'card' && renderCardForm()}
          {step === 'details' && paymentMethod === 'bank_transfer' && renderBankTransfer()}
          {step === 'processing' && renderProcessing()}
          {step === 'success' && renderSuccess()}
          {step === 'failed' && renderFailed()}
        </div>
      </div>
    </div>
  );
}

export default PaymentModal;
