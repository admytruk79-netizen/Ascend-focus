import { describe, expect, it } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ExerciseInstructions } from './ExerciseInstructions';
import { exercises } from './exercises';

describe('source presentation', () => {
  it('shows source language, precise pages and an explicit paraphrase label', () => {
    const exercise = exercises.find(e => e.id === 'water-glass')!;
    const html = renderToStaticMarkup(createElement(ExerciseInstructions, { exercise, historical: true }));
    expect(html).toContain('source-grounded paraphrase');
    expect(html).toContain('lang="ru"');
    expect(html).toContain('PDF p. 122');
    expect(html).toContain('printed p. 110');
    expect(html).toContain('not endorsed');
  });
  it('makes unsourced timer suggestions and modern safeguards visible', () => {
    const exercise = exercises.find(e => e.id === 'rapport')!;
    const html = renderToStaticMarkup(createElement(ExerciseInstructions, { exercise, historical: false }));
    expect(html).toContain('Modern guided adaptation');
    expect(html).toContain('Modern optional timer suggestion: 4 minutes');
    expect(html).toContain('not an original starting duration');
    expect(html).toContain('not scientifically established');
  });
  it('keeps chapter-wide eye-care and secrecy advice in historical view only', () => {
    const exercise = exercises.find(e => e.id === 'black-dot')!;
    const historical = renderToStaticMarkup(createElement(ExerciseInstructions, { exercise, historical: true }));
    const guided = renderToStaticMarkup(createElement(ExerciseInstructions, { exercise, historical: false }));
    expect(historical).toContain('Additional historical lesson advice');
    expect(historical).toContain('PDF p. 56');
    expect(historical).toContain('not app eye-care guidance');
    expect(guided).not.toContain('cold-water eye rinsing');
    expect(guided).not.toContain('Additional historical lesson advice');
    expect(guided).toContain('Blink naturally');
  });
});
