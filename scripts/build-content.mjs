// Fetches everything the site shows and saves it for the static build:
//   content/generated/posts.json      published Notion posts, as Markdown
//   content/generated/projects.json   GitHub repos tagged "portfolio"
//   content/generated/resume.json     the resume's text, from the PDF on the Notion Resume page
//   content/generated/meta.json       when each source was read
//   public/media/*                    photos from posts (Notion's own links expire)
//   public/Albert-Richard-Dammara-Resume.pdf
// The pages and the ask-bar function read these files; nothing is fetched at request time.
//
// Run with: npm run content

import { Client, collectPaginatedAPI, isFullPage } from '@notionhq/client';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { MEDIA_DIR, plain, slugify, blocksToMd, getChildren } from './notion-markdown.mjs';
import { existsSync } from 'node:fs';

// Locally the settings come from .env; GitHub Actions passes them as environment variables
if (existsSync('.env')) process.loadEnvFile('.env');

const { NOTION_TOKEN } = process.env;
// IDs, not secrets: the "Blog posts" database and the "Resume" page in Albert's Notion
const NOTION_DATA_SOURCE_ID = process.env.NOTION_DATA_SOURCE_ID || 'caf7c926-dc11-48de-972c-9b45eeb6caac';
const NOTION_RESUME_PAGE_ID = process.env.NOTION_RESUME_PAGE_ID || '413fb5ce-085a-81b2-a638-d92ca9274896';
const GITHUB_USER = process.env.GITHUB_USERNAME || 'rdammara';
const GITHUB_TOPIC = process.env.GITHUB_PORTFOLIO_TOPIC || 'portfolio';
const OUT_DIR = path.join(process.cwd(), 'content', 'generated');
const RESUME_FILE = 'Albert-Richard-Dammara-Resume.pdf';
const MAX_DESCRIPTION = 300;

if (!NOTION_TOKEN) throw new Error('NOTION_TOKEN must be set');

const notion = new Client({ auth: NOTION_TOKEN });

async function writeJson(name, data) {
  await writeFile(path.join(OUT_DIR, name), JSON.stringify(data, null, 2) + '\n');
}

// ---------- Blog posts ----------

function prop(page, name) {
  const p = page.properties[name];
  if (!p) return null;
  switch (p.type) {
    case 'title':
      return plain(p.title).trim();
    case 'rich_text':
      return plain(p.rich_text).trim() || null;
    case 'date':
      return p.date?.start ?? null;
    default:
      return null;
  }
}

async function buildPosts() {
  const pages = (
    await collectPaginatedAPI(notion.dataSources.query, {
      data_source_id: NOTION_DATA_SOURCE_ID,
      // LOCAL_TEST_INCLUDE_DRAFTS=1 builds drafts too, for checking post pages before publishing.
      // GitHub Actions never sets it.
      ...(process.env.LOCAL_TEST_INCLUDE_DRAFTS === '1' ? {} : { filter: { property: 'Status', select: { equals: 'Published' } } }),
    })
  ).filter(isFullPage);

  const posts = [];
  const slugs = new Set();
  for (const page of pages) {
    const title = prop(page, 'Title');
    if (!title) continue;
    let slug = slugify(prop(page, 'Slug') || title) || `post-${page.id.slice(0, 8)}`;
    if (slugs.has(slug)) slug = `${slug}-${page.id.replace(/-/g, '').slice(0, 6)}`;
    slugs.add(slug);
    posts.push({
      id: page.id,
      slug,
      title,
      summary: prop(page, 'Summary'),
      content: await blocksToMd(notion, await getChildren(notion, page.id)),
      // A post without a Published date shows the day it was created in Notion
      publishedAt: prop(page, 'Published date') ?? page.created_time,
      editedAt: page.last_edited_time,
    });
    console.log(`post: ${title}`);
  }
  posts.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  return posts;
}

// ---------- Projects from GitHub ----------

async function github(apiPath, accept = 'application/vnd.github+json') {
  const headers = { Accept: accept, 'User-Agent': 'albertdammara.com-build', 'X-GitHub-Api-Version': '2022-11-28' };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  const res = await fetch(`https://api.github.com${apiPath}`, { headers, signal: AbortSignal.timeout(20000) });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GitHub ${apiPath} answered ${res.status}`);
  return accept.includes('raw') ? res.text() : res.json();
}

function shorten(text) {
  if (text.length <= MAX_DESCRIPTION) return text;
  const cut = text.slice(0, MAX_DESCRIPTION);
  const sentenceEnd = cut.lastIndexOf('. ');
  return sentenceEnd > 80 ? cut.slice(0, sentenceEnd + 1) : `${cut.slice(0, cut.lastIndexOf(' '))}…`;
}

// First prose paragraph of a README, for repos without an "About" description:
// skips headings, images, badges, lists, tables and code, then drops Markdown syntax
function readmeSummary(markdown) {
  for (const block of markdown.replace(/```[\s\S]*?```/g, '').split(/\n\s*\n/)) {
    const text = block.trim();
    if (!text || /^(#|!\[|\[!\[|<|[-*+] |\d+\. |\||>)/.test(text)) continue;
    const plainText = text
      .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
      .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
      .replace(/[*_`~]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    if (plainText.length >= 20) return shorten(plainText);
  }
  return '';
}

async function buildProjects() {
  const repos = [];
  for (let page = 1; page <= 10; page++) {
    const batch = await github(`/users/${GITHUB_USER}/repos?type=owner&per_page=100&page=${page}`);
    if (!batch?.length) break;
    repos.push(...batch);
    if (batch.length < 100) break;
  }
  // Forks are skipped: the code is someone else's
  const tagged = repos.filter((r) => !r.fork && !r.private && (r.topics ?? []).includes(GITHUB_TOPIC));

  const projects = [];
  for (const repo of tagged) {
    let description = (repo.description ?? '').replace(/\s+/g, ' ').trim();
    if (!description) {
      const readme = await github(`/repos/${GITHUB_USER}/${repo.name}/readme`, 'application/vnd.github.raw+json');
      description = readme ? readmeSummary(readme) : '';
    }
    projects.push({
      id: repo.id,
      title: repo.name,
      description: shorten(description),
      url: repo.html_url,
      homepageUrl: repo.homepage?.trim() || null,
      language: repo.language ?? null,
      updatedAt: repo.pushed_at ?? repo.updated_at,
    });
  }
  projects.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  console.log(`projects: ${projects.length} tagged "${GITHUB_TOPIC}"`);
  return projects;
}

// ---------- Resume ----------

async function extractText(bytes) {
  const { getDocument } = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const doc = await getDocument({ data: bytes, isEvalSupported: false, useSystemFonts: false }).promise;
  try {
    const pages = [];
    for (let i = 1; i <= doc.numPages; i++) {
      const content = await (await doc.getPage(i)).getTextContent();
      let text = '';
      for (const item of content.items) if ('str' in item) text += item.str + (item.hasEOL ? '\n' : '');
      pages.push(text.replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim());
    }
    return { pages: doc.numPages, text: pages.join('\n\n') };
  } finally {
    await doc.destroy();
  }
}

async function buildResume() {
  const page = await notion.pages.retrieve({ page_id: NOTION_RESUME_PAGE_ID });
  const blocks = await getChildren(notion, NOTION_RESUME_PAGE_ID);
  // The first PDF on the page: a "PDF" block, or a file block holding a .pdf
  const block = blocks.find(
    (b) => b.type === 'pdf' || (b.type === 'file' && /\.pdf$/i.test(b.file?.name ?? b.file?.file?.url?.split('?')[0] ?? ''))
  );
  if (!block) throw new Error('No PDF found on the Notion Resume page');
  const data = block[block.type];
  const url = data.type === 'file' ? data.file.url : data.external.url;

  const res = await fetch(url, { signal: AbortSignal.timeout(30000) });
  if (!res.ok) throw new Error(`Resume download answered ${res.status}`);
  const bytes = new Uint8Array(await res.arrayBuffer());
  if (Buffer.from(bytes.subarray(0, 5)).toString('latin1') !== '%PDF-') throw new Error('The Resume page file is not a PDF');

  await writeFile(path.join(process.cwd(), 'public', RESUME_FILE), bytes);
  const { pages, text } = await extractText(bytes.slice());
  if (text.length < 50) throw new Error('No text found in the resume PDF (is it a scanned image?)');
  console.log(`resume: ${pages} page(s), ${text.length} characters`);
  return { file: `/${RESUME_FILE}`, bytes: bytes.byteLength, pages, text, updatedAt: page.last_edited_time };
}

// ---------- Run ----------

await mkdir(OUT_DIR, { recursive: true });
await mkdir(MEDIA_DIR, { recursive: true });

const [posts, projects, resume] = await Promise.all([buildPosts(), buildProjects(), buildResume()]);
await writeJson('posts.json', posts);
await writeJson('projects.json', projects);
await writeJson('resume.json', resume);
await writeJson('meta.json', { builtAt: new Date().toISOString() });
console.log('content ready');
