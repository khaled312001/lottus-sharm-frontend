'use client';

import { useEffect, useState } from 'react';
import { Link } from '@/i18n/routing';
import Image from 'next/image';
import { useLocale } from 'next-intl';
import { Clock } from 'lucide-react';
import { L } from '@/lib/utils';

type RecentItem = {
  id: number;
  slug: string;
  title: string;
  image: string;
  price: string;
  viewedAt: number;
};

const KEY = 'lotus_recent_trips';
const MAX = 6;

export function trackRecentlyViewed(item: Omit<RecentItem, 'viewedAt'>) {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(KEY);
    const list: RecentItem[] = raw ? JSON.parse(raw) : [];
    const without = list.filter((x) => x.id !== item.id);
    without.unshift({ ...item, viewedAt: Date.now() });
    localStorage.setItem(KEY, JSON.stringify(without.slice(0, MAX)));
  } catch {/* ignore */}
}

export function RecentlyViewedStrip({ excludeSlug }: { excludeSlug?: string }) {
  const locale = useLocale();
  const [items, setItems] = useState<RecentItem[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      const list: RecentItem[] = raw ? JSON.parse(raw) : [];
      setItems(list.filter((x) => x.slug !== excludeSlug).slice(0, 5));
    } catch {/* ignore */}
  }, [excludeSlug]);

  if (items.length === 0) return null;

  return (
    <section className="py-10 md:py-14 border-t border-accent/15 bg-muted/15">
      <div className="container">
        <div className="flex items-center gap-2.5 mb-5">
          <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-accent/15 border border-accent/30 text-accent-700">
            <Clock className="h-4 w-4" />
          </span>
          <h3 className="font-serif text-xl md:text-2xl font-bold text-primary leading-tight">
            {L(locale, { ar: 'شاهدتها مؤخراً', en: 'Recently viewed', de: 'Zuletzt angesehen', ru: 'Недавно просмотренные', it: 'Visti di recente' })}
          </h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
          {items.map((it) => (
            <Link
              key={it.id}
              href={`/trips/${it.slug}` as never}
              className="group block bg-white rounded-xl border border-accent/15 overflow-hidden hover:-translate-y-1 hover:border-accent/40 hover:shadow-lg transition-all"
            >
              <div className="relative aspect-[4/3] bg-muted">
                {it.image && (
                  <Image
                    src={it.image}
                    alt={it.title}
                    fill
                    sizes="(max-width: 640px) 50vw, 20vw"
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-primary-900/60 to-transparent" />
                <div className="absolute bottom-2 start-2 end-2">
                  <div className="text-cream font-bold text-xs sm:text-sm leading-tight line-clamp-2 drop-shadow-lg">{it.title}</div>
                </div>
              </div>
              <div className="px-3 py-2 text-[11px] text-muted-foreground flex items-center justify-between">
                <span className="font-bold text-accent-700">{it.price}</span>
                <span className="opacity-60">{relativeAgo(it.viewedAt, locale)}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function relativeAgo(ts: number, locale: string): string {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return L(locale, { ar: 'الآن', en: 'now', de: 'jetzt', ru: 'сейчас', it: 'ora' }) as string;
  if (m < 60) return L(locale, { ar: `${m}د`, en: `${m}m`, de: `${m}Min`, ru: `${m}м`, it: `${m}m` }) as string;
  const h = Math.floor(m / 60);
  if (h < 24) return L(locale, { ar: `${h}س`, en: `${h}h`, de: `${h}Std`, ru: `${h}ч`, it: `${h}h` }) as string;
  const d = Math.floor(h / 24);
  return L(locale, { ar: `${d}ي`, en: `${d}d`, de: `${d}T`, ru: `${d}д`, it: `${d}g` }) as string;
}
