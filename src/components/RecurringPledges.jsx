import { useState, useEffect } from 'react';
import { recurringPledgeAPI } from '../services/api';

function RecurringPledges({ groupId, groupCurrency = 'USD', onPledgeCreated }) {
  const [showModal, setShowModal] = useState(false);
  const [recurringPledges, setRecurringPledges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    amount: '',
    frequency: 'monthly',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadRecurringPledges();
  }, [groupId]);

  const loadRecurringPledges = async () => {
    try {
      const response = await recurringPledgeAPI.getByGroup(groupId);
      setRecurringPledges(response.data.data.pledges || []);
    } catch (error) {
      console.error('Error loading recurring pledges:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrencySymbol = () => {
    const symbols = { USD: '$', EUR: '€', GBP: '£', UGX: 'UGX ', KES: 'KES ' };
    return symbols[groupCurrency] || groupCurrency + ' ';
  };

  const formatAmount = (amount) => {
    return parseFloat(amount || 0).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const getFrequencyLabel = (freq) => {
    const labels = {
      weekly: 'Weekly',
      biweekly: 'Every 2 Weeks',
      monthly: 'Monthly',
      quarterly: 'Quarterly'
    };
    return labels[freq] || freq;
  };

  const calculateNextDue = (startDate, frequency) => {
    const start = new Date(startDate);
    const now = new Date();
    let next = new Date(start);

    while (next <= now) {
      switch (frequency) {
        case 'weekly':
          next.setDate(next.getDate() + 7);
          break;
        case 'biweekly':
          next.setDate(next.getDate() + 14);
          break;
        case 'monthly':
          next.setMonth(next.getMonth() + 1);
          break;
        case 'quarterly':
          next.setMonth(next.getMonth() + 3);
          break;
        default:
          next.setMonth(next.getMonth() + 1);
      }
    }
    return next;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    setSubmitting(true);
    try {
      await recurringPledgeAPI.create(groupId, {
        ...formData,
        amount: parseFloat(formData.amount),
        currency: groupCurrency
      });
      
      setShowModal(false);
      setFormData({
        amount: '',
        frequency: 'monthly',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        notes: ''
      });
      loadRecurringPledges();
      if (onPledgeCreated) onPledgeCreated();
    } catch (error) {
      console.error('Error creating recurring pledge:', error);
      alert('Failed to create recurring pledge');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (pledgeId) => {
    if (!confirm('Are you sure you want to cancel this recurring pledge?')) return;
    
    try {
      await recurringPledgeAPI.cancel(groupId, pledgeId);
      loadRecurringPledges();
    } catch (error) {
      console.error('Error canceling recurring pledge:', error);
      alert('Failed to cancel recurring pledge');
    }
  };

  return (
    <>
      {/* Recurring Pledges Summary Card */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            🔄 Recurring Pledges
          </h3>
          <button
            onClick={() => setShowModal(true)}
            className="btn"
            style={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
              color: 'white',
              fontSize: '13px',
              padding: '8px 16px'
            }}
          >
            + Set Up Recurring
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <div className="spinner" style={{ width: '24px', height: '24px', margin: '0 auto' }}></div>
          </div>
        ) : recurringPledges.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px', color: '#a0aec0' }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>🔄</div>
            <p style={{ margin: 0, fontSize: '14px' }}>No recurring pledges set up yet</p>
            <p style={{ margin: '4px 0 0', fontSize: '13px' }}>Set up automatic contributions!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {recurringPledges.map(pledge => (
              <div
                key={pledge.id}
                style={{
                  padding: '14px',
                  background: pledge.is_active ? '#f7fafc' : '#fef5f5',
                  borderRadius: '10px',
                  border: pledge.is_active ? '1px solid #e2e8f0' : '1px solid #fed7d7'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 'bold', fontSize: '18px', color: '#2d3748' }}>
                        {getCurrencySymbol()}{formatAmount(pledge.amount)}
                      </span>
                      <span style={{
                        padding: '2px 8px',
                        background: pledge.is_active ? '#c6f6d5' : '#fed7d7',
                        color: pledge.is_active ? '#276749' : '#c53030',
                        borderRadius: '10px',
                        fontSize: '11px',
                        fontWeight: '600'
                      }}>
                        {pledge.is_active ? 'Active' : 'Cancelled'}
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: '13px', color: '#718096' }}>
                      {getFrequencyLabel(pledge.frequency)} • Next: {new Date(pledge.next_due_date).toLocaleDateString()}
                    </p>
                    <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#a0aec0' }}>
                      {pledge.payment_count} payments made • Total: {getCurrencySymbol()}{formatAmount(pledge.total_paid)}
                    </p>
                  </div>
                  {pledge.is_active && (
                    <button
                      onClick={() => handleCancel(pledge.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#e53e3e',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Recurring Pledge Modal */}
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
              🔄 Set Up Recurring Pledge
            </h2>

            <form onSubmit={handleSubmit}>
              {/* Amount */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px' }}>
                  Amount per Payment
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#718096',
                    fontWeight: '600'
                  }}>
                    {getCurrencySymbol()}
                  </span>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="input"
                    style={{ paddingLeft: '40px' }}
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              {/* Frequency */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px' }}>
                  Frequency
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {[
                    { value: 'weekly', label: 'Weekly', icon: '📅' },
                    { value: 'biweekly', label: 'Every 2 Weeks', icon: '📆' },
                    { value: 'monthly', label: 'Monthly', icon: '🗓️' },
                    { value: 'quarterly', label: 'Quarterly', icon: '📊' }
                  ].map(opt => (
                    <label
                      key={opt.value}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '12px',
                        background: formData.frequency === opt.value ? '#ebf8ff' : '#f7fafc',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        border: formData.frequency === opt.value ? '2px solid #4299e1' : '2px solid transparent',
                        fontSize: '13px'
                      }}
                    >
                      <input
                        type="radio"
                        name="frequency"
                        value={opt.value}
                        checked={formData.frequency === opt.value}
                        onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                        style={{ display: 'none' }}
                      />
                      <span>{opt.icon}</span>
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Start Date */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px' }}>
                  Start Date
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="input"
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              {/* End Date (Optional) */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px' }}>
                  End Date <span style={{ color: '#a0aec0', fontWeight: 'normal' }}>(Optional)</span>
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="input"
                  min={formData.startDate}
                />
              </div>

              {/* Notes */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px' }}>
                  Notes <span style={{ color: '#a0aec0', fontWeight: 'normal' }}>(Optional)</span>
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="input"
                  rows="2"
                  placeholder="Add any notes about this recurring pledge"
                />
              </div>

              {/* Summary */}
              <div style={{
                padding: '14px',
                background: '#f7fafc',
                borderRadius: '8px',
                marginBottom: '20px'
              }}>
                <p style={{ margin: 0, fontSize: '14px', color: '#4a5568' }}>
                  <strong>Summary:</strong> You'll contribute {getCurrencySymbol()}{formData.amount || '0.00'} {getFrequencyLabel(formData.frequency).toLowerCase()} starting {new Date(formData.startDate).toLocaleDateString()}
                  {formData.endDate && ` until ${new Date(formData.endDate).toLocaleDateString()}`}
                </p>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn"
                  style={{ flex: 1, background: '#e2e8f0', color: '#4a5568' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn"
                  style={{
                    flex: 1,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white'
                  }}
                >
                  {submitting ? 'Setting Up...' : '🔄 Set Up Recurring'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default RecurringPledges;
