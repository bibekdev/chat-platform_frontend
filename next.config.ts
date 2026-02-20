import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  devIndicators: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'utfs.io'
      },
      {
        protocol: 'https',
        hostname: '9dw3tmcrwo.ufs.sh'
      },
      {
        protocol: 'https',
        hostname: 'api.dicebear.com'
      }
    ]
  }
};

export default nextConfig;
