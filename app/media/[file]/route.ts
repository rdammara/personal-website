import { readFile } from 'node:fs/promises';
import path from 'node:path';

// Serves images the Notion sync downloaded into storage/notion-media. Files added
// to public/ after a build are not served, so they live outside it.
const MEDIA_DIR = path.join(process.cwd(), 'storage', 'notion-media');
const TYPES: Record<string, string> = { png: 'image/png', jpg: 'image/jpeg', gif: 'image/gif', webp: 'image/webp' };

export async function GET(_req: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  // Names are content hashes written by the sync; anything else is refused
  const match = /^([a-f0-9]{32})\.(png|jpg|gif|webp)$/.exec(file);
  if (!match) return new Response('Not found', { status: 404 });

  try {
    const bytes = await readFile(path.join(MEDIA_DIR, file));
    return new Response(bytes, {
      headers: {
        'Content-Type': TYPES[match[2]],
        // The name changes whenever the image does, so it can be cached for good
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch {
    return new Response('Not found', { status: 404 });
  }
}
