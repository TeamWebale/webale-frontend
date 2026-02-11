import { useState, useEffect, useRef } from 'react';
import { messagesAPI } from '../services/api';
import { useToast } from './Toast';
import { formatTimeAgo } from '../utils/timeFormatter';
import { getCountryFlag } from '../utils/countries';

function MessagesModal({ groupId, members, onClose }) {
  const { showToast } = useToast();
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [view, setView] = useState('conversations'); // 'conversations', 'chat', 'new'
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const currentUser = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    loadConversations();
    
    // Poll for new messages every 5 seconds
    const interval = setInterval(() => {
      if (selectedUser) {
        loadMessages(selectedUser.other_user_id || selectedUser.id, false);
      }
      loadConversations(false);
    }, 5000);

    return () => clearInterval(interval);
  }, [groupId, selectedUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (view === 'chat' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [view, selectedUser]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const response = await messagesAPI.getConversations(groupId);
      setConversations(response.data.data.conversations || []);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const loadMessages = async (userId, showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const response = await messagesAPI.getMessages(groupId, userId);
      setMessages(response.data.data.messages || []);
      
      // Mark messages as read
      await messagesAPI.markAsRead(groupId, userId);
      loadConversations(false);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const handleSelectConversation = (conversation) => {
    setSelectedUser(conversation);
    setView('chat');
    loadMessages(conversation.other_user_id);
  };

  const handleSelectNewUser = (member) => {
    setSelectedUser({
      other_user_id: member.id,
      first_name: member.first_name,
      last_name: member.last_name,
      country: member.country,
      avatar_url: member.avatar_url,
      avatar_type: member.avatar_type,
      last_active: member.last_active
    });
    setView('chat');
    loadMessages(member.id);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;

    setSending(true);
    try {
      const recipientId = selectedUser.other_user_id || selectedUser.id;
      await messagesAPI.sendMessage(groupId, recipientId, newMessage.trim());
      setNewMessage('');
      loadMessages(recipientId, false);
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to send message', 'error');
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const isOnline = (lastActive) => {
    if (!lastActive) return false;
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    return new Date(lastActive) > fiveMinutesAgo;
  };

  const getTotalUnread = () => {
    return conversations.reduce((sum, c) => sum + (parseInt(c.unread_count) || 0), 0);
  };

  const renderAvatar = (user, size = 40) => {
    const initials = `${user.first_name?.charAt(0) || ''}${user.last_name?.charAt(0) || ''}`;
    
    if (user.avatar_type === 'emoji' && user.avatar_url) {
      return (
        <div style={{
          width: size,
          height: size,
          borderRadius: '50%',
          background: '#f7fafc',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: size * 0.5,
          border: '2px solid #e2e8f0',
          position: 'relative'
        }}>
          {user.avatar_url}
        </div>
      );
    }

    return (
      <div style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: size * 0.35,
        fontWeight: 'bold',
        position: 'relative'
      }}>
        {initials}
      </div>
    );
  };

  const availableMembers = members.filter(m => 
    m.id !== currentUser?.id && 
    !conversations.some(c => c.other_user_id === m.id)
  );

  return (
    <div style={{
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
    }} onClick={onClose}>
      <div 
        className="card" 
        style={{ 
          width: '700px', 
          maxWidth: '95vw', 
          height: '600px', 
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          overflow: 'hidden'
        }} 
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {view !== 'conversations' && (
              <button
                onClick={() => { setView('conversations'); setSelectedUser(null); }}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                ← Back
              </button>
            )}
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>
              {view === 'conversations' && `💬 Messages ${getTotalUnread() > 0 ? `(${getTotalUnread()} unread)` : ''}`}
              {view === 'new' && '👤 New Message'}
              {view === 'chat' && selectedUser && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {selectedUser.first_name} {selectedUser.last_name}
                  {selectedUser.country && <span style={{ fontSize: '16px' }}>{getCountryFlag(selectedUser.country)}</span>}
                  {isOnline(selectedUser.last_active) && (
                    <span style={{ 
                      width: '10px', 
                      height: '10px', 
                      borderRadius: '50%', 
                      background: '#48bb78',
                      border: '2px solid white'
                    }}></span>
                  )}
                </span>
              )}
            </h2>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {view === 'conversations' && (
              <button
                onClick={() => setView('new')}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                + New Chat
              </button>
            )}
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 12px',
                color: 'white',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          
          {/* Conversations List */}
          {view === 'conversations' && (
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
              {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                  <div className="spinner"></div>
                </div>
              ) : conversations.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                  <div style={{ fontSize: '64px', marginBottom: '16px' }}>💬</div>
                  <h3 style={{ color: '#2d3748', marginBottom: '8px' }}>No messages yet</h3>
                  <p style={{ color: '#718096', marginBottom: '20px' }}>Start a conversation with a group member</p>
                  <button
                    onClick={() => setView('new')}
                    className="btn btn-primary"
                  >
                    Start New Chat
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {conversations.map(conv => (
                    <div
                      key={conv.other_user_id}
                      onClick={() => handleSelectConversation(conv)}
                      style={{
                        padding: '12px 16px',
                        background: conv.unread_count > 0 ? '#ebf8ff' : '#f7fafc',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        border: conv.unread_count > 0 ? '2px solid #4299e1' : '1px solid #e2e8f0',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div style={{ position: 'relative' }}>
                        {renderAvatar(conv, 48)}
                        {isOnline(conv.last_active) && (
                          <div style={{
                            position: 'absolute',
                            bottom: 2,
                            right: 2,
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            background: '#48bb78',
                            border: '2px solid white'
                          }}></div>
                        )}
                      </div>
                      
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                          <span style={{ 
                            fontWeight: conv.unread_count > 0 ? '700' : '600', 
                            color: '#2d3748',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}>
                            {conv.first_name} {conv.last_name}
                            {conv.country && <span style={{ fontSize: '14px' }}>{getCountryFlag(conv.country)}</span>}
                          </span>
                          <span style={{ fontSize: '12px', color: '#a0aec0' }}>
                            {formatTimeAgo(conv.last_message_at)}
                          </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <p style={{ 
                            margin: 0, 
                            fontSize: '13px', 
                            color: conv.unread_count > 0 ? '#2d3748' : '#718096',
                            fontWeight: conv.unread_count > 0 ? '500' : 'normal',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: '280px'
                          }}>
                            {conv.last_message}
                          </p>
                          {conv.unread_count > 0 && (
                            <span style={{
                              background: '#e53e3e',
                              color: 'white',
                              borderRadius: '12px',
                              padding: '2px 8px',
                              fontSize: '12px',
                              fontWeight: 'bold',
                              minWidth: '24px',
                              textAlign: 'center'
                            }}>
                              {conv.unread_count}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* New Message - Select User */}
          {view === 'new' && (
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
              <p style={{ color: '#718096', marginBottom: '16px', fontSize: '14px' }}>
                Select a member to start a conversation:
              </p>
              {availableMembers.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <p style={{ color: '#718096' }}>
                    {members.length <= 1 
                      ? 'No other members in this group yet' 
                      : 'You already have conversations with all members'}
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {availableMembers.map(member => (
                    <div
                      key={member.id}
                      onClick={() => handleSelectNewUser(member)}
                      style={{
                        padding: '12px 16px',
                        background: '#f7fafc',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        border: '1px solid #e2e8f0',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div style={{ position: 'relative' }}>
                        {renderAvatar(member, 44)}
                        {isOnline(member.last_active) && (
                          <div style={{
                            position: 'absolute',
                            bottom: 2,
                            right: 2,
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            background: '#48bb78',
                            border: '2px solid white'
                          }}></div>
                        )}
                      </div>
                      <div>
                        <span style={{ fontWeight: '600', color: '#2d3748', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {member.first_name} {member.last_name}
                          {member.country && <span style={{ fontSize: '14px' }}>{getCountryFlag(member.country)}</span>}
                        </span>
                        <span style={{ fontSize: '12px', color: '#718096' }}>
                          {member.role === 'admin' ? '👑 Admin' : 'Member'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Chat View */}
          {view === 'chat' && selectedUser && (
            <>
              {/* Messages */}
              <div style={{ 
                flex: 1, 
                overflowY: 'auto', 
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                background: '#f7fafc'
              }}>
                {loading ? (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                    <div className="spinner"></div>
                  </div>
                ) : messages.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                    <div style={{ fontSize: '48px', marginBottom: '12px' }}>👋</div>
                    <p style={{ color: '#718096' }}>
                      No messages yet. Say hello to {selectedUser.first_name}!
                    </p>
                  </div>
                ) : (
                  messages.map(msg => {
                    const isOwn = msg.sender_id === currentUser?.id;
                    return (
                      <div
                        key={msg.id}
                        style={{
                          display: 'flex',
                          justifyContent: isOwn ? 'flex-end' : 'flex-start',
                          gap: '8px'
                        }}
                      >
                        {!isOwn && (
                          <div style={{ alignSelf: 'flex-end' }}>
                            {renderAvatar({
                              first_name: msg.sender_first_name,
                              last_name: msg.sender_last_name,
                              avatar_url: msg.sender_avatar_url,
                              avatar_type: msg.sender_avatar_type
                            }, 32)}
                          </div>
                        )}
                        <div style={{
                          maxWidth: '70%',
                          padding: '12px 16px',
                          borderRadius: isOwn ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                          background: isOwn 
                            ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                            : 'white',
                          color: isOwn ? 'white' : '#2d3748',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                        }}>
                          <p style={{ margin: 0, lineHeight: '1.4', wordBreak: 'break-word' }}>
                            {msg.content}
                          </p>
                          <p style={{ 
                            margin: '6px 0 0', 
                            fontSize: '11px', 
                            opacity: 0.7,
                            textAlign: 'right'
                          }}>
                            {formatTimeAgo(msg.created_at)}
                            {isOwn && msg.is_read && ' ✓✓'}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <form 
                onSubmit={handleSendMessage}
                style={{
                  padding: '12px 16px',
                  borderTop: '1px solid #e2e8f0',
                  display: 'flex',
                  gap: '12px',
                  background: 'white'
                }}
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  className="input"
                  style={{ 
                    flex: 1, 
                    borderRadius: '24px',
                    padding: '12px 20px'
                  }}
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || sending}
                  style={{
                    background: newMessage.trim() 
                      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                      : '#cbd5e0',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '48px',
                    height: '48px',
                    cursor: newMessage.trim() ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px'
                  }}
                >
                  {sending ? '...' : '➤'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default MessagesModal;
