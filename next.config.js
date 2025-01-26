/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      // Increase the timeout for server actions and API routes to 60 seconds
      bodySizeLimit: '10mb',
      timeout: 60
    }
  }
};

module.exports = nextConfig;
