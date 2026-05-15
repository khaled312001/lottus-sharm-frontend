import type { MetadataRoute } from 'next';

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://lotussharm.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/admin/', '/api/', '/booking/success', '/booking/cancel'] },
    ],
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  };
}
