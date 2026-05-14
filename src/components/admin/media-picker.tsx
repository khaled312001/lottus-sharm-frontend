'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useAdminApi, useAdminAuth } from '@/lib/admin-auth';
import { toast } from 'sonner';
import { API_BASE } from '@/lib/api';
import type { MediaDTO } from '@/types/api';
import { cn } from '@/lib/utils';

interface BaseProps {
  label: string;
}
type Props =
  | (BaseProps & { mode: 'single'; value: MediaDTO | null; onChange: (m: MediaDTO | null) => void })
  | (BaseProps & { mode: 'multi'; value: MediaDTO[]; onChange: (m: MediaDTO[]) => void });

export function MediaPicker(props: Props) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <div className="text-sm font-semibold mb-1.5">{props.label}</div>
      {props.mode === 'single' ? (
        <div className="flex items-center gap-3">
          {props.value ? (
            <div className="relative w-32 h-24 rounded-lg overflow-hidden border">
              <Image src={props.value.thumbnailUrl || props.value.url} alt="" fill sizes="128px" className="object-cover" />
              <button onClick={() => props.onChange(null)} className="absolute top-1 end-1 p-1 rounded-full bg-black/60 text-white"><X className="h-3 w-3" /></button>
            </div>
          ) : (
            <div className="w-32 h-24 rounded-lg bg-muted border-2 border-dashed flex items-center justify-center text-muted-foreground"><ImageIcon className="h-6 w-6" /></div>
          )}
          <Button type="button" variant="outline" onClick={() => setOpen(true)}>اختر صورة</Button>
        </div>
      ) : (
        <div>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-2">
            {props.value.map((m, i) => (
              <div key={m.id} className="relative aspect-square rounded-lg overflow-hidden border group">
                <Image src={m.thumbnailUrl || m.url} alt="" fill sizes="100px" className="object-cover" />
                <button onClick={() => props.onChange(props.value.filter((_, x) => x !== i))} className="absolute top-1 end-1 p-1 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100"><X className="h-3 w-3" /></button>
              </div>
            ))}
            <button onClick={() => setOpen(true)} className="aspect-square rounded-lg border-2 border-dashed flex items-center justify-center hover:bg-muted text-muted-foreground" type="button">
              <Upload className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {open && (
        <MediaModal
          mode={props.mode}
          existingIds={props.mode === 'multi' ? props.value.map((m) => m.id) : []}
          onClose={() => setOpen(false)}
          onPick={(m) => {
            if (props.mode === 'single') {
              props.onChange(m[0] ?? null);
            } else {
              const existing = props.value;
              const merged = [...existing];
              m.forEach((nm) => { if (!merged.find((x) => x.id === nm.id)) merged.push(nm); });
              props.onChange(merged);
            }
            setOpen(false);
          }}
        />
      )}
    </div>
  );
}

function MediaModal({
  mode,
  existingIds,
  onClose,
  onPick,
}: {
  mode: 'single' | 'multi';
  existingIds: number[];
  onClose: () => void;
  onPick: (m: MediaDTO[]) => void;
}) {
  const api = useAdminApi();
  const { token } = useAdminAuth();
  const [items, setItems] = useState<MediaDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get<{ items: MediaDTO[] }>('/admin/media?pageSize=100');
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
      toast.success('تم الرفع');
      void load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error');
    } finally {
      setUploading(false);
    }
  };

  const toggle = (id: number) => {
    if (mode === 'single') {
      setSelected(new Set([id]));
    } else {
      setSelected((prev) => {
        const s = new Set(prev);
        if (s.has(id)) s.delete(id); else s.add(id);
        return s;
      });
    }
  };

  const confirm = () => {
    const picked = items.filter((i) => selected.has(i.id));
    onPick(picked);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
      <Card className="w-full max-w-5xl max-h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <CardHeader className="border-b">
          <CardTitle className="flex items-center justify-between">
            <span>اختر من الميديا</span>
            <div className="flex gap-2 items-center">
              <label className="cursor-pointer">
                <input type="file" multiple accept="image/*,video/*" className="hidden" onChange={(e) => upload(e.target.files)} />
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary text-white text-sm cursor-pointer">
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  رفع جديد
                </span>
              </label>
              <Button variant="ghost" size="icon" onClick={onClose}><X className="h-4 w-4" /></Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="py-12 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>
          ) : (
            <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
              {items.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => toggle(m.id)}
                  className={cn(
                    'relative aspect-square rounded-lg overflow-hidden border-2 transition-all',
                    selected.has(m.id) ? 'border-primary ring-2 ring-primary' : 'border-transparent hover:border-muted',
                    existingIds.includes(m.id) && 'opacity-50',
                  )}
                >
                  {m.type === 'IMAGE' ? (
                    <Image src={m.thumbnailUrl || m.url} alt="" fill sizes="100px" className="object-cover" />
                  ) : (
                    <div className="w-full h-full bg-black flex items-center justify-center text-white text-xs">VIDEO</div>
                  )}
                  {selected.has(m.id) && (
                    <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                      <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs">✓</div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </CardContent>
        <div className="p-4 border-t flex justify-between items-center">
          <span className="text-sm text-muted-foreground">{selected.size} مختار</span>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>إلغاء</Button>
            <Button onClick={confirm} disabled={selected.size === 0}>تأكيد ({selected.size})</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
