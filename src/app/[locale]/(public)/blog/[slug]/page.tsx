import { notFound } from 'next/navigation';
import Image from 'next/image';
import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { api } from '@/lib/api';
import type { BlogPostDTO } from '@/types/api';
import { localeToApiCode } from '@/lib/utils';
import { Calendar, Clock } from 'lucide-react';

async function fetchPost(slug: string, locale: string): Promise<BlogPostDTO | null> {
  try {
    return await api.get<BlogPostDTO>(`/public/blog/${slug}?locale=${localeToApiCode(locale)}`);
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { slug, locale } = await params;
  const post = await fetchPost(slug, locale);
  if (!post) return { title: 'Post not found' };
  return {
    title: post.tr?.metaTitle || post.tr?.title,
    description: post.tr?.metaDesc || post.tr?.excerpt,
    openGraph: { title: post.tr?.title, description: post.tr?.excerpt, images: post.coverImage?.url ? [post.coverImage.url] : [] },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { slug, locale } = await params;
  setRequestLocale(locale);
  const post = await fetchPost(slug, locale);
  if (!post) notFound();

  return (
    <article className="container py-10 max-w-3xl">
      <h1 className="text-3xl md:text-5xl font-extrabold mb-4">{post.tr?.title}</h1>
      <div className="flex items-center gap-3 text-sm text-muted-foreground mb-6">
        {post.author && <span>{post.author.name}</span>}
        {post.publishedAt && <span className="inline-flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {new Date(post.publishedAt).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en')}</span>}
        <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {post.readTime} min</span>
      </div>
      {post.coverImage?.url && (
        <div className="relative aspect-[16/9] mb-8 rounded-2xl overflow-hidden">
          <Image src={post.coverImage.url} alt={post.tr?.title || ''} fill sizes="(max-width: 768px) 100vw, 768px" className="object-cover" priority />
        </div>
      )}
      <div className="prose prose-lg max-w-none rtl:prose-rtl" dangerouslySetInnerHTML={{ __html: post.tr?.content || '' }} />
    </article>
  );
}
