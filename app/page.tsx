'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppNav } from '@/components/AppNav';
import CheckInForm from '@/components/CheckInForm';
import WelcomeInstructions from '@/components/WelcomeInstructions';
import { classify } from '@/lib/recommend';
import { saveSession } from '@/lib/storage';
import type { CheckIn, Session } from '@/types';

const READY_KEY = 'thurowell_ready';

export default function Page() {
  const router = useRouter();
  const [hasAcceptedInstructions, setHasAcceptedInstructions] = useState<
    boolean | null
  >(null);

  useEffect(() => {
    setHasAcceptedInstructions(localStorage.getItem(READY_KEY) === 'true');
  }, []);

  const handleReady = useCallback(() => {
    try {
      localStorage.setItem(READY_KEY, 'true');
    } catch {
      // Continue even if storage is unavailable
    }
    setHasAcceptedInstructions(true);
  }, []);

  const handleSubmit = useCallback(
    (checkIn: CheckIn) => {
      const protocolId = classify(checkIn);
      const session: Session = {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        checkIn,
        recommendedProtocol: protocolId,
        helped: null,
      };
      saveSession(session);
      sessionStorage.setItem('thurowell_current', session.id);
      router.push('/result');
    },
    [router],
  );

  if (hasAcceptedInstructions === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] text-[var(--text-secondary)]">
        <p className="font-light">Loading…</p>
      </div>
    );
  }

  if (!hasAcceptedInstructions) {
    return <WelcomeInstructions onReady={handleReady} />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg)] text-[var(--text-primary)]">
      <AppNav />

      <main className="flex flex-1 flex-col px-6 pb-20 pt-10 md:pt-14">
        <div className="mx-auto flex w-full max-w-2xl flex-col items-center text-center">
          <p className="max-w-2xl text-pretty text-xl font-light uppercase leading-snug tracking-wide md:text-3xl md:leading-tight">
            CONTROL YOUR BREATH, CONTROL YOUR MIND.
          </p>
        </div>

        <div className="mx-auto mt-14 w-full max-w-xl md:mt-16">
          <CheckInForm onSubmit={handleSubmit} />
        </div>

        <div className="mx-auto mt-14 max-w-xl md:mt-16">
          <p className="text-center text-xs leading-relaxed text-[var(--text-secondary)]">
            Thurowell is a wellness tool for performance and recovery. It is not
            a medical device and does not diagnose or treat any condition.
          </p>
        </div>
      </main>
    </div>
  );
}
