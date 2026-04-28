import type { Session } from '@/types';

export const STORAGE_KEY = 'thurowell_sessions';

function persistSessions(sessions: Session[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  } catch {
    // Ignore quota / serialization failures
  }
}

export function saveSession(session: Session): void {
  const existing = getSessions();
  persistSessions([session, ...existing]);
}

export function getSessions(): Session[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw === null) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed as Session[];
  } catch {
    return [];
  }
}

export function updateFeedback(id: string, helped: boolean): void {
  const sessions = getSessions();
  const idx = sessions.findIndex((s) => s.id === id);
  if (idx === -1) return;
  const updated = [...sessions];
  updated[idx] = { ...updated[idx], helped };
  persistSessions(updated);
}
