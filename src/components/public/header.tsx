'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { Link, usePathname } from '@/i18n/routing';
import {
  Menu, X, Phone, MessageCircle, Home, Map, Info, Image as ImageIcon, BookOpen, Mail, Sparkles,
  Facebook, Instagram, Youtube, ChevronLeft,
  BedDouble, Car,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from './language-switcher';
import { CurrencySwitcher } from './currency-switcher';
import { AccountPill } from './account-pill';
import { SearchBar } from './search-bar';
import { Logo } from './logo';
import { cn, buildWhatsAppLink } from '@/lib/utils';

// Brand TikTok glyph (lucide has no TikTok icon). Accepts className like a lucide icon.
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
  );
}

const SOCIALS = [
  { href: 'https://www.facebook.com/share/1DMY8SUNTT/?mibextid=wwXIfr', Icon: Facebook, label: 'Facebook',  bg: 'bg-[#1877F2]/15 text-[#4d97ff]' },
  { href: 'https://www.instagram.com/lotus_sharm',                       Icon: Instagram, label: 'Instagram', bg: 'bg-[#E4405F]/15 text-[#ff6480]' },
  { href: 'https://www.tiktok.com/@lotus_sharm',                          Icon: TikTokIcon, label: 'TikTok',  bg: 'bg-[#000000]/30 text-cream' },
  { href: 'https://youtube.com/@lotussharm',                              Icon: Youtube, label: 'YouTube',  bg: 'bg-[#FF0000]/15 text-[#ff6b6b]' },
];

export function Header() {
  const t = useTranslations('nav');
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === '/';
  const params = useParams<{ locale: string }>();
  const locale = (params?.locale as string) || 'ar';
  const isAr = locale === 'ar';
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Body scroll lock when drawer is open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  // Close drawer on route change
  useEffect(() => { setOpen(false); }, [pathname]);

  // Transparent only on Home AND not scrolled AND menu closed
  const transparent = isHome && !scrolled && !open;

  type LinkHref = '/' | '/trips' | '/hotels' | '/transfers' | '/about' | '/gallery' | '/blog' | '/contact';
  const links: { href: LinkHref; label: string; icon: typeof Home }[] = [
    { href: '/',          label: t('home'),    icon: Home },
    { href: '/trips',     label: t('trips'),   icon: Map },
    { href: '/hotels',    label: isAr ? 'الفنادق' : 'Hotels',     icon: BedDouble },
    { href: '/transfers', label: isAr ? 'النقل'   : 'Transfers',  icon: Car },
    { href: '/about',     label: t('about'),   icon: Info },
    { href: '/gallery',   label: t('gallery'), icon: ImageIcon },
    { href: '/blog',      label: t('blog'),    icon: BookOpen },
    { href: '/contact',   label: t('contact'), icon: Mail },
  ];

  return (
    <motion.header
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={cn(
        'fixed top-9 inset-x-0 z-50 transition-all duration-500',
        transparent
          ? 'bg-transparent border-b border-transparent'
          : 'bg-primary-900/95 backdrop-blur-md border-b border-accent/15 shadow-[0_4px_30px_-12px_rgba(10,40,40,0.4)]',
      )}
    >
      {/* Announcement bar (desktop only, hidden on home when transparent for cleanliness) */}
      <div
        className={cn(
          'hidden md:block bg-primary-950 text-cream/85 text-xs border-b border-accent/20 transition-all',
          transparent ? 'h-0 opacity-0 overflow-hidden' : 'h-9 opacity-100',
        )}
      >
        <div className="container h-full flex items-center justify-between gap-4">
          <div className="flex items-center gap-5">
            <a href="tel:+201090767278" className="inline-flex items-center gap-1.5 hover:text-accent transition-colors">
              <Phone className="h-3 w-3 text-accent" />
              <span dir="ltr">+20 109 076 7278</span>
            </a>
            <span className="hidden lg:inline opacity-50">|</span>
            <span className="hidden lg:inline text-accent font-medium">
              {t('tagline')}
            </span>
          </div>
          <a
            href="https://wa.me/201090767278"
            target="_blank"
            rel="noopener"
            className="inline-flex items-center gap-1.5 text-[#25D366] hover:text-[#3df17a] transition-colors"
          >
            <MessageCircle className="h-3 w-3" />
            <span>WhatsApp</span>
          </a>
        </div>
      </div>

      {/* Main nav */}
      <div className="container flex h-16 md:h-20 items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-3 group">
          <Logo size={48} />
          <div className="hidden sm:block leading-none">
            <div className={cn('font-serif text-base md:text-lg font-bold tracking-wide transition-colors', transparent ? 'text-cream' : 'text-cream')}>
              LOTUS SHARM
            </div>
            <div className={cn('text-[10px] tracking-[0.3em] font-light mt-0.5 transition-colors', transparent ? 'text-cream/80' : 'text-accent')}>
              TRAVEL
            </div>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {links.map((l) => {
            const active = pathname === l.href || (l.href !== '/' && pathname.startsWith(l.href));
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  'relative px-3 xl:px-4 py-2 text-sm font-semibold transition-colors',
                  transparent ? 'text-cream/90 hover:text-accent' : 'text-cream/80 hover:text-accent',
                  active && 'text-accent',
                )}
              >
                {l.label}
                {active && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute left-3 right-3 -bottom-0.5 h-0.5 bg-accent rounded-full"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          {/* Search bar — visible on lg+, drawer renders own copy */}
          <div className="hidden lg:block">
            <SearchBar variant="header" />
          </div>
          <CurrencySwitcher />
          <LanguageSwitcher transparent={transparent} compact />
          <AccountPill />
          <Button
            asChild
            size="sm"
            className="hidden md:inline-flex bg-accent text-primary hover:bg-accent-400 font-bold shadow-lg shadow-accent/20"
          >
            <Link href="/trips">{t('book')}</Link>
          </Button>
          <button
            onClick={() => setOpen(!open)}
            className={cn(
              'lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg transition-all',
              open
                ? 'bg-accent text-primary shadow-lg shadow-accent/25'
                : 'bg-cream/10 hover:bg-cream/15 text-cream border border-cream/15',
            )}
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mounted && createPortal(
        <AnimatePresence>
        {open && (
          <div className="lg:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-md z-[60]"
              aria-hidden="true"
            />

            {/* Side drawer — slides from the start side (right in RTL, left in LTR) */}
            <motion.aside
              initial={{ x: (isAr ? '100%' : '-100%') }}
              animate={{ x: 0 }}
              exit={{ x: (isAr ? '100%' : '-100%') }}
              transition={{ type: 'tween', ease: [0.32, 0.72, 0, 1], duration: 0.35 }}
              className={cn(
                'fixed top-0 bottom-0 z-[70] w-[88vw] max-w-[360px] flex flex-col bg-gradient-to-b from-primary-900 via-primary-900 to-primary-950 shadow-2xl',
                isAr ? 'end-0 border-s border-accent/25' : 'start-0 border-e border-accent/25',
              )}
              role="dialog"
              aria-modal="true"
            >
              {/* Decorative gold glow */}
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-accent to-transparent" />
              <div className="pointer-events-none absolute -top-24 -end-24 w-72 h-72 rounded-full bg-accent/15 blur-3xl" />

              {/* Drawer header */}
              <div className="relative flex items-center justify-between gap-3 px-5 py-4 border-b border-accent/15">
                <Link href="/" onClick={() => setOpen(false)} className="flex items-center gap-2.5 min-w-0">
                  <Logo size={40} />
                  <div className="leading-tight">
                    <div className="font-serif font-bold text-cream text-sm">LOTUS SHARM</div>
                    <div className="text-[9px] tracking-[0.3em] text-accent font-light mt-0.5">TRAVEL</div>
                  </div>
                </Link>
                <button
                  onClick={() => setOpen(false)}
                  className="w-10 h-10 rounded-full bg-cream/10 hover:bg-accent hover:text-primary text-cream flex items-center justify-center transition-colors"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Scroll area */}
              <div className="relative flex-1 overflow-y-auto overscroll-contain px-4 py-4 space-y-5">
                {/* Search */}
                <div>
                  <SearchBar variant="drawer" />
                </div>

                {/* Section label */}
                <div className="space-y-1">
                  <div className="text-[10px] uppercase tracking-[0.3em] text-accent/70 font-bold px-2 mb-1.5">
                    {t('drawerMenu')}
                  </div>

                  {links.map((l, i) => {
                    const active = pathname === l.href || (l.href !== '/' && pathname.startsWith(l.href));
                    const Icon = l.icon;
                    return (
                      <motion.div
                        key={l.href}
                        initial={{ opacity: 0, x: isAr ? 24 : -24 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05 + i * 0.04, ease: 'easeOut' }}
                      >
                        <Link
                          href={l.href}
                          onClick={() => setOpen(false)}
                          className={cn(
                            'flex items-center gap-3 px-3 py-3 rounded-xl text-[15px] font-bold transition-all',
                            active
                              ? 'bg-accent text-primary shadow-lg shadow-accent/30'
                              : 'text-cream hover:bg-cream/10 active:bg-cream/15',
                          )}
                        >
                          <span className={cn(
                            'flex items-center justify-center w-10 h-10 rounded-xl transition-colors flex-shrink-0',
                            active ? 'bg-primary/10 text-primary' : 'bg-accent/15 text-accent',
                          )}>
                            <Icon className="h-[18px] w-[18px]" />
                          </span>
                          <span className="flex-1 text-start">{l.label}</span>
                          <ChevronLeft className={cn(
                            'h-4 w-4 transition-opacity',
                            isAr ? '' : 'rotate-180',
                            active ? 'opacity-90 text-primary' : 'opacity-40 text-cream',
                          )} />
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Quick contact */}
                <div className="space-y-2">
                  <div className="text-[10px] uppercase tracking-[0.3em] text-accent/70 font-bold px-2 mb-1.5">
                    {t('drawerContact')}
                  </div>

                  <a
                    href="tel:+201090767278"
                    className="flex items-center gap-3 px-3 py-3 rounded-xl bg-cream/5 hover:bg-cream/10 active:bg-cream/15 transition-colors"
                  >
                    <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-accent/15 text-accent flex-shrink-0">
                      <Phone className="h-[18px] w-[18px]" />
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-[11px] text-cream/60 leading-none mb-0.5">{t('drawerCall')}</span>
                      <span dir="ltr" className="block text-cream font-bold text-sm tabular-nums">+20 109 076 7278</span>
                    </span>
                  </a>

                  <a
                    href={buildWhatsAppLink('201090767278', t('drawerWhatsAppPrefill'))}
                    target="_blank"
                    rel="noopener"
                    className="flex items-center gap-3 px-3 py-3 rounded-xl bg-[#25D366]/12 hover:bg-[#25D366]/20 transition-colors"
                  >
                    <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#25D366]/25 text-[#25D366] flex-shrink-0">
                      <MessageCircle className="h-[18px] w-[18px]" />
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-[11px] text-[#25D366]/80 leading-none mb-0.5 font-semibold">{t('drawerWhatsApp')}</span>
                      <span className="block text-cream font-bold text-sm">{t('drawerWhatsAppCta')}</span>
                    </span>
                  </a>

                  <a
                    href="mailto:info@lotussharm.com"
                    className="flex items-center gap-3 px-3 py-3 rounded-xl bg-cream/5 hover:bg-cream/10 transition-colors"
                  >
                    <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-accent/15 text-accent flex-shrink-0">
                      <Mail className="h-[18px] w-[18px]" />
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-[11px] text-cream/60 leading-none mb-0.5">{t('drawerEmail')}</span>
                      <span dir="ltr" className="block text-cream font-bold text-sm">info@lotussharm.com</span>
                    </span>
                  </a>
                </div>

                {/* Socials */}
                <div className="space-y-2">
                  <div className="text-[10px] uppercase tracking-[0.3em] text-accent/70 font-bold px-2 mb-1.5">
                    {t('drawerFollow')}
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {SOCIALS.map(({ href, Icon, label, bg }) => (
                      <a
                        key={label}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={label}
                        className={cn('flex items-center justify-center h-12 rounded-xl transition-transform hover:-translate-y-0.5', bg)}
                      >
                        <Icon className="h-5 w-5" />
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sticky footer CTA */}
              <div className="relative border-t border-accent/15 bg-primary-950/80 backdrop-blur-sm p-4">
                <Button
                  asChild
                  size="lg"
                  className="w-full bg-accent hover:bg-accent-400 text-primary font-extrabold shadow-lg shadow-accent/30 h-12 text-[15px]"
                >
                  <Link href="/trips" onClick={() => setOpen(false)}>
                    <Sparkles className="h-4 w-4 me-1" />
                    {t('book')}
                  </Link>
                </Button>
                <p className="text-center text-[11px] text-cream/50 mt-2.5">
                  {t('copyrightShort')}
                </p>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>,
        document.body,
      )}
    </motion.header>
  );
}
