'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AppNav } from '@/components/AppNav';
import CheckInForm from '@/components/CheckInForm';
import { classify } from '@/lib/recommend';
import { saveSession } from '@/lib/storage';
import type { CheckIn, Session } from '@/types';

export default function Page() {
  const router = useRouter();

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

  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg)] text-[var(--text-primary)]">
      <AppNav />

      <main className="flex flex-1 flex-col px-6 pb-20 pt-10 md:pt-14">
        <div className="mx-auto flex w-full max-w-2xl flex-col items-center text-center">
          <p className="max-w-xl text-pretty text-2xl font-light leading-snug tracking-tight md:text-4xl md:leading-tight">
            Mental performance, on demand.
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
