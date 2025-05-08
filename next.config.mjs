/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        source: '/api/improve/stream',
        destination: 'http://127.0.0.1:8089/improve/stream',
      },
      {
        source: '/api/improve/stream/:path*',
        destination: 'http://127.0.0.1:8089/improve/stream/:path*',
      },
    ];
  },
}

export default nextConfig
