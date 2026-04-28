import type { CheckIn } from '@/types';

export function classify(checkIn: CheckIn): string {
  const { stress, energy, focus, goal } = checkIn;

  if (stress >= 7 && goal === 'sleep') {
    return '4-7-8-breathing';
  }
  if (stress >= 7) {
    return '4-7-8-breathing';
  }
  if (energy <= 3 && goal === 'confidence') {
    return 'power-breath';
  }
  if (energy <= 3) {
    return 'bellows-breath';
  }
  if (focus <= 4 || goal === 'focus') {
    return 'cyclic-sighing';
  }
  if (goal === 'calm' || goal === 'reset') {
    return '4-7-8-breathing';
  }
  if (goal === 'sleep') {
    return 'body-scan';
  }
  if (goal === 'confidence') {
    return 'power-breath';
  }
  return 'box-breathing';
}
