'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { AppNav } from '@/components/AppNav';
import { PROTOCOLS } from '@/lib/protocols';
import { getSessions, updateFeedback } from '@/lib/storage';
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

  const handleFeedback = useCallback((helped: boolean) => {
    setSession((prev) => {
      if (!prev) return prev;
      updateFeedback(prev.id, helped);
      return { ...prev, helped };
    });
  }, []);

  if (loading || !session || !protocol) {
    return (
      <div className="flex min-h-screen flex-col">
        <AppNav />
        <div className="flex flex-1 flex-col items-center justify-center px-6 pb-24 pt-12">
          <div
            className="h-10 w-10 animate-spin rounded-full border-2 border-teal-500 border-t-transparent"
            aria-hidden
          />
          <p className="mt-5 text-sm font-medium text-slate-400">Loading your protocol…</p>
        </div>
      </div>
    );
  }

  const { stress, energy, focus: focusLevel, goal } = session.checkIn;
  const subtitle = `${categoryLabel(protocol.category)} · ${protocol.duration}`;
  const whyCopy = `Based on your stress level of ${stress}, energy level of ${energy}, and focus level of ${focusLevel}, with a goal to ${goalPhrase(goal)}, Thurowell recommends ${protocol.name}.`;

  return (
    <div className="flex min-h-screen flex-col">
      <AppNav />

      <div className="mx-auto w-full max-w-2xl flex-1 px-6 pb-20 pt-8 md:pt-10">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm font-medium text-teal-400 transition-colors duration-200 hover:text-teal-300"
        >
          ← New Check-in
        </Link>

        <article className="mt-8 rounded-2xl bg-slate-800 p-8 shadow-2xl ring-1 ring-slate-700/60 md:p-10">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{protocol.name}</h1>
          <p className="mt-3 text-sm font-medium text-slate-400">{subtitle}</p>
          <p className="mt-8 leading-relaxed text-slate-200 md:text-[17px]">{protocol.description}</p>

          <section className="mt-10 rounded-xl bg-slate-700/50 p-6 ring-1 ring-slate-600/40 md:p-8">
            <h2 className="text-lg font-semibold text-white">Why this protocol?</h2>
            <p className="mt-3 leading-relaxed text-slate-200 md:text-[17px]">{whyCopy}</p>
          </section>

          <section className="mt-10 border-t border-slate-700/80 pt-10">
            <h2 className="text-lg font-semibold text-white">Steps</h2>
            <ol className="mt-6 list-none space-y-5">
              {protocol.steps.map((step, index) => (
                <li key={index} className="flex gap-4">
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-500/15 text-sm font-bold text-teal-400 ring-1 ring-teal-500/30"
                    aria-hidden
                  >
                    {index + 1}
                  </span>
                  <p className="pt-1 leading-relaxed text-slate-200 md:text-[17px]">{step}</p>
                </li>
              ))}
            </ol>
          </section>

          <section className="mt-10 border-t border-slate-700/80 pt-10">
            {session.helped === null ? (
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <button
                  type="button"
                  onClick={() => handleFeedback(true)}
                  className="min-h-[52px] flex-1 rounded-xl bg-teal-600 px-6 py-4 text-base font-semibold text-white shadow-lg shadow-teal-900/30 transition-colors duration-200 hover:bg-teal-500 sm:min-w-[180px]"
                >
                  ✓ It Helped
                </button>
                <button
                  type="button"
                  onClick={() => handleFeedback(false)}
                  className="min-h-[52px] flex-1 rounded-xl bg-slate-600 px-6 py-4 text-base font-semibold text-white shadow-lg transition-colors duration-200 hover:bg-slate-500 sm:min-w-[180px]"
                >
                  ✗ Didn&apos;t Help
                </button>
              </div>
            ) : (
              <p className="text-sm font-medium text-teal-400/95">
                Thanks for your feedback!
              </p>
            )}
          </section>
        </article>

        <div className="mt-12 text-center">
          <Link
            href="/history"
            className="inline-flex items-center gap-1 text-sm font-medium text-teal-400 transition-colors duration-200 hover:text-teal-300"
          >
            View Session History →
          </Link>
        </div>
      </div>
    </div>
  );
}
