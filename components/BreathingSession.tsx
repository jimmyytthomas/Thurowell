'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { getBreathConfig } from '@/lib/breathPhases';
import type { BreathPhase, BreathProtocolConfig } from '@/types';

interface BreathingSessionProps {
  protocolId: string;
  onComplete: () => void;
}

type SessionMode = 'loading' | 'prep' | 'active';

function wait(ms: number, cancelled: () => boolean): Promise<void> {
  return new Promise((resolve) => {
    if (cancelled()) {
      resolve();
      return;
    }
    setTimeout(resolve, ms);
  });
}

export default function BreathingSession({
  protocolId,
  onComplete,
}: BreathingSessionProps) {
  const config = getBreathConfig(protocolId);
  const [mode, setMode] = useState<SessionMode>('loading');
  const [prepCount, setPrepCount] = useState(0);
  const [phase, setPhase] = useState<BreathPhase | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [cycle, setCycle] = useState(1);
  const [circleScale, setCircleScale] = useState(1);
  const [scaleTransitionMs, setScaleTransitionMs] = useState(0);

  const cancelledRef = useRef(false);
  const completedRef = useRef(false);
  const scaleRef = useRef(1);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const finishSession = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    onCompleteRef.current();
  }, []);

  const handleEndEarly = useCallback(() => {
    cancelledRef.current = true;
    finishSession();
  }, [finishSession]);

  useLayoutEffect(() => {
    if (mode !== 'active' || !phase) return;

    const startScale = scaleRef.current;
    const endScale = phase.scale;
    const durationMs = Math.round(phase.duration * 1000);
    const shouldAnimate = Math.abs(endScale - startScale) > 0.001;

    setScaleTransitionMs(0);
    setCircleScale(startScale);

    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        if (shouldAnimate) {
          setScaleTransitionMs(durationMs);
          setCircleScale(endScale);
        } else {
          setScaleTransitionMs(0);
          setCircleScale(endScale);
        }
      });
    });

    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [phase, mode]);

  useEffect(() => {
    if (!config) return;

    cancelledRef.current = false;

    const runPrep = async () => {
      scaleRef.current = 1;
      setScaleTransitionMs(0);
      setCircleScale(1);
      setMode('prep');
      setPhase(null);

      for (const n of [3, 2, 1] as const) {
        if (cancelledRef.current) return;
        setPrepCount(n);
        await wait(1000, () => cancelledRef.current);
      }

      if (cancelledRef.current) return;
      setMode('active');
    };

    const runSession = async (sessionConfig: BreathProtocolConfig) => {
      scaleRef.current = 1;
      setCircleScale(1);

      await runPrep();
      if (cancelledRef.current) return;

      for (let c = 1; c <= sessionConfig.totalCycles; c += 1) {
        if (cancelledRef.current) return;
        setCycle(c);

        for (const currentPhase of sessionConfig.phases) {
          if (cancelledRef.current) return;

          setPhase(currentPhase);
          setCountdown(Math.max(1, Math.ceil(currentPhase.duration)));

          const durationMs = currentPhase.duration * 1000;
          const start = Date.now();
          const intervalId = setInterval(() => {
            if (cancelledRef.current) return;
            const elapsed = (Date.now() - start) / 1000;
            const remaining = Math.max(0, currentPhase.duration - elapsed);
            setCountdown(remaining <= 0 ? 0 : Math.max(1, Math.ceil(remaining)));
          }, 100);

          await wait(durationMs, () => cancelledRef.current);
          clearInterval(intervalId);
          scaleRef.current = currentPhase.scale;
        }
      }

      if (!cancelledRef.current) {
        finishSession();
      }
    };

    void runSession(config);

    return () => {
      cancelledRef.current = true;
    };
  }, [config, finishSession]);

  if (!config) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--bg)] px-6 text-[var(--text-primary)]">
        <p className="text-center font-light text-[var(--text-secondary)]">
          This breathwork protocol is not available.
        </p>
      </div>
    );
  }

  if (mode === 'loading') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--bg)] text-[var(--text-primary)]">
        <p className="font-light text-[var(--text-secondary)]">Preparing session…</p>
      </div>
    );
  }

  const isPrep = mode === 'prep';
  const label = isPrep ? 'Get ready' : (phase?.label ?? '');
  const displayCount = isPrep ? prepCount : countdown;
  const circleColor = isPrep ? '#365314' : (phase?.color ?? '#365314');
  const circleGlow = isPrep ? '' : (phase?.glow ?? '');

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--bg)] px-6 pb-12 pt-8 text-[var(--text-primary)]">
      <p className="mb-6 text-center text-3xl font-light tracking-wide sm:text-4xl">
        {label}
      </p>
      <p className="mb-10 text-5xl font-light tabular-nums text-[var(--text-secondary)]">
        {displayCount}
      </p>

      <div className="flex h-52 w-52 items-center justify-center sm:h-60 sm:w-60">
        <div
          className="h-44 w-44 rounded-full sm:h-52 sm:w-52"
          style={{
            backgroundColor: circleColor,
            transform: `scale(${circleScale})`,
            boxShadow: circleGlow || undefined,
            transition: [
              `transform ${scaleTransitionMs}ms ease-in-out`,
              'background-color 300ms ease-in-out',
              'box-shadow 300ms ease-in-out',
            ].join(', '),
          }}
          aria-hidden
        />
      </div>

      {!isPrep && (
        <p className="mt-14 text-sm font-light text-[var(--text-secondary)]">
          Cycle {cycle} of {config.totalCycles}
        </p>
      )}

      <button
        type="button"
        onClick={handleEndEarly}
        className="mt-16 text-sm text-[var(--text-secondary)] underline-offset-4 transition-colors duration-300 hover:text-[var(--accent)] hover:underline"
      >
        End session early
      </button>
    </div>
  );
}
