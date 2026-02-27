import * as Sentry from '@sentry/react';

export function initSentry() {
  if (!import.meta.env.VITE_SENTRY_DSN) return;

  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.PROD ? 'production' : 'development',
    release: 'webale@1.0.0',
    tracesSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    replaysSessionSampleRate: 0.0,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({ maskAllText: true, blockAllMedia: true }),
    ],
    ignoreErrors: [
      'ResizeObserver loop limit exceeded',
      'Non-Error promise rejection captured',
      /extensions\//i,
      /^chrome:\/\//i,
    ],
  });
}

// Submit feedback directly via Sentry SDK
export async function submitFeedback({ name, email, message }) {
  return Sentry.captureFeedback({
    name: name || 'Anonymous',
    email: email || '',
    message,
  });
}
