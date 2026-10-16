import type { MetadataRoute } from 'next';
import { site } from '@/lib/site';
import { getPublishedPosts, postDate } from '@/lib/posts';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = `https://${site.domain}`;
  const posts = await getPublishedPosts();
  return [
    ...['', '/blog', '/portfolio', '/resume', '/contact'].map((path) => ({ url: `${base}${path}` })),
    ...posts.map((post) => ({ url: `${base}/blog/${post.slug}`, lastModified: post.notionEditedAt ?? postDate(post) })),
  ];
}
