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

module.exports = process.env.SENTRY_DSN 
  ? require("@sentry/nextjs").withSentryConfig(nextConfig, sentryWebpackPluginOptions)
  : nextConfig;