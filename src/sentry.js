/**
 * sentry.js — src/sentry.js
 * Initialize Sentry for frontend error tracking.
 * Import this in main.jsx BEFORE rendering the app.
 */

import * as Sentry from '@sentry/react';

export function initSentry() {
  // Only run in production
  if (!import.meta.env.PROD) return;

  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: 'production',
    release: 'webale@1.0.0',

    // Capture 10% of sessions for performance monitoring (free tier friendly)
    tracesSampleRate: 0.1,

    // Capture replays only on errors
    replaysOnErrorSampleRate: 1.0,
    replaysSessionSampleRate: 0.0,

    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: true,      // mask sensitive text in replays
        blockAllMedia: true,
      }),
    ],

    // Don't send errors from browser extensions or known noise
    ignoreErrors: [
      'ResizeObserver loop limit exceeded',
      'Non-Error promise rejection captured',
      /extensions\//i,
      /^chrome:\/\//i,
    ],
  });
}
