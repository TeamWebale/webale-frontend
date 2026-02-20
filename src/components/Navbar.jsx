import { useState, useRef, useEffect } from 'react';
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
  const menuRef = useRef(null);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
    window.location.reload();
  };

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMobileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

      {/* Right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Notification Bell - Always visible when authenticated */}
        {isAuthenticated && <NotificationBell />}

        {isAuthenticated ? (
          <>
            {/* Desktop items - hidden on mobile */}
            <button onClick={toggleDarkMode} className="hide-mobile" style={{
              background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '8px',
              padding: '8px 10px', cursor: 'pointer', color: 'white', fontSize: '18px'
            }} title={isDarkMode ? 'Light Mode' : 'Dark Mode'}>
              {isDarkMode ? '☀️' : '🌙'}
            </button>

            <span className="hide-mobile"><LanguageSwitcher compact /></span>

            <Link to="/dashboard" className="hide-mobile" style={{
              background: 'rgba(255,255,255,0.15)', color: 'white', padding: '8px 14px',
              borderRadius: '8px', textDecoration: 'none', fontSize: '14px', fontWeight: '500',
              display: 'flex', alignItems: 'center', gap: '6px'
            }}>
              🏠 {t('nav_home')}
            </Link>
            
            <button onClick={handleLogout} className="hide-mobile" style={{
              background: 'rgba(255,255,255,0.9)', color: '#667eea', border: 'none',
              padding: '8px 14px', borderRadius: '8px', cursor: 'pointer',
              fontSize: '14px', fontWeight: '600'
            }}>
              🚪 Logout
            </button>

            {/* Hamburger - mobile only */}
            <div ref={menuRef} style={{ position: 'relative' }} className="show-mobile-only-flex">
              <button onClick={() => setShowMobileMenu(!showMobileMenu)} style={{
                background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '8px',
                padding: '8px 12px', cursor: 'pointer', color: 'white', fontSize: '22px'
              }}>
                {showMobileMenu ? '✕' : '☰'}
              </button>

              {showMobileMenu && (
                <div style={{
                  position: 'absolute', top: '100%', right: 0, marginTop: '8px',
                  width: '220px', background: 'white', borderRadius: '12px',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.2)', overflow: 'hidden', zIndex: 200
                }}>
                  <Link to="/dashboard" onClick={() => setShowMobileMenu(false)} style={mobileMenuItem}>
                    🏠 Home
                  </Link>
                  <Link to="/groups/create" onClick={() => setShowMobileMenu(false)} style={mobileMenuItem}>
                    ➕ Create Group
                  </Link>
                  <Link to="/profile" onClick={() => setShowMobileMenu(false)} style={mobileMenuItem}>
                    👤 Profile
                  </Link>
                  <Link to="/settings" onClick={() => setShowMobileMenu(false)} style={mobileMenuItem}>
                    ⚙️ Settings
                  </Link>
                  <button onClick={toggleDarkMode} style={{ ...mobileMenuItem, border: 'none', background: 'white', width: '100%', textAlign: 'left' }}>
                    {isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
                  </button>
                  <div style={{ padding: '8px 18px', borderTop: '1px solid #e2e8f0' }}>
                    <LanguageSwitcher compact />
                  </div>
                  <button onClick={() => { setShowMobileMenu(false); handleLogout(); }}
                    style={{
                      ...mobileMenuItem, color: '#e53e3e', borderTop: '1px solid #e2e8f0',
                      background: '#fff5f5', border: 'none', width: '100%', textAlign: 'left',
                      fontWeight: '600'
                    }}>
                    🚪 Logout
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <button onClick={toggleDarkMode} style={{
              background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '8px',
              padding: '8px 10px', cursor: 'pointer', color: 'white', fontSize: '18px'
            }}>
              {isDarkMode ? '☀️' : '🌙'}
            </button>
            <LanguageSwitcher compact />
            <Link to="/login" style={{
              background: 'rgba(255,255,255,0.15)', color: 'white', padding: '8px 14px',
              borderRadius: '8px', textDecoration: 'none', fontSize: '14px', fontWeight: '500'
            }}>
              {t('nav_login')}
            </Link>
            <Link to="/register" className="hide-small-mobile" style={{
              background: 'rgba(255,255,255,0.9)', color: '#667eea', padding: '8px 14px',
              borderRadius: '8px', textDecoration: 'none', fontSize: '14px', fontWeight: '600'
            }}>
              {t('nav_register')}
            </Link>
          </>
        )}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .hide-mobile { display: none !important; }
          nav > a:first-child span:first-child { font-size: 48px !important; }
        }
        @media (min-width: 769px) {
          .show-mobile-only-flex { display: none !important; }
        }
        @media (max-width: 768px) {
          .show-mobile-only-flex { display: flex !important; }
        }
        @media (max-width: 480px) {
          .hide-small-mobile { display: none !important; }
          nav { padding: 8px 12px !important; }
          nav > a:first-child span:first-child { font-size: 40px !important; }
        }
      `}</style>
    </nav>
  );
}

const mobileMenuItem = {
  display: 'flex', alignItems: 'center', gap: '10px',
  padding: '14px 18px', textDecoration: 'none', color: '#2d3748',
  fontSize: '15px', fontWeight: '500', borderBottom: '1px solid #f0f0f0',
  cursor: 'pointer'
};

export default Navbar;
