'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAdminApi, useAdminAuth } from '@/lib/admin-auth';
import { API_BASE } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input, Textarea } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  Plus, X, MessageCircle, Globe, Phone as PhoneIcon, Hand, CreditCard, Loader2,
  Download, Calendar as CalIcon, List, ChevronLeft, ChevronRight,
  Clock, Receipt, FileCheck2, AlertCircle, CheckCircle2, Send, Banknote, Smartphone, Building2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ImageLightbox } from '@/components/public/image-lightbox';

type Status = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
type Source = 'WEBSITE' | 'WHATSAPP' | 'PHONE' | 'MANUAL' | 'STRIPE';
type PaymentStatus = 'UNPAID' | 'PARTIAL' | 'PAID' | 'REFUNDED';

const PAYMENT_METHOD_META: Record<string, { label: string; icon: typeof Smartphone; color: string }> = {
  VODAFONE_CASH: { label: 'فودافون كاش', icon: Smartphone, color: 'bg-red-500/12 text-red-700 border-red-500/30' },
  INSTAPAY:      { label: 'إنستا باي',   icon: Send,       color: 'bg-purple-500/12 text-purple-700 border-purple-500/30' },
  BANK_TRANSFER: { label: 'تحويل بنكي',  icon: Building2,  color: 'bg-blue-500/12 text-blue-700 border-blue-500/30' },
  CASH:          { label: 'نقدي عند الوصول', icon: Banknote, color: 'bg-emerald-500/12 text-emerald-700 border-emerald-500/30' },
  STRIPE:        { label: 'بطاقة (Stripe)', icon: CreditCard, color: 'bg-indigo-500/12 text-indigo-700 border-indigo-500/30' },
  OTHER:         { label: 'غير محدد', icon: CreditCard, color: 'bg-muted text-muted-foreground border-muted-foreground/30' },
};

interface BookingPayment {
  id: number;
  method: string;
  status: PaymentStatus;
  screenshotUrl?: string | null;
  amount: string;
  currency: string;
  confirmedAt?: string | null;
}

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
  payments?: BookingPayment[];
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
  const { token } = useAdminAuth();
  const [items, setItems] = useState<BookingItem[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<Status | 'ALL'>('ALL');
  const [sourceFilter, setSourceFilter] = useState<Source | 'ALL'>('ALL');
  const [loading, setLoading] = useState(true);
  const [showManual, setShowManual] = useState(false);
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [calMonth, setCalMonth] = useState(() => new Date());
  const [lightbox, setLightbox] = useState<{ images: string[]; index: number; caption?: string } | null>(null);

  const downloadCSV = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/exports/bookings.csv`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bookings-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('تم تصدير CSV');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error');
    }
  };

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

  const confirmPayment = async (paymentId: number, bookingRef: string) => {
    if (!confirm(`تأكيد دفع الحجز ${bookingRef}؟ هتتولّد الفاتورة وتترسل للعميل تلقائياً.`)) return;
    try {
      await api.post(`/admin/payments/${paymentId}/confirm`, {});
      toast.success(`تم تأكيد الدفع — الفاتورة اتبعتت للعميل (${bookingRef})`);
      void load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'فشل التأكيد');
    }
  };

  // Group bookings by date for the calendar view
  const byDate = useMemo(() => {
    const map = new Map<string, BookingItem[]>();
    items.forEach((b) => {
      const key = new Date(b.bookingDate).toISOString().slice(0, 10);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(b);
    });
    return map;
  }, [items]);

  // KPI counts derived from the loaded list
  const kpi = useMemo(() => {
    const pending = items.filter((b) => b.status === 'PENDING').length;
    const withReceipt = items.filter((b) => b.payments?.some((p) => p.screenshotUrl)).length;
    const unpaid = items.filter((b) => b.paymentStatus === 'UNPAID' && b.status !== 'CANCELLED').length;
    return { pending, withReceipt, unpaid };
  }, [items]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold">
          إدارة الحجوزات
          <span className="text-sm font-normal text-muted-foreground ms-2">({items.length})</span>
        </h2>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="inline-flex rounded-lg border bg-white overflow-hidden">
            <button
              onClick={() => setView('list')}
              className={cn('px-3 py-2 text-xs font-semibold inline-flex items-center gap-1.5', view === 'list' ? 'bg-primary text-cream' : 'hover:bg-muted')}
            >
              <List className="h-3.5 w-3.5" /> قائمة
            </button>
            <button
              onClick={() => setView('calendar')}
              className={cn('px-3 py-2 text-xs font-semibold inline-flex items-center gap-1.5', view === 'calendar' ? 'bg-primary text-cream' : 'hover:bg-muted')}
            >
              <CalIcon className="h-3.5 w-3.5" /> تقويم
            </button>
          </div>
          <Button variant="outline" onClick={downloadCSV} className="text-xs">
            <Download className="h-3.5 w-3.5" /> تصدير CSV
          </Button>
          <Button onClick={() => setShowManual(true)}><Plus className="h-4 w-4" /> إضافة حجز يدوي</Button>
        </div>
      </div>

      {/* KPI strip — quick jump filters */}
      <div className="grid grid-cols-3 gap-3">
        <button
          type="button"
          onClick={() => { setStatusFilter('PENDING'); setSourceFilter('ALL'); }}
          className={cn(
            'group text-start rounded-2xl border bg-white p-4 transition-all hover:-translate-y-0.5 hover:shadow-md',
            statusFilter === 'PENDING' ? 'border-amber-400 ring-2 ring-amber-200 bg-amber-50/40' : 'border-accent/15 hover:border-amber-300',
          )}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-amber-100 text-amber-700 border border-amber-200">
              <Clock className="h-4 w-4" />
            </span>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">في الانتظار</span>
          </div>
          <div className="font-serif text-3xl font-bold text-amber-700 leading-none tabular-nums mt-2">{kpi.pending}</div>
          <div className="text-[11px] text-muted-foreground mt-1">حجز يحتاج مراجعة</div>
        </button>
        <button
          type="button"
          onClick={() => { setStatusFilter('ALL'); setSourceFilter('ALL'); }}
          className={cn(
            'group text-start rounded-2xl border bg-white p-4 transition-all hover:-translate-y-0.5 hover:shadow-md',
            'border-accent/15 hover:border-emerald-300',
          )}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 border border-emerald-200">
              <Receipt className="h-4 w-4" />
            </span>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">إيصالات مرفوعة</span>
          </div>
          <div className="font-serif text-3xl font-bold text-emerald-700 leading-none tabular-nums mt-2">{kpi.withReceipt}</div>
          <div className="text-[11px] text-muted-foreground mt-1">يمكن التحقق منها</div>
        </button>
        <button
          type="button"
          onClick={() => { setStatusFilter('ALL'); setSourceFilter('ALL'); }}
          className="group text-start rounded-2xl border bg-white p-4 transition-all hover:-translate-y-0.5 hover:shadow-md border-accent/15 hover:border-rose-300"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-rose-100 text-rose-700 border border-rose-200">
              <AlertCircle className="h-4 w-4" />
            </span>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">غير مدفوع</span>
          </div>
          <div className="font-serif text-3xl font-bold text-rose-700 leading-none tabular-nums mt-2">{kpi.unpaid}</div>
          <div className="text-[11px] text-muted-foreground mt-1">في انتظار الدفع</div>
        </button>
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

      {view === 'calendar' && (
        <Card>
          <CardContent className="p-4">
            <CalendarView month={calMonth} setMonth={setCalMonth} byDate={byDate} />
          </CardContent>
        </Card>
      )}

      {view === 'list' && (
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
                          <div className="flex items-center gap-1.5 flex-wrap min-w-[200px]">
                            {/* Payment method badges (one per Payment row) */}
                            {(b.payments || []).map((p) => {
                              const meta = PAYMENT_METHOD_META[p.method] || PAYMENT_METHOD_META.OTHER;
                              const MIcon = meta.icon;
                              const isPaid = p.status === 'PAID';
                              return (
                                <div key={`pm-${p.id}`} className="inline-flex items-center gap-1">
                                  <span className={cn('inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold border', meta.color)} title={`${meta.label} · ${p.amount} ${p.currency}`}>
                                    <MIcon className="h-3 w-3" />
                                    {meta.label}
                                  </span>
                                  {!isPaid && p.screenshotUrl && (
                                    <button
                                      type="button"
                                      onClick={() => confirmPayment(p.id, b.reference)}
                                      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500 text-white hover:bg-emerald-600 transition-colors shadow-sm"
                                      title="تأكيد الدفع → ترسل الفاتورة للعميل تلقائياً"
                                    >
                                      <CheckCircle2 className="h-3 w-3" />
                                      تأكيد
                                    </button>
                                  )}
                                  {isPaid && (
                                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-bold">
                                      <CheckCircle2 className="h-3 w-3" />
                                      مدفوع
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                            {/* Receipt thumbnails (images + PDFs) */}
                            {(() => {
                              const imageReceipts = (b.payments || []).filter((p) => p.screenshotUrl && !/\.pdf$/i.test(p.screenshotUrl!));
                              const pdfReceipts   = (b.payments || []).filter((p) => p.screenshotUrl && /\.pdf$/i.test(p.screenshotUrl!));
                              const imageUrls = imageReceipts.map((p) => p.screenshotUrl!) as string[];
                              return (
                                <>
                                  {imageReceipts.map((p, idx) => (
                                    <button
                                      key={p.id}
                                      type="button"
                                      onClick={() => setLightbox({ images: imageUrls, index: idx, caption: `إيصال — ${b.reference} (${b.customer.fullName})` })}
                                      className="relative inline-block group"
                                      title="عرض إيصال الدفع"
                                    >
                                      {/* eslint-disable-next-line @next/next/no-img-element */}
                                      <img src={p.screenshotUrl!} alt="receipt" className="w-9 h-9 rounded-md object-cover border border-emerald-500/40 group-hover:border-emerald-500 group-hover:scale-110 transition-all" />
                                      <span className="absolute -top-1 -end-1 inline-flex items-center justify-center w-4 h-4 rounded-full bg-emerald-500 border-2 border-white text-white shadow">
                                        <FileCheck2 className="h-2.5 w-2.5" />
                                      </span>
                                    </button>
                                  ))}
                                  {pdfReceipts.map((p) => (
                                    <a key={p.id} href={p.screenshotUrl!} target="_blank" rel="noopener" className="relative inline-block group" title="عرض PDF">
                                      <span className="inline-flex items-center justify-center w-9 h-9 rounded-md bg-blue-500/15 border border-blue-500/40 text-blue-700 text-[10px] font-bold group-hover:bg-blue-500/25 transition-colors">PDF</span>
                                      <span className="absolute -top-1 -end-1 inline-flex items-center justify-center w-4 h-4 rounded-full bg-emerald-500 border-2 border-white text-white shadow">
                                        <FileCheck2 className="h-2.5 w-2.5" />
                                      </span>
                                    </a>
                                  ))}
                                </>
                              );
                            })()}
                            {/* WhatsApp button (icon only) */}
                            {b.customer.phone && !b.customer.phone.startsWith('wa-pending-') && (
                              <a
                                href={`https://wa.me/${b.customer.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`مرحبا ${b.customer.fullName}، بخصوص حجزك ${b.reference}`)}`}
                                target="_blank"
                                rel="noopener"
                                title="افتح محادثة واتساب"
                                className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-[#25D366]/15 text-[#25D366] hover:bg-[#25D366] hover:text-white transition-colors"
                              >
                                <MessageCircle className="h-3.5 w-3.5" />
                              </a>
                            )}
                            {/* Invoice link if generated */}
                            {(() => {
                              const bWithInv = b as BookingItem & { invoiceUrl?: string | null };
                              return bWithInv.invoiceUrl ? (
                                <a
                                  href={bWithInv.invoiceUrl}
                                  target="_blank"
                                  rel="noopener"
                                  title="عرض الفاتورة PDF"
                                  className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-amber-500/15 text-amber-700 hover:bg-amber-500 hover:text-white transition-colors"
                                >
                                  <Receipt className="h-3.5 w-3.5" />
                                </a>
                              ) : null;
                            })()}
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
      )}

      {showManual && (
        <ManualBookingModal
          onClose={() => setShowManual(false)}
          onCreated={() => { setShowManual(false); void load(); }}
        />
      )}

      {/* Receipt image lightbox — shared component with full nav + zoom */}
      <ImageLightbox
        open={!!lightbox}
        images={lightbox?.images || []}
        startIndex={lightbox?.index || 0}
        caption={lightbox?.caption}
        onClose={() => setLightbox(null)}
      />
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────
// Calendar View
// ────────────────────────────────────────────────────────────────────────
function CalendarView({
  month, setMonth, byDate,
}: {
  month: Date;
  setMonth: (d: Date) => void;
  byDate: Map<string, BookingItem[]>;
}) {
  const year = month.getFullYear();
  const m = month.getMonth();
  const firstDow = new Date(year, m, 1).getDay();
  const days = new Date(year, m + 1, 0).getDate();
  const cells: ({ day: number; date: string } | null)[] = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= days; d++) {
    cells.push({ day: d, date: new Date(year, m, d).toISOString().slice(0, 10) });
  }
  while (cells.length % 7 !== 0) cells.push(null);

  const todayISO = new Date().toISOString().slice(0, 10);
  const monthName = month.toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' });

  const statusColor: Record<BookingItem['status'], string> = {
    PENDING:   'bg-amber-500',
    CONFIRMED: 'bg-emerald-500',
    CANCELLED: 'bg-rose-500',
    COMPLETED: 'bg-sky-500',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setMonth(new Date(year, m - 1, 1))} className="inline-flex items-center justify-center w-9 h-9 rounded-lg hover:bg-muted">
          <ChevronRight className="h-4 w-4" />
        </button>
        <div className="font-serif font-bold text-lg text-primary">{monthName}</div>
        <button onClick={() => setMonth(new Date(year, m + 1, 1))} className="inline-flex items-center justify-center w-9 h-9 rounded-lg hover:bg-muted">
          <ChevronLeft className="h-4 w-4" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-1 text-center text-[10px] uppercase tracking-wider font-bold text-muted-foreground">
        {['أحد','إثن','ثلا','أرب','خمي','جمع','سبت'].map((d) => <div key={d} className="py-1">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((c, i) => {
          if (!c) return <div key={i} />;
          const list = byDate.get(c.date) || [];
          const isToday = c.date === todayISO;
          return (
            <div
              key={i}
              className={cn(
                'min-h-[88px] rounded-lg border p-1.5 flex flex-col text-start transition-colors',
                isToday ? 'bg-accent/10 border-accent/40' : 'bg-white border-accent/15 hover:border-accent/30',
              )}
            >
              <div className={cn('text-xs font-bold mb-1', isToday ? 'text-accent-700' : 'text-primary')}>{c.day}</div>
              <div className="space-y-1 overflow-y-auto">
                {list.slice(0, 3).map((b) => (
                  <a
                    key={b.id}
                    href={`#booking-${b.id}`}
                    title={`${b.customer.fullName} — ${b.trip.translations.find((t) => t.locale === 'AR')?.title || ''}`}
                    className="block text-[10px] truncate px-1 py-0.5 rounded bg-muted/60 hover:bg-muted text-primary"
                  >
                    <span className={cn('inline-block w-1.5 h-1.5 rounded-full me-1 align-middle', statusColor[b.status])} />
                    {b.customer.fullName}
                  </a>
                ))}
                {list.length > 3 && (
                  <div className="text-[10px] text-muted-foreground px-1">+{list.length - 3} {list.length - 3 === 1 ? 'حجز' : 'حجوزات'}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3 text-[10px] text-muted-foreground">
        {(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'] as BookingItem['status'][]).map((s) => (
          <span key={s} className="inline-flex items-center gap-1.5">
            <span className={cn('inline-block w-2 h-2 rounded-full', statusColor[s])} />
            {STATUS_LABELS[s]}
          </span>
        ))}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────
// Manual Booking Modal
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
