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
      {
        protocol: 'https',
        hostname: 'www.spbbreakers.com',
        pathname: '/v/vspfiles/**',
      },
    ],
  },
  async headers() {
    return [
      {
        // The raw decoder HTML files are the iframe payload for /tools/<slug>.
        // Left indexable they compete with their own route for the same catalog
        // -number queries and split the ranking signal, so mark them noindex
        // while keeping them crawlable — a robots.txt disallow would stop
        // crawlers from ever seeing this header.
        source: '/tools/:file(.*-decoder\\.html)',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, follow' }],
      },
      {
        // Offline kit index — a customer hand-off page, not a search result.
        source: '/tools/offline.html',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, follow' }],
      },
    ];
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
      // SPBBreakers.com content now lives at /products/spb-breakers
      {
        source: '/spb-breakers',
        destination: '/products/spb-breakers',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
