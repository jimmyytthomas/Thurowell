'use client';

import { Suspense, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import BreathingSession from '@/components/BreathingSession';
import {
  isBoxBreathingPhaseDuration,
  isSessionDurationMinutes,
  DEFAULT_SESSION_MINUTES,
} from '@/lib/breathPhases';

const BOX_BREATHING_ID = 'box-breathing';

function SessionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const protocolId = searchParams.get('protocolId') ?? '';

  const activeProtocolId = useMemo(
    () => (protocolId === 'body-scan' ? BOX_BREATHING_ID : protocolId),
    [protocolId],
  );

  const boxPhaseDuration = useMemo(() => {
    if (activeProtocolId !== BOX_BREATHING_ID) return undefined;
    const raw = searchParams.get('phaseDuration');
    const parsed = raw ? Number(raw) : 4;
    return isBoxBreathingPhaseDuration(parsed) ? parsed : 4;
  }, [activeProtocolId, searchParams]);

  const sessionMinutes = useMemo(() => {
    const raw = searchParams.get('duration');
    const parsed = raw ? Number(raw) : DEFAULT_SESSION_MINUTES;
    return isSessionDurationMinutes(parsed) ? parsed : DEFAULT_SESSION_MINUTES;
  }, [searchParams]);

  const handleComplete = useCallback(() => {
    if (!activeProtocolId) {
      router.push('/');
      return;
    }
    const params = new URLSearchParams({ protocolId: activeProtocolId });
    router.push(`/complete?${params.toString()}`);
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
          Return to choices
        </button>
      </div>
    );
  }

  return (
    <BreathingSession
      protocolId={activeProtocolId}
      boxPhaseDuration={boxPhaseDuration}
      sessionMinutes={sessionMinutes}
      onComplete={handleComplete}
    />
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
