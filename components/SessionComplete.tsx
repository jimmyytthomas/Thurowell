'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { PROTOCOLS } from '@/lib/protocols';
import type { SessionFeedback } from '@/types';

const PENDING_FEEDBACK_KEY = 'thurowell_pending_feedback';
const FEEDBACK_STORAGE_KEY = 'thurowell_session_feedback';

function getPendingFeedback(): SessionFeedback | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(PENDING_FEEDBACK_KEY);
  if (raw === null) return null;
  try {
    const parsed = JSON.parse(raw) as SessionFeedback;
    if (!parsed.protocolId || !parsed.completedAt) return null;
    return parsed;
  } catch {
    return null;
  }
}

function getSavedFeedbacks(): SessionFeedback[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(FEEDBACK_STORAGE_KEY);
  if (raw === null) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed as SessionFeedback[];
  } catch {
    return [];
  }
}

function saveFullFeedback(feedback: SessionFeedback): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getSavedFeedbacks();
    localStorage.setItem(
      FEEDBACK_STORAGE_KEY,
      JSON.stringify([feedback, ...existing]),
    );
    localStorage.removeItem(PENDING_FEEDBACK_KEY);
  } catch {
    // Ignore storage failures
  }
}

function MoodSelector({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number | null;
  onChange: (value: number) => void;
}) {
  return (
    <fieldset className="space-y-3 border-0 p-0">
      <legend className="text-sm font-medium text-[var(--text-primary)]">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {[1, 2, 3, 4, 5].map((n) => {
          const isActive = value === n;
          return (
            <button
              key={n}
              type="button"
              onClick={() => onChange(n)}
              className={`flex h-11 w-11 items-center justify-center rounded-xl text-sm font-semibold transition-colors duration-300 ease-in-out ${
                isActive
                  ? 'bg-[var(--accent)] text-black shadow-[0_0_20px_var(--accent-glow)]'
                  : 'bg-[var(--bg)] text-[var(--text-secondary)] ring-1 ring-[var(--border)] hover:text-[var(--text-primary)]'
              }`}
            >
              {n}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

export default function SessionComplete() {
  const router = useRouter();
  const [pending, setPending] = useState<SessionFeedback | null>(null);
  const [ready, setReady] = useState(false);
  const [moodBefore, setMoodBefore] = useState<number | null>(null);
  const [moodAfter, setMoodAfter] = useState<number | null>(null);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const feedback = getPendingFeedback();
    if (!feedback) {
      router.push('/');
      return;
    }
    setPending(feedback);
    setReady(true);
  }, [router]);

  const protocolName =
    PROTOCOLS.find((p) => p.id === pending?.protocolId)?.name ?? 'Your session';

  const handleSave = useCallback(() => {
    if (!pending) return;
    saveFullFeedback({
      ...pending,
      moodBefore: moodBefore ?? undefined,
      moodAfter: moodAfter ?? undefined,
      notes: notes.trim() || undefined,
    });
    router.push('/');
  }, [pending, moodBefore, moodAfter, notes, router]);

  const handleSkip = useCallback(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(PENDING_FEEDBACK_KEY);
      } catch {
        // ignore
      }
    }
    router.push('/');
  }, [router]);

  if (!ready || !pending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] text-[var(--text-secondary)]">
        <p className="font-light">Loading…</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--bg)] px-6 py-12 text-[var(--text-primary)]">
      <div className="w-full max-w-lg space-y-8">
        <div className="text-center">
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
          <h1 className="text-3xl font-light tracking-tight">Session complete</h1>
          <p className="mt-2 text-base text-[var(--text-secondary)]">{protocolName}</p>
        </div>

        <div className="space-y-8 rounded-2xl bg-[var(--surface)] p-8 ring-1 ring-[var(--border)]">
          <MoodSelector
            label="How did you feel before?"
            value={moodBefore}
            onChange={setMoodBefore}
          />
          <MoodSelector
            label="How do you feel now?"
            value={moodAfter}
            onChange={setMoodAfter}
          />

          <div className="space-y-3">
            <label htmlFor="session-notes" className="text-sm font-medium text-[var(--text-primary)]">
              Notes <span className="text-[var(--text-secondary)]">(optional)</span>
            </label>
            <textarea
              id="session-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any observations..."
              rows={4}
              className="w-full resize-none rounded-xl bg-[var(--bg)] px-4 py-3 text-sm text-[var(--text-primary)] ring-1 ring-[var(--border)] transition-shadow duration-300 placeholder:text-[var(--text-secondary)] focus:outline-none focus:ring-[var(--accent)]"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="w-full rounded-xl bg-[var(--accent)] py-4 text-base font-semibold text-black shadow-[0_0_32px_var(--accent-glow)] transition-colors duration-300 ease-in-out hover:bg-[var(--accent-hover)]"
        >
          Save &amp; finish
        </button>

        <button
          type="button"
          onClick={handleSkip}
          className="mx-auto block text-sm text-[var(--text-secondary)] underline-offset-4 transition-colors duration-300 hover:text-[var(--accent)] hover:underline"
        >
          Skip
        </button>
      </div>
    </div>
  );
}
