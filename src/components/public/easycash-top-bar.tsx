import { L } from '@/lib/utils';

/**
 * Continuous-scroll top bar advertising the EasyCash («قسط رحلتك») instalment
 * service. Sits at the very top of the public layout so it's visible even
 * while the user is still on the hero. Pure CSS marquee — animation defined
 * in globals.css (`.ec-marquee-track`).
 */
export function EasyCashTopBar({ locale }: { locale: string }) {
  const text = L(locale, {
    ar: 'قسط رحلتك — أقساط ميسرة مع EasyCash على كل رحلات شرم الشيخ',
    en: 'Pay your trip in instalments — easy with EasyCash on all Sharm El Sheikh tours',
    de: 'Zahlen Sie Ihre Reise in Raten — einfach mit EasyCash auf allen Sharm-El-Sheikh-Touren',
    ru: 'Оплачивайте поездку в рассрочку — просто с EasyCash на все экскурсии в Шарм-эль-Шейхе',
    it: 'Paga il tuo viaggio a rate — facile con EasyCash su tutti i tour a Sharm El Sheikh',
  });
  const cta = L(locale, {
    ar: 'احجز الآن وقسّط',
    en: 'Book now & pay later',
    de: 'Jetzt buchen, später zahlen',
    ru: 'Бронируйте сейчас, платите позже',
    it: 'Prenota ora, paga dopo',
  });

  const Item = ({ k }: { k: string }) => (
    <span key={k} className="inline-flex items-center gap-3 px-5 text-cream/95 text-[12.5px] md:text-[13px] font-semibold">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo-easycash.png"
        alt="EasyCash"
        className="h-5 w-auto object-contain bg-cream rounded-sm px-1 py-0.5"
        loading="eager"
        decoding="async"
      />
      <span className="tracking-wide">{text}</span>
      <span className="inline-flex items-center gap-1 text-accent font-bold">
        <span aria-hidden className="opacity-60">•</span>
        {cta}
        <span aria-hidden className="opacity-60">•</span>
      </span>
    </span>
  );

  // Render the content twice — the CSS animation translates -50% so the second
  // copy lines up exactly where the first started, giving a seamless loop.
  const copy = Array.from({ length: 4 }).map((_, i) => <Item key={`a${i}`} k={`a${i}`} />);
  const copy2 = Array.from({ length: 4 }).map((_, i) => <Item key={`b${i}`} k={`b${i}`} />);

  // Fixed at the very top, above the (also-fixed) Header (z-50). Height is
  // pinned to 36px (h-9); the Header has been shifted to `top-9` to match,
  // so both stay visible together even while the hero is on screen.
  return (
    <div
      className="fixed top-0 inset-x-0 z-[60] h-9 bg-gradient-to-r from-primary-900 via-primary-800 to-primary-900 border-b border-accent/30 overflow-x-clip flex items-center"
      dir="ltr"
      role="region"
      aria-label="EasyCash instalments"
    >
      <div className="ec-marquee-track flex items-center whitespace-nowrap w-max">
        {copy}{copy2}
      </div>
    </div>
  );
}
