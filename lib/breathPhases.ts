import type { BreathPhase, BreathProtocolConfig } from '@/types';

const INHALE: Pick<BreathPhase, 'label' | 'color' | 'glow' | 'scale'> = {
  label: 'Inhale',
  color: '#4ade80',
  glow: '0 0 48px rgba(74, 222, 128, 0.45)',
  scale: 1.35,
};

const INHALE_SIP: Pick<BreathPhase, 'label' | 'color' | 'glow' | 'scale'> = {
  label: 'Inhale (sip)',
  color: '#4ade80',
  glow: '0 0 48px rgba(74, 222, 128, 0.45)',
  scale: 1.35,
};

const HOLD: Pick<BreathPhase, 'label' | 'color' | 'glow' | 'scale'> = {
  label: 'Hold',
  color: '#22c55e',
  glow: '0 0 48px rgba(34, 197, 94, 0.4)',
  scale: 1.35,
};

const EXHALE: Pick<BreathPhase, 'label' | 'color' | 'glow' | 'scale'> = {
  label: 'Exhale',
  color: '#15803d',
  glow: '0 0 48px rgba(21, 128, 61, 0.35)',
  scale: 1.0,
};

const HOLD_EMPTY: Pick<BreathPhase, 'label' | 'color' | 'glow' | 'scale'> = {
  label: 'Hold (empty)',
  color: '#365314',
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

export const BREATH_CONFIGS: BreathProtocolConfig[] = [
  {
    protocolId: 'box-breathing',
    phases: [
      phase(INHALE, 4),
      phase(HOLD, 4),
      phase(EXHALE, 4),
      phase(HOLD_EMPTY, 4),
    ],
    totalCycles: 18,
  },
  {
    protocolId: '4-7-8-breathing',
    phases: [phase(INHALE, 4), phase(HOLD, 7), phase(EXHALE, 8)],
    totalCycles: 16,
  },
  {
    protocolId: 'cyclic-sighing',
    phases: [phase(INHALE, 3), phase(INHALE_SIP, 1.5), phase(EXHALE, 6)],
    totalCycles: 28,
  },
  {
    protocolId: 'bellows-breath',
    phases: bellowsPhases,
    totalCycles: 1,
  },
  {
    protocolId: 'power-breath',
    phases: [phase(INHALE, 3), phase(EXHALE, 4)],
    totalCycles: 26,
  },
];

export function getBreathConfig(protocolId: string): BreathProtocolConfig | undefined {
  return BREATH_CONFIGS.find((config) => config.protocolId === protocolId);
}
