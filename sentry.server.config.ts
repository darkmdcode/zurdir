// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/


/**
 * Sentry is disabled if DISABLE_SENTRY env variable is set.
 * To re-enable, unset DISABLE_SENTRY and restore original imports.
 */


// Sentry is fully disabled for all environments. To re-enable, restore the original import and logic.
import * as SentryServer from './sentry.noop';
SentryServer.init({
  // Sentry is disabled. Restore config here if re-enabling.
});

export {};
