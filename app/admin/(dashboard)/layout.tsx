import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LogoMark } from '@/components/Logo';
import { AdminNav } from '@/components/admin/AdminNav';
import { getSessionUser } from '@/lib/auth';
import { site } from '@/lib/site';

// Every page in this group needs a signed-in admin; /admin/login sits outside it
export const dynamic = 'force-dynamic';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user) redirect('/admin/login');

  return (
    <div className="flex min-h-screen flex-col bg-surface md:flex-row">
      <aside className="flex shrink-0 flex-col gap-4 border-b border-line bg-bg p-4 md:sticky md:top-0 md:h-screen md:w-64 md:border-b-0 md:border-r">
        <div className="flex items-center justify-between gap-3">
          <Link href="/admin" className="inline-flex min-h-11 min-w-0 items-center gap-2.5 text-ink no-underline">
            <LogoMark className="h-8 w-7 shrink-0" />
            <span className="min-w-0">
              <span className="block text-[15px] font-bold leading-tight">{site.name}</span>
              <span className="block font-mono text-[12px] text-muted">Admin</span>
            </span>
          </Link>
          <ThemeToggle />
        </div>
        <AdminNav />
        <p className="hidden truncate font-mono text-[12px] text-muted md:block">{user.email}</p>
      </aside>

      <main className="min-w-0 flex-1 p-4 sm:p-8">
        <div className="mx-auto max-w-5xl">{children}</div>
      </main>
    </div>
  );
}
