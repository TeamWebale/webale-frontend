import { useState, useEffect } from 'react';
import { authAPI } from '../services/api';

function DarkModeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Load theme preference from localStorage or user profile
    const savedTheme = localStorage.getItem('theme') || 'light';
    setIsDark(savedTheme === 'dark');
    applyTheme(savedTheme);
  }, []);

  const applyTheme = (theme) => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
    }
  };

  const toggleTheme = async () => {
    const newTheme = isDark ? 'light' : 'dark';
    setIsDark(!isDark);
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);

    // Save to user profile
    try {
      await authAPI.updateProfile({ themePreference: newTheme });
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  return (
    <button
      onClick={toggleTheme}
      style={{
        padding: '8px 16px',
        background: isDark ? '#2d3748' : '#f7fafc',
        color: isDark ? '#f7fafc' : '#2d3748',
        border: `2px solid ${isDark ? '#4a5568' : '#e2e8f0'}`,
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '600',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        transition: 'all 0.3s ease'
      }}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      {isDark ? '☀️' : '🌙'}
      <span>{isDark ? 'Light' : 'Dark'} Mode</span>
    </button>
  );
}

export default DarkModeToggle;