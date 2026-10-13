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
  it('keeps aligned draft source text and page fragments in the historical view', () => {
    const exercise = exercises.find(e => e.id === 'pencil-sharpening')!;
    const historical = renderToStaticMarkup(createElement(ExerciseInstructions, { exercise, historical: true }));
    const guided = renderToStaticMarkup(createElement(ExerciseInstructions, { exercise, historical: false }));
    expect(historical).toContain('Russian transcription and English translation');
    expect(historical).toContain('independent proofreading is pending');
    expect(historical).toContain('Source paragraph 115-3');
    expect(historical).toContain('Source paragraph 116-1');
    expect(historical).toContain('continuation from 115');
    expect(historical).toContain('The time is at your disposal');
    expect(historical).toContain('lang="en"');
    expect(guided).not.toContain('Source paragraph');
    expect(guided).not.toContain('radical remedy');
  });

  it('attributes final-page insight promises and keeps them out of guided instructions', () => {
    const exercise = exercises.find(e => e.id === 'reading-reflection')!;
    const historical = renderToStaticMarkup(createElement(ExerciseInstructions, { exercise, historical: true }));
    const guided = renderToStaticMarkup(createElement(ExerciseInstructions, { exercise, historical: false }));
    expect(historical).toContain('Source paragraph 132-2');
    expect(historical).toContain('new light will spread over you');
    expect(historical).toContain('Historical claims are not endorsed');
    expect(guided).not.toContain('new light will spread over you');
    expect(guided).toContain('No new insight is required');
  });

  it('shares page122 with water-glass while excluding historical suppression from guided view', () => {
    const exercise = exercises.find(e => e.id === 'water-glass')!;
    const historical = renderToStaticMarkup(createElement(ExerciseInstructions, { exercise, historical: true }));
    const guided = renderToStaticMarkup(createElement(ExerciseInstructions, { exercise, historical: false }));
    expect(historical).toContain('Source paragraph 122-2');
    expect(historical).toContain('Source paragraph 122-3');
    expect(historical).toContain('Do not blink your eyes');
    expect(guided).not.toContain('Do not blink your eyes');
    expect(guided).not.toContain('Source paragraph');
    expect(guided).toContain('Support your arm');
  });

});
