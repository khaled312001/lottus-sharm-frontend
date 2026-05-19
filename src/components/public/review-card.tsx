'use client';

import { useState } from 'react';
import { Star, ChevronDown, ChevronUp } from 'lucide-react';
import { L, cn } from '@/lib/utils';

interface ReviewItem {
  id: number;
  customerName: string;
  rating: number;
  comment: string;
  locale: string;
  createdAt: string;
  images?: string[];
  videos?: string[];
  trip?: { slug: string; translations: Array<{ locale: string; title: string }> } | null;
}

const LONG_COMMENT_THRESHOLD = 220; // chars

export function ReviewCard({ review: r, locale }: { review: ReviewItem; locale: string }) {
  const [expanded, setExpanded] = useState(false);
  const tripTitle = r.trip?.translations.find((t) => t.locale === locale.toUpperCase())?.title || r.trip?.translations[0]?.title;
  const hasMore = r.comment.length > LONG_COMMENT_THRESHOLD || r.comment.split('\n').length > 6;

  return (
    <article className="bg-white rounded-xl border border-accent/15 p-4 hover:border-accent/40 hover:shadow-md transition-all h-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, idx) => (
            <Star key={idx} className={`h-3.5 w-3.5 ${idx < r.rating ? 'fill-accent text-accent' : 'text-muted-foreground/30'}`} />
          ))}
        </div>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">{r.locale}</span>
      </div>

      <p
        className={cn(
          'text-[13px] text-foreground/85 leading-relaxed mb-2 flex-1 whitespace-pre-wrap',
          !expanded && hasMore && 'line-clamp-6',
        )}
        dir="auto"
      >
        {r.comment}
      </p>

      {hasMore && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="self-start inline-flex items-center gap-1 text-[11px] font-bold text-accent-700 hover:text-accent-800 hover:underline mb-3 transition-colors"
        >
          {expanded
            ? (<>{L(locale, { ar: 'عرض أقل', en: 'Show less', ru: 'Свернуть', it: 'Mostra meno', de: 'Weniger anzeigen' })} <ChevronUp className="h-3 w-3" /></>)
            : (<>{L(locale, { ar: 'عرض المزيد', en: 'Show more', ru: 'Показать ещё', it: 'Mostra altro', de: 'Mehr anzeigen' })} <ChevronDown className="h-3 w-3" /></>)}
        </button>
      )}

      {/* Attached images */}
      {r.images && r.images.length > 0 && (
        <div className={`grid gap-1 mb-3 ${r.images.length === 1 ? 'grid-cols-1' : r.images.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
          {r.images.slice(0, 3).map((url, idx) => (
            <a key={url} href={url} target="_blank" rel="noopener noreferrer" className="relative aspect-square overflow-hidden rounded-md bg-muted group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform" />
              {idx === 2 && r.images!.length > 3 && (
                <span className="absolute inset-0 bg-black/55 flex items-center justify-center text-white text-xs font-bold">+{r.images!.length - 3}</span>
              )}
            </a>
          ))}
        </div>
      )}

      {/* Attached videos */}
      {r.videos && r.videos.length > 0 && (
        <div className="grid gap-1 mb-3 grid-cols-1">
          {r.videos.slice(0, 1).map((url) => (
            <video key={url} src={url} controls preload="metadata" className="w-full aspect-video rounded-md bg-black" />
          ))}
        </div>
      )}

      <div className="pt-2 border-t border-accent/10 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="font-bold text-primary text-xs truncate">{r.customerName}</div>
          {tripTitle && <div className="text-[10px] text-muted-foreground truncate">{tripTitle}</div>}
        </div>
        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
          {new Date(r.createdAt).toLocaleDateString(locale === 'ar' ? 'ar-EG' : locale, { year: 'numeric', month: 'short' })}
        </span>
      </div>
    </article>
  );
}
