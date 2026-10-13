export type MovementKind = 'fingers' | 'thumbs';
export const demonstrationDurationMs = 18000;
export const fingerFrames = ['Resting hand', 'Release the thumb', 'Open the index finger', 'Open the middle finger', 'Open the ring finger', 'Open the little finger', 'Fold the little finger', 'Fold the ring finger', 'Fold the middle finger', 'Fold the index finger', 'Rest the thumb'] as const;
export function boundedPhase(value: number, kind: MovementKind): number {
  return Number.isFinite(value) ? Math.max(0, Math.min(kind === 'fingers' ? 10 : 4, value)) : 0;
}
export function fingerExtension(index: number, phase: number): number {
  if (!Number.isInteger(index) || index < 0 || index > 4) return 0;
  const p = boundedPhase(phase, 'fingers');
  const amount = Math.max(0, Math.min(1, (p <= 5 ? p : 10 - p) - index));
  // Editorial dwell at both ends gives each gesture room to settle.
  const moving = Math.max(0, Math.min(1, (amount - .12) / .76));
  return moving * moving * moving * (moving * (moving * 6 - 15) + 10);
}

export function movementCue(kind: MovementKind, phase: number): string {
  const p = boundedPhase(phase, kind);
  if (kind === 'thumbs') return p >= 4 ? 'Circle complete. Let your hands rest.' : 'Circle one thumb gently around the other';
  return fingerFrames[Math.ceil(p)]!;
}
