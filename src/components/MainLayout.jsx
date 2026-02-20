import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { groupAPI } from '../services/api';

// ==================== PROFILE BANNER ====================
// Goes ONLY at the top of main content column, NOT full width
function ProfileBanner() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        console.log('Error parsing user data');
      }
    }
  }, []);

  if (!user) return null;

  const getInitials = () => {
    const first = user.first_name?.charAt(0) || '';
    const last = user.last_name?.charAt(0) || '';
    return (first + last).toUpperCase() || '?';
  };

  const getMemberSince = () => {
    if (user.created_at) {
      const date = new Date(user.created_at);
      return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
    return 'January 2026';
  };

  const getFlag = (countryCode) => {
    if (!countryCode) return '';
    // Handle full country names
    const nameToCode = {
      'UGANDA': 'UG', 'KENYA': 'KE', 'TANZANIA': 'TZ', 'RWANDA': 'RW',
      'UNITED STATES': 'US', 'USA': 'US', 'UNITED KINGDOM': 'UK', 'UK': 'UK',
      'CANADA': 'CA', 'AUSTRALIA': 'AU', 'GERMANY': 'DE', 'FRANCE': 'FR',
      'NIGERIA': 'NG', 'GHANA': 'GH', 'SOUTH AFRICA': 'ZA', 'INDIA': 'IN',
      'CHINA': 'CN', 'JAPAN': 'JP', 'BRAZIL': 'BR', 'ETHIOPIA': 'ET',
      'CONGO': 'CD', 'SOUTH SUDAN': 'SS', 'BURUNDI': 'BI'
    };
    const upper = countryCode.toUpperCase().trim();
    const code = nameToCode[upper] || (upper.length <= 3 ? upper : '');
    const flags = {
      'UG': '[UG]', 'KE': '[KE]', 'TZ': '[TZ]', 'RW': '[RW]', 'US': '[US]',
      'GB': '[UK]', 'UK': '[UK]', 'CA': '[CA]', 'AU': '[AU]', 'DE': '[DE]',
      'FR': '[FR]', 'NG': '[NG]', 'GH': '[GH]', 'ZA': '[ZA]', 'IN': '[IN]',
      'CN': '[CN]', 'JP': '[JP]', 'BR': '[BR]', 'ET': '[ET]', 'CD': '[CD]',
      'SS': '[SS]', 'BI': '[BI]', 'EU': '[EU]'
    };
    return flags[code] || (code ? `[${code}]` : '');
  };

  const getAvatar = () => {
    return user.avatar || user.avatar_url || null;
  };

  // Navigate to profile and open avatar modal
  const handleEditClick = () => {
    navigate('/profile', { state: { openAvatarModal: true } });
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '16px 20px',
      borderRadius: '12px',
      marginBottom: '20px',
      display: 'flex',
      alignItems: 'center',
      gap: '14px'
    }}>
      {/* Avatar */}
      <div style={{ position: 'relative' }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.2)',
          border: '3px solid rgba(255,255,255,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 'bold',
          fontSize: getAvatar() ? '28px' : '20px'
        }}>
          {getAvatar() || getInitials()}
        </div>
        {/* Edit button - opens avatar modal */}
        <button
          onClick={handleEditClick}
          style={{
            position: 'absolute',
            bottom: '-2px',
            right: '-2px',
            width: '22px',
            height: '22px',
            borderRadius: '50%',
            background: 'white',
            border: '2px solid #667eea',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: '10px',
            padding: 0
          }}
          title="Choose Avatar"
        >
          ✏️
        </button>
      </div>

      {/* User Info */}
      <div>
        <h2 style={{
          color: 'white',
          fontSize: '18px',
          fontWeight: 'bold',
          margin: '0 0 2px 0'
        }}>
          {user.first_name} {user.last_name}
          {user.country && (
            <span style={{ marginLeft: '8px', fontSize: '16px' }}>
              {getFlag(user.country)}
            </span>
          )}
        </h2>
        <p style={{
          color: 'rgba(255,255,255,0.7)',
          fontSize: '12px',
          margin: 0
        }}>
          📅 Member since {getMemberSince()}
        </p>
      </div>
    </div>
  );
}

// ==================== LEFT SIDEBAR ====================
function LeftSidebar() {
  const location = useLocation();
  const [stats, setStats] = useState({ total: 0, admin: 0, member: 0 });

  useEffect(() => {
    loadStats();
  }, [location.pathname]);

  const loadStats = async () => {
    try {
      const res = await groupAPI.getAll();
      const groups = res.data.data?.groups || res.data.groups || res.data || [];
      const groupList = Array.isArray(groups) ? groups : [];
      setStats({
        total: groupList.length,
        admin: groupList.filter(g => g.user_role === 'admin' || g.role === 'admin').length,
        member: groupList.filter(g => g.user_role === 'member' || g.role === 'member').length
      });
    } catch (e) {
      console.log('Stats not loaded');
    }
  };

  // Navigation items with COLORED BACKGROUNDS
  // Note: First item is "Home" NOT "Dashboard"
  const navItems = [
    { to: '/dashboard', icon: '🏠', label: 'Home', bgColor: '#4299e1' },
    { to: '/groups/create', icon: '➕', label: 'Create Group', bgColor: '#38b2ac' },
    { to: '/activity', icon: '📈', label: 'Activity Feed', bgColor: '#ed64a6' },
    { to: '/profile', icon: '👤', label: 'Profile', bgColor: '#48bb78' },
    { to: '/settings', icon: '⚙️', label: 'Settings', bgColor: '#718096' },
  ];

  const isActive = (path) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard' || location.pathname.startsWith('/groups/');
    }
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <aside style={{
      width: '200px',
      flexShrink: 0,
      position: 'sticky',
      top: '80px',
      height: 'fit-content',
      maxHeight: 'calc(100vh - 100px)',
      overflowY: 'auto',
      paddingRight: '10px'
    }}>
      {/* Navigation Links - ALL WITH COLORED BACKGROUNDS */}
      <nav style={{ marginBottom: '20px' }}>
        {navItems.map(item => {
          const active = isActive(item.to);
          return (
            <NavLink
              key={item.to}
              to={item.to}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 14px',
                borderRadius: '10px',
                marginBottom: '8px',
                textDecoration: 'none',
                color: 'white',
                background: item.bgColor,
                borderLeft: active ? '4px solid white' : '4px solid transparent',
                fontWeight: '600',
                fontSize: '14px',
                transition: 'all 0.2s',
                boxShadow: active ? '0 4px 12px rgba(0,0,0,0.2)' : '0 2px 6px rgba(0,0,0,0.1)',
                transform: active ? 'scale(1.02)' : 'scale(1)',
                opacity: active ? 1 : 0.9
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '1';
                e.currentTarget.style.transform = 'scale(1.02)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.opacity = '0.9';
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.1)';
                }
              }}
            >
              <span style={{ fontSize: '16px' }}>{item.icon}</span>
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      {/* Divider */}
      <div style={{ 
        height: '1px', 
        background: '#e2e8f0', 
        margin: '16px 0'
      }} />

      {/* Quick Stats Section */}
      <div>
        <h4 style={{ 
          fontSize: '11px', 
          fontWeight: '700', 
          color: '#a0aec0', 
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          marginBottom: '12px'
        }}>
          Quick Stats
        </h4>

        {/* Total Groups */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '10px',
          padding: '12px 14px',
          marginBottom: '8px',
          color: 'white'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: '500' }}>Total Groups</span>
            <span style={{ 
              fontSize: '18px', 
              fontWeight: 'bold',
              background: 'rgba(255,255,255,0.2)',
              padding: '2px 10px',
              borderRadius: '6px'
            }}>
              {stats.total}
            </span>
          </div>
        </div>

        {/* Admin Groups */}
        <div style={{
          background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
          borderRadius: '10px',
          padding: '12px 14px',
          marginBottom: '8px',
          color: 'white'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: '500' }}>Admin Groups</span>
            <span style={{ 
              fontSize: '18px', 
              fontWeight: 'bold',
              background: 'rgba(255,255,255,0.2)',
              padding: '2px 10px',
              borderRadius: '6px'
            }}>
              {stats.admin}
            </span>
          </div>
        </div>

        {/* Member Groups */}
        <div style={{
          background: 'linear-gradient(135deg, #4299e1 0%, #3182ce 100%)',
          borderRadius: '10px',
          padding: '12px 14px',
          color: 'white'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: '500' }}>Member Groups</span>
            <span style={{ 
              fontSize: '18px', 
              fontWeight: 'bold',
              background: 'rgba(255,255,255,0.2)',
              padding: '2px 10px',
              borderRadius: '6px'
            }}>
              {stats.member}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}

// ==================== MAIN LAYOUT COMPONENT ====================
function MainLayout({ children, rightSidebar = null, showProfileBanner = true }) {
  const isAuthenticated = localStorage.getItem('token');

  if (!isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div style={{
      display: 'flex',
      gap: '20px',
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '20px 16px'
    }}>
      {/* Left Sidebar */}
      <LeftSidebar />

      {/* Main Content */}
      <main style={{
        flex: 1,
        minWidth: 0
      }}>
        {/* Profile Banner - ONLY here, in main content column */}
        {showProfileBanner && <ProfileBanner />}
        
        {/* Page Content */}
        {children}
      </main>

      {/* Right Sidebar (optional) */}
      {rightSidebar && (
        <aside style={{
          width: '280px',
          flexShrink: 0,
          position: 'sticky',
          top: '80px',
          height: 'fit-content',
          maxHeight: 'calc(100vh - 100px)',
          overflowY: 'auto'
        }}>
          {rightSidebar}
        </aside>
      )}

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 1200px) {
          aside[style*="width: 280px"] {
            display: none !important;
          }
        }
        @media (max-width: 900px) {
          aside[style*="width: 200px"] {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}

export { LeftSidebar, ProfileBanner };
export default MainLayout;
