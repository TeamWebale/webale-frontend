/**
 * PlatformAdmin.jsx — src/pages/PlatformAdmin.jsx
 * Platform-wide admin dashboard. Only accessible to is_platform_admin users.
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = 'https://webale-api.onrender.com/api';

function authHeaders() {
  return { Authorization: `Bearer ${localStorage.getItem('token')}` };
}

function fmt(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return Number(n).toLocaleString();
}

function timeAgo(d) {
  const s = Math.floor((Date.now() - new Date(d)) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return Math.floor(s / 60) + 'm ago';
  if (s < 86400) return Math.floor(s / 3600) + 'h ago';
  return Math.floor(s / 86400) + 'd ago';
}

export default function PlatformAdmin() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [userTotal, setUserTotal] = useState(0);
  const [groupTotal, setGroupTotal] = useState(0);
  const [userSearch, setUserSearch] = useState('');
  const [groupSearch, setGroupSearch] = useState('');
  const [userPage, setUserPage] = useState(1);
  const [groupPage, setGroupPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null); // { type, id, name }

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const loadStats = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/platform-admin/stats`, { headers: authHeaders() });
      setStats(res.data.data);
    } catch (err) {
      if (err.response?.status === 403) { setError('Access denied. Platform admin only.'); }
      else setError('Failed to load stats.');
    } finally { setLoading(false); }
  }, []);

  const loadUsers = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/platform-admin/users`, {
        headers: authHeaders(),
        params: { search: userSearch || undefined, page: userPage, limit: 20 }
      });
      setUsers(res.data.data.users);
      setUserTotal(res.data.data.total);
    } catch {}
  }, [userSearch, userPage]);

  const loadGroups = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/platform-admin/groups`, {
        headers: authHeaders(),
        params: { search: groupSearch || undefined, page: groupPage, limit: 20 }
      });
      setGroups(res.data.data.groups);
      setGroupTotal(res.data.data.total);
    } catch {}
  }, [groupSearch, groupPage]);

  useEffect(() => { loadStats(); }, []);
  useEffect(() => { if (tab === 'users') loadUsers(); }, [tab, userSearch, userPage]);
  useEffect(() => { if (tab === 'groups') loadGroups(); }, [tab, groupSearch, groupPage]);

  const handleVerifyUser = async (id) => {
    try {
      await axios.put(`${API}/platform-admin/users/${id}/verify`, {}, { headers: authHeaders() });
      showToast('✅ User verified');
      loadUsers();
    } catch { showToast('❌ Failed to verify user'); }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      if (confirmDelete.type === 'user') {
        await axios.delete(`${API}/platform-admin/users/${confirmDelete.id}`, { headers: authHeaders() });
        showToast('✅ User deleted');
        loadUsers();
      } else {
        await axios.delete(`${API}/platform-admin/groups/${confirmDelete.id}`, { headers: authHeaders() });
        showToast('✅ Group deleted');
        loadGroups();
      }
    } catch (err) {
      showToast('❌ ' + (err.response?.data?.message || 'Delete failed'));
    }
    setConfirmDelete(null);
  };

  if (loading) return (
    <div style={s.page}>
      <div style={s.loadWrap}>
        <div style={s.spinner} />
        <p style={{ color: '#94a3b8', marginTop: 16 }}>Loading admin panel…</p>
      </div>
    </div>
  );

  if (error) return (
    <div style={s.page}>
      <div style={s.loadWrap}>
        <div style={{ fontSize: 48 }}>🚫</div>
        <p style={{ color: '#f87171', marginTop: 12, fontSize: 16 }}>{error}</p>
        <button onClick={() => navigate('/dashboard')} style={s.btnPrimary}>← Back to Dashboard</button>
      </div>
    </div>
  );

  const { stats: st, topGroups, recentUsers } = stats || {};

  return (
    <div style={s.page}>

      {/* Toast */}
      {toast && <div style={s.toast}>{toast}</div>}

      {/* Confirm Delete Modal */}
      {confirmDelete && (
        <div style={s.overlay}>
          <div style={s.modal}>
            <h3 style={{ color: '#f87171', margin: '0 0 8px' }}>⚠️ Confirm Delete</h3>
            <p style={{ color: '#cbd5e1', margin: '0 0 20px' }}>
              Delete <strong style={{ color: 'white' }}>{confirmDelete.name}</strong>? This cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={handleDelete} style={{ ...s.btnDanger, flex: 1 }}>Yes, Delete</button>
              <button onClick={() => setConfirmDelete(null)} style={{ ...s.btnSecondary, flex: 1 }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={s.header}>
        <div>
          <div style={s.headerBadge}>PLATFORM ADMIN</div>
          <h1 style={s.headerTitle}>Webale Control Panel</h1>
        </div>
        <button onClick={() => navigate('/dashboard')} style={s.btnSecondary}>← Dashboard</button>
      </div>

      {/* Tabs */}
      <div style={s.tabs}>
        {['overview', 'users', 'groups'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ ...s.tab, ...(tab === t ? s.tabActive : {}) }}>
            {t === 'overview' ? '📊 Overview' : t === 'users' ? `👥 Users (${userTotal || st?.totalUsers || 0})` : `🏦 Groups (${groupTotal || st?.totalGroups || 0})`}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW ── */}
      {tab === 'overview' && st && (
        <div>
          {/* Stat cards */}
          <div style={s.grid4}>
            {[
              { label: 'Total Users', value: fmt(st.totalUsers), sub: `+${st.newUsers30d} this month`, icon: '👥', color: '#6366f1' },
              { label: 'Total Groups', value: fmt(st.totalGroups), sub: `+${st.newGroups30d} this month`, icon: '🏦', color: '#0ea5e9' },
              { label: 'Total Pledged', value: 'USh ' + fmt(st.totalPledged), sub: `${fmt(st.totalPledges)} pledges`, icon: '💰', color: '#f59e0b' },
              { label: 'Total Received', value: 'USh ' + fmt(st.totalReceived), sub: 'across all groups', icon: '✅', color: '#10b981' },
            ].map(c => (
              <div key={c.label} style={s.statCard}>
                <div style={{ ...s.statIcon, background: c.color + '22', color: c.color }}>{c.icon}</div>
                <div style={s.statValue}>{c.value}</div>
                <div style={s.statLabel}>{c.label}</div>
                <div style={s.statSub}>{c.sub}</div>
              </div>
            ))}
          </div>

          <div style={s.grid2}>
            {/* Top Groups */}
            <div style={s.card}>
              <h3 style={s.cardTitle}>🏆 Top Groups by Received</h3>
              {topGroups?.map((g, i) => (
                <div key={g.id} style={s.listRow}>
                  <div style={s.rank}>{i + 1}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={s.rowName}>{g.name}</div>
                    <div style={s.rowSub}>{g.owner} · {g.member_count} members</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: '#10b981', fontWeight: 700, fontSize: 14 }}>
                      {g.currency} {fmt(g.current_amount)}
                    </div>
                    <div style={s.rowSub}>
                      {g.goal_amount > 0 ? Math.round((g.current_amount / g.goal_amount) * 100) + '%' : '—'}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Users */}
            <div style={s.card}>
              <h3 style={s.cardTitle}>🆕 Recent Signups</h3>
              {recentUsers?.map(u => (
                <div key={u.id} style={s.listRow}>
                  <div style={s.avatar}>{u.avatar_url || '😊'}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={s.rowName}>{u.first_name} {u.last_name}</div>
                    <div style={s.rowSub}>{u.email}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ ...s.badge, background: u.is_verified ? '#10b98122' : '#f59e0b22', color: u.is_verified ? '#10b981' : '#f59e0b' }}>
                      {u.is_verified ? '✓ verified' : 'pending'}
                    </div>
                    <div style={s.rowSub}>{timeAgo(u.created_at)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── USERS ── */}
      {tab === 'users' && (
        <div style={s.card}>
          <div style={s.tableHeader}>
            <h3 style={s.cardTitle}>All Users</h3>
            <input
              placeholder="Search name or email…"
              value={userSearch}
              onChange={e => { setUserSearch(e.target.value); setUserPage(1); }}
              style={s.search}
            />
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={s.table}>
              <thead>
                <tr>
                  {['User', 'Email', 'Country', 'Groups', 'Pledged', 'Verified', 'Joined', 'Actions'].map(h => (
                    <th key={h} style={s.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} style={s.tr}>
                    <td style={s.td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 22 }}>{u.avatar_url || '😊'}</span>
                        <div>
                          <div style={{ fontWeight: 600, color: '#e2e8f0', fontSize: 13 }}>{u.first_name} {u.last_name}</div>
                          {u.is_platform_admin && <div style={{ ...s.badge, background: '#6366f122', color: '#818cf8', fontSize: 10 }}>ADMIN</div>}
                        </div>
                      </div>
                    </td>
                    <td style={s.td}><span style={{ color: '#94a3b8', fontSize: 13 }}>{u.email}</span></td>
                    <td style={s.td}><span style={{ color: '#94a3b8', fontSize: 13 }}>{u.country || '—'}</span></td>
                    <td style={{ ...s.td, textAlign: 'center' }}><span style={s.pill}>{u.group_count}</span></td>
                    <td style={s.td}><span style={{ color: '#10b981', fontSize: 13 }}>USh {fmt(u.total_pledged)}</span></td>
                    <td style={{ ...s.td, textAlign: 'center' }}>
                      <span style={{ ...s.badge, background: u.is_verified ? '#10b98122' : '#f59e0b22', color: u.is_verified ? '#10b981' : '#f59e0b' }}>
                        {u.is_verified ? '✓' : '⏳'}
                      </span>
                    </td>
                    <td style={s.td}><span style={{ color: '#64748b', fontSize: 12 }}>{timeAgo(u.created_at)}</span></td>
                    <td style={s.td}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {!u.is_verified && (
                          <button onClick={() => handleVerifyUser(u.id)} style={s.btnSmallGreen} title="Verify">✓</button>
                        )}
                        {!u.is_platform_admin && (
                          <button onClick={() => setConfirmDelete({ type: 'user', id: u.id, name: `${u.first_name} ${u.last_name}` })} style={s.btnSmallRed} title="Delete">🗑</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={s.pagination}>
            <button disabled={userPage === 1} onClick={() => setUserPage(p => p - 1)} style={s.pageBtn}>← Prev</button>
            <span style={{ color: '#64748b', fontSize: 13 }}>Page {userPage} · {userTotal} total</span>
            <button disabled={userPage * 20 >= userTotal} onClick={() => setUserPage(p => p + 1)} style={s.pageBtn}>Next →</button>
          </div>
        </div>
      )}

      {/* ── GROUPS ── */}
      {tab === 'groups' && (
        <div style={s.card}>
          <div style={s.tableHeader}>
            <h3 style={s.cardTitle}>All Groups</h3>
            <input
              placeholder="Search group name or owner…"
              value={groupSearch}
              onChange={e => { setGroupSearch(e.target.value); setGroupPage(1); }}
              style={s.search}
            />
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={s.table}>
              <thead>
                <tr>
                  {['Group', 'Owner', 'Members', 'Goal', 'Received', 'Pledged', 'Created', 'Actions'].map(h => (
                    <th key={h} style={s.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {groups.map(g => (
                  <tr key={g.id} style={s.tr}>
                    <td style={s.td}>
                      <div style={{ fontWeight: 600, color: '#e2e8f0', fontSize: 13 }}>{g.name}</div>
                      <div style={{ color: '#475569', fontSize: 11 }}>{g.currency}</div>
                    </td>
                    <td style={s.td}>
                      <div style={{ color: '#94a3b8', fontSize: 13 }}>{g.owner}</div>
                      <div style={{ color: '#475569', fontSize: 11 }}>{g.owner_email}</div>
                    </td>
                    <td style={{ ...s.td, textAlign: 'center' }}><span style={s.pill}>{g.member_count}</span></td>
                    <td style={s.td}><span style={{ color: '#94a3b8', fontSize: 13 }}>{fmt(g.goal_amount)}</span></td>
                    <td style={s.td}><span style={{ color: '#10b981', fontWeight: 600, fontSize: 13 }}>{fmt(g.current_amount)}</span></td>
                    <td style={s.td}><span style={{ color: '#f59e0b', fontSize: 13 }}>{fmt(g.pledged_amount)}</span></td>
                    <td style={s.td}><span style={{ color: '#64748b', fontSize: 12 }}>{timeAgo(g.created_at)}</span></td>
                    <td style={s.td}>
                      <button onClick={() => setConfirmDelete({ type: 'group', id: g.id, name: g.name })} style={s.btnSmallRed} title="Delete">🗑</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={s.pagination}>
            <button disabled={groupPage === 1} onClick={() => setGroupPage(p => p - 1)} style={s.pageBtn}>← Prev</button>
            <span style={{ color: '#64748b', fontSize: 13 }}>Page {groupPage} · {groupTotal} total</span>
            <button disabled={groupPage * 20 >= groupTotal} onClick={() => setGroupPage(p => p + 1)} style={s.pageBtn}>Next →</button>
          </div>
        </div>
      )}
    </div>
  );
}

const s = {
  page:        { minHeight: '100vh', background: '#0a0f1e', padding: '24px 20px', fontFamily: "'Segoe UI', sans-serif" },
  loadWrap:    { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 12 },
  spinner:     { width: 40, height: 40, border: '3px solid #1e293b', borderTop: '3px solid #6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  toast:       { position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)', background: '#1e293b', color: 'white', padding: '12px 24px', borderRadius: 10, fontWeight: 600, fontSize: 14, boxShadow: '0 4px 20px rgba(0,0,0,0.4)', zIndex: 9999, border: '1px solid #334155' },
  overlay:     { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal:       { background: '#1e293b', border: '1px solid #334155', borderRadius: 16, padding: 28, width: '100%', maxWidth: 380 },
  header:      { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  headerBadge: { display: 'inline-block', background: '#6366f122', color: '#818cf8', border: '1px solid #6366f144', borderRadius: 6, padding: '3px 10px', fontSize: 11, fontWeight: 700, letterSpacing: 1, marginBottom: 6 },
  headerTitle: { color: 'white', fontSize: 24, fontWeight: 700, margin: 0 },
  tabs:        { display: 'flex', gap: 4, marginBottom: 20, background: '#111827', borderRadius: 10, padding: 4, width: 'fit-content' },
  tab:         { padding: '8px 18px', borderRadius: 8, border: 'none', background: 'transparent', color: '#64748b', fontSize: 13, fontWeight: 600, cursor: 'pointer' },
  tabActive:   { background: '#1e293b', color: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' },
  grid4:       { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 20 },
  grid2:       { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 16 },
  statCard:    { background: '#111827', border: '1px solid #1e293b', borderRadius: 14, padding: '20px 18px' },
  statIcon:    { width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, marginBottom: 12 },
  statValue:   { color: 'white', fontSize: 22, fontWeight: 700, marginBottom: 2 },
  statLabel:   { color: '#94a3b8', fontSize: 13, fontWeight: 600 },
  statSub:     { color: '#475569', fontSize: 12, marginTop: 4 },
  card:        { background: '#111827', border: '1px solid #1e293b', borderRadius: 14, padding: '20px 18px', marginBottom: 16 },
  cardTitle:   { color: 'white', fontSize: 15, fontWeight: 700, margin: '0 0 16px' },
  listRow:     { display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid #1e293b' },
  rank:        { width: 24, height: 24, borderRadius: 6, background: '#1e293b', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 },
  avatar:      { width: 32, height: 32, borderRadius: '50%', background: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 },
  rowName:     { color: '#e2e8f0', fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  rowSub:      { color: '#475569', fontSize: 11, marginTop: 1 },
  badge:       { display: 'inline-block', padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700 },
  tableHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 },
  search:      { background: '#1e293b', border: '1px solid #334155', borderRadius: 8, padding: '8px 14px', color: 'white', fontSize: 13, outline: 'none', minWidth: 220 },
  table:       { width: '100%', borderCollapse: 'collapse', minWidth: 700 },
  th:          { color: '#475569', fontSize: 11, fontWeight: 700, textAlign: 'left', padding: '8px 12px', borderBottom: '1px solid #1e293b', textTransform: 'uppercase', letterSpacing: 0.5 },
  td:          { padding: '10px 12px', borderBottom: '1px solid #0f172a', verticalAlign: 'middle' },
  tr:          { transition: 'background 0.15s' },
  pill:        { background: '#1e293b', color: '#94a3b8', borderRadius: 20, padding: '2px 10px', fontSize: 12, fontWeight: 600 },
  pagination:  { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, paddingTop: 12, borderTop: '1px solid #1e293b' },
  pageBtn:     { background: '#1e293b', border: '1px solid #334155', color: '#94a3b8', borderRadius: 8, padding: '6px 14px', fontSize: 13, cursor: 'pointer' },
  btnPrimary:  { background: 'linear-gradient(135deg,#6366f1,#4f46e5)', color: 'white', border: 'none', borderRadius: 10, padding: '10px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer', marginTop: 12 },
  btnSecondary:{ background: '#1e293b', border: '1px solid #334155', color: '#94a3b8', borderRadius: 10, padding: '8px 16px', fontSize: 13, cursor: 'pointer' },
  btnDanger:   { background: '#dc262622', border: '1px solid #dc262644', color: '#f87171', borderRadius: 8, padding: '10px', fontSize: 14, fontWeight: 600, cursor: 'pointer' },
  btnSmallRed: { background: '#dc262618', border: '1px solid #dc262630', color: '#f87171', borderRadius: 6, padding: '4px 8px', fontSize: 13, cursor: 'pointer' },
  btnSmallGreen:{ background: '#10b98118', border: '1px solid #10b98130', color: '#10b981', borderRadius: 6, padding: '4px 8px', fontSize: 13, cursor: 'pointer' },
};
