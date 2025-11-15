/** @type {import('next').NextConfig} */
const withNextIntl = require('next-intl/plugin')()

const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@ml-roadmap/ui', '@ml-roadmap/db'],
  experimental: {
    serverActions: true,
  },
}

module.exports = withNextIntl(nextConfig)
