'use client';

import { useState, useTransition } from 'react';
import { useRouter } from '@/i18n/routing';
import { useAdminApi } from '@/lib/admin-auth';
import { Input, Textarea } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { MediaPicker } from './media-picker';
import { RichTextEditor } from './rich-text-editor';
import type { MediaDTO, ApiLocale } from '@/types/api';

const LOCALES: { code: ApiLocale; label: string }[] = [
  { code: 'AR', label: 'العربية' },
  { code: 'EN', label: 'English' },
  { code: 'RU', label: 'Русский' },
  { code: 'IT', label: 'Italiano' },
];

interface BlogPostShape {
  id?: number;
  slug?: string;
  status: 'DRAFT' | 'PUBLISHED';
  readTime: number;
  coverImage?: MediaDTO | null;
  translations: { locale: ApiLocale; title: string; excerpt: string; content: string; metaTitle?: string; metaDesc?: string }[];
}

export function BlogForm({ initial }: { initial?: BlogPostShape }) {
  const api = useAdminApi();
  const router = useRouter();
  const [pending, start] = useTransition();
  const [activeLocale, setActiveLocale] = useState<ApiLocale>('AR');

  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED'>(initial?.status || 'DRAFT');
  const [readTime, setReadTime] = useState(initial?.readTime || 5);
  const [cover, setCover] = useState<MediaDTO | null>(initial?.coverImage || null);
  const [translations, setTranslations] = useState<BlogPostShape['translations']>(() =>
    LOCALES.map((l) => {
      const existing = initial?.translations.find((t) => t.locale === l.code);
      return existing || { locale: l.code, title: '', excerpt: '', content: '' };
    }),
  );

  const tr = translations.find((t) => t.locale === activeLocale)!;

  const setField = (field: 'title' | 'excerpt' | 'content' | 'metaTitle' | 'metaDesc', value: string) => {
    setTranslations((prev) => prev.map((t) => (t.locale === activeLocale ? { ...t, [field]: value } : t)));
  };

  const translateAll = async () => {
    const arTr = translations.find((t) => t.locale === 'AR');
    if (!arTr || !arTr.title || !arTr.excerpt || !arTr.content) {
      return toast.error('املأ كل حقول العربي أولاً');
    }
    try {
      const [titleOut, excerptOut, contentOut] = await Promise.all([
        api.post<{ translations: Record<string, string> }>('/admin/translate', { text: arTr.title, from: 'AR', to: ['EN', 'RU', 'IT'] }),
        api.post<{ translations: Record<string, string> }>('/admin/translate', { text: arTr.excerpt, from: 'AR', to: ['EN', 'RU', 'IT'] }),
        api.post<{ translations: Record<string, string> }>('/admin/translate', { text: arTr.content, from: 'AR', to: ['EN', 'RU', 'IT'] }),
      ]);
      setTranslations((prev) =>
        prev.map((t) =>
          t.locale === 'AR'
            ? t
            : {
                ...t,
                title: titleOut.translations[t.locale] || t.title,
                excerpt: excerptOut.translations[t.locale] || t.excerpt,
                content: contentOut.translations[t.locale] || t.content,
              },
        ),
      );
      toast.success('تمت الترجمة');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error');
    }
  };

  const save = () => {
    const payload = {
      status,
      readTime,
      coverImageId: cover?.id ?? null,
      translations: translations.filter((t) => t.title.trim()),
    };
    start(async () => {
      try {
        if (initial?.id) {
          await api.patch(`/admin/blog/${initial.id}`, payload);
        } else {
          await api.post('/admin/blog', payload);
        }
        toast.success('تم الحفظ');
        router.push('/admin/blog');
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Error');
      }
    });
  };

  return (
    <div className="space-y-4 max-w-4xl pb-28">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{initial?.id ? 'تعديل مقال' : 'مقال جديد'}</h2>
        {initial?.id && (
          <span className="text-xs text-muted-foreground hidden md:inline-flex items-center gap-1.5">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            استخدم زر الحفظ العائم بالأسفل
          </span>
        )}
      </div>

      <Card>
        <CardContent className="p-4 grid md:grid-cols-3 gap-3">
          <div>
            <label className="text-sm font-semibold mb-1.5 block">الحالة</label>
            <select className="h-11 w-full rounded-lg border px-3" value={status} onChange={(e) => setStatus(e.target.value as 'DRAFT' | 'PUBLISHED')}>
              <option value="DRAFT">مسودة</option>
              <option value="PUBLISHED">منشور</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold mb-1.5 block">مدة القراءة (دقيقة)</label>
            <Input type="number" value={readTime} onChange={(e) => setReadTime(Number(e.target.value))} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>الصورة الرئيسية</CardTitle></CardHeader>
        <CardContent>
          <MediaPicker label="" mode="single" value={cover} onChange={(v) => setCover(v as MediaDTO | null)} />
        </CardContent>
      </Card>

      <div className="flex gap-1 bg-white border rounded-lg p-1 w-fit">
        {LOCALES.map((l) => (
          <button key={l.code} onClick={() => setActiveLocale(l.code)} className={cn('px-4 py-1.5 rounded-md text-sm font-semibold', activeLocale === l.code ? 'bg-primary text-white' : 'hover:bg-muted')}>
            {l.label}
          </button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>المحتوى</span>
            {activeLocale === 'AR' && <Button size="sm" variant="outline" onClick={translateAll}><Sparkles className="h-3.5 w-3.5" /> ترجم للباقي</Button>}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div><label className="text-sm font-semibold mb-1.5 block">العنوان</label><Input value={tr.title} onChange={(e) => setField('title', e.target.value)} /></div>
          <div><label className="text-sm font-semibold mb-1.5 block">المقدمة</label><Textarea rows={3} value={tr.excerpt} onChange={(e) => setField('excerpt', e.target.value)} /></div>
          <div>
            <label className="text-sm font-semibold mb-1.5 block">المحتوى</label>
            <RichTextEditor
              value={tr.content}
              onChange={(html) => setField('content', html)}
              rtl={activeLocale === 'AR'}
              placeholder={activeLocale === 'AR' ? 'اكتب محتوى المقال...' : 'Write your article...'}
              minHeight={420}
            />
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            <div><label className="text-sm font-semibold mb-1.5 block">Meta Title</label><Input value={tr.metaTitle || ''} onChange={(e) => setField('metaTitle', e.target.value)} /></div>
            <div><label className="text-sm font-semibold mb-1.5 block">Meta Description</label><Input value={tr.metaDesc || ''} onChange={(e) => setField('metaDesc', e.target.value)} /></div>
          </div>
        </CardContent>
      </Card>

      {/* Floating action bar — always visible, regardless of scroll */}
      <div className="fixed bottom-4 inset-x-4 md:inset-x-auto md:end-6 z-40 flex justify-end pointer-events-none">
        <div className="pointer-events-auto inline-flex items-center gap-2 bg-white/95 backdrop-blur-md p-2 rounded-2xl border border-accent/25 shadow-2xl shadow-primary-900/15">
          {pending && (
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-accent-700 px-3">
              <span className="inline-block w-2 h-2 rounded-full bg-accent animate-pulse" />
              جاري الحفظ...
            </span>
          )}
          <Button variant="outline" size="sm" onClick={() => router.push('/admin/blog')} disabled={pending}>
            إلغاء
          </Button>
          <Button onClick={save} disabled={pending} className="bg-accent text-primary hover:bg-accent-400 font-bold shadow-lg shadow-accent/30 px-5">
            <Save className="h-4 w-4" />
            <span className="ms-1">{pending ? 'جاري الحفظ...' : 'حفظ التعديلات'}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
