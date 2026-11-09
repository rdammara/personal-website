import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getPost, getPublishedPosts, postDate, postSummary, type Post } from '@/lib/posts';

// Static export: every post page is built ahead of time; unknown slugs are 404s
export const dynamicParams = false;

export async function generateStaticParams() {
  return (await getPublishedPosts()).map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const post: Post | null = await getPost((await params).slug);
  return post ? { title: post.title, description: postSummary(post, 155) } : {};
}

export default async function BlogPostDetailPage({ params }: PageProps) {
  const post = await getPost((await params).slug);
  if (!post) notFound();

  const date = new Date(postDate(post));
  const edited = new Date(post.editedAt);

  return (
    <article className="mx-auto max-w-[760px] px-5 pb-30 pt-16 sm:px-10 max-sm:pb-18 max-sm:pt-10">
      <Link href="/blog" className="inline-flex min-h-11 items-center text-[15px] text-muted hover:text-accent">
        All posts
      </Link>

      <header className="mt-6 border-b border-line pb-8">
        <h1 className="m-0 text-[clamp(32px,4.6vw,52px)] font-bold leading-[1.08] tracking-[-0.03em]">{post.title}</h1>
        <p className="mb-0 mt-5 font-mono text-[14px] text-muted">
          {formatDate(date)}
          {edited.getTime() - date.getTime() > 24 * 3600 * 1000 && ` · updated ${formatDate(edited)}`}
        </p>
      </header>

      <div className="mt-10">
        <Markdown>{post.content}</Markdown>
      </div>
    </article>
  );
}
