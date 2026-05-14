import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Facebook, Instagram, Youtube, Phone, Mail, MapPin } from 'lucide-react';
import { NewsletterForm } from './newsletter-form';
import type { SiteSettingsDTO } from '@/types/api';

export function Footer({ settings, brand }: { settings: SiteSettingsDTO; brand: string }) {
  const t = useTranslations();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-br from-primary-900 to-primary-700 text-white mt-16">
      <div className="container py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-white font-bold text-lg">
              L
            </div>
            <div className="font-extrabold text-lg">{brand}</div>
          </div>
          <p className="text-sm opacity-90 leading-relaxed">{settings.taglineAr}</p>
        </div>

        <div>
          <h3 className="font-bold text-lg mb-4">{t('footer.quickLinks')}</h3>
          <ul className="space-y-2 text-sm">
            <li><Link href="/" className="hover:text-accent transition-colors">{t('nav.home')}</Link></li>
            <li><Link href="/trips" className="hover:text-accent transition-colors">{t('nav.trips')}</Link></li>
            <li><Link href="/about" className="hover:text-accent transition-colors">{t('nav.about')}</Link></li>
            <li><Link href="/gallery" className="hover:text-accent transition-colors">{t('nav.gallery')}</Link></li>
            <li><Link href="/blog" className="hover:text-accent transition-colors">{t('nav.blog')}</Link></li>
            <li><Link href="/contact" className="hover:text-accent transition-colors">{t('nav.contact')}</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-bold text-lg mb-4">{t('footer.contactInfo')}</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 flex-shrink-0" />
              <a href={`tel:+${settings.whatsapp}`} dir="ltr">+{settings.whatsapp.replace(/(\d{2})(\d{3})(\d{3})(\d{4})/, '$1 $2 $3 $4')}</a>
            </li>
            {settings.email && (
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <a href={`mailto:${settings.email}`}>{settings.email}</a>
              </li>
            )}
            <li className="flex items-start gap-2">
              <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>Sharm El Sheikh, Egypt</span>
            </li>
          </ul>
          <div className="flex gap-3 mt-4">
            {settings.facebookUrl && (
              <a href={settings.facebookUrl} target="_blank" rel="noopener" aria-label="Facebook" className="p-2 bg-white/10 hover:bg-accent rounded-lg transition-colors">
                <Facebook className="h-4 w-4" />
              </a>
            )}
            {settings.instagramUrl && (
              <a href={settings.instagramUrl} target="_blank" rel="noopener" aria-label="Instagram" className="p-2 bg-white/10 hover:bg-accent rounded-lg transition-colors">
                <Instagram className="h-4 w-4" />
              </a>
            )}
            {settings.youtubeUrl && (
              <a href={settings.youtubeUrl} target="_blank" rel="noopener" aria-label="YouTube" className="p-2 bg-white/10 hover:bg-accent rounded-lg transition-colors">
                <Youtube className="h-4 w-4" />
              </a>
            )}
            {settings.tiktokUrl && (
              <a href={settings.tiktokUrl} target="_blank" rel="noopener" aria-label="TikTok" className="p-2 bg-white/10 hover:bg-accent rounded-lg transition-colors">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>
              </a>
            )}
          </div>
        </div>

        <div>
          <h3 className="font-bold text-lg mb-4">{t('footer.newsletter')}</h3>
          <p className="text-sm opacity-90 mb-3">{t('footer.newsletterDesc')}</p>
          <NewsletterForm />
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs opacity-80">
          <p>© {year} {brand}. {t('footer.rights')}.</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-accent">Privacy</Link>
            <Link href="/terms" className="hover:text-accent">Terms</Link>
            <span>Powered by <a href="https://barmagly.tech" target="_blank" rel="noopener" className="font-semibold hover:text-accent">Barmagly</a></span>
          </div>
        </div>
      </div>
    </footer>
  );
}
