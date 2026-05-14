'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/routing';
import { Menu, X, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from './language-switcher';
import { cn } from '@/lib/utils';

export function Header({ brand }: { brand: string }) {
  const t = useTranslations('nav');
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const links: { href: '/' | '/trips' | '/about' | '/gallery' | '/blog' | '/contact'; label: string }[] = [
    { href: '/', label: t('home') },
    { href: '/trips', label: t('trips') },
    { href: '/about', label: t('about') },
    { href: '/gallery', label: t('gallery') },
    { href: '/blog', label: t('blog') },
    { href: '/contact', label: t('contact') },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white font-bold text-lg">
            L
          </div>
          <div>
            <div className="font-extrabold text-base leading-none text-foreground">{brand}</div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Tourism</div>
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
                  'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  active ? 'text-primary bg-primary/10' : 'text-foreground/80 hover:text-primary hover:bg-muted',
                )}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href="tel:+201090767278"
            className="hidden md:flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/80"
          >
            <Phone className="h-4 w-4" />
            <span dir="ltr">+20 109 076 7278</span>
          </a>
          <LanguageSwitcher />
          <Button asChild size="sm" className="hidden md:inline-flex">
            <Link href="/trips">{t('book')}</Link>
          </Button>
          <button
            onClick={() => setOpen(!open)}
            className="lg:hidden p-2 rounded-md hover:bg-muted"
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden border-t bg-white">
          <nav className="container flex flex-col py-3 gap-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="px-3 py-2 rounded-md text-sm font-medium hover:bg-muted"
              >
                {l.label}
              </Link>
            ))}
            <Button asChild size="sm" className="mt-2">
              <Link href="/trips" onClick={() => setOpen(false)}>
                {t('book')}
              </Link>
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}
