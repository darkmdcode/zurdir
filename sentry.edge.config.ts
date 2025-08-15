// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

// sentry.edge.config.ts

/**
 * Sentry is disabled if DISABLE_SENTRY env variable is set.
 * To re-enable, unset DISABLE_SENTRY and restore original imports.
 */

// Sentry is fully disabled for all environments. To re-enable, restore the original import and logic.
import * as SentryEdge from './sentry.noop';
SentryEdge.init({
  // Sentry is disabled. Restore config here if re-enabling.
});

export {};