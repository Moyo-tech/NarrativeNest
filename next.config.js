/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  basePath: "/narrativenest",
  skipTrailingSlashRedirect: true,
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
    images: {
      domains: ["oaidalleapiprodscus.blob.core.windows.net"],
    },
  },
};

module.exports = nextConfig;
