// Converts Notion blocks to Markdown and downloads Notion-hosted images.
// Kept apart from sync-notion.mjs so it can be imported without starting a sync.

import { collectPaginatedAPI, isFullBlock } from '@notionhq/client';
import { createHash } from 'node:crypto';
import { writeFile, access } from 'node:fs/promises';
import path from 'node:path';

export const MEDIA_DIR = path.join(process.cwd(), 'storage', 'notion-media');
// No SVG: it can carry scripts, and these files are served from the site's own origin
const IMAGE_TYPES = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/gif': 'gif', 'image/webp': 'webp' };

export const plain = (richText = []) => richText.map((t) => t.plain_text).join('');

export function slugify(text) {
  return text
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/['’]/g, '')
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

export async function getChildren(notion, blockId) {
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
