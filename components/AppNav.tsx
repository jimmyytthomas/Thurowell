'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function AppNav() {
  const pathname = usePathname();
  const isHome = pathname === '/';
  const isHistory = pathname === '/history';

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-2xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className={`text-lg font-bold tracking-tight transition-colors duration-200 ${
            isHome ? 'text-teal-400' : 'text-white hover:text-teal-300'
          }`}
        >
          Thurowell
        </Link>
        <Link
          href="/history"
          className={`text-sm font-medium transition-colors duration-200 ${
            isHistory ? 'text-teal-400' : 'text-slate-300 hover:text-teal-400'
          }`}
        >
          History
        </Link>
      </div>
    </header>
  );
}
