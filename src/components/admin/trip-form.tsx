'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter } from '@/i18n/routing';
import { Input, Textarea } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Sparkles, Save, ChevronUp, ChevronDown } from 'lucide-react';
import { useAdminApi } from '@/lib/admin-auth';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { MediaPicker } from './media-picker';
import type { TripDTO, MediaDTO, ApiLocale } from '@/types/api';

const LOCALES: { code: ApiLocale; label: string }[] = [
  { code: 'AR', label: 'العربية' },
  { code: 'EN', label: 'English' },
  { code: 'RU', label: 'Русский' },
  { code: 'IT', label: 'Italiano' },
];

const CATEGORIES = ['SEA', 'DESERT', 'CITY', 'DIVING', 'EVENTS', 'SAFARI'] as const;
const BULLETS = ['INCLUDE', 'EXCLUDE', 'BRING'] as const;

interface TranslationForm {
  locale: ApiLocale;
  title: string;
  shortDesc: string;
  longDesc: string;
  metaTitle: string;
  metaDesc: string;
}

interface HighlightForm {
  order: number;
  translations: { locale: ApiLocale; text: string }[];
}

interface BulletForm {
  type: 'INCLUDE' | 'EXCLUDE' | 'BRING';
  order: number;
  translations: { locale: ApiLocale; text: string }[];
}

const emptyTranslations = (): TranslationForm[] =>
  LOCALES.map((l) => ({ locale: l.code, title: '', shortDesc: '', longDesc: '', metaTitle: '', metaDesc: '' }));

export function TripForm({ initialTrip }: { initialTrip?: TripDTO }) {
  const api = useAdminApi();
  const router = useRouter();
  const [pending, start] = useTransition();
  const [activeLocale, setActiveLocale] = useState<ApiLocale>('AR');

  const [category, setCategory] = useState<typeof CATEGORIES[number]>((initialTrip?.category as typeof CATEGORIES[number]) || 'SEA');
  const [durationMinutes, setDurationMinutes] = useState(initialTrip?.durationMinutes || 240);
  const [startTime, setStartTime] = useState(initialTrip?.startTime || '09:00');
  const [meetingPoint, setMeetingPoint] = useState(initialTrip?.meetingPoint || '');
  const [priceLocalEGP, setPriceLocalEGP] = useState(Number(initialTrip?.priceLocalEGP || 750));
  const [priceForeignUSD, setPriceForeignUSD] = useState(Number(initialTrip?.priceForeignUSD || 20));
  const [childDiscount, setChildDiscount] = useState(initialTrip?.childDiscount || 0);
  const [isFeatured, setIsFeatured] = useState(initialTrip?.isFeatured || false);
  const [isActive, setIsActive] = useState(initialTrip?.isActive ?? true);

  const [heroImage, setHeroImage] = useState<MediaDTO | null>(initialTrip?.heroImage || null);
  const [gallery, setGallery] = useState<MediaDTO[]>(initialTrip?.gallery.map((g) => g.media) || []);

  const [translations, setTranslations] = useState<TranslationForm[]>(() => {
    const base = emptyTranslations();
    initialTrip?.translations.forEach((t) => {
      const idx = base.findIndex((b) => b.locale === t.locale);
      if (idx >= 0) {
        base[idx] = {
          locale: t.locale,
          title: t.title,
          shortDesc: t.shortDesc,
          longDesc: t.longDesc,
          metaTitle: t.metaTitle || '',
          metaDesc: t.metaDesc || '',
        };
      }
    });
    return base;
  });

  const [highlights, setHighlights] = useState<HighlightForm[]>(() => {
    if (!initialTrip) return [];
    return initialTrip.highlights.map((h) => ({
      order: h.order,
      translations: LOCALES.map((l) => ({
        locale: l.code,
        text: h.translations.find((x) => x.locale === l.code)?.text || '',
      })),
    }));
  });

  const [bullets, setBullets] = useState<BulletForm[]>(() => {
    if (!initialTrip) return [];
    return initialTrip.bullets.map((b) => ({
      type: b.type,
      order: b.order,
      translations: LOCALES.map((l) => ({
        locale: l.code,
        text: b.translations.find((x) => x.locale === l.code)?.text || '',
      })),
    }));
  });

  const trIdx = (loc: ApiLocale) => translations.findIndex((t) => t.locale === loc);
  const setTrField = (loc: ApiLocale, field: keyof TranslationForm, value: string) => {
    setTranslations((prev) => prev.map((t) => (t.locale === loc ? { ...t, [field]: value } : t)));
  };

  // === AI translate ===
  const translateField = async (field: 'title' | 'shortDesc' | 'longDesc') => {
    const src = translations.find((t) => t.locale === 'AR')?.[field];
    if (!src || src.trim().length < 2) {
      toast.error('املأ النص العربي أولاً');
      return;
    }
    const targets: ApiLocale[] = ['EN', 'RU', 'IT'];
    try {
      const out = await api.post<{ translations: Record<string, string> }>('/admin/translate', {
        text: src,
        from: 'AR',
        to: targets,
        context: 'Lottus Sharm tourism trip — Egyptian tourism marketing copy',
      });
      setTranslations((prev) =>
        prev.map((t) => (t.locale !== 'AR' && out.translations[t.locale] ? { ...t, [field]: out.translations[t.locale] } : t)),
      );
      toast.success('تم توليد الترجمات');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'فشلت الترجمة');
    }
  };

  const translateHighlight = async (i: number) => {
    const src = highlights[i].translations.find((x) => x.locale === 'AR')?.text;
    if (!src) return toast.error('املأ النص العربي');
    try {
      const out = await api.post<{ translations: Record<string, string> }>('/admin/translate', {
        text: src, from: 'AR', to: ['EN', 'RU', 'IT'],
      });
      setHighlights((prev) =>
        prev.map((h, idx) =>
          idx === i
            ? { ...h, translations: h.translations.map((tr) => (tr.locale !== 'AR' && out.translations[tr.locale] ? { ...tr, text: out.translations[tr.locale] } : tr)) }
            : h,
        ),
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error');
    }
  };

  const translateBullet = async (i: number) => {
    const src = bullets[i].translations.find((x) => x.locale === 'AR')?.text;
    if (!src) return toast.error('املأ النص العربي');
    try {
      const out = await api.post<{ translations: Record<string, string> }>('/admin/translate', {
        text: src, from: 'AR', to: ['EN', 'RU', 'IT'],
      });
      setBullets((prev) =>
        prev.map((b, idx) =>
          idx === i
            ? { ...b, translations: b.translations.map((tr) => (tr.locale !== 'AR' && out.translations[tr.locale] ? { ...tr, text: out.translations[tr.locale] } : tr)) }
            : b,
        ),
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error');
    }
  };

  const save = () => {
    if (!translations.find((t) => t.locale === 'AR')?.title) {
      toast.error('عنوان الرحلة بالعربي إلزامي');
      return;
    }
    const payload = {
      category,
      durationMinutes: Number(durationMinutes),
      startTime,
      meetingPoint,
      priceLocalEGP: Number(priceLocalEGP),
      priceForeignUSD: Number(priceForeignUSD),
      childDiscount: Number(childDiscount),
      isFeatured,
      isActive,
      heroImageId: heroImage?.id || undefined,
      galleryMediaIds: gallery.map((g) => g.id),
      translations: translations.filter((t) => t.title.trim()),
      highlights: highlights.filter((h) => h.translations.find((x) => x.locale === 'AR')?.text),
      bullets: bullets.filter((b) => b.translations.find((x) => x.locale === 'AR')?.text),
    };
    start(async () => {
      try {
        if (initialTrip) {
          await api.patch(`/admin/trips/${initialTrip.id}`, payload);
          toast.success('تم حفظ التعديلات');
        } else {
          await api.post('/admin/trips', payload);
          toast.success('تمت إضافة الرحلة');
        }
        router.push('/admin/trips');
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Error');
      }
    });
  };

  const moveItem = <T,>(arr: T[], from: number, dir: -1 | 1, setter: (v: T[]) => void) => {
    const to = from + dir;
    if (to < 0 || to >= arr.length) return;
    const copy = [...arr];
    [copy[from], copy[to]] = [copy[to], copy[from]];
    setter(copy);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{initialTrip ? 'تعديل رحلة' : 'إضافة رحلة جديدة'}</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push('/admin/trips')}>إلغاء</Button>
          <Button onClick={save} disabled={pending}><Save className="h-4 w-4" /> حفظ</Button>
        </div>
      </div>

      {/* Locale tabs */}
      <div className="flex gap-1 bg-white border rounded-lg p-1 w-fit">
        {LOCALES.map((l) => (
          <button
            key={l.code}
            onClick={() => setActiveLocale(l.code)}
            className={cn(
              'px-4 py-1.5 rounded-md text-sm font-semibold transition-colors',
              activeLocale === l.code ? 'bg-primary text-white' : 'hover:bg-muted',
            )}
          >
            {l.label}
          </button>
        ))}
      </div>

      {/* Translation content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>المحتوى ({LOCALES.find((l) => l.code === activeLocale)?.label})</span>
            {activeLocale === 'AR' && (
              <span className="text-xs text-muted-foreground font-normal">سيظهر زر الترجمة في حقول AR لتوليد باقي اللغات</span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field
            label="عنوان الرحلة"
            translateBtn={activeLocale === 'AR' && (
              <Button size="sm" variant="outline" type="button" onClick={() => translateField('title')}>
                <Sparkles className="h-3.5 w-3.5" /> ترجم للباقي
              </Button>
            )}
          >
            <Input
              value={translations[trIdx(activeLocale)].title}
              onChange={(e) => setTrField(activeLocale, 'title', e.target.value)}
            />
          </Field>

          <Field
            label="وصف قصير"
            translateBtn={activeLocale === 'AR' && (
              <Button size="sm" variant="outline" type="button" onClick={() => translateField('shortDesc')}>
                <Sparkles className="h-3.5 w-3.5" /> ترجم
              </Button>
            )}
          >
            <Textarea
              rows={3}
              value={translations[trIdx(activeLocale)].shortDesc}
              onChange={(e) => setTrField(activeLocale, 'shortDesc', e.target.value)}
            />
          </Field>

          <Field
            label="الوصف الكامل (HTML مسموح)"
            translateBtn={activeLocale === 'AR' && (
              <Button size="sm" variant="outline" type="button" onClick={() => translateField('longDesc')}>
                <Sparkles className="h-3.5 w-3.5" /> ترجم
              </Button>
            )}
          >
            <Textarea
              rows={10}
              className="font-mono text-xs"
              value={translations[trIdx(activeLocale)].longDesc}
              onChange={(e) => setTrField(activeLocale, 'longDesc', e.target.value)}
            />
          </Field>

          <div className="grid md:grid-cols-2 gap-3">
            <Field label="Meta Title (SEO)">
              <Input
                value={translations[trIdx(activeLocale)].metaTitle}
                onChange={(e) => setTrField(activeLocale, 'metaTitle', e.target.value)}
              />
            </Field>
            <Field label="Meta Description (SEO)">
              <Input
                value={translations[trIdx(activeLocale)].metaDesc}
                onChange={(e) => setTrField(activeLocale, 'metaDesc', e.target.value)}
              />
            </Field>
          </div>
        </CardContent>
      </Card>

      {/* Trip Details */}
      <Card>
        <CardHeader><CardTitle>تفاصيل الرحلة</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-3">
            <Field label="الفئة">
              <select className="h-11 w-full rounded-lg border border-input bg-white px-3" value={category} onChange={(e) => setCategory(e.target.value as typeof CATEGORIES[number])}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="المدة (بالدقائق)">
              <Input type="number" value={durationMinutes} onChange={(e) => setDurationMinutes(Number(e.target.value))} />
            </Field>
            <Field label="وقت البدء (HH:MM)">
              <Input value={startTime} onChange={(e) => setStartTime(e.target.value)} placeholder="09:00" />
            </Field>
          </div>
          <Field label="نقطة الالتقاء">
            <Input value={meetingPoint} onChange={(e) => setMeetingPoint(e.target.value)} placeholder="فندق الإقامة - شرم الشيخ" />
          </Field>
          <div className="grid md:grid-cols-3 gap-3">
            <Field label="السعر للمصريين (ج.م)"><Input type="number" value={priceLocalEGP} onChange={(e) => setPriceLocalEGP(Number(e.target.value))} /></Field>
            <Field label="السعر للأجانب ($)"><Input type="number" value={priceForeignUSD} onChange={(e) => setPriceForeignUSD(Number(e.target.value))} /></Field>
            <Field label="خصم الأطفال (%)"><Input type="number" value={childDiscount} onChange={(e) => setChildDiscount(Number(e.target.value))} /></Field>
          </div>
          <div className="flex gap-6">
            <label className="flex items-center gap-2"><input type="checkbox" className="w-4 h-4 accent-primary" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} /> رحلة نشطة</label>
            <label className="flex items-center gap-2"><input type="checkbox" className="w-4 h-4 accent-primary" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} /> رحلة مميزة</label>
          </div>
        </CardContent>
      </Card>

      {/* Hero Image + Gallery */}
      <Card>
        <CardHeader><CardTitle>الصورة الرئيسية والمعرض</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <MediaPicker label="الصورة الرئيسية (Hero)" mode="single" value={heroImage} onChange={(m) => setHeroImage(m as MediaDTO | null)} />
          <MediaPicker label="معرض الصور" mode="multi" value={gallery} onChange={(m) => setGallery(m as MediaDTO[])} />
        </CardContent>
      </Card>

      {/* Highlights */}
      <Card>
        <CardHeader><CardTitle>أبرز المعالم</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {highlights.map((h, i) => (
            <div key={i} className="border rounded-lg p-3 bg-muted/20">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-bold text-primary text-sm">#{i + 1}</span>
                <Button size="icon" variant="ghost" type="button" onClick={() => moveItem(highlights, i, -1, setHighlights)}><ChevronUp className="h-4 w-4" /></Button>
                <Button size="icon" variant="ghost" type="button" onClick={() => moveItem(highlights, i, 1, setHighlights)}><ChevronDown className="h-4 w-4" /></Button>
                <Button size="sm" variant="outline" type="button" onClick={() => translateHighlight(i)}>
                  <Sparkles className="h-3.5 w-3.5" /> ترجم
                </Button>
                <Button size="icon" variant="ghost" type="button" onClick={() => setHighlights((p) => p.filter((_, x) => x !== i))}>
                  <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
              </div>
              <div className="grid md:grid-cols-2 gap-2">
                {h.translations.map((tr) => (
                  <Input
                    key={tr.locale}
                    placeholder={tr.locale}
                    value={tr.text}
                    onChange={(e) => setHighlights((prev) => prev.map((hh, idx) => idx === i ? { ...hh, translations: hh.translations.map((tt) => tt.locale === tr.locale ? { ...tt, text: e.target.value } : tt) } : hh))}
                  />
                ))}
              </div>
            </div>
          ))}
          <Button variant="outline" type="button" onClick={() => setHighlights((p) => [...p, { order: p.length, translations: LOCALES.map((l) => ({ locale: l.code, text: '' })) }])}>
            <Plus className="h-4 w-4" /> أضف معلم
          </Button>
        </CardContent>
      </Card>

      {/* Bullets */}
      {BULLETS.map((bulletType) => {
        const label = bulletType === 'INCLUDE' ? 'ما يشمله السعر' : bulletType === 'EXCLUDE' ? 'ما لا يشمله السعر' : 'ما يجب إحضاره';
        const list = bullets.map((b, i) => ({ b, i })).filter(({ b }) => b.type === bulletType);
        return (
          <Card key={bulletType}>
            <CardHeader><CardTitle>{label}</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {list.map(({ b, i }) => (
                <div key={i} className="border rounded-lg p-3 bg-muted/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Button size="sm" variant="outline" type="button" onClick={() => translateBullet(i)}>
                      <Sparkles className="h-3.5 w-3.5" /> ترجم
                    </Button>
                    <Button size="icon" variant="ghost" type="button" onClick={() => setBullets((p) => p.filter((_, x) => x !== i))}>
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                  <div className="grid md:grid-cols-2 gap-2">
                    {b.translations.map((tr) => (
                      <Input
                        key={tr.locale}
                        placeholder={tr.locale}
                        value={tr.text}
                        onChange={(e) => setBullets((prev) => prev.map((bb, idx) => idx === i ? { ...bb, translations: bb.translations.map((tt) => tt.locale === tr.locale ? { ...tt, text: e.target.value } : tt) } : bb))}
                      />
                    ))}
                  </div>
                </div>
              ))}
              <Button variant="outline" type="button" onClick={() => setBullets((p) => [...p, { type: bulletType, order: p.length, translations: LOCALES.map((l) => ({ locale: l.code, text: '' })) }])}>
                <Plus className="h-4 w-4" /> أضف بند
              </Button>
            </CardContent>
          </Card>
        );
      })}

      <div className="flex justify-end gap-2 sticky bottom-2 bg-white p-3 rounded-xl border shadow-lg">
        <Button variant="outline" onClick={() => router.push('/admin/trips')}>إلغاء</Button>
        <Button onClick={save} disabled={pending}><Save className="h-4 w-4" /> {pending ? 'جاري الحفظ...' : 'حفظ'}</Button>
      </div>
    </div>
  );
}

function Field({ label, children, translateBtn }: { label: string; children: React.ReactNode; translateBtn?: React.ReactNode | false }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="block text-sm font-semibold">{label}</label>
        {translateBtn}
      </div>
      {children}
    </div>
  );
}
