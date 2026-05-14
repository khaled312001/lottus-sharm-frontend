'use client';

import { useState, useTransition } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Input, Textarea } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { api } from '@/lib/api';
import { localeToApiCode } from '@/lib/utils';
import { toast } from 'sonner';
import { CheckCircle2 } from 'lucide-react';

export function ContactForm() {
  const t = useTranslations('contact');
  const locale = useLocale();
  const [pending, start] = useTransition();
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    start(async () => {
      try {
        await api.post('/public/contact', { ...form, locale: localeToApiCode(locale) });
        setDone(true);
        toast.success(t('sent'));
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Error');
      }
    });
  };

  if (done) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <CheckCircle2 className="h-16 w-16 mx-auto text-green-600 mb-4" />
          <h3 className="text-xl font-bold mb-2">{t('sent')}</h3>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold mb-1.5">{t('yourName')} *</label>
              <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5">{t('yourEmail')} *</label>
              <Input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold mb-1.5">{t('yourPhone')}</label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5">{t('subject')}</label>
              <Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1.5">{t('message')} *</label>
            <Textarea required rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
          </div>
          <Button type="submit" disabled={pending} className="w-full" size="lg">{t('send')}</Button>
        </form>
      </CardContent>
    </Card>
  );
}
