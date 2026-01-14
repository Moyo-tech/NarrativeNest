/** @type {import('next').NextConfig} */

// Backend URL - defaults to localhost for development
const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';

const nextConfig = {
  reactStrictMode: true,
  skipTrailingSlashRedirect: true,
  images: {
    domains: ['replicate.delivery'],
  },
  async headers() {
    return [
      {
        source: '/:path*',
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
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      // Redirect old /narrativenest paths to new paths
      {
        source: '/narrativenest',
        destination: '/',
        permanent: true,
      },
      {
        source: '/narrativenest/editor',
        destination: '/editor',
        permanent: true,
      },
      {
        source: '/narrativenest/newvisualise',
        destination: '/newvisualise',
        permanent: true,
      },
      {
        source: '/narrativenest/settings',
        destination: '/settings',
        permanent: true,
      },
      {
        source: '/narrativenest/components-test',
        destination: '/components-test',
        permanent: true,
      },
      {
        source: '/narrativenest/login',
        destination: '/login',
        permanent: true,
      },
      {
        source: '/narrativenest/signup',
        destination: '/signup',
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return [
      // Proxy API requests to Flask/FastAPI backend
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
      {
        source: '/generate-:path*',
        destination: `${backendUrl}/generate-:path*`,
      },
      {
        source: '/healthz',
        destination: `${backendUrl}/healthz`,
      },
    ];
  },
};

module.exports = nextConfig;
