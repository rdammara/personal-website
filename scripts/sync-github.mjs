// Mirrors Albert's public GitHub repos tagged with the "portfolio" topic into the
// Project table. Run with: node --env-file=.env scripts/sync-github.mjs
//
// Forks are skipped (the code is someone else's). Repos that lose the topic, go
// private or are deleted are removed here; projects added by hand (no githubId)
// are never touched. No token is needed for public data; GITHUB_TOKEN only raises
// GitHub's rate limit.

import { PrismaClient } from '@prisma/client';

const USER = process.env.GITHUB_USERNAME || 'rdammara';
const TOPIC = process.env.GITHUB_PORTFOLIO_TOPIC || 'portfolio';
const MAX_DESCRIPTION = 300;

const prisma = new PrismaClient();

async function github(path, accept = 'application/vnd.github+json') {
  const headers = { Accept: accept, 'User-Agent': 'albertdammara.com-sync', 'X-GitHub-Api-Version': '2022-11-28' };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  const res = await fetch(`https://api.github.com${path}`, { headers, signal: AbortSignal.timeout(20000) });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GitHub ${path} answered ${res.status}`);
  return accept.includes('raw') ? res.text() : res.json();
}

async function listRepos() {
  const repos = [];
  for (let page = 1; page <= 10; page++) {
    const batch = await github(`/users/${USER}/repos?type=owner&per_page=100&page=${page}`);
    if (!batch?.length) break;
    repos.push(...batch);
    if (batch.length < 100) break;
  }
  return repos;
}

// First prose paragraph of a README, for repos without an "About" description:
// skips headings, images, badges, lists, tables and code, then drops Markdown syntax
function readmeSummary(markdown) {
  const withoutCode = markdown.replace(/```[\s\S]*?```/g, '');
  for (const block of withoutCode.split(/\n\s*\n/)) {
    const text = block.trim();
    if (!text || /^(#|!\[|\[!\[|<|[-*+] |\d+\. |\||>)/.test(text)) continue;
    const plain = text
      .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
      .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
      .replace(/[*_`~]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    if (plain.length >= 20) return shorten(plain);
  }
  return '';
}

function shorten(text) {
  if (text.length <= MAX_DESCRIPTION) return text;
  const cut = text.slice(0, MAX_DESCRIPTION);
  const sentenceEnd = cut.lastIndexOf('. ');
  return sentenceEnd > 80 ? cut.slice(0, sentenceEnd + 1) : `${cut.slice(0, cut.lastIndexOf(' '))}…`;
}

async function main() {
  const run = await prisma.syncRun.create({ data: { source: 'github' } });
  try {
    const tagged = (await listRepos()).filter((r) => !r.fork && !r.private && (r.topics ?? []).includes(TOPIC));

    for (const repo of tagged) {
      let description = (repo.description ?? '').replace(/\s+/g, ' ').trim();
      if (!description) {
        const readme = await github(`/repos/${USER}/${repo.name}/readme`, 'application/vnd.github.raw+json');
        description = readme ? readmeSummary(readme) : '';
      }
      const data = {
        title: repo.name,
        description: shorten(description),
        externalUrl: repo.html_url,
        homepageUrl: repo.homepage?.trim() || null,
        language: repo.language ?? null,
        repoUpdatedAt: new Date(repo.pushed_at ?? repo.updated_at),
        createdAt: new Date(repo.created_at),
      };
      // One row per repo: githubId isn't a unique column (see schema.prisma), so look it up first
      const existing = await prisma.project.findFirst({ where: { githubId: repo.id } });
      if (existing) await prisma.project.update({ where: { id: existing.id }, data });
      else await prisma.project.create({ data: { ...data, githubId: repo.id } });
    }

    const keep = tagged.map((r) => r.id);
    const { count: removed } = await prisma.project.deleteMany({
      where: { githubId: { not: null, notIn: keep } },
    });

    const message = `${tagged.length} tagged "${TOPIC}" on GitHub, ${removed} removed`;
    await prisma.syncRun.update({ where: { id: run.id }, data: { finishedAt: new Date(), ok: true, postsSeen: tagged.length, message } });
    console.log(message);
  } catch (error) {
    await prisma.syncRun.update({
      where: { id: run.id },
      data: { finishedAt: new Date(), ok: false, message: String(error?.message ?? error).slice(0, 500) },
    });
    throw error;
  }
}

main()
  .catch((error) => {
    console.error('GitHub sync failed:', error?.message ?? error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
