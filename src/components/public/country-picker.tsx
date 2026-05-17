'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Globe2, ChevronDown, Search, Check, X } from 'lucide-react';
import { cn, L } from '@/lib/utils';
import { ALL_COUNTRIES, countryName, getCountry } from '@/lib/countries';

export function CountryPicker({
  value,
  onChange,
  locale,
  placeholder,
  className,
}: {
  value: string;
  onChange: (code: string) => void;
  locale: string;
  placeholder?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const triggerRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) { setQ(''); return; }
    setTimeout(() => inputRef.current?.focus(), 30);
    // Lock body scroll while modal is open
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return ALL_COUNTRIES
      .map((c) => ({ ...c, name: countryName(c.code, locale) }))
      .filter((c) => !needle || c.name.toLowerCase().includes(needle) || c.code.toLowerCase().includes(needle))
      .sort((a, b) => a.name.localeCompare(b.name, locale === 'ar' ? 'ar' : 'en'));
  }, [q, locale]);

  // Quick-pick chips for the most common nationalities (locale-aware order)
  const POPULAR_AR = ['EG', 'SA', 'AE', 'KW', 'JO', 'LB'];
  const POPULAR_EN = ['US', 'GB', 'DE', 'IT', 'FR', 'RU'];
  const POPULAR_RU = ['RU', 'UA', 'BY', 'KZ', 'DE', 'IL'];
  const POPULAR_IT = ['IT', 'DE', 'FR', 'ES', 'GB', 'CH'];
  const popular = (locale === 'ar' ? POPULAR_AR : locale === 'ru' ? POPULAR_RU : locale === 'it' ? POPULAR_IT : POPULAR_EN)
    .map((code) => ({ code, country: getCountry(code) }))
    .filter((p): p is { code: string; country: NonNullable<ReturnType<typeof getCountry>> } => Boolean(p.country))
    .filter((p) => !q.trim());

  const selected = value ? getCountry(value) : undefined;
  const selectedName = selected ? countryName(selected.code, locale) : '';

  const ph = placeholder || (L(locale, {
    ar: 'اختر الجنسية',
    en: 'Select nationality',
    ru: 'Выберите гражданство',
    it: 'Seleziona nazionalità',
  }) as string);

  return (
    <div className={cn('relative', className)}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          'w-full h-11 px-3 rounded-lg border-2 bg-white text-start',
          'flex items-center justify-between gap-2',
          'border-accent/25 hover:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent',
          'transition-all',
          open && 'border-accent ring-2 ring-accent/30',
        )}
      >
        <span className="inline-flex items-center gap-2 min-w-0 flex-1">
          {selected ? (
            <>
              <span className="text-xl leading-none">{selected.flag}</span>
              <span className="text-sm font-semibold text-primary truncate">{selectedName}</span>
            </>
          ) : (
            <>
              <Globe2 className="h-4 w-4 text-accent shrink-0" />
              <span className="text-sm text-muted-foreground truncate">{ph}</span>
            </>
          )}
        </span>
        <ChevronDown className={cn('h-4 w-4 text-muted-foreground shrink-0 transition-transform', open && 'rotate-180')} />
      </button>

      {mounted && open && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-3 sm:px-6 py-6" onClick={() => setOpen(false)}>
          <div aria-hidden className="absolute inset-0 bg-primary-900/65 backdrop-blur-sm animate-in fade-in duration-200" />
          <div
            role="dialog"
            aria-label="Country picker"
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl shadow-primary-900/30 border border-accent/30 overflow-hidden flex flex-col"
            style={{ animation: 'card-float-in 0.2s ease-out', maxHeight: 'calc(100svh - 3rem)' }}
          >
            {/* Header — title + close */}
            <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-accent/15 bg-gradient-to-br from-primary to-primary-900 text-cream">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-accent/15 border border-accent/30 text-accent">
                  <Globe2 className="h-4 w-4" />
                </span>
                <h3 className="font-bold text-sm">
                  {L(locale, { ar: 'اختر الجنسية', en: 'Select nationality', ru: 'Гражданство', it: 'Nazionalità' })}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-cream/10 transition-colors"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Search */}
            <div className="relative border-b border-accent/15 px-4 py-3">
              <Search className="absolute start-7 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                ref={inputRef}
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={L(locale, { ar: 'ابحث عن دولة...', en: 'Search country...', ru: 'Поиск страны...', it: 'Cerca paese...' }) as string}
                className="w-full h-11 ps-9 pe-3 rounded-lg bg-muted/40 border border-transparent focus:bg-white focus:border-accent/50 outline-none text-sm transition-colors"
                autoComplete="off"
              />
            </div>

            {/* Popular chips */}
            {popular.length > 0 && (
              <div className="px-4 pt-3">
                <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground mb-2">
                  {L(locale, { ar: 'الأكثر اختياراً', en: 'Popular', ru: 'Популярные', it: 'Più scelti' })}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {popular.map(({ code, country }) => {
                    const isSelected = code === value;
                    return (
                      <button
                        key={code}
                        type="button"
                        onClick={() => { onChange(code); setOpen(false); }}
                        className={cn(
                          'inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-xs font-bold transition-all',
                          isSelected
                            ? 'bg-accent text-primary border-accent shadow-md shadow-accent/30'
                            : 'bg-white border-accent/25 text-primary hover:border-accent hover:bg-accent/5',
                        )}
                      >
                        <span className="text-base leading-none">{country.flag}</span>
                        {countryName(code, locale)}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* List */}
            <ul className="flex-1 overflow-y-auto py-2 px-2">
              {filtered.length === 0 ? (
                <li className="px-4 py-12 text-center text-sm text-muted-foreground">
                  {L(locale, { ar: 'لا توجد نتائج', en: 'No results', ru: 'Нет результатов', it: 'Nessun risultato' })}
                </li>
              ) : filtered.map((c) => {
                const isSelected = c.code === value;
                return (
                  <li key={c.code}>
                    <button
                      type="button"
                      onClick={() => { onChange(c.code); setOpen(false); }}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-start text-sm transition-colors',
                        isSelected
                          ? 'bg-accent/15 font-bold text-primary'
                          : 'hover:bg-muted/60 text-primary',
                      )}
                    >
                      <span className="text-2xl leading-none shrink-0">{c.flag}</span>
                      <span className="flex-1 truncate">{c.name}</span>
                      {c.dial && <span className="text-xs text-muted-foreground font-mono tabular-nums" dir="ltr">{c.dial}</span>}
                      {isSelected && <Check className="h-4 w-4 text-accent shrink-0" />}
                    </button>
                  </li>
                );
              })}
            </ul>

            {/* Footer */}
            <div className="px-4 py-2.5 border-t border-accent/15 bg-muted/20 text-[11px] text-muted-foreground flex items-center justify-between">
              <span>
                {filtered.length} {L(locale, { ar: 'دولة', en: 'countries', ru: 'стран', it: 'paesi' })}
              </span>
              <kbd className="inline-flex items-center px-1.5 py-0.5 rounded border font-mono text-[10px] bg-white">ESC</kbd>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}
