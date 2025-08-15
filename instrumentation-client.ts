// instrumentation-client.ts
/**
 * Sentry is disabled if DISABLE_SENTRY env variable is set.
 * To re-enable, unset DISABLE_SENTRY and restore original imports and integrations.
 */

// Sentry is fully disabled for all environments. To re-enable, restore the original import and logic.
import * as SentryInstrument from './sentry.noop';
SentryInstrument.init({
  // Sentry is disabled. Restore config here if re-enabling.
});