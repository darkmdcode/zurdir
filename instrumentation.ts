// instrumentation.ts


import * as Sentry from '@sentry/nextjs';

// Next.js 14 instrumentation: called once on app/server start
export async function register() {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
    environment: process.env.NODE_ENV,
    enabled: !!process.env.SENTRY_DSN && process.env.DISABLE_SENTRY !== 'true',
    // Add any other Sentry options here
  });
}

// Required by Next.js 14 for router transition tracing
export function onRouterTransitionStart() {
  // No-op for now; Next.js expects this export.
}


