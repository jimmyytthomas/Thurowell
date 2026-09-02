'use client';

import Link from 'next/link';
import { Suspense, useCallback, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AppNav } from '@/components/AppNav';
import { unlockBreathAudio } from '@/lib/breathAudio';
import {
  BOX_BREATHING_PHASE_DURATIONS,
  DEFAULT_SESSION_MINUTES,
  SESSION_DURATION_MINUTES,
  getBreathConfig,
  type BoxBreathingPhaseDuration,
  type SessionDurationMinutes,
} from '@/lib/breathPhases';
import { PROTOCOLS } from '@/lib/protocols';
import type { Protocol } from '@/types';

const BOX_BREATHING_ID = 'box-breathing';

function categoryLabel(category: Protocol['category']): string {
  return category === 'breathwork' ? 'Breathwork' : 'Meditation';
}

function ResultContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const protocolId = searchParams.get('protocolId') ?? '';
  const [boxPhaseDuration, setBoxPhaseDuration] =
    useState<BoxBreathingPhaseDuration>(4);
  const [sessionMinutes, setSessionMinutes] =
    useState<SessionDurationMinutes>(DEFAULT_SESSION_MINUTES);

  const protocol = useMemo(() => {
    if (!protocolId) return null;
    return PROTOCOLS.find((p) => p.id === protocolId) ?? null;
  }, [protocolId]);

  const isBoxBreathing = protocol?.id === BOX_BREATHING_ID;
  const isBreathwork = protocol?.category === 'breathwork';

  const sessionPreview = useMemo(() => {
    if (!protocol || !isBreathwork) return undefined;
    return getBreathConfig(protocol.id, {
      boxPhaseDuration: isBoxBreathing ? boxPhaseDuration : undefined,
      sessionMinutes,
    });
  }, [protocol, isBreathwork, isBoxBreathing, boxPhaseDuration, sessionMinutes]);

  const handleStartSession = useCallback(() => {
    if (!protocol) return;
    unlockBreathAudio();
    try {
      sessionStorage.setItem('thurowell_protocol', protocol.id);
    } catch {
      // Continue even if storage is unavailable
    }
    const params = new URLSearchParams({ protocolId: protocol.id });
    if (protocol.category === 'breathwork') {
      params.set('duration', String(sessionMinutes));
    }
    if (protocol.id === BOX_BREATHING_ID) {
      params.set('phaseDuration', String(boxPhaseDuration));
    }
    router.push(`/session?${params.toString()}`);
  }, [protocol, router, boxPhaseDuration, sessionMinutes]);

  if (!protocolId) {
    return (
      <div className="flex min-h-screen flex-col bg-[var(--bg)] text-[var(--text-primary)]">
        <AppNav />
        <div className="flex flex-1 flex-col items-center justify-center px-6">
          <p className="text-center font-light text-[var(--text-secondary)]">
            No protocol selected.
          </p>
          <Link
            href="/"
            className="mt-6 text-sm text-[var(--accent)] transition-colors duration-200 hover:text-[var(--accent-hover)]"
          >
            ← All protocols
          </Link>
        </div>
      </div>
    );
  }

  if (!protocol) {
    return (
      <div className="flex min-h-screen flex-col bg-[var(--bg)] text-[var(--text-primary)]">
        <AppNav />
        <div className="flex flex-1 flex-col items-center justify-center px-6">
          <p className="text-center font-light text-[var(--text-secondary)]">
            Protocol not found.
          </p>
          <Link
            href="/"
            className="mt-6 text-sm text-[var(--accent)] transition-colors duration-200 hover:text-[var(--accent-hover)]"
          >
            ← All protocols
          </Link>
        </div>
      </div>
    );
  }

  const subtitle = isBreathwork
    ? `${categoryLabel(protocol.category)} · ${sessionMinutes} minutes`
    : `${categoryLabel(protocol.category)} · ${protocol.duration}`;

  const optionButtonClass = (selected: boolean) =>
    `min-w-[3.25rem] rounded-lg px-4 py-2.5 text-sm font-medium transition-colors duration-200 ${
      selected
        ? 'bg-[var(--accent)] text-black shadow-[0_0_24px_var(--accent-glow)]'
        : 'bg-[var(--surface)] text-[var(--text-secondary)] ring-1 ring-[var(--border)] hover:text-[var(--text-primary)] hover:ring-[var(--accent)]/40'
    }`;

  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg)] text-[var(--text-primary)]">
      <AppNav />

      <div className="mx-auto w-full max-w-2xl flex-1 px-6 pb-20 pt-8 md:pt-10">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm font-medium text-[var(--text-secondary)] transition-colors duration-200 hover:text-[var(--accent)]"
        >
          ← All protocols
        </Link>

        <article className="mt-8 rounded-2xl bg-[var(--surface)] p-8 ring-1 ring-[var(--border)] md:p-10">
          <h1 className="text-3xl font-light tracking-tight md:text-4xl">{protocol.name}</h1>
          <p className="mt-3 text-sm font-medium text-[var(--text-secondary)]">{subtitle}</p>
          <p className="mt-8 leading-relaxed text-[var(--text-primary)]/90">
            {protocol.description}
          </p>

          {isBreathwork && (
            <section className="mt-10 rounded-xl bg-[var(--bg)]/60 p-6 ring-1 ring-[var(--border)] md:p-8">
              <h2 className="text-base font-medium text-[var(--text-primary)]">
                Session length
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
                Choose how long you want to practice. 5 minutes is the default.
              </p>
              <div
                className="mt-5 flex flex-wrap gap-2"
                role="group"
                aria-label="Session length in minutes"
              >
                {SESSION_DURATION_MINUTES.map((minutes) => {
                  const selected = sessionMinutes === minutes;
                  return (
                    <button
                      key={minutes}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => setSessionMinutes(minutes)}
                      className={optionButtonClass(selected)}
                    >
                      {minutes} min
                    </button>
                  );
                })}
              </div>
              <p className="mt-4 text-xs text-[var(--text-secondary)]">
                {sessionMinutes} minutes
                {sessionPreview
                  ? ` · ${sessionPreview.totalCycles} cycles`
                  : ''}
              </p>
            </section>
          )}

          {isBoxBreathing && (
            <section className="mt-6 rounded-xl bg-[var(--bg)]/60 p-6 ring-1 ring-[var(--border)] md:p-8">
              <h2 className="text-base font-medium text-[var(--text-primary)]">
                Phase duration
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
                Choose how long each inhale, hold, exhale, and empty hold lasts.
                All four sides use the same count.
              </p>
              <div
                className="mt-5 flex flex-wrap gap-2"
                role="group"
                aria-label="Box breathing phase duration in seconds"
              >
                {BOX_BREATHING_PHASE_DURATIONS.map((seconds) => {
                  const selected = boxPhaseDuration === seconds;
                  return (
                    <button
                      key={seconds}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => setBoxPhaseDuration(seconds)}
                      className={optionButtonClass(selected)}
                    >
                      {seconds}s
                    </button>
                  );
                })}
              </div>
              <p className="mt-4 text-xs text-[var(--text-secondary)]">
                {boxPhaseDuration} seconds per side · {boxPhaseDuration * 4}{' '}
                seconds per cycle
              </p>
            </section>
          )}

          <button
            type="button"
            onClick={handleStartSession}
            className="mt-10 w-full rounded-xl bg-[var(--accent)] py-4 text-base font-semibold text-black shadow-[0_0_32px_var(--accent-glow)] transition-colors duration-200 hover:bg-[var(--accent-hover)]"
          >
            Start Session
          </button>
        </article>
      </div>
    </div>
  );
}

export default function ResultPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen flex-col bg-[var(--bg)]">
          <AppNav />
          <div className="flex flex-1 items-center justify-center text-[var(--text-secondary)]">
            <p className="font-light">Loading…</p>
          </div>
        </div>
      }
    >
      <ResultContent />
    </Suspense>
  );
}
