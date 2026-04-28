'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { AppNav } from '@/components/AppNav';
import { PROTOCOLS } from '@/lib/protocols';
import { STORAGE_KEY, getSessions } from '@/lib/storage';
import type { Goal, Session } from '@/types';

const GOAL_LABEL: Record<Goal, string> = {
  calm: 'Calm Down',
  focus: 'Focus',
  sleep: 'Sleep',
  reset: 'Reset',
  confidence: 'Confidence',
};

function formatSessionTimestamp(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const datePart = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(d);
  const timePart = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(d);
  return `${datePart} · ${timePart}`;
}

function protocolNameForId(id: string): string {
  return PROTOCOLS.find((p) => p.id === id)?.name ?? id;
}

function FeedbackBadge({ session }: { session: Session }) {
  if (session.helped === true) {
    return (
      <span className="inline-flex rounded-full bg-teal-500/15 px-3 py-1 text-xs font-semibold text-teal-300 ring-1 ring-teal-500/35">
        ✓ Helped
      </span>
    );
  }
  if (session.helped === false) {
    return (
      <span className="inline-flex rounded-full bg-rose-500/15 px-3 py-1 text-xs font-semibold text-rose-300 ring-1 ring-rose-500/35">
        ✗ Didn&apos;t Help
      </span>
    );
  }
  return (
    <span className="inline-flex rounded-full bg-slate-700/80 px-3 py-1 text-xs font-semibold text-slate-400 ring-1 ring-slate-600/60">
      No feedback
    </span>
  );
}

export default function HistoryPage() {
  const [sessions, setSessions] = useState<Session[]>([]);

  useEffect(() => {
    setSessions(getSessions());
  }, []);

  const orderedSessions = useMemo(
    () =>
      [...sessions].sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      ),
    [sessions],
  );

  const handleClearHistory = () => {
    const ok = window.confirm(
      'Are you sure you want to clear all session history?',
    );
    if (!ok) return;
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    setSessions([]);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <AppNav />

      <div className="mx-auto w-full max-w-2xl flex-1 px-6 pb-20 pt-8 md:pt-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Session History</h1>
            <Link
              href="/"
              className="mt-3 inline-flex text-sm font-medium text-teal-400 transition-colors duration-200 hover:text-teal-300"
            >
              ← Back to Check-in
            </Link>
          </div>
          {sessions.length > 0 && (
            <button
              type="button"
              onClick={handleClearHistory}
              className="shrink-0 rounded-lg border border-rose-500/40 bg-rose-950/50 px-4 py-2.5 text-sm font-semibold text-rose-200 shadow-sm transition-colors duration-200 hover:bg-rose-900/55 hover:text-white sm:mt-1"
            >
              Clear History
            </button>
          )}
        </div>

        {sessions.length === 0 ? (
          <div className="mt-14 rounded-2xl border border-slate-800 bg-slate-800/50 px-8 py-16 text-center shadow-inner ring-1 ring-slate-700/40 md:mt-16">
            <div
              className="mx-auto mb-6 h-12 w-12 rounded-full border-2 border-dashed border-slate-600/80 bg-slate-800/60"
              aria-hidden
            />
            <p className="text-lg font-semibold text-white">No sessions yet.</p>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-slate-400">
              Complete a check-in to see your history here.
            </p>
            <Link
              href="/"
              className="mt-10 inline-flex text-sm font-semibold text-teal-400 transition-colors duration-200 hover:text-teal-300"
            >
              Start your first check-in →
            </Link>
          </div>
        ) : (
          <ul className="mt-12 flex flex-col gap-5 md:mt-14">
            {orderedSessions.map((session) => (
              <li
                key={session.id}
                className="rounded-xl border border-slate-700/70 border-l-4 border-l-teal-500 bg-slate-800 p-6 pl-7 shadow-lg shadow-black/20 ring-1 ring-slate-700/40"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <p className="text-sm font-medium tabular-nums text-slate-300">
                    {formatSessionTimestamp(session.timestamp)}
                  </p>
                  <FeedbackBadge session={session} />
                </div>
                <p className="mt-4 text-base text-white">
                  <span className="font-medium text-slate-400">Goal </span>
                  {GOAL_LABEL[session.checkIn.goal]}
                </p>
                <p className="mt-2 text-base text-white">
                  <span className="font-medium text-slate-400">Protocol </span>
                  <span className="font-semibold text-teal-400/95">
                    {protocolNameForId(session.recommendedProtocol)}
                  </span>
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
