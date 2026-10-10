import { test } from 'node:test';
import assert from 'node:assert/strict';
import { exercises, curriculumStatus, timerLabel } from './exercises.ts';

test('every runnable historical practice has checked page-specific source evidence', () => {
  assert.equal(new Set(exercises.map(e => e.id)).size, exercises.length);
  for (const e of exercises) {
    assert.equal(e.source.fidelity, 'verified-excerpt');
    assert.equal(e.source.checkedAgainst, 'primary-scan');
    assert.ok(e.source.ledgerIds.length && e.originalProtocol.length && e.modernAdaptations.length);
    assert.ok(e.source.originalRussian.length);
    for (const quote of e.source.originalRussian) assert.ok(e.source.scanPages.includes(quote.pdfPage));
    assert.ok(e.accessibleAlternatives.length && e.objectives.length && e.prerequisites.length);
    assert.equal(e.reflection.privateByDefault, true);
  }
});
test('corrects water-glass attribution without borrowing arm exercise pages', () => {
  const water = exercises.find(e => e.id === 'water-glass');
  assert.equal(water.pdfPages, '122');
  assert.deepEqual(water.source.scanPages, [122]);
  assert.equal(water.sourceDuration.initialMinutes, 1);
  assert.deepEqual(water.sourceDuration.progressionMinutes, [5]);
  const arm = exercises.find(e => e.id === 'arm-observation');
  assert.equal(arm.pdfPages, '121–122');
});
test('distinguishes historical durations from app choices and cross-references', () => {
  for (const id of ['black-dot', 'mirror-gaze', 'rapport', 'finger-unfolding', 'thumb-circles', 'pointing-finger']) {
    assert.match(timerLabel(exercises.find(e => e.id === id)), /Modern optional timer suggestion/);
  }
  for (const e of exercises.filter(e => e.timerProvenance === 'source-initial')) {
    assert.equal(e.sourceDuration.kind, 'verified');
    assert.equal(e.minutes, e.sourceDuration.initialMinutes);
  }
  assert.equal(exercises.find(e => e.id === 'black-dot').sourceDuration.initialMinutes, 1);
  assert.equal(exercises.find(e => e.id === 'mirror-gaze').sourceDuration.kind, 'cross-reference');
  assert.equal(exercises.find(e => e.id === 'rapport').sourceDuration.kind, 'not-specified');
});
test('preserves source progression and pencil continuation while remaining partial', () => {
  assert.deepEqual(exercises.find(e => e.id === 'stillness').sourceDuration.progressionMinutes, [10, 15]);
  assert.equal(exercises.find(e => e.id === 'pencil').pdfPages, '125–126');
  assert.equal(curriculumStatus.complete, false);
  assert.equal(curriculumStatus.totalScanPages, 138);
});
test('does not turn source influence claims into stranger-targeting guided actions', () => {
  const rapport = exercises.find(e => e.id === 'rapport');
  assert.equal(rapport.evidence, 'historical-unverified-claim');
  assert.match(rapport.notice, /not scientifically established/);
  assert.match(rapport.modernAdaptations.join(' '), /Consent/);
  assert.match(rapport.guided.join(' '), /without attempting to control/);
  assert.match(rapport.history, /not established communication/);
});
