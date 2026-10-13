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

/** Continuous soft contour around the rig; joints remain in the pose, not as cuffs. */
export function fingerOutline(points: JointPoint[]): string {
  if (points.length < 2 || points.some(p => !Number.isFinite(p.x + p.y + p.radius))) return '';
  const left: { x: number; y: number }[] = [], right: { x: number; y: number }[] = [];
  points.forEach((p, index) => {
    const before = points[Math.max(0, index - 1)]!, after = points[Math.min(points.length - 1, index + 1)]!;
    const dx = after.x - before.x, dy = after.y - before.y;
    const length = Math.hypot(dx, dy) || 1;
    const nx = -dy / length, ny = dx / length;
    left.push({ x: p.x + nx * p.radius, y: p.y + ny * p.radius });
    right.push({ x: p.x - nx * p.radius, y: p.y - ny * p.radius });
  });
  const last = points.at(-1)!, previous = points.at(-2)!;
  const distance = Math.hypot(last.x - previous.x, last.y - previous.y) || 1;
  const tip = { x: last.x + (last.x - previous.x) / distance * last.radius * .8, y: last.y + (last.y - previous.y) / distance * last.radius * .8 };
  const outline = [...left, tip, ...right.reverse()];
  let path = `M${outline[0]!.x} ${outline[0]!.y}`;
  for (let i = 0; i < outline.length; i++) {
    const a = outline[(i + outline.length - 1) % outline.length]!;
    const b = outline[i]!, c = outline[(i + 1) % outline.length]!, d = outline[(i + 2) % outline.length]!;
    path += `C${b.x + (c.x - a.x) / 6} ${b.y + (c.y - a.y) / 6} ${c.x - (d.x - b.x) / 6} ${c.y - (d.y - b.y) / 6} ${c.x} ${c.y}`;
  }
  return `${path}Z`;
}
