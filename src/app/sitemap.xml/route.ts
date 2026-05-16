// Custom sitemap.xml endpoint — emits raw XML with an XSL stylesheet
// reference so browsers render a styled "Lotus Sharm" dark page.
// Replaces the default Next.js sitemap.ts at /sitemap.xml.

import { NextResponse } from 'next/server';
import { api } from '@/lib/api';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://lotussharm.com';
const LOCALES = ['ar', 'en', 'ru', 'it'] as const;

interface Entry {
  loc: string;
  lastmod: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
  alternates: Record<string, string>;
}

function urlXml(e: Entry): string {
  const alternates = Object.entries(e.alternates)
    .map(([lang, href]) => `    <xhtml:link rel="alternate" hreflang="${lang}" href="${href}"/>`)
    .join('\n');
  return [
    '  <url>',
    `    <loc>${e.loc}</loc>`,
    alternates,
    `    <lastmod>${e.lastmod}</lastmod>`,
    `    <changefreq>${e.changefreq}</changefreq>`,
    `    <priority>${e.priority.toFixed(2)}</priority>`,
    '  </url>',
  ].filter(Boolean).join('\n');
}

export async function GET() {
  const now = new Date().toISOString();
  const urls: Entry[] = [];
  const staticPaths = ['', '/trips', '/about', '/gallery', '/blog', '/contact', '/privacy', '/terms', '/cancellation-policy'];

  for (const path of staticPaths) {
    for (const loc of LOCALES) {
      urls.push({
        loc: `${SITE}/${loc}${path}`,
        lastmod: now,
        changefreq: 'weekly',
        priority: path === '' ? 1.0 : 0.7,
        alternates: Object.fromEntries(LOCALES.map((l) => [l, `${SITE}/${l}${path}`])),
      });
    }
  }

  // Trips
  try {
    const res = await api.get<{ items: Array<{ slug: string }> }>(`/public/trips?locale=AR&pageSize=200`);
    for (const t of res.items) {
      for (const loc of LOCALES) {
        urls.push({
          loc: `${SITE}/${loc}/trips/${t.slug}`,
          lastmod: now,
          changefreq: 'weekly',
          priority: 0.85,
          alternates: Object.fromEntries(LOCALES.map((l) => [l, `${SITE}/${l}/trips/${t.slug}`])),
        });
      }
    }
  } catch {/* ignore */}

  // Blog posts
  try {
    const res = await api.get<{ items: Array<{ slug: string }> }>(`/public/blog?locale=AR&pageSize=100`);
    for (const p of res.items) {
      for (const loc of LOCALES) {
        urls.push({
          loc: `${SITE}/${loc}/blog/${p.slug}`,
          lastmod: now,
          changefreq: 'monthly',
          priority: 0.6,
          alternates: Object.fromEntries(LOCALES.map((l) => [l, `${SITE}/${l}/blog/${p.slug}`])),
        });
      }
    }
  } catch {/* ignore */}

  const xml =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n' +
    '        xmlns:xhtml="http://www.w3.org/1999/xhtml">\n' +
    urls.map(urlXml).join('\n') +
    '\n</urlset>';

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
