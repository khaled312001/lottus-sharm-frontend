import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { NotFoundContent } from '@/components/public/not-found-content';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '404 — Lotus Sharm Tourism',
  description: 'Page not found',
  robots: { index: false, follow: false },
};

/**
 * Catch-all for any URL under a locale that matches no real page. Next.js would
 * otherwise fall back to its bare built-in 404 (and route-group not-found
 * boundaries are unreliable for catch-all notFound() resolution). So instead of
 * throwing notFound(), we render the branded 404 directly here — it inherits
 * the public layout (header + footer) and the visitor's language. Real routes
 * (trips, hotels, …) always win over this catch-all.
 */
export default async function CatchAllNotFound({
  params,
}: {
  params: Promise<{ locale: string; rest: string[] }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <NotFoundContent locale={locale} />;
}
