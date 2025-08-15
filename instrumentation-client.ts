// instrumentation-client.ts
/**
 * Sentry is disabled if DISABLE_SENTRY env variable is set.
 * To re-enable, unset DISABLE_SENTRY and restore original imports and integrations.
 */
const DISABLE_SENTRY_INSTRUMENT = process.env.DISABLE_SENTRY === 'true' || process.env.DISABLE_SENTRY === '1';
const SentryInstrument = DISABLE_SENTRY_INSTRUMENT ? require('./sentry.noop') : require('@sentry/nextjs');

// Only use integrations if Sentry is enabled and the properties exist
const integrations: any[] = [];
// To re-enable, restore the following lines and ensure the correct Sentry SDK exports:
// import { Http } from '@sentry/integrations';
// integrations.push(new Http({ tracing: true }));
// if (SentryInstrument.autoDiscoverNodePerformanceMonitoringIntegrations) {
//   integrations.push(...SentryInstrument.autoDiscoverNodePerformanceMonitoringIntegrations());
// }

SentryInstrument.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
  debug: false,
  integrations,
});