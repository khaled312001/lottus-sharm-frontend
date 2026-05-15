'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Maximize2 } from 'lucide-react';
import { useLocale } from 'next-intl';
import { L } from '@/lib/utils';
import type { MediaDTO } from '@/types/api';
import { Lightbox, type LightboxItem } from './lightbox';

export function TripGallery({ images, title }: { images: MediaDTO[]; title: string }) {
  const locale = useLocale();
  const [open, setOpen] = useState<number | null>(null);
  // Accept both images and videos
  const all = images;
  if (all.length === 0) return null;
  const main = all[0];
  const extra = all.length - 5;

  const lightboxItems: LightboxItem[] = all.map((m) => ({
    url: m.url,
    thumb: m.mediumUrl || m.thumbnailUrl || m.url,
    alt: title,
    type: m.type,
  }));

  return (
    <>
      <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[300px] md:h-[420px] rounded-2xl overflow-hidden">
        <button
          onClick={() => setOpen(0)}
          className="col-span-2 row-span-2 relative group focus:outline-none"
          aria-label={`Open ${title} gallery`}
        >
          <Image
            src={main.mediumUrl || main.url}
            alt={title}
            fill
            sizes="(max-width: 768px) 50vw, 50vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute bottom-3 start-3 px-2.5 py-1.5 rounded-md bg-black/60 backdrop-blur text-white text-xs font-medium inline-flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <Maximize2 className="h-3.5 w-3.5" /> {L(locale, { ar: 'عرض الكل', en: 'View all', ru: 'Все фото', it: 'Vedi tutte' })}
          </div>
        </button>
        {all.slice(1, 5).map((img, i) => {
          const isLast = i === 3 && extra > 0;
          return (
            <button
              key={img.id}
              onClick={() => setOpen(i + 1)}
              className="relative group focus:outline-none"
              aria-label={`Open image ${i + 2}`}
            >
              <Image
                src={img.mediumUrl || img.url}
                alt=""
                fill
                sizes="25vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              {isLast && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white">
                  <div className="text-center">
                    <div className="font-bold text-xl md:text-2xl">+{extra}</div>
                    <div className="text-[10px] md:text-xs uppercase tracking-wider opacity-80">more</div>
                  </div>
                </div>
              )}
              {img.type === 'VIDEO' && !isLast && (
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center pointer-events-none">
                  <div className="w-10 h-10 rounded-full bg-white/90 text-primary flex items-center justify-center">▶</div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      <Lightbox items={lightboxItems} startIndex={open} onClose={() => setOpen(null)} />
    </>
  );
}
