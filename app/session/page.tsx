'use client';

import { Suspense, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import BreathingSession from '@/components/BreathingSession';
import MeditationSession from '@/components/MeditationSession';
import type { SessionFeedback } from '@/types';

const PENDING_FEEDBACK_KEY = 'thurowell_pending_feedback';

function savePartialFeedback(
  feedback: Pick<SessionFeedback, 'protocolId' | 'completedAt'>,
): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PENDING_FEEDBACK_KEY, JSON.stringify(feedback));
  } catch {
    // Ignore storage failures
  }
}

function SessionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const protocolId = searchParams.get('protocolId') ?? '';

  const handleComplete = useCallback(() => {
    if (!protocolId) {
      router.push('/');
      return;
    }
    savePartialFeedback({
      protocolId,
      completedAt: new Date().toISOString(),
    });
    router.push('/complete');
  }, [protocolId, router]);

  if (!protocolId) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--bg)] px-6 text-[var(--text-primary)]">
        <p className="text-center font-light text-[var(--text-secondary)]">
          No protocol selected.
        </p>
        <button
          type="button"
          onClick={() => router.push('/')}
          className="mt-6 text-sm text-[var(--accent)] transition-colors duration-300 hover:text-[var(--accent-hover)]"
        >
          Return to check-in
        </button>
      </div>
    );
  }

  if (protocolId === 'body-scan') {
    return <MeditationSession onComplete={handleComplete} />;
  }

  return (
    <BreathingSession protocolId={protocolId} onComplete={handleComplete} />
  );
}

export default function SessionPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] text-[var(--text-secondary)]">
          <p className="font-light">Loading session…</p>
        </div>
      }
    >
      <SessionContent />
    </Suspense>
  );
}
