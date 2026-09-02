import type { BreathPhase, BreathProtocolConfig } from '@/types';

const INHALE: Pick<BreathPhase, 'label' | 'color' | 'glow' | 'scale'> = {
  label: 'Inhale',
  color: '#4a9eff',
  glow: '0 0 48px rgba(74, 158, 255, 0.4)',
  scale: 1.35,
};

const INHALE_SIP: Pick<BreathPhase, 'label' | 'color' | 'glow' | 'scale'> = {
  label: 'Inhale (sip)',
  color: '#4a9eff',
  glow: '0 0 48px rgba(74, 158, 255, 0.4)',
  scale: 1.35,
};

const HOLD: Pick<BreathPhase, 'label' | 'color' | 'glow' | 'scale'> = {
  label: 'Hold',
  color: '#a78bfa',
  glow: '0 0 48px rgba(167, 139, 250, 0.4)',
  scale: 1.35,
};

const EXHALE: Pick<BreathPhase, 'label' | 'color' | 'glow' | 'scale'> = {
  label: 'Exhale',
  color: '#34d399',
  glow: '0 0 48px rgba(52, 211, 153, 0.4)',
  scale: 1.0,
};

const HOLD_EMPTY: Pick<BreathPhase, 'label' | 'color' | 'glow' | 'scale'> = {
  label: 'Hold (empty)',
  color: '#6e6e8a',
  glow: '',
  scale: 1.0,
};

function phase(
  base: Pick<BreathPhase, 'label' | 'color' | 'glow' | 'scale'>,
  duration: number,
): BreathPhase {
  return { ...base, duration };
}

const RAPID_INHALE = phase(INHALE, 0.5);
const RAPID_EXHALE = phase(EXHALE, 0.5);
const SLOW_INHALE = phase(INHALE, 3);
const SLOW_EXHALE = phase(EXHALE, 4);

const bellowsPhases: BreathPhase[] = [
  ...Array.from({ length: 30 }, () => [RAPID_INHALE, RAPID_EXHALE]).flat(),
  ...Array.from({ length: 3 }, () => [SLOW_INHALE, SLOW_EXHALE]).flat(),
];

export const BOX_BREATHING_PHASE_DURATIONS = [4, 5, 6, 8, 10, 12] as const;
export type BoxBreathingPhaseDuration = (typeof BOX_BREATHING_PHASE_DURATIONS)[number];

export const SESSION_DURATION_MINUTES = [5, 6, 7, 8, 9, 10] as const;
export type SessionDurationMinutes = (typeof SESSION_DURATION_MINUTES)[number];
export const DEFAULT_SESSION_MINUTES: SessionDurationMinutes = 5;

export function isBoxBreathingPhaseDuration(
  value: number,
): value is BoxBreathingPhaseDuration {
  return (BOX_BREATHING_PHASE_DURATIONS as readonly number[]).includes(value);
}

export function isSessionDurationMinutes(
  value: number,
): value is SessionDurationMinutes {
  return (SESSION_DURATION_MINUTES as readonly number[]).includes(value);
}

function cycleLengthSeconds(phases: BreathPhase[]): number {
  return phases.reduce((sum, p) => sum + p.duration, 0);
}

export function cyclesForSession(
  phases: BreathPhase[],
  sessionMinutes: number,
): number {
  const perCycle = cycleLengthSeconds(phases);
  if (perCycle <= 0) return 1;
  return Math.max(1, Math.round((sessionMinutes * 60) / perCycle));
}

function resolveSessionMinutes(value: number | undefined): SessionDurationMinutes {
  if (value !== undefined && isSessionDurationMinutes(value)) return value;
  return DEFAULT_SESSION_MINUTES;
}

export function getBoxBreathingConfig(
  phaseDuration: BoxBreathingPhaseDuration,
  sessionMinutes: SessionDurationMinutes = DEFAULT_SESSION_MINUTES,
): BreathProtocolConfig {
  const phases = [
    phase(INHALE, phaseDuration),
    phase(HOLD, phaseDuration),
    phase(EXHALE, phaseDuration),
    phase(HOLD_EMPTY, phaseDuration),
  ];
  return {
    protocolId: 'box-breathing',
    phases,
    totalCycles: cyclesForSession(phases, sessionMinutes),
  };
}

const FOUR_SEVEN_EIGHT_PHASES: BreathPhase[] = [
  phase(INHALE, 4),
  phase(HOLD, 7),
  phase(EXHALE, 8),
];

const CYCLIC_SIGHING_PHASES: BreathPhase[] = [
  phase(INHALE, 3),
  phase(INHALE_SIP, 1.5),
  phase(EXHALE, 6),
];

const POWER_BREATH_PHASES: BreathPhase[] = [phase(INHALE, 3), phase(EXHALE, 4)];

export const BREATH_CONFIGS: BreathProtocolConfig[] = [
  getBoxBreathingConfig(4),
  {
    protocolId: '4-7-8-breathing',
    phases: FOUR_SEVEN_EIGHT_PHASES,
    totalCycles: cyclesForSession(FOUR_SEVEN_EIGHT_PHASES, DEFAULT_SESSION_MINUTES),
  },
  {
    protocolId: 'cyclic-sighing',
    phases: CYCLIC_SIGHING_PHASES,
    totalCycles: cyclesForSession(CYCLIC_SIGHING_PHASES, DEFAULT_SESSION_MINUTES),
  },
  {
    protocolId: 'bellows-breath',
    phases: bellowsPhases,
    totalCycles: cyclesForSession(bellowsPhases, DEFAULT_SESSION_MINUTES),
  },
  {
    protocolId: 'power-breath',
    phases: POWER_BREATH_PHASES,
    totalCycles: cyclesForSession(POWER_BREATH_PHASES, DEFAULT_SESSION_MINUTES),
  },
];

export function getBreathConfig(
  protocolId: string,
  options?: { boxPhaseDuration?: number; sessionMinutes?: number },
): BreathProtocolConfig | undefined {
  const sessionMinutes = resolveSessionMinutes(options?.sessionMinutes);

  if (protocolId === 'box-breathing') {
    const duration = options?.boxPhaseDuration ?? 4;
    const phaseDuration = isBoxBreathingPhaseDuration(duration) ? duration : 4;
    return getBoxBreathingConfig(phaseDuration, sessionMinutes);
  }

  const base = BREATH_CONFIGS.find((config) => config.protocolId === protocolId);
  if (!base) return undefined;

  return {
    ...base,
    totalCycles: cyclesForSession(base.phases, sessionMinutes),
  };
}
