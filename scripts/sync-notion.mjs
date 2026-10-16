// Copies Published posts from the Notion "Blog posts" database into the site's
// database as Markdown. Run with: node --env-file=.env scripts/sync-notion.mjs
//
// Posts switched back to Draft (or deleted) in Notion are unpublished here, not
// deleted. Images hosted by Notion are downloaded, because Notion's file URLs
// expire about an hour after they are issued.

import { Client, collectPaginatedAPI, isFullPage, isFullBlock } from '@notionhq/client';
import { PrismaClient } from '@prisma/client';
import { createHash } from 'node:crypto';
import { mkdir, writeFile, access } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const { NOTION_TOKEN, NOTION_DATA_SOURCE_ID } = process.env;
const MEDIA_DIR = path.join(process.cwd(), 'storage', 'notion-media');
// No SVG: it can carry scripts, and these files are served from the site's own origin
const IMAGE_TYPES = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/gif': 'gif', 'image/webp': 'webp' };

const prisma = new PrismaClient();

// ---------- Notion properties ----------

const plain = (richText = []) => richText.map((t) => t.plain_text).join('');

function prop(page, name) {
  const p = page.properties[name];
  if (!p) return null;
  switch (p.type) {
    case 'title':
      return plain(p.title).trim();
    case 'rich_text':
      return plain(p.rich_text).trim() || null;
    case 'select':
      return p.select?.name ?? null;
    case 'date':
      return p.date?.start ?? null;
    default:
      return null;
  }
}

export function slugify(text) {
  return text
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

// ---------- Rich text and blocks to Markdown ----------

const escapeMd = (s) => s.replace(/([\\`*_[\]<])/g, '\\$1');

function richTextToMd(richText = []) {
  return richText
    .map((t) => {
      if (t.type === 'equation') return `\`${t.equation.expression}\``;
      let s = t.annotations.code ? `\`${t.plain_text.replace(/`/g, 'ˋ')}\`` : escapeMd(t.plain_text);
      // Keep surrounding spaces outside the emphasis markers so Markdown parses them
      const [, lead, core, trail] = s.match(/^(\s*)([\s\S]*?)(\s*)$/);
      s = core;
      if (s && !t.annotations.code) {
        if (t.annotations.bold) s = `**${s}**`;
        if (t.annotations.italic) s = `*${s}*`;
        if (t.annotations.strikethrough) s = `~~${s}~~`;
      }
      const href = t.href ?? (t.type === 'text' ? t.text.link?.url : null);
      if (s && href) s = `[${s}](${href})`;
      return `${lead}${s}${trail}`;
    })
    .join('');
}

async function downloadImage(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`image download failed: ${res.status}`);
  const type = (res.headers.get('content-type') || '').split(';')[0];
  const ext = IMAGE_TYPES[type];
  if (!ext) throw new Error(`unsupported image type: ${type || 'unknown'}`);
  const bytes = Buffer.from(await res.arrayBuffer());
  const name = `${createHash('sha256').update(bytes).digest('hex').slice(0, 32)}.${ext}`;
  const file = path.join(MEDIA_DIR, name);
  try {
    await access(file);
  } catch {
    await writeFile(file, bytes);
  }
  return `/media/${name}`;
}

async function getChildren(notion, blockId) {
  const blocks = await collectPaginatedAPI(notion.blocks.children.list, { block_id: blockId });
  return blocks.filter(isFullBlock);
}

export async function blocksToMd(notion, blocks, depth = 0) {
  const out = [];
  const indent = '    '.repeat(depth);
  let numbered = 0;

  for (const block of blocks) {
    const type = block.type;
    const data = block[type];
    numbered = type === 'numbered_list_item' ? numbered + 1 : 0;
    const children = block.has_children && type !== 'child_page' && type !== 'child_database'
      ? await getChildren(notion, block.id)
      : [];
    const nested = async (d = depth + 1) => (children.length ? '\n' + (await blocksToMd(notion, children, d)) : '');

    switch (type) {
      case 'paragraph':
        out.push(indent + richTextToMd(data.rich_text) + (await nested()));
        break;
      case 'heading_1':
      case 'heading_2':
      case 'heading_3': {
        // The post title is the page's h1, so Notion headings start at h2
        const level = { heading_1: '##', heading_2: '###', heading_3: '####' }[type];
        out.push(`${level} ${richTextToMd(data.rich_text)}` + (await nested(depth)));
        break;
      }
      case 'bulleted_list_item':
        out.push(`${indent}- ${richTextToMd(data.rich_text)}` + (await nested()));
        break;
      case 'numbered_list_item':
        out.push(`${indent}${numbered}. ${richTextToMd(data.rich_text)}` + (await nested()));
        break;
      case 'to_do':
        out.push(`${indent}- [${data.checked ? 'x' : ' '}] ${richTextToMd(data.rich_text)}` + (await nested()));
        break;
      case 'quote':
      case 'callout': {
        const body = [richTextToMd(data.rich_text), children.length ? await blocksToMd(notion, children) : '']
          .filter(Boolean)
          .join('\n\n');
        out.push(body.split('\n').map((line) => `> ${line}`).join('\n'));
        break;
      }
      case 'toggle':
        out.push(`**${richTextToMd(data.rich_text)}**` + (await nested(depth)));
        break;
      case 'code': {
        const lang = data.language === 'plain text' ? '' : data.language.replace(/\s+/g, '');
        const code = plain(data.rich_text);
        const fence = code.includes('```') ? '````' : '```';
        out.push(`${fence}${lang}\n${code}\n${fence}`);
        if (data.caption?.length) out.push(`*${richTextToMd(data.caption)}*`);
        break;
      }
      case 'equation':
        out.push('```\n' + data.expression + '\n```');
        break;
      case 'divider':
        out.push('---');
        break;
      case 'image': {
        const alt = escapeMd(plain(data.caption)) || 'Image';
        const src = data.type === 'file' ? await downloadImage(data.file.url) : data.external.url;
        out.push(`![${alt}](${src})`);
        break;
      }
      case 'bookmark':
      case 'embed':
      case 'link_preview':
        out.push(`<${data.url}>`);
        break;
      case 'video':
      case 'file':
      case 'pdf': {
        // Notion-hosted files expire, so only external links are kept
        if (data.type === 'external') out.push(`[${escapeMd(plain(data.caption)) || data.external.url}](${data.external.url})`);
        break;
      }
      case 'table': {
        const rows = children.filter((c) => c.type === 'table_row');
        if (!rows.length) break;
        const cells = rows.map((r) => r.table_row.cells.map((c) => richTextToMd(c).replace(/\|/g, '\\|').replace(/\n/g, ' ')));
        const header = data.has_column_header ? cells.shift() : cells[0].map(() => ' ');
        out.push(
          [`| ${header.join(' | ')} |`, `| ${header.map(() => '---').join(' | ')} |`, ...cells.map((r) => `| ${r.join(' | ')} |`)].join('\n')
        );
        break;
      }
      case 'column_list':
        for (const column of children) out.push(await blocksToMd(notion, await getChildren(notion, column.id), depth));
        break;
      case 'synced_block':
        if (children.length) out.push(await blocksToMd(notion, children, depth));
        break;
      default:
        // Unsupported blocks (child pages, databases, breadcrumbs...) are skipped
        break;
    }
  }

  // List items join with single newlines so Markdown keeps them in one list
  return out
    .map((chunk, i) => {
      const isItem = /^\s*(- |\d+\. )/.test(chunk);
      const prevItem = i > 0 && /^\s*(- |\d+\. )/.test(out[i - 1]);
      return (i === 0 ? '' : isItem && prevItem ? '\n' : '\n\n') + chunk;
    })
    .join('');
}

// ---------- Sync ----------

async function uniqueSlug(base, pageId) {
  let slug = base || `post-${pageId.slice(0, 8)}`;
  const taken = await prisma.blogPost.findUnique({ where: { slug } });
  if (taken && taken.notionPageId !== pageId) slug = `${slug}-${pageId.replace(/-/g, '').slice(0, 6)}`;
  return slug;
}

async function main() {
  if (!NOTION_TOKEN || !NOTION_DATA_SOURCE_ID) {
    throw new Error('NOTION_TOKEN and NOTION_DATA_SOURCE_ID must be set in .env');
  }
  await mkdir(MEDIA_DIR, { recursive: true });
  const notion = new Client({ auth: NOTION_TOKEN });
  const run = await prisma.syncRun.create({ data: { source: 'notion' } });

  try {
    const pages = (
      await collectPaginatedAPI(notion.dataSources.query, {
        data_source_id: NOTION_DATA_SOURCE_ID,
        filter: { property: 'Status', select: { equals: 'Published' } },
      })
    ).filter(isFullPage);

    let changed = 0;
    for (const page of pages) {
      const title = prop(page, 'Title');
      if (!title) continue;
      const existing = await prisma.blogPost.findUnique({ where: { notionPageId: page.id } });
      const editedAt = new Date(page.last_edited_time);
      const dateProp = prop(page, 'Published date');
      const publishedAt = dateProp ? new Date(dateProp) : existing?.publishedAt ?? new Date();

      if (existing?.published && existing.notionEditedAt?.getTime() === editedAt.getTime()) continue;

      const content = await blocksToMd(notion, await getChildren(notion, page.id));
      const data = {
        title,
        slug: await uniqueSlug(slugify(prop(page, 'Slug') || title), page.id),
        content,
        summary: prop(page, 'Summary'),
        published: true,
        publishedAt,
        notionEditedAt: editedAt,
      };
      await prisma.blogPost.upsert({ where: { notionPageId: page.id }, update: data, create: { ...data, notionPageId: page.id } });
      changed++;
      console.log(`synced: ${title}`);
    }

    const live = pages.map((p) => p.id);
    const { count: unpublished } = await prisma.blogPost.updateMany({
      where: { notionPageId: { not: null, notIn: live }, published: true },
      data: { published: false },
    });

    const message = `${pages.length} published in Notion, ${changed} updated, ${unpublished} taken down`;
    await prisma.syncRun.update({
      where: { id: run.id },
      data: { finishedAt: new Date(), ok: true, postsSeen: pages.length, message },
    });
    console.log(message);
  } catch (error) {
    await prisma.syncRun.update({
      where: { id: run.id },
      data: { finishedAt: new Date(), ok: false, message: String(error?.message ?? error).slice(0, 500) },
    });
    throw error;
  }
}

// Run only when executed directly, so tests can import the converter
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main()
    .catch((error) => {
      console.error('Notion sync failed:', error?.message ?? error);
      process.exitCode = 1;
    })
    .finally(() => prisma.$disconnect());
}
