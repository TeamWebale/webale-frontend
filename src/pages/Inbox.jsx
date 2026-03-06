/**
 * Inbox.jsx — src/pages/Inbox.jsx
 * Direct messages inbox with thread view.
 * Route: /inbox
 */

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const API = 'https://webale-api.onrender.com/api';
const headers = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

function timeAgo(d) {
  const s = Math.floor((Date.now() - new Date(d)) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return Math.floor(s / 60) + 'm ago';
  if (s < 86400) return Math.floor(s / 3600) + 'h ago';
  return new Date(d).toLocaleDateString();
}

export default function Inbox() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [members, setMembers] = useState([]);
  const [selectedRecipient, setSelectedRecipient] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [mobileView, setMobileView] = useState('list');
  const [showBlocked, setShowBlocked] = useState(false);
  const bottomRef = useRef(null);

  // Blocked users — stored in localStorage per user
  const getBlockedKey = () => `blockedUsers_${user?.id || 'anon'}`;
  const [blockedUsers, setBlockedUsers] = useState(() => {
    try { return JSON.parse(localStorage.getItem(`blockedUsers_${null}`) || '[]'); } catch { return []; }
  });

  // Re-load blocked list once user is available
  useEffect(() => {
    if (user?.id) {
      try {
        const stored = JSON.parse(localStorage.getItem(getBlockedKey()) || '[]');
        setBlockedUsers(stored);
      } catch { setBlockedUsers([]); }
    }
  }, [user?.id]);

  const blockUser = (senderId, senderName) => {
    if (!senderId || senderId === user?.id) return;
    const updated = [...blockedUsers.filter(b => b.id !== senderId), { id: senderId, name: senderName }];
    setBlockedUsers(updated);
    localStorage.setItem(getBlockedKey(), JSON.stringify(updated));
  };

  const unblockUser = (senderId) => {
    const updated = blockedUsers.filter(b => b.id !== senderId);
    setBlockedUsers(updated);
    localStorage.setItem(getBlockedKey(), JSON.stringify(updated));
  };

  const isBlocked = (senderId) => blockedUsers.some(b => b.id === senderId);

  // Filter messages — hide messages from blocked users
  const visibleMessages = messages.filter(m => !isBlocked(m.sender_id));

  const handleDeleteMsg = async (msgId) => {
    if (!msgId || !selectedGroup) return;
    try {
      await axios.delete(`${API}/messages/${msgId}`, { headers: headers() });
      setMessages(prev => prev.filter(m => m.id !== msgId));
    } catch { /* silent */ }
  };

  const handleReplyTo = (content) => {
    const preview = (content || '').substring(0, 50).replace(/\n/g, ' ');
    setNewMsg(`↩ "${preview}..."\n\n`);
  };

  const handleForward = (content) => {
    const fwdText = `📨 Forwarded:\n${content || ''}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(fwdText);
      alert('Message copied to clipboard — paste it in the group you want to forward to.');
    }
  };

  useEffect(() => { loadGroups(); }, []);

  useEffect(() => {
    if (selectedGroup) {
      loadMessages(selectedGroup.id);
      loadMembers(selectedGroup.id);
    }
  }, [selectedGroup]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Poll for new messages every 15s
  useEffect(() => {
    if (!selectedGroup) return;
    const interval = setInterval(() => loadMessages(selectedGroup.id), 15000);
    return () => clearInterval(interval);
  }, [selectedGroup]);

  const loadGroups = async () => {
    try {
      const res = await axios.get(`${API}/messages/groups`, { headers: headers() });
      const data = res.data?.data || res.data || [];
      setGroups(data);
      if (data.length > 0 && !selectedGroup) setSelectedGroup(data[0]);
    } catch (err) {
      console.error('Load groups error:', err);
    } finally { setLoading(false); }
  };

  const loadMessages = async (groupId) => {
    try {
      const res = await axios.get(`${API}/messages/${groupId}`, { headers: headers() });
      const data = res.data?.data || [];
      setMessages([...data].reverse()); // API returns DESC, we want ASC
    } catch {}
  };

  const loadMembers = async (groupId) => {
    try {
      const res = await axios.get(`${API}/groups/${groupId}`, { headers: headers() });
      const m = res.data?.data?.members || res.data?.members || [];
      setMembers(m.filter(m => (m.user_id || m.id) !== user?.id));
    } catch {}
  };

  const sendMessage = async () => {
    if (!newMsg.trim() || !selectedGroup) return;
    setSending(true);
    try {
      await axios.post(`${API}/messages`, {
        group_id: selectedGroup.id,
        content: newMsg.trim(),
        recipient_id: selectedRecipient || null,
      }, { headers: headers() });
      setNewMsg('');
      await loadMessages(selectedGroup.id);
    } catch (err) {
      alert('Failed to send: ' + (err.response?.data?.message || err.message));
    } finally { setSending(false); }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  if (loading) return (
    <div style={s.loadWrap}>
      <div style={s.spinner} />
      <p style={{ color: '#94a3b8', marginTop: 12 }}>Loading messages…</p>
    </div>
  );

  return (
    <div style={s.page} className="inbox-page">
      {/* ── Left panel: group list ── */}
      <div style={s.leftPanel} className={`inbox-left ${mobileView === 'thread' ? 'inbox-hide-mobile' : ''}`}>
        <div style={s.leftHeader}>
          <h2 style={s.leftTitle}>💬 Messages</h2>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <button onClick={() => setShowBlocked(o => !o)} style={s.blockedToggle} title="Blocked users">
              🚫 {blockedUsers.length > 0 ? blockedUsers.length : ''}
            </button>
            <button onClick={() => navigate('/dashboard')} style={s.closeBtn}>✕</button>
          </div>
        </div>
        {showBlocked && (
          <div style={s.blockedPanel}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#1a202c', marginBottom: '8px' }}>Blocked Users</div>
            {blockedUsers.length === 0 ? (
              <div style={{ fontSize: '12px', color: '#8899AA' }}>No blocked users</div>
            ) : (
              blockedUsers.map(b => (
                <div key={b.id} style={s.blockedRow}>
                  <span style={{ fontSize: '13px', color: '#2d3748', fontWeight: 500 }}>{b.name || 'User'}</span>
                  <button onClick={() => unblockUser(b.id)} style={s.unblockBtn}>Unblock</button>
                </div>
              ))
            )}
          </div>
        )}
        {groups.length === 0 ? (
          <div style={s.empty}>No group conversations yet</div>
        ) : (
          groups.map(g => (
            <div
              key={g.id}
              onClick={() => { setSelectedGroup(g); setMobileView('thread'); }}
              style={{ ...s.groupRow, ...(selectedGroup?.id === g.id ? s.groupRowActive : {}) }}
            >
              <div style={s.groupAvatar}>{g.name?.[0]?.toUpperCase() || '?'}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={s.groupName}>{g.name}</div>
                <div style={s.groupPreview}>
                  {g.last_message ? g.last_message.substring(0, 40) + (g.last_message.length > 40 ? '…' : '') : 'No messages yet'}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                {g.last_message_at && <div style={s.timeStamp}>{timeAgo(g.last_message_at)}</div>}
                {g.unread_count > 0 && <div style={s.unreadBadge}>{g.unread_count}</div>}
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── Right panel: message thread ── */}
      <div style={s.rightPanel} className={`inbox-right ${mobileView === 'list' ? 'inbox-hide-mobile' : ''}`}>
        {!selectedGroup ? (
          <div style={s.noSelect}>Select a group to view messages</div>
        ) : (
          <>
            {/* Thread header */}
            <div style={s.threadHeader}>
              <button onClick={() => setMobileView('list')} className="inbox-back-btn" style={s.backBtn}>← Back</button>
              <div style={s.groupAvatar}>{selectedGroup.name?.[0]?.toUpperCase()}</div>
              <div>
                <div style={s.threadTitle}>{selectedGroup.name}</div>
                <div style={s.threadSub}>Group conversation</div>
              </div>
            </div>

            {/* Messages */}
            <div style={s.messageList} className="inbox-msg-list">
              {visibleMessages.length === 0 ? (
                <div style={s.noMessages}>No messages yet — say hello! 👋</div>
              ) : (
                [...visibleMessages].reverse().map(m => {
                  const isMe = m.sender_id === user?.id;
                  const senderName = isMe ? 'You' : `${m.first_name || ''} ${m.last_name || ''}`.trim();
                  const lines = (m.content || '').split(/\\n|\n/);
                  return (
                    <div key={m.id} className="inbox-msg-wrapper">
                      <div style={{ ...s.msgRow, justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                        {!isMe && (
                          <div style={s.msgAvatar}>{m.avatar_url || m.first_name?.[0] || '?'}</div>
                        )}
                        <div style={{ maxWidth: '75%', minWidth: 0 }}>
                          {!isMe && <div style={s.senderName}>{senderName}</div>}
                          <div className="inbox-bubble" style={{ ...s.bubble, ...(isMe ? s.bubbleMe : s.bubbleThem) }}>
                            {lines.map((line, i) => (
                              <span key={i}>{line}{i < lines.length - 1 && <br />}</span>
                            ))}
                          </div>
                          <div style={{ ...s.msgTime, textAlign: isMe ? 'right' : 'left' }}>{timeAgo(m.created_at)}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '4px', justifyContent: isMe ? 'flex-end' : 'flex-start', padding: '2px 0 4px', marginLeft: isMe ? 0 : '48px', flexWrap: 'wrap' }}>
                        <button onClick={() => handleReplyTo(m.content)} style={{ ...s.actionBtn, color: '#3182ce' }} title="Reply">↩ Reply</button>
                        <button onClick={() => handleForward(m.content)} style={{ ...s.actionBtn, color: '#38a169' }} title="Forward">⤳ Forward</button>
                        {isMe && <button onClick={() => handleDeleteMsg(m.id)} style={{ ...s.actionBtn, color: '#e53e3e' }} title="Delete">🗑 Delete</button>}
                        {!isMe && <button onClick={() => blockUser(m.sender_id, senderName)} style={{ ...s.actionBtn, color: '#e53e3e' }} title="Block user">🚫 Block</button>}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={bottomRef} />
            </div>

            {/* Compose */}
            <div style={s.compose}>
              {members.length > 0 && (
                <select
                  value={selectedRecipient}
                  onChange={e => setSelectedRecipient(e.target.value)}
                  style={s.recipientSelect}
                >
                  <option value="">To: Everyone</option>
                  {members.map(m => (
                    <option key={m.user_id || m.id} value={m.user_id || m.id}>
                      To: {m.first_name} {m.last_name}
                    </option>
                  ))}
                </select>
              )}
              <div style={s.composeRow}>
                <textarea
                  style={s.composeInput}
                  placeholder="Type a message… (Enter to send)"
                  value={newMsg}
                  onChange={e => setNewMsg(e.target.value)}
                  onKeyDown={handleKey}
                  rows={2}
                />
                <button
                  onClick={sendMessage}
                  disabled={sending || !newMsg.trim()}
                  style={{ ...s.sendBtn, opacity: sending || !newMsg.trim() ? 0.5 : 1 }}
                >
                  {sending ? '…' : '➤'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <style>{`
        .inbox-back-btn { display: none; }
        .inbox-left { width: 300px; min-width: 260px; flex-shrink: 0; }
        @media (max-width: 768px) {
          .inbox-hide-mobile { display: none !important; }
          .inbox-left {
            width: 100% !important;
            min-width: 0 !important;
            border-right: none !important;
          }
          .inbox-right {
            width: 100% !important;
          }
          .inbox-back-btn { display: flex !important; }
          .inbox-msg-wrapper {
            max-width: 100% !important;
            overflow: hidden !important;
          }
          .inbox-bubble {
            max-width: 80vw !important;
            word-break: break-word !important;
          }
        }
      `}</style>
    </div>
  );
}

const s = {
  page:         { display: 'flex', height: 'calc(100vh - 80px)', background: '#f8fafc', fontFamily: "'Segoe UI', sans-serif", overflow: 'hidden' },
  loadWrap:     { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh' },
  spinner:      { width: 36, height: 36, border: '3px solid #e2e8f0', borderTop: '3px solid #667eea', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },

  // Left panel
  leftPanel:    { background: 'white', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', overflowY: 'auto' },
  leftHeader:   { padding: '20px 16px 12px', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  leftTitle:    { margin: 0, fontSize: '17px', fontWeight: 700, color: '#1a202c' },
  closeBtn:     { background: '#fee2e2', border: 'none', fontSize: '18px', color: '#e53e3e', cursor: 'pointer', padding: '6px 10px', borderRadius: '8px', fontWeight: 700 },
  blockedToggle:{ background: '#f0f4f9', border: '1px solid #e2e8f0', fontSize: '13px', color: '#4a5568', cursor: 'pointer', padding: '5px 10px', borderRadius: '8px', fontWeight: 600 },
  blockedPanel: { padding: '12px 16px', background: '#fef2f2', borderBottom: '1px solid #fed7d7' },
  blockedRow:   { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid #fee2e2' },
  unblockBtn:   { background: 'linear-gradient(135deg,#48bb78,#38a169)', border: 'none', color: '#fff', fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '6px', cursor: 'pointer' },
  groupRow:     { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid #f7f7f7', transition: 'background 0.1s' },
  groupRowActive:{ background: '#f0f4ff', borderLeft: '3px solid #667eea' },
  groupAvatar:  { width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,#667eea,#764ba2)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 700, flexShrink: 0 },
  groupName:    { fontWeight: 600, fontSize: '14px', color: '#2d3748', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  groupPreview: { fontSize: '12px', color: '#4a5568', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 2 },
  timeStamp:    { fontSize: '11px', color: '#718096' },
  unreadBadge:  { background: '#667eea', color: 'white', borderRadius: '10px', padding: '1px 7px', fontSize: '11px', fontWeight: 700 },
  empty:        { padding: 24, color: '#4a5568', fontSize: '14px', textAlign: 'center' },

  // Right panel
  rightPanel:   { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#fafbff' },
  noSelect:     { display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, color: '#4a5568', fontSize: '15px' },
  threadHeader: { display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 20px', background: 'white', borderBottom: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' },
  backBtn:      { background: 'linear-gradient(135deg,#667eea,#764ba2)', border: 'none', borderRadius: '8px', padding: '6px 12px', fontSize: '13px', fontWeight: 700, color: '#fff', cursor: 'pointer', alignItems: 'center', marginRight: '4px', boxShadow: '0 2px 6px rgba(102,126,234,0.3)' },
  threadTitle:  { fontWeight: 700, fontSize: '15px', color: '#2d3748' },
  threadSub:    { fontSize: '12px', color: '#4a5568' },

  // Messages
  messageList:  { flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: '12px' },
  noMessages:   { textAlign: 'center', color: '#4a5568', fontSize: '14px', marginTop: 40 },
  msgRow:       { display: 'flex', alignItems: 'flex-end', gap: '8px', maxWidth: '100%' },
  msgAvatar:    { width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg,#667eea,#764ba2)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', flexShrink: 0, marginBottom: 4 },
  senderName:   { fontSize: '11px', color: '#2d3748', marginBottom: '3px', fontWeight: 600 },
  actionBtn:    { background: 'none', border: 'none', fontSize: '11px', cursor: 'pointer', padding: '2px 6px', borderRadius: '4px', fontWeight: 600, fontFamily: "'Segoe UI', sans-serif" },
  bubble:       { padding: '10px 14px', borderRadius: '16px', fontSize: '14px', lineHeight: '1.5', wordBreak: 'break-word', whiteSpace: 'pre-wrap', overflowWrap: 'break-word', maxWidth: '100%' },
  bubbleMe:     { background: 'linear-gradient(135deg,#667eea,#764ba2)', color: 'white', borderBottomRightRadius: '4px' },
  bubbleThem:   { background: 'white', color: '#2d3748', border: '1px solid #e2e8f0', borderBottomLeftRadius: '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
  msgTime:      { fontSize: '10px', color: '#718096', marginTop: '3px' },

  // Compose
  compose:      { background: 'white', borderTop: '1px solid #e2e8f0', padding: '12px 16px' },
  recipientSelect:{ width: '100%', marginBottom: '8px', padding: '7px 10px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '13px', color: '#4a5568', background: '#fafafa', outline: 'none' },
  composeRow:   { display: 'flex', gap: '8px', alignItems: 'flex-end' },
  composeInput: { flex: 1, padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '14px', resize: 'none', outline: 'none', fontFamily: "'Segoe UI', sans-serif", color: '#2d3748', background: 'white' },
  sendBtn:      { width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg,#667eea,#764ba2)', color: 'white', border: 'none', fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
};
