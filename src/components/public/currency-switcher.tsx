'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { AnimatePresence, motion } from 'framer-motion';
import { Coins, ChevronDown, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CURRENCIES, useCurrency, type CurrencyCode } from '@/lib/currency';

export function CurrencySwitcher() {
  const locale = useLocale();
  const { currency, setCurrency, ratesUpdatedAt } = useCurrency();
  const [open, setOpen] = useState(false);
  const isAr = locale === 'ar';
  const meta = CURRENCIES[currency];

  const lastUpdated = ratesUpdatedAt
    ? new Date(ratesUpdatedAt).toLocaleString(isAr ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })
    : null;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        aria-label={isAr ? 'تغيير العملة' : 'Change currency'}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-lg px-2.5 sm:px-3 py-2 text-sm font-semibold transition-all border',
          'text-cream hover:text-accent border-cream/20 hover:border-accent/60 bg-cream/5 hover:bg-cream/10',
          open && 'bg-accent text-primary border-accent',
        )}
      >
        <Coins className="h-4 w-4" />
        <span className="hidden sm:inline tabular-nums">{meta.code}</span>
        <span className="sm:hidden text-sm leading-none">{meta.symbol}</span>
        <ChevronDown className={cn('h-3.5 w-3.5 transition-transform opacity-70', open && 'rotate-180 opacity-100')} />
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
              className="absolute end-0 top-full mt-2 min-w-[220px] rounded-xl bg-cream border border-accent/20 shadow-2xl shadow-primary/15 p-1 z-50"
            >
              <div className="px-3 py-2 border-b border-accent/15">
                <div className="text-[10px] uppercase tracking-[0.2em] text-primary/60 font-bold">
                  {isAr ? 'العملة المعروضة' : 'Display currency'}
                </div>
                {lastUpdated && (
                  <div className="text-[10px] text-primary/50 flex items-center gap-1 mt-0.5">
                    <RefreshCw className="h-2.5 w-2.5" />
                    {isAr ? 'آخر تحديث' : 'updated'} {lastUpdated}
                  </div>
                )}
              </div>
              {(Object.keys(CURRENCIES) as CurrencyCode[]).map((code) => {
                const c = CURRENCIES[code];
                return (
                  <button
                    key={code}
                    onClick={() => { setCurrency(code); setOpen(false); }}
                    className={cn(
                      'flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors',
                      currency === code
                        ? 'bg-accent/15 text-primary font-bold'
                        : 'text-primary/75 hover:bg-accent/10 hover:text-primary',
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <span>{c.flag}</span>
                      <span>{isAr ? c.arName : c.enName}</span>
                    </span>
                    <span className="font-mono text-xs opacity-70">{c.symbol}</span>
                  </button>
                );
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
