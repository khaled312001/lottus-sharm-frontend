import type { Metadata } from 'next';
import { getLocale } from 'next-intl/server';
import { NotFoundContent } from '@/components/public/not-found-content';

export const metadata: Metadata = {
  title: '404 — Lotus Sharm Tourism',
  description: 'Page not found',
  robots: { index: false, follow: false },
};

// Rendered inside the public layout (header + footer) whenever a route within
// the public site triggers notFound() — including the catch-all below for any
// URL that matches no real page (e.g. /ar/reviews).
export default async function PublicNotFound() {
  let locale = 'ar';
  try {
    locale = await getLocale();
  } catch {
    /* keep default */
  }
  return <NotFoundContent locale={locale} />;
}
