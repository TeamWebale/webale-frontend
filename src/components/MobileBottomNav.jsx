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
    { path: '/groups/create', icon: '➕', label: t('group_create').split(' ')[0] },
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
        >
          <span className="icon">{item.icon}</span>
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}

export default MobileBottomNav;
