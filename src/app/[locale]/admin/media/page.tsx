'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useAdminApi, useAdminAuth } from '@/lib/admin-auth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { API_BASE } from '@/lib/api';
import type { MediaDTO } from '@/types/api';

export default function AdminMediaPage() {
  const api = useAdminApi();
  const { token } = useAdminAuth();
  const [items, setItems] = useState<MediaDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get<{ items: MediaDTO[] }>('/admin/media?pageSize=200');
      setItems(res.items);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); /* eslint-disable-next-line */ }, []);

  const upload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const form = new FormData();
      Array.from(files).forEach((f) => form.append('files', f));
      const res = await fetch(`${API_BASE}/admin/media/upload`, {
        method: 'POST',
        body: form,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: 'include',
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error?.message || 'Upload failed');
      toast.success(`تم رفع ${json.data.items.length} ملف`);
      void load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error');
    } finally {
      setUploading(false);
    }
  };

  const del = async (id: number) => {
    if (!confirm('حذف الملف؟')) return;
    try {
      await api.delete(`/admin/media/${id}`);
      void load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">مكتبة الميديا</h2>
        <label className="cursor-pointer">
          <input type="file" multiple accept="image/*,video/*" className="hidden" onChange={(e) => upload(e.target.files)} />
          <span className="inline-flex items-center gap-2 h-11 px-5 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90">
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            رفع ملفات
          </span>
        </label>
      </div>

      <Card>
        <CardContent className="p-4">
          {loading ? (
            <div className="py-12 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>
          ) : items.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">لا توجد ملفات</div>
          ) : (
            <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-8 gap-2">
              {items.map((m) => (
                <div key={m.id} className="relative aspect-square rounded-lg overflow-hidden border group">
                  {m.type === 'IMAGE' ? (
                    <Image src={m.thumbnailUrl || m.url} alt="" fill sizes="120px" className="object-cover" />
                  ) : (
                    <div className="w-full h-full bg-black flex items-center justify-center text-white text-xs">VIDEO</div>
                  )}
                  <button onClick={() => del(m.id)} className="absolute top-1 end-1 p-1.5 rounded-full bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
