/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { 
    unoptimized: true,
    remotePatterns: [{
      protocol: 'https',
      hostname: '**', // Allow all external images
    }]
  },
  experimental: {
    instrumentationHook: true, // Let env vars control activation
    optimizePackageImports: ['@sentry/nextjs'] // Add this
  }
};

const sentryWebpackPluginOptions = {
  silent: true,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  org: process.env.SENTRY_ORG || "darkmdcode",
  project: process.env.SENTRY_PROJECT || "zurdir",
  hideSourceMaps: true,
  disableLogger: true,
  // Auto-upload source maps without exposing code
  sourceMapUploadOptions: {
    rewrite: true,
    stripCommonPrefix: true
  }
};

/**
 * Sentry integration is conditionally disabled if DISABLE_SENTRY env variable is set.
 * To re-enable Sentry, unset DISABLE_SENTRY and ensure SENTRY_DSN is set.
 */
const DISABLE_SENTRY = process.env.DISABLE_SENTRY === 'true' || process.env.DISABLE_SENTRY === '1';
module.exports = (!DISABLE_SENTRY && process.env.SENTRY_DSN)
  ? require("@sentry/nextjs").withSentryConfig(nextConfig, sentryWebpackPluginOptions)
  : nextConfig;