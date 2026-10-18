'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';
import { PlusCircle, Trash2, RefreshCw, Briefcase, ExternalLink, Download } from 'lucide-react';

interface Project {
  id: string;
  title: string;
  description: string;
  downloadUrl: string | null;
  externalUrl: string | null;
  createdAt: string;
}

export default function ManageProjectsPage() {
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [creating, setCreating] = React.useState(false);

  // Form state
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [downloadUrl, setDownloadUrl] = React.useState('');
  const [externalUrl, setExternalUrl] = React.useState('');

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/projects');
      const data = await res.json();
      if (Array.isArray(data)) setProjects(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;

    try {
      setCreating(true);
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          downloadUrl: downloadUrl || null,
          externalUrl: externalUrl || null,
        }),
      });

      if (res.ok) {
        setTitle('');
        setDescription('');
        setDownloadUrl('');
        setExternalUrl('');
        fetchProjects();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
      if (res.ok) fetchProjects();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
          Manage Projects
        </h1>
        <p className="text-sm text-muted">
          Create, view, and delete showcase projects stored in SQLite.
        </p>
      </div>

      {/* Create New Project Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-accent" />
            Add New Project
          </CardTitle>
          <CardDescription>
            Project descriptions are automatically made available to the RAG knowledge search.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateProject} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-ink">Project Title</label>
              <Input
                required
                placeholder="e.g. Real-Time Distributed Task Engine"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-ink">Description</label>
              <textarea
                required
                rows={3}
                className="flex w-full rounded-lg border border-control bg-bg px-3 py-2 text-sm text-ink placeholder:text-muted"
                placeholder="Describe project features, tech stack, and highlights..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-ink">External URL (optional)</label>
                <Input
                  type="url"
                  placeholder="https://github.com/..."
                  value={externalUrl}
                  onChange={(e) => setExternalUrl(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-ink">Download URL (optional)</label>
                <Input
                  type="url"
                  placeholder="https://.../download.zip"
                  value={downloadUrl}
                  onChange={(e) => setDownloadUrl(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={creating} className="gap-2">
                <PlusCircle className="w-4 h-4" />
                {creating ? 'Saving...' : 'Add Project'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Projects List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">All Projects ({projects.length})</CardTitle>
            <CardDescription>SQLite Project table records</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={fetchProjects} className="gap-1.5">
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="p-8 text-center text-muted">Loading projects...</div>
          ) : projects.length === 0 ? (
            <div className="p-8 text-center text-muted border border-dashed rounded-lg">
              No projects found.
            </div>
          ) : (
            <div className="divide-y divide-line">
              {projects.map((proj) => (
                <div key={proj.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1 max-w-xl">
                    <h3 className="font-semibold text-ink">{proj.title}</h3>
                    <p className="text-xs text-muted line-clamp-2">{proj.description}</p>
                    <div className="flex items-center gap-3 text-xs text-muted pt-1">
                      {proj.externalUrl && (
                        <span className="flex items-center gap-1 text-accent">
                          <ExternalLink className="w-3 h-3" /> External link
                        </span>
                      )}
                      {proj.downloadUrl && (
                        <span className="flex items-center gap-1 text-emerald-500">
                          <Download className="w-3 h-3" /> Download link
                        </span>
                      )}
                      <span>Added {formatDate(proj.createdAt)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(proj.id)}
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
