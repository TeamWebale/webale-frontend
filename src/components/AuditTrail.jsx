import { useState, useEffect } from 'react';
import { formatTimeAgo } from '../utils/timeFormatter';

function AuditTrail({ groupId, auditLogs = [], onLoadMore, hasMore = false, loading = false }) {
  const [filter, setFilter] = useState('all');
  const [expandedLog, setExpandedLog] = useState(null);

  const ACTION_TYPES = {
    // Group actions
    group_created: { icon: '🏠', label: 'Group Created', color: '#48bb78' },
    group_updated: { icon: '✏️', label: 'Group Updated', color: '#4299e1' },
    group_settings_changed: { icon: '⚙️', label: 'Settings Changed', color: '#718096' },
    
    // Member actions
    member_joined: { icon: '👋', label: 'Member Joined', color: '#48bb78' },
    member_left: { icon: '🚪', label: 'Member Left', color: '#ed8936' },
    member_removed: { icon: '❌', label: 'Member Removed', color: '#e53e3e' },
    member_promoted: { icon: '⬆️', label: 'Promoted to Admin', color: '#9f7aea' },
    member_demoted: { icon: '⬇️', label: 'Demoted to Member', color: '#ed8936' },
    member_blocked: { icon: '🚫', label: 'Member Blocked', color: '#e53e3e' },
    member_unblocked: { icon: '✅', label: 'Member Unblocked', color: '#48bb78' },
    
    // Pledge actions
    pledge_created: { icon: '💰', label: 'Pledge Created', color: '#667eea' },
    pledge_updated: { icon: '📝', label: 'Pledge Updated', color: '#4299e1' },
    pledge_deleted: { icon: '🗑️', label: 'Pledge Deleted', color: '#e53e3e' },
    pledge_paid: { icon: '✅', label: 'Pledge Paid', color: '#48bb78' },
    pledge_partial: { icon: '📊', label: 'Partial Payment', color: '#ed8936' },
    
    // Contribution actions
    contribution_added: { icon: '💵', label: 'Contribution Added', color: '#48bb78' },
    contribution_manual: { icon: '📋', label: 'Manual Contribution', color: '#4299e1' },
    
    // Admin actions
    ownership_transferred: { icon: '👑', label: 'Ownership Transferred', color: '#9f7aea' },
    invite_sent: { icon: '📧', label: 'Invite Sent', color: '#4299e1' },
    invite_accepted: { icon: '🤝', label: 'Invite Accepted', color: '#48bb78' },
    
    // Other
    comment_added: { icon: '💬', label: 'Comment Added', color: '#718096' },
    reminder_sent: { icon: '🔔', label: 'Reminder Sent', color: '#ed8936' },
    subgoal_created: { icon: '🎯', label: 'Milestone Created', color: '#667eea' },
    subgoal_completed: { icon: '🏆', label: 'Milestone Completed', color: '#48bb78' }
  };

  const getActionInfo = (actionType) => {
    return ACTION_TYPES[actionType] || { icon: '📌', label: actionType, color: '#718096' };
  };

  const filteredLogs = filter === 'all' 
    ? auditLogs 
    : auditLogs.filter(log => {
        if (filter === 'members') {
          return ['member_joined', 'member_left', 'member_removed', 'member_promoted', 'member_demoted', 'member_blocked', 'member_unblocked'].includes(log.action_type);
        }
        if (filter === 'pledges') {
          return ['pledge_created', 'pledge_updated', 'pledge_deleted', 'pledge_paid', 'pledge_partial', 'contribution_added', 'contribution_manual'].includes(log.action_type);
        }
        if (filter === 'admin') {
          return ['group_updated', 'group_settings_changed', 'ownership_transferred', 'member_promoted', 'member_demoted', 'member_blocked', 'member_unblocked'].includes(log.action_type);
        }
        return true;
      });

  const formatDetails = (details) => {
    if (!details || typeof details !== 'object') return null;
    
    return Object.entries(details).map(([key, value]) => (
      <div key={key} style={{ display: 'flex', gap: '8px', fontSize: '13px' }}>
        <span style={{ color: '#718096', minWidth: '100px' }}>
          {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:
        </span>
        <span style={{ color: '#2d3748', fontWeight: '500' }}>
          {typeof value === 'object' ? JSON.stringify(value) : String(value)}
        </span>
      </div>
    ));
  };

  return (
    <div className="card">
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          📜 Audit Trail
        </h3>
        
        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {[
            { value: 'all', label: 'All' },
            { value: 'members', label: 'Members' },
            { value: 'pledges', label: 'Pledges' },
            { value: 'admin', label: 'Admin' }
          ].map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                border: 'none',
                background: filter === f.value ? '#667eea' : '#f7fafc',
                color: filter === f.value ? 'white' : '#4a5568',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '500'
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline */}
      {filteredLogs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#a0aec0' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>📜</div>
          <p>No activity logs yet</p>
        </div>
      ) : (
        <div style={{ position: 'relative' }}>
          {/* Timeline Line */}
          <div style={{
            position: 'absolute',
            left: '20px',
            top: '0',
            bottom: '0',
            width: '2px',
            background: '#e2e8f0'
          }} />

          {/* Log Entries */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {filteredLogs.map((log, index) => {
              const actionInfo = getActionInfo(log.action_type);
              const isExpanded = expandedLog === log.id;
              
              return (
                <div 
                  key={log.id || index}
                  style={{
                    display: 'flex',
                    gap: '16px',
                    paddingLeft: '8px'
                  }}
                >
                  {/* Timeline Dot */}
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: actionInfo.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    flexShrink: 0,
                    zIndex: 1,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}>
                    {actionInfo.icon}
                  </div>

                  {/* Content */}
                  <div 
                    style={{
                      flex: 1,
                      padding: '12px 16px',
                      background: isExpanded ? '#f7fafc' : 'white',
                      borderRadius: '10px',
                      border: '1px solid #e2e8f0',
                      cursor: log.details ? 'pointer' : 'default'
                    }}
                    onClick={() => log.details && setExpandedLog(isExpanded ? null : log.id)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <span style={{ 
                          fontWeight: '600', 
                          color: '#2d3748',
                          fontSize: '14px'
                        }}>
                          {log.actor_name || 'System'}
                        </span>
                        <span style={{ color: '#718096', fontSize: '14px' }}>
                          {' '}{actionInfo.label.toLowerCase()}
                        </span>
                        {log.target_name && (
                          <span style={{ color: '#2d3748', fontWeight: '500', fontSize: '14px' }}>
                            {' '}{log.target_name}
                          </span>
                        )}
                      </div>
                      <span style={{ 
                        color: '#a0aec0', 
                        fontSize: '12px',
                        whiteSpace: 'nowrap',
                        marginLeft: '12px'
                      }}>
                        {formatTimeAgo(log.created_at)}
                      </span>
                    </div>

                    {/* Description */}
                    {log.description && (
                      <p style={{ 
                        margin: '8px 0 0', 
                        color: '#718096', 
                        fontSize: '13px',
                        lineHeight: '1.4'
                      }}>
                        {log.description}
                      </p>
                    )}

                    {/* Expanded Details */}
                    {isExpanded && log.details && (
                      <div style={{
                        marginTop: '12px',
                        padding: '12px',
                        background: 'white',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0'
                      }}>
                        <div style={{ 
                          fontSize: '12px', 
                          fontWeight: '600', 
                          color: '#718096', 
                          marginBottom: '8px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}>
                          Details
                        </div>
                        {formatDetails(log.details)}
                      </div>
                    )}

                    {/* Expand Indicator */}
                    {log.details && (
                      <div style={{ 
                        marginTop: '8px', 
                        fontSize: '12px', 
                        color: '#667eea',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        {isExpanded ? '▲ Hide details' : '▼ Show details'}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Load More */}
          {hasMore && (
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <button
                onClick={onLoadMore}
                disabled={loading}
                className="btn"
                style={{ background: '#e2e8f0', color: '#4a5568' }}
              >
                {loading ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AuditTrail;
