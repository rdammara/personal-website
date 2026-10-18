'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';
import { PlusCircle, Trash2, Check, X, RefreshCw, BookOpen } from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function ManageBlogPage() {
  const [posts, setPosts] = React.useState<BlogPost[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [creating, setCreating] = React.useState(false);

  // Form state
  const [title, setTitle] = React.useState('');
  const [slug, setSlug] = React.useState('');
  const [content, setContent] = React.useState('');
  const [published, setPublished] = React.useState(true);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/posts');
      const data = await res.json();
      if (Array.isArray(data)) setPosts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchPosts();
  }, []);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    setSlug(
      val
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
    );
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !slug || !content) return;

    try {
      setCreating(true);
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, slug, content, published }),
      });

      if (res.ok) {
        setTitle('');
        setSlug('');
        setContent('');
        setPublished(true);
        fetchPosts();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const togglePublished = async (post: BlogPost) => {
    try {
      const res = await fetch(`/api/posts/${post.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: !post.published }),
      });
      if (res.ok) fetchPosts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    try {
      const res = await fetch(`/api/posts/${id}`, { method: 'DELETE' });
      if (res.ok) fetchPosts();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
          Manage Blog Posts
        </h1>
        <p className="text-sm text-muted">
          Create, edit, toggle publishing, and delete articles saved in SQLite.
        </p>
      </div>

      {/* Create New Post Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-accent" />
            Create New Article
          </CardTitle>
          <CardDescription>
            All published articles are automatically indexed into the RAG vector engine.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreatePost} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-ink">Title</label>
                <Input
                  required
                  placeholder="e.g. Next.js Server Actions Demystified"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-ink">URL Slug</label>
                <Input
                  required
                  placeholder="e.g. nextjs-server-actions-demystified"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-ink">Content</label>
              <textarea
                required
                rows={5}
                className="flex w-full rounded-lg border border-control bg-bg px-3 py-2 text-sm text-ink placeholder:text-muted"
                placeholder="Write full article markdown or text..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm font-medium text-ink cursor-pointer">
                <input
                  type="checkbox"
                  checked={published}
                  onChange={(e) => setPublished(e.target.checked)}
                  className="rounded border-control text-accent w-4 h-4"
                />
                Publish immediately
              </label>

              <Button type="submit" disabled={creating} className="gap-2">
                <PlusCircle className="w-4 h-4" />
                {creating ? 'Saving...' : 'Save Article'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Posts List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">All Blog Posts ({posts.length})</CardTitle>
            <CardDescription>SQLite BlogPost table records</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={fetchPosts} className="gap-1.5">
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="p-8 text-center text-muted">Loading articles...</div>
          ) : posts.length === 0 ? (
            <div className="p-8 text-center text-muted border border-dashed rounded-lg">
              No articles found.
            </div>
          ) : (
            <div className="divide-y divide-line">
              {posts.map((post) => (
                <div key={post.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1 max-w-xl">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-ink">{post.title}</h3>
                      <Badge variant={post.published ? 'success' : 'secondary'}>
                        {post.published ? 'Published' : 'Draft'}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted line-clamp-1">{post.content}</p>
                    <div className="text-[11px] text-muted font-mono">/blog/{post.slug}</div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => togglePublished(post)}
                    >
                      {post.published ? 'Unpublish' : 'Publish'}
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(post.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
