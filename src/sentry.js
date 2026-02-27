/**
 * sentry.js — src/sentry.js
 * Sentry error tracking + User Feedback widget.
 */

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
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
      Sentry.feedbackIntegration({
        colorScheme: 'dark',
        buttonLabel: 'Share Feedback',
        submitButtonLabel: 'Send Feedback',
        cancelButtonLabel: 'Cancel',
        formTitle: 'We listen',
        nameLabel: 'Name',
        namePlaceholder: 'First name or nickname',
        emailLabel: 'Email',
        emailPlaceholder: 'your@email.com',
        messageLabel: 'What would you like to share?',
        messagePlaceholder: 'Tell us what you love, what could be better, or report a problem…',
        isNameRequired: false,
        isEmailRequired: false,
        showBranding: false,
        triggerLabel: '💬 Feedback',
        triggerAriaLabel: 'Share feedback',
      }),
    ],

    ignoreErrors: [
      'ResizeObserver loop limit exceeded',
      'Non-Error promise rejection captured',
      /extensions\//i,
      /^chrome:\/\//i,
    ],
  });
}
