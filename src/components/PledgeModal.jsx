import { useState } from 'react';
import { pledgeAPI } from '../services/api';
import { getCurrencySymbol } from '../utils/currencyConverter';

function PledgeModal({ groupId, groupCurrency = 'USD', onClose, onPledgeCreated }) {
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const currencySymbol = getCurrencySymbol(groupCurrency);

  const suggestedAmounts = [50, 100, 250, 500, 1000];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await pledgeAPI.create(groupId, {
        amount: parseFloat(amount),
        dueDate: dueDate || null,
        notes,
        isAnonymous
      });

      onPledgeCreated?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create pledge');
    } finally {
      setLoading(false);
    }
  };

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
          maxWidth: '450px',
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
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#2d3748', margin: 0 }}>
            💰 Make a Pledge
          </h2>
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

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          {/* Amount */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: '600', 
              fontSize: '14px', 
              color: '#4a5568' 
            }}>
              Pledge Amount ({currencySymbol})
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="input"
              style={{ 
                fontSize: '28px', 
                fontWeight: 'bold', 
                padding: '16px',
                textAlign: 'center'
              }}
              min="1"
              step="0.01"
              required
            />

            {/* Quick Amount Buttons */}
            <div style={{ 
              display: 'flex', 
              gap: '8px', 
              marginTop: '12px',
              flexWrap: 'wrap'
            }}>
              {suggestedAmounts.map(amt => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setAmount(amt.toString())}
                  style={{
                    padding: '8px 16px',
                    border: amount === amt.toString() ? '2px solid #667eea' : '2px solid #e2e8f0',
                    background: amount === amt.toString() ? '#ebf8ff' : 'white',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: amount === amt.toString() ? '#667eea' : '#4a5568'
                  }}
                >
                  {currencySymbol}{amt}
                </button>
              ))}
            </div>
          </div>

          {/* Due Date */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: '600', 
              fontSize: '14px', 
              color: '#4a5568' 
            }}>
              Due Date (Optional)
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="input"
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          {/* Notes */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: '600', 
              fontSize: '14px', 
              color: '#4a5568' 
            }}>
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add a message or note..."
              className="input"
              rows="3"
              maxLength={500}
            />
          </div>

          {/* Anonymous Toggle */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px',
            background: '#f7fafc',
            borderRadius: '10px',
            marginBottom: '20px'
          }}>
            <div>
              <p style={{ fontWeight: '600', color: '#2d3748', marginBottom: '4px', fontSize: '14px' }}>
                🔒 Make Anonymous
              </p>
              <p style={{ fontSize: '12px', color: '#718096', margin: 0 }}>
                Your name will be hidden from other members
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsAnonymous(!isAnonymous)}
              style={{
                width: '50px',
                height: '28px',
                borderRadius: '14px',
                border: 'none',
                background: isAnonymous ? '#667eea' : '#e2e8f0',
                cursor: 'pointer',
                position: 'relative'
              }}
            >
              <span style={{
                position: 'absolute',
                top: '2px',
                left: isAnonymous ? '24px' : '2px',
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: 'white',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                transition: 'left 0.2s'
              }} />
            </button>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              padding: '12px',
              background: '#fed7d7',
              color: '#c53030',
              borderRadius: '8px',
              marginBottom: '16px',
              fontSize: '14px'
            }}>
              ⚠️ {error}
            </div>
          )}

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn"
              style={{
                flex: 1,
                background: '#e2e8f0',
                color: '#4a5568',
                padding: '14px'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !amount}
              className="btn btn-primary"
              style={{
                flex: 2,
                padding: '14px',
                fontSize: '16px'
              }}
            >
              {loading ? 'Creating...' : `💰 Pledge ${currencySymbol}${amount || '0'}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PledgeModal;
