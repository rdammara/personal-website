import Link from 'next/link';
import { Shield, Home, BookOpen, Briefcase, LogOut, Terminal } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Sidebar for Desktop / Header for Mobile */}
      <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col shrink-0">
        <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2.5 font-bold text-slate-900 dark:text-white">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <div className="leading-tight">Admin Console</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Dashboard</div>
            </div>
          </Link>
          <div className="md:hidden">
            <ThemeToggle />
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <Link
            href="/admin"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
          >
            <Shield className="w-4 h-4 text-blue-600" />
            Overview
          </Link>
          <Link
            href="/admin/blog"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
          >
            <BookOpen className="w-4 h-4 text-indigo-600" />
            Manage Blog
          </Link>
          <Link
            href="/admin/projects"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
          >
            <Briefcase className="w-4 h-4 text-cyan-600" />
            Manage Projects
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
          <div className="hidden md:flex items-center justify-between px-3 py-1 text-xs text-slate-500">
            <span>Theme Mode</span>
            <ThemeToggle />
          </div>
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Home className="w-4 h-4" />
            Back to Public Site
          </Link>
          <Link
            href="/admin/login"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Switch / Sign In
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-8">
        <div className="max-w-5xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
