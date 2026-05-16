import type { MetadataRoute } from 'next';

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://lotussharm.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Welcome the major crawlers explicitly
      {
        userAgent: ['Googlebot', 'Bingbot', 'YandexBot', 'DuckDuckBot', 'facebookexternalhit', 'Twitterbot'],
        allow: '/',
        disallow: ['/admin/', '/api/', '/booking/success', '/booking/cancel'],
      },
      // Everyone else
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/booking/success', '/booking/cancel', '/*?preview='],
      },
      // Block AI scrapers that ignore noindex
      { userAgent: ['GPTBot', 'CCBot', 'anthropic-ai', 'Claude-Web', 'Google-Extended'], disallow: '/' },
    ],
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  };
}
