import { useTheme } from '../context/ThemeContext';

function ThemeToggle({ showLabel = true }) {
  const { isDarkMode, toggleDarkMode } = useTheme();

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '12px'
    }}>
      {showLabel && (
        <span style={{ 
          fontSize: '14px', 
          color: isDarkMode ? '#a0aec0' : '#718096',
          fontWeight: '500'
        }}>
          {isDarkMode ? '🌙' : '☀️'}
        </span>
      )}
      
      <button
        onClick={toggleDarkMode}
        aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        style={{
          width: '56px',
          height: '30px',
          borderRadius: '15px',
          background: isDarkMode 
            ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            : '#e2e8f0',
          border: 'none',
          padding: '3px',
          cursor: 'pointer',
          position: 'relative',
          transition: 'all 0.3s ease',
          boxShadow: isDarkMode 
            ? '0 2px 10px rgba(102, 126, 234, 0.4)' 
            : '0 2px 4px rgba(0,0,0,0.1)'
        }}
      >
        {/* Toggle Circle */}
        <div style={{
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          background: 'white',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          transform: isDarkMode ? 'translateX(26px)' : 'translateX(0)',
          transition: 'transform 0.3s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '12px'
        }}>
          {isDarkMode ? '🌙' : '☀️'}
        </div>
      </button>
      
      {showLabel && (
        <span style={{ 
          fontSize: '13px', 
          color: isDarkMode ? '#a0aec0' : '#718096',
          minWidth: '70px'
        }}>
          {isDarkMode ? 'Dark Mode' : 'Light Mode'}
        </span>
      )}
    </div>
  );
}

export default ThemeToggle;
