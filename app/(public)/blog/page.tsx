import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';
import { BookOpen, ArrowRight, Calendar } from 'lucide-react';

export const revalidate = 0;

export default async function BlogPage() {
  const posts = await prisma.blogPost.findMany({
    where: { published: true },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Header */}
      <div className="max-w-2xl space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
          <BookOpen className="w-3.5 h-3.5" />
          Technical Publications
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-950 dark:text-white">
          Blog & Engineering Notes
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Deep dives into full-stack development, modern web architecture, and AI-assisted workflows.
        </p>
      </div>

      {/* Posts Grid */}
      {posts.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl">
          <p className="text-slate-500">No published articles yet. Create one from the Admin Dashboard!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {posts.map((post) => (
            <Card key={post.id} className="flex flex-col justify-between hover:shadow-lg transition-all hover:border-blue-500/40">
              <CardHeader>
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-2">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{formatDate(post.createdAt)}</span>
                  <span>•</span>
                  <Badge variant="secondary">Published</Badge>
                </div>
                <CardTitle className="text-xl leading-snug">
                  <Link href={`/blog/${post.slug}`} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    {post.title}
                  </Link>
                </CardTitle>
                <CardDescription className="line-clamp-3 mt-3 leading-relaxed">
                  {post.content}
                </CardDescription>
              </CardHeader>
              <CardFooter className="border-t border-slate-100 dark:border-slate-800/80 pt-4">
                <Link
                  href={`/blog/${post.slug}`}
                  className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1.5"
                >
                  Read full article
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
