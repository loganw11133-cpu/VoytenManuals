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
      {
        protocol: 'https',
        hostname: 'dl93ei534z45nvu1.public.blob.vercel-storage.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn4.volusion.store',
        pathname: '/jhkcv-upqrn/**',
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
      // RLBreakers.com content now lives at /products/rl-breakers
      {
        source: '/rl-breakers',
        destination: '/products/rl-breakers',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
