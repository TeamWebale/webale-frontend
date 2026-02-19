import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';
import { useLanguage } from '../context/LanguageContext';
import { messagesAPI } from '../services/api';

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
  const [activeTab, setActiveTab] = useState('notifications');
  const [messages, setMessages] = useState([]);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [activeConversation, setActiveConversation] = useState(null); // { groupId, userId, userName }
  const [conversationMessages, setConversationMessages] = useState([]);
  const [conversationLoading, setConversationLoading] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [conversations, setConversations] = useState([]);
  const dropdownRef = useRef(null);
  const messagesEndRef = useRef(null);

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

  // Fetch unread message count
  const fetchUnreadMessages = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await messagesAPI.getUnreadCount();
      const data = res.data.data || res.data;
      const totalUnread = data.totalUnread || 0;
      const groups = data.byGroup || [];
      setUnreadMessages(totalUnread);
      setMessages(Array.isArray(groups) ? groups : []);
    } catch (err) {
      // Silently fail — endpoint might not exist yet
      setUnreadMessages(0);
    }
  }, []);

  useEffect(() => {
    fetchUnreadMessages();
    const interval = setInterval(fetchUnreadMessages, 30000);
    return () => clearInterval(interval);
  }, [fetchUnreadMessages]);

  const totalBadge = unreadCount + unreadMessages;

  const formatTimeAgo = (dateString) => {
    if (!dateString) return '';
    const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return new Date(dateString).toLocaleDateString();
  };

  const getNotificationIcon = (type) => {
    const icons = {
      pledge_created: '💰', pledge_paid: '✅', pledge_reminder: '⏰',
      member_joined: '👋', member_left: '🚪', group_invite: '📨',
      group_updated: '✏️', comment: '💬', milestone: '🎯',
      goal_reached: '🎉', payment_received: '💵', admin_action: '🛡️',
      message: '✉️'
    };
    return icons[type] || '🔔';
  };

  const getNotificationColor = (type) => {
    const colors = {
      pledge_created: '#667eea', pledge_paid: '#48bb78', payment_received: '#48bb78',
      goal_reached: '#48bb78', pledge_reminder: '#ed8936', member_joined: '#4299e1',
      group_invite: '#4299e1', member_left: '#a0aec0', milestone: '#9f7aea',
      admin_action: '#e53e3e', message: '#667eea'
    };
    return colors[type] || '#718096';
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }
    if (notification.group_id) {
      navigate(`/groups/${notification.group_id}`);
    }
    setShowDropdown(false);
  };

  const handleMessageGroupClick = async (msg) => {
    // Load conversations for this group
    setActiveConversation({ groupId: msg.group_id, groupName: msg.group_name });
    setConversationLoading(true);
    try {
      const res = await messagesAPI.getConversations(msg.group_id);
      const convos = res.data.data?.conversations || res.data.conversations || res.data.data || [];
      setConversations(Array.isArray(convos) ? convos : []);
    } catch (err) {
      console.error('Failed to load conversations:', err);
      setConversations([]);
    } finally {
      setConversationLoading(false);
    }
  };

  const openThread = async (groupId, userId, userName) => {
    setActiveConversation(prev => ({ ...prev, userId, userName }));
    setConversationLoading(true);
    try {
      const res = await messagesAPI.getMessages(groupId, userId);
      const msgs = res.data.data?.messages || res.data.messages || res.data.data || [];
      setConversationMessages(Array.isArray(msgs) ? msgs : []);
      // Mark as read
      try { await messagesAPI.markAsRead(groupId, userId); } catch (e) {}
      fetchUnreadMessages();
    } catch (err) {
      console.error('Failed to load messages:', err);
      setConversationMessages([]);
    } finally {
      setConversationLoading(false);
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim() || !activeConversation?.userId || !activeConversation?.groupId) return;
    setSending(true);
    try {
      await messagesAPI.sendMessage(activeConversation.groupId, {
        recipientId: activeConversation.userId,
        content: replyText.trim()
      });
      setReplyText('');
      // Reload thread
      await openThread(activeConversation.groupId, activeConversation.userId, activeConversation.userName);
    } catch (err) {
      console.error('Failed to send reply:', err);
    } finally {
      setSending(false);
    }
  };

  const goBackToConversations = () => {
    setActiveConversation(prev => prev ? { groupId: prev.groupId, groupName: prev.groupName } : null);
    setConversationMessages([]);
    setReplyText('');
  };

  const goBackToGroups = () => {
    setActiveConversation(null);
    setConversations([]);
    setConversationMessages([]);
    setReplyText('');
  };

  const currentUser = (() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; }
  })();

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
        title="Notifications & Messages"
      >
        🔔
        {totalBadge > 0 && (
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
            {totalBadge > 99 ? '99+' : totalBadge}
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
          width: '380px',
          maxHeight: '520px',
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 10px 50px rgba(0,0,0,0.2)',
          overflow: 'hidden',
          zIndex: 1000
        }}>
          {/* Tabs */}
          <div style={{
            display: 'flex',
            borderBottom: '2px solid #e2e8f0',
            background: '#f7fafc'
          }}>
            <button onClick={() => setActiveTab('notifications')} style={{
              flex: 1, padding: '14px', border: 'none', cursor: 'pointer',
              fontSize: '14px', fontWeight: '600',
              background: activeTab === 'notifications' ? 'white' : 'transparent',
              color: activeTab === 'notifications' ? '#667eea' : '#718096',
              borderBottom: activeTab === 'notifications' ? '3px solid #667eea' : '3px solid transparent'
            }}>
              🔔 Alerts {unreadCount > 0 && (
                <span style={{
                  background: '#e53e3e', color: 'white', fontSize: '11px',
                  padding: '1px 7px', borderRadius: '10px', marginLeft: '6px'
                }}>{unreadCount}</span>
              )}
            </button>
            <button onClick={() => setActiveTab('messages')} style={{
              flex: 1, padding: '14px', border: 'none', cursor: 'pointer',
              fontSize: '14px', fontWeight: '600',
              background: activeTab === 'messages' ? 'white' : 'transparent',
              color: activeTab === 'messages' ? '#667eea' : '#718096',
              borderBottom: activeTab === 'messages' ? '3px solid #667eea' : '3px solid transparent'
            }}>
              ✉️ Messages {unreadMessages > 0 && (
                <span style={{
                  background: '#e53e3e', color: 'white', fontSize: '11px',
                  padding: '1px 7px', borderRadius: '10px', marginLeft: '6px'
                }}>{unreadMessages}</span>
              )}
            </button>
          </div>

          {/* NOTIFICATIONS TAB */}
          {activeTab === 'notifications' && (
            <>
              {/* Header */}
              {unreadCount > 0 && (
                <div style={{
                  padding: '10px 16px',
                  borderBottom: '1px solid #e2e8f0',
                  display: 'flex',
                  justifyContent: 'flex-end'
                }}>
                  <button onClick={markAllAsRead} style={{
                    background: 'none', border: 'none', color: '#667eea',
                    fontSize: '13px', cursor: 'pointer', fontWeight: '600'
                  }}>
                    Mark all as read
                  </button>
                </div>
              )}

              {/* List */}
              <div style={{ maxHeight: '380px', overflowY: 'auto' }}>
                {loading ? (
                  <div style={{ padding: '40px', textAlign: 'center' }}>
                    <div className="spinner" style={{ width: '24px', height: '24px', margin: '0 auto' }}></div>
                  </div>
                ) : notifications.length === 0 ? (
                  <div style={{ padding: '40px 20px', textAlign: 'center', color: '#a0aec0' }}>
                    <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔕</div>
                    <p style={{ margin: 0, fontSize: '14px' }}>No notifications yet</p>
                    <p style={{ margin: '6px 0 0', fontSize: '12px' }}>You'll see alerts for pledges, members, and milestones here</p>
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
                      <div style={{
                        width: '40px', height: '40px', borderRadius: '10px',
                        background: `${getNotificationColor(notification.type)}15`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '18px', flexShrink: 0
                      }}>
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{
                          margin: 0, fontSize: '14px', color: '#2d3748',
                          fontWeight: notification.is_read ? '400' : '600', lineHeight: '1.4'
                        }}>
                          {notification.title || notification.message}
                        </p>
                        {notification.message && notification.title && (
                          <p style={{
                            margin: '4px 0 0', fontSize: '13px', color: '#718096',
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                          }}>
                            {notification.message}
                          </p>
                        )}
                        <p style={{ margin: '6px 0 0', fontSize: '12px', color: '#a0aec0' }}>
                          {formatTimeAgo(notification.created_at)}
                          {notification.group_name && <span> • {notification.group_name}</span>}
                        </p>
                      </div>
                      {!notification.is_read && (
                        <div style={{
                          width: '8px', height: '8px', borderRadius: '50%',
                          background: '#667eea', flexShrink: 0, marginTop: '6px'
                        }} />
                      )}
                      <button onClick={(e) => { e.stopPropagation(); deleteNotification(notification.id); }}
                        style={{
                          background: 'none', border: 'none', color: '#a0aec0',
                          cursor: 'pointer', padding: '4px', fontSize: '14px', opacity: 0.6, flexShrink: 0
                        }} title="Delete">✕</button>
                    </div>
                  ))
                )}
              </div>
            </>
          )}

          {/* MESSAGES TAB */}
          {activeTab === 'messages' && (
            <div style={{ maxHeight: '420px', overflowY: 'auto' }}>

              {/* LEVEL 3: Message Thread */}
              {activeConversation?.userId ? (
                <>
                  <div style={{
                    padding: '12px 16px', borderBottom: '1px solid #e2e8f0',
                    display: 'flex', alignItems: 'center', gap: '10px', background: '#f7fafc'
                  }}>
                    <button onClick={goBackToConversations} style={{
                      background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: '#667eea', padding: 0
                    }}>←</button>
                    <div>
                      <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#2d3748' }}>{activeConversation.userName}</p>
                      <p style={{ margin: 0, fontSize: '11px', color: '#a0aec0' }}>{activeConversation.groupName}</p>
                    </div>
                  </div>
                  <div style={{ maxHeight: '280px', overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {conversationLoading ? (
                      <div style={{ padding: '30px', textAlign: 'center' }}>
                        <div className="spinner" style={{ width: '20px', height: '20px', margin: '0 auto' }}></div>
                      </div>
                    ) : conversationMessages.length === 0 ? (
                      <p style={{ textAlign: 'center', color: '#a0aec0', fontSize: '13px', padding: '20px 0' }}>No messages yet</p>
                    ) : (
                      conversationMessages.map(m => {
                        const isMe = String(m.sender_id) === String(currentUser.id);
                        return (
                          <div key={m.id} style={{
                            alignSelf: isMe ? 'flex-end' : 'flex-start',
                            maxWidth: '80%'
                          }}>
                            <div style={{
                              padding: '8px 12px',
                              borderRadius: isMe ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                              background: isMe ? '#667eea' : '#f0f0f0',
                              color: isMe ? 'white' : '#2d3748',
                              fontSize: '13px', lineHeight: '1.4'
                            }}>
                              {m.content}
                            </div>
                            <p style={{
                              fontSize: '10px', color: '#a0aec0', margin: '2px 4px 0',
                              textAlign: isMe ? 'right' : 'left'
                            }}>
                              {formatTimeAgo(m.created_at)}
                            </p>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                  {/* Reply input */}
                  <div style={{
                    padding: '10px 16px', borderTop: '1px solid #e2e8f0',
                    display: 'flex', gap: '8px', background: '#f7fafc'
                  }}>
                    <input
                      type="text" value={replyText}
                      onChange={e => setReplyText(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendReply(); } }}
                      placeholder="Type a reply..."
                      style={{
                        flex: 1, padding: '8px 12px', border: '1px solid #e2e8f0',
                        borderRadius: '20px', fontSize: '13px', outline: 'none'
                      }}
                    />
                    <button onClick={handleSendReply} disabled={sending || !replyText.trim()} style={{
                      background: '#667eea', color: 'white', border: 'none',
                      borderRadius: '50%', width: '36px', height: '36px',
                      cursor: 'pointer', fontSize: '16px', display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                      opacity: sending || !replyText.trim() ? 0.5 : 1
                    }}>
                      {sending ? '...' : '➤'}
                    </button>
                  </div>
                </>

              /* LEVEL 2: Conversations in a group */
              ) : activeConversation?.groupId ? (
                <>
                  <div style={{
                    padding: '12px 16px', borderBottom: '1px solid #e2e8f0',
                    display: 'flex', alignItems: 'center', gap: '10px', background: '#f7fafc'
                  }}>
                    <button onClick={goBackToGroups} style={{
                      background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: '#667eea', padding: 0
                    }}>←</button>
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#2d3748' }}>
                      {activeConversation.groupName}
                    </p>
                  </div>
                  {conversationLoading ? (
                    <div style={{ padding: '40px', textAlign: 'center' }}>
                      <div className="spinner" style={{ width: '24px', height: '24px', margin: '0 auto' }}></div>
                    </div>
                  ) : conversations.length === 0 ? (
                    <div style={{ padding: '40px 20px', textAlign: 'center', color: '#a0aec0' }}>
                      <div style={{ fontSize: '40px', marginBottom: '12px' }}>💬</div>
                      <p style={{ margin: 0, fontSize: '14px' }}>No conversations yet</p>
                      <p style={{ margin: '6px 0 0', fontSize: '12px' }}>Messages sent within this group will appear here</p>
                    </div>
                  ) : (
                    conversations.map((convo, i) => (
                      <div key={i}
                        onClick={() => openThread(activeConversation.groupId, convo.other_user_id, `${convo.first_name} ${convo.last_name}`)}
                        style={{
                          padding: '14px 16px', borderBottom: '1px solid #f0f0f0',
                          cursor: 'pointer', display: 'flex', gap: '12px',
                          background: parseInt(convo.unread_count || 0) > 0 ? '#f0f7ff' : 'white'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#f7fafc'}
                        onMouseLeave={(e) => e.currentTarget.style.background = parseInt(convo.unread_count || 0) > 0 ? '#f0f7ff' : 'white'}
                      >
                        <div style={{
                          width: '40px', height: '40px', borderRadius: '50%',
                          background: '#667eea20', display: 'flex', alignItems: 'center',
                          justifyContent: 'center', fontSize: convo.avatar_url ? '22px' : '14px',
                          fontWeight: 'bold', color: '#667eea', flexShrink: 0
                        }}>
                          {convo.avatar_url || `${convo.first_name?.charAt(0) || ''}${convo.last_name?.charAt(0) || ''}`}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{
                            margin: 0, fontSize: '14px', color: '#2d3748',
                            fontWeight: parseInt(convo.unread_count || 0) > 0 ? '700' : '500'
                          }}>
                            {convo.first_name} {convo.last_name}
                          </p>
                          {convo.last_message && (
                            <p style={{
                              margin: '3px 0 0', fontSize: '12px', color: '#718096',
                              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                            }}>
                              {convo.last_message}
                            </p>
                          )}
                          <p style={{ margin: '3px 0 0', fontSize: '11px', color: '#a0aec0' }}>
                            {formatTimeAgo(convo.last_message_at)}
                          </p>
                        </div>
                        {parseInt(convo.unread_count || 0) > 0 && (
                          <span style={{
                            background: '#e53e3e', color: 'white', fontSize: '11px',
                            fontWeight: 'bold', minWidth: '22px', height: '22px',
                            borderRadius: '11px', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', padding: '0 6px', flexShrink: 0, alignSelf: 'center'
                          }}>{convo.unread_count}</span>
                        )}
                      </div>
                    ))
                  )}
                </>

              /* LEVEL 1: Groups with messages */
              ) : (
                <>
                  {messagesLoading ? (
                    <div style={{ padding: '40px', textAlign: 'center' }}>
                      <div className="spinner" style={{ width: '24px', height: '24px', margin: '0 auto' }}></div>
                    </div>
                  ) : messages.length === 0 ? (
                    <div style={{ padding: '40px 20px', textAlign: 'center', color: '#a0aec0' }}>
                      <div style={{ fontSize: '40px', marginBottom: '12px' }}>✉️</div>
                      <p style={{ margin: 0, fontSize: '14px' }}>No messages yet</p>
                      <p style={{ margin: '6px 0 0', fontSize: '12px' }}>Send messages to group members from within any group</p>
                    </div>
                  ) : (
                    messages.map((msg, i) => (
                      <div
                        key={i}
                        onClick={() => handleMessageGroupClick(msg)}
                        style={{
                          padding: '14px 16px',
                          borderBottom: '1px solid #f0f0f0',
                          cursor: 'pointer',
                          background: parseInt(msg.total_unread || 0) > 0 ? '#f0f7ff' : 'white',
                          display: 'flex',
                          gap: '12px',
                          transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#f7fafc'}
                        onMouseLeave={(e) => e.currentTarget.style.background = parseInt(msg.total_unread || 0) > 0 ? '#f0f7ff' : 'white'}
                      >
                        <div style={{
                          width: '40px', height: '40px', borderRadius: '10px',
                          background: '#667eea15',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '18px', flexShrink: 0
                        }}>
                          💬
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{
                            margin: 0, fontSize: '14px', color: '#2d3748',
                            fontWeight: parseInt(msg.total_unread || 0) > 0 ? '600' : '400'
                          }}>
                            {msg.group_name || `Group ${msg.group_id}`}
                          </p>
                          {msg.last_message && (
                            <p style={{
                              margin: '4px 0 0', fontSize: '13px', color: '#718096',
                              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                            }}>
                              {msg.sender_name ? `${msg.sender_name}: ` : ''}{msg.last_message}
                            </p>
                          )}
                          <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#a0aec0' }}>
                            {formatTimeAgo(msg.last_message_at)}
                          </p>
                        </div>
                        {parseInt(msg.total_unread || 0) > 0 && (
                          <span style={{
                            background: '#e53e3e', color: 'white', fontSize: '11px',
                            fontWeight: 'bold', minWidth: '22px', height: '22px',
                            borderRadius: '11px', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', padding: '0 6px', flexShrink: 0,
                            alignSelf: 'center'
                          }}>
                            {msg.total_unread}
                          </span>
                        )}
                      </div>
                    ))
                  )}
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
