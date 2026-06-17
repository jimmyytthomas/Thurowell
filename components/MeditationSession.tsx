'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface MeditationSessionProps {
  onComplete: () => void;
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function MeditationSession({ onComplete }: MeditationSessionProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const [isPlaying, setIsPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoaded = () => {
      if (Number.isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const handleTimeUpdate = () => {
      setElapsed(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      onCompleteRef.current();
    };

    audio.addEventListener('loadedmetadata', handleLoaded);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoaded);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlay = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      try {
        await audio.play();
        setIsPlaying(true);
      } catch {
        setIsPlaying(false);
      }
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  }, []);

  const handleEndEarly = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
    }
    setIsPlaying(false);
    onCompleteRef.current();
  }, []);

  const progress = duration > 0 ? Math.min(100, (elapsed / duration) * 100) : 0;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--bg)] px-6 pb-12 pt-8 text-[var(--text-primary)]">
      <h1 className="mb-12 text-center text-2xl font-light tracking-wide sm:text-3xl">
        Body scan
      </h1>

      <audio ref={audioRef} src="/audio/body-scan.mp3" preload="metadata" />

      <button
        type="button"
        onClick={() => void togglePlay()}
        className="rounded-full bg-[var(--accent)] px-10 py-4 text-base font-medium text-black shadow-[0_0_32px_var(--accent-glow)] transition-colors duration-300 ease-in-out hover:bg-[var(--accent-hover)]"
      >
        {isPlaying ? 'Pause' : 'Play'}
      </button>

      <div className="mt-10 w-full max-w-md">
        <div className="h-2 overflow-hidden rounded-full bg-[var(--surface)] ring-1 ring-[var(--border)]">
          <div
            className="h-full rounded-full bg-[var(--accent)] transition-all duration-300 ease-in-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-3 flex justify-between text-sm tabular-nums text-[var(--text-secondary)]">
          <span>{formatTime(elapsed)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

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
