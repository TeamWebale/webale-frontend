import { useState, useCallback } from 'react';

// Toast Component
function Toast({ message, type = 'info', onClose }) {
  const bgColors = {
    success: '#48bb78',
    error: '#e53e3e',
    warning: '#ed8936',
    info: '#4299e1'
  };

  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '14px 20px',
        background: bgColors[type] || bgColors.info,
        color: 'white',
        borderRadius: '10px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
        marginBottom: '10px',
        animation: 'slideIn 0.3s ease'
      }}
    >
      <span style={{ fontSize: '18px' }}>{icons[type]}</span>
      <span style={{ flex: 1, fontSize: '14px', fontWeight: '500' }}>{message}</span>
      <button
        onClick={onClose}
        style={{
          background: 'rgba(255,255,255,0.2)',
          border: 'none',
          borderRadius: '50%',
          width: '24px',
          height: '24px',
          cursor: 'pointer',
          color: 'white',
          fontSize: '14px'
        }}
      >
        ✕
      </button>
    </div>
  );
}

// Toast Container
function ToastContainer({ toasts, removeToast }) {
  return (
    <>
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
      <div
        style={{
          position: 'fixed',
          top: '80px',
          right: '20px',
          zIndex: 9999,
          maxWidth: '400px',
          width: '100%'
        }}
      >
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </>
  );
}

// useToast Hook
export function useToast() {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);

    // Auto remove after duration
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const ToastContainerComponent = () => (
    <ToastContainer toasts={toasts} removeToast={removeToast} />
  );

  return {
    showToast,
    ToastContainer: ToastContainerComponent
  };
}

export default Toast;
