// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

// sentry.edge.config.ts

/**
 * Sentry is disabled if DISABLE_SENTRY env variable is set.
 * To re-enable, unset DISABLE_SENTRY and restore original imports.
 */
const DISABLE_SENTRY_EDGE = process.env.DISABLE_SENTRY === 'true' || process.env.DISABLE_SENTRY === '1';
const SentryEdge = DISABLE_SENTRY_EDGE ? require('./sentry.noop') : require('@sentry/nextjs');
const BrowserTracingEdge = DISABLE_SENTRY_EDGE ? undefined : require('@sentry/tracing').BrowserTracing;

SentryEdge.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
  debug: false,
  integrations: [
    BrowserTracingEdge ? new BrowserTracingEdge() : undefined
  ].filter(Boolean),
  // For logging, use this instead:
  _experiments: {
    captureConsole: true // Optional: captures console logs
  }
});