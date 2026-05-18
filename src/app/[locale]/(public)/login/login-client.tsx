'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, ShieldCheck, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { L } from '@/lib/utils';
import { API_BASE } from '@/lib/api';
import { useCustomer } from '@/lib/customer-auth';

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
        toast.success(L(locale, { ar: 'تم تسجيل الدخول', en: 'Signed in', ru: 'Вход выполнен', it: 'Accesso effettuato' }) as string);
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
    window.location.href = `${API_BASE}/auth/customer/google`;
  };

  return (
    <main className="relative min-h-screen bg-gradient-to-b from-primary-900 via-primary to-primary-900 text-cream flex items-center justify-center py-16 px-4 overflow-hidden">
      <div className="absolute top-1/4 -end-32 w-96 h-96 rounded-full bg-accent/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -start-20 w-80 h-80 rounded-full bg-accent/8 blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md">
        <div className="bg-cream/5 backdrop-blur-md border border-accent/30 rounded-3xl p-7 md:p-9 shadow-2xl shadow-primary-900/40">
          <div className="text-center mb-7">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent/15 border border-accent/40 mb-4">
              <ShieldCheck className="h-7 w-7 text-accent" />
            </div>
            <h1 className="font-serif text-2xl md:text-3xl font-bold mb-2">
              {L(locale, { ar: 'تسجيل الدخول', en: 'Sign in', ru: 'Вход', it: 'Accedi' })}
            </h1>
            <p className="text-sm text-cream/70 leading-relaxed">
              {L(locale, {
                ar: 'سجّل دخولك بحساب جوجل لإدارة حجوزاتك ومفضلاتك',
                en: 'Sign in with Google to manage your bookings and favourites',
                ru: 'Войдите через Google, чтобы управлять бронированиями',
                it: 'Accedi con Google per gestire le prenotazioni',
              })}
            </p>
          </div>

          {exchanging ? (
            <div className="text-center py-6">
              <Loader2 className="h-8 w-8 animate-spin text-accent mx-auto mb-3" />
              <p className="text-sm text-cream/75">
                {L(locale, { ar: 'جاري تسجيل الدخول...', en: 'Signing you in...', ru: 'Входим...', it: 'Accesso in corso...' })}
              </p>
            </div>
          ) : error ? (
            <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-4 mb-4 text-sm">
              <p className="text-red-300 font-semibold mb-1">
                {L(locale, { ar: 'تعذر تسجيل الدخول', en: 'Sign-in failed', ru: 'Ошибка входа', it: 'Accesso fallito' })}
              </p>
              <p className="text-red-200/80 text-xs">{error}</p>
              <Button onClick={() => { setError(null); startGoogle(); }} variant="outline" className="mt-3 w-full">
                {L(locale, { ar: 'حاول مرة أخرى', en: 'Try again', ru: 'Повторить', it: 'Riprova' })}
              </Button>
            </div>
          ) : (
            <button
              onClick={startGoogle}
              className="w-full inline-flex items-center justify-center gap-3 h-13 px-5 rounded-xl bg-white text-gray-800 font-semibold text-base shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
            >
              <GoogleIcon className="h-5 w-5" />
              <span>{L(locale, { ar: 'الدخول باستخدام Google', en: 'Continue with Google', ru: 'Войти через Google', it: 'Continua con Google' })}</span>
            </button>
          )}

          <div className="mt-6 pt-6 border-t border-cream/15 text-center text-xs text-cream/55 leading-relaxed">
            <p className="inline-flex items-center justify-center gap-1.5">
              <Sparkles className="h-3 w-3 text-accent" />
              {L(locale, {
                ar: 'لا حاجة لكلمة سر — حساب آمن عبر Google',
                en: 'No password needed — secure Google account',
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

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.07 5.07 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"/>
      <path fill="#FBBC04" d="M5.84 14.11A6.59 6.59 0 0 1 5.48 12c0-.73.13-1.44.36-2.11V7.05H2.18A11 11 0 0 0 1 12c0 1.77.42 3.45 1.18 4.95l3.66-2.84z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.65l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.05l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/>
    </svg>
  );
}
