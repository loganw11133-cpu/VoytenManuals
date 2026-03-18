import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
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
  async rewrites() {
    return [
      // Proxy PDF downloads through the original EPM domain
      // This lets us serve PDFs from voytenmanuals.com/manuals/pdf/...
      {
        source: '/manuals/pdf/:path*',
        destination: 'https://www.electricalpartmanuals.com/part_manuals/pdf/:path*',
      },
    ];
  },
};

export default nextConfig;
