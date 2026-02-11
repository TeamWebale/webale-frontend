import { useState, useEffect } from 'react';
import { paymentAPI } from '../services/api';
import { getCurrencySymbol } from '../utils/currencyConverter';
import { formatTimeAgo } from '../utils/timeFormatter';
import { useLanguage } from '../context/LanguageContext';

function PaymentHistory({ groupId, pledgeId, userId }) {
  const { t } = useLanguage();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadPayments();
  }, [groupId, pledgeId, userId]);

  const loadPayments = async () => {
    try {
      setLoading(true);
      // In production, fetch from API
      // const response = await paymentAPI.getHistory({ groupId, pledgeId, userId });
      // setPayments(response.data.data.payments);
      
      // Mock data for demo
      setPayments([
        {
          id: 1,
          amount: 500,
          currency: 'USD',
          method: 'mobile_money',
          provider: 'MTN',
          status: 'completed',
          reference: 'TXN1234567890',
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          pledge_id: 1,
          group_name: 'Wedding Fund'
        },
        {
          id: 2,
          amount: 250,
          currency: 'USD',
          method: 'card',
          last4: '4242',
          status: 'completed',
          reference: 'TXN1234567891',
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
          pledge_id: 1,
          group_name: 'Wedding Fund'
        },
        {
          id: 3,
          amount: 1000,
          currency: 'UGX',
          method: 'bank_transfer',
          status: 'pending',
          reference: 'BANK-1234567892',
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
          pledge_id: 2,
          group_name: 'Medical Fund'
        }
      ]);
    } catch (error) {
      console.error('Error loading payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMethodIcon = (method) => {
    switch (method) {
      case 'mobile_money': return '📱';
      case 'card': return '💳';
      case 'bank_transfer': return '🏦';
      default: return '💰';
    }
  };

  const getMethodLabel = (payment) => {
    switch (payment.method) {
      case 'mobile_money': return payment.provider || 'Mobile Money';
      case 'card': return `Card •••• ${payment.last4 || '****'}`;
      case 'bank_transfer': return 'Bank Transfer';
      default: return 'Payment';
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      completed: { bg: '#c6f6d5', color: '#276749', label: '✓ Completed' },
      pending: { bg: '#feebc8', color: '#c05621', label: '⏳ Pending' },
      failed: { bg: '#fed7d7', color: '#c53030', label: '✕ Failed' },
      refunded: { bg: '#e9d8fd', color: '#6b46c1', label: '↩ Refunded' }
    };
    const style = styles[status] || styles.pending;
    
    return (
      <span style={{
        padding: '4px 10px',
        background: style.bg,
        color: style.color,
        borderRadius: '12px',
        fontSize: '11px',
        fontWeight: '600'
      }}>
        {style.label}
      </span>
    );
  };

  const filteredPayments = payments.filter(p => {
    if (filter === 'all') return true;
    return p.status === filter;
  });

  const totalCompleted = payments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + parseFloat(p.amount), 0);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Summary */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '12px',
        marginBottom: '20px'
      }}>
        <div style={{
          padding: '16px',
          background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
          borderRadius: '12px',
          color: 'white'
        }}>
          <p style={{ fontSize: '12px', opacity: 0.9, marginBottom: '4px' }}>Total Paid</p>
          <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
            ${totalCompleted.toLocaleString()}
          </p>
        </div>
        <div style={{
          padding: '16px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '12px',
          color: 'white'
        }}>
          <p style={{ fontSize: '12px', opacity: 0.9, marginBottom: '4px' }}>Transactions</p>
          <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
            {payments.length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '16px',
        overflowX: 'auto',
        paddingBottom: '4px'
      }}>
        {['all', 'completed', 'pending', 'failed'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '8px 16px',
              border: 'none',
              borderRadius: '20px',
              background: filter === f ? '#667eea' : '#e2e8f0',
              color: filter === f ? 'white' : '#4a5568',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '600',
              whiteSpace: 'nowrap'
            }}
          >
            {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Payment List */}
      {filteredPayments.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '40px',
          background: '#f7fafc',
          borderRadius: '12px',
          color: '#a0aec0'
        }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>💳</div>
          <p style={{ fontSize: '14px' }}>No payments found</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredPayments.map(payment => (
            <div
              key={payment.id}
              style={{
                padding: '16px',
                background: 'white',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                gap: '14px'
              }}
            >
              {/* Icon */}
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: '#f7fafc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '22px',
                flexShrink: 0
              }}>
                {getMethodIcon(payment.method)}
              </div>

              {/* Details */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ fontWeight: '600', color: '#2d3748', fontSize: '15px' }}>
                    {getCurrencySymbol(payment.currency)}{parseFloat(payment.amount).toLocaleString()}
                  </span>
                  {getStatusBadge(payment.status)}
                </div>
                <p style={{ fontSize: '13px', color: '#718096', margin: '0 0 2px' }}>
                  {getMethodLabel(payment)}
                </p>
                <p style={{ fontSize: '12px', color: '#a0aec0', margin: 0 }}>
                  {formatTimeAgo(payment.created_at)} • {payment.group_name}
                </p>
              </div>

              {/* Reference */}
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <p style={{ 
                  fontSize: '11px', 
                  color: '#a0aec0', 
                  margin: 0,
                  fontFamily: 'monospace'
                }}>
                  {payment.reference?.slice(0, 12)}...
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PaymentHistory;
