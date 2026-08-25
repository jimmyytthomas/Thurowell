'use client';

import Link from 'next/link';
import { Suspense, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AppNav } from '@/components/AppNav';
import { PROTOCOLS } from '@/lib/protocols';
import type { Protocol } from '@/types';

function categoryLabel(category: Protocol['category']): string {
  return category === 'breathwork' ? 'Breathwork' : 'Meditation';
}

function ResultContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const protocolId = searchParams.get('protocolId') ?? '';

  const protocol = useMemo(() => {
    if (!protocolId) return null;
    return PROTOCOLS.find((p) => p.id === protocolId) ?? null;
  }, [protocolId]);

  const handleStartSession = useCallback(() => {
    if (!protocol) return;
    try {
      sessionStorage.setItem('thurowell_protocol', protocol.id);
    } catch {
      // Continue even if storage is unavailable
    }
    router.push(`/session?protocolId=${encodeURIComponent(protocol.id)}`);
  }, [protocol, router]);

  if (!protocolId) {
    return (
      <div className="flex min-h-screen flex-col bg-[var(--bg)] text-[var(--text-primary)]">
        <AppNav />
        <div className="flex flex-1 flex-col items-center justify-center px-6">
          <p className="text-center font-light text-[var(--text-secondary)]">
            No protocol selected.
          </p>
          <Link
            href="/"
            className="mt-6 text-sm text-[var(--accent)] transition-colors duration-200 hover:text-[var(--accent-hover)]"
          >
            ← All protocols
          </Link>
        </div>
      </div>
    );
  }

  if (!protocol) {
    return (
      <div className="flex min-h-screen flex-col bg-[var(--bg)] text-[var(--text-primary)]">
        <AppNav />
        <div className="flex flex-1 flex-col items-center justify-center px-6">
          <p className="text-center font-light text-[var(--text-secondary)]">
            Protocol not found.
          </p>
          <Link
            href="/"
            className="mt-6 text-sm text-[var(--accent)] transition-colors duration-200 hover:text-[var(--accent-hover)]"
          >
            ← All protocols
          </Link>
        </div>
      </div>
    );
  }

  const subtitle = `${categoryLabel(protocol.category)} · ${protocol.duration}`;

  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg)] text-[var(--text-primary)]">
      <AppNav />

      <div className="mx-auto w-full max-w-2xl flex-1 px-6 pb-20 pt-8 md:pt-10">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm font-medium text-[var(--text-secondary)] transition-colors duration-200 hover:text-[var(--accent)]"
        >
          ← All protocols
        </Link>

        <article className="mt-8 rounded-2xl bg-[var(--surface)] p-8 ring-1 ring-[var(--border)] md:p-10">
          <h1 className="text-3xl font-light tracking-tight md:text-4xl">{protocol.name}</h1>
          <p className="mt-3 text-sm font-medium text-[var(--text-secondary)]">{subtitle}</p>
          <p className="mt-8 leading-relaxed text-[var(--text-primary)]/90">
            {protocol.description}
          </p>

          <button
            type="button"
            onClick={handleStartSession}
            className="mt-10 w-full rounded-xl bg-[var(--accent)] py-4 text-base font-semibold text-black shadow-[0_0_32px_var(--accent-glow)] transition-colors duration-200 hover:bg-[var(--accent-hover)]"
          >
            Start Session
          </button>
        </article>
      </div>
    </div>
  );
}

export default function ResultPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen flex-col bg-[var(--bg)]">
          <AppNav />
          <div className="flex flex-1 items-center justify-center text-[var(--text-secondary)]">
            <p className="font-light">Loading…</p>
          </div>
        </div>
      }
    >
      <ResultContent />
    </Suspense>
  );
}
