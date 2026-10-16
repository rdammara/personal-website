'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // The theme is unknown on the server, so the switch renders unchecked until mounted.
  const isDark = mounted && resolvedTheme === 'dark';

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label="Dark mode"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="inline-flex h-11 shrink-0 cursor-pointer items-center px-1"
    >
      <span className="relative block h-[30px] w-14 rounded-full border-[1.5px] border-control bg-surface">
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="absolute left-[7px] top-[6px] h-[15px] w-[15px] fill-none stroke-muted stroke-2 [stroke-linecap:round]"
        >
          <circle cx="12" cy="12" r="4.5" />
          <path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8" />
        </svg>
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="absolute right-[7px] top-[6px] h-[15px] w-[15px] fill-none stroke-muted stroke-2 [stroke-linecap:round] [stroke-linejoin:round]"
        >
          <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" />
        </svg>
        <span
          className={`absolute left-[2px] top-[2px] h-[23px] w-[23px] rounded-full bg-ink transition-transform duration-150 motion-reduce:transition-none ${
            isDark ? 'translate-x-[26px]' : 'translate-x-0'
          }`}
        />
      </span>
    </button>
  );
}
