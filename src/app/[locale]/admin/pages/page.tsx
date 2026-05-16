'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import Link from 'next/link';
import { useAdminApi } from '@/lib/admin-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input, Textarea } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Save, Sparkles, ExternalLink, Home, Map, Image as ImageIcon, BookOpen, Phone, Info, ShieldCheck, FileText, XCircle, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { RichTextEditor } from '@/components/admin/rich-text-editor';
import { MediaPicker } from '@/components/admin/media-picker';
import type { MediaDTO } from '@/types/api';

type Locale = 'AR' | 'EN' | 'RU' | 'IT';
const LOCALES: Locale[] = ['AR', 'EN', 'RU', 'IT'];
const LABELS: Record<Locale, string> = { AR: 'العربية', EN: 'English', RU: 'Русский', IT: 'Italiano' };
const FLAGS: Record<Locale, string> = { AR: 'ع', EN: 'EN', RU: 'RU', IT: 'IT' };

interface StaticPageTr {
  locale: Locale;
  title: string;
  subtitle?: string | null;
  content: string;
  metaTitle?: string | null;
  metaDesc?: string | null;
}
interface StaticPage {
  id: number;
  slug: string;
  heroImage?: MediaDTO | null;
  translations: StaticPageTr[];
}

interface PageDef {
  slug: string;
  labelAr: string;
  descAr: string;
  publicPath: string;
  icon: React.ComponentType<{ className?: string }>;
  group: 'main' | 'legal';
}

const PAGES: PageDef[] = [
  { slug: 'home',           labelAr: 'الصفحة الرئيسية',   descAr: 'الـ Hero والرسالة الترحيبية في الواجهة',  publicPath: '/',                  icon: Home,        group: 'main' },
  { slug: 'trips',          labelAr: 'صفحة الرحلات',     descAr: 'رأس صفحة قائمة الرحلات + الوصف',         publicPath: '/trips',             icon: Map,         group: 'main' },
  { slug: 'gallery',        labelAr: 'صفحة المعرض',      descAr: 'رأس صفحة معرض الصور والفيديوهات',         publicPath: '/gallery',           icon: ImageIcon,   group: 'main' },
  { slug: 'blog',           labelAr: 'صفحة المدونة',     descAr: 'رأس صفحة المقالات والوصف',                publicPath: '/blog',              icon: BookOpen,    group: 'main' },
  { slug: 'contact',        labelAr: 'صفحة التواصل',     descAr: 'رأس صفحة "اتصل بنا"',                     publicPath: '/contact',           icon: Phone,       group: 'main' },
  { slug: 'about',          labelAr: 'من نحن',           descAr: 'صفحة "من نحن" بالكامل',                    publicPath: '/about',             icon: Info,        group: 'main' },
  { slug: 'privacy',        labelAr: 'سياسة الخصوصية',    descAr: 'صفحة الخصوصية بالكامل',                    publicPath: '/privacy',           icon: ShieldCheck, group: 'legal' },
  { slug: 'terms',          labelAr: 'الشروط والأحكام',    descAr: 'صفحة شروط الاستخدام بالكامل',              publicPath: '/terms',             icon: FileText,    group: 'legal' },
  { slug: 'cancellation',   labelAr: 'سياسة الإلغاء',     descAr: 'سياسة الإلغاء والاسترداد',                  publicPath: '/cancellation-policy', icon: XCircle,     group: 'legal' },
];

export default function AdminPagesPage() {
  const api = useAdminApi();
  const [pages, setPages] = useState<Record<string, StaticPage | null>>({});
  const [activeSlug, setActiveSlug] = useState('home');
  const [activeLocale, setActiveLocale] = useState<Locale>('AR');
  const [search, setSearch] = useState('');
  const [pending, start] = useTransition();
  const [translating, setTranslating] = useState(false);

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
  const tr: StaticPageTr =
    page?.translations.find((t) => t.locale === activeLocale) ||
    { locale: activeLocale, title: '', subtitle: '', content: '', metaTitle: '', metaDesc: '' };

  const currentDef = useMemo(() => PAGES.find((p) => p.slug === activeSlug)!, [activeSlug]);
  const filtered = useMemo(
    () => PAGES.filter((p) => !search.trim() || p.labelAr.includes(search) || p.slug.includes(search.toLowerCase())),
    [search],
  );
  const mainPages = filtered.filter((p) => p.group === 'main');
  const legalPages = filtered.filter((p) => p.group === 'legal');

  const update = (field: keyof StaticPageTr, value: string) => {
    setPages((prev) => {
      const p = prev[activeSlug];
      const newTranslations = LOCALES.map((l) => {
        const existing = p?.translations.find((t) => t.locale === l);
        if (l === activeLocale) {
          return {
            ...(existing || { locale: l, title: '', content: '' }),
            [field]: value,
            locale: l,
          } as StaticPageTr;
        }
        return existing || { locale: l, title: '', content: '' };
      });
      return { ...prev, [activeSlug]: { id: p?.id || 0, slug: activeSlug, heroImage: p?.heroImage ?? null, translations: newTranslations } };
    });
  };

  const setHeroImage = (m: MediaDTO | null) => {
    setPages((prev) => {
      const p = prev[activeSlug] || { id: 0, slug: activeSlug, translations: [] };
      return { ...prev, [activeSlug]: { ...p, heroImage: m } };
    });
  };

  const translateFields = async () => {
    const src = page?.translations.find((t) => t.locale === 'AR');
    if (!src?.title || !src?.content) return toast.error('املأ العنوان والمحتوى بالعربي أولاً');
    setTranslating(true);
    try {
      const tasks: Array<Promise<{ field: keyof StaticPageTr; translations: Record<string, string> }>> = [];
      tasks.push(api.post<{ translations: Record<string, string> }>('/admin/translate', { text: src.title,    from: 'AR', to: ['EN','RU','IT'] }).then((r) => ({ field: 'title' as const, translations: r.translations })));
      tasks.push(api.post<{ translations: Record<string, string> }>('/admin/translate', { text: src.content,  from: 'AR', to: ['EN','RU','IT'] }).then((r) => ({ field: 'content' as const, translations: r.translations })));
      if (src.subtitle) tasks.push(api.post<{ translations: Record<string, string> }>('/admin/translate', { text: src.subtitle, from: 'AR', to: ['EN','RU','IT'] }).then((r) => ({ field: 'subtitle' as const, translations: r.translations })));
      const results = await Promise.all(tasks);
      setPages((prev) => {
        const p = prev[activeSlug];
        if (!p) return prev;
        const newTranslations = p.translations.map((t) => {
          if (t.locale === 'AR') return t;
          const patched = { ...t };
          for (const r of results) {
            const v = r.translations[t.locale];
            if (v) (patched as Record<string, unknown>)[r.field] = v;
          }
          return patched;
        });
        return { ...prev, [activeSlug]: { ...p, translations: newTranslations } };
      });
      toast.success('تمت الترجمة لكل اللغات');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error');
    } finally {
      setTranslating(false);
    }
  };

  const save = () => {
    if (!page) return;
    const valid = page.translations.filter((t) => t.title.trim() && t.content.trim());
    if (valid.length === 0) return toast.error('أضف على الأقل ترجمة واحدة بعنوان ومحتوى');
    const payload = {
      heroImageId: page.heroImage?.id ?? null,
      translations: valid.map((t) => ({
        locale: t.locale,
        title: t.title,
        subtitle: t.subtitle || null,
        content: t.content,
        metaTitle: t.metaTitle || null,
        metaDesc: t.metaDesc || null,
      })),
    };
    start(async () => {
      try {
        if (page.id === 0) {
          await api.post('/admin/pages', { slug: activeSlug, ...payload });
        } else {
          await api.patch(`/admin/pages/${activeSlug}`, payload);
        }
        toast.success('تم الحفظ بنجاح');
        void load();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Error');
      }
    });
  };

  const filledCount = page?.translations.filter((t) => t.title.trim() && t.content.trim()).length || 0;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">إدارة صفحات الموقع</h2>
          <p className="text-sm text-muted-foreground mt-0.5">حرّر أي صفحة بصور ومحتوى احترافي بـ 4 لغات.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/ar${currentDef.publicPath === '/' ? '' : currentDef.publicPath}`} target="_blank" rel="noopener">
            <Button variant="outline" size="sm"><ExternalLink className="h-3.5 w-3.5" /> معاينة الصفحة</Button>
          </Link>
          <Button onClick={save} disabled={pending}><Save className="h-4 w-4" /> {pending ? 'جاري الحفظ...' : 'حفظ'}</Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[280px_1fr] gap-5">
        {/* Sidebar — Page list */}
        <aside className="space-y-3">
          <div className="relative">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="بحث عن صفحة..." value={search} onChange={(e) => setSearch(e.target.value)} className="ps-9" />
          </div>

          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">صفحات الموقع</CardTitle>
            </CardHeader>
            <CardContent className="p-2 space-y-1">
              {mainPages.map((p) => {
                const Icon = p.icon;
                const data = pages[p.slug];
                const filled = data?.translations.filter((t) => t.title.trim() && t.content.trim()).length || 0;
                return (
                  <button
                    key={p.slug}
                    onClick={() => setActiveSlug(p.slug)}
                    className={cn(
                      'w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-start transition-colors',
                      activeSlug === p.slug ? 'bg-primary text-white' : 'hover:bg-muted',
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="flex-1 truncate">{p.labelAr}</span>
                    <span className={cn('text-[10px] px-1.5 py-0.5 rounded-full font-semibold tabular-nums',
                      filled === 4 ? 'bg-emerald-500/15 text-emerald-700'
                      : filled > 0 ? 'bg-amber-500/15 text-amber-700'
                      : 'bg-muted text-muted-foreground',
                      activeSlug === p.slug && 'bg-white/15 text-white',
                    )}>{filled}/4</span>
                  </button>
                );
              })}
              {mainPages.length === 0 && <div className="px-3 py-2 text-xs text-muted-foreground">لا نتائج</div>}
            </CardContent>
          </Card>

          {legalPages.length > 0 && (
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">الصفحات القانونية</CardTitle>
              </CardHeader>
              <CardContent className="p-2 space-y-1">
                {legalPages.map((p) => {
                  const Icon = p.icon;
                  const data = pages[p.slug];
                  const filled = data?.translations.filter((t) => t.title.trim() && t.content.trim()).length || 0;
                  return (
                    <button
                      key={p.slug}
                      onClick={() => setActiveSlug(p.slug)}
                      className={cn(
                        'w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-start transition-colors',
                        activeSlug === p.slug ? 'bg-primary text-white' : 'hover:bg-muted',
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="flex-1 truncate">{p.labelAr}</span>
                      <span className={cn('text-[10px] px-1.5 py-0.5 rounded-full font-semibold tabular-nums',
                        filled === 4 ? 'bg-emerald-500/15 text-emerald-700'
                        : filled > 0 ? 'bg-amber-500/15 text-amber-700'
                        : 'bg-muted text-muted-foreground',
                        activeSlug === p.slug && 'bg-white/15 text-white',
                      )}>{filled}/4</span>
                    </button>
                  );
                })}
              </CardContent>
            </Card>
          )}
        </aside>

        {/* Editor */}
        <div className="space-y-4 min-w-0">
          {/* Page meta strip */}
          <Card>
            <CardContent className="p-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <currentDef.icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-bold">{currentDef.labelAr}</div>
                  <div className="text-xs text-muted-foreground">{currentDef.descAr}</div>
                </div>
              </div>
              <div className="text-xs text-muted-foreground font-mono">
                المسار: <span className="text-foreground">{currentDef.publicPath}</span>
                <span className="mx-2">·</span>
                المُعرّف: <span className="text-foreground">{currentDef.slug}</span>
                <span className="mx-2">·</span>
                لغات مكتملة: <span className="text-foreground font-semibold">{filledCount}/4</span>
              </div>
            </CardContent>
          </Card>

          {/* Hero image */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">صورة الغلاف (Hero) — مشتركة لكل اللغات</CardTitle>
            </CardHeader>
            <CardContent>
              <MediaPicker mode="single" label="" value={page?.heroImage ?? null} onChange={setHeroImage} />
              <p className="text-xs text-muted-foreground mt-2">تُستخدم كخلفية رأس الصفحة وكصورة المشاركة على السوشيال ميديا.</p>
            </CardContent>
          </Card>

          {/* Locale tabs */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex gap-1 bg-white border rounded-lg p-1">
              {LOCALES.map((l) => {
                const filled = !!page?.translations.find((t) => t.locale === l && t.title.trim() && t.content.trim());
                return (
                  <button
                    key={l}
                    onClick={() => setActiveLocale(l)}
                    className={cn(
                      'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-semibold transition-colors',
                      activeLocale === l ? 'bg-primary text-white' : 'hover:bg-muted',
                    )}
                  >
                    <span className="font-mono text-[10px] opacity-70">{FLAGS[l]}</span>
                    <span>{LABELS[l]}</span>
                    {filled && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                  </button>
                );
              })}
            </div>
            {activeLocale !== 'AR' && (
              <span className="text-xs text-muted-foreground">يمكن استخدام زر "ترجم للباقي" من تبويب العربية</span>
            )}
          </div>

          {/* Content */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between flex-wrap gap-2">
                <span>المحتوى — {LABELS[activeLocale]}</span>
                {activeLocale === 'AR' && (
                  <Button size="sm" variant="outline" onClick={translateFields} disabled={translating}>
                    <Sparkles className="h-3.5 w-3.5" /> {translating ? 'جاري الترجمة...' : 'ترجم تلقائياً للباقي'}
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-semibold mb-1.5 block">العنوان الرئيسي</label>
                <Input
                  value={tr.title}
                  onChange={(e) => update('title', e.target.value)}
                  dir={activeLocale === 'AR' ? 'rtl' : 'ltr'}
                  placeholder={activeLocale === 'AR' ? 'مثال: اكتشف رحلات شرم الشيخ' : ''}
                />
              </div>

              <div>
                <label className="text-sm font-semibold mb-1.5 block">العنوان الفرعي (Subtitle)</label>
                <Textarea
                  rows={2}
                  value={tr.subtitle || ''}
                  onChange={(e) => update('subtitle', e.target.value)}
                  dir={activeLocale === 'AR' ? 'rtl' : 'ltr'}
                  placeholder={activeLocale === 'AR' ? 'وصف مختصر يظهر تحت العنوان' : ''}
                />
              </div>

              <div>
                <label className="text-sm font-semibold mb-1.5 block">المحتوى الكامل</label>
                <RichTextEditor
                  value={tr.content}
                  onChange={(html) => update('content', html)}
                  rtl={activeLocale === 'AR'}
                  minHeight={320}
                  placeholder={activeLocale === 'AR' ? 'اكتب محتوى الصفحة...' : 'Write the page content...'}
                />
              </div>

              <details className="group">
                <summary className="cursor-pointer text-sm font-semibold text-muted-foreground hover:text-foreground select-none">
                  ⚙ إعدادات SEO المتقدمة
                </summary>
                <div className="grid md:grid-cols-2 gap-3 mt-3">
                  <div>
                    <label className="text-sm font-semibold mb-1.5 block">Meta Title (عنوان SEO)</label>
                    <Input
                      value={tr.metaTitle || ''}
                      onChange={(e) => update('metaTitle', e.target.value)}
                      dir={activeLocale === 'AR' ? 'rtl' : 'ltr'}
                      maxLength={60}
                    />
                    <p className="text-[11px] text-muted-foreground mt-1">يفضّل أقل من 60 حرف</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold mb-1.5 block">Meta Description (وصف SEO)</label>
                    <Textarea
                      rows={2}
                      value={tr.metaDesc || ''}
                      onChange={(e) => update('metaDesc', e.target.value)}
                      dir={activeLocale === 'AR' ? 'rtl' : 'ltr'}
                      maxLength={160}
                    />
                    <p className="text-[11px] text-muted-foreground mt-1">يفضّل أقل من 160 حرف</p>
                  </div>
                </div>
              </details>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
