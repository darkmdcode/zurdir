// sentry.client.config.ts

/**
 * Sentry is disabled if DISABLE_SENTRY env variable is set.
 * To re-enable, unset DISABLE_SENTRY and restore original imports.
 */

// Sentry is fully disabled for all environments. To re-enable, restore the original import and logic.
import * as SentryClient from './sentry.noop';
SentryClient.init({
  // Sentry is disabled. Restore config here if re-enabling.
});

export {};

// Ensure this file is treated as a module for dynamic import compatibility
export {};
