import type { Metadata } from 'next';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { formatDate, excerpt } from '@/lib/utils';
import { PageHeader } from '@/components/PageHeader';

export const revalidate = 0;

export const metadata: Metadata = { title: 'Blog' };

export default async function BlogPage() {
  const posts = await prisma.blogPost.findMany({
    where: { published: true },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="mx-auto max-w-[1180px] px-5 pb-30 sm:px-10 max-sm:pb-18">
      <PageHeader title="Blog"intro="Notes on data engineering and the work around it." />

      {posts.length === 0 ? (
        <p className="border-t border-line pt-8 text-muted">No posts are published yet.</p>
      ) : (
        <ol className="m-0 list-none p-0">
          {posts.map((post) => (
            <li
              key={post.id}
              className="grid gap-1.5 border-t border-line py-7 last:border-b sm:grid-cols-[150px_minmax(0,1fr)] sm:gap-6"
            >
              <p className="m-0 font-mono text-[13px] text-muted sm:pt-1.5">{formatDate(post.createdAt)}</p>
              <div>
                <h2 className="m-0 text-[24px] font-bold leading-tight tracking-[-0.01em]">
                  <Link href={`/blog/${post.slug}`} className="text-ink no-underline hover:text-accent">
                    {post.title}
                  </Link>
                </h2>
                <p className="mb-0 mt-2 max-w-[40em] text-muted">{excerpt(post.content, 200)}</p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
