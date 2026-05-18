'use client';

import { useEffect, useState } from 'react';
import { useAdminApi } from '@/lib/admin-auth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, Loader2, Save, X, Trash2, Pencil, Car, Bus, Plane } from 'lucide-react';
import { toast } from 'sonner';

interface Translation { locale: 'AR' | 'EN'; name: string; shortDesc: string }
interface Transfer {
  id: number; slug: string; route: string; vehicleType: string;
  capacity: number; durationMinutes: number;
  priceLocalEGP: string; priceForeignUSD: string;
  isFeatured: boolean; isActive: boolean; sortOrder: number;
  translations: Translation[];
}

const ROUTES = ['AIRPORT_TO_HOTEL','HOTEL_TO_AIRPORT','STATION_TO_HOTEL','HOTEL_TO_STATION','CAIRO_SHARM_FLIGHT','SHARM_CAIRO_FLIGHT','INTRA_CITY','CUSTOM'];
const VEHICLES = ['SEDAN','MICROBUS','MINIBUS','COACH','FLIGHT'];

export default function AdminTransfersPage() {
  const api = useAdminApi();
  const [items, setItems] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Transfer | null>(null);
  const [creating, setCreating] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get<{ items: Transfer[] }>('/admin/transfers');
      setItems(res.items);
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Error'); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); /* eslint-disable-next-line */ }, []);

  const togglePatch = async (id: number, patch: Partial<Transfer>) => {
    try { await api.patch(`/admin/transfers/${id}`, patch); toast.success('تم'); void load(); }
    catch (e) { toast.error(e instanceof Error ? e.message : 'Error'); }
  };
  const del = async (id: number) => {
    if (!confirm('حذف هذه الخدمة؟')) return;
    try { await api.delete(`/admin/transfers/${id}`); toast.success('تم الحذف'); void load(); }
    catch (e) { toast.error(e instanceof Error ? e.message : 'Error'); }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">خدمات النقل والاستقبال <span className="text-sm font-normal text-muted-foreground">({items.length})</span></h2>
          <p className="text-xs text-muted-foreground mt-0.5">سيارة ملاكي · ميكروباص · أوتوبيس · طيران داخلي · تنقلات</p>
        </div>
        <Button onClick={() => setCreating(true)}><Plus className="h-4 w-4" /> إضافة خدمة</Button>
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          {loading ? (
            <div className="py-12 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>
          ) : items.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">لا توجد خدمات نقل</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-right">
                <tr>
                  <th className="py-3 px-3">الاسم</th>
                  <th className="py-3 px-3">الخط</th>
                  <th className="py-3 px-3">المركبة</th>
                  <th className="py-3 px-3">السعة</th>
                  <th className="py-3 px-3">المدة</th>
                  <th className="py-3 px-3">ج.م</th>
                  <th className="py-3 px-3">$</th>
                  <th className="py-3 px-3">الحالة</th>
                  <th className="py-3 px-3">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {items.map((t) => {
                  const ar = t.translations.find((x) => x.locale === 'AR') || t.translations[0];
                  const Icon = t.vehicleType === 'FLIGHT' ? Plane : t.vehicleType === 'SEDAN' ? Car : Bus;
                  return (
                    <tr key={t.id} className="border-t hover:bg-muted/20">
                      <td className="py-2 px-3">
                        <div className="font-bold inline-flex items-center gap-2"><Icon className="h-4 w-4 text-accent" /> {ar?.name || t.slug}</div>
                        <div className="text-[11px] text-muted-foreground line-clamp-1 max-w-xs">{ar?.shortDesc}</div>
                      </td>
                      <td className="py-2 px-3 text-xs">{t.route}</td>
                      <td className="py-2 px-3 text-xs">{t.vehicleType}</td>
                      <td className="py-2 px-3 tabular-nums">{t.capacity}</td>
                      <td className="py-2 px-3 tabular-nums">{t.durationMinutes} د</td>
                      <td className="py-2 px-3 font-bold tabular-nums">{Number(t.priceLocalEGP).toLocaleString()}</td>
                      <td className="py-2 px-3 font-bold tabular-nums">{Number(t.priceForeignUSD).toLocaleString()}</td>
                      <td className="py-2 px-3">
                        <Badge variant={t.isActive ? 'default' : 'secondary'}>{t.isActive ? 'نشط' : 'مخفي'}</Badge>
                      </td>
                      <td className="py-2 px-3">
                        <div className="inline-flex gap-1">
                          <Button size="icon" variant="ghost" onClick={() => togglePatch(t.id, { isActive: !t.isActive })}>{t.isActive ? <X className="h-4 w-4" /> : <Save className="h-4 w-4" />}</Button>
                          <Button size="icon" variant="ghost" onClick={() => setEditing(t)}><Pencil className="h-4 w-4" /></Button>
                          <Button size="icon" variant="ghost" onClick={() => del(t.id)}><Trash2 className="h-4 w-4 text-red-600" /></Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {(editing || creating) && (
        <TransferForm
          initial={editing}
          onClose={() => { setEditing(null); setCreating(false); }}
          onSaved={() => { setEditing(null); setCreating(false); void load(); }}
        />
      )}
    </div>
  );
}

function TransferForm({ initial, onClose, onSaved }: { initial: Transfer | null; onClose: () => void; onSaved: () => void }) {
  const api = useAdminApi();
  const [form, setForm] = useState({
    slug: initial?.slug || '',
    route: initial?.route || 'AIRPORT_TO_HOTEL',
    vehicleType: initial?.vehicleType || 'SEDAN',
    capacity: initial?.capacity || 4,
    durationMinutes: initial?.durationMinutes || 30,
    priceLocalEGP: Number(initial?.priceLocalEGP) || 0,
    priceForeignUSD: Number(initial?.priceForeignUSD) || 0,
    isFeatured: initial?.isFeatured ?? false,
    isActive: initial?.isActive ?? true,
    sortOrder: initial?.sortOrder ?? 0,
  });
  const [tr, setTr] = useState({
    AR: { name: initial?.translations.find((t) => t.locale === 'AR')?.name || '', shortDesc: initial?.translations.find((t) => t.locale === 'AR')?.shortDesc || '' },
    EN: { name: initial?.translations.find((t) => t.locale === 'EN')?.name || '', shortDesc: initial?.translations.find((t) => t.locale === 'EN')?.shortDesc || '' },
  });
  const [activeLocale, setActiveLocale] = useState<'AR' | 'EN'>('AR');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!tr.AR.name) return toast.error('الاسم بالعربي مطلوب');
    const payload = {
      slug: form.slug || undefined,
      route: form.route, vehicleType: form.vehicleType,
      capacity: form.capacity, durationMinutes: form.durationMinutes,
      priceLocalEGP: form.priceLocalEGP, priceForeignUSD: form.priceForeignUSD,
      isFeatured: form.isFeatured, isActive: form.isActive, sortOrder: form.sortOrder,
      translations: (['AR','EN'] as const).filter((l) => tr[l].name).map((l) => ({
        locale: l, name: tr[l].name, shortDesc: tr[l].shortDesc || tr[l].name,
      })),
    };
    setSaving(true);
    try {
      if (initial) await api.patch(`/admin/transfers/${initial.id}`, payload);
      else await api.post('/admin/transfers', payload);
      toast.success(initial ? 'تم التحديث' : 'تم الإنشاء');
      onSaved();
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Error'); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h3 className="text-lg font-bold inline-flex items-center gap-2"><Car className="h-5 w-5 text-accent" /> {initial ? 'تعديل خدمة' : 'إضافة خدمة نقل'}</h3>
          <button onClick={onClose} className="p-2 rounded-md hover:bg-muted"><X className="h-4 w-4" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex gap-1 bg-muted/40 rounded-lg p-1 w-fit">
            {(['AR', 'EN'] as const).map((l) => (
              <button key={l} onClick={() => setActiveLocale(l)} className={`px-3 py-1.5 rounded-md text-sm font-semibold ${activeLocale === l ? 'bg-primary text-white' : 'hover:bg-white'}`}>{l === 'AR' ? 'العربية' : 'English'}</button>
            ))}
          </div>

          <div>
            <label className="text-sm font-semibold mb-1.5 block">اسم الخدمة ({activeLocale}) *</label>
            <Input value={tr[activeLocale].name} onChange={(e) => setTr({ ...tr, [activeLocale]: { ...tr[activeLocale], name: e.target.value } })} dir={activeLocale === 'AR' ? 'rtl' : 'ltr'} />
          </div>
          <div>
            <label className="text-sm font-semibold mb-1.5 block">الوصف القصير ({activeLocale})</label>
            <Input value={tr[activeLocale].shortDesc} onChange={(e) => setTr({ ...tr, [activeLocale]: { ...tr[activeLocale], shortDesc: e.target.value } })} dir={activeLocale === 'AR' ? 'rtl' : 'ltr'} />
          </div>

          <div className="grid sm:grid-cols-2 gap-3 pt-2 border-t">
            <div>
              <label className="text-xs font-semibold mb-1 block">نوع الخط</label>
              <select className="h-11 w-full rounded-lg border px-3 bg-white" value={form.route} onChange={(e) => setForm({ ...form, route: e.target.value })}>
                {ROUTES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold mb-1 block">نوع المركبة</label>
              <select className="h-11 w-full rounded-lg border px-3 bg-white" value={form.vehicleType} onChange={(e) => setForm({ ...form, vehicleType: e.target.value })}>
                {VEHICLES.map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold mb-1 block">السعة</label>
              <Input type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })} />
            </div>
            <div>
              <label className="text-xs font-semibold mb-1 block">المدة (دقيقة)</label>
              <Input type="number" value={form.durationMinutes} onChange={(e) => setForm({ ...form, durationMinutes: Number(e.target.value) })} />
            </div>
            <div>
              <label className="text-xs font-semibold mb-1 block">السعر ج.م</label>
              <Input type="number" value={form.priceLocalEGP} onChange={(e) => setForm({ ...form, priceLocalEGP: Number(e.target.value) })} />
            </div>
            <div>
              <label className="text-xs font-semibold mb-1 block">السعر $</label>
              <Input type="number" value={form.priceForeignUSD} onChange={(e) => setForm({ ...form, priceForeignUSD: Number(e.target.value) })} />
            </div>
          </div>

          <div className="flex flex-wrap gap-4 pt-2 border-t text-sm">
            <label className="inline-flex items-center gap-2"><input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} /> نشط</label>
            <label className="inline-flex items-center gap-2"><input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} /> مميز</label>
          </div>
        </div>
        <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>إلغاء</Button>
          <Button onClick={save} disabled={saving}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} حفظ</Button>
        </div>
      </div>
    </div>
  );
}
