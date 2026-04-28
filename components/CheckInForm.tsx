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

export function CheckInForm({ onSubmit }: CheckInFormProps) {
  const [stress, setStress] = useState(5);
  const [energy, setEnergy] = useState(5);
  const [focus, setFocus] = useState(5);
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
      className="flex w-full max-w-lg flex-col gap-10 rounded-2xl bg-slate-800 p-8 text-white shadow-2xl ring-1 ring-slate-700/70"
    >
      <div className="space-y-8">
        <SliderRow
          label="Stress"
          value={stress}
          onChange={setStress}
          id="stress"
        />
        <SliderRow
          label="Energy"
          value={energy}
          onChange={setEnergy}
          id="energy"
        />
        <SliderRow
          label="Focus"
          value={focus}
          onChange={setFocus}
          id="focus"
        />
      </div>

      <fieldset className="space-y-4 border-0 p-0">
        <legend className="mb-3 block text-sm font-medium tracking-wide text-slate-300">
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
                className={`rounded-xl px-5 py-2.5 text-sm font-medium transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-400 ${
                  isActive
                    ? 'bg-teal-600 text-white shadow-lg shadow-teal-900/40 ring-2 ring-teal-400/80'
                    : 'bg-slate-900/80 text-slate-200 ring-1 ring-slate-700 hover:bg-slate-900 hover:ring-slate-600'
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
        className="rounded-xl bg-teal-600 px-6 py-3.5 text-base font-semibold text-white shadow-lg transition-colors duration-200 hover:bg-teal-500 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-500 disabled:shadow-none"
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
      <label
        htmlFor={id}
        className="block text-base font-medium tracking-wide text-slate-200"
      >
        {label}:{' '}
        <span className="tabular-nums font-semibold text-teal-400">{value}</span>
      </label>
      <input
        id={id}
        type="range"
        min={1}
        max={10}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-800 accent-teal-500 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-teal-400 [&::-webkit-slider-thumb]:shadow [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-teal-400"
      />
      <div className="flex justify-between text-xs text-slate-500">
        <span>1</span>
        <span>10</span>
      </div>
    </div>
  );
}
