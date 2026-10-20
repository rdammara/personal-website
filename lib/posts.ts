import { prisma } from './prisma';
import { excerpt } from './utils';
import { markdownToText } from '@/components/Markdown';

type PostLike = { content: string; summary: string | null; publishedAt: Date | null; createdAt: Date };

// The date a post shows: Notion's publish date, or when it was created here
export const postDate = (post: PostLike) => post.publishedAt ?? post.createdAt;

export const postSummary = (post: PostLike, maxLength: number) =>
  post.summary ?? excerpt(markdownToText(post.content), maxLength);

export async function getPublishedPosts(take?: number) {
  return prisma.blogPost.findMany({
    where: { published: true },
    orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
    take,
  });
}

export async function getLastNotionSync() {
  return prisma.syncRun.findFirst({ where: { source: 'notion', ok: true }, orderBy: { startedAt: 'desc' } });
}

// The first photo in a post, used as its thumbnail in post lists (null when it has none).
// Only images the sync stored locally or https images count.
export function postThumbnail(post: { content: string }) {
  const match = post.content.match(/!\[[^\]]*\]\(((?:\/media\/|https:\/\/)[^)\s]+)\)/);
  return match ? match[1] : null;
}
