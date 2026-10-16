import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { site } from '@/lib/site';
import { formatDate } from '@/lib/utils';
import { PageHeader } from '@/components/PageHeader';

export const revalidate = 0;

export const metadata: Metadata = { title: 'Work' };

export default async function PortfolioPage() {
  const projects = await prisma.project.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="mx-auto max-w-[1180px] px-5 pb-30 sm:px-10 max-sm:pb-18">
      <PageHeader
        title="Work"
        intro="My projects live on GitHub while I write them up properly. Each one will get a page here with the problem, the stack and what came out of it."
      >
        <p className="mb-0 mt-6">
          <a href={site.githubUrl} className="font-semibold text-accent hover:underline">
            All repositories on GitHub
          </a>
        </p>
      </PageHeader>

      {projects.length === 0 ? (
        <p className="border-t border-line pt-8 text-muted">No project write-ups are published yet.</p>
      ) : (
        <ul className="m-0 list-none p-0">
          {projects.map((project) => (
            <li
              key={project.id}
              className="grid gap-2 border-t border-line py-8 last:border-b md:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)_auto] md:gap-8"
            >
              <div>
                <h2 className="m-0 text-[22px] font-bold leading-tight tracking-[-0.01em]">{project.title}</h2>
                <p className="mb-0 mt-1.5 font-mono text-[13px] text-muted">{formatDate(project.createdAt)}</p>
              </div>
              <p className="m-0 text-muted">{project.description}</p>
              <div className="flex flex-wrap gap-x-5 gap-y-1 md:flex-col md:items-end">
                {project.externalUrl && (
                  <a href={project.externalUrl} className="inline-flex min-h-11 items-center font-semibold text-accent hover:underline">
                    {project.externalUrl.startsWith('https://github.com/') ? 'Code' : 'Visit'}
                  </a>
                )}
                {project.downloadUrl && (
                  <a href={project.downloadUrl} className="inline-flex min-h-11 items-center font-semibold text-accent hover:underline">
                    Download
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
