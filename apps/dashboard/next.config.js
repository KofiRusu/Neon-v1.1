/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    '@neonhub/data-model',
    '@neonhub/types',
    '@neonhub/utils',
    '@neonhub/core-agents',
    '@neonhub/reasoning-engine',
  ],
  images: {
    domains: ['localhost'],
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  async rewrites() {
    return [
      {
        source: '/api/trpc/:path*',
        destination: 'http://localhost:3001/api/trpc/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
