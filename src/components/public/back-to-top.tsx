'use client';

import { useEffect, useState } from 'react';
import { ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Avoid setState on every scroll frame — only flip when crossing the
    // threshold. Mobile scroll jank otherwise.
    let raf = 0;
    let last = false;
    const check = () => {
      const v = window.scrollY > 600;
      if (v !== last) {
        last = v;
        setVisible(v);
      }
      raf = 0;
    };
    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(check);
    };
    check();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <button
      type="button"
      aria-label="Back to top"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className={cn(
        'fixed bottom-4 md:bottom-6 end-4 md:end-6 z-30 inline-flex items-center justify-center w-11 h-11 rounded-full bg-primary text-cream shadow-2xl shadow-primary-900/30 border border-accent/30 backdrop-blur transition-all duration-300 hover:bg-primary-700 hover:-translate-y-1 hover:shadow-accent/30',
        visible ? 'opacity-100 pointer-events-auto translate-y-0' : 'opacity-0 pointer-events-none translate-y-2',
      )}
    >
      <ChevronUp className="h-5 w-5" />
    </button>
  );
}
