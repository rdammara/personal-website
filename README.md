# Next.js Full-Stack Application

A modern full-stack web application built with **Next.js 16 (App Router)**, **TypeScript**, **Tailwind CSS**, **Prisma ORM (SQLite)**, and an intelligent **RAG AI Assistant**.

---

## 📁 Directory Structure

```
├── app/
│   ├── (public)/              # Public route group sharing site layout
│   │   ├── layout.tsx         # Navbar & Footer wrapper
│   │   ├── page.tsx           # Home page with hero, tech pillars, and previews
│   │   ├── blog/              # Technical articles list
│   │   │   ├── page.tsx       # Blog listing from SQLite
│   │   │   └── [slug]/page.tsx# Single article view
│   │   ├── portfolio/         # Showcase of builds & tools
│   │   │   └── page.tsx       # Portfolio grid with download & external links
│   │   └── contact/           # Contact form and contact details
│   │       └── page.tsx
│   ├── admin/                 # Protected administration dashboard
│   │   ├── layout.tsx         # Admin sidebar and header
│   │   ├── page.tsx           # Metrics, stats, and quick overview
│   │   ├── login/page.tsx     # Admin authentication login
│   │   ├── blog/page.tsx      # Interactive BlogPost CRUD
│   │   └── projects/page.tsx  # Interactive Project CRUD
│   ├── api/                   # Backend Route Handlers
│   │   ├── chat/route.ts      # RAG-grounded query handler with citations
│   │   ├── auth/
│   │   │   ├── login/route.ts # JWT authentication & cookie setter
│   │   │   └── me/route.ts    # Session verification & logout
│   │   ├── posts/
│   │   │   ├── route.ts       # GET (all posts), POST (create post)
│   │   │   └── [id]/route.ts  # GET, PUT, DELETE single post
│   │   └── projects/
│   │       ├── route.ts       # GET (all projects), POST (create project)
│   │       └── [id]/route.ts  # GET, PUT, DELETE single project
│   ├── globals.css            # Tailwind CSS responsive styles & dark mode
│   └── layout.tsx             # Root layout with ThemeProvider & ChatWidget
├── components/
│   ├── ui/                    # Reusable atomic UI components
│   │   ├── Button.tsx         # Variant-styled buttons
│   │   ├── Card.tsx           # Header, Title, Content, Footer cards
│   │   ├── Input.tsx          # Form inputs
│   │   └── Badge.tsx          # Status badges
│   ├── Navbar.tsx             # Responsive header with mobile drawer
│   ├── Footer.tsx             # Responsive footer
│   ├── ThemeToggle.tsx        # Light / Dark mode toggle switch
│   ├── ThemeProvider.tsx      # next-themes client provider
│   └── ChatWidget.tsx         # Floating RAG AI chat widget
├── lib/
│   ├── prisma.ts              # PrismaClient singleton instance
│   ├── auth.ts                # Password hashing, JWT signing & cookies
│   ├── rag.ts                 # Text chunking, tokenization, BM25 retrieval
│   └── utils.ts               # Tailwind class merger & date formatting
├── prisma/
│   ├── schema.prisma          # SQLite schema models (User, BlogPost, Project)
│   └── seed.js                # Database seeder script
├── package.json
└── tsconfig.json
```

---

## 🗄️ Database Models (SQLite)

Configured in `prisma/schema.prisma` with the SQLite provider:

- **User**: `id`, `email`, `passwordHash`, `createdAt`
- **BlogPost**: `id`, `title`, `slug`, `content`, `published`, `createdAt`, `updatedAt`
- **Project**: `id`, `title`, `description`, `downloadUrl`, `externalUrl`, `createdAt`

### Admin User
The seed creates an admin only when none exists, using `ADMIN_EMAIL` (default `admin@example.com`) and `ADMIN_PASSWORD` from the environment. Re-running the seed never changes an existing admin's password.

`JWT_SECRET` must be set in `.env` to a long random value; login fails without it.

---

## Running in production

The live site always runs GitHub's `master` branch. Every 5 minutes cron runs
`~/apps/albertdammara.com/bin/deploy.sh`, which does nothing unless `master` has a
new commit. When it has, the script builds that commit into a new release folder,
copies the database to `shared/backups/`, applies schema changes that keep all data,
switches the `current` symlink and reloads PM2. A failed build or a new version that
does not answer leaves (or puts back) the previous release.

```
~/apps/albertdammara.com/
  current -> releases/<time>-<commit>   what PM2 runs (port 3000, localhost only)
  releases/                             the live build and the one before it
  shared/.env                           secrets; DATABASE_URL points into shared/data
  shared/data/prod.db                   live database
  shared/storage/                       Notion images, uploaded resumes
  shared/backups/                       database copies from the last 10 deploys
  shared/deploy.log                     what each deploy did
```

Useful commands on the server:

```bash
tail -n 30 ~/apps/albertdammara.com/shared/deploy.log   # recent deploys
~/apps/albertdammara.com/bin/deploy.sh --force          # redeploy master now
pm2 logs personal-website                               # live server log
```

### Ask bar settings (`.env`)

```
OPENROUTER_API_KEY="sk-or-..."      # without it, the ask bar uses keyword search
OPENROUTER_MODEL="openrouter/free"  # or a list tried in order, e.g. "openrouter/free,anthropic/claude-haiku-5.5"
ASK_DAILY_LIMIT=300                 # AI answers per day before falling back to keyword search
```

Each question gets at most two tries of 14 seconds. A reply that is not the expected JSON
counts as a failed try. After two failures the keyword search answers instead.

### Projects from GitHub

The Work section mirrors public repos on github.com/rdammara that have the
`portfolio` topic (set it with the gear icon next to "About" on the repo page).
`scripts/sync-github.mjs` runs hourly under PM2 (`github-sync`), takes the description
from the repo's About text or, failing that, the README's first paragraph, skips forks,
and removes projects whose repo loses the topic. `npm run sync:github` runs it now.
Projects added in the admin dashboard are left alone.

### Development preview

This checkout (`~/personal-website`, branch `development`) runs as
`personal-website-dev` on port 3001 with its own `prisma/dev.db`. The firewall keeps
3001 closed to the internet, so it is reachable over Tailscale only.

```bash
npm run build && pm2 startOrReload ecosystem.config.js
```

## 🚀 Useful Commands

```bash
# Start development server
npm run dev

# Run production build
npm run build

# Start production server
npm run start

# Database commands
npx prisma generate     # Regenerate Prisma Client
npx prisma db push      # Push schema changes to SQLite
npx prisma studio       # Launch interactive database GUI
node prisma/seed.js     # Create the admin user if missing

# PM2 Process Manager
pm2 status              # View status of running instance
pm2 restart next-app    # Restart application
pm2 logs next-app       # View application logs
```

---

## 🎨 Styling & Dark/Light Theme Support
- Configured via **Tailwind CSS** with full responsive classes.
- Dark mode is handled seamlessly using `next-themes` and `@custom-variant dark (&:where(.dark, .dark *));` in `app/globals.css`.
- Persists user theme preference across browser sessions without hydration flicker.
