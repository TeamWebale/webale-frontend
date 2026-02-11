import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';
import { useLanguage } from '../context/LanguageContext';
import { formatTimeAgo } from '../utils/timeFormatter';

function NotificationBell() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { 
    notifications, 
    unreadCount, 
    loading,
    markAsRead, 
    markAllAsRead,
    deleteNotification 
  } = useNotifications();
  
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'pledge_created': return '💰';
      case 'pledge_paid': return '✅';
      case 'pledge_reminder': return '⏰';
      case 'member_joined': return '👋';
      case 'member_left': return '🚪';
      case 'group_invite': return '📨';
      case 'group_updated': return '✏️';
      case 'comment': return '💬';
      case 'milestone': return '🎯';
      case 'goal_reached': return '🎉';
      case 'payment_received': return '💵';
      case 'admin_action': return '🛡️';
      default: return '🔔';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'pledge_created': return '#667eea';
      case 'pledge_paid': 
      case 'payment_received':
      case 'goal_reached': return '#48bb78';
      case 'pledge_reminder': return '#ed8936';
      case 'member_joined':
      case 'group_invite': return '#4299e1';
      case 'member_left': return '#a0aec0';
      case 'milestone': return '#9f7aea';
      case 'admin_action': return '#e53e3e';
      default: return '#718096';
    }
  };

  const handleNotificationClick = async (notification) => {
    // Mark as read
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }

    // Navigate based on notification type
    if (notification.group_id) {
      navigate(`/groups/${notification.group_id}`);
    }

    setShowDropdown(false);
  };

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      {/* Bell Button */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        style={{
          background: 'rgba(255,255,255,0.15)',
          border: 'none',
          borderRadius: '8px',
          padding: '8px 12px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '18px',
          position: 'relative',
          transition: 'background 0.2s'
        }}
        title={t('notifications_title')}
      >
        🔔
        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '2px',
            right: '2px',
            background: '#e53e3e',
            color: 'white',
            fontSize: '10px',
            fontWeight: 'bold',
            minWidth: '18px',
            height: '18px',
            borderRadius: '9px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 4px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: 0,
          marginTop: '8px',
          width: '360px',
          maxHeight: '480px',
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 10px 50px rgba(0,0,0,0.2)',
          overflow: 'hidden',
          zIndex: 1000
        }}>
          {/* Header */}
          <div style={{
            padding: '16px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: '#f7fafc'
          }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: '#2d3748' }}>
              🔔 {t('notifications_title')}
              {unreadCount > 0 && (
                <span style={{
                  marginLeft: '8px',
                  background: '#e53e3e',
                  color: 'white',
                  fontSize: '12px',
                  padding: '2px 8px',
                  borderRadius: '10px'
                }}>
                  {unreadCount} new
                </span>
              )}
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#667eea',
                  fontSize: '13px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                {t('notifications_mark_read')}
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div style={{ maxHeight: '380px', overflowY: 'auto' }}>
            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center' }}>
                <div className="spinner" style={{ width: '24px', height: '24px', margin: '0 auto' }}></div>
              </div>
            ) : notifications.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: '#a0aec0' }}>
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔕</div>
                <p style={{ margin: 0, fontSize: '14px' }}>{t('notifications_none')}</p>
              </div>
            ) : (
              notifications.slice(0, 20).map(notification => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  style={{
                    padding: '14px 16px',
                    borderBottom: '1px solid #f0f0f0',
                    cursor: 'pointer',
                    background: notification.is_read ? 'white' : '#f0f7ff',
                    display: 'flex',
                    gap: '12px',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f7fafc'}
                  onMouseLeave={(e) => e.currentTarget.style.background = notification.is_read ? 'white' : '#f0f7ff'}
                >
                  {/* Icon */}
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    background: `${getNotificationColor(notification.type)}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    flexShrink: 0
                  }}>
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      margin: 0,
                      fontSize: '14px',
                      color: '#2d3748',
                      fontWeight: notification.is_read ? '400' : '600',
                      lineHeight: '1.4'
                    }}>
                      {notification.title || notification.message}
                    </p>
                    {notification.message && notification.title && (
                      <p style={{
                        margin: '4px 0 0',
                        fontSize: '13px',
                        color: '#718096',
                        lineHeight: '1.3',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {notification.message}
                      </p>
                    )}
                    <p style={{
                      margin: '6px 0 0',
                      fontSize: '12px',
                      color: '#a0aec0'
                    }}>
                      {formatTimeAgo(notification.created_at)}
                      {notification.group_name && (
                        <span style={{ marginLeft: '8px' }}>• {notification.group_name}</span>
                      )}
                    </p>
                  </div>

                  {/* Unread Dot */}
                  {!notification.is_read && (
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: '#667eea',
                      flexShrink: 0,
                      marginTop: '6px'
                    }} />
                  )}

                  {/* Delete Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(notification.id);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#a0aec0',
                      cursor: 'pointer',
                      padding: '4px',
                      fontSize: '14px',
                      opacity: 0.6,
                      flexShrink: 0
                    }}
                    title="Delete"
                  >
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div style={{
              padding: '12px 16px',
              borderTop: '1px solid #e2e8f0',
              background: '#f7fafc',
              textAlign: 'center'
            }}>
              <button
                onClick={() => {
                  navigate('/notifications');
                  setShowDropdown(false);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#667eea',
                  fontSize: '14px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                View All Notifications →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
