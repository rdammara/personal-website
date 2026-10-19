import { prisma } from './prisma';

type ProjectLike = { repoUpdatedAt: Date | null; createdAt: Date };

// GitHub projects sort by their last push; hand-added ones (no repoUpdatedAt) come after
export function getProjects(take?: number) {
  return prisma.project.findMany({
    orderBy: [{ repoUpdatedAt: { sort: 'desc', nulls: 'last' } }, { createdAt: 'desc' }],
    take,
  });
}

// The date a project shows: its last push on GitHub, or when it was added here
export const projectDate = (project: ProjectLike) => project.repoUpdatedAt ?? project.createdAt;

export function getLastGithubSync() {
  return prisma.syncRun.findFirst({ where: { source: 'github', ok: true }, orderBy: { startedAt: 'desc' } });
}
