'use client';

import { useEffect, useState } from 'react';
import { useAdminApi, useAdminAuth } from '@/lib/admin-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  FileText, Download, Loader2, TrendingUp, AlertCircle, Users, Map, CreditCard,
  Calendar, Award, BarChart3, Percent, DollarSign, UserCheck,
} from 'lucide-react';
import { AreaChart, BarChart, Donut, StackedBar } from '@/components/admin/charts';
import { cn } from '@/lib/utils';

interface Reports {
  period: { days: number; since: string };
  kpis: {
    totalBookings: number;
    confirmedCount: number;
    cancelledCount: number;
    conversionRate: number;
    cancellationRate: number;
    totalGuests: number;
    avgGuestsPerBooking: number;
    totalRevenueEGP: number;
    avgBookingValueEGP: number;
  };
  monthlySeries: Array<{ month: string; revenue: number; bookings: number; confirmed: number }>;
  paymentMethodSplit: Array<{ method: string; count: number; total: number }>;
  categoryStats: Record<string, { bookings: number; revenue: number }>;
  topTrips: Array<{ tripId: number; title: string; slug: string; category: string; bookings: number; revenue: number }>;
  topCustomers: Array<{ customerId: number; name: string; email: string; country: string | null; bookings: number; revenue: number }>;
}

const RANGE_OPTIONS = [
  { days: 30,  label: '30 يوم' },
  { days: 90,  label: '3 شهور' },
  { days: 180, label: '6 شهور' },
  { days: 365, label: 'سنة' },
];

const METHOD_LABELS: Record<string, string> = {
  STRIPE: 'بطاقة (Stripe)',
  VODAFONE_CASH: 'فودافون كاش',
  INSTAPAY: 'InstaPay',
  BANK_TRANSFER: 'تحويل بنكي',
  CASH: 'نقداً',
};

const CATEGORY_LABELS: Record<string, string> = {
  SEA: 'بحرية',
  DESERT: 'صحراوية',
  CITY: 'مدنية',
  DIVING: 'غوص',
  EVENTS: 'فعاليات',
  SAFARI: 'سفاري',
};

const METHOD_COLORS = ['#3b82f6', '#f43f5e', '#10b981', '#a855f7', '#94a3b8'];

export default function ReportsPage() {
  const api = useAdminApi();
  const { token } = useAdminAuth();
  const [days, setDays] = useState(90);
  const [data, setData] = useState<Reports | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setErr(null);
    api.get<Reports>(`/admin/stats/reports?days=${days}`)
      .then(setData)
      .catch((e) => setErr(e instanceof Error ? e.message : 'فشل التحميل'))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days]);

  async function exportCsv(kind: 'bookings' | 'customers' | 'payments') {
    if (!token) return;
    const url = `${process.env.NEXT_PUBLIC_API_URL || 'https://lotussharm.com/api'}/admin/stats/export/${kind}.csv?days=${days}`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` }, credentials: 'include' });
    if (!res.ok) {
      alert('فشل التصدير: ' + res.status);
      return;
    }
    const blob = await res.blob();
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${kind}-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-accent" />
            التقارير التفصيلية
          </h1>
          <p className="text-sm text-muted-foreground">تحليلات الأداء والإيرادات والعملاء عبر الفترات الزمنية</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => exportCsv('bookings')} variant="outline" className="gap-1.5 text-sm">
            <Download className="h-4 w-4" /> الحجوزات CSV
          </Button>
          <Button onClick={() => exportCsv('customers')} variant="outline" className="gap-1.5 text-sm">
            <Download className="h-4 w-4" /> العملاء CSV
          </Button>
          <Button onClick={() => exportCsv('payments')} variant="outline" className="gap-1.5 text-sm">
            <Download className="h-4 w-4" /> المدفوعات CSV
          </Button>
        </div>
      </div>

      {/* Range selector */}
      <Card>
        <CardContent className="p-3 md:p-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground me-2">
              <Calendar className="h-4 w-4" /> الفترة:
            </span>
            {RANGE_OPTIONS.map((r) => (
              <button
                key={r.days}
                onClick={() => setDays(r.days)}
                className={cn(
                  'px-3.5 py-1.5 rounded-lg text-sm font-bold border-2 transition-all',
                  days === r.days
                    ? 'bg-primary text-cream border-primary shadow-md'
                    : 'bg-white text-primary border-accent/20 hover:border-accent',
                )}
              >
                {r.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {err && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-xl p-4 flex items-start gap-2">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <div className="text-sm">{err}</div>
        </div>
      )}

      {loading || !data ? (
        <div className="py-20 text-center text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
          جاري تحميل التقارير...
        </div>
      ) : (
        <>
          {/* KPI grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            <KpiCard icon={CreditCard}  label="إجمالي الإيرادات" value={`${Math.round(data.kpis.totalRevenueEGP).toLocaleString('ar-EG')} ج.م`} sub="معدّل بالعملة المحلية" color="text-amber-700 bg-amber-50" />
            <KpiCard icon={DollarSign}  label="متوسط الحجز"      value={`${Math.round(data.kpis.avgBookingValueEGP).toLocaleString('ar-EG')} ج.م`} color="text-primary bg-primary/5" />
            <KpiCard icon={Map}         label="إجمالي الحجوزات" value={data.kpis.totalBookings} color="text-blue-700 bg-blue-50" />
            <KpiCard icon={UserCheck}   label="حجوزات مؤكدة"    value={data.kpis.confirmedCount} color="text-emerald-700 bg-emerald-50" />
            <KpiCard icon={Percent}     label="معدل التحويل"     value={`${data.kpis.conversionRate.toFixed(1)}%`} sub="مؤكدة / إجمالي" color="text-emerald-700 bg-emerald-50" />
            <KpiCard icon={AlertCircle} label="معدل الإلغاء"     value={`${data.kpis.cancellationRate.toFixed(1)}%`} color="text-rose-700 bg-rose-50" />
            <KpiCard icon={Users}       label="إجمالي الضيوف"    value={data.kpis.totalGuests}  sub={`${data.kpis.avgGuestsPerBooking.toFixed(1)} وسطياً / حجز`} color="text-purple-700 bg-purple-50" />
            <KpiCard icon={Award}       label="حجوزات ملغية"     value={data.kpis.cancelledCount} color="text-slate-700 bg-slate-50" />
          </div>

          {/* Monthly revenue chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-accent" />
                الإيرادات الشهرية (بالجنيه المصري)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AreaChart
                data={data.monthlySeries.map((m) => ({ label: m.month.slice(5), value: m.revenue }))}
                color="#c9a86a"
                height={260}
                valueFormat={(v) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : Math.round(v).toString()}
              />
            </CardContent>
          </Card>

          {/* Monthly bookings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-accent" />
                الحجوزات الشهرية
              </CardTitle>
            </CardHeader>
            <CardContent>
              <BarChart
                data={data.monthlySeries.map((m) => ({ label: m.month.slice(5), value: m.bookings }))}
                color="#0d3a3a"
                height={240}
              />
            </CardContent>
          </Card>

          {/* Payment methods + Categories */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-accent" />
                  طرق الدفع المستخدمة
                </CardTitle>
              </CardHeader>
              <CardContent>
                {data.paymentMethodSplit.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">لا توجد مدفوعات</p>
                ) : (
                  <Donut
                    data={data.paymentMethodSplit.map((p) => ({
                      label: METHOD_LABELS[p.method] || p.method,
                      value: p.count,
                    }))}
                    colors={METHOD_COLORS}
                  />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Map className="h-4 w-4 text-accent" />
                  الحجوزات حسب فئة الرحلة
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.keys(data.categoryStats).length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">لا توجد بيانات</p>
                ) : (
                  <StackedBar
                    segments={Object.entries(data.categoryStats).map(([cat, v], i) => ({
                      label: CATEGORY_LABELS[cat] || cat,
                      value: v.bookings,
                      color: METHOD_COLORS[i % METHOD_COLORS.length],
                    }))}
                  />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Top trips */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Award className="h-4 w-4 text-accent" />
                أكثر الرحلات حجزاً
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.topTrips.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">لا توجد بيانات</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-[11px] uppercase tracking-wider text-muted-foreground">
                        <th className="py-2 px-3 text-start">#</th>
                        <th className="py-2 px-3 text-start">الرحلة</th>
                        <th className="py-2 px-3 text-start">الفئة</th>
                        <th className="py-2 px-3 text-start">الحجوزات</th>
                        <th className="py-2 px-3 text-start">الإيرادات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.topTrips.map((t, i) => (
                        <tr key={t.tripId} className="border-b last:border-0 hover:bg-muted/30">
                          <td className="py-2.5 px-3 font-bold text-accent">{i + 1}</td>
                          <td className="py-2.5 px-3 font-semibold">{t.title}</td>
                          <td className="py-2.5 px-3 text-muted-foreground">{CATEGORY_LABELS[t.category] || t.category}</td>
                          <td className="py-2.5 px-3 tabular-nums font-bold">{t.bookings}</td>
                          <td className="py-2.5 px-3 tabular-nums font-bold text-accent-700">{Math.round(t.revenue).toLocaleString('ar-EG')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top customers */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4 text-accent" />
                أعلى العملاء قيمة
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.topCustomers.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">لا توجد بيانات</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-[11px] uppercase tracking-wider text-muted-foreground">
                        <th className="py-2 px-3 text-start">#</th>
                        <th className="py-2 px-3 text-start">العميل</th>
                        <th className="py-2 px-3 text-start hidden md:table-cell">الإيميل</th>
                        <th className="py-2 px-3 text-start">الدولة</th>
                        <th className="py-2 px-3 text-start">الحجوزات</th>
                        <th className="py-2 px-3 text-start">الإجمالي</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.topCustomers.map((c, i) => (
                        <tr key={c.customerId} className="border-b last:border-0 hover:bg-muted/30">
                          <td className="py-2.5 px-3 font-bold text-accent">{i + 1}</td>
                          <td className="py-2.5 px-3 font-semibold">{c.name}</td>
                          <td className="py-2.5 px-3 text-xs text-muted-foreground hidden md:table-cell" dir="ltr">{c.email}</td>
                          <td className="py-2.5 px-3">{c.country || '—'}</td>
                          <td className="py-2.5 px-3 tabular-nums font-bold">{c.bookings}</td>
                          <td className="py-2.5 px-3 tabular-nums font-bold text-accent-700">{Math.round(c.revenue).toLocaleString('ar-EG')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Exports CTA card */}
          <Card>
            <CardContent className="p-5 bg-gradient-to-br from-primary to-primary-800 text-cream rounded-xl">
              <div className="flex items-start gap-4 flex-wrap">
                <div className="w-12 h-12 rounded-xl bg-accent/20 text-accent flex items-center justify-center flex-shrink-0">
                  <FileText className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-[200px]">
                  <h3 className="font-bold text-lg mb-1">تصدير البيانات</h3>
                  <p className="text-sm text-cream/85">حمّل ملفات CSV (UTF-8 مع BOM، يفتحها Excel مباشرة) للحجوزات / العملاء / المدفوعات.</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Button onClick={() => exportCsv('bookings')}  variant="secondary" className="gap-1.5"><Download className="h-4 w-4" /> الحجوزات</Button>
                  <Button onClick={() => exportCsv('customers')} variant="secondary" className="gap-1.5"><Download className="h-4 w-4" /> العملاء</Button>
                  <Button onClick={() => exportCsv('payments')}  variant="secondary" className="gap-1.5"><Download className="h-4 w-4" /> المدفوعات</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

function KpiCard({
  icon: Icon, label, value, sub, color,
}: { icon: typeof Map; label: string; value: string | number; sub?: string; color: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-3 mb-2">
          <span className={cn('w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0', color)}>
            <Icon className="h-4 w-4" />
          </span>
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-bold mt-1.5 truncate">{label}</div>
        </div>
        <div className="text-xl md:text-2xl font-extrabold tabular-nums leading-tight">{value}</div>
        {sub && <div className="text-[11px] text-muted-foreground mt-1 truncate">{sub}</div>}
      </CardContent>
    </Card>
  );
}
