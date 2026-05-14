'use client';

import { useEffect, useState, useTransition } from 'react';
import { useAdminApi } from '@/lib/admin-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input, Textarea } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';
import { toast } from 'sonner';
import type { SiteSettingsDTO } from '@/types/api';

export default function AdminSettingsPage() {
  const api = useAdminApi();
  const [s, setS] = useState<SiteSettingsDTO | null>(null);
  const [pending, start] = useTransition();

  useEffect(() => {
    api.get<SiteSettingsDTO>('/public/settings').then(setS).catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!s) return <div className="py-12 text-center">جاري التحميل...</div>;

  const upd = <K extends keyof SiteSettingsDTO>(k: K, v: SiteSettingsDTO[K]) => setS({ ...s, [k]: v });

  const save = () => {
    start(async () => {
      try {
        await api.patch('/admin/settings', s);
        toast.success('تم الحفظ');
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Error');
      }
    });
  };

  return (
    <div className="space-y-4 max-w-4xl">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">إعدادات الموقع</h2>
        <Button onClick={save} disabled={pending}><Save className="h-4 w-4" /> حفظ</Button>
      </div>

      <Card>
        <CardHeader><CardTitle>اسم الشركة</CardTitle></CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-3">
          <F label="عربي"><Input value={s.companyNameAr} onChange={(e) => upd('companyNameAr', e.target.value)} /></F>
          <F label="English"><Input value={s.companyNameEn} onChange={(e) => upd('companyNameEn', e.target.value)} /></F>
          <F label="Русский"><Input value={s.companyNameRu} onChange={(e) => upd('companyNameRu', e.target.value)} /></F>
          <F label="Italiano"><Input value={s.companyNameIt} onChange={(e) => upd('companyNameIt', e.target.value)} /></F>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>الشعار (Tagline)</CardTitle></CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-3">
          <F label="عربي"><Textarea rows={2} value={s.taglineAr} onChange={(e) => upd('taglineAr', e.target.value)} /></F>
          <F label="English"><Textarea rows={2} value={s.taglineEn} onChange={(e) => upd('taglineEn', e.target.value)} /></F>
          <F label="Русский"><Textarea rows={2} value={s.taglineRu} onChange={(e) => upd('taglineRu', e.target.value)} /></F>
          <F label="Italiano"><Textarea rows={2} value={s.taglineIt} onChange={(e) => upd('taglineIt', e.target.value)} /></F>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>التواصل</CardTitle></CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-3">
          <F label="هاتف"><Input value={s.phone} onChange={(e) => upd('phone', e.target.value)} /></F>
          <F label="واتساب (مع كود الدولة)"><Input value={s.whatsapp} onChange={(e) => upd('whatsapp', e.target.value)} /></F>
          <F label="إيميل"><Input type="email" value={s.email || ''} onChange={(e) => upd('email', e.target.value)} /></F>
          <F label="سنوات الخبرة"><Input type="number" value={s.yearsExperience} onChange={(e) => upd('yearsExperience', Number(e.target.value))} /></F>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>السوشيال ميديا</CardTitle></CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-3">
          <F label="Facebook"><Input value={s.facebookUrl || ''} onChange={(e) => upd('facebookUrl', e.target.value)} /></F>
          <F label="Instagram"><Input value={s.instagramUrl || ''} onChange={(e) => upd('instagramUrl', e.target.value)} /></F>
          <F label="TikTok"><Input value={s.tiktokUrl || ''} onChange={(e) => upd('tiktokUrl', e.target.value)} /></F>
          <F label="YouTube"><Input value={s.youtubeUrl || ''} onChange={(e) => upd('youtubeUrl', e.target.value)} /></F>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>بيانات الدفع</CardTitle></CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-3">
          <F label="اسم البنك"><Input value={s.bankName || ''} onChange={(e) => upd('bankName', e.target.value)} /></F>
          <F label="رقم الحساب"><Input value={s.bankAccount || ''} onChange={(e) => upd('bankAccount', e.target.value)} /></F>
          <F label="فودافون كاش"><Input value={s.vodafoneCash || ''} onChange={(e) => upd('vodafoneCash', e.target.value)} /></F>
          <F label="InstaPay"><Input value={s.instaPay || ''} onChange={(e) => upd('instaPay', e.target.value)} /></F>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>الألوان</CardTitle></CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-3">
          <F label="اللون الأساسي"><Input value={s.primaryColor} onChange={(e) => upd('primaryColor', e.target.value)} placeholder="#0891b2" /></F>
          <F label="لون التمييز"><Input value={s.accentColor} onChange={(e) => upd('accentColor', e.target.value)} placeholder="#f59e0b" /></F>
        </CardContent>
      </Card>
    </div>
  );
}

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="block text-sm font-semibold mb-1.5">{label}</label>{children}</div>;
}
