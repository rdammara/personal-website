import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import { ChatWidget } from '@/components/ChatWidget';

export const metadata: Metadata = {
  title: 'Modern Next.js Portfolio & Knowledge Base',
  description: 'Full-stack Next.js project with App Router, TypeScript, Tailwind CSS, Prisma ORM (SQLite), and RAG AI assistant.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased flex flex-col selection:bg-blue-500 selection:text-white">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <ChatWidget />
        </ThemeProvider>
      </body>
    </html>
  );
}
