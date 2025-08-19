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
    missingSuspenseWithCSRBailout: true // Critical for Render/Next.js 14
  },
  // Render/production optimizations
  productionBrowserSourceMaps: false,
  reactStrictMode: true,
  swcMinify: true,
  optimizeFonts: true
};

module.exports = nextConfig;