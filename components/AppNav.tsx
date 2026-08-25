'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function AppNav() {
  const pathname = usePathname();
  const isHome = pathname === '/';

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
      </div>
    </header>
  );
}
