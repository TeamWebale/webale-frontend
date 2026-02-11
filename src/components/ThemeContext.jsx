import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
    
    // Apply theme to document
    if (isDarkMode) {
      document.documentElement.classList.add('dark-mode');
      document.body.style.backgroundColor = '#1a202c';
      document.body.style.color = '#e2e8f0';
    } else {
      document.documentElement.classList.remove('dark-mode');
      document.body.style.backgroundColor = '#f7fafc';
      document.body.style.color = '#2d3748';
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  const theme = {
    isDarkMode,
    toggleDarkMode,
    colors: isDarkMode ? {
      // Dark mode colors
      background: '#1a202c',
      cardBackground: '#2d3748',
      text: '#e2e8f0',
      textSecondary: '#a0aec0',
      border: '#4a5568',
      inputBackground: '#4a5568',
      hover: '#4a5568',
      primary: '#667eea',
      primaryGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      success: '#48bb78',
      warning: '#ed8936',
      danger: '#fc8181',
      muted: '#718096',
    } : {
      // Light mode colors
      background: '#f7fafc',
      cardBackground: '#ffffff',
      text: '#2d3748',
      textSecondary: '#718096',
      border: '#e2e8f0',
      inputBackground: '#ffffff',
      hover: '#f7fafc',
      primary: '#667eea',
      primaryGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      success: '#48bb78',
      warning: '#ed8936',
      danger: '#e53e3e',
      muted: '#a0aec0',
    }
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;
