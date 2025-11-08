/** @type {import('next').NextConfig} */
const withMDX = require('@next/mdx')()

const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@ml-roadmap/db', '@ml-roadmap/ui'],
  pageExtensions: ['js', 'jsx', 'mdx', 'ts', 'tsx'],
  experimental: {
    mdxRs: true,
  },
}

module.exports = withMDX(nextConfig)
