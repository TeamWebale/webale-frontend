import { useNavigate, useLocation } from 'react-router-dom';

function Logo({ size = 'medium', showText = true }) {
  const navigate = useNavigate();
  const location = useLocation();

  const sizes = {
    small: { icon: '40px', text: '16px', tagline: '10px' },
    medium: { icon: '56px', text: '20px', tagline: '12px' },
    large: { icon: '72px', text: '28px', tagline: '14px' },
  };

  const handleLogoClick = () => {
    // Only navigate if not on auth pages
    if (location.pathname !== '/login' && location.pathname !== '/register') {
      navigate('/dashboard');
    }
  };

  const isClickable = location.pathname !== '/login' && location.pathname !== '/register';

  return (
    <div 
      onClick={handleLogoClick}
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '12px',
        cursor: isClickable ? 'pointer' : 'default',
        transition: 'transform 0.2s'
      }}
      onMouseEnter={(e) => {
        if (isClickable) {
          e.currentTarget.style.transform = 'scale(1.02)';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
      }}
    >
      <div
        style={{
          width: sizes[size].icon,
          height: sizes[size].icon,
          borderRadius: '8px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: sizes[size].icon === '40px' ? '22px' : sizes[size].icon === '56px' ? '32px' : '40px',
          fontWeight: 'bold',
          fontFamily: '"Lucida Calligraphy", "Brush Script MT", cursive',
          color: 'white',
          flexShrink: 0,
          boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
        }}
      >
        W
      </div>
      {showText && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', justifyContent: 'center' }}>
          <span
            style={{
              fontSize: sizes[size].text,
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              lineHeight: 1.2,
            }}
          >
            WEBALE!
          </span>
          <span
            style={{
              fontSize: sizes[size].tagline,
              fontWeight: '600',
              color: '#718096',
              lineHeight: 1.3,
              letterSpacing: '0.3px',
            }}
          >
            Private Group
          </span>
          <span
            style={{
              fontSize: sizes[size].tagline,
              fontWeight: '600',
              color: '#718096',
              lineHeight: 1.3,
              letterSpacing: '0.3px',
            }}
          >
            Fundraising
          </span>
        </div>
      )}
    </div>
  );
}

export default Logo;