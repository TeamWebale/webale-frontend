import { useState } from 'react';
import { getCountryFlag, getCountryName } from '../utils/countries';
import { getCurrencySymbol } from '../utils/currencyConverter';
import { formatTimeAgo } from '../utils/timeFormatter';

function MemberProfileCard({ 
  member, 
  pledges = [], 
  groupCurrency = 'USD',
  isAdmin = false,
  currentUserId = null,
  onViewProfile,
  onMessage,
  onPromote,
  onDemote,
  onRemove,
  compact = false
}) {
  const [showActions, setShowActions] = useState(false);

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

  if (compact) {
    // Compact version for lists
    return (
      <div
        onClick={() => onViewProfile?.(member)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '10px 12px',
          background: '#f7fafc',
          borderRadius: '10px',
          cursor: 'pointer',
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = '#edf2f7'}
        onMouseLeave={(e) => e.currentTarget.style.background = '#f7fafc'}
      >
        {/* Avatar */}
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          background: getAvatarColor(),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 'bold',
          fontSize: '14px',
          flexShrink: 0
        }}>
          {getInitials()}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontWeight: '600', color: '#2d3748', fontSize: '14px' }}>
              {member.first_name} {member.last_name}
            </span>
            {member.country && (
              <span style={{ fontSize: '14px' }}>{getCountryFlag(member.country)}</span>
            )}
            {isCurrentUser && (
              <span style={{ fontSize: '10px', color: '#667eea' }}>(you)</span>
            )}
          </div>
          <div style={{ fontSize: '12px', color: '#718096' }}>
            {currencySymbol}{totalPledged.toLocaleString()} pledged
          </div>
        </div>

        {/* Role Badge */}
        <span style={{
          padding: '3px 8px',
          background: memberRole === 'admin' ? '#9f7aea' : '#e2e8f0',
          color: memberRole === 'admin' ? 'white' : '#4a5568',
          borderRadius: '12px',
          fontSize: '10px',
          fontWeight: '600',
          textTransform: 'capitalize'
        }}>
          {memberRole}
        </span>
      </div>
    );
  }

  // Full card version
  return (
    <div
      style={{
        background: 'white',
        borderRadius: '16px',
        padding: '20px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
        transition: 'transform 0.2s, box-shadow 0.2s',
        cursor: 'pointer',
        position: 'relative'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.12)';
        setShowActions(true);
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.08)';
        setShowActions(false);
      }}
      onClick={() => onViewProfile?.(member)}
    >
      {/* Role Badge */}
      <div style={{
        position: 'absolute',
        top: '12px',
        right: '12px'
      }}>
        <span style={{
          padding: '4px 10px',
          background: memberRole === 'admin' ? '#9f7aea' : memberRole === 'owner' ? '#ed8936' : '#e2e8f0',
          color: memberRole === 'admin' || memberRole === 'owner' ? 'white' : '#4a5568',
          borderRadius: '12px',
          fontSize: '11px',
          fontWeight: '600',
          textTransform: 'capitalize'
        }}>
          {memberRole === 'owner' ? '👑 Owner' : memberRole === 'admin' ? '🛡️ Admin' : 'Member'}
        </span>
      </div>

      {/* Avatar & Name */}
      <div style={{ textAlign: 'center', marginBottom: '16px' }}>
        <div style={{
          width: '70px',
          height: '70px',
          borderRadius: '50%',
          background: getAvatarColor(),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 'bold',
          fontSize: '24px',
          margin: '0 auto 12px',
          boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
        }}>
          {getInitials()}
        </div>
        
        <h3 style={{ 
          fontSize: '16px', 
          fontWeight: 'bold', 
          color: '#2d3748', 
          margin: '0 0 4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px'
        }}>
          {member.first_name} {member.last_name}
          {member.country && <span>{getCountryFlag(member.country)}</span>}
        </h3>
        
        {isCurrentUser && (
          <span style={{ 
            fontSize: '11px', 
            color: '#667eea',
            background: '#ebf8ff',
            padding: '2px 8px',
            borderRadius: '10px'
          }}>
            You
          </span>
        )}
      </div>

      {/* Stats */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '12px',
        marginBottom: '16px'
      }}>
        <div style={{ 
          textAlign: 'center', 
          padding: '12px', 
          background: '#f0fff4', 
          borderRadius: '10px' 
        }}>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#276749' }}>
            {currencySymbol}{totalPledged.toLocaleString()}
          </div>
          <div style={{ fontSize: '11px', color: '#48bb78' }}>Pledged</div>
        </div>
        <div style={{ 
          textAlign: 'center', 
          padding: '12px', 
          background: '#ebf8ff', 
          borderRadius: '10px' 
        }}>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#2b6cb0' }}>
            {currencySymbol}{totalPaid.toLocaleString()}
          </div>
          <div style={{ fontSize: '11px', color: '#4299e1' }}>Paid</div>
        </div>
      </div>

      {/* Member Info */}
      <div style={{ fontSize: '12px', color: '#718096', marginBottom: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span>Pledges:</span>
          <span style={{ fontWeight: '600', color: '#4a5568' }}>{memberPledges.length}</span>
        </div>
        {member.joined_at && (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Joined:</span>
            <span style={{ fontWeight: '600', color: '#4a5568' }}>{formatTimeAgo(member.joined_at)}</span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {showActions && !isCurrentUser && (
        <div style={{ 
          display: 'flex', 
          gap: '8px',
          paddingTop: '12px',
          borderTop: '1px solid #e2e8f0'
        }}>
          <button
            onClick={(e) => { e.stopPropagation(); onViewProfile?.(member); }}
            style={{
              flex: 1,
              padding: '8px',
              background: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '12px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            👤 Profile
          </button>
          {onMessage && (
            <button
              onClick={(e) => { e.stopPropagation(); onMessage?.(member); }}
              style={{
                flex: 1,
                padding: '8px',
                background: '#38b2ac',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '12px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              💬 Message
            </button>
          )}
        </div>
      )}

      {/* Admin Actions */}
      {isAdmin && !isCurrentUser && showActions && (
        <div style={{ 
          display: 'flex', 
          gap: '6px',
          marginTop: '8px'
        }}>
          {memberRole !== 'admin' && onPromote && (
            <button
              onClick={(e) => { e.stopPropagation(); onPromote?.(member); }}
              style={{
                flex: 1,
                padding: '6px',
                background: '#9f7aea',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '10px',
                cursor: 'pointer'
              }}
            >
              ⬆️ Promote
            </button>
          )}
          {memberRole === 'admin' && onDemote && (
            <button
              onClick={(e) => { e.stopPropagation(); onDemote?.(member); }}
              style={{
                flex: 1,
                padding: '6px',
                background: '#ed8936',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '10px',
                cursor: 'pointer'
              }}
            >
              ⬇️ Demote
            </button>
          )}
          {onRemove && (
            <button
              onClick={(e) => { e.stopPropagation(); onRemove?.(member); }}
              style={{
                flex: 1,
                padding: '6px',
                background: '#e53e3e',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '10px',
                cursor: 'pointer'
              }}
            >
              🗑️ Remove
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default MemberProfileCard;
