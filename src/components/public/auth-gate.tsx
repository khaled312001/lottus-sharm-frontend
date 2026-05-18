'use client';

import { useLocale } from 'next-intl';
import { Lock, Sparkles } from 'lucide-react';
import { L } from '@/lib/utils';
import { useCustomer } from '@/lib/customer-auth';
import { GoogleSignInButton } from './google-sign-in';

/**
 * Wraps content that requires the visitor to be signed in.
 * Renders the children when logged in, otherwise shows a friendly
 * "Sign in to continue" panel with a Google CTA.
 *
 * Usage:
 *   <AuthGate
 *     title="اكتب تقييم..."
 *     reason="reviews"
 *   >
 *     <YourForm />
 *   </AuthGate>
 */
export function AuthGate({
  children,
  title,
  reason,
}: {
  children: React.ReactNode;
  title?: string;
  reason?: 'reviews' | 'comments' | 'booking';
}) {
  const locale = useLocale();
  const { customer, loading } = useCustomer();

  if (loading) {
    return (
      <div className="bg-white border border-accent/15 rounded-2xl p-5 md:p-6">
        <div className="h-10 bg-muted/40 rounded-lg animate-pulse" />
        <div className="h-24 bg-muted/40 rounded-lg animate-pulse mt-3" />
      </div>
    );
  }

  if (customer) return <>{children}</>;

  const headline = title || (reason === 'reviews'
    ? (L(locale, { ar: 'سجّل دخولك لتترك تقييماً', en: 'Sign in to leave a review', ru: 'Войдите, чтобы оставить отзыв', it: 'Accedi per lasciare una recensione' }) as string)
    : reason === 'comments'
    ? (L(locale, { ar: 'سجّل دخولك لكتابة تعليق', en: 'Sign in to post a comment', ru: 'Войдите, чтобы оставить комментарий', it: 'Accedi per commentare' }) as string)
    : (L(locale, { ar: 'سجّل دخولك للمتابعة', en: 'Sign in to continue', ru: 'Войдите, чтобы продолжить', it: 'Accedi per continuare' }) as string));

  return (
    <div className="relative bg-gradient-to-br from-primary via-primary to-primary-900 text-cream rounded-2xl border border-accent/25 shadow-xl overflow-hidden">
      {/* Decorative glow */}
      <div aria-hidden className="absolute -top-20 -end-20 w-56 h-56 rounded-full bg-accent/20 blur-3xl" />
      <div aria-hidden className="absolute -bottom-20 -start-20 w-56 h-56 rounded-full bg-accent/10 blur-3xl" />
      <div aria-hidden className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent" />

      <div className="relative p-6 md:p-8 text-center">
        {/* Icon */}
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent/15 border border-accent/40 mb-4 backdrop-blur">
          <Lock className="h-6 w-6 text-accent" />
        </div>

        <h3 className="font-serif text-xl md:text-2xl font-bold mb-2 text-balance">{headline}</h3>

        <p className="text-sm text-cream/75 mb-5 max-w-md mx-auto leading-relaxed">
          {L(locale, {
            ar: 'اسمك وبريدك سيُجلبا تلقائياً من حسابك — لا داعي لإدخالهما يدوياً',
            en: 'Your name & email are pulled from your account — no need to fill them in',
            ru: 'Ваше имя и email подтянутся из аккаунта — заполнять не нужно',
            it: 'Nome ed email vengono presi dal tuo account — niente compilazione',
          })}
        </p>

        <div className="max-w-sm mx-auto">
          <GoogleSignInButton variant="primary" />
        </div>

        <div className="mt-5 inline-flex items-center gap-1.5 text-[11px] text-cream/55">
          <Sparkles className="h-3 w-3 text-accent" />
          {L(locale, {
            ar: 'دخول آمن بحساب جوجل — لا حاجة لكلمة سر',
            en: 'Secure Google sign-in — no password needed',
            ru: 'Безопасный вход через Google — без пароля',
            it: 'Accesso sicuro Google — niente password',
          })}
        </div>
      </div>
    </div>
  );
}
