'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { AppNav } from '@/components/AppNav';
import { PROTOCOLS } from '@/lib/protocols';
import { getSessions } from '@/lib/storage';
import type { Goal, Protocol, Session } from '@/types';

function goalPhrase(goal: Goal): string {
  switch (goal) {
    case 'calm':
      return 'calm down';
    case 'focus':
      return 'focus';
    case 'sleep':
      return 'sleep';
    case 'reset':
      return 'reset';
    case 'confidence':
      return 'build confidence';
    default:
      return goal;
  }
}

function categoryLabel(category: Protocol['category']): string {
  return category === 'breathwork' ? 'Breathwork' : 'Meditation';
}

export default function ResultPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [protocol, setProtocol] = useState<Protocol | null>(null);

  useEffect(() => {
    const id = sessionStorage.getItem('thurowell_current');
    if (!id) {
      router.push('/');
      return;
    }
    const sessions = getSessions();
    const found = sessions.find((s) => s.id === id);
    if (!found) {
      router.push('/');
      return;
    }
    const prot = PROTOCOLS.find((p) => p.id === found.recommendedProtocol);
    if (!prot) {
      router.push('/');
      return;
    }
    setSession(found);
    setProtocol(prot);
    setLoading(false);
  }, [router]);

  const handleStartSession = useCallback(() => {
    if (!protocol) return;
    router.push(`/session?protocolId=${encodeURIComponent(protocol.id)}`);
  }, [protocol, router]);

  if (loading || !session || !protocol) {
    return (
      <div className="flex min-h-screen flex-col bg-[var(--bg)]">
        <AppNav />
        <div className="flex flex-1 flex-col items-center justify-center px-6 pb-24 pt-12">
          <div
            className="h-10 w-10 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent"
            aria-hidden
          />
          <p className="mt-5 text-sm font-light text-[var(--text-secondary)]">
            Loading your protocol…
          </p>
        </div>
      </div>
    );
  }

  const { stress, energy, focus: focusLevel, goal } = session.checkIn;
  const subtitle = `${categoryLabel(protocol.category)} · ${protocol.duration}`;
  const whyCopy = `Based on your stress level of ${stress}, energy level of ${energy}, and focus level of ${focusLevel}, with a goal to ${goalPhrase(goal)}, Thurowell recommends ${protocol.name}.`;

  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg)] text-[var(--text-primary)]">
      <AppNav />

      <div className="mx-auto w-full max-w-2xl flex-1 px-6 pb-20 pt-8 md:pt-10">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm font-medium text-[var(--text-secondary)] transition-colors duration-200 hover:text-[var(--accent)]"
        >
          ← New Check-in
        </Link>

        <article className="mt-8 rounded-2xl bg-[var(--surface)] p-8 ring-1 ring-[var(--border)] md:p-10">
          <h1 className="text-3xl font-light tracking-tight md:text-4xl">{protocol.name}</h1>
          <p className="mt-3 text-sm font-medium text-[var(--text-secondary)]">{subtitle}</p>
          <p className="mt-8 leading-relaxed text-[var(--text-primary)]/90">
            {protocol.description}
          </p>

          <section className="mt-10 rounded-xl bg-[var(--bg)]/60 p-6 ring-1 ring-[var(--border)] md:p-8">
            <h2 className="text-base font-medium text-[var(--text-primary)]">
              Why this protocol?
            </h2>
            <p className="mt-3 leading-relaxed text-[var(--text-secondary)]">{whyCopy}</p>
          </section>

          <button
            type="button"
            onClick={handleStartSession}
            className="mt-10 w-full rounded-xl bg-[var(--accent)] py-4 text-base font-semibold text-black shadow-[0_0_32px_var(--accent-glow)] transition-colors duration-200 hover:bg-[var(--accent-hover)]"
          >
            Start Session
          </button>
        </article>

        <div className="mt-12 text-center">
          <Link
            href="/history"
            className="inline-flex items-center gap-1 text-sm font-medium text-[var(--text-secondary)] transition-colors duration-200 hover:text-[var(--accent)]"
          >
            View Session History →
          </Link>
        </div>
      </div>
    </div>
  );
}
