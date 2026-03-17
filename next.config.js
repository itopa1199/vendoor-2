/** @type {import('next').NextConfig} */
const nextConfig = {
  optimizeFonts: false,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'vendoor.ng' },
      { protocol: 'https', hostname: '*.vendoor.ng' },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/vd-api/:path*',
        destination: 'https://vendoor.ng/store/api/:path*',
      },
    ]
  },
}

module.exports = nextConfig
