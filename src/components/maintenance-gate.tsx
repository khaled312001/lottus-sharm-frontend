'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

const BYPASS_KEY = 'lottus_preview';
const BYPASS_VALUE = 'lotus2026';

/**
 * Maintenance gate — shows a "Coming Soon" screen unless the visitor has
 * the preview unlock cookie. Owner unlocks by visiting:
 *   https://lotussharm.com/?preview=lotus2026
 * which sets a persistent cookie. After that, the real site is visible.
 */
export function MaintenanceGate({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      const previewParam = url.searchParams.get('preview');
      if (previewParam === BYPASS_VALUE) {
        document.cookie = `${BYPASS_KEY}=${BYPASS_VALUE}; path=/; max-age=${60 * 60 * 24 * 30}; samesite=lax`;
        // strip the query and replace the URL
        url.searchParams.delete('preview');
        window.history.replaceState({}, '', url.toString());
        setUnlocked(true);
      } else {
        const m = document.cookie.match(new RegExp(`${BYPASS_KEY}=([^;]+)`));
        setUnlocked(m?.[1] === BYPASS_VALUE);
      }
    } catch { /* ignore */ }
    setReady(true);
  }, []);

  if (!ready) return null;
  if (unlocked) return <>{children}</>;
  return <ComingSoon />;
}

function ComingSoon() {
  return (
    <div dir="rtl" lang="ar" className="min-h-screen bg-primary-900 text-cream relative overflow-hidden flex items-center justify-center p-6">
      {/* decorative blobs */}
      <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-accent/15 blur-3xl animate-pulse" />
      <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full bg-accent/10 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <Image src="/hero-slides/hero-04.jpg" alt="" fill className="object-cover" sizes="100vw" priority />
      </div>

      <div className="relative max-w-2xl w-full text-center">
        <div className="inline-block mb-8">
          <Image src="/logo.jpg" alt="Lotus Sharm" width={120} height={120} className="rounded-2xl ring-2 ring-accent/40 shadow-2xl shadow-accent/20" priority />
        </div>

        <div className="inline-block px-4 py-1.5 rounded-full bg-accent/20 border border-accent/40 text-accent text-xs font-bold uppercase tracking-[0.3em] mb-6">
          Coming soon · قريباً
        </div>

        <h1 className="font-serif text-4xl md:text-6xl font-bold mb-4 leading-tight">
          الموقع تحت الإنشاء
        </h1>
        <p className="text-lg md:text-xl text-cream/85 mb-2">Our luxury tourism platform is launching soon</p>
        <p className="text-base text-cream/70 mb-10 leading-relaxed">
          نعمل على وضع اللمسات الأخيرة على موقع لوتس شرم —<br />
          ترقبوا تجربة سياحية فاخرة قريباً جداً.
        </p>

        {/* Contact strip */}
        <div className="grid sm:grid-cols-2 gap-3 max-w-md mx-auto mb-10">
          <a href="https://wa.me/201090767278" target="_blank" rel="noopener" className="inline-flex items-center justify-center gap-2 bg-[#25D366] text-white font-bold py-3.5 rounded-xl shadow-lg shadow-[#25D366]/30 hover:scale-105 transition-transform">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            تواصل واتساب
          </a>
          <a href="tel:+201090767278" className="inline-flex items-center justify-center gap-2 bg-accent text-primary font-bold py-3.5 rounded-xl shadow-lg shadow-accent/30 hover:scale-105 transition-transform" dir="ltr">
            +20 109 076 7278
          </a>
        </div>

        <div className="border-t border-accent/20 pt-6 text-xs text-cream/50">
          © 2026 Lotus Sharm Tourism · شركة لوتتس شرم للاستثمار والتسويق السياحي
        </div>
      </div>
    </div>
  );
}
