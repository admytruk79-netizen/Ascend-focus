import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { exercises, curriculumStatus, historicalLessonNotes, timerLabel } from './exercises.ts';

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

test('page 54 gaze practices preserve fatigue stops without invented source timers', () => {
  for (const id of ['fixed-mark-head-motion', 'wall-point-shifting']) {
    const e = exercises.find(e => e.id === id);
    assert.deepEqual(e.source.scanPages, [54]);
    assert.deepEqual(e.source.printedPages, [42]);
    assert.equal(e.sourceDuration.kind, 'not-specified');
    assert.equal(e.timerProvenance, 'modern-choice');
    assert.match(e.notice, /No eyesight/);
  }
  assert.match(exercises.find(e => e.id === 'wall-point-shifting').originalProtocol.join(' '), /Stop immediately/);
  assert.match(exercises.find(e => e.id === 'fixed-mark-head-motion').modernAdaptations.join(' '), /replace historical head rotation/);
});

test('Lesson XII is one six-stage protocol with source breathing separated from guidance', () => {
 const e = exercises.find(e => e.id === 'thought-absorption');
 assert.deepEqual(e.source.scanPages, [107, 108, 109]);
 assert.equal(e.originalProtocol.length, 6); assert.equal(e.guided.length, 6);
 assert.equal(e.sourceDuration.kind, 'not-specified'); assert.equal(e.timerProvenance, 'modern-choice');
 assert.match(e.originalProtocol.join(' '), /pause before exhaling/);
 assert.match(e.guided.join(' '), /without deep-breathing targets or breath holds/);
 assert.match(e.notice, /not treatment/);
});

test('Lesson VII chapter advice remains historical and repetitions retain their approximation', () => {
 const dot = exercises.find(e => e.id === 'black-dot');
 assert.match(dot.originalProtocol.join(' '), /repeat about four times/);
 assert.match(dot.sourceDuration.details, /approximate/);
 const notes = historicalLessonNotes.VII;
 assert.deepEqual(notes.pdfPages, [55, 56]);
 assert.equal(notes.originalRussian[0].pdfPage, 56);
 assert.match(notes.paraphrases.join(' '), /cold-water/);
 assert.match(notes.notice, /Historical documentation only/);
 for (const e of exercises.filter(e => e.lesson === 'VII')) assert.doesNotMatch(e.guided.join(' '), /cold.water|keep.*secret|without blinking/i);
 assert.match(dot.guided.join(' '), /Blink naturally/);
});

test('Lesson VIII contemplation retains qualitative timing and separates spiritual belief from guidance', () => {
 const e = exercises.find(e => e.id === 'i-am-contemplation');
 assert.deepEqual(e.source.scanPages, [59]); assert.deepEqual(e.source.printedPages, [47]);
 assert.equal(e.sourceDuration.kind, 'qualitative'); assert.match(e.sourceDuration.details, /a few minutes/);
 assert.equal(e.timerProvenance, 'modern-choice'); assert.match(timerLabel(e), /not an original/);
 assert.match(e.originalProtocol.join(' '), /true self standing above mind and body/);
 assert.match(e.history, /distinct from Lesson X/);
 assert.match(e.modernAdaptations.join(' '), /replace a required immortal higher-self belief/);
 assert.match(e.guided.join(' '), /skip the phrase/); assert.match(e.notice, /not scientifically established/);
 assert.equal(e.reflection.privateByDefault, true);
});

test('Lesson X distinguishes imagery development from evidence of external rapport', () => {
 const e = exercises.find(e => e.id === 'rapport');
 assert.match(e.originalProtocol.join(' '), /vague figure/);
 assert.match(e.originalProtocol.join(' '), /shadowy ring/);
 assert.match(e.originalProtocol.join(' '), /tube is not essential/);
 assert.equal(e.sourceDuration.kind, 'not-specified');
 assert.equal(e.timerProvenance, 'modern-choice');
 assert.match(e.guided.join(' '), /without assuming anyone else received it/);
 assert.doesNotMatch(e.guided.join(' '), /shadowy ring|carrying out.*wishes/);
});

test('chapter extraction keeps calendar periods and method lists separate from runnable doses', () => {
 const read = file => JSON.parse(readFileSync(new URL(`../references/reading/${file}`, import.meta.url), 'utf8'));
 const xi = read('INSTRUCTIONS-086-095.json');
 const xii = read('INSTRUCTIONS-096-110.json');
 for (const chapter of [xi, xii]) {
  assert.equal(chapter.sourceSha256, curriculumStatus.sourceSha256);
  assert.equal(chapter.complete, false);
  assert.equal(chapter.newRunnableModules, 0);
  assert.deepEqual(chapter.scope.pdfPages, chapter.scope.pageImagesChecked);
  assert.equal(chapter.lessonSequentialReading.fullTranscriptionComplete, false);
  for (const r of chapter.records) {
   assert.equal(r.rawRecordExecutable, false);
   assert.ok(r.pdfPages.every(p => chapter.scope.pdfPages.includes(p)));
   assert.deepEqual(r.printedPages, r.pdfPages.map(p => p - 12));
   if (r.scanCheckedQuotePage) assert.ok(r.pdfPages.includes(r.scanCheckedQuotePage));
  }
 }
 const month = xi.records.find(r => r.id === 'XI-one-month-thought-practice');
 assert.equal(month.duration.minimumCalendarMonths, 1);
 assert.equal(month.duration.dailySessionSeconds, null);
 assert.equal(month.duration.fixedRepetitions, null);
 assert.equal(xii.generalHistoricalMethods, 4);
 const protocol = xii.records.find(r => r.existingCatalogId === 'thought-absorption');
 assert.equal(protocol.stageCount, 6);
 assert.equal(exercises.find(e => e.id === protocol.existingCatalogId).originalProtocol.length, protocol.stageCount);
 assert.equal(protocol.breathRetention.historicalOnly, true);
 assert.equal(protocol.duration.sessionSeconds, null);
 assert.equal(xii.nextSequentialPage, 111);
});
