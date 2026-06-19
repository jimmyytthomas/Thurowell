'use client';

const STEPS = [
  {
    title: 'Check in',
    description:
      'Rate your stress, energy, and focus from 1–5, then choose a goal for this session.',
  },
  {
    title: 'Get your protocol',
    description:
      'Thurowell recommends a breathwork or meditation technique matched to how you feel right now.',
  },
  {
    title: 'Start the session',
    description:
      'Follow the guided breathing circle or audio meditation. A short countdown gives you time to settle in.',
  },
  {
    title: 'Reflect & track',
    description:
      'After your session, note how you felt. Your history is saved locally on this device.',
  },
] as const;

export type WelcomeInstructionsProps = {
  onReady: () => void;
};

export default function WelcomeInstructions({ onReady }: WelcomeInstructionsProps) {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg)] text-[var(--text-primary)]">
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-6 pb-12 pt-16 md:pt-20">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
            Welcome
          </p>
          <h1 className="mt-4 text-4xl font-light tracking-tight md:text-5xl">Thurowell</h1>
          <p className="mx-auto mt-5 max-w-lg text-base leading-relaxed text-[var(--text-secondary)]">
            CONTROL YOUR BREATH, CONTROL YOUR MIND. Here&apos;s how to use the app
            before you begin.
          </p>
        </div>

        <ol className="mt-12 space-y-6">
          {STEPS.map(({ title, description }, index) => (
            <li
              key={title}
              className="flex gap-4 rounded-2xl bg-[var(--surface)] p-5 ring-1 ring-[var(--border)]"
            >
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--accent)]/15 text-sm font-bold text-[var(--accent)] ring-1 ring-[var(--accent)]/30"
                aria-hidden
              >
                {index + 1}
              </span>
              <div>
                <h2 className="font-medium text-[var(--text-primary)]">{title}</h2>
                <p className="mt-1.5 text-sm leading-relaxed text-[var(--text-secondary)]">
                  {description}
                </p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-12 flex flex-col items-center gap-6">
          <button
            type="button"
            onClick={onReady}
            className="w-full max-w-sm rounded-xl bg-[var(--accent)] py-4 text-base font-semibold text-black shadow-[0_0_32px_var(--accent-glow)] transition-colors duration-200 hover:bg-[var(--accent-hover)]"
          >
            I&apos;m ready
          </button>
          <p className="max-w-sm text-center text-xs leading-relaxed text-[var(--text-secondary)]">
            Thurowell is a wellness tool for performance and recovery. It is not a
            medical device and does not diagnose or treat any condition.
          </p>
        </div>
      </main>
    </div>
  );
}
