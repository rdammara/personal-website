// Copies Published posts from the Notion "Blog posts" database into the site's
// database as Markdown. Run with: node --env-file=.env scripts/sync-notion.mjs
//
// Posts switched back to Draft (or deleted) in Notion are unpublished here, not
// deleted. Images hosted by Notion are downloaded, because Notion's file URLs
// expire about an hour after they are issued.

import { Client, collectPaginatedAPI, isFullPage } from '@notionhq/client';
import { PrismaClient } from '@prisma/client';
import { mkdir } from 'node:fs/promises';
import { MEDIA_DIR, plain, slugify, blocksToMd, getChildren } from './notion-markdown.mjs';

const { NOTION_TOKEN, NOTION_DATA_SOURCE_ID } = process.env;

const prisma = new PrismaClient();

// ---------- Notion properties ----------

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

main()
  .catch((error) => {
    console.error('Notion sync failed:', error?.message ?? error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
