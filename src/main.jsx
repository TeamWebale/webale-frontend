import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { initSentry, submitFeedback } from './sentry';
import './index.css';
import './mobile-responsive.css';

initSentry();

// Keep Render backend awake — ping every 10 minutes
const keepAlive = () => {
  fetch('https://webale-api.onrender.com/health').catch(() => {});
};
keepAlive();
setInterval(keepAlive, 10 * 60 * 1000);

function FeedbackWidget() {
  const [open, setOpen]       = useState(false);
  const [name, setName]       = useState('');
  const [email, setEmail]     = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent]       = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = async () => {
    if (!message.trim()) return;
    setSending(true);
    try {
      await submitFeedback({ name, email, message });
      setSent(true);
      setTimeout(() => { setOpen(false); setSent(false); setName(''); setEmail(''); setMessage(''); }, 2000);
    } catch {
      alert('Failed to send feedback. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const overlay = {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
    zIndex: 10000, display: 'flex', alignItems: 'flex-end',
    justifyContent: 'flex-end', padding: '0 20px 80px 0',
  };
  const card = {
    background: '#1a1a2e', border: '1px solid #444', borderRadius: '16px',
    padding: '24px', width: '100%', maxWidth: '340px',
    boxShadow: '0 8px 40px rgba(0,0,0,0.5)', fontFamily: "'Segoe UI', sans-serif",
  };
  const label = { display: 'block', color: '#ccc', fontSize: '13px', marginBottom: '5px', fontWeight: 600 };
  const input = {
    width: '100%', background: '#2a2a3e', border: '1px solid #555',
    borderRadius: '8px', padding: '9px 12px', color: 'white',
    fontSize: '13px', outline: 'none', boxSizing: 'border-box', marginBottom: '12px',
  };

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        style={{
          position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999,
          background: 'linear-gradient(135deg,#667eea,#764ba2)',
          color: 'white', border: 'none', borderRadius: '20px',
          padding: '10px 18px', fontSize: '14px', fontWeight: '600',
          cursor: 'pointer', boxShadow: '0 4px 16px rgba(102,126,234,0.4)',
          display: 'flex', alignItems: 'center', gap: '6px',
        }}
      >
        💬 Feedback
      </button>

      {/* Dialog */}
      {open && (
        <div style={overlay} onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}>
          <div style={card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, color: 'white', fontSize: '17px', fontWeight: 700 }}>We listen</h3>
              <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: '#aaa', fontSize: '20px', cursor: 'pointer', lineHeight: 1 }}>✕</button>
            </div>

            {sent ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ fontSize: '40px', marginBottom: '10px' }}>✅</div>
                <p style={{ color: '#48bb78', fontWeight: 600, fontSize: '15px', margin: 0 }}>Thank you for your feedback!</p>
              </div>
            ) : (
              <>
                <label style={label}>Name</label>
                <input style={input} placeholder="First name or nickname" value={name} onChange={e => setName(e.target.value)} />

                <label style={label}>Email</label>
                <input style={input} placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} />

                <label style={label}>What would you like to share? <span style={{ color: '#e53e3e' }}>*</span></label>
                <textarea
                  style={{ ...input, minHeight: '100px', resize: 'vertical', marginBottom: '16px' }}
                  placeholder="Tell us what you love, what could be better, or report a problem…"
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                />

                <button
                  onClick={handleSubmit}
                  disabled={sending || !message.trim()}
                  style={{
                    width: '100%', padding: '11px', borderRadius: '10px', border: 'none',
                    background: message.trim() ? 'linear-gradient(135deg,#667eea,#764ba2)' : '#444',
                    color: 'white', fontWeight: 700, fontSize: '14px',
                    cursor: message.trim() ? 'pointer' : 'not-allowed',
                  }}
                >
                  {sending ? 'Sending…' : 'Send Feedback'}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <App />
        <FeedbackWidget />
        <Analytics />
        <SpeedInsights />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
