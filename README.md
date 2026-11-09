# albertdammara.com

Albert Richard Dammara's personal site: portfolio, blog and resume, with an "ask about my work" bar.

It is a static Next.js site hosted on Cloudflare Pages. Its content lives in tools Albert already
uses, and every build reads it fresh:

| Content | Source |
|---|---|
| Blog posts | Notion "Blog posts" database, rows with Status = Published |
| Projects | Public, non-fork GitHub repos on github.com/rdammara with the `portfolio` topic |
| Resume | The PDF on the Notion "Resume" page |
| About, contact links | `lib/site.ts` |

## How a build works

Cloudflare Pages builds from GitHub: `master` becomes albertdammara.com, and `development`
gets a preview at development.<project>.pages.dev. The build command is
`npm run content && npm run build`:

1. `scripts/build-content.mjs` fetches the posts (as Markdown, photos saved to `public/media`),
   the tagged repos and the resume (saved to `public/`, its text read with pdf.js) into
   `content/generated/`.
2. `next build` turns the pages into static HTML in `out/` (`output: 'export'`).
3. Cloudflare compiles `functions/api/chat.ts`, the ask bar's backend, which answers from the
   same content with an OpenRouter model and falls back to keyword search.

A scheduled Worker (`cron/rebuild-worker.js`) calls the project's deploy hook every 3 hours, so
new posts, projects and resume changes appear without a code change.

### Cloudflare settings

- Build command `npm run content && npm run build`, output directory `out`; Node 22 comes from
  `.node-version`.
- Environment variables (Production and Preview): `NOTION_TOKEN` (secret, read-only Notion
  integration with access to "Blog posts" and "Resume"), `OPENROUTER_API_KEY` (secret, used by
  the ask bar). Optional: `OPENROUTER_MODEL` (default `openrouter/free`; a comma-separated list
  is tried in order).
- Response headers (HSTS, frame and referrer policy) are in `public/_headers`.

## Working on it

```bash
npm ci
npm run content    # needs NOTION_TOKEN in .env
npm run build      # static site in out/
npm run lint
```

`LOCAL_TEST_INCLUDE_DRAFTS=1 npm run content` includes draft posts, for checking a post locally
before publishing it. To run the site with the ask bar the way Cloudflare does (wrangler needs
Node 22), put `OPENROUTER_API_KEY=...` in `.dev.vars` and run `npx wrangler pages dev out`.

Design direction is in `DESIGN.md`; the antislop rules in `.claude/skills` apply to UI and copy.
