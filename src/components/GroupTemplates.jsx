import { useState } from 'react';

const GROUP_TEMPLATES = [
  {
    id: 'wedding',
    icon: '💒',
    name: 'Wedding Fund',
    description: 'Collect contributions for wedding expenses',
    defaultGoal: 10000,
    currency: 'USD',
    suggestedPledges: [50, 100, 200, 500],
    color: '#f687b3',
    fields: {
      name: 'Wedding Fund - [Names]',
      description: 'Help us celebrate our special day! We\'re raising funds for our wedding and would love your contribution.',
    }
  },
  {
    id: 'funeral',
    icon: '🕊️',
    name: 'Memorial Fund',
    description: 'Support family during difficult times',
    defaultGoal: 5000,
    currency: 'USD',
    suggestedPledges: [25, 50, 100, 250],
    color: '#718096',
    fields: {
      name: 'Memorial Fund - [Name]',
      description: 'In loving memory. We\'re collecting contributions to support the family and cover memorial expenses.',
    }
  },
  {
    id: 'medical',
    icon: '🏥',
    name: 'Medical Expenses',
    description: 'Help cover healthcare costs',
    defaultGoal: 15000,
    currency: 'USD',
    suggestedPledges: [50, 100, 250, 500],
    color: '#e53e3e',
    fields: {
      name: 'Medical Fund - [Patient Name]',
      description: 'Help us cover medical expenses and treatment costs. Every contribution makes a difference.',
    }
  },
  {
    id: 'education',
    icon: '🎓',
    name: 'Education Fund',
    description: 'Support educational goals',
    defaultGoal: 8000,
    currency: 'USD',
    suggestedPledges: [25, 50, 100, 200],
    color: '#4299e1',
    fields: {
      name: 'Education Fund - [Student Name]',
      description: 'Investing in education and future success. Help support tuition, books, and educational materials.',
    }
  },
  {
    id: 'startup',
    icon: '🚀',
    name: 'Business Startup',
    description: 'Launch a new business venture',
    defaultGoal: 25000,
    currency: 'USD',
    suggestedPledges: [100, 250, 500, 1000],
    color: '#9f7aea',
    fields: {
      name: '[Business Name] Startup Fund',
      description: 'Help us launch our business! We\'re raising capital to turn our vision into reality.',
    }
  },
  {
    id: 'community',
    icon: '🏘️',
    name: 'Community Project',
    description: 'Fund local community initiatives',
    defaultGoal: 5000,
    currency: 'USD',
    suggestedPledges: [20, 50, 100, 200],
    color: '#48bb78',
    fields: {
      name: 'Community Project - [Project Name]',
      description: 'Together we can make a difference! Join us in improving our community.',
    }
  },
  {
    id: 'charity',
    icon: '❤️',
    name: 'Charity Drive',
    description: 'Support a charitable cause',
    defaultGoal: 3000,
    currency: 'USD',
    suggestedPledges: [10, 25, 50, 100],
    color: '#ed64a6',
    fields: {
      name: 'Charity Drive - [Cause]',
      description: 'Making the world a better place. Support our charitable initiative.',
    }
  },
  {
    id: 'travel',
    icon: '✈️',
    name: 'Group Trip',
    description: 'Plan and fund a group vacation',
    defaultGoal: 6000,
    currency: 'USD',
    suggestedPledges: [100, 200, 300, 500],
    color: '#38b2ac',
    fields: {
      name: 'Group Trip - [Destination]',
      description: 'Adventure awaits! We\'re planning an amazing trip and collecting contributions from all travelers.',
    }
  },
  {
    id: 'custom',
    icon: '✨',
    name: 'Custom',
    description: 'Start with a blank template',
    defaultGoal: 1000,
    currency: 'USD',
    suggestedPledges: [25, 50, 100, 200],
    color: '#667eea',
    fields: {
      name: '',
      description: '',
    }
  }
];

function GroupTemplates({ onSelect, onClose }) {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [hoveredTemplate, setHoveredTemplate] = useState(null);

  const handleSelect = (template) => {
    setSelectedTemplate(template);
  };

  const handleConfirm = () => {
    if (selectedTemplate) {
      onSelect(selectedTemplate);
      onClose();
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
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{ 
          maxWidth: '700px', 
          width: '95%', 
          maxHeight: '90vh', 
          overflow: 'auto',
          padding: '24px'
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: 'bold', margin: 0 }}>
              🎨 Choose a Template
            </h2>
            <p style={{ color: '#718096', fontSize: '14px', margin: '4px 0 0' }}>
              Quick-start your group with a pre-configured template
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#a0aec0'
            }}
          >
            ✕
          </button>
        </div>

        {/* Templates Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '24px'
        }}>
          {GROUP_TEMPLATES.map(template => (
            <div
              key={template.id}
              onClick={() => handleSelect(template)}
              onMouseEnter={() => setHoveredTemplate(template.id)}
              onMouseLeave={() => setHoveredTemplate(null)}
              style={{
                padding: '20px',
                borderRadius: '12px',
                border: selectedTemplate?.id === template.id 
                  ? `3px solid ${template.color}` 
                  : '2px solid #e2e8f0',
                background: selectedTemplate?.id === template.id 
                  ? `${template.color}10` 
                  : hoveredTemplate === template.id 
                    ? '#f7fafc' 
                    : 'white',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                transform: hoveredTemplate === template.id ? 'translateY(-2px)' : 'none',
                boxShadow: hoveredTemplate === template.id 
                  ? '0 4px 12px rgba(0,0,0,0.1)' 
                  : 'none'
              }}
            >
              <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '12px',
                background: `${template.color}20`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                marginBottom: '12px'
              }}>
                {template.icon}
              </div>
              <h3 style={{ 
                fontSize: '16px', 
                fontWeight: 'bold', 
                color: '#2d3748',
                marginBottom: '4px'
              }}>
                {template.name}
              </h3>
              <p style={{ 
                fontSize: '13px', 
                color: '#718096',
                margin: 0,
                lineHeight: '1.4'
              }}>
                {template.description}
              </p>
              {selectedTemplate?.id === template.id && (
                <div style={{
                  marginTop: '12px',
                  padding: '6px 12px',
                  background: template.color,
                  color: 'white',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '600',
                  display: 'inline-block'
                }}>
                  ✓ Selected
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Selected Template Details */}
        {selectedTemplate && (
          <div style={{
            padding: '20px',
            background: '#f7fafc',
            borderRadius: '12px',
            marginBottom: '20px',
            border: `2px solid ${selectedTemplate.color}40`
          }}>
            <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#4a5568', marginBottom: '12px' }}>
              📋 Template Details
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <span style={{ color: '#718096', fontSize: '12px' }}>Suggested Goal</span>
                <p style={{ fontWeight: '600', margin: '2px 0', color: '#2d3748' }}>
                  ${selectedTemplate.defaultGoal.toLocaleString()}
                </p>
              </div>
              <div>
                <span style={{ color: '#718096', fontSize: '12px' }}>Currency</span>
                <p style={{ fontWeight: '600', margin: '2px 0', color: '#2d3748' }}>
                  {selectedTemplate.currency}
                </p>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <span style={{ color: '#718096', fontSize: '12px' }}>Suggested Pledge Amounts</span>
                <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                  {selectedTemplate.suggestedPledges.map(amount => (
                    <span
                      key={amount}
                      style={{
                        padding: '4px 12px',
                        background: 'white',
                        borderRadius: '20px',
                        fontSize: '13px',
                        fontWeight: '600',
                        color: selectedTemplate.color
                      }}
                    >
                      ${amount}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={onClose}
            className="btn"
            style={{ flex: 1, background: '#e2e8f0', color: '#4a5568' }}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedTemplate}
            className="btn"
            style={{
              flex: 1,
              background: selectedTemplate 
                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                : '#cbd5e0',
              color: 'white',
              cursor: selectedTemplate ? 'pointer' : 'not-allowed'
            }}
          >
            {selectedTemplate ? `Use ${selectedTemplate.name} Template` : 'Select a Template'}
          </button>
        </div>
      </div>
    </div>
  );
}

export { GROUP_TEMPLATES };
export default GroupTemplates;
