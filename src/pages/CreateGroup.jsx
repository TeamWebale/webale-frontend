import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { groupAPI } from '../services/api';
import { CURRENCIES, getCurrencySymbol } from '../utils/currencyConverter';
import GroupTemplates, { GROUP_TEMPLATES } from '../components/GroupTemplates';

// Country to currency mapping
const COUNTRY_CURRENCY = {
  US: 'USD', UG: 'UGX', KE: 'KES', TZ: 'TZS', RW: 'RWF',
  NG: 'NGN', GH: 'GHS', ZA: 'ZAR', GB: 'GBP', DE: 'EUR',
  FR: 'EUR', IT: 'EUR', ES: 'EUR', NL: 'EUR', BE: 'EUR',
  CA: 'CAD', AU: 'AUD', IN: 'INR', CN: 'CNY', JP: 'JPY',
  BR: 'BRL', ET: 'ETB', CD: 'CDF', SS: 'SSP', BI: 'BIF'
};

function CreateGroup() {
  const navigate = useNavigate();
  const [showTemplates, setShowTemplates] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    goalAmount: '',
    currency: 'USD',
    deadline: ''
  });

  // Default currency from user's profile country (not IP)
  useEffect(() => {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        const country = user.country;
        if (country && COUNTRY_CURRENCY[country]) {
          setFormData(prev => ({ ...prev, currency: COUNTRY_CURRENCY[country] }));
        }
      }
    } catch (e) {
      console.log('Could not detect currency from profile');
    }
  }, []);

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setFormData(prev => ({
      name: template.fields.name || '',
      description: template.fields.description || '',
      goalAmount: template.defaultGoal.toString(),
      currency: prev.currency,
      deadline: ''
    }));
    setShowTemplates(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!formData.name.trim()) { setError('Please enter a group name'); return; }
    if (!formData.goalAmount || parseFloat(formData.goalAmount) <= 0) { setError('Please enter a valid goal amount'); return; }

    setLoading(true);
    try {
      const response = await groupAPI.create({
        name: formData.name.trim(),
        description: formData.description.trim(),
        goalAmount: parseFloat(formData.goalAmount),
        currency: formData.currency,
        deadline: formData.deadline || null
      });
      const groupId = response.data.data.group.id;
      navigate(`/groups/${groupId}`);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create group');
    } finally { setLoading(false); }
  };

  const currentSymbol = getCurrencySymbol(formData.currency);

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', position: 'relative' }}>
      {/* Close Button */}
      <button onClick={() => navigate('/dashboard')} title="Close" style={{
        position: 'absolute', top: '0', right: '0', width: '36px', height: '36px',
        borderRadius: '50%', background: '#fed7d7', border: 'none',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', fontSize: '16px', color: '#e53e3e', fontWeight: '700', zIndex: 10
      }}>✕</button>

      <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#2d3748', marginBottom: '8px' }}>
        ➕ Create New Group
      </h1>
      <p style={{ color: '#718096', marginBottom: '24px' }}>
        Start a new fundraising group and invite members to contribute.
      </p>

      {/* Template Selection */}
      {showTemplates && (
        <div className="card" style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>🎨 Choose a Template <span style={{ fontSize: '13px', color: '#a0aec0', fontWeight: '400' }}>(optional)</span></h2>
            <button onClick={() => setShowTemplates(false)} style={{
              background: 'none', border: 'none', color: '#667eea', cursor: 'pointer', fontSize: '14px', fontWeight: '600'
            }}>Skip →</button>
          </div>
          
          <p style={{ color: '#718096', fontSize: '14px', marginBottom: '16px' }}>
            Quick-start with a pre-configured template or start from scratch.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px' }}>
            {GROUP_TEMPLATES.slice(0, 8).map(template => (
              <div key={template.id} onClick={() => handleTemplateSelect(template)} style={{
                padding: '16px', borderRadius: '12px', border: '2px solid #e2e8f0',
                cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s'
              }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = template.color}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}>
                <div style={{
                  width: '45px', height: '45px', borderRadius: '10px', background: `${template.color}20`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', margin: '0 auto 10px'
                }}>{template.icon}</div>
                <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#2d3748', margin: 0 }}>{template.name}</h3>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Selected Template Badge */}
      {selectedTemplate && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px',
          background: `${selectedTemplate.color}15`, borderRadius: '10px', marginBottom: '20px',
          border: `2px solid ${selectedTemplate.color}40`
        }}>
          <span style={{ fontSize: '24px' }}>{selectedTemplate.icon}</span>
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontWeight: '600', color: '#2d3748' }}>Using {selectedTemplate.name} Template</p>
            <p style={{ margin: 0, fontSize: '12px', color: '#718096' }}>{selectedTemplate.description}</p>
          </div>
          <button onClick={() => setShowTemplates(true)} style={{
            background: 'none', border: 'none', color: selectedTemplate.color, cursor: 'pointer', fontSize: '13px', fontWeight: '600'
          }}>Change</button>
        </div>
      )}

      {/* Create Form */}
      <div className="card">
        <form onSubmit={handleSubmit}>
          {error && (
            <div style={{
              padding: '12px 16px', background: '#fed7d7', color: '#c53030', borderRadius: '8px',
              marginBottom: '16px', fontSize: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <span>⚠️ {error}</span>
              <button type="button" onClick={() => setError('')} style={{
                background: 'none', border: 'none', color: '#c53030', cursor: 'pointer', fontSize: '18px', fontWeight: 'bold'
              }}>✕</button>
            </div>
          )}

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px', color: '#4a5568' }}>
              Group Name *
            </label>
            <input type="text" name="name" value={formData.name} onChange={handleChange}
              className="input" placeholder={formData.name ? '' : 'e.g., Wedding Fund - John & Jane'} required />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px', color: '#4a5568' }}>
              Description
            </label>
            <textarea name="description" value={formData.description} onChange={handleChange}
              className="input" placeholder={formData.description ? '' : 'What is this group raising funds for?'} rows="3" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px', color: '#4a5568' }}>
                Currency
              </label>
              <select name="currency" value={formData.currency} onChange={handleChange} className="input">
                {CURRENCIES.map(c => (
                  <option key={c.code} value={c.code}>{c.flag} {c.code} - {c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px', color: '#4a5568' }}>
                Goal Amount *
              </label>
              <input type="number" name="goalAmount" value={formData.goalAmount} onChange={handleChange}
                className="input" placeholder="10000" min="1" step="0.01" required />
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px', color: '#4a5568' }}>
              Deadline (Optional)
            </label>
            <input type="date" name="deadline" value={formData.deadline} onChange={handleChange}
              className="input" min={new Date().toISOString().split('T')[0]} />
          </div>

          {/* Suggested Pledge Amounts */}
          {selectedTemplate && selectedTemplate.suggestedPledges && (
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px', color: '#4a5568' }}>
                Suggested Pledge Amounts
              </label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {selectedTemplate.suggestedPledges.map(amount => (
                  <span key={amount} style={{
                    padding: '8px 16px', background: '#f7fafc', borderRadius: '20px', fontSize: '14px',
                    color: selectedTemplate.color, fontWeight: '600', border: `1px solid ${selectedTemplate.color}40`
                  }}>{currentSymbol}{amount.toLocaleString()}</span>
                ))}
              </div>
              <p style={{ fontSize: '12px', color: '#a0aec0', marginTop: '6px' }}>
                These will be shown as quick options when members make pledges
              </p>
            </div>
          )}

          <button type="submit" disabled={loading} className="btn btn-primary"
            style={{ width: '100%', padding: '14px', fontSize: '16px', fontWeight: '600' }}>
            {loading ? 'Creating...' : '🚀 Create Group'}
          </button>
        </form>
      </div>

      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <button onClick={() => navigate('/dashboard')} style={{
          background: 'none', border: 'none', color: '#718096', cursor: 'pointer', fontSize: '14px'
        }}>← Back to Dashboard</button>
      </div>
    </div>
  );
}

export default CreateGroup;
