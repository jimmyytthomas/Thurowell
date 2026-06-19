'use client';

import { useCallback, useState } from 'react';
import type { CheckIn, Goal } from '@/types';

const GOALS: { label: string; value: Goal }[] = [
  { label: 'Calm Down', value: 'calm' },
  { label: 'Focus', value: 'focus' },
  { label: 'Sleep', value: 'sleep' },
  { label: 'Reset', value: 'reset' },
  { label: 'Confidence', value: 'confidence' },
];

export type CheckInFormProps = {
  onSubmit: (checkIn: CheckIn) => void;
};

export default function CheckInForm({ onSubmit }: CheckInFormProps) {
  const [stress, setStress] = useState(3);
  const [energy, setEnergy] = useState(3);
  const [focus, setFocus] = useState(3);
  const [goal, setGoal] = useState<Goal | null>(null);

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (goal === null) return;
      onSubmit({ stress, energy, focus, goal });
    },
    [stress, energy, focus, goal, onSubmit],
  );

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full flex-col gap-10 rounded-2xl bg-[var(--surface)] p-8 ring-1 ring-[var(--border)]"
    >
      <div className="space-y-8">
        <SliderRow label="Stress" value={stress} onChange={setStress} id="stress" />
        <SliderRow label="Energy" value={energy} onChange={setEnergy} id="energy" />
        <SliderRow label="Focus" value={focus} onChange={setFocus} id="focus" />
      </div>

      <fieldset className="space-y-4 border-0 p-0">
        <legend className="mb-3 block text-sm font-medium text-[var(--text-secondary)]">
          Goal
        </legend>
        <div className="flex flex-wrap gap-3">
          {GOALS.map(({ label, value }) => {
            const isActive = goal === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setGoal(value)}
                className={`rounded-xl px-5 py-2.5 text-sm font-medium transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] ${
                  isActive
                    ? 'bg-[var(--accent)] text-black shadow-[0_0_24px_var(--accent-glow)] ring-2 ring-[var(--accent-hover)]/60'
                    : 'bg-[var(--bg)] text-[var(--text-primary)] ring-1 ring-[var(--border)] hover:ring-[var(--accent)]/40'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </fieldset>

      <button
        type="submit"
        disabled={goal === null}
        className="rounded-xl bg-[var(--accent)] px-6 py-3.5 text-base font-semibold text-black shadow-[0_0_32px_var(--accent-glow)] transition-colors duration-200 hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:bg-[var(--border)] disabled:text-[var(--text-secondary)] disabled:shadow-none"
      >
        Get My Protocol
      </button>
    </form>
  );
}

type SliderRowProps = {
  label: string;
  value: number;
  onChange: (value: number) => void;
  id: string;
};

function SliderRow({ label, value, onChange, id }: SliderRowProps) {
  return (
    <div className="space-y-3">
      <label htmlFor={id} className="block text-base font-medium text-[var(--text-primary)]">
        {label}:{' '}
        <span className="tabular-nums font-semibold text-[var(--accent)]">{value}</span>
      </label>
      <input
        id={id}
        type="range"
        min={1}
        max={5}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[var(--bg)] accent-[var(--accent)] [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-[var(--accent)] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--accent)] [&::-webkit-slider-thumb]:shadow"
      />
      <div className="flex justify-between text-xs text-[var(--text-secondary)]">
        <span>1</span>
        <span>5</span>
      </div>
    </div>
  );
}
