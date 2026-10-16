import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { formatDate, excerpt } from '@/lib/utils';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 0;

async function getPost(slug: string) {
  const post = await prisma.blogPost.findUnique({ where: { slug } });
  if (!post || (!post.published && process.env.NODE_ENV === 'production')) return null;
  return post;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const post = await getPost((await params).slug);
  return post ? { title: post.title, description: excerpt(post.content, 155) } : {};
}

export default async function BlogPostDetailPage({ params }: PageProps) {
  const post = await getPost((await params).slug);
  if (!post) notFound();

  return (
    <article className="mx-auto max-w-[760px] px-5 pb-30 pt-16 sm:px-10 max-sm:pb-18 max-sm:pt-10">
      <Link href="/blog" className="inline-flex min-h-11 items-center text-[15px] text-muted hover:text-accent">
        All posts
      </Link>

      <header className="mt-6 border-b border-line pb-8">
        {!post.published && (
          <p className="mb-3 font-mono text-[13px] text-accent">Draft: only visible in development</p>
        )}
        <h1 className="m-0 text-[clamp(32px,4.6vw,52px)] font-bold leading-[1.08] tracking-[-0.03em]">{post.title}</h1>
        <p className="mb-0 mt-5 font-mono text-[14px] text-muted">
          {formatDate(post.createdAt)}
          {post.updatedAt.getTime() - post.createdAt.getTime() > 60_000 && ` · updated ${formatDate(post.updatedAt)}`}
        </p>
      </header>

      <div className="mt-10 space-y-6 text-[19px] leading-relaxed">
        {post.content.split('\n\n').map((paragraph, idx) => (
          <p key={idx} className="m-0 whitespace-pre-line">
            {paragraph}
          </p>
        ))}
      </div>
    </article>
  );
}
