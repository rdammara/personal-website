import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/lib/utils';
import {
  Users,
  BookOpen,
  Briefcase,
  PlusCircle,
  ExternalLink,
  ShieldAlert,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export const revalidate = 0;

export default async function AdminDashboardPage() {
  const [userCount, postCount, publishedPostCount, projectCount, recentPosts, recentProjects] =
    await Promise.all([
      prisma.user.count(),
      prisma.blogPost.count(),
      prisma.blogPost.count({ where: { published: true } }),
      prisma.project.count(),
      prisma.blogPost.findMany({
        take: 4,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.project.findMany({
        take: 4,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-sm text-muted">
            Real-time stats and content management powered by SQLite and Prisma.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/admin/blog">
            <Button size="sm" className="gap-1.5">
              <PlusCircle className="w-4 h-4" />
              New Post
            </Button>
          </Link>
          <Link href="/admin/projects">
            <Button variant="outline" size="sm" className="gap-1.5">
              <PlusCircle className="w-4 h-4" />
              New Project
            </Button>
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted">
              Users in Database
            </CardTitle>
            <Users className="w-4 h-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userCount}</div>
            <p className="text-xs text-muted mt-1">Managed in SQLite User table</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted">
              Blog Posts
            </CardTitle>
            <BookOpen className="w-4 h-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{postCount}</div>
            <p className="text-xs text-muted mt-1">
              {publishedPostCount} published, {postCount - publishedPostCount} drafts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted">
              Portfolio Projects
            </CardTitle>
            <Briefcase className="w-4 h-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projectCount}</div>
            <p className="text-xs text-muted mt-1">Indexed for RAG retrieval</p>
          </CardContent>
        </Card>
      </div>

      {/* Content Management Quick View */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Posts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-lg">Recent Blog Posts</CardTitle>
              <CardDescription>Articles stored in SQLite</CardDescription>
            </div>
            <Link href="/admin/blog" className="text-xs font-semibold text-accent hover:underline">
              Manage all
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentPosts.map((post) => (
              <div
                key={post.id}
                className="flex items-center justify-between p-3 rounded-lg border border-line bg-surface text-sm"
              >
                <div className="truncate pr-3">
                  <div className="font-semibold text-ink truncate">{post.title}</div>
                  <div className="text-xs text-muted">{formatDate(post.createdAt)}</div>
                </div>
                <Badge variant={post.published ? 'success' : 'secondary'}>
                  {post.published ? 'Published' : 'Draft'}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Projects */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-lg">Recent Projects</CardTitle>
              <CardDescription>Showcase records</CardDescription>
            </div>
            <Link href="/admin/projects" className="text-xs font-semibold text-accent hover:underline">
              Manage all
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentProjects.map((project) => (
              <div
                key={project.id}
                className="flex items-center justify-between p-3 rounded-lg border border-line bg-surface text-sm"
              >
                <div className="truncate pr-3">
                  <div className="font-semibold text-ink truncate">{project.title}</div>
                  <div className="text-xs text-muted truncate">{project.description}</div>
                </div>
                <Badge variant="outline">
                  {project.externalUrl ? 'Linked' : 'Local'}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
