'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Video, Play } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MediaItem {
  url: string;
  thumb?: string;
  alt: string;
  tripSlug: string;
  category: string;
  type: 'IMAGE' | 'VIDEO';
}

export function GalleryTabs({ photos, videos, locale }: { photos: MediaItem[]; videos: MediaItem[]; locale: string }) {
  const [tab, setTab] = useState<'all' | 'photos' | 'videos'>('all');
  const isAr = locale === 'ar';

  const items =
    tab === 'photos' ? photos :
    tab === 'videos' ? videos :
    [...photos, ...videos].sort(() => 0); // keep order

  return (
    <div>
      <div className="flex justify-center mb-8">
        <div className="inline-flex items-center bg-white rounded-full p-1 border border-accent/20 shadow-sm">
          {[
            { k: 'all',    ar: 'الكل',     en: 'All',     count: photos.length + videos.length, icon: null },
            { k: 'photos', ar: 'صور',      en: 'Photos',  count: photos.length, icon: Camera },
            { k: 'videos', ar: 'فيديوهات', en: 'Videos',  count: videos.length, icon: Video },
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
              {isAr ? t.ar : t.en}
              <span className={cn('text-xs px-2 py-0.5 rounded-full', tab === t.k ? 'bg-accent text-primary' : 'bg-accent/15 text-accent-700')}>
                {t.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
        >
          {items.length === 0 ? (
            <p className="text-center text-muted-foreground py-16">{isAr ? 'لا يوجد محتوى' : 'No content yet'}</p>
          ) : (
            <div className="columns-2 md:columns-3 lg:columns-4 gap-3 md:gap-4 space-y-3 md:space-y-4">
              {items.slice(0, 80).map((m, i) => (
                m.type === 'VIDEO' ? (
                  <VideoTile key={`v-${i}`} m={m} />
                ) : (
                  <PhotoTile key={`p-${i}`} m={m} index={i} />
                )
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function PhotoTile({ m, index }: { m: MediaItem; index: number }) {
  const aspect = index % 4 === 0 ? '3/4' : index % 5 === 0 ? '4/5' : index % 3 === 0 ? '4/3' : '1/1';
  return (
    <Link href={`/trips/${m.tripSlug}`} className="group block relative overflow-hidden rounded-xl break-inside-avoid card-shadow hover:card-shadow-gold transition-shadow" style={{ aspectRatio: aspect }}>
      <Image src={m.thumb || m.url} alt={m.alt} fill sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw" className="object-cover group-hover:scale-110 transition-transform duration-700" />
      <div className="absolute inset-0 bg-gradient-to-t from-primary-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
        <div className="text-cream">
          <div className="text-[10px] uppercase tracking-wider text-accent">{m.category}</div>
          <div className="font-serif font-bold text-sm leading-tight line-clamp-2">{m.alt}</div>
        </div>
      </div>
    </Link>
  );
}

function VideoTile({ m }: { m: MediaItem }) {
  return (
    <div className="group block relative overflow-hidden rounded-xl break-inside-avoid card-shadow hover:card-shadow-gold transition-shadow bg-primary-900" style={{ aspectRatio: '16/9' }}>
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
      <Link href={`/trips/${m.tripSlug}`} className="absolute bottom-3 start-3 end-3 text-cream">
        <div className="text-[10px] uppercase tracking-wider text-accent opacity-90">{m.category}</div>
        <div className="font-serif font-bold text-sm leading-tight line-clamp-2">{m.alt}</div>
      </Link>
    </div>
  );
}
