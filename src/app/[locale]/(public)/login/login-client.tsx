'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, ShieldCheck, Sparkles, BadgeCheck, Heart, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { L } from '@/lib/utils';
import { API_BASE } from '@/lib/api';
import { useCustomer } from '@/lib/customer-auth';
import { GoogleSignInButton } from '@/components/public/google-sign-in';

export function LoginClient({ locale }: { locale: string }) {
  const router = useRouter();
  const sp = useSearchParams();
  const { customer, refresh } = useCustomer();
  const [exchanging, setExchanging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If we land here with ?code=..., immediately exchange it for a session.
  useEffect(() => {
    const code = sp?.get('code');
    const err = sp?.get('error');
    const next = sp?.get('next') || `/${locale}/account`;
    if (err) {
      setError(err);
      return;
    }
    if (!code) return;

    setExchanging(true);
    (async () => {
      try {
        const r = await fetch(`${API_BASE}/auth/customer/google/exchange`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ code }),
        });
        const j = await r.json();
        if (!r.ok || !j.ok) throw new Error(j?.error?.message || 'Sign-in failed');
        await refresh();
        toast.success(L(locale, { ar: 'تم تسجيل الدخول', en: 'Signed in', de: 'Angemeldet', ru: 'Вход выполнен', it: 'Accesso effettuato' }) as string);
        router.replace(next);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Sign-in failed');
      } finally {
        setExchanging(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Already logged in → straight to dashboard
  useEffect(() => {
    if (customer) router.replace(`/${locale}/account`);
  }, [customer, locale, router]);

  const startGoogle = () => {
    const next = sp?.get('next') || `/${locale}/account`;
    window.location.href = `${API_BASE}/auth/customer/google?next=${encodeURIComponent(next)}`;
  };

  return (
    <main className="relative min-h-screen bg-gradient-to-b from-primary-900 via-primary to-primary-900 text-cream flex items-center justify-center py-16 px-4 overflow-hidden">
      <div aria-hidden className="absolute top-1/4 -end-32 w-[28rem] h-[28rem] rounded-full bg-accent/12 blur-3xl pointer-events-none animate-blob" />
      <div aria-hidden className="absolute -bottom-32 -start-20 w-[24rem] h-[24rem] rounded-full bg-accent/8 blur-3xl pointer-events-none animate-blob" style={{ animationDelay: '4s' }} />
      <span aria-hidden className="sparkle delay-1" style={{ top: '15%', insetInlineStart: '12%' }} />
      <span aria-hidden className="sparkle delay-3" style={{ top: '70%', insetInlineEnd: '15%' }} />

      <div className="relative w-full max-w-md">
        <div className="relative bg-cream/5 backdrop-blur-md border border-accent/30 rounded-3xl p-7 md:p-9 shadow-2xl shadow-primary-900/50 overflow-hidden">
          {/* Gold top ribbon */}
          <div aria-hidden className="absolute top-0 inset-x-0 h-0.5 gradient-gold" />

          <div className="text-center mb-7">
            <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-accent/25 to-accent/10 border border-accent/40 mb-4 backdrop-blur shadow-lg shadow-accent/20">
              <ShieldCheck className="h-8 w-8 text-accent" />
              <BadgeCheck aria-hidden className="absolute -bottom-1 -end-1 h-5 w-5 text-emerald-400 fill-primary-900 bg-primary-900 rounded-full" />
            </div>
            <h1 className="font-serif text-2xl md:text-3xl font-bold mb-2">
              {L(locale, { ar: 'تسجيل الدخول', en: 'Sign in', de: 'Anmelden', ru: 'Вход', it: 'Accedi' })}
            </h1>
            <span aria-hidden className="block w-10 h-0.5 gradient-gold rounded-full mx-auto mb-3" />
            <p className="text-sm text-cream/75 leading-relaxed max-w-xs mx-auto">
              {L(locale, {
                ar: 'سجّل دخولك بحساب جوجل لإدارة حجوزاتك ومفضلاتك ولترك تقييمات',
                en: 'Sign in with Google to manage your bookings, favourites & reviews', de: 'Melden Sie sich mit Google an, um Buchungen, Favoriten & Bewertungen zu verwalten',
                ru: 'Войдите через Google для управления бронированиями и отзывами',
                it: 'Accedi con Google per gestire prenotazioni, preferiti e recensioni',
              })}
            </p>
          </div>

          {exchanging ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-accent mx-auto mb-3" />
              <p className="text-sm text-cream/75">
                {L(locale, { ar: 'جاري تسجيل الدخول...', en: 'Signing you in...', de: 'Anmeldung läuft ...', ru: 'Входим...', it: 'Accesso in corso...' })}
              </p>
            </div>
          ) : error ? (
            <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-4 mb-4 text-sm">
              <p className="text-red-300 font-semibold mb-1">
                {L(locale, { ar: 'تعذر تسجيل الدخول', en: 'Sign-in failed', de: 'Anmeldung fehlgeschlagen', ru: 'Ошибка входа', it: 'Accesso fallito' })}
              </p>
              <p className="text-red-200/80 text-xs">{error}</p>
              <Button onClick={() => { setError(null); startGoogle(); }} variant="outline" className="mt-3 w-full">
                {L(locale, { ar: 'حاول مرة أخرى', en: 'Try again', de: 'Erneut versuchen', ru: 'Повторить', it: 'Riprova' })}
              </Button>
            </div>
          ) : (
            <GoogleSignInButton variant="primary" />
          )}

          {/* Benefits row */}
          <div className="mt-6 grid grid-cols-3 gap-2 text-center">
            {[
              { icon: BadgeCheck, ar: 'إدارة الحجوزات', en: 'Manage bookings', de: 'Buchungen verwalten', ru: 'Брони', it: 'Prenotazioni' },
              { icon: Heart, ar: 'حفظ مفضلاتك', en: 'Save favourites', de: 'Favoriten speichern', ru: 'Избранное', it: 'Preferiti' },
              { icon: MessageSquare, ar: 'تقييمات سريعة', en: 'Quick reviews', de: 'Schnelle Bewertungen', ru: 'Отзывы', it: 'Recensioni' },
            ].map((b) => (
              <div key={b.en} className="flex flex-col items-center gap-1 p-2 rounded-lg bg-cream/5 border border-cream/10">
                <b.icon className="h-3.5 w-3.5 text-accent" />
                <span className="text-[10px] text-cream/80 font-semibold leading-tight">
                  {L(locale, { ar: b.ar, en: b.en, ru: b.ru, it: b.it, de: b.de })}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-5 border-t border-cream/15 text-center text-[11px] text-cream/60 leading-relaxed">
            <p className="inline-flex items-center justify-center gap-1.5">
              <Sparkles className="h-3 w-3 text-accent" />
              {L(locale, {
                ar: 'لا حاجة لكلمة سر — حساب آمن عبر Google',
                en: 'No password needed — secure Google account', de: 'Kein Passwort nötig — sicheres Google-Konto',
                ru: 'Без пароля — через ваш Google',
                it: 'Niente password — tramite il tuo Google',
              })}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
