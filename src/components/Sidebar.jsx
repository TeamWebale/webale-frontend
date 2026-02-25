/**
 * Sidebar.jsx
 * Destination: src/components/Sidebar.jsx
 *
 * Updated to use WebaleLogo component (approved calligraphic W image).
 * Logout now clears localStorage and navigates to /login.
 * NOTE: This sidebar is used by Layout.jsx for older page components
 * that haven't been migrated to the new MainLayout/Outlet pattern yet.
 */

import { NavLink, useNavigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { groupAPI } from '../services/api';
import WebaleLogo from './WebaleLogo';

function Sidebar() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalGroups: 0,
    adminGroups: 0,
    memberGroups: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const groupsRes = await groupAPI.getAll();
      const groupsData = groupsRes.data?.data?.groups || groupsRes.data?.groups || groupsRes.data || [];
      const adminCount = Array.isArray(groupsData)
        ? groupsData.filter(g => g.user_role === 'admin' || g.role === 'admin').length
        : 0;
      setStats({
        totalGroups : Array.isArray(groupsData) ? groupsData.length : 0,
        adminGroups : adminCount,
        memberGroups: Array.isArray(groupsData) ? groupsData.length - adminCount : 0,
      });
    } catch (err) {
      console.error('Sidebar stats error:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const navBtn = {
    display       : 'flex',
    alignItems    : 'center',
    gap           : '12px',
    padding       : '12px 16px',
    borderRadius  : '10px',
    textDecoration: 'none',
    fontSize      : '14px',
    fontWeight    : '600',
    width         : '100%',
    border        : 'none',
    cursor        : 'pointer',
    textAlign     : 'left',
    fontFamily    : "'Segoe UI', sans-serif",
    transition    : 'all 0.15s',
  };

  const statCard = {
    display        : 'flex',
    alignItems     : 'center',
    justifyContent : 'space-between',
    padding        : '12px 16px',
    borderRadius   : '10px',
    color          : 'white',
    fontSize       : '13px',
    fontWeight     : '600',
    fontFamily     : "'Segoe UI', sans-serif",
  };

  return (
    <div style={{
      width         : '250px',
      minHeight     : '100vh',
      background    : 'white',
      borderRight   : '1px solid #e2e8f0',
      padding       : '16px',
      display       : 'flex',
      flexDirection : 'column',
      position      : 'fixed',
      left          : 0,
      top           : 0,
      overflowY     : 'auto',
      zIndex        : 100,
    }}>

      {/* ── Logo ── */}
      <Link to="/dashboard" style={{ textDecoration: 'none', marginBottom: '24px', display: 'block' }}>
        <div style={{ padding: '8px', borderRadius: '12px' }}>
          <WebaleLogo variant="full" size="sm" theme="light" />
        </div>
      </Link>

      {/* ── Navigation ── */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '20px' }}>
        <NavLink to="/dashboard" style={({ isActive }) => ({
          ...navBtn,
          background: isActive
            ? 'linear-gradient(135deg, #1B2D4F, #4A7FC1)'
            : 'linear-gradient(135deg, #e0e7ff, #c7d2fe)',
          color: isActive ? 'white' : '#4c51bf',
        })}>
          <span>📊</span> Dashboard
        </NavLink>

        <NavLink to="/create-group" style={({ isActive }) => ({
          ...navBtn,
          background: isActive
            ? 'linear-gradient(135deg, #1B2D4F, #4A7FC1)'
            : 'linear-gradient(135deg, #d1fae5, #a7f3d0)',
          color: isActive ? 'white' : '#047857',
        })}>
          <span>🚀</span> Start Fundraising
        </NavLink>

        <NavLink to="/activity-feed" style={({ isActive }) => ({
          ...navBtn,
          background: isActive
            ? 'linear-gradient(135deg, #1B2D4F, #4A7FC1)'
            : 'linear-gradient(135deg, #fef3c7, #fde68a)',
          color: isActive ? 'white' : '#b45309',
        })}>
          <span>📈</span> Activity Feed
        </NavLink>

        <NavLink to="/profile" style={({ isActive }) => ({
          ...navBtn,
          background: isActive
            ? 'linear-gradient(135deg, #1B2D4F, #4A7FC1)'
            : 'linear-gradient(135deg, #fce7f3, #fbcfe8)',
          color: isActive ? 'white' : '#be185d',
        })}>
          <span>👤</span> Profile
        </NavLink>

        <NavLink to="/settings" style={({ isActive }) => ({
          ...navBtn,
          background: isActive
            ? 'linear-gradient(135deg, #1B2D4F, #4A7FC1)'
            : 'linear-gradient(135deg, #e5e7eb, #d1d5db)',
          color: isActive ? 'white' : '#374151',
        })}>
          <span>⚙️</span> Settings
        </NavLink>
      </nav>

      {/* ── Quick Stats ── */}
      <div style={{ marginBottom: '20px' }}>
        <p style={{ fontSize: '11px', fontWeight: 700, color: '#718096', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Quick Stats
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ ...statCard, background: 'linear-gradient(135deg, #667eea, #764ba2)' }}>
            <span>Total Groups</span><span style={{ fontSize: '18px' }}>{stats.totalGroups}</span>
          </div>
          <div style={{ ...statCard, background: 'linear-gradient(135deg, #38b2ac, #319795)' }}>
            <span>Admin Groups</span><span style={{ fontSize: '18px' }}>{stats.adminGroups}</span>
          </div>
          <div style={{ ...statCard, background: 'linear-gradient(135deg, #48bb78, #38a169)' }}>
            <span>Member Groups</span><span style={{ fontSize: '18px' }}>{stats.memberGroups}</span>
          </div>
        </div>
      </div>

      <div style={{ flex: 1 }} />

      {/* ── Logout ── */}
      <button
        onClick={handleLogout}
        style={{
          ...navBtn,
          background    : 'linear-gradient(135deg, #fed7d7, #feb2b2)',
          color         : '#c53030',
          justifyContent: 'center',
          marginTop     : '8px',
        }}
      >
        <span>🚪</span> Logout
      </button>
    </div>
  );
}

export default Sidebar;
