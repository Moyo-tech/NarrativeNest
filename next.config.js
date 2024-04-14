/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  basePath: "/narrativenest",
  skipTrailingSlashRedirect: true,
  images: {
    domains: ['replicate.delivery'], // Add the hostname here
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },

};

module.exports = nextConfig;
