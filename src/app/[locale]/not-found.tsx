import type { Metadata } from 'next';
import { Link } from '@/i18n/routing';
import { Compass, ArrowRight, Home, Map, MessageCircle, Search } from 'lucide-react';
import { L } from '@/lib/utils';

export const metadata: Metadata = {
  title: '404 — Lotus Sharm Tourism',
  description: 'Page not found',
  robots: { index: false, follow: false },
};

export default function NotFound() {
  // Locale isn't easily accessible in a not-found.tsx route handler.
  // We default to Arabic (the contract's primary locale) but provide all 4 in the strings via L() pattern with a fixed value.
  const locale = 'ar';

  return (
    <main className="min-h-[80vh] relative bg-gradient-to-br from-primary-900 via-primary to-primary-900 text-cream py-20 md:py-28 overflow-hidden flex items-center">
      <div aria-hidden className="absolute -top-32 -end-32 w-96 h-96 rounded-full bg-accent/15 blur-3xl pointer-events-none" />
      <div aria-hidden className="absolute -bottom-32 -start-20 w-80 h-80 rounded-full bg-accent/10 blur-3xl pointer-events-none" />
      <span aria-hidden className="sparkle delay-1" style={{ top: '18%', insetInlineStart: '12%' }} />
      <span aria-hidden className="sparkle delay-3" style={{ top: '72%', insetInlineEnd: '10%' }} />

      <div className="container relative text-center max-w-2xl mx-auto">
        {/* Giant 404 */}
        <div className="relative inline-flex items-center justify-center mb-6">
          <span aria-hidden className="font-serif text-[140px] md:text-[200px] font-black leading-none bg-gradient-to-br from-accent via-accent-400 to-accent-deep bg-clip-text text-transparent drop-shadow-lg">
            404
          </span>
          <span aria-hidden className="absolute inset-0 flex items-center justify-center">
            <Compass className="h-20 w-20 md:h-28 md:w-28 text-accent/20 animate-spin-slow" />
          </span>
        </div>

        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cream/10 backdrop-blur border border-accent/40 text-accent text-[11px] font-bold uppercase tracking-[0.25em] mb-4">
          <Map className="h-3.5 w-3.5" />
          {L(locale, { ar: 'ضلّيت طريقك؟', en: 'Lost your way?', ru: 'Заблудились?', it: 'Ti sei perso?' })}
        </span>

        <h1 className="font-serif text-3xl md:text-5xl font-bold mb-4 leading-tight text-balance">
          {L(locale, {
            ar: 'الصفحة دي مش موجودة',
            en: "This page doesn't exist",
            ru: 'Страница не найдена',
            it: 'Pagina non trovata',
          })}
        </h1>
        <div className="w-16 h-0.5 gradient-gold rounded-full mx-auto mb-5" />
        <p className="text-sm md:text-base opacity-85 max-w-md mx-auto leading-relaxed mb-8">
          {L(locale, {
            ar: 'بس لسه فيه رحلات كتير في انتظارك! تعالى نوصلك للمكان الصح.',
            en: 'But plenty of trips are still waiting for you — let us guide you back.',
            ru: 'Но много туров ждёт вас — давайте вернёмся на правильный путь.',
            it: 'Ma molti tour ti aspettano — ti riportiamo sulla strada giusta.',
          })}
        </p>

        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/" className="group inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-accent text-primary font-bold text-sm shadow-2xl shadow-accent/30 hover:bg-accent-400 hover:-translate-y-0.5 transition-all">
            <Home className="h-4 w-4" />
            {L(locale, { ar: 'الرئيسية', en: 'Home', ru: 'Главная', it: 'Home' })}
            <ArrowRight className="h-4 w-4 rtl:rotate-180 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-transform" />
          </Link>
          <Link href="/trips" className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-cream/10 hover:bg-cream/20 backdrop-blur border border-cream/25 text-cream font-bold text-sm transition-colors">
            <Search className="h-4 w-4" />
            {L(locale, { ar: 'تصفح الرحلات', en: 'Browse trips', ru: 'Туры', it: 'Tour' })}
          </Link>
          <a href="https://wa.me/201090767278" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#25D366] hover:bg-[#1ea954] text-white font-bold text-sm transition-colors">
            <MessageCircle className="h-4 w-4" />
            {L(locale, { ar: 'واتساب', en: 'WhatsApp', ru: 'WhatsApp', it: 'WhatsApp' })}
          </a>
        </div>

        {/* Helpful links */}
        <div className="mt-10 pt-6 border-t border-cream/10 max-w-md mx-auto">
          <p className="text-[11px] uppercase tracking-[0.25em] text-cream/55 font-bold mb-3">
            {L(locale, { ar: 'روابط مفيدة', en: 'Helpful links', ru: 'Полезные ссылки', it: 'Link utili' })}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs">
            <Link href="/hotels" className="text-cream/75 hover:text-accent transition-colors">
              {L(locale, { ar: 'الفنادق', en: 'Hotels', ru: 'Отели', it: 'Hotel' })}
            </Link>
            <span className="w-px h-3 bg-cream/20" />
            <Link href="/transfers" className="text-cream/75 hover:text-accent transition-colors">
              {L(locale, { ar: 'النقل', en: 'Transfers', ru: 'Трансферы', it: 'Trasferimenti' })}
            </Link>
            <span className="w-px h-3 bg-cream/20" />
            <Link href="/blog" className="text-cream/75 hover:text-accent transition-colors">
              {L(locale, { ar: 'المدونة', en: 'Blog', ru: 'Блог', it: 'Blog' })}
            </Link>
            <span className="w-px h-3 bg-cream/20" />
            <Link href="/contact" className="text-cream/75 hover:text-accent transition-colors">
              {L(locale, { ar: 'تواصل', en: 'Contact', ru: 'Контакты', it: 'Contatti' })}
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
