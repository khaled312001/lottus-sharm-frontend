'use client';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import { useAdminAuth } from '@/lib/admin-auth';
import { Send, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

interface EmailStatus {
  configured: boolean;
  host: string | null;
  port: number | null;
  secure: boolean | null;
  from: string;
  admin: string;
}

export default function EmailSettingsPage() {
  const { token } = useAdminAuth();
  const [status, setStatus] = useState<EmailStatus | null>(null);
  const [to, setTo] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  useEffect(() => {
    if (!token) return;
    api.get<EmailStatus>('/admin/email/status', { token: token || undefined })
      .then(setStatus)
      .catch(() => setStatus(null));
  }, [token]);

  async function sendTest(e: React.FormEvent) {
    e.preventDefault();
    if (!to) return;
    setBusy(true); setMsg(null);
    try {
      await api.post('/admin/email/test', { to }, { token: token || undefined });
      setMsg({ kind: 'ok', text: `تم إرسال رسالة الاختبار إلى ${to}. تحقق من البريد (وانظر في Spam لو ما لاحظتها).` });
    } catch (err) {
      setMsg({ kind: 'err', text: err instanceof Error ? err.message : 'فشل الإرسال' });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold mb-1">إعدادات البريد</h1>
        <p className="text-sm text-muted-foreground">حالة الـ SMTP المُكوَّن على السيرفر، وأداة اختبار الإرسال.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            {status?.configured ? <CheckCircle2 className="h-5 w-5 text-emerald-600" /> : <XCircle className="h-5 w-5 text-rose-600" />}
            حالة الاتصال
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!status ? (
            <div className="text-sm text-muted-foreground flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> جاري التحميل…</div>
          ) : (
            <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <Row label="مُكوَّن" value={status.configured ? 'نعم' : 'لا — SMTP_HOST/USER/PASS مفقود'} />
              <Row label="الخادم" value={status.host || '—'} />
              <Row label="المنفذ" value={status.port ? String(status.port) : '—'} />
              <Row label="SSL" value={status.secure === null ? '—' : status.secure ? 'نعم' : 'لا'} />
              <Row label="From" value={status.from} />
              <Row label="Admin" value={status.admin} />
            </dl>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">إرسال رسالة اختبار</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={sendTest} className="space-y-3">
            <div>
              <label htmlFor="to" className="block text-sm font-medium mb-1.5">البريد المستلم</label>
              <Input id="to" type="email" required value={to} onChange={(e) => setTo(e.target.value)} placeholder="me@example.com" />
            </div>
            <Button type="submit" disabled={busy || !status?.configured} className="gap-2">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              إرسال
            </Button>
            {msg && (
              <div className={msg.kind === 'ok'
                ? 'text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md p-3'
                : 'text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-md p-3'}>
                {msg.text}
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">إيميلات تلقائية مُفعَّلة</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-sm space-y-2 list-disc ps-5">
            <li>حجز جديد → تأكيد للعميل + إشعار للأدمن</li>
            <li>تأكيد حجز من الأدمن → بريد تأكيد للعميل</li>
            <li>رسالة من نموذج التواصل → إشعار للأدمن + رد تلقائي للعميل</li>
            <li>اشتراك في النشرة → بريد ترحيب</li>
            <li>تقييم جديد من عميل → إشعار للأدمن للمراجعة</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </>
  );
}
