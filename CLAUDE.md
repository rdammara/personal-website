## Project notes

Albert Richard Dammara's personal site, albertdammara.com. Read README.md (how it is built and
hosted) and DESIGN.md (visual direction) before making changes.

- Always write his name in full: Albert Richard Dammara.
- Commit to the `development` branch only. Albert reviews the preview at
  development.albertdammara.pages.dev and merges to `master` (production) himself. Merge only
  when he explicitly says so.
- Content is not in the repo: blog posts come from his Notion "Blog posts" database (Published
  only), the resume from the PDF on the Notion "Resume" page, projects from his public GitHub
  repos tagged `portfolio`. It is fetched at build time by `scripts/build-content.mjs`.
- Secrets (NOTION_TOKEN, OPENROUTER_API_KEY) live in Cloudflare's settings or a local .env.
  Never ask him to paste a key into the chat, and never commit one.
- The ask bar (`functions/api/chat.ts`) uses the OpenRouter model `openrouter/free`; that is his
  choice, keep it unless he asks.
- antislop mode for UI and copy work: during.
- Open items he knows about: the About text says "Software Quality Engineer" but the resume does
  not list that role; the Work page intro promises a page per project that does not exist yet;
  the every-3-hours rebuild is not set up.

<!-- antislop:start -->
## antislop
For UI, copy, people, mobile layout, or code comments work, read these installed skill files directly (use these paths even if a same-named global skill exists):
- Core filter, always on: `antislop`: `.claude/skills/antislop/SKILL.md`
- UI / visual: `antislop-ui`: `.claude/skills/antislop-ui/SKILL.md`
- Copy & text: `antislop-copywriting`: `.claude/skills/antislop-copywriting/SKILL.md`
- People: `antislop-human`: `.claude/skills/antislop-human/SKILL.md`
- Mobile / responsive: `antislop-layoutmobile`: `.claude/skills/antislop-layoutmobile/SKILL.md`
- Code comments: `antislop-code`: `.claude/skills/antislop-code/SKILL.md`
Before starting, follow the core's "Two Usage Modes" section in strict order: explicit session instruction first, then global preference, then ask. A session instruction always wins. For a resolved mode, say `antislop active: <mode> (session override).` or `antislop active: <mode> (global preference).` once before presenting findings or making edits, using the actual mode and source. Acknowledging the user's request without naming the source does not replace this notice.
Only an explicit choice of antislop during or after selects a session mode. A request to review, audit, or avoid file edits does not select a mode; read the global preference in that case. Another skill's mode does not select antislop's mode.
If the mode is unresolved, ask during/after and end the response; wait for the answer before any UI review, planning, or concept. For read-only tasks, put the active-mode notice only at the start of the final answer, never in progress messages. For editing tasks, announce before the first edit and omit it from the final answer.
To update antislop later: `npx antislop-ai --update`, or run `npx antislop-ai` and pick Overwrite them.
<!-- antislop:end -->

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
