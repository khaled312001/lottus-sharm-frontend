'use client';

import { useState, useTransition } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { localeToApiCode } from '@/lib/utils';
import { Check } from 'lucide-react';

export function NewsletterForm() {
  const t = useTranslations('footer');
  const locale = useLocale();
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);
  const [pending, start] = useTransition();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    start(async () => {
      try {
        await api.post('/public/newsletter/subscribe', { email, locale: localeToApiCode(locale) });
        setDone(true);
      } catch {
        /* silent fail */
      }
    });
  };

  if (done) {
    return (
      <div className="flex items-center gap-2 text-sm bg-white/10 rounded-lg p-3">
        <Check className="h-4 w-4 text-accent" /> <span>{t('subscribe')} ✓</span>
      </div>
    );
  }
  return (
    <form onSubmit={onSubmit} className="flex gap-2">
      <Input
        type="email"
        required
        placeholder={t('yourEmail')}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
      />
      <Button type="submit" variant="accent" disabled={pending} size="sm">
        {t('subscribe')}
      </Button>
    </form>
  );
}
