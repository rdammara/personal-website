import { readFileSync } from 'node:fs';
import path from 'node:path';

// Content saved by scripts/build-content.mjs before `next build`. Pages read it while the
// static site is built; visitors only ever receive the finished pages.
export function readContent<T>(name: string): T {
  const file = path.join(process.cwd(), 'content', 'generated', name);
  try {
    return JSON.parse(readFileSync(file, 'utf8')) as T;
  } catch {
    throw new Error(`Missing ${file}. Run "npm run content" (needs the Notion settings in .env) before building.`);
  }
}

export const contentMeta = () => readContent<{ builtAt: string }>('meta.json');
