'use client';

import { useEffect, useState } from 'react';
import { useAdminApi } from '@/lib/admin-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Map, CalendarCheck, Users, DollarSign, Mail, TrendingUp, TrendingDown,
  Sparkles, Inbox, AlertCircle, Loader2, ArrowUpRight, FileText, Send,
} from 'lucide-react';
import { AreaChart, BarChart, Donut } from '@/components/admin/charts';
import { Link } from '@/i18n/routing';

interface RecentBooking {
  id: number;
  reference: string;
  total: string;
  currency: string;
  status: string;
  customer: { fullName: string; email: string };
  trip: { translations: Array<{ locale: string; title: string }> };
  createdAt: string;
}
interface RecentInquiry {
  id: number;
  name: string;
  subject: string | null;
  message: string;
  isRead: boolean;
  createdAt: string;
}
interface Dashboard {
  totals: {
    totalTrips: number;
    activeTrips: number;
    totalBookingsMonth: number;
    pendingBookings: number;
    confirmedBookings: number;
    totalCustomers: number;
    customersThisMonth: number;
    revenueMonth: number;
    revenuePrev: number;
    revenueGrowth: number;
    bookingsGrowth: number;
    newInquiries: number;
    totalSubscribers: number;
  };
  dailySeries: Array<{ date: string; revenue: number; bookings: number }>;
  statusBreakdown: Record<string, number>;
  topTrips: Array<{ tripId: number; title: string; slug: string; bookings: number; revenue: number }>;
  customersByLanguage: Record<string, number>;
  bookingsByType: Record<string, number>;
  recentBookings: RecentBooking[];
  recentInquiries: RecentInquiry[];
}

const STATUS_LABELS_AR: Record<string, string> = {
  PENDING: 'معلّقة',
  CONFIRMED: 'مؤكدة',
  COMPLETED: 'مكتملة',
  CANCELLED: 'ملغية',
};
const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-800',
  CONFIRMED: 'bg-emerald-100 text-emerald-800',
  COMPLETED: 'bg-blue-100 text-blue-800',
  CANCELLED: 'bg-rose-100 text-rose-800',
};

export default function DashboardPage() {
  const api = useAdminApi();
  const [data, setData] = useState<Dashboard | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    api.get<Dashboard>('/admin/stats/dashboard')
      .then(setData)
      .catch((e) => setErr(e instanceof Error ? e.message : 'فشل تحميل البيانات'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (err) {
    return (
      <div className="py-20 text-center">
        <AlertCircle className="h-8 w-8 text-rose-500 mx-auto mb-2" />
        <p className="text-rose-700">{err}</p>
      </div>
    );
  }
  if (!data) {
    return (
      <div className="py-20 text-center text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
        جاري تحميل لوحة التحكم...
      </div>
    );
  }

  const t = data.totals;

  const langPalette: Record<string, string> = { AR: '#0d3a3a', EN: '#3b82f6', RU: '#f43f5e', IT: '#10b981' };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-accent" />
            لوحة التحكم
          </h1>
          <p className="text-sm text-muted-foreground">نظرة عامة على أداء آخر 30 يوم</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/reports"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-primary text-cream font-semibold text-sm hover:bg-primary-800"
          >
            <FileText className="h-4 w-4" /> التقارير التفصيلية
          </Link>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <KpiCard
          icon={DollarSign} color="from-amber-500 to-amber-600"
          label="إيرادات الشهر"
          value={`${Math.round(t.revenueMonth).toLocaleString('ar-EG')} ج.م`}
          delta={t.revenueGrowth}
          deltaLabel={`vs الشهر السابق (${Math.round(t.revenuePrev).toLocaleString('ar-EG')})`}
        />
        <KpiCard
          icon={CalendarCheck} color="from-emerald-500 to-emerald-600"
          label="حجوزات الشهر"
          value={t.totalBookingsMonth}
          delta={t.bookingsGrowth}
        />
        <KpiCard
          icon={Users} color="from-purple-500 to-purple-600"
          label="إجمالي العملاء"
          value={t.totalCustomers}
          sub={`+${t.customersThisMonth} هذا الشهر`}
        />
        <KpiCard
          icon={Map} color="from-blue-500 to-blue-600"
          label="الرحلات النشطة"
          value={t.activeTrips}
          sub={`من إجمالي ${t.totalTrips}`}
        />
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SmallKpi icon={AlertCircle} color="text-amber-600 bg-amber-50" label="حجوزات معلقة" value={t.pendingBookings} href="/admin/bookings?status=PENDING" />
        <SmallKpi icon={Inbox}       color="text-pink-600 bg-pink-50"     label="رسائل جديدة"  value={t.newInquiries}    href="/admin/inquiries" />
        <SmallKpi icon={Send}        color="text-blue-600 bg-blue-50"     label="مشتركو النشرة" value={t.totalSubscribers} href="/admin/newsletter" />
        <SmallKpi icon={CalendarCheck} color="text-emerald-600 bg-emerald-50" label="حجوزات مؤكدة" value={t.confirmedBookings} href="/admin/bookings?status=CONFIRMED" />
      </div>

      {/* Charts row 1: Revenue + Bookings trend */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-accent" />
                الإيرادات اليومية (آخر 30 يوم)
              </CardTitle>
              <span className="text-xs text-muted-foreground">
                إجمالي: {Math.round(data.dailySeries.reduce((a, d) => a + d.revenue, 0)).toLocaleString('ar-EG')} ج.م
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <AreaChart
              data={data.dailySeries.map((d) => ({
                label: d.date.slice(5),
                value: d.revenue,
              }))}
              color="#c9a86a"
              valueFormat={(v) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : Math.round(v).toString()}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CalendarCheck className="h-4 w-4 text-accent" />
              توزيع الحجوزات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Donut
              data={Object.entries(data.statusBreakdown).map(([k, v]) => ({ label: STATUS_LABELS_AR[k] || k, value: v }))}
              size={170}
              thickness={26}
              colors={['#f59e0b', '#10b981', '#3b82f6', '#f43f5e']}
            />
          </CardContent>
        </Card>
      </div>

      {/* Charts row 2: Bookings count + Customer lang */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CalendarCheck className="h-4 w-4 text-accent" />
              عدد الحجوزات اليومية
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AreaChart
              data={data.dailySeries.map((d) => ({ label: d.date.slice(5), value: d.bookings }))}
              color="#0d3a3a"
              valueFormat={(v) => Math.round(v).toString()}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4 text-accent" />
              لغات العملاء
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Donut
              data={Object.entries(data.customersByLanguage).map(([k, v]) => ({ label: k, value: v }))}
              colors={Object.keys(data.customersByLanguage).map((k) => langPalette[k] || '#94a3b8')}
              size={170}
            />
          </CardContent>
        </Card>
      </div>

      {/* Top trips bar */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-accent" />
            أكثر الرحلات حجزاً (آخر 90 يوم)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.topTrips.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">لا توجد بيانات حتى الآن</p>
          ) : (
            <BarChart
              data={data.topTrips.map((t) => ({
                label: t.title.length > 14 ? t.title.slice(0, 14) + '…' : t.title,
                value: t.bookings,
              }))}
              color="#0d3a3a"
              valueFormat={(v) => Math.round(v).toString()}
              height={220}
            />
          )}
        </CardContent>
      </Card>

      {/* Recent bookings + inquiries */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="xl:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">آخر الحجوزات</CardTitle>
              <Link href="/admin/bookings" className="text-xs text-primary hover:underline inline-flex items-center gap-1">
                عرض الكل <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {data.recentBookings.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">لا توجد حجوزات بعد</p>
            ) : (
              <div className="overflow-x-auto -mx-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-muted-foreground text-[11px] uppercase tracking-wider">
                      <th className="py-2 px-3 text-start">المرجع</th>
                      <th className="py-2 px-3 text-start">العميل</th>
                      <th className="py-2 px-3 text-start hidden md:table-cell">الرحلة</th>
                      <th className="py-2 px-3 text-start">المبلغ</th>
                      <th className="py-2 px-3 text-start">الحالة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentBookings.slice(0, 7).map((b) => (
                      <tr key={b.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="py-2.5 px-3 font-mono text-xs text-primary font-bold">{b.reference}</td>
                        <td className="py-2.5 px-3">{b.customer.fullName}</td>
                        <td className="py-2.5 px-3 hidden md:table-cell text-muted-foreground">
                          <span className="line-clamp-1 max-w-[180px]">{b.trip.translations[0]?.title}</span>
                        </td>
                        <td className="py-2.5 px-3 font-bold tabular-nums whitespace-nowrap">
                          {Number(b.total).toLocaleString('ar-EG')} {b.currency === 'EGP' ? 'ج.م' : '$'}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${STATUS_COLORS[b.status] || 'bg-slate-100 text-slate-700'}`}>
                            {STATUS_LABELS_AR[b.status] || b.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">آخر الرسائل</CardTitle>
              <Link href="/admin/inquiries" className="text-xs text-primary hover:underline inline-flex items-center gap-1">
                الكل <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {data.recentInquiries.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">لا توجد رسائل</p>
            ) : (
              data.recentInquiries.map((i) => (
                <div key={i.id} className="border border-accent/15 rounded-lg p-3 hover:bg-muted/30 transition-colors">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="font-bold text-sm">{i.name}</div>
                    {!i.isRead && <Badge className="bg-pink-500 hover:bg-pink-500 text-white text-[10px] h-5 px-1.5">جديد</Badge>}
                  </div>
                  {i.subject && <div className="text-xs text-primary font-semibold mb-1">{i.subject}</div>}
                  <p className="text-xs text-muted-foreground line-clamp-2">{i.message}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function KpiCard({
  icon: Icon, color, label, value, delta, deltaLabel, sub,
}: {
  icon: typeof Map; color: string; label: string; value: string | number;
  delta?: number; deltaLabel?: string; sub?: string;
}) {
  const positive = (delta ?? 0) >= 0;
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4 md:p-5 relative">
        <div className={`absolute -top-8 -end-8 w-24 h-24 rounded-full opacity-10 bg-gradient-to-br ${color}`} />
        <div className="relative">
          <div className="flex items-center justify-between mb-3">
            <div className={`w-10 h-10 md:w-11 md:h-11 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white shadow-lg`}>
              <Icon className="h-5 w-5" />
            </div>
            {delta !== undefined && Number.isFinite(delta) && (
              <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-full ${
                positive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
              }`}>
                {positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {Math.abs(delta).toFixed(0)}%
              </span>
            )}
          </div>
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-bold mb-1">{label}</div>
          <div className="font-extrabold text-xl md:text-2xl tabular-nums text-foreground leading-tight">{value}</div>
          {(sub || deltaLabel) && <div className="text-[11px] text-muted-foreground mt-1.5 truncate">{sub || deltaLabel}</div>}
        </div>
      </CardContent>
    </Card>
  );
}

function SmallKpi({
  icon: Icon, color, label, value, href,
}: { icon: typeof Map; color: string; label: string; value: number; href?: string }) {
  const inner = (
    <div className="flex items-center gap-3 p-3 md:p-3.5 rounded-xl bg-white border border-accent/15 hover:border-accent/40 hover:shadow-md transition-all">
      <span className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>
        <Icon className="h-4 w-4" />
      </span>
      <div className="flex-1 min-w-0">
        <div className="text-[11px] text-muted-foreground truncate">{label}</div>
        <div className="font-bold text-lg tabular-nums">{value}</div>
      </div>
    </div>
  );
  return href ? <Link href={href as never}>{inner}</Link> : inner;
}
