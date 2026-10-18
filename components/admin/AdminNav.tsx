'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const links = [
  { href: '/admin', label: 'Overview' },
  { href: '/admin/blog', label: 'Blog posts' },
  { href: '/admin/projects', label: 'Projects' },
  { href: '/admin/resume', label: 'Resume' },
  { href: '/admin/account', label: 'Account' },
];

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [signingOut, setSigningOut] = React.useState(false);

  const isActive = (href: string) => (href === '/admin' ? pathname === '/admin' : pathname.startsWith(href));

  const signOut = async () => {
    setSigningOut(true);
    await fetch('/api/auth/me', { method: 'POST' }).catch(() => {});
    router.push('/admin/login');
    router.refresh();
  };

  return (
    <>
      <nav aria-label="Admin" className="flex flex-wrap gap-1 md:flex-col">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            aria-current={isActive(link.href) ? 'page' : undefined}
            className="inline-flex min-h-11 items-center rounded-lg px-3 text-[15px] font-medium text-ink no-underline hover:bg-surface aria-[current=page]:bg-surface aria-[current=page]:text-accent"
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <div className="mt-auto flex flex-wrap gap-1 border-t border-line pt-3 md:flex-col">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center rounded-lg px-3 text-sm text-muted no-underline hover:bg-surface hover:text-ink"
        >
          View the site
        </Link>
        <button
          type="button"
          onClick={signOut}
          disabled={signingOut}
          className="inline-flex min-h-11 cursor-pointer items-center rounded-lg px-3 text-left text-sm text-muted hover:bg-surface hover:text-ink disabled:cursor-wait"
        >
          {signingOut ? 'Signing out…' : 'Sign out'}
        </button>
      </div>
    </>
  );
}
