'use client';

import { useEffect, useState } from 'react';
import { useAdminApi, useAdminAuth } from '@/lib/admin-auth';
import { API_BASE } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Users, Download } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface CustomerItem {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  country?: string | null;
  language: string;
  createdAt: string;
  googleSub?: string | null;
  avatarUrl?: string | null;
  lastLoginAt?: string | null;
  _count?: { bookings: number };
}

type Source = 'ALL' | 'GOOGLE' | 'GUEST';

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.07 5.07 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"/>
      <path fill="#FBBC04" d="M5.84 14.11A6.59 6.59 0 0 1 5.48 12c0-.73.13-1.44.36-2.11V7.05H2.18A11 11 0 0 0 1 12c0 1.77.42 3.45 1.18 4.95l3.66-2.84z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.65l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.05l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/>
    </svg>
  );
}

function relative(iso?: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'الآن';
  if (m < 60) return `قبل ${m} د`;
  const h = Math.floor(m / 60);
  if (h < 24) return `قبل ${h} س`;
  const days = Math.floor(h / 24);
  if (days < 30) return `قبل ${days} ي`;
  return d.toLocaleDateString('ar-EG');
}

export default function AdminCustomersPage() {
  const api = useAdminApi();
  const { token } = useAdminAuth();
  const [items, setItems] = useState<CustomerItem[]>([]);
  const [total, setTotal] = useState(0);
  const [googleCount, setGoogleCount] = useState(0);
  const [search, setSearch] = useState('');
  const [source, setSource] = useState<Source>('ALL');
  const [loading, setLoading] = useState(true);

  const load = async (nextSource: Source = source) => {
    setLoading(true);
    try {
      const qs = new URLSearchParams();
      if (search) qs.set('search', search);
      qs.set('source', nextSource);
      const res = await api.get<{ items: CustomerItem[]; total: number; googleCount: number }>(`/admin/customers?${qs}`);
      setItems(res.items);
      setTotal(res.total);
      setGoogleCount(res.googleCount);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); /* eslint-disable-next-line */ }, []);

  const onSourceClick = (s: Source) => {
    setSource(s);
    void load(s);
  };

  const downloadCSV = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/exports/customers.csv`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `customers-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('تم تصدير CSV');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error');
    }
  };

  const guestCount = total - googleCount;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6 text-accent" />
            العملاء
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5 inline-flex flex-wrap items-center gap-x-3">
            <span>{total} عميل إجمالي</span>
            <span className="inline-flex items-center gap-1.5 text-emerald-700 font-bold">
              <GoogleIcon className="h-3.5 w-3.5" />
              {googleCount} عبر جوجل
            </span>
          </p>
        </div>
        <Button variant="outline" onClick={downloadCSV} className="text-xs">
          <Download className="h-3.5 w-3.5" /> تصدير CSV
        </Button>
      </div>

      {/* Filter tabs + search */}
      <Card>
        <CardContent className="p-3 flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-lg border bg-white overflow-hidden">
            {([
              { key: 'ALL', label: `الكل (${total})` },
              { key: 'GOOGLE', label: `جوجل (${googleCount})`, icon: true },
              { key: 'GUEST', label: `زائر (${guestCount})` },
            ] as Array<{ key: Source; label: string; icon?: boolean }>).map((tab) => (
              <button
                key={tab.key}
                onClick={() => onSourceClick(tab.key)}
                className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-2 text-sm font-semibold transition-colors',
                  source === tab.key ? 'bg-primary text-cream' : 'hover:bg-muted text-foreground/75',
                )}
              >
                {tab.icon && <GoogleIcon className="h-3.5 w-3.5" />}
                {tab.label}
              </button>
            ))}
          </div>
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute start-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="بحث (اسم، إيميل، هاتف)"
              className="ps-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && load()}
            />
          </div>
          <Button onClick={() => load()} variant="outline">بحث</Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 sticky top-0 z-10">
              <tr>
                <th className="py-3 px-3 text-right">العميل</th>
                <th className="py-3 px-3 text-right">الإيميل</th>
                <th className="py-3 px-3 text-right">الهاتف</th>
                <th className="py-3 px-3 text-right">الجنسية</th>
                <th className="py-3 px-3 text-right">حجوزات</th>
                <th className="py-3 px-3 text-right">آخر دخول</th>
                <th className="py-3 px-3 text-right">تسجيل</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="py-12 text-center text-muted-foreground">جاري التحميل...</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={7} className="py-12 text-center text-muted-foreground">
                  <Users className="h-10 w-10 mx-auto mb-2 opacity-30" />
                  لا يوجد عملاء بهذا الفلتر
                </td></tr>
              ) : items.map((c) => {
                const isGoogle = Boolean(c.googleSub);
                return (
                  <tr key={c.id} className="border-t hover:bg-muted/20">
                    <td className="py-2.5 px-3">
                      <div className="inline-flex items-center gap-2.5 min-w-0">
                        {c.avatarUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={c.avatarUrl} alt="" className="w-9 h-9 rounded-full object-cover shrink-0 ring-2 ring-accent/30" />
                        ) : (
                          <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-accent/15 text-accent-700 font-bold text-sm shrink-0">
                            {(c.fullName || '?').trim().charAt(0).toUpperCase()}
                          </span>
                        )}
                        <div className="min-w-0">
                          <div className="font-semibold text-primary truncate inline-flex items-center gap-1.5">
                            {c.fullName}
                            {isGoogle && (
                              <span title="مسجل عبر جوجل" className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-white border shadow-sm">
                                <GoogleIcon className="h-2.5 w-2.5" />
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-muted-foreground">#{c.id} · {c.language}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-3" dir="ltr">
                      <a href={`mailto:${c.email}`} className="text-accent-700 hover:underline">{c.email}</a>
                    </td>
                    <td className="py-2.5 px-3" dir="ltr">
                      {c.phone ? <a href={`tel:${c.phone}`} className="text-primary hover:underline">{c.phone}</a> : <span className="text-muted-foreground/60">—</span>}
                    </td>
                    <td className="py-2.5 px-3">{c.country || <span className="text-muted-foreground/60">—</span>}</td>
                    <td className="py-2.5 px-3 font-bold tabular-nums">{c._count?.bookings ?? 0}</td>
                    <td className="py-2.5 px-3 text-xs text-muted-foreground">
                      {c.lastLoginAt ? relative(c.lastLoginAt) : <span className="opacity-60">—</span>}
                    </td>
                    <td className="py-2.5 px-3 text-xs text-muted-foreground">{new Date(c.createdAt).toLocaleDateString('ar-EG')}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
