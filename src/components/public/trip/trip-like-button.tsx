'use client';
import { useEffect, useState, useTransition } from 'react';
import { Heart } from 'lucide-react';
import { api } from '@/lib/api';
import { L } from '@/lib/utils';

export function TripLikeButton({ slug, locale, initialCount = 0 }: { slug: string; locale: string; initialCount?: number }) {
  const [count, setCount] = useState(initialCount);
  const [liked, setLiked] = useState(false);
  const [bump, setBump] = useState(false);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    api.get<{ count: number; liked: boolean }>(`/public/trips/${slug}/likes`)
      .then((d) => { setCount(d.count); setLiked(d.liked); })
      .catch(() => undefined);
  }, [slug]);

  const toggle = () => {
    setBump(true);
    setTimeout(() => setBump(false), 320);
    // optimistic
    setLiked((l) => !l);
    setCount((c) => c + (liked ? -1 : 1));
    startTransition(() => {
      api.post<{ count: number; liked: boolean }>(`/public/trips/${slug}/likes`, {})
        .then((d) => { setCount(d.count); setLiked(d.liked); })
        .catch(() => {
          // rollback
          setLiked((l) => !l);
          setCount((c) => c + (liked ? 1 : -1));
        });
    });
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      aria-pressed={liked}
      className={
        'group inline-flex items-center gap-2 px-4 py-2.5 rounded-full border font-semibold text-sm transition-all duration-200 ' +
        (liked
          ? 'bg-rose-500 text-white border-rose-500 shadow-lg shadow-rose-500/30 hover:bg-rose-600'
          : 'bg-white text-primary border-accent/30 hover:border-rose-300 hover:text-rose-600 hover:shadow-md')
      }
    >
      <Heart
        className={
          `h-4 w-4 transition-transform duration-300 ${liked ? 'fill-current' : ''} ${bump ? 'scale-125' : 'scale-100'}`
        }
      />
      <span className="tabular-nums">{count}</span>
      <span className="hidden sm:inline">
        {liked
          ? L(locale, { ar: 'أعجبتك', en: 'Liked', de: 'Gefällt mir', ru: 'Нравится', it: 'Ti piace' })
          : L(locale, { ar: 'إعجاب', en: 'Like', de: 'Gefällt mir', ru: 'Нравится', it: 'Mi piace' })}
      </span>
    </button>
  );
}
