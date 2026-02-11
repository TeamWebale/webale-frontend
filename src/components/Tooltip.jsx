import { useState } from 'react';

function Tooltip({ children, text, position = 'top' }) {
  const [isVisible, setIsVisible] = useState(false);

  const positions = {
    top: {
      bottom: '100%',
      left: '50%',
      transform: 'translateX(-50%) translateY(-8px)',
      arrow: {
        top: '100%',
        left: '50%',
        transform: 'translateX(-50%)',
        borderColor: '#2d3748 transparent transparent transparent'
      }
    },
    bottom: {
      top: '100%',
      left: '50%',
      transform: 'translateX(-50%) translateY(8px)',
      arrow: {
        bottom: '100%',
        left: '50%',
        transform: 'translateX(-50%)',
        borderColor: 'transparent transparent #2d3748 transparent'
      }
    },
    left: {
      right: '100%',
      top: '50%',
      transform: 'translateY(-50%) translateX(-8px)',
      arrow: {
        left: '100%',
        top: '50%',
        transform: 'translateY(-50%)',
        borderColor: 'transparent transparent transparent #2d3748'
      }
    },
    right: {
      left: '100%',
      top: '50%',
      transform: 'translateY(-50%) translateX(8px)',
      arrow: {
        right: '100%',
        top: '50%',
        transform: 'translateY(-50%)',
        borderColor: 'transparent #2d3748 transparent transparent'
      }
    }
  };

  const pos = positions[position] || positions.top;

  return (
    <div 
      style={{ position: 'relative', display: 'inline-flex' }}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && text && (
        <div style={{
          position: 'absolute',
          ...pos,
          background: '#2d3748',
          color: 'white',
          padding: '8px 12px',
          borderRadius: '8px',
          fontSize: '12px',
          fontWeight: '500',
          whiteSpace: 'nowrap',
          zIndex: 1000,
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          animation: 'fadeIn 0.15s ease'
        }}>
          {text}
          <div style={{
            position: 'absolute',
            ...pos.arrow,
            border: '6px solid',
            borderColor: pos.arrow.borderColor
          }} />
        </div>
      )}
    </div>
  );
}

export default Tooltip;
