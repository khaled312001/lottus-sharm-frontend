'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useAdminApi } from '@/lib/admin-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input, Textarea } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Save, Building2, Phone, Globe, CreditCard, Palette, Upload, X, Image as ImageIcon,
  Loader2, Facebook, Instagram, Youtube, MessageCircle, Mail, MapPin, ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';
import type { SiteSettingsDTO } from '@/types/api';
import { cn } from '@/lib/utils';

type Tab = 'identity' | 'contact' | 'social' | 'payment' | 'theme';

interface UploadedMedia {
  id: number;
  url: string;
  filename: string;
  type: 'IMAGE' | 'VIDEO';
}

export default function AdminSettingsPage() {
  const api = useAdminApi();
  const [s, setS] = useState<SiteSettingsDTO | null>(null);
  const [tab, setTab] = useState<Tab>('identity');
  const [pending, start] = useTransition();
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    api.get<SiteSettingsDTO>('/public/settings').then(setS).catch((e) => toast.error(e.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!s) {
    return (
      <div className="py-24 text-center text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
        جاري تحميل الإعدادات...
      </div>
    );
  }

  const upd = <K extends keyof SiteSettingsDTO>(k: K, v: SiteSettingsDTO[K]) => {
    setS({ ...s, [k]: v });
    setDirty(true);
  };

  const save = () => {
    start(async () => {
      try {
        await api.patch('/admin/settings', s);
        toast.success('تم حفظ الإعدادات بنجاح');
        setDirty(false);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'فشل الحفظ');
      }
    });
  };

  const tabs: { id: Tab; label: string; icon: typeof Building2 }[] = [
    { id: 'identity', label: 'الهوية',       icon: Building2 },
    { id: 'contact',  label: 'التواصل',      icon: Phone },
    { id: 'social',   label: 'سوشيال ميديا',  icon: Globe },
    { id: 'payment',  label: 'الدفع',         icon: CreditCard },
    { id: 'theme',    label: 'الألوان',       icon: Palette },
  ];

  return (
    <div className="space-y-5 max-w-5xl pb-32">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold mb-1">إعدادات الموقع</h1>
          <p className="text-sm text-muted-foreground">عدّل هوية الموقع، بيانات التواصل، روابط السوشيال، وإعدادات الدفع.</p>
        </div>
        <Button onClick={save} disabled={pending || !dirty} className="gap-2 min-w-[120px]">
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {dirty ? 'حفظ التغييرات' : 'تم الحفظ'}
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 -mx-2 px-2 no-scrollbar">
        {tabs.map((tt) => {
          const Icon = tt.icon;
          const active = tab === tt.id;
          return (
            <button
              key={tt.id}
              onClick={() => setTab(tt.id)}
              className={cn(
                'shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap border-2',
                active
                  ? 'bg-primary text-cream border-primary shadow-lg shadow-primary/20'
                  : 'bg-white text-primary border-accent/25 hover:border-accent hover:bg-accent/5',
              )}
            >
              <Icon className="h-4 w-4" />
              {tt.label}
            </button>
          );
        })}
      </div>

      {/* IDENTITY TAB */}
      {tab === 'identity' && (
        <div className="space-y-4">
          {/* Logo + favicon uploads */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-accent" />
                الشعار وأيقونة الموقع
              </CardTitle>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-4">
              <MediaUploader
                label="الشعار الرئيسي (Logo)"
                value={s.logoUrl}
                onChange={(url) => upd('logoUrl', url)}
                aspectClass="aspect-square"
                hint="PNG/JPG/WebP — يفضل 512×512px"
              />
              <MediaUploader
                label="أيقونة الموقع (Favicon)"
                value={s.faviconUrl}
                onChange={(url) => upd('faviconUrl', url)}
                aspectClass="aspect-square max-w-[160px]"
                hint="PNG/ICO — 32×32 أو 64×64px"
              />
            </CardContent>
          </Card>

          {/* Company name (4 langs) */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">اسم الشركة (5 لغات)</CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-3">
              <F label="🇪🇬 عربي"><Input value={s.companyNameAr} onChange={(e) => upd('companyNameAr', e.target.value)} /></F>
              <F label="🇬🇧 English"><Input value={s.companyNameEn} onChange={(e) => upd('companyNameEn', e.target.value)} /></F>
              <F label="🇷🇺 Русский"><Input value={s.companyNameRu} onChange={(e) => upd('companyNameRu', e.target.value)} /></F>
              <F label="🇮🇹 Italiano"><Input value={s.companyNameIt} onChange={(e) => upd('companyNameIt', e.target.value)} /></F>
              <F label="🇩🇪 Deutsch"><Input value={s.companyNameDe || ''} onChange={(e) => upd('companyNameDe', e.target.value)} /></F>
            </CardContent>
          </Card>

          {/* Tagline (5 langs) */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">العبارة التسويقية (Tagline)</CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-3">
              <F label="🇪🇬 عربي"><Textarea rows={2} value={s.taglineAr} onChange={(e) => upd('taglineAr', e.target.value)} /></F>
              <F label="🇬🇧 English"><Textarea rows={2} value={s.taglineEn} onChange={(e) => upd('taglineEn', e.target.value)} /></F>
              <F label="🇷🇺 Русский"><Textarea rows={2} value={s.taglineRu} onChange={(e) => upd('taglineRu', e.target.value)} /></F>
              <F label="🇮🇹 Italiano"><Textarea rows={2} value={s.taglineIt} onChange={(e) => upd('taglineIt', e.target.value)} /></F>
              <F label="🇩🇪 Deutsch"><Textarea rows={2} value={s.taglineDe || ''} onChange={(e) => upd('taglineDe', e.target.value)} /></F>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">سنوات الخبرة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-3 items-start">
                <F label="عدد سنوات الخبرة (يظهر على الموقع)">
                  <Input type="number" min={1} max={100} value={s.yearsExperience}
                    onChange={(e) => upd('yearsExperience', Number(e.target.value))} />
                </F>
                <div className="bg-primary/5 border border-primary/15 rounded-xl p-4 text-sm">
                  <div className="text-muted-foreground mb-1">معاينة</div>
                  <div className="font-bold text-primary">خبرة {s.yearsExperience}+ سنة في تنظيم الرحلات</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* CONTACT TAB */}
      {tab === 'contact' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Phone className="h-4 w-4 text-accent" />
                أرقام التواصل
              </CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-3">
              <F label="رقم الهاتف (محلي)" hint="مثال: 01090767278">
                <Input value={s.phone} onChange={(e) => upd('phone', e.target.value)} dir="ltr" />
              </F>
              <F label="واتساب (دولي - مع كود الدولة بدون +)" hint="مثال: 201090767278">
                <Input value={s.whatsapp} onChange={(e) => upd('whatsapp', e.target.value)} dir="ltr" />
              </F>
              <F label="البريد الإلكتروني">
                <Input type="email" value={s.email || ''} onChange={(e) => upd('email', e.target.value || null)} dir="ltr" />
              </F>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="h-4 w-4 text-accent" />
                العنوان
              </CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-3">
              <F label="العنوان بالعربي">
                <Textarea rows={3} value={s.addressAr || ''} onChange={(e) => upd('addressAr', e.target.value || null)}
                  placeholder="شرم الشيخ، جنوب سيناء، مصر" />
              </F>
              <F label="Address (English)">
                <Textarea rows={3} value={s.addressEn || ''} onChange={(e) => upd('addressEn', e.target.value || null)}
                  placeholder="Sharm El Sheikh, South Sinai, Egypt" />
              </F>
            </CardContent>
          </Card>
        </div>
      )}

      {/* SOCIAL TAB */}
      {tab === 'social' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Globe className="h-4 w-4 text-accent" />
              روابط السوشيال ميديا
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <SocialField icon={Facebook}    color="#1877F2" label="Facebook"  value={s.facebookUrl}  onChange={(v) => upd('facebookUrl', v)} />
            <SocialField icon={Instagram}   color="#E4405F" label="Instagram" value={s.instagramUrl} onChange={(v) => upd('instagramUrl', v)} />
            <SocialField icon={MessageCircle} color="#000000" label="TikTok"  value={s.tiktokUrl}    onChange={(v) => upd('tiktokUrl', v)} />
            <SocialField icon={Youtube}     color="#FF0000" label="YouTube"   value={s.youtubeUrl}   onChange={(v) => upd('youtubeUrl', v)} />
          </CardContent>
        </Card>
      )}

      {/* PAYMENT TAB */}
      {tab === 'payment' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-accent" />
              بيانات الدفع (تظهر في صفحة الحجز اليدوي)
            </CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-3">
            <F label="اسم البنك">
              <Input value={s.bankName || ''} onChange={(e) => upd('bankName', e.target.value || null)} />
            </F>
            <F label="رقم الحساب البنكي">
              <Input value={s.bankAccount || ''} onChange={(e) => upd('bankAccount', e.target.value || null)} dir="ltr" />
            </F>
            <F label="رقم فودافون كاش" hint="نفس رقم الواتساب عادة">
              <Input value={s.vodafoneCash || ''} onChange={(e) => upd('vodafoneCash', e.target.value || null)} dir="ltr" />
            </F>
            <F label="InstaPay handle">
              <Input value={s.instaPay || ''} onChange={(e) => upd('instaPay', e.target.value || null)} dir="ltr" />
            </F>
          </CardContent>
        </Card>
      )}

      {/* THEME TAB */}
      {tab === 'theme' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Palette className="h-4 w-4 text-accent" />
              ألوان الموقع
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <ColorField label="اللون الأساسي" value={s.primaryColor} onChange={(v) => upd('primaryColor', v)} />
              <ColorField label="لون التمييز (Accent)" value={s.accentColor} onChange={(v) => upd('accentColor', v)} />
            </div>
            {/* Live preview card */}
            <div className="rounded-2xl overflow-hidden border-2 border-accent/15">
              <div className="px-5 py-4 text-white" style={{ background: `linear-gradient(135deg, ${s.primaryColor} 0%, ${s.primaryColor}dd 100%)` }}>
                <div className="text-xs uppercase tracking-[0.3em] opacity-80" style={{ color: s.accentColor }}>معاينة الألوان</div>
                <h3 className="font-serif text-xl font-bold mt-1">رحلة لا تُنسى مع لوتس شرم</h3>
              </div>
              <div className="px-5 py-4 bg-white flex items-center justify-between gap-3 flex-wrap">
                <div className="text-sm text-muted-foreground">السعر يبدأ من <strong className="text-foreground">1500 ج.م</strong></div>
                <button
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold transition-opacity hover:opacity-90"
                  style={{ background: s.accentColor, color: s.primaryColor }}
                  type="button"
                >
                  احجز الآن
                </button>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              💡 الألوان تُطبَّق على الموقع بعد رفع نسخة جديدة من الفرونت‑إند.
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sticky save bar (mobile-friendly) */}
      {dirty && (
        <div className="fixed bottom-0 inset-x-0 lg:inset-x-auto lg:end-6 lg:start-72 z-30 p-3 bg-white/95 backdrop-blur border-t border-accent/20 lg:rounded-2xl lg:border lg:shadow-2xl lg:bottom-6">
          <div className="flex items-center justify-between gap-3 max-w-5xl mx-auto">
            <span className="text-sm font-semibold text-amber-700">يوجد تغييرات لم تُحفظ بعد</span>
            <Button onClick={save} disabled={pending} className="gap-2">
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              حفظ
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function F({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-semibold mb-1.5 text-foreground">{label}</label>
      {children}
      {hint && <p className="text-[11px] text-muted-foreground mt-1">{hint}</p>}
    </div>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-sm font-semibold mb-1.5">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value || '#0d3a3a'}
          onChange={(e) => onChange(e.target.value)}
          className="h-11 w-14 rounded-lg border-2 border-accent/20 cursor-pointer"
        />
        <Input value={value} onChange={(e) => onChange(e.target.value)} dir="ltr" placeholder="#0d3a3a" />
      </div>
    </div>
  );
}

function SocialField({
  icon: Icon, color, label, value, onChange,
}: { icon: typeof Facebook; color: string; label: string; value: string | null | undefined; onChange: (v: string | null) => void }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex items-center justify-center w-11 h-11 rounded-xl text-white flex-shrink-0" style={{ background: color }}>
        <Icon className="h-5 w-5" />
      </span>
      <div className="flex-1">
        <label className="block text-xs font-semibold mb-1">{label}</label>
        <Input
          value={value || ''}
          onChange={(e) => onChange(e.target.value || null)}
          placeholder={`https://${label.toLowerCase()}.com/lotus_sharm`}
          dir="ltr"
        />
      </div>
      {value && (
        <a href={value} target="_blank" rel="noopener" className="text-muted-foreground hover:text-primary p-2" aria-label="Open">
          <ExternalLink className="h-4 w-4" />
        </a>
      )}
    </div>
  );
}

function MediaUploader({
  label, hint, value, onChange, aspectClass = 'aspect-video',
}: {
  label: string;
  hint?: string;
  value: string | null | undefined;
  onChange: (url: string | null) => void;
  aspectClass?: string;
}) {
  const api = useAdminApi();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function handlePick(files: FileList | null) {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file.type.startsWith('image/')) {
      toast.error('الرجاء اختيار صورة فقط');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('الحد الأقصى 5MB');
      return;
    }
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append('files', file);
      const res = await api.upload<{ items: UploadedMedia[] }>('/admin/media/upload', fd);
      const url = res.items[0]?.url;
      if (!url) throw new Error('لم يتم استلام رابط الصورة');
      onChange(url);
      toast.success('تم رفع الصورة');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'فشل الرفع');
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <div>
      <label className="block text-sm font-semibold mb-1.5">{label}</label>
      <div className={cn('relative rounded-xl border-2 border-dashed border-accent/30 bg-muted/30 overflow-hidden group', aspectClass)}>
        {value ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt={label} className="absolute inset-0 w-full h-full object-contain p-2" />
            <button
              type="button"
              onClick={() => onChange(null)}
              className="absolute top-2 end-2 w-8 h-8 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center shadow-lg"
              aria-label="Remove"
            >
              <X className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-semibold text-sm"
              disabled={busy}
            >
              {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : (<><Upload className="h-4 w-4 me-1.5" /> استبدال</>)}
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground hover:text-primary hover:bg-accent/5 transition-colors"
          >
            {busy ? <Loader2 className="h-6 w-6 animate-spin mb-2" /> : <Upload className="h-7 w-7 mb-2" />}
            <span className="text-sm font-semibold">{busy ? 'جاري الرفع...' : 'اضغط لرفع صورة'}</span>
            {hint && <span className="text-[11px] mt-1 opacity-70">{hint}</span>}
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handlePick(e.target.files)}
      />
      {hint && !value && <p className="text-[11px] text-muted-foreground mt-1">{hint}</p>}
    </div>
  );
}
