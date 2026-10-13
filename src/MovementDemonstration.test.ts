import { describe, it, expect } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MovementDemonstration } from './MovementDemonstration';
import { boundedPhase, fingerExtension, fingerPose, jointSegment, fingerOutline, movementCue } from './movementDemo';

describe('optional movement demonstrations', () => {
  it('starts still, describes the illustration and keeps a nonmoving alternative', () => {
    const html = renderToStaticMarkup(createElement(MovementDemonstration, { kind: 'fingers', motionAllowed: false, available: true }));
    expect(html).toContain('data-playing="false"');
    expect(html).toContain('Choose a still frame');
    expect(html).toContain('Modern visual aid');
    expect(html).toContain('Simplified hand');
    expect(html).toContain('disabled');
  });
  it('has no animated preview during a started practice', () => {
    const html = renderToStaticMarkup(createElement(MovementDemonstration, { kind: 'thumbs', motionAllowed: true, available: false }));
    expect(html).toContain('data-playing="false"');
    expect(html).toContain('Demonstration motion stops when practice starts');
    expect(html).toContain('separate from your practice timer');
  });
  it('settles at each pose while keeping movement ordered and continuous', () => {
    expect(fingerExtension(1, 1.1)).toBe(0);
    expect(fingerExtension(1, 1.9)).toBe(1);
    let previous = 0;
    for (let step = 0; step <= 100; step++) {
      const next = fingerExtension(1, 1 + step / 100);
      expect(next).toBeGreaterThanOrEqual(previous);
      expect(next).toBeLessThanOrEqual(1);
      expect(fingerExtension(1, 9 - step / 100)).toBeCloseTo(next, 10);
      previous = next;
    }
    expect(fingerExtension(1, 1.5)).toBeCloseTo(.5);
  });
  it('articulates three tapered joints without invalid geometry or changing source order', () => {
    expect(fingerPose(-1, 5)).toEqual([]);
    expect(fingerPose(4, 5)).toEqual([]);
    for (let index = 0; index < 4; index++) {
      const open = fingerPose(index, 5);
      const closed = fingerPose(index, 0);
      expect(open).toHaveLength(4);
      expect(open[3]!.y).toBeLessThan(open[0]!.y);
      expect(closed[3]!.y).toBeGreaterThan(closed[0]!.y);
      for (let phase = 0; phase <= 10; phase += .125) {
        const pose = fingerPose(index, phase);
        const reverse = fingerPose(index, 10 - phase);
        expect(fingerOutline(pose)).not.toMatch(/NaN|Infinity/);
        expect(fingerOutline(pose)).toMatch(/^M.*Z$/);
        pose.forEach((point, joint) => {
          expect(Number.isFinite(point.x + point.y + point.depth + point.radius)).toBe(true);
          expect(point.radius).toBeGreaterThan(0);
          expect(point.y).toBeCloseTo(reverse[joint]!.y, 8);
          if (joint > 0) {
            const outline = jointSegment(pose[joint - 1]!, point);
            expect(outline).not.toMatch(/NaN|Infinity/);
            expect(outline).toMatch(/^M.*Z$/);
          }
        });
      }
    }
    const a = { x: 0, y: 0, depth: 0, radius: 1 };
    expect(jointSegment(a, a)).toBe('');
  });
  it('describes the movement underway rather than the previous frame', () => {
    expect(movementCue('fingers', 0)).toBe('Resting hand');
    expect(movementCue('fingers', .5)).toBe('Release the thumb');
    expect(movementCue('fingers', 5.5)).toBe('Fold the little finger');
    expect(movementCue('fingers', 10)).toBe('Rest the thumb');
    expect(movementCue('thumbs', 4)).toContain('complete');
  });
  it('opens one finger at a time and closes in reverse order without invalid poses', () => {
    expect([0, 1, 2, 3, 4].map(i => fingerExtension(i, 0))).toEqual([0, 0, 0, 0, 0]);
    expect([0, 1, 2, 3, 4].map(i => fingerExtension(i, 2))).toEqual([1, 1, 0, 0, 0]);
    expect([0, 1, 2, 3, 4].map(i => fingerExtension(i, 6))).toEqual([1, 1, 1, 1, 0]);
    expect([0, 1, 2, 3, 4].map(i => fingerExtension(i, 10))).toEqual([0, 0, 0, 0, 0]);
    for (const value of [NaN, Infinity, -1, 50]) expect(boundedPhase(value, 'fingers')).toBeGreaterThanOrEqual(0);
    expect(fingerExtension(-1, 5)).toBe(0);
  });
});
