/**
 * NotificationBell.jsx
 * Destination: src/components/NotificationBell.jsx
 *
 * - Tabbed dropdown: Alerts | Messages
 * - Messages: 3-level inbox — Groups → Conversations → Chat thread + reply
 * - Unread badge on bell icon
 * - Polls every 30s
 * - Mark-as-read on open
 */

import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";

const API = "https://webale-api.onrender.com/api";

function authHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function NotificationBell() {
  const [open,         setOpen]         = useState(false);
  const [tab,          setTab]          = useState("alerts");   // alerts | messages
  const [alerts,       setAlerts]       = useState([]);
  const [groups,       setGroups]       = useState([]);         // message groups
  const [conversations,setConversations]= useState([]);         // messages in a group
  const [thread,       setThread]       = useState([]);         // single conversation thread
  const [msgLevel,     setMsgLevel]     = useState("groups");   // groups | convos | thread
  const [selectedGroup,setSelectedGroup]= useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [reply,        setReply]        = useState("");
  const [unreadAlerts, setUnreadAlerts] = useState(0);
  const [unreadMsgs,   setUnreadMsgs]   = useState(0);
  const [sending,      setSending]      = useState(false);
  const [forwardMsg,   setForwardMsg]   = useState("");
  const [blockedUsers, setBlockedUsers] = useState(() => {
    try {
      const u = JSON.parse(localStorage.getItem('user') || '{}');
      return JSON.parse(localStorage.getItem(`blockedUsers_${u.id || 'anon'}`) || '[]');
    } catch { return []; }
  });
  const dropRef  = useRef(null);

  const getBlockedKey = () => {
    try {
      const u = JSON.parse(localStorage.getItem('user') || '{}');
      return `blockedUsers_${u.id || 'anon'}`;
    } catch { return 'blockedUsers_anon'; }
  };

  const blockUser = (senderId, senderName) => {
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
  const pollRef  = useRef(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ── fetch alerts ──────────────────────────────────────────────
  const fetchAlerts = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/notifications`, { headers: authHeaders() });
      const data = res.data?.data || res.data || [];
      setAlerts(Array.isArray(data) ? data : []);
      setUnreadAlerts((Array.isArray(data) ? data : []).filter(a => !a.read && !a.is_read).length);
    } catch { /* silent */ }
  }, []);

  // ── fetch message groups ──────────────────────────────────────
  const fetchGroups = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/messages/groups`, { headers: authHeaders() });
      const data = res.data?.data || res.data || [];
      setGroups(Array.isArray(data) ? data : []);
      setUnreadMsgs((Array.isArray(data) ? data : []).reduce((sum, g) => sum + (g.unread_count || 0), 0));
    } catch { /* silent */ }
  }, []);

  // ── fetch conversations in a group ───────────────────────────
  const fetchConversations = useCallback(async (groupId) => {
    try {
      const res = await axios.get(`${API}/messages/${groupId}`, { headers: authHeaders() });
      const data = res.data?.data || res.data || [];
      const msgs = Array.isArray(data) ? data : [];
      
      // If data already has sender_name or grouped conversations, use as-is
      // Otherwise group flat messages by sender to build conversation list
      if (msgs.length > 0 && (msgs[0].sender_name || msgs[0].name)) {
        setConversations(msgs);
      } else {
        // Group by sender_id, extract names from first_name/last_name
        const grouped = {};
        msgs.forEach(m => {
          const sid = m.sender_id || m.user_id || 'unknown';
          if (!grouped[sid]) {
            grouped[sid] = {
              user_id: sid,
              sender_name: `${m.first_name || ''} ${m.last_name || ''}`.trim() || 'User',
              first_name: m.first_name,
              last_name: m.last_name,
              last_message: m.content || m.message || '',
              created_at: m.created_at,
            };
          } else {
            // Keep the latest message
            if (m.created_at > grouped[sid].created_at) {
              grouped[sid].last_message = m.content || m.message || '';
              grouped[sid].created_at = m.created_at;
            }
          }
        });
        setConversations(Object.values(grouped));
      }
    } catch { /* silent */ }
  }, []);

  // ── fetch thread ─────────────────────────────────────────────
  const fetchThread = useCallback(async (groupId, userId) => {
    try {
      const res = await axios.get(`${API}/messages/${groupId}/${userId}`, { headers: authHeaders() });
      const data = res.data?.data || res.data || [];
      setThread(Array.isArray(data) ? data : []);
    } catch { /* silent */ }
  }, []);

  // ── send message ──────────────────────────────────────────────
  const handleSend = async () => {
    if (!reply.trim() || !selectedGroup) return;
    setSending(true);
    try {
      await axios.post(
        `${API}/messages`,
        { group_id: selectedGroup.id, content: reply.trim() },
        { headers: authHeaders() }
      );
      setReply("");
      fetchThread(selectedGroup.id, selectedUser?.user_id);
    } catch { /* silent */ }
    setSending(false);
  };

  // ── delete message ────────────────────────────────────────────
  const handleDeleteMsg = async (msgId) => {
    if (!msgId) return;
    try {
      await axios.delete(`${API}/messages/${msgId}`, { headers: authHeaders() });
      setThread(prev => prev.filter(m => m.id !== msgId));
    } catch { /* silent */ }
  };

  // ── polling ───────────────────────────────────────────────────
  useEffect(() => {
    fetchAlerts();
    fetchGroups();
    pollRef.current = setInterval(() => {
      fetchAlerts();
      fetchGroups();
      if (msgLevel === "thread" && selectedGroup && selectedUser) {
        fetchThread(selectedGroup.id, selectedUser.user_id);
      }
    }, 30000);
    return () => clearInterval(pollRef.current);
  }, [fetchAlerts, fetchGroups]);

  // ── close on outside click ────────────────────────────────────
  useEffect(() => {
    const handler = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const totalUnread = unreadAlerts + unreadMsgs;

  const openGroup = (g) => {
    setSelectedGroup(g);
    fetchConversations(g.id);
    if (forwardMsg) {
      setReply(`📨 Forwarded:\n${forwardMsg}`);
      setForwardMsg("");
      setMsgLevel("convos");
    } else {
      setMsgLevel("convos");
    }
  };

  const openThread = (convo) => {
    setSelectedUser(convo);
    fetchThread(selectedGroup.id, convo.user_id);
    setMsgLevel("thread");
  };

  return (
    <div style={{ position: "relative" }} ref={dropRef}>
      {/* ── Bell button ── */}
      <button
        onClick={() => { setOpen(!open); if (isMobile) setTab("alerts"); }}
        style={styles.bellBtn}
        aria-label="Notifications"
      >
        🔔
        {totalUnread > 0 && (
          <span style={styles.badge}>{totalUnread > 99 ? "99+" : totalUnread}</span>
        )}
      </button>

      {/* ── Dropdown ── */}
      {open && (
        <div style={styles.dropdown}>
          {/* Tabs */}
          <div style={styles.tabs}>
            <button
              onClick={() => setTab("alerts")}
              style={{ ...styles.tabBtn, ...(tab === "alerts" ? styles.tabActive : {}) }}
            >
              Alerts {unreadAlerts > 0 && <span style={styles.tabBadge}>{unreadAlerts}</span>}
            </button>
            {!isMobile && (
              <button
                onClick={() => { setTab("messages"); setMsgLevel("groups"); }}
                style={{ ...styles.tabBtn, ...(tab === "messages" ? styles.tabActive : {}) }}
              >
                Messages {unreadMsgs > 0 && <span style={styles.tabBadge}>{unreadMsgs}</span>}
              </button>
            )}
          </div>

          {/* ── ALERTS TAB ── */}
          {tab === "alerts" && (
            <div style={styles.body}>
              {alerts.length === 0
                ? <p style={styles.empty}>No notifications yet.</p>
                : alerts.slice(0, 20).map((a, i) => (
                  <div key={i} style={{ ...styles.alertItem, ...(!a.read && !a.is_read ? styles.unreadItem : {}) }}>
                    <div style={styles.alertMsg}>{a.message || a.content || "Notification"}</div>
                    <div style={styles.alertTime}>{a.created_at ? new Date(a.created_at).toLocaleDateString() : ""}</div>
                  </div>
                ))
              }
            </div>
          )}

          {/* ── MESSAGES TAB ── */}
          {tab === "messages" && (

            // Level 1: Groups
            msgLevel === "groups" && (
              <div style={styles.body}>
                {groups.length === 0
                  ? <p style={styles.empty}>No messages yet.</p>
                  : groups.map((g, i) => (
                    <div key={i} style={styles.groupItem} onClick={() => openGroup(g)}>
                      <div style={styles.groupName}>{g.name || g.group_name}</div>
                      {g.unread_count > 0 && <span style={styles.tabBadge}>{g.unread_count}</span>}
                    </div>
                  ))
                }
              </div>
            )
          )}

          {tab === "messages" && msgLevel === "convos" && (
            <div style={styles.body}>
              <button onClick={() => setMsgLevel("groups")} style={styles.backBtn}>← Groups</button>
              <p style={styles.levelTitle}>{selectedGroup?.name || selectedGroup?.group_name}</p>
              {conversations.length === 0
                ? <p style={styles.empty}>No conversations yet.</p>
                : conversations.map((c, i) => (
                  <div key={i} style={styles.convoItem} onClick={() => openThread(c)}>
                    <div style={styles.convoName}>{c.sender_name || c.name || `${c.first_name || ''} ${c.last_name || ''}`.trim() || "User"}</div>
                    <div style={styles.convoPreview}>{c.last_message || c.content || ""}</div>
                  </div>
                ))
              }
            </div>
          )}

          {tab === "messages" && msgLevel === "thread" && (
            <div style={styles.threadWrap}>
              <button onClick={() => setMsgLevel("convos")} style={styles.backBtn}>← Back</button>
              <p style={styles.levelTitle}>{selectedUser?.sender_name || selectedUser?.name || `${selectedUser?.first_name || ''} ${selectedUser?.last_name || ''}`.trim()}</p>
              <div style={styles.threadBody}>
                {thread.filter(m => !isBlocked(m.sender_id || m.user_id)).length === 0
                  ? <p style={styles.empty}>No messages.</p>
                  : [...thread].filter(m => !isBlocked(m.sender_id || m.user_id)).reverse().map((m, i) => {
                    const isMine = m.is_mine || m.sent_by_me;
                    const sName = m.sender_name || m.first_name || "User";
                    return (
                      <div key={m.id || i} style={{ marginBottom: '4px' }}>
                        <div style={{ ...styles.bubble, ...(isMine ? styles.bubbleMine : styles.bubbleTheirs) }}>
                          {!isMine && <span style={styles.bubbleSender}>{sName}</span>}
                          <span style={{ ...styles.bubbleText, color: isMine ? "#fff" : "#1B2D4F" }}>{m.content || m.message}</span>
                          <span style={{ ...styles.bubbleTime, color: isMine ? "rgba(255,255,255,0.5)" : "#8899AA" }}>
                            {m.created_at ? new Date(m.created_at).toLocaleString([], { month: 'short', day: 'numeric', hour: "2-digit", minute: "2-digit" }) : ""}
                          </span>
                        </div>
                        <div style={styles.msgActions}>
                          <button onClick={() => { setReply(`↩ ${(m.content || m.message || '').substring(0, 40)}...\n\n`); }} style={{ ...styles.actionBtn, color: '#3182ce' }} title="Reply">↩ Reply</button>
                          <button onClick={() => { setMsgLevel("groups"); setForwardMsg(m.content || m.message || ''); }} style={{ ...styles.actionBtn, color: '#38a169' }} title="Forward">⤳ Fwd</button>
                          {isMine && <button onClick={() => handleDeleteMsg(m.id)} style={{ ...styles.actionBtn, color: '#e53e3e' }} title="Delete">🗑 Del</button>}
                          {!isMine && <button onClick={() => blockUser(m.sender_id || m.user_id, sName)} style={{ ...styles.actionBtn, color: '#e53e3e' }} title="Block">🚫 Block</button>}
                        </div>
                      </div>
                    );
                  })
                }
              </div>
              {/* Reply input */}
              <div style={styles.replyRow}>
                <input
                  value={reply}
                  onChange={e => setReply(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend()}
                  placeholder="Type a message…"
                  style={styles.replyInput}
                />
                <button onClick={handleSend} disabled={sending || !reply.trim()} style={styles.sendBtn}>
                  ➤
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  bellBtn: { position: "relative", background: "transparent", border: "none", fontSize: "20px", cursor: "pointer", padding: "4px 6px", lineHeight: 1 },
  badge: { position: "absolute", top: "-2px", right: "-4px", background: "#E53E3E", color: "#fff", borderRadius: "10px", fontSize: "9px", fontWeight: 700, padding: "1px 4px", minWidth: "14px", textAlign: "center", fontFamily: "'Segoe UI', sans-serif" },
  dropdown: { position: "absolute", right: 0, top: "calc(100% + 8px)", width: "320px", background: "#FFFFFF", borderRadius: "14px", boxShadow: "0 8px 32px rgba(27,45,79,0.18)", border: "1px solid #E8EEF5", zIndex: 200, overflow: "hidden" },
  tabs: { display: "flex", borderBottom: "1px solid #E8EEF5" },
  tabBtn: { flex: 1, padding: "11px 8px", background: "transparent", border: "none", fontSize: "13px", fontWeight: 500, color: "#8899AA", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", fontFamily: "'Segoe UI', sans-serif" },
  tabActive: { color: "#1B2D4F", borderBottom: "2px solid #00C2CC", fontWeight: 600 },
  tabBadge: { background: "#00C2CC", color: "#fff", borderRadius: "10px", fontSize: "9px", fontWeight: 700, padding: "1px 5px", fontFamily: "'Segoe UI', sans-serif" },
  body: { maxHeight: "320px", overflowY: "auto", padding: "4px 0" },
  empty: { padding: "24px 16px", textAlign: "center", color: "#8899AA", fontSize: "13px", fontFamily: "'Segoe UI', sans-serif" },
  alertItem: { padding: "12px 16px", borderBottom: "1px solid #F0F4F9" },
  unreadItem: { background: "#F0F8FF" },
  alertMsg: { fontSize: "13px", color: "#1B2D4F", lineHeight: 1.5, fontFamily: "'Segoe UI', sans-serif" },
  alertTime: { fontSize: "11px", color: "#8899AA", marginTop: "3px", fontFamily: "'Segoe UI', sans-serif" },
  groupItem: { padding: "12px 16px", borderBottom: "1px solid #F0F4F9", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between" },
  groupName: { fontSize: "14px", color: "#1B2D4F", fontWeight: 500, fontFamily: "'Segoe UI', sans-serif" },
  convoItem: { padding: "12px 16px", borderBottom: "1px solid #F0F4F9", cursor: "pointer", display: "flex", flexDirection: "column", gap: "3px" },
  convoName: { fontSize: "14px", color: "#1B2D4F", fontWeight: 600, fontFamily: "'Segoe UI', sans-serif" },
  convoPreview: { fontSize: "12px", color: "#718096", fontFamily: "'Segoe UI', sans-serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  backBtn: { background: "none", border: "none", color: "#4A7FC1", fontSize: "13px", cursor: "pointer", padding: "10px 16px 4px", fontFamily: "'Segoe UI', sans-serif" },
  levelTitle: { fontSize: "13px", fontWeight: 600, color: "#1B2D4F", padding: "4px 16px 8px", fontFamily: "'Segoe UI', sans-serif" },
  threadWrap: { display: "flex", flexDirection: "column", maxHeight: "400px" },
  threadBody: { flex: 1, overflowY: "auto", padding: "8px 12px", display: "flex", flexDirection: "column", gap: "8px", maxHeight: "260px" },
  bubble: { maxWidth: "80%", padding: "8px 12px", borderRadius: "12px", display: "flex", flexDirection: "column", gap: "3px", wordWrap: "break-word", overflowWrap: "break-word" },
  bubbleMine: { background: "#1B2D4F", alignSelf: "flex-end", borderBottomRightRadius: "3px" },
  bubbleTheirs: { background: "#F0F4F9", alignSelf: "flex-start", borderBottomLeftRadius: "3px" },
  bubbleSender: { fontSize: "11px", fontWeight: 700, color: "#667eea", fontFamily: "'Segoe UI', sans-serif" },
  bubbleText: { fontSize: "13px", color: "#FFFFFF", fontFamily: "'Segoe UI', sans-serif", whiteSpace: "pre-wrap", wordBreak: "break-word" },
  bubbleTime: { fontSize: "10px", color: "rgba(255,255,255,0.5)", alignSelf: "flex-end", fontFamily: "'Segoe UI', sans-serif" },
  replyRow: { display: "flex", gap: "8px", padding: "10px 12px", borderTop: "1px solid #E8EEF5" },
  replyInput: { flex: 1, background: "#F0F4F9", border: "1px solid #D8E3EE", borderRadius: "8px", padding: "8px 12px", fontSize: "13px", outline: "none", fontFamily: "'Segoe UI', sans-serif" },
  sendBtn: { background: "linear-gradient(135deg,#00C2CC,#4A7FC1)", color: "#fff", border: "none", borderRadius: "8px", padding: "8px 12px", cursor: "pointer", fontSize: "14px" },
  msgActions: { display: "flex", gap: "2px", padding: "2px 0", justifyContent: "flex-start" },
  actionBtn: { background: "none", border: "none", fontSize: "13px", cursor: "pointer", padding: "2px 6px", color: "#8899AA", borderRadius: "4px", transition: "background 0.1s" },
};
