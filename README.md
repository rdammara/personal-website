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

### Default Admin Credentials (from seed)
- **Email**: `admin@example.com`
- **Password**: `AdminPassword123!`

---

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
node prisma/seed.js     # Reseed database with sample records

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
