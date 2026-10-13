export type SessionState = 'READY' | 'RUNNING' | 'PAUSED' | 'INTERRUPTED' | 'REFLECTION' | 'SAVED';
export type PracticeSession = {
  version: 1; id: string; exerciseId: string; catalogVersion: number; state: SessionState;
  durationMs: number | null; activeMs: number; stage: number; startedAt: string | null;
  lastTick: number | null; safetyAccepted: boolean; endReason: 'finished' | 'early-stop' | 'timer' | null;
  notes: string; comfort: string; usefulness: string;
};
export type SessionEvent = 'START' | 'PAUSE' | 'INTERRUPT' | 'FINISH' | 'STOP' | 'SAVE';
export function createSession(id: string, exerciseId: string, catalogVersion: number, durationMs: number | null): PracticeSession {
  return { version: 1, id, exerciseId, catalogVersion, state: 'READY', durationMs, activeMs: 0, stage: 0, startedAt: null, lastTick: null, safetyAccepted: false, endReason: null, notes: '', comfort: '', usefulness: '' };
}
/** Monotonic foreground time; callbacks only refresh the display, not the clock. */
export function advance(session: PracticeSession, now: number): PracticeSession {
  if (session.state !== 'RUNNING' || session.lastTick === null || !Number.isFinite(now)) return session;
  const activeMs = Math.max(0, session.activeMs + Math.max(0, now - session.lastTick));
  if (session.durationMs !== null && activeMs >= session.durationMs) return { ...session, activeMs: session.durationMs, lastTick: null, state: 'REFLECTION', endReason: 'timer' };
  return { ...session, activeMs, lastTick: Math.max(session.lastTick, now) };
}
export function transition(session: PracticeSession, event: SessionEvent, now: number, wallTime: string): PracticeSession {
  const current = advance(session, now);
  if (event === 'START' && ['READY', 'PAUSED', 'INTERRUPTED'].includes(current.state) && current.safetyAccepted) {
    return { ...current, state: 'RUNNING', lastTick: now, startedAt: current.startedAt ?? wallTime };
  }
  if ((event === 'PAUSE' || event === 'INTERRUPT') && current.state === 'RUNNING') return { ...current, state: event === 'PAUSE' ? 'PAUSED' : 'INTERRUPTED', lastTick: null };
  if ((event === 'FINISH' || event === 'STOP') && current.startedAt && ['RUNNING', 'PAUSED', 'INTERRUPTED'].includes(current.state)) return { ...current, state: 'REFLECTION', lastTick: null, endReason: event === 'STOP' ? 'early-stop' : 'finished' };
  if (event === 'SAVE' && current.state === 'REFLECTION') return { ...current, state: 'SAVED', lastTick: null };
  return current;
}
export function remainingSeconds(session: PracticeSession): number | null {
  return session.durationMs === null ? null : Math.ceil(Math.max(0, session.durationMs - session.activeMs) / 1000);
}
/** Never reconstruct active practice time from wall-clock time after reload. */
export function restoreSession(raw: string | null): PracticeSession | null {
  if (!raw) return null;
  try {
    const s = JSON.parse(raw) as PracticeSession;
    if (!s || s.version !== 1 || typeof s.id !== 'string' || !s.id || typeof s.exerciseId !== 'string' || !Number.isInteger(s.catalogVersion) || !['READY', 'RUNNING', 'PAUSED', 'INTERRUPTED', 'REFLECTION'].includes(s.state)) return null;
    if ((s.durationMs !== null && (!Number.isFinite(s.durationMs) || s.durationMs < 1000 || s.durationMs > 3600000)) || !Number.isFinite(s.activeMs) || s.activeMs < 0 || (s.durationMs !== null && s.activeMs > s.durationMs)) return null;
    if (!Number.isInteger(s.stage) || s.stage < 0 || s.stage > 100 || !(s.startedAt === null || (typeof s.startedAt === 'string' && Number.isFinite(Date.parse(s.startedAt))))) return null;
    if (typeof s.notes !== 'string' || s.notes.length > 10000 || !['', '1', '2', '3', '4', '5'].includes(s.comfort) || !['', 'helpful', 'not-helpful', 'unsure'].includes(s.usefulness) || ![null, 'finished', 'early-stop', 'timer'].includes(s.endReason)) return null;
    return { ...s, lastTick: null, safetyAccepted: false, state: s.state === 'RUNNING' ? 'INTERRUPTED' : s.state };
  } catch { return null; }
}
