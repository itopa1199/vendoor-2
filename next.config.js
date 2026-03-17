/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'vendoor.ng' },
      { protocol: 'https', hostname: '*.vendoor.ng' },
    ],
  },
  async rewrites() {
    return [
      {
        // Buyer storefront API
        source: '/vd-api/:path*',
        destination: 'https://vendoor.ng/store/api/:path*',
      },
    ]
  },
}

module.exports = nextConfig
