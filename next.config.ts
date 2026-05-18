import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  output: 'standalone', // required for Hostinger Node.js Application + our combined-server patch
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  images: {
    // CloudLinux LVE on Hostinger throttles concurrent CPU — Next.js's image
    // optimization proxy was returning ERR_HTTP2_SERVER_REFUSED_STREAM / 504
    // under load. We already generate 3 size variants at upload time
    // (thumb 400 / medium 1024 / original) and the hero slides are static
    // assets, so serving them directly is correct and much faster.
    unoptimized: true,
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'https', hostname: 'lotussharm.com' },
      { protocol: 'https', hostname: 'www.lotussharm.com' },
      { protocol: 'https', hostname: 'api.lotussharm.com' },
      { protocol: 'https', hostname: '**.hstgr.io' },
      { protocol: 'https', hostname: '**.hstgr.cloud' },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        // www → bare domain (301) so Google sees one canonical host
        source: '/:path*',
        has: [{ type: 'host', value: 'www.lotussharm.com' }],
        destination: 'https://lotussharm.com/:path*',
        permanent: true,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
