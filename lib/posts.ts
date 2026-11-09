import { readContent } from './content';
import { excerpt } from './utils';
import { markdownToText } from './text';

export type Post = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  content: string; // Markdown
  publishedAt: string;
  editedAt: string;
};

// Newest first, as saved by the build
export async function getPublishedPosts(take?: number) {
  const posts = readContent<Post[]>('posts.json');
  return take ? posts.slice(0, take) : posts;
}

export async function getPost(slug: string) {
  return readContent<Post[]>('posts.json').find((p) => p.slug === slug) ?? null;
}

export const postDate = (post: Post) => post.publishedAt;

export const postSummary = (post: Post, maxLength: number) => post.summary ?? excerpt(markdownToText(post.content), maxLength);

// The first photo in a post, used as its thumbnail in post lists (null when it has none).
// Only photos saved with the site or https images count.
export function postThumbnail(post: { content: string }) {
  const match = post.content.match(/!\[[^\]]*\]\(((?:\/media\/|https:\/\/)[^)\s]+)\)/);
  return match ? match[1] : null;
}
