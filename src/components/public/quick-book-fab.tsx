'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { Calendar, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Floating "Quick book" button — appears once the user scrolls past the hero
 * and disappears when the booking widget is on screen. Tapping smoothly scrolls
 * to the widget. Lives on mobile primarily; on desktop the widget is sticky
 * in the sidebar so the FAB is also useful but less critical.
 */
export function QuickBookFab({ targetId = 'book' }: { targetId?: string }) {
  const locale = useLocale();
  const isAr = locale === 'ar';
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const target = document.getElementById(targetId);
    if (!target) return;

    // Hide the FAB whenever ANY part of the booking widget enters the viewport,
    // so the gold pill never sits on top of the form. The negative bottom
    // rootMargin (200px) means we start hiding 200px BEFORE the widget reaches
    // the viewport edge — gives the user a smooth handoff instead of an abrupt
    // overlap on mobile.
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          setVisible(false);
        } else {
          setVisible(window.scrollY > 280);
        }
      },
      { threshold: 0, rootMargin: '0px 0px -200px 0px' },
    );
    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [targetId]);

  const onClick = () => {
    const el = document.getElementById(targetId);
    if (!el) return;
    const header = 96; // sticky header offset
    const top = el.getBoundingClientRect().top + window.scrollY - header;
    window.scrollTo({ top, behavior: 'smooth' });
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={isAr ? 'اذهب لنموذج الحجز السريع' : 'Jump to quick booking'}
      className={cn(
        'fixed z-40 bottom-20 md:bottom-24 end-4 md:end-6',
        'group inline-flex items-center gap-2.5 ps-2.5 pe-4 py-2.5 rounded-full',
        'bg-gradient-to-br from-accent-700 via-accent to-accent-deep text-primary font-bold',
        'shadow-2xl shadow-accent/40 hover:shadow-accent/60 ring-2 ring-cream/60',
        'transition-all duration-300 hover:-translate-y-0.5',
        visible ? 'opacity-100 pointer-events-auto translate-y-0' : 'opacity-0 pointer-events-none translate-y-4',
      )}
    >
      <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-primary text-accent shrink-0 group-hover:rotate-6 transition-transform">
        <Calendar className="h-4.5 w-4.5" />
      </span>
      <span className="flex flex-col items-start leading-tight">
        <span className="text-[10px] uppercase tracking-[0.18em] text-primary/75 font-extrabold">
          {isAr ? 'احجز الآن' : 'Book now'}
        </span>
        <span className="text-sm font-extrabold inline-flex items-center gap-1">
          {isAr ? 'حجز سريع' : 'Quick booking'}
          <ChevronUp className="h-3.5 w-3.5 -mt-0.5 animate-bounce" />
        </span>
      </span>
    </button>
  );
}
