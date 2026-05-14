'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/routing';
import { Globe, ChevronDown } from 'lucide-react';
import { useState, useTransition } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const LANGS = [
  { code: 'ar', label: 'العربية', flag: '🇪🇬' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
  { code: 'it', label: 'Italiano', flag: '🇮🇹' },
] as const;

export function LanguageSwitcher({ transparent = false, compact = false }: { transparent?: boolean; compact?: boolean }) {
  void compact;
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const current = LANGS.find((l) => l.code === locale);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          'flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
          transparent ? 'text-cream/90 hover:bg-white/10' : 'text-primary/80 hover:bg-muted',
          isPending && 'opacity-60',
        )}
      >
        <Globe className="h-4 w-4" />
        <span className="hidden sm:inline">{current?.label}</span>
        <span className="sm:hidden">{current?.flag}</span>
        <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', open && 'rotate-180')} />
      </button>
      <AnimatePresence>
        {open && (
          <>
            <button className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden />
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              className="absolute end-0 top-full mt-2 min-w-[160px] rounded-xl bg-cream border border-accent/20 shadow-2xl shadow-primary/15 p-1 z-50"
            >
              {LANGS.map((l) => (
                <button
                  key={l.code}
                  onClick={() => {
                    setOpen(false);
                    startTransition(() => router.replace(pathname, { locale: l.code as 'ar' }));
                  }}
                  className={cn(
                    'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors',
                    locale === l.code
                      ? 'bg-accent/15 text-primary font-bold'
                      : 'text-primary/75 hover:bg-accent/10 hover:text-primary',
                  )}
                >
                  <span>{l.flag}</span>
                  <span>{l.label}</span>
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
