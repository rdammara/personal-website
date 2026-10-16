'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from './ThemeToggle';
import { LogoMark } from './Logo';
import { site } from '@/lib/site';

const navItems = [
  { label: 'About', href: '/#about' },
  { label: 'Work', href: '/portfolio' },
  { label: 'Blog', href: '/blog' },
  { label: 'Resume', href: '/resume' },
  { label: 'Contact', href: '/contact' },
];

export function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = React.useState(false);

  const isActive = (href: string) => !href.startsWith('/#') && pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg">
      <div className="mx-auto flex h-[60px] max-w-[1180px] items-center justify-between gap-4 px-5 sm:px-10">
        <Link
          href="/"
          className="inline-flex min-h-11 min-w-0 items-center gap-2.5 text-base font-bold leading-tight tracking-[-0.01em] text-ink no-underline sm:text-lg"
        >
          <LogoMark className="h-8 w-7 shrink-0" />
          <span>{site.name}</span>
        </Link>

        <div className="flex items-center gap-2">
          <nav aria-label="Main" className="hidden items-center md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive(item.href) ? 'page' : undefined}
                className="px-3 py-3 text-[15px] text-ink no-underline hover:text-accent aria-[current=page]:text-accent"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            className="inline-flex h-11 cursor-pointer items-center rounded-lg border border-line px-3.5 text-[15px] text-ink md:hidden"
          >
            Menu
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav
          id="mobile-menu"
          aria-label="Mobile"
          className="mx-auto flex max-w-[1180px] flex-col px-5 pb-3 sm:px-10 md:hidden"
        >
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              aria-current={isActive(item.href) ? 'page' : undefined}
              className="py-3 text-xl font-semibold text-ink no-underline aria-[current=page]:text-accent"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
