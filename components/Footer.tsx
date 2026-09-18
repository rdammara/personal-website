import Link from 'next/link';
import { Terminal, Github, Twitter, Linkedin, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 text-slate-600 dark:text-slate-400 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
              <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center text-white text-xs">
                <Terminal className="w-3.5 h-3.5" />
              </div>
              <span>DevPortfolio</span>
            </div>
            <p className="text-sm max-w-sm">
              Full-stack Next.js project with App Router, TypeScript, Prisma ORM (SQLite), RAG knowledge engine, and Tailwind CSS.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-sm text-slate-900 dark:text-white mb-3">Navigation</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400">Home</Link></li>
              <li><Link href="/blog" className="hover:text-blue-600 dark:hover:text-blue-400">Blog</Link></li>
              <li><Link href="/portfolio" className="hover:text-blue-600 dark:hover:text-blue-400">Portfolio</Link></li>
              <li><Link href="/contact" className="hover:text-blue-600 dark:hover:text-blue-400">Contact</Link></li>
              <li><Link href="/admin" className="hover:text-blue-600 dark:hover:text-blue-400">Admin Dashboard</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm text-slate-900 dark:text-white mb-3">Stack</h4>
            <div className="flex flex-wrap gap-1.5 text-xs">
              <span className="px-2 py-1 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">Next.js 16</span>
              <span className="px-2 py-1 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">React 19</span>
              <span className="px-2 py-1 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">TypeScript</span>
              <span className="px-2 py-1 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">Tailwind CSS</span>
              <span className="px-2 py-1 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">Prisma (SQLite)</span>
              <span className="px-2 py-1 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">RAG Engine</span>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} DevPortfolio. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1">
              Built with <Heart className="w-3 h-3 text-red-500 fill-red-500" /> & Next.js
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
