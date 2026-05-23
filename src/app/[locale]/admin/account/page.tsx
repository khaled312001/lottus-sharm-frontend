'use client';

import { useState } from 'react';
import { useAdminApi, useAdminAuth } from '@/lib/admin-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Lock, Save, Eye, EyeOff, ShieldCheck, Loader2, UserCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminAccountPage() {
  const api = useAdminApi();
  const { user: admin } = useAdminAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [show, setShow] = useState<{ cur: boolean; nw: boolean; cf: boolean }>({ cur: false, nw: false, cf: false });
  const [saving, setSaving] = useState(false);

  const strength = (() => {
    let s = 0;
    if (newPassword.length >= 8) s++;
    if (newPassword.length >= 12) s++;
    if (/[a-z]/.test(newPassword) && /[A-Z]/.test(newPassword)) s++;
    if (/\d/.test(newPassword)) s++;
    if (/[^A-Za-z0-9]/.test(newPassword)) s++;
    return s; // 0-5
  })();
  const strengthLabel = ['ضعيفة جداً', 'ضعيفة', 'متوسطة', 'قوية', 'قوية جداً', 'ممتازة'][strength];
  const strengthColor = ['bg-red-500', 'bg-red-400', 'bg-amber-500', 'bg-emerald-500', 'bg-emerald-600', 'bg-emerald-700'][strength];

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) return toast.error('كلمة المرور الجديدة 8 أحرف على الأقل');
    if (newPassword !== confirmPassword) return toast.error('كلمة المرور الجديدة وتأكيدها غير متطابقتين');
    if (currentPassword === newPassword) return toast.error('كلمة المرور الجديدة لا يمكن أن تطابق القديمة');
    setSaving(true);
    try {
      await api.post('/admin/users/me/password', { currentPassword, newPassword });
      toast.success('تم تحديث كلمة المرور بنجاح');
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'حدث خطأ');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold inline-flex items-center gap-2">
          <UserCircle className="h-6 w-6 text-accent" /> حسابي
        </h2>
        <p className="text-sm text-muted-foreground mt-0.5">إعدادات حسابك الشخصي وكلمة المرور</p>
      </div>

      {/* Profile card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base inline-flex items-center gap-2">
            <UserCircle className="h-4 w-4 text-accent" /> ملفي الشخصي
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <Row label="الاسم" value={admin?.name || '—'} />
          <Row label="البريد الإلكتروني" value={admin?.email || '—'} ltr />
          <Row label="الصلاحية" value={admin?.role === 'SUPER_ADMIN' ? 'مدير عام' : 'محرر'} />
        </CardContent>
      </Card>

      {/* Change password card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base inline-flex items-center gap-2">
            <Lock className="h-4 w-4 text-accent" /> تغيير كلمة المرور
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-3">
            <PwField
              label="كلمة المرور الحالية"
              value={currentPassword} onChange={setCurrentPassword}
              show={show.cur} toggle={() => setShow((s) => ({ ...s, cur: !s.cur }))}
              autoComplete="current-password"
            />
            <PwField
              label="كلمة المرور الجديدة"
              value={newPassword} onChange={setNewPassword}
              show={show.nw} toggle={() => setShow((s) => ({ ...s, nw: !s.nw }))}
              autoComplete="new-password"
            />

            {newPassword && (
              <div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div className={`h-full transition-all ${strengthColor}`} style={{ width: `${(strength / 5) * 100}%` }} />
                </div>
                <div className="text-[11px] mt-1 font-semibold text-muted-foreground inline-flex items-center gap-1.5">
                  <ShieldCheck className="h-3 w-3" />
                  قوة كلمة المرور: {strengthLabel}
                </div>
              </div>
            )}

            <PwField
              label="تأكيد كلمة المرور الجديدة"
              value={confirmPassword} onChange={setConfirmPassword}
              show={show.cf} toggle={() => setShow((s) => ({ ...s, cf: !s.cf }))}
              autoComplete="new-password"
              error={confirmPassword.length > 0 && confirmPassword !== newPassword ? 'غير مطابق' : undefined}
            />

            <div className="text-[11px] text-muted-foreground bg-muted/40 rounded-md p-2.5 leading-relaxed">
              <strong className="text-foreground">نصائح للأمان:</strong> استخدم 12 حرفاً أو أكثر، اخلط بين الحروف الكبيرة والصغيرة والأرقام والرموز. لا تستخدم نفس كلمة المرور في مواقع أخرى.
            </div>

            <div className="flex justify-end pt-2 border-t">
              <Button type="submit" disabled={saving || !currentPassword || !newPassword || newPassword !== confirmPassword}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                حفظ كلمة المرور الجديدة
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ label, value, ltr }: { label: string; value: string; ltr?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5 border-b last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold" {...(ltr ? { dir: 'ltr' as const } : {})}>{value}</span>
    </div>
  );
}

function PwField({
  label, value, onChange, show, toggle, autoComplete, error,
}: {
  label: string; value: string; onChange: (v: string) => void;
  show: boolean; toggle: () => void; autoComplete: string; error?: string;
}) {
  return (
    <div>
      <label className="text-xs font-bold mb-1.5 block">{label} *</label>
      <div className="relative">
        <Input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          dir="ltr"
          className="pe-10 font-mono"
        />
        <button
          type="button"
          onClick={toggle}
          className="absolute end-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md hover:bg-muted text-muted-foreground"
          aria-label={show ? 'إخفاء' : 'إظهار'}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {error && <div className="text-[11px] text-red-600 mt-1 font-semibold">{error}</div>}
    </div>
  );
}
