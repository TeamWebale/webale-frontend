export const ErrorMessage = ({ message, onRetry, onDismiss }) => (
  <div style={{ padding: '24px', background: '#fed7d7', border: '2px solid #fc8181', borderRadius: '12px', textAlign: 'center' }}>
    <div style={{ fontSize: '48px', marginBottom: '16px' }}>😞</div>
    <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#742a2a', marginBottom: '8px' }}>Oops! Something went wrong</h3>
    <p style={{ color: '#742a2a', marginBottom: '24px', fontSize: '14px' }}>{message || 'An unexpected error occurred. Please try again.'}</p>
    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
      {onRetry && (
        <button onClick={onRetry} className="btn" style={{ background: '#fc8181', color: 'white' }}>
          🔄 Try Again
        </button>
      )}
      {onDismiss && (
        <button onClick={onDismiss} className="btn" style={{ background: '#e2e8f0', color: '#2d3748' }}>
          Dismiss
        </button>
      )}
    </div>
  </div>
);

export const InlineError = ({ message }) => (
  <div style={{ padding: '12px 16px', background: '#fed7d7', border: '2px solid #fc8181', borderRadius: '8px', display: 'flex', alignItems: 'start', gap: '12px', marginBottom: '16px' }}>
    <span style={{ fontSize: '20px' }}>⚠️</span>
    <p style={{ color: '#742a2a', fontSize: '14px', fontWeight: '500', margin: 0, flex: 1 }}>{message}</p>
  </div>
);