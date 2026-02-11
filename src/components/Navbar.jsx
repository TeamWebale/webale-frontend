import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import LanguageSwitcher from './LanguageSwitcher';
import NotificationBell from './NotificationBell';

function Navbar() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const isAuthenticated = localStorage.getItem('token');
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
    window.location.reload();
  };

  return (
    <nav style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '12px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      {/* Logo */}
      <Link 
        to={isAuthenticated ? '/dashboard' : '/'} 
        style={{ 
          textDecoration: 'none',
          display: 'flex',
          alignItems: 'center',
          position: 'relative'
        }}
      >
        {/* Big W that engulfs */}
        <span style={{ 
          fontSize: '72px', 
          fontWeight: '900', 
          color: 'white',
          lineHeight: 0.7,
          textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
          marginRight: '-10px'
        }}>
          W
        </span>
        
        {/* Webale + Taglines */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center',
          marginLeft: '-8px',
          paddingTop: '8px'
        }}>
          <span style={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: 'white',
            lineHeight: 1.1,
            marginBottom: '1px'
          }}>
            {t('app_name')}
          </span>
          <span className="hide-mobile" style={{
            fontSize: '8px',
            color: 'rgba(255,255,255,0.9)',
            lineHeight: 1.2,
            fontWeight: '500',
            letterSpacing: '0.3px'
          }}>
            Private Group
          </span>
          <span className="hide-mobile" style={{
            fontSize: '8px',
            color: 'rgba(255,255,255,0.9)',
            lineHeight: 1.2,
            fontWeight: '500',
            letterSpacing: '0.3px'
          }}>
            Fundraising
          </span>
        </div>
      </Link>

      {/* Right side buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          style={{
            background: 'rgba(255,255,255,0.15)',
            border: 'none',
            borderRadius: '8px',
            padding: '8px 10px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '18px',
            transition: 'background 0.2s'
          }}
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDarkMode ? '☀️' : '🌙'}
        </button>

        {/* Language Switcher */}
        <LanguageSwitcher compact />

        {/* Notification Bell - Only when authenticated */}
        {isAuthenticated && <NotificationBell />}

        {isAuthenticated ? (
          <>
            {/* Home button - hide on small mobile, show on tablets+ */}
            <Link 
              to="/dashboard"
              className="hide-small-mobile"
              style={{
                background: 'rgba(255,255,255,0.15)',
                color: 'white',
                padding: '8px 14px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              🏠 <span className="hide-mobile">{t('nav_home')}</span>
            </Link>
            
            {/* Logout button */}
            <button
              onClick={handleLogout}
              style={{
                background: 'rgba(255,255,255,0.9)',
                color: '#667eea',
                border: 'none',
                padding: '8px 14px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <span className="hide-mobile">{t('nav_logout')}</span>
              <span className="show-mobile-only" style={{ display: 'none' }}>🚪</span>
            </button>
          </>
        ) : (
          <>
            <Link 
              to="/login"
              style={{
                background: 'rgba(255,255,255,0.15)',
                color: 'white',
                padding: '8px 14px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              {t('nav_login')}
            </Link>
            <Link 
              to="/register"
              className="hide-small-mobile"
              style={{
                background: 'rgba(255,255,255,0.9)',
                color: '#667eea',
                padding: '8px 14px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              {t('nav_register')}
            </Link>
          </>
        )}
      </div>

      {/* Inline styles for responsive hiding */}
      <style>{`
        @media (max-width: 768px) {
          .hide-mobile {
            display: none !important;
          }
          nav > a:first-child span:first-child {
            font-size: 48px !important;
          }
        }
        
        @media (max-width: 480px) {
          .hide-small-mobile {
            display: none !important;
          }
          .show-mobile-only {
            display: inline !important;
          }
          nav > a:first-child span:first-child {
            font-size: 40px !important;
          }
          nav {
            padding: 8px 12px !important;
          }
          nav > div:last-child {
            gap: 6px !important;
          }
          nav > div:last-child > a,
          nav > div:last-child > button {
            padding: 6px 10px !important;
            font-size: 13px !important;
          }
        }
      `}</style>
    </nav>
  );
}

export default Navbar;
