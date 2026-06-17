'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function AppNav() {
  const pathname = usePathname();
  const isHome = pathname === '/';
  const isHistory = pathname === '/history';

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--bg)]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-2xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className={`text-lg font-semibold tracking-tight transition-colors duration-200 ${
            isHome ? 'text-[var(--accent)]' : 'text-[var(--text-primary)] hover:text-[var(--accent)]'
          }`}
        >
          Thurowell
        </Link>
        <Link
          href="/history"
          className={`text-sm font-medium transition-colors duration-200 ${
            isHistory
              ? 'text-[var(--accent)]'
              : 'text-[var(--text-secondary)] hover:text-[var(--accent)]'
          }`}
        >
          History
        </Link>
      </div>
    </header>
  );
}
