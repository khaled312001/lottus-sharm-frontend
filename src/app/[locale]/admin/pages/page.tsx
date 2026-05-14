'use client';

import { useEffect, useState, useTransition } from 'react';
import { useAdminApi } from '@/lib/admin-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input, Textarea } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Save, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type Locale = 'AR' | 'EN' | 'RU' | 'IT';
const LOCALES: Locale[] = ['AR', 'EN', 'RU', 'IT'];
const LABELS: Record<Locale, string> = { AR: 'العربية', EN: 'English', RU: 'Русский', IT: 'Italiano' };

interface StaticPage {
  id: number;
  slug: string;
  translations: Array<{ locale: Locale; title: string; content: string; metaTitle?: string | null; metaDesc?: string | null }>;
}

const PAGE_SLUGS = ['about', 'privacy', 'terms', 'cancellation'];

export default function AdminPagesPage() {
  const api = useAdminApi();
  const [pages, setPages] = useState<Record<string, StaticPage | null>>({});
  const [activeSlug, setActiveSlug] = useState('about');
  const [activeLocale, setActiveLocale] = useState<Locale>('AR');
  const [pending, start] = useTransition();

  const load = async () => {
    try {
      const res = await api.get<{ items: StaticPage[] }>('/admin/pages');
      const map: Record<string, StaticPage> = {};
      res.items.forEach((p) => { map[p.slug] = p; });
      setPages(map);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error');
    }
  };

  useEffect(() => { void load(); /* eslint-disable-next-line */ }, []);

  const page = pages[activeSlug] || null;
  const tr = page?.translations.find((t) => t.locale === activeLocale) ||
    { locale: activeLocale, title: '', content: '', metaTitle: '', metaDesc: '' };

  const update = (field: 'title' | 'content' | 'metaTitle' | 'metaDesc', value: string) => {
    setPages((prev) => {
      const p = prev[activeSlug];
      const newTranslations = LOCALES.map((l) => {
        const existing = p?.translations.find((t) => t.locale === l);
        if (l === activeLocale) {
          return { ...(existing || { locale: l, title: '', content: '' }), [field]: value, locale: l } as StaticPage['translations'][number];
        }
        return existing || { locale: l, title: '', content: '' };
      });
      return { ...prev, [activeSlug]: { id: p?.id || 0, slug: activeSlug, translations: newTranslations } };
    });
  };

  const translateFields = async () => {
    const srcTitle = page?.translations.find((t) => t.locale === 'AR')?.title;
    const srcContent = page?.translations.find((t) => t.locale === 'AR')?.content;
    if (!srcTitle || !srcContent) return toast.error('املأ العنوان والمحتوى بالعربي أولاً');
    try {
      const [titleOut, contentOut] = await Promise.all([
        api.post<{ translations: Record<string, string> }>('/admin/translate', { text: srcTitle, from: 'AR', to: ['EN', 'RU', 'IT'] }),
        api.post<{ translations: Record<string, string> }>('/admin/translate', { text: srcContent, from: 'AR', to: ['EN', 'RU', 'IT'] }),
      ]);
      setPages((prev) => {
        const p = prev[activeSlug];
        if (!p) return prev;
        const newTranslations = p.translations.map((t) =>
          t.locale === 'AR'
            ? t
            : { ...t, title: titleOut.translations[t.locale] || t.title, content: contentOut.translations[t.locale] || t.content },
        );
        return { ...prev, [activeSlug]: { ...p, translations: newTranslations } };
      });
      toast.success('تمت الترجمة');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error');
    }
  };

  const save = () => {
    if (!page) return;
    const payload = {
      translations: page.translations.filter((t) => t.title.trim()).map((t) => ({
        locale: t.locale,
        title: t.title,
        content: t.content,
        metaTitle: t.metaTitle || undefined,
        metaDesc: t.metaDesc || undefined,
      })),
    };
    start(async () => {
      try {
        if (page.id === 0) {
          await api.post('/admin/pages', { slug: activeSlug, ...payload });
        } else {
          await api.patch(`/admin/pages/${activeSlug}`, payload);
        }
        toast.success('تم الحفظ');
        void load();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Error');
      }
    });
  };

  return (
    <div className="space-y-4 max-w-5xl">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">إدارة الصفحات الثابتة</h2>
        <Button onClick={save} disabled={pending}><Save className="h-4 w-4" /> حفظ</Button>
      </div>

      {/* Page tabs */}
      <div className="flex gap-1 flex-wrap">
        {PAGE_SLUGS.map((s) => (
          <button key={s} onClick={() => setActiveSlug(s)} className={cn('px-4 py-2 rounded-lg text-sm font-semibold border', activeSlug === s ? 'bg-primary text-white border-primary' : 'bg-white hover:bg-muted')}>
            {s === 'about' ? 'من نحن' : s === 'privacy' ? 'الخصوصية' : s === 'terms' ? 'الشروط' : 'الإلغاء'}
          </button>
        ))}
      </div>

      {/* Locale tabs */}
      <div className="flex gap-1 bg-white border rounded-lg p-1 w-fit">
        {LOCALES.map((l) => (
          <button key={l} onClick={() => setActiveLocale(l)} className={cn('px-4 py-1.5 rounded-md text-sm font-semibold', activeLocale === l ? 'bg-primary text-white' : 'hover:bg-muted')}>
            {LABELS[l]}
          </button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>المحتوى ({LABELS[activeLocale]})</span>
            {activeLocale === 'AR' && <Button size="sm" variant="outline" onClick={translateFields}><Sparkles className="h-3.5 w-3.5" /> ترجم للباقي</Button>}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div><label className="text-sm font-semibold mb-1.5 block">العنوان</label><Input value={tr.title} onChange={(e) => update('title', e.target.value)} /></div>
          <div><label className="text-sm font-semibold mb-1.5 block">المحتوى (HTML)</label><Textarea rows={12} className="font-mono text-xs" value={tr.content} onChange={(e) => update('content', e.target.value)} /></div>
          <div className="grid md:grid-cols-2 gap-3">
            <div><label className="text-sm font-semibold mb-1.5 block">Meta Title</label><Input value={tr.metaTitle || ''} onChange={(e) => update('metaTitle', e.target.value)} /></div>
            <div><label className="text-sm font-semibold mb-1.5 block">Meta Description</label><Input value={tr.metaDesc || ''} onChange={(e) => update('metaDesc', e.target.value)} /></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
