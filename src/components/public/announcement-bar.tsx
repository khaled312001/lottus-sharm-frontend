'use client';

import { Phone, Mail, Facebook, Instagram, Youtube } from 'lucide-react';
import { useLocale } from 'next-intl';
import { LanguageSwitcher } from './language-switcher';

export function AnnouncementBar() {
  const locale = useLocale();
  return (
    <div className="hidden md:block bg-primary-900 text-cream/85 text-xs border-b border-accent/15">
      <div className="container h-9 flex items-center justify-between gap-4">
        <div className="flex items-center gap-5">
          <a href="tel:+201090767278" className="inline-flex items-center gap-1.5 hover:text-accent transition-colors">
            <Phone className="h-3 w-3 text-accent" />
            <span dir="ltr">+20 109 076 7278</span>
          </a>
          <a href="mailto:info@lotussharm.com" className="hidden lg:inline-flex items-center gap-1.5 hover:text-accent transition-colors">
            <Mail className="h-3 w-3 text-accent" />
            <span>info@lotussharm.com</span>
          </a>
          <span className="hidden lg:inline opacity-50">|</span>
          <span className="hidden lg:inline text-accent font-medium">
            {locale === 'ar' ? '✦ سياحة فاخرة منذ 2013' : '✦ Luxury tourism since 2013'}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 opacity-80">
            <a href="https://www.facebook.com/share/1DMY8SUNTT" target="_blank" rel="noopener" aria-label="Facebook" className="hover:text-accent transition-colors">
              <Facebook className="h-3.5 w-3.5" />
            </a>
            <a href="https://www.instagram.com/lotus_sharm" target="_blank" rel="noopener" aria-label="Instagram" className="hover:text-accent transition-colors">
              <Instagram className="h-3.5 w-3.5" />
            </a>
            <a href="https://youtube.com/@lotussharm" target="_blank" rel="noopener" aria-label="YouTube" className="hover:text-accent transition-colors">
              <Youtube className="h-3.5 w-3.5" />
            </a>
          </div>
          <span className="opacity-30">|</span>
          <LanguageSwitcher transparent compact />
        </div>
      </div>
    </div>
  );
}
