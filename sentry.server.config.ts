// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/


/**
 * Sentry is disabled if DISABLE_SENTRY env variable is set.
 * To re-enable, unset DISABLE_SENTRY and restore original imports.
 */

const DISABLE_SENTRY_SERVER = process.env.DISABLE_SENTRY === 'true' || process.env.DISABLE_SENTRY === '1';
const SentryServer = DISABLE_SENTRY_SERVER ? require('./sentry.noop') : require('@sentry/nextjs');

SentryServer.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1,
  enableLogs: true,
  debug: false,
});
