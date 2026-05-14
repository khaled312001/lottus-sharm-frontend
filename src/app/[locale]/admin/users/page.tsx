'use client';

import { useEffect, useState } from 'react';
import { useAdminApi, useAdminAuth } from '@/lib/admin-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface User {
  id: number;
  email: string;
  name: string;
  role: 'SUPER_ADMIN' | 'EDITOR';
  isActive: boolean;
  lastLoginAt?: string | null;
}

export default function AdminUsersPage() {
  const api = useAdminApi();
  const { user } = useAdminAuth();
  const [items, setItems] = useState<User[]>([]);
  const [form, setForm] = useState({ email: '', password: '', name: '', role: 'EDITOR' as 'EDITOR' | 'SUPER_ADMIN' });

  const isSuper = user?.role === 'SUPER_ADMIN';

  const load = async () => {
    try {
      const res = await api.get<{ items: User[] }>('/admin/users');
      setItems(res.items);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error');
    }
  };
  useEffect(() => { void load(); /* eslint-disable-next-line */ }, []);

  const create = async () => {
    try {
      await api.post('/admin/users', form);
      toast.success('تم الإنشاء');
      setForm({ email: '', password: '', name: '', role: 'EDITOR' });
      void load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error');
    }
  };

  const del = async (id: number) => {
    if (!confirm('حذف المستخدم؟')) return;
    try { await api.delete(`/admin/users/${id}`); void load(); } catch (e) { toast.error(e instanceof Error ? e.message : 'Error'); }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">المستخدمون</h2>

      {isSuper && (
        <Card>
          <CardHeader><CardTitle>إضافة مستخدم</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <Input placeholder="الاسم" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Input type="email" placeholder="البريد الإلكتروني" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <Input type="password" placeholder="كلمة المرور (8 أحرف على الأقل)" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            <select className="h-11 rounded-lg border px-3" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as 'EDITOR' | 'SUPER_ADMIN' })}>
              <option value="EDITOR">محرر</option>
              <option value="SUPER_ADMIN">مدير عام</option>
            </select>
            <Button onClick={create}><Plus className="h-4 w-4" /> إضافة</Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr>
                <th className="py-3 px-3 text-right">الاسم</th>
                <th className="py-3 px-3 text-right">الإيميل</th>
                <th className="py-3 px-3 text-right">الدور</th>
                <th className="py-3 px-3 text-right">آخر دخول</th>
                <th className="py-3 px-3 text-right">الحالة</th>
                <th className="py-3 px-3 text-right">حذف</th>
              </tr>
            </thead>
            <tbody>
              {items.map((u) => (
                <tr key={u.id} className="border-t hover:bg-muted/20">
                  <td className="py-2 px-3 font-semibold">{u.name}</td>
                  <td className="py-2 px-3">{u.email}</td>
                  <td className="py-2 px-3"><Badge variant={u.role === 'SUPER_ADMIN' ? 'default' : 'secondary'}>{u.role}</Badge></td>
                  <td className="py-2 px-3 text-xs">{u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString('ar-EG') : '—'}</td>
                  <td className="py-2 px-3"><Badge variant={u.isActive ? 'default' : 'secondary'}>{u.isActive ? 'نشط' : 'موقوف'}</Badge></td>
                  <td className="py-2 px-3">
                    {isSuper && u.id !== user?.id && (
                      <Button size="icon" variant="ghost" onClick={() => del(u.id)}><Trash2 className="h-4 w-4 text-red-600" /></Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
