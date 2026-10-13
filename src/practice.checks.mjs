import { test } from 'node:test';
import assert from 'node:assert/strict';
import { advance, createSession, remainingSeconds, restoreSession, transition } from './practiceSession.ts';
import { decodeJournal, deleteEntry, journalKey, readJournal, saveEntry } from './privateJournal.ts';
const wall = '2026-10-10T12:00:00.000Z';
const ready = (duration = 30000) => ({ ...createSession('session-1', 'stillness', 3, duration), safetyAccepted: true });
const start = (s = ready(), now = 100) => transition(s, 'START', now, wall);
const entry = { id: 'session-1', exercise: 'Stillness', date: wall, notes: 'Private reflection', activeMs: 2000 };
function memory(initial) {
  const data = new Map(initial === undefined ? [] : [[journalKey, initial]]);
  return { getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value), removeItem: key => data.delete(key) };
}
test('safety acknowledgement is required; finishing before starting is denied', () => {
  const s = createSession('id', 'stillness', 3, 30000);
  assert.equal(transition(s, 'START', 0, wall).state, 'READY');
  assert.equal(transition(ready(), 'FINISH', 0, wall).state, 'READY');
});
test('delayed display ticks use elapsed monotonic time rather than tick count', () => {
  const s = advance(start(), 8100);
  assert.equal(s.activeMs, 8000); assert.equal(remainingSeconds(s), 22);
});
test('pause, background and reload never count inactive time', () => {
  let s = transition(start(), 'PAUSE', 2100, wall);
  assert.equal(advance(s, 999999).activeMs, 2000);
  s = transition(s, 'START', 1000000, wall);
  s = transition(s, 'INTERRUPT', 1003000, wall);
  const restored = restoreSession(JSON.stringify(s));
  assert.equal(restored.activeMs, 5000); assert.equal(restored.lastTick, null);
  assert.equal(restored.safetyAccepted, false);
  assert.equal(advance(restored, 9999999).activeMs, 5000);
  const runningRestored = restoreSession(JSON.stringify(start()));
  assert.equal(runningRestored.state, 'INTERRUPTED');
});
test('timer end is bounded and completion/save are idempotent', () => {
  let s = advance(start(), 1000000);
  assert.equal(s.activeMs, 30000); assert.equal(remainingSeconds(s), 0);
  assert.equal(s.state, 'REFLECTION'); assert.equal(s.endReason, 'timer');
  assert.deepEqual(advance(s, 9999999), s);
  s = transition(s, 'SAVE', 9999999, wall);
  assert.equal(s.state, 'SAVED'); assert.deepEqual(transition(s, 'SAVE', 9999999, wall), s);
});
test('untimed practice and early stop produce a nonpunitive record', () => {
  const s = transition(start(ready(null)), 'STOP', 5100, wall);
  assert.equal(s.state, 'REFLECTION'); assert.equal(s.endReason, 'early-stop');
  assert.equal(s.activeMs, 5000); assert.equal(remainingSeconds(s), null);
});
test('clock reversal and malformed drafts cannot produce negative or invented time', () => {
  let s = start(); s = advance(s, 20); assert.equal(s.activeMs, 0);
  s = advance(s, 1100); assert.equal(s.activeMs, 1000);
  assert.equal(restoreSession('not json'), null);
  assert.equal(restoreSession(JSON.stringify({ ...s, activeMs: -1 })), null);
  assert.equal(restoreSession(JSON.stringify({ ...s, notes: 12 })), null);
  for (let now = 1200; now < 100000; now += 73) {
    s = advance(s, now); assert.ok(s.activeMs >= 0 && s.activeMs <= 30000);
  }
});
test('legacy journals remain readable and session save retries create one record', () => {
  const store = memory(JSON.stringify([{ id: 'legacy', exercise: 'Pencil', date: '10/9/2026', notes: 'Previous entry' }]));
  assert.equal(readJournal(store).entries.length, 1);
  assert.equal(saveEntry(store, entry).entries.length, 2);
  assert.equal(saveEntry(store, entry).entries.length, 2);
  assert.equal(readJournal(store).entries[1].id, 'legacy');
});
test('corrupt journals are preserved without overwriting their raw contents', () => {
  for (const raw of ['broken', '{}', '[null]', '[{"id":"x","notes":123}]']) {
    const store = memory(raw); assert.equal(decodeJournal(raw).ok, false);
    assert.equal(saveEntry(store, entry).ok, false); assert.equal(store.getItem(journalKey), raw);
  }
});
test('quota and permission failures never report successful save or delete', () => {
  const store = memory('[]'); store.setItem = () => { throw new Error('quota'); };
  assert.equal(saveEntry(store, entry).ok, false); assert.equal(store.getItem(journalKey), '[]');
  assert.equal(deleteEntry(store, entry.id).ok, false);
  store.getItem = () => { throw new Error('denied'); };
  assert.equal(readJournal(store).ok, false);
});
test('deletion is scoped to one private entry and preserves the others', () => {
  const store = memory(); saveEntry(store, entry); saveEntry(store, { ...entry, id: 'session-2' });
  const result = deleteEntry(store, entry.id); assert.equal(result.ok, true);
  assert.deepEqual(result.entries.map(e => e.id), ['session-2']);
});
