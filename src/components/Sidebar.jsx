import { NavLink, useNavigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { groupAPI } from '../services/api';

function Sidebar() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalGroups: 0,
    adminGroups: 0,
    memberGroups: 0,
    recentActivity: 0
  });

  // Mock ads for rotation
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const mockAds = [
    { text: '🎯 Reach your goals faster!', bg: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
    { text: '💰 Start fundraising today!', bg: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
    { text: '🌟 Premium features coming!', bg: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
    { text: '📱 Mobile app soon!', bg: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
    { text: '🤝 Invite friends & earn!', bg: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)' },
  ];

  useEffect(() => {
    loadStats();
    // Rotate ads every 5 seconds
    const adInterval = setInterval(() => {
      setCurrentAdIndex(prev => (prev + 1) % mockAds.length);
    }, 5000);
    return () => clearInterval(adInterval);
  }, []);

  const loadStats = async () => {
    try {
      const groupsRes = await groupAPI.getAll();
      const groupsData = groupsRes.data.data.groups;
      const adminCount = groupsData.filter(g => g.user_role === 'admin').length;
      
      setStats({
        totalGroups: groupsData.length,
        adminGroups: adminCount,
        memberGroups: groupsData.length - adminCount,
        recentActivity: groupsData.length > 0 ? groupsData.length : 0
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Consistent button style for all nav items
  const navButtonStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '14px 16px',
    borderRadius: '10px',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.2s ease',
    width: '100%',
    border: 'none',
    cursor: 'pointer',
    textAlign: 'left'
  };

  // Stat card style - same dimensions as nav buttons
  const statCardStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 16px',
    borderRadius: '10px',
    color: 'white',
    fontSize: '14px',
    fontWeight: '600',
    width: '100%'
  };

  return (
    <div style={{
      width: '250px',
      height: '100vh',
      background: 'white',
      borderRight: '1px solid #e2e8f0',
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      left: 0,
      top: 0,
      overflowY: 'auto'
    }}>
      {/* Logo - Clickable to Landing Page */}
      <Link to="/" style={{ textDecoration: 'none' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px', 
          marginBottom: '24px',
          padding: '8px',
          borderRadius: '12px',
          transition: 'background 0.2s ease',
          cursor: 'pointer'
        }}
        onMouseOver={(e) => e.currentTarget.style.background = '#f7fafc'}
        onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
        >
          <div style={{
            width: '50px',
            height: '50px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
          }}>
            <span style={{ 
              color: 'white', 
              fontSize: '28px', 
              fontWeight: 'bold',
              fontFamily: '"Lucida Calligraphy", "Lucida Handwriting", cursive, serif'
            }}>W</span>
          </div>
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: 'bold', color: '#2d3748', margin: 0 }}>WEBALE!</h1>
            <p style={{ fontSize: '10px', color: '#718096', margin: 0 }}>Private Group Fundraising</p>
          </div>
        </div>
      </Link>

      {/* Navigation Links - All with colored backgrounds */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
        <NavLink 
          to="/dashboard" 
          style={({ isActive }) => ({
            ...navButtonStyle,
            background: isActive ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)',
            color: isActive ? 'white' : '#4c51bf',
            boxShadow: isActive ? '0 4px 12px rgba(102, 126, 234, 0.4)' : 'none'
          })}
        >
          <span style={{ fontSize: '18px' }}>📊</span>
          Dashboard
        </NavLink>
        
        <NavLink 
          to="/create-group" 
          style={({ isActive }) => ({
            ...navButtonStyle,
            background: isActive ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
            color: isActive ? 'white' : '#047857',
            boxShadow: isActive ? '0 4px 12px rgba(102, 126, 234, 0.4)' : 'none'
          })}
        >
          <span style={{ fontSize: '18px' }}>➕</span>
          Create Group
        </NavLink>
        
        <NavLink 
          to="/activity-feed" 
          style={({ isActive }) => ({
            ...navButtonStyle,
            background: isActive ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
            color: isActive ? 'white' : '#b45309',
            boxShadow: isActive ? '0 4px 12px rgba(102, 126, 234, 0.4)' : 'none'
          })}
        >
          <span style={{ fontSize: '18px' }}>📈</span>
          Activity Feed
        </NavLink>
        
        <NavLink 
          to="/profile" 
          style={({ isActive }) => ({
            ...navButtonStyle,
            background: isActive ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%)',
            color: isActive ? 'white' : '#be185d',
            boxShadow: isActive ? '0 4px 12px rgba(102, 126, 234, 0.4)' : 'none'
          })}
        >
          <span style={{ fontSize: '18px' }}>👤</span>
          Profile
        </NavLink>
        
        <NavLink 
          to="/settings" 
          style={({ isActive }) => ({
            ...navButtonStyle,
            background: isActive ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%)',
            color: isActive ? 'white' : '#374151',
            boxShadow: isActive ? '0 4px 12px rgba(102, 126, 234, 0.4)' : 'none'
          })}
        >
          <span style={{ fontSize: '18px' }}>⚙️</span>
          Settings
        </NavLink>
      </nav>

      {/* Quick Stats - Same size as buttons */}
      <div style={{ marginBottom: '20px' }}>
        <p style={{ fontSize: '11px', fontWeight: '700', color: '#718096', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px', paddingLeft: '4px' }}>
          Quick Stats
        </p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ ...statCardStyle, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <span>Total Groups</span>
            <span style={{ fontSize: '20px' }}>{stats.totalGroups}</span>
          </div>
          
          <div style={{ ...statCardStyle, background: 'linear-gradient(135deg, #38b2ac 0%, #319795 100%)' }}>
            <span>Admin Groups</span>
            <span style={{ fontSize: '20px' }}>{stats.adminGroups}</span>
          </div>
          
          <div style={{ ...statCardStyle, background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)' }}>
            <span>Member Groups</span>
            <span style={{ fontSize: '20px' }}>{stats.memberGroups}</span>
          </div>
          
          <div style={{ ...statCardStyle, background: 'linear-gradient(135deg, #ed8936 0%, #dd6b20 100%)' }}>
            <span>Recent Activity</span>
            <span style={{ fontSize: '20px' }}>{stats.recentActivity}</span>
          </div>
        </div>
      </div>

      {/* Mock Ad Placeholder - Rotating */}
      <div style={{
        padding: '16px',
        borderRadius: '10px',
        background: mockAds[currentAdIndex].bg,
        color: 'white',
        textAlign: 'center',
        fontSize: '13px',
        fontWeight: '600',
        marginBottom: '20px',
        transition: 'all 0.5s ease',
        cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
      }}>
        {mockAds[currentAdIndex].text}
        <p style={{ fontSize: '10px', opacity: 0.8, marginTop: '4px', marginBottom: 0 }}>Advertisement</p>
      </div>

      {/* Spacer */}
      <div style={{ flex: 1 }}></div>

      {/* Feedback Button */}
      <button
        onClick={() => alert('Feedback feature coming soon! Thank you for your interest.')}
        style={{
          ...navButtonStyle,
          background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
          color: 'white',
          marginBottom: '8px',
          justifyContent: 'center'
        }}
      >
        <span style={{ fontSize: '18px' }}>💬</span>
        Send Feedback
      </button>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        style={{
          ...navButtonStyle,
          background: 'linear-gradient(135deg, #fed7d7 0%, #feb2b2 100%)',
          color: '#c53030',
          justifyContent: 'center'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.background = 'linear-gradient(135deg, #fc8181 0%, #f56565 100%)';
          e.currentTarget.style.color = 'white';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.background = 'linear-gradient(135deg, #fed7d7 0%, #feb2b2 100%)';
          e.currentTarget.style.color = '#c53030';
        }}
      >
        <span style={{ fontSize: '18px' }}>🚪</span>
        Logout
      </button>
    </div>
  );
}

export default Sidebar;
