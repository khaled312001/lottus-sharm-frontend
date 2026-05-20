'use client';

import { useState, useEffect, useRef, type FormEvent } from 'react';
import { useRouter } from '@/i18n/routing';
import { useLocale } from 'next-intl';
import { Search, X, Loader2, MapPin, BookOpen, ArrowUpRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { L, localeToApiCode } from '@/lib/utils';
import { API_BASE } from '@/lib/api';
import type { TripDTO, BlogPostDTO } from '@/types/api';
import { cn } from '@/lib/utils';

interface SearchResults {
  trips: TripDTO[];
  posts: BlogPostDTO[];
}

/**
 * Header search bar. Compact pill on desktop, full-width when expanded.
 * Mobile shows a full-screen overlay.
 */
export function SearchBar({ variant = 'header' }: { variant?: 'header' | 'drawer' }) {
  const router = useRouter();
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [results, setResults] = useState<SearchResults>({ trips: [], posts: [] });
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Live search with debounce
  useEffect(() => {
    if (!q.trim() || q.trim().length < 2) {
      setResults({ trips: [], posts: [] });
      return;
    }
    setLoading(true);
    const id = setTimeout(async () => {
      try {
        const apiLocale = localeToApiCode(locale);
        const [tripsRes, postsRes] = await Promise.all([
          fetch(`${API_BASE}/public/trips?locale=${apiLocale}&pageSize=5&search=${encodeURIComponent(q)}`),
          fetch(`${API_BASE}/public/blog?locale=${apiLocale}&pageSize=20`),
        ]);
        const tripsData = await tripsRes.json();
        const postsData = await postsRes.json();
        // Client-side filter blog by title since API doesn't accept search
        const allPosts = (postsData?.data?.items ?? []) as BlogPostDTO[];
        const qLower = q.toLowerCase();
        const filteredPosts = allPosts.filter((p) => {
          const title = (p.tr?.title || '').toLowerCase();
          const excerpt = (p.tr?.excerpt || '').toLowerCase();
          return title.includes(qLower) || excerpt.includes(qLower);
        }).slice(0, 4);
        setResults({
          trips: (tripsData?.data?.items ?? []).slice(0, 4),
          posts: filteredPosts,
        });
      } catch { /* ignore */ } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(id);
  }, [q, locale]);

  // Close on click outside
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  // Close on escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') { setOpen(false); inputRef.current?.blur(); }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!q.trim()) return;
    setOpen(false);
    router.push(`/trips?search=${encodeURIComponent(q)}` as never);
  }

  const totalResults = results.trips.length + results.posts.length;
  const placeholder = L(locale, { ar: 'ابحث عن رحلة أو مقالة...', en: 'Search trips or articles...', de: 'Ausflüge oder Artikel suchen ...', ru: 'Поиск туров и статей...', it: 'Cerca tour o articoli...' });

  // Drawer variant — always expanded
  if (variant === 'drawer') {
    return (
      <div ref={containerRef} className="relative w-full">
        <form onSubmit={onSubmit} className="relative">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-accent/70 pointer-events-none" />
          <input
            ref={inputRef}
            type="search"
            value={q}
            onChange={(e) => { setQ(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            placeholder={placeholder}
            className="w-full ps-10 pe-9 py-3 rounded-xl bg-cream/10 border border-accent/25 text-cream placeholder:text-cream/40 text-sm focus:bg-cream/15 focus:border-accent/60 outline-none transition-all"
          />
          {q && (
            <button
              type="button"
              onClick={() => { setQ(''); inputRef.current?.focus(); }}
              className="absolute end-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-cream/60 hover:text-cream hover:bg-cream/10"
              aria-label="Clear"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </form>
        <SearchResultsDropdown
          open={open && q.length >= 2}
          loading={loading}
          results={results}
          locale={locale}
          q={q}
          totalResults={totalResults}
          onSelect={() => { setOpen(false); setQ(''); }}
          theme="dark"
        />
      </div>
    );
  }

  // Header variant — icon-only button that expands to a wide input on click.
  // Saves horizontal space in the crowded header. Closes on outside click.
  return (
    <div ref={containerRef} className="relative">
      {!open ? (
        <button
          type="button"
          onClick={() => { setOpen(true); setTimeout(() => inputRef.current?.focus(), 50); }}
          aria-label={placeholder as string}
          title={placeholder as string}
          className={cn(
            'inline-flex items-center justify-center w-10 h-10 rounded-lg border transition-all',
            'text-cream hover:text-accent border-cream/20 hover:border-accent/60 bg-cream/5 hover:bg-cream/10',
          )}
        >
          <Search className="h-4 w-4" />
        </button>
      ) : (
        <form onSubmit={onSubmit} className="relative w-64 md:w-80 animate-in slide-in-from-end-2 fade-in duration-200">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-cream/60 pointer-events-none" />
          <input
            ref={inputRef}
            type="search"
            value={q}
            onChange={(e) => { setQ(e.target.value); }}
            placeholder={placeholder}
            className="h-10 w-full ps-10 pe-9 rounded-lg bg-cream/10 border border-accent/40 focus:border-accent text-cream placeholder:text-cream/45 text-sm outline-none transition-all"
          />
          <button
            type="button"
            onClick={() => { setQ(''); setOpen(false); }}
            className="absolute end-2 top-1/2 -translate-y-1/2 p-1 rounded text-cream/60 hover:text-cream hover:bg-cream/10"
            aria-label="Close search"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </form>
      )}
      <SearchResultsDropdown
        open={open && q.length >= 2}
        loading={loading}
        results={results}
        locale={locale}
        q={q}
        totalResults={totalResults}
        onSelect={() => { setOpen(false); setQ(''); }}
        theme="light"
      />
    </div>
  );
}

function SearchResultsDropdown({
  open, loading, results, locale, q, totalResults, onSelect, theme,
}: {
  open: boolean;
  loading: boolean;
  results: SearchResults;
  locale: string;
  q: string;
  totalResults: number;
  onSelect: () => void;
  theme: 'light' | 'dark';
}) {
  const isDark = theme === 'dark';
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -8, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.97 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className={cn(
            'absolute top-full inset-x-0 mt-2 rounded-xl shadow-2xl border max-h-[70vh] overflow-y-auto z-50',
            isDark
              ? 'bg-primary-950 border-accent/25 text-cream'
              : 'bg-white border-accent/20 text-foreground',
          )}
        >
          {loading && (
            <div className={cn('px-4 py-6 text-center text-sm', isDark ? 'text-cream/60' : 'text-muted-foreground')}>
              <Loader2 className="h-4 w-4 animate-spin mx-auto mb-2" />
              {L(locale, { ar: 'جاري البحث...', en: 'Searching...', de: 'Suche läuft ...', ru: 'Поиск...', it: 'Ricerca...' })}
            </div>
          )}

          {!loading && totalResults === 0 && (
            <div className={cn('px-4 py-6 text-center text-sm', isDark ? 'text-cream/60' : 'text-muted-foreground')}>
              {L(locale, { ar: `لا توجد نتائج لـ "${q}"`, en: `No results for "${q}"`, de: `Keine Ergebnisse für "${q}"`, ru: `Нет результатов для «${q}»`, it: `Nessun risultato per "${q}"` })}
            </div>
          )}

          {!loading && results.trips.length > 0 && (
            <div className="p-2">
              <div className={cn('px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] font-bold', isDark ? 'text-accent/70' : 'text-accent-700')}>
                {L(locale, { ar: 'الرحلات', en: 'Trips', de: 'Touren', ru: 'Туры', it: 'Tour' })}
              </div>
              {results.trips.map((t) => (
                <a
                  key={t.id}
                  href={`/${locale}/trips/${t.slug}`}
                  onClick={onSelect}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                    isDark ? 'hover:bg-cream/8' : 'hover:bg-muted',
                  )}
                >
                  <span className={cn('flex items-center justify-center w-9 h-9 rounded-lg flex-shrink-0', isDark ? 'bg-accent/15 text-accent' : 'bg-primary/10 text-primary')}>
                    <MapPin className="h-4 w-4" />
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block font-bold text-sm truncate">{t.tr?.title || t.slug}</span>
                    <span className={cn('block text-[11px] truncate', isDark ? 'text-cream/55' : 'text-muted-foreground')}>
                      {t.tr?.shortDesc || ''}
                    </span>
                  </span>
                  <ArrowUpRight className={cn('h-4 w-4 flex-shrink-0', isDark ? 'text-cream/40' : 'text-muted-foreground')} />
                </a>
              ))}
            </div>
          )}

          {!loading && results.posts.length > 0 && (
            <div className="p-2 border-t border-current/10">
              <div className={cn('px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] font-bold', isDark ? 'text-accent/70' : 'text-accent-700')}>
                {L(locale, { ar: 'المدونة', en: 'Blog', de: 'Blog', ru: 'Блог', it: 'Blog' })}
              </div>
              {results.posts.map((p) => (
                <a
                  key={p.id}
                  href={`/${locale}/blog/${p.slug}`}
                  onClick={onSelect}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                    isDark ? 'hover:bg-cream/8' : 'hover:bg-muted',
                  )}
                >
                  <span className={cn('flex items-center justify-center w-9 h-9 rounded-lg flex-shrink-0', isDark ? 'bg-accent/15 text-accent' : 'bg-primary/10 text-primary')}>
                    <BookOpen className="h-4 w-4" />
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block font-bold text-sm truncate">{p.tr?.title || p.slug}</span>
                    <span className={cn('block text-[11px] truncate', isDark ? 'text-cream/55' : 'text-muted-foreground')}>
                      {p.tr?.excerpt?.slice(0, 60) || ''}
                    </span>
                  </span>
                  <ArrowUpRight className={cn('h-4 w-4 flex-shrink-0', isDark ? 'text-cream/40' : 'text-muted-foreground')} />
                </a>
              ))}
            </div>
          )}

          {!loading && totalResults > 0 && (
            <div className={cn('px-3 py-2 border-t text-[11px]', isDark ? 'border-cream/10 text-cream/55' : 'border-muted text-muted-foreground')}>
              {L(locale, {
                ar: `اضغط Enter للبحث عن "${q}"`,
                en: `Press Enter to search for "${q}"`, de: `Drücken Sie Enter, um nach "${q}" zu suchen`,
                ru: `Нажмите Enter для поиска "${q}"`,
                it: `Premi Invio per cercare "${q}"`,
              })}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
