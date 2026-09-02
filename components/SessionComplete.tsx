'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import { PROTOCOLS } from '@/lib/protocols';

export default function SessionComplete() {
  const searchParams = useSearchParams();
  const protocolId = searchParams.get('protocolId') ?? '';

  const protocolName = useMemo(() => {
    if (!protocolId) return null;
    return PROTOCOLS.find((p) => p.id === protocolId)?.name ?? null;
  }, [protocolId]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--bg)] px-6 py-12 text-[var(--text-primary)]">
      <div className="w-full max-w-lg text-center">
        <div
          className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--surface)] ring-1 ring-[var(--border)]"
          aria-hidden
        >
          <svg
            className="h-8 w-8 text-[var(--accent)]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-3xl font-light tracking-tight md:text-4xl">Good job</h1>
        {protocolName && (
          <p className="mt-3 text-base text-[var(--text-secondary)]">{protocolName}</p>
        )}

        <Link
          href="/"
          className="mt-10 inline-flex w-full max-w-sm items-center justify-center rounded-xl bg-[var(--accent)] px-6 py-4 text-base font-semibold text-black shadow-[0_0_32px_var(--accent-glow)] transition-colors duration-200 hover:bg-[var(--accent-hover)]"
        >
          Return to choices
        </Link>
      </div>
    </div>
  );
}
