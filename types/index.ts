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
