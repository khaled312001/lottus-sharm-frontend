import type { MetadataRoute } from 'next';
import { api } from '@/lib/api';

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://lotussharm.com';
const LOCALES = ['ar', 'en', 'ru', 'it'] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPaths = ['', '/trips', '/about', '/gallery', '/blog', '/contact', '/privacy', '/terms'];
  const urls: MetadataRoute.Sitemap = [];

  for (const path of staticPaths) {
    for (const loc of LOCALES) {
      urls.push({
        url: `${SITE}/${loc}${path}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: path === '' ? 1.0 : 0.7,
        alternates: {
          languages: Object.fromEntries(LOCALES.map((l) => [l, `${SITE}/${l}${path}`])),
        },
      });
    }
  }

  // Trips
  try {
    const res = await api.get<{ items: Array<{ slug: string }> }>(`/public/trips?locale=AR&pageSize=200`);
    for (const trip of res.items) {
      for (const loc of LOCALES) {
        urls.push({
          url: `${SITE}/${loc}/trips/${trip.slug}`,
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.85,
          alternates: { languages: Object.fromEntries(LOCALES.map((l) => [l, `${SITE}/${l}/trips/${trip.slug}`])) },
        });
      }
    }
  } catch {
    /* ignored */
  }

  // Blog posts
  try {
    const res = await api.get<{ items: Array<{ slug: string }> }>(`/public/blog?locale=AR&pageSize=100`);
    for (const post of res.items) {
      for (const loc of LOCALES) {
        urls.push({
          url: `${SITE}/${loc}/blog/${post.slug}`,
          lastModified: new Date(),
          changeFrequency: 'monthly',
          priority: 0.6,
        });
      }
    }
  } catch {
    /* ignored */
  }

  return urls;
}
