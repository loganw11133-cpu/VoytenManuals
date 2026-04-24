import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
        pathname: '/vi/**',
      },
    ],
  },
  async redirects() {
    return [
      // Legacy electricalpartmanuals.com routes
      {
        source: '/manuals',
        destination: '/search',
        permanent: true,
      },
      {
        source: '/about-electrical-part-manuals',
        destination: '/about',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
