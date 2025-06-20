/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@neon/data-model', '@neon/types', '@neon/utils'],
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
}

module.exports = nextConfig 