import { useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

function MobileBottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const isAuthenticated = localStorage.getItem('token');

  if (!isAuthenticated) return null;

  const navItems = [
    { path: '/dashboard', icon: '🏠', label: t('nav_home') },
    { path: '/groups/create', icon: '➕', label: 'Create' },
    { path: '/settings', icon: '⚙️', label: t('nav_settings') },
    { path: '/profile', icon: '👤', label: t('nav_profile') },
  ];

  const isActive = (path) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard' || location.pathname.startsWith('/groups/');
    }
    return location.pathname === path;
  };

  return (
    <nav className="mobile-bottom-nav">
      {navItems.map(item => (
        <button
          key={item.path}
          onClick={() => navigate(item.path)}
          className={isActive(item.path) ? 'active' : ''}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textDecoration: 'none',
            color: isActive(item.path) ? '#667eea' : '#718096',
            fontSize: '10px',
            padding: '8px 12px',
            borderRadius: '8px',
            background: isActive(item.path) ? '#ebf8ff' : 'none',
            border: 'none',
            cursor: 'pointer',
            minWidth: '60px'
          }}
        >
          <span style={{ fontSize: '20px', marginBottom: '2px' }}>{item.icon}</span>
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}

export default MobileBottomNav;
