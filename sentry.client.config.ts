// sentry.client.config.ts

/**
 * Sentry is disabled if DISABLE_SENTRY env variable is set.
 * To re-enable, unset DISABLE_SENTRY and restore original imports.
 */
const DISABLE_SENTRY_CLIENT = process.env.DISABLE_SENTRY === 'true' || process.env.DISABLE_SENTRY === '1';
const SentryClient = DISABLE_SENTRY_CLIENT ? require('./sentry.noop') : require('@sentry/nextjs');

SentryClient.init({
  // Add custom client-side Sentry options here if needed
});
