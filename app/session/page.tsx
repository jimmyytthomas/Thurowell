'use client';

import { Suspense, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import BreathingSession from '@/components/BreathingSession';
import type { SessionFeedback } from '@/types';

const PENDING_FEEDBACK_KEY = 'thurowell_pending_feedback';
const BOX_BREATHING_ID = 'box-breathing';

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

  const activeProtocolId = useMemo(
    () => (protocolId === 'body-scan' ? BOX_BREATHING_ID : protocolId),
    [protocolId],
  );

  const handleComplete = useCallback(() => {
    if (!activeProtocolId) {
      router.push('/');
      return;
    }
    savePartialFeedback({
      protocolId: activeProtocolId,
      completedAt: new Date().toISOString(),
    });
    router.push('/complete');
  }, [activeProtocolId, router]);

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

  return (
    <BreathingSession protocolId={activeProtocolId} onComplete={handleComplete} />
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
