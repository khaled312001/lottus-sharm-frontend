'use client';

import { useEffect, useState } from 'react';
import { ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <button
      type="button"
      aria-label="Back to top"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className={cn(
        'fixed bottom-20 md:bottom-24 end-4 md:end-6 z-30 inline-flex items-center justify-center w-11 h-11 rounded-full bg-primary text-cream shadow-2xl shadow-primary-900/30 border border-accent/30 backdrop-blur transition-all duration-300 hover:bg-primary-700 hover:-translate-y-1 hover:shadow-accent/30',
        visible ? 'opacity-100 pointer-events-auto translate-y-0' : 'opacity-0 pointer-events-none translate-y-2',
      )}
    >
      <ChevronUp className="h-5 w-5" />
    </button>
  );
}
