import { useState, useEffect } from 'react';
import { getCountryFlag, getCountryName } from '../utils/countries';
import { getCurrencySymbol } from '../utils/currencyConverter';
import { formatTimeAgo } from '../utils/timeFormatter';
import { useLanguage } from '../context/LanguageContext';

function MemberProfileModal({ 
  member, 
  pledges = [], 
  groupCurrency = 'USD',
  groupName = '',
  isAdmin = false,
  currentUserId = null,
  onClose,
  onMessage,
  onPromote,
  onDemote,
  onRemove
}) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('overview');

  if (!member) return null;

  const memberPledges = pledges.filter(p => p.user_id === member.id || p.user_id === member.user_id);
  const totalPledged = memberPledges.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
  const totalPaid = memberPledges.reduce((sum, p) => sum + parseFloat(p.amount_paid || 0), 0);
  const currencySymbol = getCurrencySymbol(groupCurrency);

  const isCurrentUser = currentUserId === member.id || currentUserId === member.user_id;
  const memberRole = member.role || 'member';

  const getInitials = () => {
    const first = member.first_name?.charAt(0) || '';
    const last = member.last_name?.charAt(0) || '';
    return (first + last).toUpperCase() || '?';
  };

  const getAvatarColor = () => {
    if (memberRole === 'admin') return 'linear-gradient(135deg, #9f7aea 0%, #805ad5 100%)';
    if (memberRole === 'owner') return 'linear-gradient(135deg, #ed8936 0%, #dd6b20 100%)';
    return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
  };

  const paidPledges = memberPledges.filter(p => p.status === 'paid');
  const pendingPledges = memberPledges.filter(p => p.status === 'pending');
  const partialPledges = memberPledges.filter(p => p.status === 'partial');

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
          maxWidth: '500px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with gradient background */}
        <div style={{
          background: getAvatarColor(),
          padding: '30px 24px 60px',
          position: 'relative'
        }}>
          {/* Close button */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              color: 'white',
              fontSize: '18px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ✕
          </button>

          {/* Role badge */}
          <div style={{ marginBottom: '16px' }}>
            <span style={{
              padding: '6px 14px',
              background: 'rgba(255,255,255,0.25)',
              color: 'white',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '600'
            }}>
              {memberRole === 'owner' ? '👑 Owner' : memberRole === 'admin' ? '🛡️ Admin' : '👤 Member'}
            </span>
          </div>

          {/* Group name */}
          {groupName && (
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px', margin: 0 }}>
              {groupName}
            </p>
          )}
        </div>

        {/* Avatar - overlapping header */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginTop: '-50px',
          position: 'relative',
          zIndex: 1
        }}>
          <div style={{
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            background: getAvatarColor(),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '36px',
            border: '4px solid white',
            boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
          }}>
            {getInitials()}
          </div>
        </div>

        {/* Name & Country */}
        <div style={{ textAlign: 'center', padding: '16px 24px 0' }}>
          <h2 style={{ 
            fontSize: '22px', 
            fontWeight: 'bold', 
            color: '#2d3748', 
            margin: '0 0 6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}>
            {member.first_name} {member.last_name}
            {member.country && (
              <span style={{ fontSize: '22px' }}>{getCountryFlag(member.country)}</span>
            )}
          </h2>
          
          {member.country && (
            <p style={{ color: '#718096', fontSize: '14px', margin: '0 0 4px' }}>
              {getCountryName(member.country)}
            </p>
          )}
          
          {isCurrentUser && (
            <span style={{
              display: 'inline-block',
              padding: '4px 12px',
              background: '#ebf8ff',
              color: '#667eea',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: '600',
              marginTop: '8px'
            }}>
              This is you
            </span>
          )}
        </div>

        {/* Stats Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(3, 1fr)', 
          gap: '12px',
          padding: '20px 24px'
        }}>
          <div style={{ 
            textAlign: 'center', 
            padding: '14px 10px', 
            background: '#f0fff4', 
            borderRadius: '12px' 
          }}>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#276749' }}>
              {currencySymbol}{totalPledged.toLocaleString()}
            </div>
            <div style={{ fontSize: '11px', color: '#48bb78', fontWeight: '600' }}>Total Pledged</div>
          </div>
          <div style={{ 
            textAlign: 'center', 
            padding: '14px 10px', 
            background: '#ebf8ff', 
            borderRadius: '12px' 
          }}>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#2b6cb0' }}>
              {currencySymbol}{totalPaid.toLocaleString()}
            </div>
            <div style={{ fontSize: '11px', color: '#4299e1', fontWeight: '600' }}>Total Paid</div>
          </div>
          <div style={{ 
            textAlign: 'center', 
            padding: '14px 10px', 
            background: '#faf5ff', 
            borderRadius: '12px' 
          }}>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#6b46c1' }}>
              {memberPledges.length}
            </div>
            <div style={{ fontSize: '11px', color: '#9f7aea', fontWeight: '600' }}>Pledges</div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ 
          display: 'flex', 
          borderBottom: '2px solid #e2e8f0',
          padding: '0 24px'
        }}>
          {['overview', 'pledges'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1,
                padding: '12px',
                border: 'none',
                background: 'none',
                borderBottom: activeTab === tab ? '3px solid #667eea' : '3px solid transparent',
                color: activeTab === tab ? '#667eea' : '#718096',
                fontWeight: '600',
                fontSize: '14px',
                cursor: 'pointer',
                textTransform: 'capitalize'
              }}
            >
              {tab === 'overview' ? '📋 Overview' : '💰 Pledges'}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div style={{ 
          padding: '20px 24px', 
          maxHeight: '250px', 
          overflowY: 'auto' 
        }}>
          {activeTab === 'overview' && (
            <div>
              {/* Member Info */}
              <div style={{ marginBottom: '16px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#4a5568', marginBottom: '12px' }}>
                  Member Information
                </h4>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {member.email && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                      <span style={{ color: '#718096' }}>📧 Email</span>
                      <span style={{ color: '#2d3748', fontWeight: '500' }}>{member.email}</span>
                    </div>
                  )}
                  
                  {member.joined_at && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                      <span style={{ color: '#718096' }}>📅 Joined</span>
                      <span style={{ color: '#2d3748', fontWeight: '500' }}>
                        {new Date(member.joined_at).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                    <span style={{ color: '#718096' }}>🎭 Role</span>
                    <span style={{ 
                      color: memberRole === 'admin' ? '#9f7aea' : '#2d3748', 
                      fontWeight: '600',
                      textTransform: 'capitalize'
                    }}>
                      {memberRole}
                    </span>
                  </div>
                </div>
              </div>

              {/* Pledge Summary */}
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#4a5568', marginBottom: '12px' }}>
                  Pledge Summary
                </h4>
                
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{
                    padding: '6px 12px',
                    background: '#c6f6d5',
                    color: '#276749',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    ✅ {paidPledges.length} Paid
                  </span>
                  <span style={{
                    padding: '6px 12px',
                    background: '#feebc8',
                    color: '#c05621',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    ⏳ {pendingPledges.length} Pending
                  </span>
                  {partialPledges.length > 0 && (
                    <span style={{
                      padding: '6px 12px',
                      background: '#bee3f8',
                      color: '#2b6cb0',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      📊 {partialPledges.length} Partial
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'pledges' && (
            <div>
              {memberPledges.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px', color: '#a0aec0' }}>
                  <div style={{ fontSize: '40px', marginBottom: '8px' }}>💰</div>
                  <p>No pledges yet</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {memberPledges.map(pledge => (
                    <div
                      key={pledge.id}
                      style={{
                        padding: '12px',
                        background: '#f7fafc',
                        borderRadius: '10px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: '600', color: '#2d3748', fontSize: '15px' }}>
                          {currencySymbol}{parseFloat(pledge.amount).toLocaleString()}
                        </div>
                        <div style={{ fontSize: '12px', color: '#718096' }}>
                          {formatTimeAgo(pledge.created_at)}
                        </div>
                      </div>
                      <span style={{
                        padding: '4px 10px',
                        background: pledge.status === 'paid' ? '#c6f6d5' : pledge.status === 'partial' ? '#feebc8' : '#fed7d7',
                        color: pledge.status === 'paid' ? '#276749' : pledge.status === 'partial' ? '#c05621' : '#c53030',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: '600',
                        textTransform: 'capitalize'
                      }}>
                        {pledge.status === 'paid' && '✅'} {pledge.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{ 
          padding: '16px 24px', 
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          gap: '10px'
        }}>
          {!isCurrentUser && onMessage && (
            <button
              onClick={() => onMessage(member)}
              style={{
                flex: 1,
                padding: '12px',
                background: '#38b2ac',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              💬 Send Message
            </button>
          )}
          
          {isAdmin && !isCurrentUser && (
            <>
              {memberRole !== 'admin' && onPromote && (
                <button
                  onClick={() => onPromote(member)}
                  style={{
                    padding: '12px 16px',
                    background: '#9f7aea',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  ⬆️ Promote
                </button>
              )}
              {memberRole === 'admin' && onDemote && (
                <button
                  onClick={() => onDemote(member)}
                  style={{
                    padding: '12px 16px',
                    background: '#ed8936',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  ⬇️ Demote
                </button>
              )}
              {onRemove && (
                <button
                  onClick={() => onRemove(member)}
                  style={{
                    padding: '12px 16px',
                    background: '#e53e3e',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  🗑️ Remove
                </button>
              )}
            </>
          )}
          
          <button
            onClick={onClose}
            style={{
              flex: isCurrentUser ? 1 : 'none',
              padding: '12px 20px',
              background: '#e2e8f0',
              color: '#4a5568',
              border: 'none',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default MemberProfileModal;
