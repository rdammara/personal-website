import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';
import { ArrowLeft, Calendar, User, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 0;

export default async function BlogPostDetailPage({ params }: PageProps) {
  const { slug } = await params;

  const post = await prisma.blogPost.findUnique({
    where: { slug },
  });

  if (!post || (!post.published && process.env.NODE_ENV === 'production')) {
    notFound();
  }

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Back link */}
      <div>
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to all articles
        </Link>
      </div>

      {/* Article Header */}
      <header className="space-y-4 border-b border-slate-200 dark:border-slate-800 pb-8">
        <div className="flex items-center gap-2">
          <Badge variant="default">Engineering</Badge>
          {!post.published && <Badge variant="secondary">Draft Preview</Badge>}
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-950 dark:text-white leading-tight">
          {post.title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(post.createdAt)}</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1.5">
            <User className="w-4 h-4" />
            <span>DevPortfolio Staff</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            <span>3 min read</span>
          </div>
        </div>
      </header>

      {/* Article Body */}
      <div className="prose prose-slate dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 leading-relaxed space-y-6 text-base sm:text-lg">
        {post.content.split('\n\n').map((paragraph, idx) => (
          <p key={idx} className="whitespace-pre-line">
            {paragraph}
          </p>
        ))}
      </div>
    </article>
  );
}
