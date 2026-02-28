/**
 * Inbox.jsx — src/pages/Inbox.jsx
 * Direct messages inbox with thread view.
 * Route: /inbox
 */

import { useState, useEffect, useRef } from 'react';
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
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [members, setMembers] = useState([]);
  const [selectedRecipient, setSelectedRecipient] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

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
    <div style={s.page}>
      {/* ── Left panel: group list ── */}
      <div style={s.leftPanel}>
        <div style={s.leftHeader}>
          <h2 style={s.leftTitle}>💬 Messages</h2>
        </div>
        {groups.length === 0 ? (
          <div style={s.empty}>No group conversations yet</div>
        ) : (
          groups.map(g => (
            <div
              key={g.id}
              onClick={() => setSelectedGroup(g)}
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
      <div style={s.rightPanel}>
        {!selectedGroup ? (
          <div style={s.noSelect}>Select a group to view messages</div>
        ) : (
          <>
            {/* Thread header */}
            <div style={s.threadHeader}>
              <div style={s.groupAvatar}>{selectedGroup.name?.[0]?.toUpperCase()}</div>
              <div>
                <div style={s.threadTitle}>{selectedGroup.name}</div>
                <div style={s.threadSub}>Group conversation</div>
              </div>
            </div>

            {/* Messages */}
            <div style={s.messageList}>
              {messages.length === 0 ? (
                <div style={s.noMessages}>No messages yet — say hello! 👋</div>
              ) : (
                messages.map(m => {
                  const isMe = m.sender_id === user?.id;
                  const senderName = isMe ? 'You' : `${m.first_name || ''} ${m.last_name || ''}`.trim();
                  // Format newlines in message content
                  const lines = (m.content || '').split('\\n');
                  return (
                    <div key={m.id} style={{ ...s.msgRow, justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                      {!isMe && (
                        <div style={s.msgAvatar}>{m.avatar_url || m.first_name?.[0] || '?'}</div>
                      )}
                      <div style={{ maxWidth: '70%' }}>
                        {!isMe && <div style={s.senderName}>{senderName}</div>}
                        <div style={{ ...s.bubble, ...(isMe ? s.bubbleMe : s.bubbleThem) }}>
                          {lines.map((line, i) => (
                            <span key={i}>{line}{i < lines.length - 1 && <br />}</span>
                          ))}
                        </div>
                        <div style={{ ...s.msgTime, textAlign: isMe ? 'right' : 'left' }}>{timeAgo(m.created_at)}</div>
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
    </div>
  );
}

const s = {
  page:         { display: 'flex', height: 'calc(100vh - 80px)', background: '#f8fafc', fontFamily: "'Segoe UI', sans-serif", overflow: 'hidden' },
  loadWrap:     { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh' },
  spinner:      { width: 36, height: 36, border: '3px solid #e2e8f0', borderTop: '3px solid #667eea', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },

  // Left panel
  leftPanel:    { width: '300px', minWidth: '260px', background: 'white', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', overflowY: 'auto' },
  leftHeader:   { padding: '20px 16px 12px', borderBottom: '1px solid #f0f0f0' },
  leftTitle:    { margin: 0, fontSize: '17px', fontWeight: 700, color: '#1a202c' },
  groupRow:     { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid #f7f7f7', transition: 'background 0.1s' },
  groupRowActive:{ background: '#f0f4ff', borderLeft: '3px solid #667eea' },
  groupAvatar:  { width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,#667eea,#764ba2)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 700, flexShrink: 0 },
  groupName:    { fontWeight: 600, fontSize: '14px', color: '#2d3748', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  groupPreview: { fontSize: '12px', color: '#a0aec0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 2 },
  timeStamp:    { fontSize: '11px', color: '#cbd5e0' },
  unreadBadge:  { background: '#667eea', color: 'white', borderRadius: '10px', padding: '1px 7px', fontSize: '11px', fontWeight: 700 },
  empty:        { padding: 24, color: '#a0aec0', fontSize: '14px', textAlign: 'center' },

  // Right panel
  rightPanel:   { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#fafbff' },
  noSelect:     { display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, color: '#a0aec0', fontSize: '15px' },
  threadHeader: { display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 20px', background: 'white', borderBottom: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' },
  threadTitle:  { fontWeight: 700, fontSize: '15px', color: '#2d3748' },
  threadSub:    { fontSize: '12px', color: '#a0aec0' },

  // Messages
  messageList:  { flex: 1, overflowY: 'auto', padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: '12px' },
  noMessages:   { textAlign: 'center', color: '#a0aec0', fontSize: '14px', marginTop: 40 },
  msgRow:       { display: 'flex', alignItems: 'flex-end', gap: '8px' },
  msgAvatar:    { width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg,#667eea,#764ba2)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', flexShrink: 0, marginBottom: 4 },
  senderName:   { fontSize: '11px', color: '#718096', marginBottom: '3px', fontWeight: 600 },
  bubble:       { padding: '10px 14px', borderRadius: '16px', fontSize: '14px', lineHeight: '1.5', wordBreak: 'break-word', whiteSpace: 'pre-wrap' },
  bubbleMe:     { background: 'linear-gradient(135deg,#667eea,#764ba2)', color: 'white', borderBottomRightRadius: '4px' },
  bubbleThem:   { background: 'white', color: '#2d3748', border: '1px solid #e2e8f0', borderBottomLeftRadius: '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
  msgTime:      { fontSize: '10px', color: '#cbd5e0', marginTop: '3px' },

  // Compose
  compose:      { background: 'white', borderTop: '1px solid #e2e8f0', padding: '12px 16px' },
  recipientSelect:{ width: '100%', marginBottom: '8px', padding: '7px 10px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '13px', color: '#4a5568', background: '#fafafa', outline: 'none' },
  composeRow:   { display: 'flex', gap: '8px', alignItems: 'flex-end' },
  composeInput: { flex: 1, padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '14px', resize: 'none', outline: 'none', fontFamily: "'Segoe UI', sans-serif", color: '#2d3748', background: 'white' },
  sendBtn:      { width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg,#667eea,#764ba2)', color: 'white', border: 'none', fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
};
