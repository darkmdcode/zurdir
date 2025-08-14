/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { 
    unoptimized: true 
  },
  // Enable instrumentation only in production
  experimental: {
    instrumentationHook: process.env.NODE_ENV === 'production'
  }
};

// Sentry configuration (production only)
const sentryWebpackPluginOptions = {
  silent: true, // Disable logs
  authToken: process.env.SENTRY_AUTH_TOKEN, // From env vars
  org: "darkmdcode",
  project: "zurdir",
  widenClientFileUpload: true,
  disableLogger: true,
  automaticVercelMonitors: false // Disable if not using Vercel
};

// Only apply Sentry in production
module.exports = process.env.NODE_ENV === 'production'
  ? require("@sentry/nextjs").withSentryConfig(nextConfig, sentryWebpackPluginOptions)
  : nextConfig;