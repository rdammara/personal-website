import { prisma } from '@/lib/prisma';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';
import { Briefcase, Download, ExternalLink, Sparkles } from 'lucide-react';

export const revalidate = 0;

export default async function PortfolioPage() {
  const projects = await prisma.project.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Header */}
      <div className="max-w-2xl space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
          <Briefcase className="w-3.5 h-3.5" />
          Featured Work
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-950 dark:text-white">
          Portfolio & Case Studies
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          A showcase of full-stack web applications, AI tools, and open source repositories.
        </p>
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl">
          <p className="text-slate-500">No projects added yet. Add one from the Admin Dashboard!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card key={project.id} className="flex flex-col justify-between hover:shadow-xl transition-all hover:border-blue-500/40">
              <CardHeader>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <Badge variant="outline">Project</Badge>
                  <span className="text-xs text-slate-400">{formatDate(project.createdAt)}</span>
                </div>
                <CardTitle className="text-xl">{project.title}</CardTitle>
                <CardDescription className="line-clamp-4 mt-3 leading-relaxed">
                  {project.description}
                </CardDescription>
              </CardHeader>
              <CardFooter className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 pt-4 gap-2">
                <div className="flex items-center gap-2">
                  {project.downloadUrl && (
                    <a
                      href={project.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download
                    </a>
                  )}
                  {project.externalUrl && (
                    <a
                      href={project.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Visit Site
                    </a>
                  )}
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
