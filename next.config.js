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
    instrumentationHook: true,
    missingSuspenseWithCSRBailout: true,
    optimizePackageImports: true
  },
  // Render/production optimizations
  productionBrowserSourceMaps: false,
  reactStrictMode: true,
  swcMinify: true,
  optimizeFonts: true,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false
      };
    }
    return config;
  }
};

module.exports = nextConfig;