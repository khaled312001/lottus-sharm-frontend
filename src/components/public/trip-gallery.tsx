'use client';

import Image from 'next/image';
import { useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MediaDTO } from '@/types/api';

export function TripGallery({ images, title }: { images: MediaDTO[]; title: string }) {
  const [open, setOpen] = useState<number | null>(null);
  const valid = images.filter((m) => m.type === 'IMAGE');
  if (valid.length === 0) return null;
  const main = valid[0];

  const nav = (delta: number) => {
    if (open === null) return;
    const next = (open + delta + valid.length) % valid.length;
    setOpen(next);
  };

  return (
    <>
      <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[420px] rounded-2xl overflow-hidden">
        <button
          onClick={() => setOpen(0)}
          className="col-span-2 row-span-2 relative group focus:outline-none"
        >
          <Image src={main.mediumUrl || main.url} alt={title} fill sizes="50vw" className="object-cover group-hover:scale-105 transition-transform" />
        </button>
        {valid.slice(1, 5).map((img, i) => (
          <button
            key={img.id}
            onClick={() => setOpen(i + 1)}
            className={cn('relative group focus:outline-none', i === 3 && valid.length > 5 && 'after:absolute after:inset-0 after:bg-black/60 after:flex after:items-center after:justify-center after:text-white after:font-bold after:text-lg after:content-[\'+more\']')}
          >
            <Image src={img.mediumUrl || img.url} alt="" fill sizes="25vw" className="object-cover group-hover:scale-105 transition-transform" />
          </button>
        ))}
      </div>

      {open !== null && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4" onClick={() => setOpen(null)}>
          <button
            onClick={(e) => { e.stopPropagation(); setOpen(null); }}
            className="absolute top-6 end-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); nav(-1); }}
            className="absolute start-6 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white"
          >
            <ChevronLeft className="h-6 w-6 rtl:rotate-180" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); nav(1); }}
            className="absolute end-6 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white"
          >
            <ChevronRight className="h-6 w-6 rtl:rotate-180" />
          </button>
          <div className="relative w-full max-w-5xl aspect-[3/2]" onClick={(e) => e.stopPropagation()}>
            <Image src={valid[open].url} alt="" fill sizes="80vw" className="object-contain" />
          </div>
          <div className="absolute bottom-6 inset-x-0 text-center text-white text-sm">{open + 1} / {valid.length}</div>
        </div>
      )}
    </>
  );
}
