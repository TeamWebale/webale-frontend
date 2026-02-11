import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';

// Confirmation Dialog Component
export function ConfirmDialog({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger', // 'danger', 'warning', 'info'
  loading = false
}) {
  const { colors, isDarkMode } = useTheme();
  
  if (!isOpen) return null;

  const typeColors = {
    danger: { bg: '#fed7d7', border: '#fc8181', button: '#e53e3e', icon: '⚠️' },
    warning: { bg: '#fefcbf', border: '#ecc94b', button: '#dd6b20', icon: '⚡' },
    info: { bg: '#bee3f8', border: '#63b3ed', button: '#3182ce', icon: 'ℹ️' }
  };

  const typeStyle = typeColors[type] || typeColors.danger;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      animation: 'fadeIn 0.2s ease'
    }} onClick={onClose}>
      <div 
        style={{
          background: colors.cardBackground,
          borderRadius: '16px',
          padding: '24px',
          maxWidth: '420px',
          width: '90%',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          animation: 'slideUp 0.3s ease'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Icon */}
        <div style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: typeStyle.bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px',
          fontSize: '28px'
        }}>
          {typeStyle.icon}
        </div>

        {/* Title */}
        <h2 style={{
          fontSize: '20px',
          fontWeight: 'bold',
          color: colors.text,
          textAlign: 'center',
          marginBottom: '12px'
        }}>
          {title}
        </h2>

        {/* Message */}
        <p style={{
          color: colors.textSecondary,
          textAlign: 'center',
          marginBottom: '24px',
          lineHeight: '1.5'
        }}>
          {message}
        </p>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={onClose}
            disabled={loading}
            style={{
              flex: 1,
              padding: '12px 20px',
              borderRadius: '10px',
              border: `1px solid ${colors.border}`,
              background: colors.cardBackground,
              color: colors.text,
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            style={{
              flex: 1,
              padding: '12px 20px',
              borderRadius: '10px',
              border: 'none',
              background: typeStyle.button,
              color: 'white',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              transition: 'all 0.2s ease'
            }}
          >
            {loading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

// Hook for easy dialog management
export function useConfirmDialog() {
  const [dialogState, setDialogState] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    type: 'danger',
    onConfirm: () => {},
    loading: false
  });

  const showConfirm = ({ title, message, confirmText, cancelText, type, onConfirm }) => {
    return new Promise((resolve) => {
      setDialogState({
        isOpen: true,
        title: title || 'Confirm Action',
        message: message || 'Are you sure?',
        confirmText: confirmText || 'Confirm',
        cancelText: cancelText || 'Cancel',
        type: type || 'danger',
        loading: false,
        onConfirm: async () => {
          setDialogState(prev => ({ ...prev, loading: true }));
          try {
            if (onConfirm) await onConfirm();
            resolve(true);
          } finally {
            setDialogState(prev => ({ ...prev, isOpen: false, loading: false }));
          }
        }
      });
    });
  };

  const closeDialog = () => {
    setDialogState(prev => ({ ...prev, isOpen: false }));
  };

  const ConfirmDialogComponent = () => (
    <ConfirmDialog
      isOpen={dialogState.isOpen}
      onClose={closeDialog}
      onConfirm={dialogState.onConfirm}
      title={dialogState.title}
      message={dialogState.message}
      confirmText={dialogState.confirmText}
      cancelText={dialogState.cancelText}
      type={dialogState.type}
      loading={dialogState.loading}
    />
  );

  return { showConfirm, closeDialog, ConfirmDialogComponent };
}

export default ConfirmDialog;
