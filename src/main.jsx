import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { initSentry } from './sentry';
import './index.css';
import './mobile-responsive.css';

// Initialize Sentry before rendering (production only)
initSentry();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <App />
        <Analytics />
        <SpeedInsights />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
