/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    domains: ['localhost', 'vercel.app'],
  },
  // Enable experimental features for subdomain handling
  experimental: {},
  // Optimize for Vercel deployment
  swcMinify: true,
  reactStrictMode: true,
  // Handle environment variables
  env: {
    NEXT_PUBLIC_BASE_DOMAIN: process.env.NEXT_PUBLIC_BASE_DOMAIN,
  },
  // Optimize output for Vercel
  output: 'standalone',
}

module.exports = nextConfig
