import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';
import {
  ArrowRight,
  Database,
  Layers,
  Sparkles,
  Bot,
  ExternalLink,
  Download,
  BookOpen,
  Briefcase,
  CheckCircle2,
} from 'lucide-react';

export const revalidate = 0; // Fresh dynamic data on every request

export default async function HomePage() {
  // Query featured database items via Prisma
  const [recentPosts, recentProjects, postCount, projectCount] = await Promise.all([
    prisma.blogPost.findMany({
      where: { published: true },
      orderBy: { createdAt: 'desc' },
      take: 2,
    }),
    prisma.project.findMany({
      orderBy: { createdAt: 'desc' },
      take: 2,
    }),
    prisma.blogPost.count({ where: { published: true } }),
    prisma.project.count(),
  ]);

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 sm:pt-24 pb-12 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-b from-blue-50/50 via-white to-transparent dark:from-blue-950/20 dark:via-slate-950 dark:to-transparent">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              <Sparkles className="w-3.5 h-3.5" />
              Next.js 16 App Router • TypeScript • Tailwind CSS • Prisma SQLite
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-950 dark:text-white leading-[1.1]">
              Modern Full-Stack Engineering with{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500">
                Grounding & AI
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 leading-relaxed">
              A high-performance web architecture combining Server Components, an embedded SQLite database with Prisma ORM, responsive Tailwind styling, and an intelligent RAG knowledge assistant.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <Link href="/portfolio">
                <Button size="lg" className="gap-2 shadow-md">
                  <Briefcase className="w-4 h-4" />
                  View Portfolio ({projectCount})
                </Button>
              </Link>
              <Link href="/blog">
                <Button variant="outline" size="lg" className="gap-2">
                  <BookOpen className="w-4 h-4" />
                  Read Articles ({postCount})
                </Button>
              </Link>
              <Link href="/admin">
                <Button variant="secondary" size="lg" className="gap-2">
                  Admin Dashboard
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack Pillars */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Architected for Speed & Reliability
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
            Structured around Next.js App Router patterns, type-safe persistence, and local context retrieval.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:border-blue-500/50 transition-all hover:shadow-md">
            <CardHeader>
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-2">
                <Layers className="w-5 h-5" />
              </div>
              <CardTitle>Next.js App Router</CardTitle>
              <CardDescription>
                React Server Components, route groups, and streaming layouts for optimal performance.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Isolated Route Groups: (public), admin, api</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>TypeScript strict mode configuration</span>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:border-indigo-500/50 transition-all hover:shadow-md">
            <CardHeader>
              <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-2">
                <Database className="w-5 h-5" />
              </div>
              <CardTitle>Prisma ORM (SQLite)</CardTitle>
              <CardDescription>
                Zero-config, fast, embedded persistence with type-safe schema models.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>User, BlogPost, and Project relational entities</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Synchronized via SQLite dev.db</span>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:border-cyan-500/50 transition-all hover:shadow-md">
            <CardHeader>
              <div className="w-10 h-10 rounded-lg bg-cyan-100 dark:bg-cyan-900/40 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mb-2">
                <Bot className="w-5 h-5" />
              </div>
              <CardTitle>RAG AI Grounding</CardTitle>
              <CardDescription>
                Live retrieval augmented generation connecting the ChatWidget directly to database records.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Real-time text chunking and similarity scoring</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Floating ChatWidget with instant answers</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Featured Projects Preview */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Featured Projects</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">Recent builds and open source tools.</p>
          </div>
          <Link href="/portfolio" className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1">
            Browse all ({projectCount}) <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {recentProjects.map((project) => (
            <Card key={project.id} className="flex flex-col justify-between hover:shadow-lg transition-all">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-lg">{project.title}</CardTitle>
                  <Badge variant="secondary">SQLite</Badge>
                </div>
                <CardDescription className="line-clamp-2 mt-2">
                  {project.description}
                </CardDescription>
              </CardHeader>
              <CardFooter className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 pt-4">
                <span className="text-xs text-slate-500">
                  Added {formatDate(project.createdAt)}
                </span>
                <div className="flex items-center gap-2">
                  {project.downloadUrl && (
                    <a
                      href={project.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                      title="Download project"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  )}
                  {project.externalUrl && (
                    <a
                      href={project.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                      title="External link"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      {/* Latest Blog Posts Preview */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">From the Blog</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">Technical insights, tutorials, and notes.</p>
          </div>
          <Link href="/blog" className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1">
            Read all ({postCount}) <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {recentPosts.map((post) => (
            <Card key={post.id} className="flex flex-col justify-between hover:shadow-md transition-all">
              <CardHeader>
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1">
                  <span>{formatDate(post.createdAt)}</span>
                  <span>•</span>
                  <Badge variant="outline">Article</Badge>
                </div>
                <CardTitle className="text-lg">
                  <Link href={`/blog/${post.slug}`} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    {post.title}
                  </Link>
                </CardTitle>
                <CardDescription className="line-clamp-3 mt-2">
                  {post.content}
                </CardDescription>
              </CardHeader>
              <CardFooter className="border-t border-slate-100 dark:border-slate-800/80 pt-4">
                <Link
                  href={`/blog/${post.slug}`}
                  className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                >
                  Read full post <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
