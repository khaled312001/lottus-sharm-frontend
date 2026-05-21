'use client';

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Video, Play, Maximize2, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn, L } from '@/lib/utils';
import { Lightbox, type LightboxItem } from './lightbox';

const PAGE_SIZE = 20;

interface MediaItem {
  url: string;
  thumb?: string;
  alt: string;
  tripSlug: string;
  category: string;
  folder?: string;
  type: 'IMAGE' | 'VIDEO';
}

export function GalleryTabs({ photos, videos, locale }: { photos: MediaItem[]; videos: MediaItem[]; locale: string }) {
  const [tab, setTab] = useState<'all' | 'photos' | 'videos'>('all');
  const [folder, setFolder] = useState<string>('ALL');
  const [open, setOpen] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const isAr = locale === 'ar';

  // Admin-defined gallery sections (folders), in order of frequency.
  const folders = useMemo(() => {
    const counts = new Map<string, number>();
    [...photos, ...videos].forEach((m) => { if (m.folder) counts.set(m.folder, (counts.get(m.folder) || 0) + 1); });
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([name]) => name);
  }, [photos, videos]);

  const byFolder = (arr: MediaItem[]) => folder === 'ALL' ? arr : arr.filter((m) => m.folder === folder);

  const items = useMemo(() => {
    const base = tab === 'photos' ? photos : tab === 'videos' ? videos : [...photos, ...videos];
    return byFolder(base);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, photos, videos, folder]);

  // Reset to first page whenever a filter changes
  useEffect(() => { setPage(1); }, [tab, folder]);

  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageStart = (safePage - 1) * PAGE_SIZE;
  const pageItems = items.slice(pageStart, pageStart + PAGE_SIZE);

  // Lightbox indices are relative to the FULL list so swiping inside the
  // lightbox can walk across pages without needing to navigate.
  const lightboxItems: LightboxItem[] = items.map((m) => ({
    url: m.url,
    thumb: m.thumb,
    alt: m.alt,
    type: m.type,
  }));

  const goTo = (p: number) => {
    setPage(p);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: window.scrollY > 400 ? 200 : 0, behavior: 'smooth' });
    }
  };

  return (
    <div>
      <div className="flex justify-center mb-8">
        <div className="inline-flex items-center bg-white rounded-full p-1 border border-accent/20 shadow-sm">
          {[
            { k: 'all',    ar: 'الكل',     en: 'All',     de: 'Alle',   ru: 'Все',   it: 'Tutti', count: photos.length + videos.length, icon: null },
            { k: 'photos', ar: 'صور',      en: 'Photos',  de: 'Fotos',  ru: 'Фото',  it: 'Foto',  count: photos.length, icon: Camera },
            { k: 'videos', ar: 'فيديوهات', en: 'Videos',  de: 'Videos', ru: 'Видео', it: 'Video', count: videos.length, icon: Video },
          ].map((t) => (
            <button
              key={t.k}
              onClick={() => setTab(t.k as 'all' | 'photos' | 'videos')}
              className={cn(
                'inline-flex items-center gap-2 px-4 md:px-5 py-2 md:py-2.5 rounded-full text-sm font-bold transition-all',
                tab === t.k ? 'bg-primary text-cream shadow' : 'text-primary/70 hover:text-primary',
              )}
            >
              {t.icon && <t.icon className="h-4 w-4" />}
              {L(locale, { ar: t.ar, en: t.en, ru: t.ru, it: t.it, de: t.de })}
              <span className={cn('text-xs px-2 py-0.5 rounded-full', tab === t.k ? 'bg-accent text-primary' : 'bg-accent/15 text-accent-700')}>
                {t.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Admin-defined section filters (folders) */}
      {folders.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2 mb-8 -mt-3">
          <button
            onClick={() => setFolder('ALL')}
            className={cn(
              'px-3.5 py-1.5 rounded-full text-xs font-bold border transition-colors',
              folder === 'ALL' ? 'bg-accent text-primary border-accent' : 'bg-white text-primary/70 border-accent/25 hover:bg-accent/10',
            )}
          >
            {L(locale, { ar: 'كل الأقسام', en: 'All sections', de: 'Alle Bereiche', ru: 'Все разделы', it: 'Tutte le sezioni' })}
          </button>
          {folders.map((f) => (
            <button
              key={f}
              onClick={() => setFolder(f)}
              className={cn(
                'px-3.5 py-1.5 rounded-full text-xs font-bold border transition-colors',
                folder === f ? 'bg-accent text-primary border-accent' : 'bg-white text-primary/70 border-accent/25 hover:bg-accent/10',
              )}
            >
              {f}
            </button>
          ))}
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
        >
          {items.length === 0 ? (
            <p className="text-center text-muted-foreground py-16">{L(locale, { ar: 'لا يوجد محتوى', en: 'No content yet', de: 'Noch keine Inhalte', ru: 'Контента пока нет', it: 'Nessun contenuto' })}</p>
          ) : (
            <>
              <div className="columns-2 md:columns-3 lg:columns-4 gap-3 md:gap-4 space-y-3 md:space-y-4">
                {pageItems.map((m, i) => {
                  const absIndex = pageStart + i;
                  return m.type === 'VIDEO' ? (
                    <VideoTile key={`v-${absIndex}`} m={m} onOpen={() => setOpen(absIndex)} />
                  ) : (
                    <PhotoTile key={`p-${absIndex}`} m={m} index={absIndex} onOpen={() => setOpen(absIndex)} />
                  );
                })}
              </div>

              {totalPages > 1 && (
                <Pagination
                  page={safePage}
                  totalPages={totalPages}
                  total={items.length}
                  pageSize={PAGE_SIZE}
                  pageStart={pageStart}
                  onGo={goTo}
                  locale={locale}
                />
              )}
            </>
          )}
        </motion.div>
      </AnimatePresence>

      <Lightbox items={lightboxItems} startIndex={open} onClose={() => setOpen(null)} />
    </div>
  );
}

function Pagination({
  page, totalPages, total, pageSize, pageStart, onGo, locale,
}: {
  page: number; totalPages: number; total: number; pageSize: number; pageStart: number;
  onGo: (p: number) => void; locale: string;
}) {
  const isAr = locale === 'ar';
  const first = pageStart + 1;
  const last = Math.min(pageStart + pageSize, total);

  // Build a windowed list of page numbers around the current page.
  const windowed: (number | 'gap')[] = [];
  const push = (v: number | 'gap') => { if (windowed[windowed.length - 1] !== v) windowed.push(v); };
  for (let p = 1; p <= totalPages; p++) {
    if (p === 1 || p === totalPages || Math.abs(p - page) <= 1) push(p);
    else if (p === 2 || p === totalPages - 1) push('gap');
  }

  // In RTL, the "previous page" icon should still point at the LEFT of the
  // reading order (i.e. towards older pages). Lucide's ChevronRight is the
  // logical "previous" arrow in RTL.
  const PrevIcon = isAr ? ChevronRight : ChevronLeft;
  const NextIcon = isAr ? ChevronLeft : ChevronRight;

  return (
    <nav className="mt-10 flex flex-col items-center gap-3" aria-label={isAr ? 'تنقل بين الصفحات' : 'Pagination'}>
      <div className="text-xs text-muted-foreground tabular-nums">
        {isAr ? `يعرض ${first}–${last} من ${total}` : `Showing ${first}–${last} of ${total}`}
      </div>
      <div className="inline-flex items-center gap-1">
        <button
          type="button"
          onClick={() => onGo(Math.max(1, page - 1))}
          disabled={page === 1}
          aria-label={isAr ? 'الصفحة السابقة' : 'Previous page'}
          className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-accent/25 text-primary bg-white hover:bg-accent/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <PrevIcon className="h-4 w-4" />
        </button>

        {windowed.map((p, i) => (
          p === 'gap' ? (
            <span key={`gap-${i}`} className="w-10 text-center text-muted-foreground">…</span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onGo(p)}
              aria-current={p === page ? 'page' : undefined}
              className={cn(
                'inline-flex items-center justify-center min-w-10 h-10 px-3 rounded-lg text-sm font-semibold tabular-nums transition-colors border',
                p === page
                  ? 'bg-primary text-cream border-primary shadow'
                  : 'bg-white text-primary/80 border-accent/20 hover:bg-accent/10 hover:text-primary',
              )}
            >
              {p}
            </button>
          )
        ))}

        <button
          type="button"
          onClick={() => onGo(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          aria-label={isAr ? 'الصفحة التالية' : 'Next page'}
          className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-accent/25 text-primary bg-white hover:bg-accent/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <NextIcon className="h-4 w-4" />
        </button>
      </div>
    </nav>
  );
}

function PhotoTile({ m, index, onOpen }: { m: MediaItem; index: number; onOpen: () => void }) {
  const aspect = index % 4 === 0 ? '3/4' : index % 5 === 0 ? '4/5' : index % 3 === 0 ? '4/3' : '1/1';
  return (
    <button
      onClick={onOpen}
      className="group block relative overflow-hidden rounded-xl break-inside-avoid card-shadow hover:card-shadow-gold transition-shadow w-full"
      style={{ aspectRatio: aspect }}
      aria-label={`عرض ${m.alt}`}
    >
      <Image
        src={m.thumb || m.url}
        alt={m.alt}
        fill
        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
        className="object-cover group-hover:scale-110 transition-transform duration-700"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-primary-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
        <div className="text-cream text-start">
          <div className="text-[10px] uppercase tracking-wider text-accent">{m.category}</div>
          <div className="font-serif font-bold text-sm leading-tight line-clamp-2">{m.alt}</div>
        </div>
      </div>
      <div className="absolute top-2 end-2 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <Maximize2 className="h-3.5 w-3.5" />
      </div>
    </button>
  );
}

function VideoTile({ m, onOpen }: { m: MediaItem; onOpen: () => void }) {
  return (
    <button
      onClick={onOpen}
      className="group block relative overflow-hidden rounded-xl break-inside-avoid card-shadow hover:card-shadow-gold transition-shadow bg-primary-900 w-full"
      style={{ aspectRatio: '16/9' }}
      aria-label={`Play video`}
    >
      <video
        src={m.url}
        muted
        loop
        playsInline
        preload="metadata"
        onMouseEnter={(e) => e.currentTarget.play().catch(() => undefined)}
        onMouseLeave={(e) => { e.currentTarget.pause(); e.currentTarget.currentTime = 0; }}
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-primary-900/70 via-primary-900/20 to-transparent pointer-events-none" />
      <div className="absolute top-3 start-3 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-accent text-primary text-[10px] font-bold uppercase tracking-wider">
        <Video className="h-3 w-3" /> Video
      </div>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-14 h-14 rounded-full bg-cream/95 text-primary flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
          <Play className="h-6 w-6 fill-current ms-0.5" />
        </div>
      </div>
      <div className="absolute bottom-3 start-3 end-3 text-cream text-start">
        <div className="text-[10px] uppercase tracking-wider text-accent opacity-90">{m.category}</div>
        <div className="font-serif font-bold text-sm leading-tight line-clamp-2">{m.alt}</div>
      </div>
    </button>
  );
}
