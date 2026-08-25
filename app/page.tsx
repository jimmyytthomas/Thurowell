'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppNav } from '@/components/AppNav';
import WelcomeInstructions from '@/components/WelcomeInstructions';
import { PROTOCOLS } from '@/lib/protocols';
import type { Protocol } from '@/types';

const READY_KEY = 'thurowell_ready';

const MAIN_PROTOCOLS = PROTOCOLS.filter(
  (p) => p.category === 'breathwork' && p.id !== 'bellows-breath',
);

function categoryLabel(category: Protocol['category']): string {
  return category === 'breathwork' ? 'Breathwork' : 'Meditation';
}

function readReadyFlag(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(READY_KEY) === 'true';
  } catch {
    return false;
  }
}

export default function Page() {
  const router = useRouter();
  const [hasAcceptedInstructions, setHasAcceptedInstructions] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHasAcceptedInstructions(readReadyFlag());
    setHydrated(true);
  }, []);

  const handleReady = useCallback(() => {
    try {
      localStorage.setItem(READY_KEY, 'true');
    } catch {
      // Continue even if storage is unavailable
    }
    setHasAcceptedInstructions(true);
  }, []);

  const handleSelectProtocol = useCallback(
    (protocolId: string) => {
      try {
        sessionStorage.setItem('thurowell_protocol', protocolId);
      } catch {
        // Continue even if storage is unavailable
      }
      router.push(`/result?protocolId=${encodeURIComponent(protocolId)}`);
    },
    [router],
  );

  if (!hydrated) {
    return (
      <div className="flex min-h-screen flex-col bg-[var(--bg)] text-[var(--text-primary)]">
        <WelcomeInstructions onReady={handleReady} />
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
          <p className="mt-4 text-sm text-[var(--text-secondary)]">
            Choose a protocol to begin.
          </p>
        </div>

        <ul className="mx-auto mt-12 flex w-full max-w-xl flex-col gap-4 md:mt-14">
          {MAIN_PROTOCOLS.map((protocol) => (
            <li key={protocol.id}>
              <button
                type="button"
                onClick={() => handleSelectProtocol(protocol.id)}
                className="w-full rounded-2xl border border-[var(--border)] border-l-4 border-l-[var(--accent)] bg-[var(--surface)] p-5 text-left transition-colors duration-200 hover:bg-[var(--surface-raised)] hover:ring-1 hover:ring-[var(--accent)]/30 md:p-6"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h2 className="text-lg font-medium text-[var(--text-primary)]">
                    {protocol.name}
                  </h2>
                  <span className="text-xs font-medium text-[var(--text-secondary)]">
                    {categoryLabel(protocol.category)} · {protocol.duration}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">
                  {protocol.description}
                </p>
              </button>
            </li>
          ))}
        </ul>

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
