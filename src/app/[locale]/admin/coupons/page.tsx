'use client';

import { useEffect, useState } from 'react';
import { useAdminApi } from '@/lib/admin-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Sparkles, Power, PowerOff } from 'lucide-react';
import { toast } from 'sonner';

interface Coupon {
  id: number;
  code: string;
  discountType: 'PERCENT' | 'FIXED';
  discountValue: string;
  validFrom: string;
  validUntil: string;
  maxUses?: number | null;
  usedCount: number;
  isActive: boolean;
  isAutoApply?: boolean;
}

export default function AdminCouponsPage() {
  const api = useAdminApi();
  const [items, setItems] = useState<Coupon[]>([]);
  const [form, setForm] = useState({
    code: '',
    discountType: 'PERCENT' as 'PERCENT' | 'FIXED',
    discountValue: 10,
    validFrom: new Date().toISOString().slice(0, 10),
    validUntil: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
    maxUses: '',
    isAutoApply: false,
  });

  const load = async () => {
    try {
      const res = await api.get<{ items: Coupon[] }>('/admin/coupons');
      setItems(res.items);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error');
    }
  };

  useEffect(() => { void load(); /* eslint-disable-next-line */ }, []);

  const create = async () => {
    try {
      await api.post('/admin/coupons', {
        code: form.code,
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
        validFrom: form.validFrom,
        validUntil: form.validUntil,
        maxUses: form.maxUses ? Number(form.maxUses) : undefined,
        isAutoApply: form.isAutoApply,
      });
      toast.success(form.isAutoApply ? 'تمت إضافة الكوبون — مفعّل تلقائياً على الموقع' : 'تمت إضافة الكوبون');
      setForm({ ...form, code: '', isAutoApply: false });
      void load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error');
    }
  };

  const toggleAuto = async (c: Coupon) => {
    try {
      await api.patch(`/admin/coupons/${c.id}`, { isAutoApply: !c.isAutoApply });
      toast.success(!c.isAutoApply ? 'مفعّل تلقائياً' : 'تم إلغاء التطبيق التلقائي');
      void load();
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Error'); }
  };

  const del = async (id: number) => {
    if (!confirm('حذف الكوبون؟')) return;
    try {
      await api.delete(`/admin/coupons/${id}`);
      void load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error');
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">كوبونات الخصم</h2>

      <Card>
        <CardHeader><CardTitle>إضافة كوبون</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <Input placeholder="الكود (SUMMER25)" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} />
          <select className="h-11 rounded-lg border px-3" value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value as 'PERCENT' | 'FIXED' })}>
            <option value="PERCENT">نسبة %</option>
            <option value="FIXED">قيمة ثابتة</option>
          </select>
          <Input type="number" placeholder="القيمة" value={form.discountValue} onChange={(e) => setForm({ ...form, discountValue: Number(e.target.value) })} />
          <Input type="date" value={form.validFrom} onChange={(e) => setForm({ ...form, validFrom: e.target.value })} />
          <Input type="date" value={form.validUntil} onChange={(e) => setForm({ ...form, validUntil: e.target.value })} />
          <Button onClick={create}><Plus className="h-4 w-4" /> إضافة</Button>

          {/* Auto-apply toggle — spans full row, prominent */}
          <label className="md:col-span-3 lg:col-span-6 flex items-start gap-3 p-3 rounded-lg border border-accent/30 bg-accent/5 cursor-pointer hover:bg-accent/10 transition-colors">
            <input
              type="checkbox"
              checked={form.isAutoApply}
              onChange={(e) => setForm({ ...form, isAutoApply: e.target.checked })}
              className="mt-1 w-4 h-4 accent-primary"
            />
            <div className="flex-1">
              <div className="text-sm font-bold inline-flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-accent" /> تطبيق تلقائي على الموقع
              </div>
              <div className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                لو فعّلت ده، الخصم هيظهر كـ <strong className="text-accent-700">بانر علوي</strong> في كل صفحات الموقع، وهيتطبّق <strong className="text-accent-700">تلقائياً</strong> على أي حجز بدون ما العميل يكتب الكود.
              </div>
            </div>
          </label>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr>
                <th className="py-3 px-3 text-right">الكود</th>
                <th className="py-3 px-3 text-right">الخصم</th>
                <th className="py-3 px-3 text-right">من</th>
                <th className="py-3 px-3 text-right">حتى</th>
                <th className="py-3 px-3 text-right">الاستخدامات</th>
                <th className="py-3 px-3 text-right">الحالة</th>
                <th className="py-3 px-3 text-right">تطبيق تلقائي</th>
                <th className="py-3 px-3 text-right">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr><td colSpan={8} className="py-12 text-center text-muted-foreground">لا توجد كوبونات</td></tr>
              ) : items.map((c) => (
                <tr key={c.id} className={`border-t hover:bg-muted/20 ${c.isAutoApply ? 'bg-accent/5' : ''}`}>
                  <td className="py-2 px-3 font-mono font-bold inline-flex items-center gap-1.5">
                    {c.isAutoApply && <Sparkles className="h-3.5 w-3.5 text-accent" />}
                    {c.code}
                  </td>
                  <td className="py-2 px-3">{c.discountValue}{c.discountType === 'PERCENT' ? '%' : ' ج.م'}</td>
                  <td className="py-2 px-3 text-xs">{new Date(c.validFrom).toLocaleDateString('ar-EG')}</td>
                  <td className="py-2 px-3 text-xs">{new Date(c.validUntil).toLocaleDateString('ar-EG')}</td>
                  <td className="py-2 px-3">{c.usedCount}{c.maxUses ? `/${c.maxUses}` : ''}</td>
                  <td className="py-2 px-3"><Badge variant={c.isActive ? 'default' : 'secondary'}>{c.isActive ? 'نشط' : 'غير نشط'}</Badge></td>
                  <td className="py-2 px-3">
                    <button
                      onClick={() => toggleAuto(c)}
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-bold border transition-colors ${
                        c.isAutoApply ? 'bg-accent text-primary border-accent' : 'bg-white border-accent/20 text-muted-foreground hover:bg-accent/10'
                      }`}
                      title={c.isAutoApply ? 'مفعّل — اضغط للإلغاء' : 'اضغط للتفعيل التلقائي'}
                    >
                      {c.isAutoApply ? <><Power className="h-3 w-3" /> مفعّل</> : <><PowerOff className="h-3 w-3" /> متوقف</>}
                    </button>
                  </td>
                  <td className="py-2 px-3"><Button size="icon" variant="ghost" onClick={() => del(c.id)}><Trash2 className="h-4 w-4 text-red-600" /></Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
