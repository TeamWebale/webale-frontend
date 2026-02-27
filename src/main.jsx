import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { initSentry } from './sentry';
import * as Sentry from '@sentry/react';
import './index.css';
import './mobile-responsive.css';

initSentry();

// Custom feedback button — always shows label on both desktop and mobile
function FeedbackButton() {
  useEffect(() => {
    // Hide Sentry's default trigger so we use our own
    const style = document.createElement('style');
    style.textContent = '#sentry-feedback { display: none !important; }';
    document.head.appendChild(style);
  }, []);

  const openFeedback = () => {
    const feedback = Sentry.getFeedback();
    if (feedback) feedback.openDialog();
  };

  return (
    <button
      onClick={openFeedback}
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 9999,
        background: 'linear-gradient(135deg, #667eea, #764ba2)',
        color: 'white',
        border: 'none',
        borderRadius: '20px',
        padding: '10px 18px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        boxShadow: '0 4px 16px rgba(102,126,234,0.4)',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontFamily: "'Segoe UI', sans-serif",
      }}
    >
      💬 Feedback
    </button>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <App />
        <FeedbackButton />
        <Analytics />
        <SpeedInsights />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
