import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';

export const dynamic = 'force-dynamic';

/**
 * Catch-all for any URL under a locale that matches no real page. Next.js would
 * otherwise fall back to its bare built-in 404; instead we throw notFound() so
 * the branded `(public)/not-found.tsx` boundary renders with header + footer.
 * Real routes (trips, hotels, …) always win over this catch-all.
 */
export default async function CatchAllNotFound({
  params,
}: {
  params: Promise<{ locale: string; rest: string[] }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  notFound();
}
