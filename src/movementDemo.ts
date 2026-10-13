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
  return Math.max(0, Math.min(1, moving * moving * moving * (moving * (moving * 6 - 15) + 10)));
}

export function movementCue(kind: MovementKind, phase: number): string {
  const p = boundedPhase(phase, kind);
  if (kind === 'thumbs') return p >= 4 ? 'Circle complete. Let your hands rest.' : 'Circle one thumb gently around the other';
  return fingerFrames[Math.ceil(p)]!;
}

export type JointPoint = { x: number; y: number; depth: number; radius: number };
/** A stylized three-joint rig, not a medical/anatomical model. */
export function fingerPose(index: number, phase: number): JointPoint[] {
  if (!Number.isInteger(index) || index < 0 || index > 3) return [];
  const extension = fingerExtension(index + 1, phase);
  const curl = 1 - extension;
  const baseX = [147, 176, 204, 229][index]!;
  const lengths = [[33, 25, 20], [40, 29, 24], [36, 27, 22], [27, 22, 17]][index]!;
  const spread = [-.08, -.015, .035, .1][index]! * extension;
  const radius = [11, 11.5, 10.5, 9][index]!;
  const points: JointPoint[] = [{ x: baseX, y: 162, depth: 0, radius }];
  let worldY = 162, depth = 0, x = baseX;
  for (let joint = 0; joint < 3; joint++) {
    const angle = curl * [1.12, 2.05, 2.65][joint]!;
    const length = lengths[joint]!;
    worldY -= Math.cos(angle) * length;
    depth += Math.sin(angle) * length;
    x += Math.sin(spread) * length;
    points.push({ x, y: worldY + depth * .32, depth, radius: radius * [ .91, .8, .69 ][joint]! });
  }
  return points;
}
/** Tapered, rounded silhouette between articulated joints. */
export function jointSegment(a: JointPoint, b: JointPoint): string {
  const dx = b.x - a.x, dy = b.y - a.y;
  const length = Math.hypot(dx, dy);
  if (!Number.isFinite(length) || length < .001) return '';
  const nx = -dy / length, ny = dx / length;
  const tx = dx / length, ty = dy / length;
  const point = (p: JointPoint, sign: number) => `${p.x + nx * p.radius * sign} ${p.y + ny * p.radius * sign}`;
  return `M${point(a, 1)} L${point(b, 1)} Q${b.x + tx * b.radius} ${b.y + ty * b.radius} ${point(b, -1)} L${point(a, -1)} Q${a.x - tx * a.radius} ${a.y - ty * a.radius} ${point(a, 1)}Z`;
}
