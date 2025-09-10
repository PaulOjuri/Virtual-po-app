/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Enable app directory
    appDir: true,
  },
  // Image optimization settings
  images: {
    domains: [],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  // Performance optimizations
  compiler: {
    // Remove console.log in production
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ]
  },
  // PWA and performance
  async rewrites() {
    return []
  },
  // Disable X-Powered-By header
  poweredByHeader: false,
  // Enable compression
  compress: true,
  // Optimize bundle
  swcMinify: true,
  // Generate sitemap and robots.txt
  async redirects() {
    return []
  },
  // Environment variables
  env: {
    CUSTOM_KEY: 'virtual-po-platform',
  },
}

module.exports = nextConfig