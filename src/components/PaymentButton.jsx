import { useState, useEffect } from 'react';

function ProfileBanner() {
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

  // Don't show if not logged in
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

  // Simple country flag lookup (won't crash if missing)
  const getFlag = (countryCode) => {
    if (!countryCode) return '';
    const flags = {
      'UG': '🇺🇬', 'KE': '🇰🇪', 'TZ': '🇹🇿', 'RW': '🇷🇼', 'US': '🇺🇸',
      'GB': '🇬🇧', 'CA': '🇨🇦', 'AU': '🇦🇺', 'DE': '🇩🇪', 'FR': '🇫🇷',
      'NG': '🇳🇬', 'GH': '🇬🇭', 'ZA': '🇿🇦', 'IN': '🇮🇳', 'CN': '🇨🇳'
    };
    return flags[countryCode?.toUpperCase()] || '🌍';
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px 24px',
      display: 'flex',
      alignItems: 'center',
      gap: '16px'
    }}>
      {/* Avatar */}
      <div style={{ position: 'relative' }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.2)',
          border: '3px solid rgba(255,255,255,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 'bold',
          fontSize: '24px'
        }}>
          {getInitials()}
        </div>
        {/* Edit button */}
        <button
          style={{
            position: 'absolute',
            bottom: '-4px',
            right: '-4px',
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            background: 'white',
            border: '2px solid #667eea',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: '12px'
          }}
          onClick={() => window.location.href = '/profile'}
          title="Edit Profile"
        >
          ✏️
        </button>
      </div>

      {/* User Info */}
      <div>
        <h2 style={{
          color: 'white',
          fontSize: '20px',
          fontWeight: 'bold',
          margin: '0 0 4px 0'
        }}>
          {user.first_name} {user.last_name}
          {user.country && (
            <span style={{ marginLeft: '8px', fontSize: '18px' }}>
              {getFlag(user.country)}
            </span>
          )}
        </h2>
        <p style={{
          color: 'rgba(255,255,255,0.85)',
          fontSize: '14px',
          margin: '0 0 4px 0'
        }}>
          {user.email}
        </p>
        <p style={{
          color: 'rgba(255,255,255,0.7)',
          fontSize: '13px',
          margin: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          📅 Member since {getMemberSince()}
        </p>
      </div>
    </div>
  );
}

export default ProfileBanner;
