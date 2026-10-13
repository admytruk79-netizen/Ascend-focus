import { describe, it, expect } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MovementDemonstration } from './MovementDemonstration';
import { boundedPhase, fingerExtension } from './movementDemo';

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
  it('opens one finger at a time and closes in reverse order without invalid poses', () => {
    expect([0, 1, 2, 3, 4].map(i => fingerExtension(i, 0))).toEqual([0, 0, 0, 0, 0]);
    expect([0, 1, 2, 3, 4].map(i => fingerExtension(i, 2))).toEqual([1, 1, 0, 0, 0]);
    expect([0, 1, 2, 3, 4].map(i => fingerExtension(i, 6))).toEqual([1, 1, 1, 1, 0]);
    expect([0, 1, 2, 3, 4].map(i => fingerExtension(i, 10))).toEqual([0, 0, 0, 0, 0]);
    for (const value of [NaN, Infinity, -1, 50]) expect(boundedPhase(value, 'fingers')).toBeGreaterThanOrEqual(0);
    expect(fingerExtension(-1, 5)).toBe(0);
  });
});
