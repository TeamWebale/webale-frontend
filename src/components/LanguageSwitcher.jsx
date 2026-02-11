import { useState } from 'react';
import { useLanguage, LANGUAGES } from '../context/LanguageContext';

function LanguageSwitcher({ compact = false }) {
  const { language, setLanguage, currentLanguage } = useLanguage();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleSelect = (langCode) => {
    setLanguage(langCode);
    setShowDropdown(false);
  };

  if (compact) {
    // Compact version - just flag button
    return (
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          style={{
            background: 'rgba(255,255,255,0.15)',
            border: 'none',
            borderRadius: '8px',
            padding: '8px 12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: 'white',
            fontSize: '14px'
          }}
        >
          <span style={{ fontSize: '18px' }}>{currentLanguage.flag}</span>
          <span style={{ fontSize: '12px' }}>▼</span>
        </button>

        {showDropdown && (
          <>
            <div 
              style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 998 }}
              onClick={() => setShowDropdown(false)}
            />
            <div style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: '8px',
              background: 'white',
              borderRadius: '10px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
              overflow: 'hidden',
              zIndex: 999,
              minWidth: '160px'
            }}>
              {LANGUAGES.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => handleSelect(lang.code)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    width: '100%',
                    padding: '12px 16px',
                    border: 'none',
                    background: language === lang.code ? '#ebf8ff' : 'white',
                    cursor: 'pointer',
                    fontSize: '14px',
                    color: '#2d3748',
                    textAlign: 'left'
                  }}
                >
                  <span style={{ fontSize: '18px' }}>{lang.flag}</span>
                  <span style={{ flex: 1 }}>{lang.name}</span>
                  {language === lang.code && (
                    <span style={{ color: '#667eea' }}>✓</span>
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  // Full version with label
  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '10px 16px',
          background: '#f7fafc',
          border: '2px solid #e2e8f0',
          borderRadius: '10px',
          cursor: 'pointer',
          fontSize: '14px',
          color: '#2d3748',
          width: '100%'
        }}
      >
        <span style={{ fontSize: '20px' }}>{currentLanguage.flag}</span>
        <span style={{ flex: 1, textAlign: 'left', fontWeight: '500' }}>{currentLanguage.name}</span>
        <span style={{ color: '#a0aec0' }}>▼</span>
      </button>

      {showDropdown && (
        <>
          <div 
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 998 }}
            onClick={() => setShowDropdown(false)}
          />
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: '8px',
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
            overflow: 'hidden',
            zIndex: 999,
            border: '1px solid #e2e8f0'
          }}>
            {LANGUAGES.map(lang => (
              <button
                key={lang.code}
                onClick={() => handleSelect(lang.code)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  width: '100%',
                  padding: '14px 16px',
                  border: 'none',
                  background: language === lang.code ? '#ebf8ff' : 'white',
                  cursor: 'pointer',
                  fontSize: '14px',
                  color: '#2d3748',
                  textAlign: 'left',
                  borderBottom: '1px solid #f0f0f0'
                }}
              >
                <span style={{ fontSize: '22px' }}>{lang.flag}</span>
                <span style={{ flex: 1, fontWeight: language === lang.code ? '600' : '400' }}>
                  {lang.name}
                </span>
                {language === lang.code && (
                  <span style={{ 
                    color: 'white', 
                    background: '#667eea', 
                    borderRadius: '50%', 
                    width: '20px', 
                    height: '20px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    fontSize: '12px'
                  }}>
                    ✓
                  </span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default LanguageSwitcher;
