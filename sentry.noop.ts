// sentry.noop.ts
// Dummy Sentry implementation for when Sentry is disabled via DISABLE_SENTRY env variable.
// To re-enable Sentry, remove all imports of this file and restore original Sentry imports.

export const init = (...args: any[]) => {
  console.info('[Sentry Disabled] init called with:', ...args);
};

export const captureException = (error: any, ...args: any[]) => {
  console.warn('[Sentry Disabled] captureException called:', error, ...args);
};

export const captureMessage = (message: any, ...args: any[]) => {
  console.warn('[Sentry Disabled] captureMessage called:', message, ...args);
};

export const withSentryConfig = (config: any, ...args: any[]) => {
  console.info('[Sentry Disabled] withSentryConfig called. Returning config unchanged.');
  return config;
};

// Add other Sentry methods as needed, all as no-ops with console output.
