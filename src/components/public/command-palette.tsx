'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from '@/i18n/routing';
import { useLocale } from 'next-intl';
import { Search, Map, BookOpen, ArrowRight, Loader2, Command as CmdIcon } from 'lucide-react';
import { L, localeToApiCode, cn } from '@/lib/utils';
import { API_BASE } from '@/lib/api';
import type { TripDTO, BlogPostDTO } from '@/types/api';

type Item = {
  id: string;
  group: 'trips' | 'posts' | 'pages';
  title: string;
  subtitle?: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

const PAGES = [
  { id: 'p-home',     href: '/',                    ar: 'الرئيسية',   en: 'Home',        ru: 'Главная',  it: 'Home' },
  { id: 'p-trips',    href: '/trips',               ar: 'الرحلات',    en: 'Trips',       ru: 'Туры',     it: 'Tour' },
  { id: 'p-blog',     href: '/blog',                ar: 'المدونة',    en: 'Blog',        ru: 'Блог',     it: 'Blog' },
  { id: 'p-about',    href: '/about',               ar: 'من نحن',     en: 'About',       ru: 'О нас',    it: 'Chi siamo' },
  { id: 'p-contact',  href: '/contact',             ar: 'تواصل',      en: 'Contact',     ru: 'Контакты', it: 'Contatti' },
  { id: 'p-privacy',  href: '/privacy',             ar: 'الخصوصية',   en: 'Privacy',     ru: 'Конфиденциальность', it: 'Privacy' },
  { id: 'p-terms',    href: '/terms',               ar: 'الشروط',     en: 'Terms',       ru: 'Условия',  it: 'Termini' },
];

export function CommandPalette() {
  const locale = useLocale();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(0);

  // Open with Cmd+K / Ctrl+K, close with Esc
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === 'Escape' && open) {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 30);
      setActive(0);
    } else {
      setQ('');
      setItems([]);
    }
  }, [open]);

  // Build static page results immediately + fetch trips/blog
  useEffect(() => {
    const needle = q.trim().toLowerCase();
    const pageItems: Item[] = PAGES
      .filter((p) => !needle || (L(locale, { ar: p.ar, en: p.en, ru: p.ru, it: p.it }) as string).toLowerCase().includes(needle) || p.href.includes(needle))
      .map((p) => ({
        id: p.id,
        group: 'pages',
        title: L(locale, { ar: p.ar, en: p.en, ru: p.ru, it: p.it }) as string,
        subtitle: p.href,
        href: p.href,
        icon: ArrowRight,
      }));

    if (!needle || needle.length < 2) {
      setItems(pageItems);
      setLoading(false);
      return;
    }

    setLoading(true);
    const id = setTimeout(async () => {
      try {
        const apiLocale = localeToApiCode(locale);
        const [tripsRes, postsRes] = await Promise.all([
          fetch(`${API_BASE}/public/trips?locale=${apiLocale}&pageSize=6&search=${encodeURIComponent(q)}`).then((r) => r.json()).catch(() => null),
          fetch(`${API_BASE}/public/blog?locale=${apiLocale}&pageSize=12`).then((r) => r.json()).catch(() => null),
        ]);
        const tripItems: Item[] = ((tripsRes?.data?.items as TripDTO[]) ?? []).slice(0, 5).map((t) => ({
          id: `t-${t.id}`,
          group: 'trips',
          title: t.tr?.title || t.slug,
          subtitle: t.tr?.shortDesc?.slice(0, 80),
          href: `/trips/${t.slug}`,
          icon: Map,
        }));
        const allPosts = (postsRes?.data?.items as BlogPostDTO[]) ?? [];
        const postItems: Item[] = allPosts
          .filter((p) => (p.tr?.title || '').toLowerCase().includes(needle) || (p.tr?.excerpt || '').toLowerCase().includes(needle))
          .slice(0, 4)
          .map((p) => ({
            id: `b-${p.id}`,
            group: 'posts',
            title: p.tr?.title || p.slug,
            subtitle: p.tr?.excerpt?.slice(0, 80),
            href: `/blog/${p.slug}`,
            icon: BookOpen,
          }));
        setItems([...tripItems, ...postItems, ...pageItems]);
      } catch { /* ignore */ } finally {
        setLoading(false);
      }
    }, 220);
    return () => clearTimeout(id);
  }, [q, locale]);

  // Keyboard nav inside the list
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(a + 1, items.length - 1)); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
      else if (e.key === 'Enter' && items[active]) {
        e.preventDefault();
        router.push(items[active].href as never);
        setOpen(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, items, active, router]);

  // Scroll active item into view
  useEffect(() => {
    if (!open || !listRef.current) return;
    const el = listRef.current.querySelector(`[data-idx="${active}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [active, open]);

  if (!open) return null;

  // Group items for rendering
  const groups: { key: Item['group']; label: string; items: Item[] }[] = [
    { key: 'trips', label: L(locale, { ar: 'الرحلات', en: 'Trips', ru: 'Туры', it: 'Tour' }) as string, items: items.filter((i) => i.group === 'trips') },
    { key: 'posts', label: L(locale, { ar: 'المدونة', en: 'Blog', ru: 'Блог', it: 'Blog' }) as string, items: items.filter((i) => i.group === 'posts') },
    { key: 'pages', label: L(locale, { ar: 'الصفحات', en: 'Pages', ru: 'Страницы', it: 'Pagine' }) as string, items: items.filter((i) => i.group === 'pages') },
  ];

  let runningIdx = -1;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4" onClick={() => setOpen(false)}>
      <div aria-hidden className="absolute inset-0 bg-primary-900/60 backdrop-blur-sm animate-in fade-in duration-200" />
      <div
        role="dialog"
        aria-label="Command palette"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-accent/25 overflow-hidden"
        style={{ animation: 'card-float-in 0.18s ease-out' }}
      >
        {/* Input */}
        <div className="flex items-center gap-3 px-4 border-b border-accent/15">
          <Search className="h-5 w-5 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            type="search"
            value={q}
            onChange={(e) => { setQ(e.target.value); setActive(0); }}
            placeholder={L(locale, { ar: 'ابحث في الموقع...', en: 'Search the site...', ru: 'Поиск по сайту...', it: 'Cerca nel sito...' }) as string}
            className="flex-1 h-14 bg-transparent outline-none text-base text-primary placeholder:text-muted-foreground"
          />
          <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded border text-[10px] font-mono text-muted-foreground bg-muted/30">ESC</kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-[60vh] overflow-y-auto p-2">
          {loading && (
            <div className="px-3 py-6 text-center text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin mx-auto mb-2" />
              {L(locale, { ar: 'جاري البحث...', en: 'Searching...', ru: 'Поиск...', it: 'Ricerca...' })}
            </div>
          )}

          {!loading && items.length === 0 && (
            <div className="px-3 py-8 text-center text-sm text-muted-foreground">
              {L(locale, { ar: 'لا توجد نتائج', en: 'No results', ru: 'Нет результатов', it: 'Nessun risultato' })}
            </div>
          )}

          {!loading && groups.map((g) => {
            if (g.items.length === 0) return null;
            return (
              <div key={g.key} className="mb-1">
                <div className="px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] font-bold text-accent-700">{g.label}</div>
                {g.items.map((it) => {
                  runningIdx++;
                  const isActive = runningIdx === active;
                  return (
                    <a
                      key={it.id}
                      data-idx={runningIdx}
                      href={`/${locale}${it.href}`}
                      onMouseEnter={() => setActive(items.indexOf(it))}
                      onClick={(e) => { e.preventDefault(); router.push(it.href as never); setOpen(false); }}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors',
                        isActive ? 'bg-accent/15' : 'hover:bg-muted/40',
                      )}
                    >
                      <span className={cn(
                        'inline-flex items-center justify-center w-8 h-8 rounded-lg shrink-0 border',
                        isActive ? 'bg-accent text-primary border-accent' : 'bg-muted text-primary/70 border-transparent',
                      )}>
                        <it.icon className="h-4 w-4" />
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="block text-sm font-bold text-primary truncate">{it.title}</span>
                        {it.subtitle && <span className="block text-[11px] text-muted-foreground truncate">{it.subtitle}</span>}
                      </span>
                      <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded border text-[9px] font-mono text-muted-foreground bg-white opacity-0 group-hover:opacity-100">↵</kbd>
                    </a>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-accent/15 bg-muted/20 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded border font-mono text-[10px] bg-white">↑↓</kbd>
              {L(locale, { ar: 'تنقل', en: 'navigate', ru: 'навигация', it: 'naviga' })}
            </span>
            <span className="inline-flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded border font-mono text-[10px] bg-white">↵</kbd>
              {L(locale, { ar: 'فتح', en: 'open', ru: 'открыть', it: 'apri' })}
            </span>
          </div>
          <div className="inline-flex items-center gap-1">
            <CmdIcon className="h-3 w-3" />K
            <span className="opacity-60">{L(locale, { ar: 'لإغلاق', en: 'to toggle', ru: 'переключить', it: 'apri/chiudi' })}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
