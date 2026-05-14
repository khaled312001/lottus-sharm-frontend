'use client';

import { useEffect, useState } from 'react';
import { Link } from '@/i18n/routing';
import { useAdminApi } from '@/lib/admin-auth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface BlogItem {
  id: number;
  slug: string;
  status: 'DRAFT' | 'PUBLISHED';
  publishedAt?: string | null;
  readTime: number;
  translations: Array<{ locale: string; title: string; excerpt: string }>;
}

export default function AdminBlogPage() {
  const api = useAdminApi();
  const [items, setItems] = useState<BlogItem[]>([]);

  const load = async () => {
    try {
      const res = await api.get<{ items: BlogItem[] }>('/admin/blog');
      setItems(res.items);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error');
    }
  };
  useEffect(() => { void load(); /* eslint-disable-next-line */ }, []);

  const del = async (id: number) => {
    if (!confirm('حذف المقال؟')) return;
    try { await api.delete(`/admin/blog/${id}`); void load(); } catch (e) { toast.error(e instanceof Error ? e.message : 'Error'); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">المدونة</h2>
        <Button asChild><Link href="/admin/blog/new"><Plus className="h-4 w-4" /> مقال جديد</Link></Button>
      </div>
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          {items.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">لا توجد مقالات</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-muted/40">
                <tr><th className="py-3 px-3 text-right">العنوان</th><th className="py-3 px-3 text-right">الرابط</th><th className="py-3 px-3 text-right">الحالة</th><th className="py-3 px-3 text-right">تاريخ النشر</th><th className="py-3 px-3 text-right">إجراءات</th></tr>
              </thead>
              <tbody>
                {items.map((p) => (
                  <tr key={p.id} className="border-t hover:bg-muted/20">
                    <td className="py-2 px-3 font-semibold">{p.translations.find((t) => t.locale === 'AR')?.title || p.translations[0]?.title}</td>
                    <td className="py-2 px-3 font-mono text-xs">{p.slug}</td>
                    <td className="py-2 px-3"><Badge variant={p.status === 'PUBLISHED' ? 'default' : 'secondary'}>{p.status === 'PUBLISHED' ? 'منشور' : 'مسودة'}</Badge></td>
                    <td className="py-2 px-3 text-xs">{p.publishedAt ? new Date(p.publishedAt).toLocaleDateString('ar-EG') : '—'}</td>
                    <td className="py-2 px-3">
                      <Button asChild size="icon" variant="ghost"><Link href={{ pathname: '/admin/blog/[id]', params: { id: String(p.id) } }}><Edit className="h-4 w-4" /></Link></Button>
                      <Button size="icon" variant="ghost" onClick={() => del(p.id)}><Trash2 className="h-4 w-4 text-red-600" /></Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
