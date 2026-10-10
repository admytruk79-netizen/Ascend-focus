import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateCircle, readCircleDraft, offlineCommunity } from './community.ts';
const valid = { name: 'Quiet practice', description: 'A voluntary circle for daily observation practice.', visibility: 'private', rulesAccepted: true };
test('requires consent and bounds name and description', () => {
  assert.equal(validateCircle(valid), null);
  for (const draft of [{ ...valid, rulesAccepted: false }, { ...valid, name: '  ' }, { ...valid, name: 'x'.repeat(81) }, { ...valid, description: 'x'.repeat(1001) }, { ...valid, visibility: 'public' }]) assert.ok(validateCircle(draft));
});
test('rejects corrupted and malformed storage without trusting a cast', () => {
  for (const raw of [null, '{', 'null', '[]', '{"name":1}', JSON.stringify({ ...valid, visibility: 'public' })]) assert.equal(readCircleDraft(raw), null);
  assert.deepEqual(readCircleDraft(JSON.stringify(valid)), valid);
});
test('offline adapter never reports a published circle', async () => {
  assert.equal(offlineCommunity.status, 'offline');
  assert.deepEqual(await offlineCommunity.listCircles(), []);
  await assert.rejects(offlineCommunity.createCircle(valid), /not been published/);
});
