const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Create or update default admin user
  const passwordHash = await bcrypt.hash('AdminPassword123!', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: { passwordHash },
    create: {
      email: 'admin@example.com',
      passwordHash,
    },
  });
  console.log(`Created/updated admin user: ${admin.email}`);

  // 2. Seed blog posts
  const posts = [
    {
      title: 'Getting Started with Next.js App Router and Prisma',
      slug: 'getting-started-nextjs-app-router-prisma',
      content: `The Next.js App Router brings modern React Server Components, streaming, and nested layouts to full-stack web development. When paired with Prisma ORM and SQLite, you get type-safe database queries with zero configuration friction.

Key benefits include:
- Native Server Components with direct async database calls
- Built-in layouts, loading boundaries, and error handlers
- Type-safe schema migrations and Prisma Studio`,
      published: true,
    },
    {
      title: 'Building Intelligent RAG Pipelines with Next.js',
      slug: 'building-rag-pipelines-nextjs',
      content: `Retrieval-Augmented Generation (RAG) grounds LLM completions in your custom knowledge base. In this article, we explore how to implement text chunking, embedding generation, vector similarity retrieval, and context augmentation inside Next.js Route Handlers.

With local or remote embeddings, you can index documentation, portfolio projects, and articles for fast semantic search.`,
      published: true,
    },
    {
      title: 'Modern Responsive Design with Tailwind CSS and Dark Mode',
      slug: 'modern-responsive-design-tailwind-dark-mode',
      content: `Clean UI aesthetics require responsive layouts, intuitive contrast, and seamless dark mode toggles. By leveraging CSS variables and Tailwind utility classes, we achieve instant transitions without hydration mismatches.`,
      published: true,
    },
    {
      title: 'Draft: Upcoming Features in Full-Stack Web Development',
      slug: 'upcoming-features-fullstack',
      content: `Exploring partial prerendering, edge functions, and lightweight vector storage in modern web frameworks.`,
      published: false,
    },
  ];

  for (const post of posts) {
    await prisma.blogPost.upsert({
      where: { slug: post.slug },
      update: post,
      create: post,
    });
  }
  console.log(`Seeded ${posts.length} blog posts.`);

  // 3. Seed projects
  const projects = [
    {
      title: 'RAG Knowledge Navigator',
      description: 'An interactive semantic search and document retrieval system built with Next.js, Vector Similarity, and local context augmentation.',
      downloadUrl: 'https://github.com/example/rag-knowledge-navigator/archive/main.zip',
      externalUrl: 'https://github.com/example/rag-knowledge-navigator',
    },
    {
      title: 'Full-Stack Developer Portfolio & CMS',
      description: 'A responsive Next.js portfolio featuring App Router, Prisma ORM, dark/light theme switching, and an integrated admin dashboard.',
      downloadUrl: 'https://github.com/example/nextjs-portfolio-rag/archive/main.zip',
      externalUrl: 'https://github.com/example/nextjs-portfolio-rag',
    },
    {
      title: 'Edge AI Chat Assistant',
      description: 'A lightweight chat widget with streaming responses, conversation history, and real-time backend API integration.',
      downloadUrl: null,
      externalUrl: 'https://github.com/example/edge-ai-chat-assistant',
    },
  ];

  for (const project of projects) {
    const existing = await prisma.project.findFirst({
      where: { title: project.title },
    });
    if (!existing) {
      await prisma.project.create({ data: project });
    }
  }
  console.log(`Seeded ${projects.length} projects.`);

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
