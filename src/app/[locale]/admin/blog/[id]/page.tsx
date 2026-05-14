'use client';

import { use, useEffect, useState } from 'react';
import { useAdminApi } from '@/lib/admin-auth';
import { BlogForm } from '@/components/admin/blog-form';
import { Loader2 } from 'lucide-react';

export default function EditBlogPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const api = useAdminApi();
  const [post, setPost] = useState<Parameters<typeof BlogForm>[0]['initial'] | null>(null);

  useEffect(() => {
    api.get<Parameters<typeof BlogForm>[0]['initial']>(`/admin/blog/${id}`).then((data) => setPost(data || null)).catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!post) return <div className="py-12 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>;
  return <BlogForm initial={post} />;
}
