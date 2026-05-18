'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter } from '@/i18n/routing';
import { Input, Textarea } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Save, ChevronUp, ChevronDown, Clock } from 'lucide-react';
import { useAdminApi } from '@/lib/admin-auth';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { MediaPicker } from './media-picker';
import { RichTextEditor } from './rich-text-editor';
import type { TripDTO, MediaDTO, ApiLocale } from '@/types/api';

const TIMELINE_ICONS = [
  { value: 'bus',       label: '🚌 أتوبيس' },
  { value: 'map',       label: '🗺️ وصول' },
  { value: 'compass',   label: '🧭 جولة' },
  { value: 'fish',      label: '🐠 سنوركلينج' },
  { value: 'anchor',    label: '⚓ بحر' },
  { value: 'mountain',  label: '⛰️ جبل/صحراء' },
  { value: 'tree',      label: '🌳 طبيعة' },
  { value: 'camera',    label: '📷 تصوير' },
  { value: 'utensils',  label: '🍽️ وجبة' },
  { value: 'sun',       label: '☀️ نهار' },
  { value: 'sunrise',   label: '🌅 شروق' },
  { value: 'sparkles',  label: '✨ مفاجأة' },
];

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

interface TimelineStepForm {
  order: number;
  time: string;
  icon: string;
  translations: { locale: ApiLocale; title: string; desc: string }[];
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

  const [timeline, setTimeline] = useState<TimelineStepForm[]>(() => {
    if (!initialTrip?.timeline) return [];
    return initialTrip.timeline.map((s) => ({
      order: s.order,
      time: s.time || '',
      icon: s.icon || 'sparkles',
      translations: LOCALES.map((l) => {
        const tr = s.translations.find((x) => x.locale === l.code);
        return { locale: l.code, title: tr?.title || '', desc: tr?.desc || '' };
      }),
    }));
  });

  const trIdx = (loc: ApiLocale) => translations.findIndex((t) => t.locale === loc);
  const setTrField = (loc: ApiLocale, field: keyof TranslationForm, value: string) => {
    setTranslations((prev) => prev.map((t) => (t.locale === loc ? { ...t, [field]: value } : t)));
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
      timeline: timeline
        .filter((s) => s.translations.find((x) => x.locale === 'AR')?.title?.trim())
        .map((s, i) => ({
          order: i,
          time: s.time || undefined,
          icon: s.icon || undefined,
          translations: s.translations
            .filter((tr) => tr.title.trim())
            .map((tr) => ({ locale: tr.locale, title: tr.title, desc: tr.desc || undefined })),
        })),
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
    <div className="space-y-6 max-w-5xl pb-28">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{initialTrip ? 'تعديل رحلة' : 'إضافة رحلة جديدة'}</h2>
        {initialTrip && (
          <span className="text-xs text-muted-foreground hidden md:inline-flex items-center gap-1.5">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            استخدم زر الحفظ العائم بالأسفل
          </span>
        )}
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
          <Field label="عنوان الرحلة">
            <Input
              value={translations[trIdx(activeLocale)].title}
              onChange={(e) => setTrField(activeLocale, 'title', e.target.value)}
            />
          </Field>

          <Field label="وصف قصير">
            <Textarea
              rows={3}
              value={translations[trIdx(activeLocale)].shortDesc}
              onChange={(e) => setTrField(activeLocale, 'shortDesc', e.target.value)}
            />
          </Field>

          <Field label="الوصف الكامل">
            <RichTextEditor
              value={translations[trIdx(activeLocale)].longDesc}
              onChange={(html) => setTrField(activeLocale, 'longDesc', html)}
              rtl={activeLocale === 'AR'}
              placeholder={activeLocale === 'AR' ? 'اكتب وصفاً تفصيلياً للرحلة...' : 'Write a detailed description...'}
              minHeight={320}
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

      {/* Timeline / Itinerary — ساعة بساعة طوال اليوم */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-accent" />
            <span>سير الرحلة (ساعة بساعة)</span>
            {timeline.length > 0 && (
              <span className="text-xs font-normal text-muted-foreground">— {timeline.length} مرحلة</span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {timeline.length === 0 && (
            <p className="text-sm text-muted-foreground bg-muted/30 rounded-lg p-3 border border-dashed">
              لم تُضف مراحل بعد. اضغط "أضف مرحلة" لإنشاء أول خطوة في برنامج الرحلة (مثلاً: <strong>08:00 — التقاط من الفندق</strong>).
            </p>
          )}

          {timeline.map((step, i) => (
            <div key={i} className="border rounded-xl p-4 bg-gradient-to-br from-muted/30 to-white space-y-3">
              {/* Row 1: order indicator + time + icon + actions */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-accent text-primary font-bold text-sm shrink-0">
                  {i + 1}
                </span>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <Input
                    type="time"
                    className="w-32"
                    value={step.time}
                    onChange={(e) => setTimeline((p) => p.map((s, x) => x === i ? { ...s, time: e.target.value } : s))}
                  />
                </div>
                <select
                  className="h-11 rounded-lg border border-input bg-white px-3 text-sm"
                  value={step.icon}
                  onChange={(e) => setTimeline((p) => p.map((s, x) => x === i ? { ...s, icon: e.target.value } : s))}
                >
                  {TIMELINE_ICONS.map((ic) => (
                    <option key={ic.value} value={ic.value}>{ic.label}</option>
                  ))}
                </select>
                <div className="ms-auto flex items-center gap-1">
                  <Button size="icon" variant="ghost" type="button" title="نقل لأعلى" onClick={() => moveItem(timeline, i, -1, setTimeline)}>
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" type="button" title="نقل لأسفل" onClick={() => moveItem(timeline, i, 1, setTimeline)}>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" type="button" title="حذف المرحلة" onClick={() => setTimeline((p) => p.filter((_, x) => x !== i))}>
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </div>

              {/* Row 2: AR title + AR desc + translate */}
              <div className="grid md:grid-cols-[1fr_2fr_auto] gap-2 items-start">
                <Input
                  placeholder="العنوان بالعربية (مثلاً: التقاط من الفندق)"
                  value={step.translations.find((t) => t.locale === 'AR')?.title || ''}
                  onChange={(e) => setTimeline((p) => p.map((s, x) => x === i ? {
                    ...s,
                    translations: s.translations.map((tr) => tr.locale === 'AR' ? { ...tr, title: e.target.value } : tr),
                  } : s))}
                />
                <Textarea
                  rows={2}
                  placeholder="الوصف بالعربية (اختياري)"
                  value={step.translations.find((t) => t.locale === 'AR')?.desc || ''}
                  onChange={(e) => setTimeline((p) => p.map((s, x) => x === i ? {
                    ...s,
                    translations: s.translations.map((tr) => tr.locale === 'AR' ? { ...tr, desc: e.target.value } : tr),
                  } : s))}
                />
              </div>

              {/* Row 3: Other locales — collapsed by default */}
              <details className="group">
                <summary className="cursor-pointer text-xs font-semibold text-muted-foreground hover:text-primary inline-flex items-center gap-1.5">
                  <ChevronDown className="h-3.5 w-3.5 group-open:rotate-180 transition-transform" />
                  ترجمات EN / RU / IT
                </summary>
                <div className="mt-3 space-y-2">
                  {step.translations.filter((tr) => tr.locale !== 'AR').map((tr) => (
                    <div key={tr.locale} className="grid md:grid-cols-[80px_1fr_2fr] gap-2 items-start">
                      <span className="text-xs font-bold uppercase text-muted-foreground self-center">{tr.locale}</span>
                      <Input
                        placeholder={`Title (${tr.locale})`}
                        value={tr.title}
                        onChange={(e) => setTimeline((p) => p.map((s, x) => x === i ? {
                          ...s,
                          translations: s.translations.map((ot) => ot.locale === tr.locale ? { ...ot, title: e.target.value } : ot),
                        } : s))}
                      />
                      <Textarea
                        rows={2}
                        placeholder={`Description (${tr.locale}) — optional`}
                        value={tr.desc}
                        onChange={(e) => setTimeline((p) => p.map((s, x) => x === i ? {
                          ...s,
                          translations: s.translations.map((ot) => ot.locale === tr.locale ? { ...ot, desc: e.target.value } : ot),
                        } : s))}
                      />
                    </div>
                  ))}
                </div>
              </details>
            </div>
          ))}

          <Button
            variant="outline"
            type="button"
            className="w-full justify-center"
            onClick={() => setTimeline((p) => [...p, {
              order: p.length,
              time: '',
              icon: 'sparkles',
              translations: LOCALES.map((l) => ({ locale: l.code, title: '', desc: '' })),
            }])}
          >
            <Plus className="h-4 w-4" /> أضف مرحلة جديدة
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

      {/* Floating action bar — always visible, regardless of scroll */}
      <div className="fixed bottom-4 inset-x-4 md:inset-x-auto md:end-6 z-40 flex justify-end pointer-events-none">
        <div className="pointer-events-auto inline-flex items-center gap-2 bg-white/95 backdrop-blur-md p-2 rounded-2xl border border-accent/25 shadow-2xl shadow-primary-900/15">
          {pending && (
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-accent-700 px-3">
              <span className="inline-block w-2 h-2 rounded-full bg-accent animate-pulse" />
              جاري الحفظ...
            </span>
          )}
          <Button variant="outline" size="sm" onClick={() => router.push('/admin/trips')} disabled={pending}>
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-semibold mb-1.5">{label}</label>
      {children}
    </div>
  );
}
