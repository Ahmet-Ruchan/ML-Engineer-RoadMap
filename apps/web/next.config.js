/** @type {import('next').NextConfig} */
const withNextIntl = require('next-intl/plugin')(
  // Specify the path to the i18n configuration
  './i18n.ts'
)

const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@ml-roadmap/ui', '@ml-roadmap/db'],
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  // Disable type checking during build (Prisma client might not be generated yet)
  typescript: {
    ignoreBuildErrors: process.env.SKIP_TYPE_CHECK === 'true',
  },
  // Disable ESLint during build
  eslint: {
    ignoreDuringBuilds: process.env.SKIP_LINT === 'true',
  },
}

module.exports = withNextIntl(nextConfig)

