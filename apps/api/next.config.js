/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  transpilePackages: [
    '@neon/core-agents',
    '@neon/data-model',
    '@neon/types',
    '@neon/utils',
    '@neon/reasoning-engine'
  ],
  experimental: {
    esmExternals: true,
    serverComponentsExternalPackages: ['@prisma/client', 'prisma']
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization' },
        ]
      }
    ]
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('_http_common')
    }
    
    config.externals = [...config.externals, 'canvas', 'jsdom']
    
    return config
  },
  output: 'standalone',
  poweredByHeader: false,
  compress: true,
  generateEtags: false
}

module.exports = nextConfig
