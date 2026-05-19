'use client';

import { useEffect, useState } from 'react';
import { useAdminApi } from '@/lib/admin-auth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Star, Plus, ExternalLink, Loader2, Pencil, Save, X, Trash2, BedDouble } from 'lucide-react';
import { toast } from 'sonner';

interface Translation { locale: 'AR' | 'EN' | 'RU' | 'IT' | 'DE'; name: string; features: string }
interface Hotel {
  id: number;
  slug: string;
  stars: number;
  area: string;
  boardType: string;
  priceLocalEGP: string;
  priceForeignUSD: string;
  nights: number;
  isFeatured: boolean;
  isActive: boolean;
  sortOrder: number;
  notes?: string | null;
  translations: Translation[];
}

const AREAS = ['NAMA_BAY','HADABA','SOHO_SQUARE','NABQ','PASHA_BAY','QUEEN_BAY','OTHER'];
const BOARDS = ['BB','HB','FB','ALL_INCLUSIVE','HB_DRINKS'];

export default function AdminHotelsPage() {
  const api = useAdminApi();
  const [items, setItems] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Hotel | null>(null);
  const [creating, setCreating] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get<{ items: Hotel[] }>('/admin/hotels');
      setItems(res.items);
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Error'); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); /* eslint-disable-next-line */ }, []);

  const togglePatch = async (id: number, patch: Partial<Hotel>) => {
    try {
      await api.patch(`/admin/hotels/${id}`, patch);
      toast.success('تم التحديث');
      void load();
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Error'); }
  };
  const del = async (id: number) => {
    if (!confirm('حذف هذا الفندق؟')) return;
    try { await api.delete(`/admin/hotels/${id}`); toast.success('تم الحذف'); void load(); }
    catch (e) { toast.error(e instanceof Error ? e.message : 'Error'); }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">إدارة الفنادق <span className="text-sm font-normal text-muted-foreground">({items.length})</span></h2>
          <p className="text-xs text-muted-foreground mt-0.5">إقامة 3 ليالي / 4 أيام شامل الانتقالات — أسعار للفرد</p>
        </div>
        <Button onClick={() => setCreating(true)}><Plus className="h-4 w-4" /> إضافة فندق</Button>
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          {loading ? (
            <div className="py-12 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>
          ) : items.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">لا توجد فنادق</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-right">
                <tr>
                  <th className="py-3 px-3">الفندق</th>
                  <th className="py-3 px-3">المنطقة</th>
                  <th className="py-3 px-3">المستوى</th>
                  <th className="py-3 px-3">نوع الإقامة</th>
                  <th className="py-3 px-3">الفرد ج.م</th>
                  <th className="py-3 px-3">الفرد $</th>
                  <th className="py-3 px-3">الحالة</th>
                  <th className="py-3 px-3">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {items.map((h) => {
                  const ar = h.translations.find((t) => t.locale === 'AR') || h.translations[0];
                  return (
                    <tr key={h.id} className="border-t hover:bg-muted/20">
                      <td className="py-2 px-3">
                        <div className="font-bold">{ar?.name || h.slug}</div>
                        <div className="text-[11px] text-muted-foreground line-clamp-1 max-w-xs">{ar?.features}</div>
                      </td>
                      <td className="py-2 px-3 text-xs">{h.area}</td>
                      <td className="py-2 px-3"><span className="inline-flex items-center gap-0.5 text-accent">{Array.from({ length: h.stars }).map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-current" />)}</span></td>
                      <td className="py-2 px-3 text-xs">{h.boardType}</td>
                      <td className="py-2 px-3 font-bold tabular-nums">{Number(h.priceLocalEGP).toLocaleString()}</td>
                      <td className="py-2 px-3 font-bold tabular-nums">{Number(h.priceForeignUSD).toLocaleString()}</td>
                      <td className="py-2 px-3">
                        <Badge variant={h.isActive ? 'default' : 'secondary'}>{h.isActive ? 'نشط' : 'مخفي'}</Badge>
                        {h.isFeatured && <Badge className="ms-1 bg-accent text-primary">مميز</Badge>}
                      </td>
                      <td className="py-2 px-3">
                        <div className="inline-flex gap-1">
                          <Button size="icon" variant="ghost" onClick={() => togglePatch(h.id, { isActive: !h.isActive })} title={h.isActive ? 'إخفاء' : 'تفعيل'}>
                            {h.isActive ? <X className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => setEditing(h)} title="تعديل"><Pencil className="h-4 w-4" /></Button>
                          <Button size="icon" variant="ghost" onClick={() => del(h.id)} title="حذف"><Trash2 className="h-4 w-4 text-red-600" /></Button>
                          <a href={`/ar/hotels`} target="_blank" rel="noopener" className="inline-flex items-center justify-center w-8 h-8 rounded hover:bg-muted" title="معاينة"><ExternalLink className="h-3.5 w-3.5" /></a>
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
        <HotelFormModal
          initial={editing}
          onClose={() => { setEditing(null); setCreating(false); }}
          onSaved={() => { setEditing(null); setCreating(false); void load(); }}
        />
      )}
    </div>
  );
}

function HotelFormModal({ initial, onClose, onSaved }: { initial: Hotel | null; onClose: () => void; onSaved: () => void }) {
  const api = useAdminApi();
  const [form, setForm] = useState({
    slug: initial?.slug || '',
    stars: initial?.stars || 4,
    area: initial?.area || 'NAMA_BAY',
    boardType: initial?.boardType || 'HB',
    priceLocalEGP: Number(initial?.priceLocalEGP) || 0,
    priceForeignUSD: Number(initial?.priceForeignUSD) || 0,
    nights: initial?.nights || 3,
    isFeatured: initial?.isFeatured ?? false,
    isActive: initial?.isActive ?? true,
    sortOrder: initial?.sortOrder ?? 0,
    notes: initial?.notes || '',
  });
  const [tr, setTr] = useState<Record<string, { name: string; features: string }>>({
    AR: { name: initial?.translations.find((t) => t.locale === 'AR')?.name || '', features: initial?.translations.find((t) => t.locale === 'AR')?.features || '' },
    EN: { name: initial?.translations.find((t) => t.locale === 'EN')?.name || '', features: initial?.translations.find((t) => t.locale === 'EN')?.features || '' },
  });
  const [activeLocale, setActiveLocale] = useState<'AR' | 'EN'>('AR');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!tr.AR.name) return toast.error('الاسم بالعربي مطلوب');
    const payload = {
      slug: form.slug || undefined,
      stars: form.stars, area: form.area, boardType: form.boardType,
      priceLocalEGP: form.priceLocalEGP, priceForeignUSD: form.priceForeignUSD,
      nights: form.nights, isFeatured: form.isFeatured, isActive: form.isActive,
      sortOrder: form.sortOrder, notes: form.notes || null,
      translations: (['AR','EN'] as const).filter((l) => tr[l].name).map((l) => ({
        locale: l, name: tr[l].name, features: tr[l].features,
      })),
    };
    setSaving(true);
    try {
      if (initial) await api.patch(`/admin/hotels/${initial.id}`, payload);
      else await api.post('/admin/hotels', payload);
      toast.success(initial ? 'تم التحديث' : 'تم الإنشاء');
      onSaved();
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Error'); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h3 className="text-lg font-bold inline-flex items-center gap-2"><BedDouble className="h-5 w-5 text-accent" /> {initial ? 'تعديل فندق' : 'إضافة فندق'}</h3>
          <button onClick={onClose} className="p-2 rounded-md hover:bg-muted"><X className="h-4 w-4" /></button>
        </div>
        <div className="p-6 space-y-4">
          {/* Locale tabs */}
          <div className="flex gap-1 bg-muted/40 rounded-lg p-1 w-fit">
            {(['AR', 'EN'] as const).map((l) => (
              <button key={l} onClick={() => setActiveLocale(l)} className={`px-3 py-1.5 rounded-md text-sm font-semibold ${activeLocale === l ? 'bg-primary text-white' : 'hover:bg-white'}`}>
                {l === 'AR' ? 'العربية' : 'English'}
              </button>
            ))}
          </div>
          <div>
            <label className="text-sm font-semibold mb-1.5 block">اسم الفندق ({activeLocale}) *</label>
            <Input value={tr[activeLocale].name} onChange={(e) => setTr({ ...tr, [activeLocale]: { ...tr[activeLocale], name: e.target.value } })} dir={activeLocale === 'AR' ? 'rtl' : 'ltr'} />
          </div>
          <div>
            <label className="text-sm font-semibold mb-1.5 block">المواصفات / الموقع ({activeLocale})</label>
            <Input value={tr[activeLocale].features} onChange={(e) => setTr({ ...tr, [activeLocale]: { ...tr[activeLocale], features: e.target.value } })} dir={activeLocale === 'AR' ? 'rtl' : 'ltr'} placeholder="مثال: خليج نعمة – صف ثاني – شاطئ رملي" />
          </div>

          <div className="grid sm:grid-cols-3 gap-3 pt-2 border-t">
            <div>
              <label className="text-xs font-semibold mb-1 block">المستوى</label>
              <select className="h-11 w-full rounded-lg border px-3 bg-white" value={form.stars} onChange={(e) => setForm({ ...form, stars: Number(e.target.value) })}>
                {[3, 4, 5].map((n) => <option key={n} value={n}>{n} نجوم</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold mb-1 block">المنطقة</label>
              <select className="h-11 w-full rounded-lg border px-3 bg-white" value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })}>
                {AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold mb-1 block">نوع الإقامة</label>
              <select className="h-11 w-full rounded-lg border px-3 bg-white" value={form.boardType} onChange={(e) => setForm({ ...form, boardType: e.target.value })}>
                {BOARDS.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
          </div>
          <div className="grid sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold mb-1 block">سعر المصري ج.م</label>
              <Input type="number" value={form.priceLocalEGP} onChange={(e) => setForm({ ...form, priceLocalEGP: Number(e.target.value) })} />
            </div>
            <div>
              <label className="text-xs font-semibold mb-1 block">سعر الأجنبي $</label>
              <Input type="number" value={form.priceForeignUSD} onChange={(e) => setForm({ ...form, priceForeignUSD: Number(e.target.value) })} />
            </div>
            <div>
              <label className="text-xs font-semibold mb-1 block">عدد الليالي</label>
              <Input type="number" value={form.nights} onChange={(e) => setForm({ ...form, nights: Number(e.target.value) })} />
            </div>
          </div>

          <div className="flex flex-wrap gap-4 pt-2 border-t text-sm">
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} /> نشط
            </label>
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} /> مميز
            </label>
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
