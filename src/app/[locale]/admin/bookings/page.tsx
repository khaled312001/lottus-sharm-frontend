'use client';

import { useEffect, useState } from 'react';
import { useAdminApi } from '@/lib/admin-auth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input, Textarea } from '@/components/ui/input';
import { toast } from 'sonner';
import { Plus, X, MessageCircle, Globe, Phone as PhoneIcon, Hand, CreditCard, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type Status = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
type Source = 'WEBSITE' | 'WHATSAPP' | 'PHONE' | 'MANUAL' | 'STRIPE';
type PaymentStatus = 'UNPAID' | 'PARTIAL' | 'PAID' | 'REFUNDED';

interface BookingItem {
  id: number;
  reference: string;
  bookingDate: string;
  adultsCount: number;
  childrenCount: number;
  total: string;
  currency: string;
  status: Status;
  paymentStatus: PaymentStatus;
  source: Source;
  customer: { fullName: string; email: string; phone: string };
  trip: { translations: Array<{ locale: string; title: string }> };
  createdAt: string;
  notes?: string | null;
}

interface TripOption {
  id: number;
  slug: string;
  priceLocalEGP: string;
  priceForeignUSD: string;
  childDiscount: number;
  translations: Array<{ locale: string; title: string }>;
}

const STATUS_LABELS: Record<Status, string> = {
  PENDING: 'معلق',
  CONFIRMED: 'مؤكد',
  CANCELLED: 'ملغي',
  COMPLETED: 'مكتمل',
};

const SOURCE_META: Record<Source, { label: string; icon: React.ComponentType<{ className?: string }>; color: string }> = {
  WEBSITE:  { label: 'الموقع',   icon: Globe,         color: 'bg-blue-500/15 text-blue-700 border-blue-500/30' },
  WHATSAPP: { label: 'واتساب',  icon: MessageCircle, color: 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30' },
  PHONE:    { label: 'هاتف',    icon: PhoneIcon,     color: 'bg-amber-500/15 text-amber-700 border-amber-500/30' },
  MANUAL:   { label: 'يدوي',    icon: Hand,          color: 'bg-purple-500/15 text-purple-700 border-purple-500/30' },
  STRIPE:   { label: 'Stripe',  icon: CreditCard,    color: 'bg-indigo-500/15 text-indigo-700 border-indigo-500/30' },
};

export default function AdminBookingsPage() {
  const api = useAdminApi();
  const [items, setItems] = useState<BookingItem[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<Status | 'ALL'>('ALL');
  const [sourceFilter, setSourceFilter] = useState<Source | 'ALL'>('ALL');
  const [loading, setLoading] = useState(true);
  const [showManual, setShowManual] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams();
      if (search) qs.set('search', search);
      if (statusFilter !== 'ALL') qs.set('status', statusFilter);
      if (sourceFilter !== 'ALL') qs.set('source', sourceFilter);
      const res = await api.get<{ items: BookingItem[] }>(`/admin/bookings?${qs}`);
      setItems(res.items);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); /* eslint-disable-next-line */ }, [statusFilter, sourceFilter]);

  const updateStatus = async (id: number, status: Status) => {
    try {
      await api.patch(`/admin/bookings/${id}/status`, { status });
      toast.success('تم التحديث');
      void load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold">إدارة الحجوزات</h2>
        <Button onClick={() => setShowManual(true)}><Plus className="h-4 w-4" /> إضافة حجز يدوي</Button>
      </div>

      <Card>
        <CardContent className="p-4 flex flex-wrap gap-2 items-center">
          <Input placeholder="بحث (رقم، اسم، إيميل)..." className="max-w-xs" value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && load()} />
          <select className="h-11 rounded-lg border px-3" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as Status | 'ALL')}>
            <option value="ALL">كل الحالات</option>
            <option value="PENDING">معلق</option>
            <option value="CONFIRMED">مؤكد</option>
            <option value="CANCELLED">ملغي</option>
            <option value="COMPLETED">مكتمل</option>
          </select>
          <select className="h-11 rounded-lg border px-3" value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value as Source | 'ALL')}>
            <option value="ALL">كل المصادر</option>
            <option value="WEBSITE">الموقع</option>
            <option value="WHATSAPP">واتساب</option>
            <option value="PHONE">هاتف</option>
            <option value="MANUAL">يدوي</option>
            <option value="STRIPE">Stripe</option>
          </select>
          <Button onClick={load} variant="outline">تطبيق</Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          {loading ? (
            <div className="py-12 text-center">جاري التحميل...</div>
          ) : items.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">لا توجد حجوزات</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-muted/40">
                <tr>
                  <th className="py-3 px-3 text-right">المرجع</th>
                  <th className="py-3 px-3 text-right">المصدر</th>
                  <th className="py-3 px-3 text-right">العميل</th>
                  <th className="py-3 px-3 text-right">الرحلة</th>
                  <th className="py-3 px-3 text-right">التاريخ</th>
                  <th className="py-3 px-3 text-right">الأشخاص</th>
                  <th className="py-3 px-3 text-right">المبلغ</th>
                  <th className="py-3 px-3 text-right">الدفع</th>
                  <th className="py-3 px-3 text-right">الحالة</th>
                  <th className="py-3 px-3 text-right">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {items.map((b) => {
                  const meta = SOURCE_META[b.source] || SOURCE_META.WEBSITE;
                  const Icon = meta.icon;
                  return (
                    <tr key={b.id} className="border-t hover:bg-muted/20">
                      <td className="py-2 px-3 font-mono text-xs">{b.reference}</td>
                      <td className="py-2 px-3">
                        <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border', meta.color)}>
                          <Icon className="h-3 w-3" />
                          {meta.label}
                        </span>
                      </td>
                      <td className="py-2 px-3">
                        <div className="font-semibold">{b.customer.fullName}</div>
                        <div className="text-xs text-muted-foreground">{b.customer.email?.endsWith('.lotussharm.local') ? '—' : b.customer.email}</div>
                        <div className="text-xs text-muted-foreground" dir="ltr">{b.customer.phone?.startsWith('wa-pending-') ? '—' : b.customer.phone}</div>
                      </td>
                      <td className="py-2 px-3 max-w-[200px]"><div className="line-clamp-2">{b.trip.translations.find((t) => t.locale === 'AR')?.title || b.trip.translations[0]?.title}</div></td>
                      <td className="py-2 px-3 text-xs">{new Date(b.bookingDate).toLocaleDateString('ar-EG')}</td>
                      <td className="py-2 px-3">{b.adultsCount}+{b.childrenCount}</td>
                      <td className="py-2 px-3 font-bold">{Number(b.total).toLocaleString()} {b.currency}</td>
                      <td className="py-2 px-3">
                        <Badge variant={b.paymentStatus === 'PAID' ? 'default' : 'secondary'}>{b.paymentStatus}</Badge>
                      </td>
                      <td className="py-2 px-3">
                        <select
                          className="h-8 rounded-md border px-2 text-xs bg-white"
                          value={b.status}
                          onChange={(e) => updateStatus(b.id, e.target.value as Status)}
                        >
                          {Object.entries(STATUS_LABELS).map(([v, label]) => (
                            <option key={v} value={v}>{label}</option>
                          ))}
                        </select>
                      </td>
                      <td className="py-2 px-3">
                        {b.customer.phone && !b.customer.phone.startsWith('wa-pending-') && (
                          <a href={`https://wa.me/${b.customer.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener" className="text-xs text-primary hover:underline">WhatsApp</a>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {showManual && (
        <ManualBookingModal
          onClose={() => setShowManual(false)}
          onCreated={() => { setShowManual(false); void load(); }}
        />
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────
function ManualBookingModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const api = useAdminApi();
  const [trips, setTrips] = useState<TripOption[]>([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    tripId: 0,
    bookingDate: new Date().toISOString().slice(0, 10),
    adultsCount: 1,
    childrenCount: 0,
    customerType: 'LOCAL' as 'LOCAL' | 'FOREIGN',
    fullName: '',
    email: '',
    phone: '',
    country: '',
    language: 'AR' as 'AR' | 'EN' | 'RU' | 'IT',
    notes: '',
    status: 'CONFIRMED' as Status,
    paymentStatus: 'UNPAID' as PaymentStatus,
    source: 'MANUAL' as Source,
  });

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get<{ items: TripOption[] }>('/admin/trips?pageSize=100');
        setTrips(res.items);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Error');
      }
    })();
  }, [api]);

  const selectedTrip = trips.find((t) => t.id === form.tripId);
  const isLocal = form.customerType === 'LOCAL';
  const unit = selectedTrip ? Number(isLocal ? selectedTrip.priceLocalEGP : selectedTrip.priceForeignUSD) : 0;
  const childDiscount = selectedTrip?.childDiscount || 0;
  const subtotal = selectedTrip
    ? unit * form.adultsCount + unit * (1 - childDiscount / 100) * form.childrenCount
    : 0;
  const currency = isLocal ? 'EGP' : 'USD';

  const save = async () => {
    if (!form.tripId) return toast.error('اختر الرحلة');
    if (!form.fullName.trim()) return toast.error('أدخل اسم العميل');
    if (!form.phone.trim()) return toast.error('أدخل رقم الهاتف');

    setSaving(true);
    try {
      await api.post('/admin/bookings', {
        tripId: form.tripId,
        bookingDate: form.bookingDate,
        adultsCount: form.adultsCount,
        childrenCount: form.childrenCount,
        customerType: form.customerType,
        customer: {
          fullName: form.fullName.trim(),
          email: form.email.trim() || undefined,
          phone: form.phone.trim(),
          country: form.country.trim() || undefined,
          language: form.language,
        },
        notes: form.notes.trim() || undefined,
        source: form.source,
        status: form.status,
        paymentStatus: form.paymentStatus,
      });
      toast.success('تم إنشاء الحجز');
      onCreated();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h3 className="text-lg font-bold">إضافة حجز يدوي</h3>
          <button onClick={onClose} className="p-2 rounded-md hover:bg-muted"><X className="h-4 w-4" /></button>
        </div>

        <div className="p-6 space-y-4">
          {/* Trip */}
          <div>
            <label className="text-sm font-semibold mb-1.5 block">الرحلة <span className="text-red-600">*</span></label>
            <select
              className="h-11 w-full rounded-lg border px-3 bg-white"
              value={form.tripId}
              onChange={(e) => setForm({ ...form, tripId: Number(e.target.value) })}
            >
              <option value={0}>— اختر الرحلة —</option>
              {trips.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.translations.find((tr) => tr.locale === 'AR')?.title || t.slug}
                  {' — '}
                  {isLocal ? `${Number(t.priceLocalEGP).toLocaleString()} ج.م` : `${Number(t.priceForeignUSD).toLocaleString()} $`}
                </option>
              ))}
            </select>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-semibold mb-1.5 block">تاريخ الرحلة <span className="text-red-600">*</span></label>
              <Input type="date" value={form.bookingDate} onChange={(e) => setForm({ ...form, bookingDate: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-semibold mb-1.5 block">نوع العميل</label>
              <select
                className="h-11 w-full rounded-lg border px-3 bg-white"
                value={form.customerType}
                onChange={(e) => setForm({ ...form, customerType: e.target.value as 'LOCAL' | 'FOREIGN' })}
              >
                <option value="LOCAL">محلي (مصري) — EGP</option>
                <option value="FOREIGN">أجنبي — USD</option>
              </select>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-semibold mb-1.5 block">عدد البالغين</label>
              <Input type="number" min={1} value={form.adultsCount} onChange={(e) => setForm({ ...form, adultsCount: Math.max(1, Number(e.target.value)) })} />
            </div>
            <div>
              <label className="text-sm font-semibold mb-1.5 block">عدد الأطفال</label>
              <Input type="number" min={0} value={form.childrenCount} onChange={(e) => setForm({ ...form, childrenCount: Math.max(0, Number(e.target.value)) })} />
            </div>
          </div>

          <div className="pt-3 border-t">
            <div className="text-sm font-bold mb-3">بيانات العميل</div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold mb-1 block">الاسم بالكامل <span className="text-red-600">*</span></label>
                <Input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-semibold mb-1 block">الهاتف <span className="text-red-600">*</span></label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} dir="ltr" placeholder="01XXXXXXXXX" />
              </div>
              <div>
                <label className="text-xs font-semibold mb-1 block">الإيميل (اختياري)</label>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} dir="ltr" />
              </div>
              <div>
                <label className="text-xs font-semibold mb-1 block">الدولة (اختياري)</label>
                <Input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-semibold mb-1 block">اللغة</label>
                <select
                  className="h-11 w-full rounded-lg border px-3 bg-white"
                  value={form.language}
                  onChange={(e) => setForm({ ...form, language: e.target.value as 'AR' | 'EN' | 'RU' | 'IT' })}
                >
                  <option value="AR">العربية</option>
                  <option value="EN">English</option>
                  <option value="RU">Русский</option>
                  <option value="IT">Italiano</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t">
            <div className="text-sm font-bold mb-3">الحجز والدفع</div>
            <div className="grid sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold mb-1 block">مصدر الحجز</label>
                <select
                  className="h-11 w-full rounded-lg border px-3 bg-white"
                  value={form.source}
                  onChange={(e) => setForm({ ...form, source: e.target.value as Source })}
                >
                  <option value="MANUAL">يدوي</option>
                  <option value="WHATSAPP">واتساب</option>
                  <option value="PHONE">هاتف</option>
                  <option value="WEBSITE">الموقع</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold mb-1 block">الحالة</label>
                <select
                  className="h-11 w-full rounded-lg border px-3 bg-white"
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as Status })}
                >
                  <option value="PENDING">معلق</option>
                  <option value="CONFIRMED">مؤكد</option>
                  <option value="COMPLETED">مكتمل</option>
                  <option value="CANCELLED">ملغي</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold mb-1 block">حالة الدفع</label>
                <select
                  className="h-11 w-full rounded-lg border px-3 bg-white"
                  value={form.paymentStatus}
                  onChange={(e) => setForm({ ...form, paymentStatus: e.target.value as PaymentStatus })}
                >
                  <option value="UNPAID">غير مدفوع</option>
                  <option value="PARTIAL">دفعة جزئية</option>
                  <option value="PAID">مدفوع</option>
                  <option value="REFUNDED">مسترد</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold mb-1.5 block">ملاحظات (اختياري)</label>
            <Textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>

          {/* Live total */}
          {selectedTrip && (
            <div className="rounded-xl border-2 border-accent/30 bg-accent/5 p-4 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                المجموع: {form.adultsCount} × {unit.toLocaleString()} {currency}
                {form.childrenCount > 0 && <> + {form.childrenCount} × {(unit * (1 - childDiscount / 100)).toLocaleString()} {currency}</>}
              </div>
              <div className="text-2xl font-bold text-primary">
                {subtotal.toLocaleString()} {currency}
              </div>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex items-center justify-end gap-2">
          <Button variant="outline" onClick={onClose}>إلغاء</Button>
          <Button onClick={save} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            إنشاء الحجز
          </Button>
        </div>
      </div>
    </div>
  );
}
