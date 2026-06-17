export type Goal = 'calm' | 'focus' | 'sleep' | 'reset' | 'confidence';

export interface CheckIn {
  stress: number;
  energy: number;
  focus: number;
  goal: Goal;
}

export interface Protocol {
  id: string;
  name: string;
  category: 'breathwork' | 'meditation';
  duration: string;
  steps: string[];
  tags: Goal[];
  description: string;
}

export interface Session {
  id: string;
  timestamp: string;
  checkIn: CheckIn;
  recommendedProtocol: string;
  helped: boolean | null;
}

export type BreathPhase = {
  label: 'Inhale' | 'Inhale (sip)' | 'Hold' | 'Exhale' | 'Hold (empty)';
  duration: number; // seconds
  scale: number; // circle scale target
  color: string; // hex color
  glow: string; // CSS box-shadow string or empty string
};

export type BreathProtocolConfig = {
  protocolId: string;
  phases: BreathPhase[];
  totalCycles: number;
};

export type SessionFeedback = {
  protocolId: string;
  completedAt: string; // ISO string
  moodBefore?: number; // 1–5
  moodAfter?: number; // 1–5
  notes?: string;
};
