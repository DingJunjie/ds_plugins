import test from 'node:test';
import assert from 'node:assert/strict';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { TodoStore } from '../lib/store.js';

async function fixture(t) {
  const base = await fs.realpath(os.tmpdir());
  const dir = await fs.mkdtemp(path.join(base, 'harness-todo-store-test-'));
  t.after(async () => {
    // Verify the resolved directory is our exact mkdtemp child before deletion.
    const resolved = await fs.realpath(dir);
    assert.equal(path.dirname(resolved), base);
    assert.match(path.basename(resolved), /^harness-todo-store-test-[A-Za-z0-9]+$/);
    assert.equal(resolved, path.resolve(dir));
    await fs.rm(resolved, { recursive: true });
  });
  const filePath = path.join(dir, 'nested', 'store.json');
  return { store: new TodoStore({ filePath }), filePath };
}
const localMetadata = () => {
  const d = new Date(), pad = n => String(n).padStart(2, '0');
  return {serverToday: `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone};
};
const isCode = code => e => e.code === code;
const legacy = (id, text = 'legacy') => ({ id, text, done: false, prio: 'mid', due: '', createdAt: 123, completedAt: null });

test('empty store has no seeds; atomically persists and reloads', async t => {
  const { store, filePath } = await fixture(t);
  assert.deepEqual(await store.snapshot(), { revision: 0, tasks: [], ...localMetadata() });
  const added = await store.add({ text: '  Plan trip  ', prio: 'high', due: '2028-02-29', expectedRevision: 0 });
  assert.equal(added.revision, 1); assert.equal(added.task.text, 'Plan trip');
  assert.equal(added.task.done, false); assert.equal(added.task.completedAt, null);
  assert.deepEqual(await new TodoStore({ filePath }).snapshot(), { revision: 1, tasks: [added.task], ...localMetadata() });
  assert.deepEqual(await fs.readdir(path.dirname(filePath)), ['store.json']);
  await store.remove({ ids: [added.task.id], expectedRevision: 1 });
  assert.deepEqual(await new TodoStore({ filePath }).snapshot(), { revision: 2, tasks: [], ...localMetadata() });
});

test('concurrent instances serialize writes and reject stale page revisions', async t => {
  const { store, filePath } = await fixture(t);
  const other = new TodoStore({ filePath });
  const results = await Promise.allSettled([store.add({ text: 'one', expectedRevision: 0 }), other.add({ text: 'two', expectedRevision: 0 })]);
  assert.equal(results.filter(r => r.status === 'fulfilled').length, 1);
  const error = results.find(r => r.status === 'rejected').reason;
  assert.equal(error.code, 'REVISION_CONFLICT'); assert.equal(error.currentRevision, 1);
  await assert.rejects(store.add({ text: 'no revision' }), isCode('VALIDATION'));
  assert.equal((await store.snapshot()).tasks.length, 1);
  // A rejected operation cannot poison subsequent writes.
  await other.add({ text: 'retry', expectedRevision: 1 });
  assert.equal((await store.snapshot()).revision, 2);
});

test('patch, remove and reorder by ids only; no wholesale replacement', async t => {
  const { store } = await fixture(t);
  const a = await store.add({ text: 'a', expectedRevision: 0 });
  const b = await store.add({ text: 'b', expectedRevision: 1 });
  let result = await store.update({ id: a.task.id, patch: { done: true, prio: 'low', due: '2026-12-01', text: 'edited' }, expectedRevision: 2 });
  const edited = result.tasks[0]; assert.equal(edited.done, true); assert.ok(edited.completedAt > 0);
  result = await store.update({ id: a.task.id, patch: { done: false }, expectedRevision: 3 });
  assert.equal(result.tasks[0].completedAt, null);
  result = await store.reorder({ ids: [b.task.id, a.task.id], expectedRevision: 4 });
  assert.deepEqual(result.tasks.map(x => x.id), [b.task.id, a.task.id]);
  await assert.rejects(store.reorder({ ids: [a.task.id], expectedRevision: 5 }), isCode('VALIDATION'));
  await assert.rejects(store.remove({ ids: ['missing'], expectedRevision: 5 }), isCode('NOT_FOUND'));
  await assert.rejects(store.update({ id: a.task.id, patch: { id: 'changed' }, expectedRevision: 5 }), isCode('VALIDATION'));
  await store.remove({ ids: [a.task.id], expectedRevision: 5 });
  assert.deepEqual((await store.snapshot()).tasks.map(x => x.id), [b.task.id]);
});

test('proposals stay separate, immutable, session owned; commit is idempotent even after task deletion', async t => {
  const { store, filePath } = await fixture(t);
  const { proposal } = await store.propose({ sessionId: 'session-a', text: 'Exact details', prio: 'high', due: '2026-12-31' });
  assert.equal((await store.list()).tasks.length, 0);
  assert.equal(proposal.status, 'pending');
  assert.equal((await store.proposals({ sessionId: 'session-b' })).proposals.length, 0);
  await assert.rejects(store.commit({ proposalId: proposal.id, sessionId: 'session-b' }), isCode('SESSION_MISMATCH'));
  await assert.rejects(store.commit({ proposalId: 'wrong', sessionId: 'session-a' }), isCode('NOT_FOUND'));
  await assert.rejects(store.commit({ proposalId: proposal.id, sessionId: 'session-a', text: 'altered' }), isCode('VALIDATION'));
  proposal.text = 'external mutation';
  const results = await Promise.all([store.commit({ proposalId: proposal.id, sessionId: 'session-a' }), store.commit({ proposalId: proposal.id, sessionId: 'session-a' })]);
  assert.deepEqual(results.map(x => x.alreadyCommitted), [false, true]);
  assert.equal(results[0].task.text, 'Exact details'); assert.equal(results[0].task.prio, 'high'); assert.equal(results[0].task.due, '2026-12-31');
  assert.equal(results[0].revision, results[1].revision);
  assert.equal((await store.snapshot()).tasks.length, 1);
  await store.remove({ ids: [results[0].task.id], expectedRevision: results[0].revision });
  const retry = await new TodoStore({ filePath }).commit({ proposalId: proposal.id, sessionId: 'session-a' });
  assert.equal(retry.alreadyCommitted, true); assert.equal(retry.tasks.length, 0); assert.equal(retry.task.id, results[0].task.id);
  assert.equal((await store.proposals({ sessionId: 'session-a' })).proposals[0].status, 'committed');
});

test('legacy import merges once per source and maps collisions per client without resurrecting removals', async t => {
  const { store, filePath } = await fixture(t);
  const existing = await store.add({ text: 'existing', expectedRevision: 0 });
  const original = legacy(existing.task.id);
  let result = await store.importLegacy({ clientId: 'browser-a', fingerprint: 'version-1', tasks: [original], expectedRevision: 1 });
  assert.equal(result.imported, 1); assert.equal(result.tasks.length, 2); assert.notEqual(result.tasks[1].id, original.id);
  const mappedId = result.tasks[1].id;
  result = await store.importLegacy({ clientId: 'browser-a', fingerprint: 'version-1', tasks: [original], expectedRevision: 2 });
  assert.equal(result.alreadyImported, true); assert.equal(result.revision, 2);
  result = await store.importLegacy({ clientId: 'browser-b', fingerprint: 'version-1', tasks: [original], expectedRevision: 2 });
  assert.equal(result.imported, 1); assert.equal(result.tasks.length, 3); assert.notEqual(result.tasks[2].id, mappedId);
  await store.remove({ ids: [mappedId], expectedRevision: 3 });
  result = await new TodoStore({ filePath }).importLegacy({ clientId: 'browser-a', fingerprint: 'version-2', tasks: [original, legacy('new-id')], expectedRevision: 4 });
  assert.equal(result.imported, 1); assert.equal(result.tasks.length, 3);
  assert.ok(result.tasks.some(x => x.id === existing.task.id));
  assert.ok(!result.tasks.some(x => x.id === mappedId));
  assert.equal(result.tasks.find(x => x.text === 'existing').text, 'existing');
});

test('strict validation and failure do not alter persisted revision or data', async t => {
  const { store } = await fixture(t);
  for (const input of [
    { text: '' }, { text: 'x'.repeat(201) }, { text: 2 }, { text: 'x\ny' },
    { text: 'x', prio: 'urgent' }, { text: 'x', due: '2026-02-29' }, { text: 'x', due: '2026-13-01' },
    { text: 'x', due: '0000-01-01' }, { text: 'x', tasks: [] }, { text: 'x', due: null }, { text: 'x', prio: null }
  ]) await assert.rejects(store.add({ ...input, expectedRevision: 0 }), isCode('VALIDATION'));
  await assert.rejects(store.propose({ sessionId: '', text: 'x' }), isCode('VALIDATION'));
  await assert.rejects(store.importLegacy({ clientId: 'a', fingerprint: 'f', tasks: [legacy('x'), legacy('x')], expectedRevision: 0 }), isCode('VALIDATION'));
  await assert.rejects(store.importLegacy({ clientId: 'a', fingerprint: 'f', tasks: [{ ...legacy('x'), done: true }], expectedRevision: 0 }), isCode('VALIDATION'));
  assert.deepEqual(await store.snapshot(), { revision: 0, tasks: [], ...localMetadata() });
  const added = await store.add({ text: 'valid', expectedRevision: 0 });
  await assert.rejects(store.update({ id: added.task.id, patch: { text: 'partially changed', due: 'bad' }, expectedRevision: 1 }), isCode('VALIDATION'));
  assert.equal((await store.snapshot()).tasks[0].text, 'valid');
});

test('optional proposal source message anchor persists, is cloned and cannot be overridden at commit', async t => {
  const { store, filePath } = await fixture(t);
  for (const sourceMessageId of ['', null, 3, 'x'.repeat(201), 'bad\nanchor']) {
    await assert.rejects(store.propose({ sessionId: 's', text: 'x', sourceMessageId }), isCode('VALIDATION'));
  }
  const { proposal } = await store.propose({ sessionId: 's', text: 'anchored', sourceMessageId: 'message-123' });
  proposal.sourceMessageId = 'external-mutation';
  const reopened = new TodoStore({ filePath });
  const saved = (await reopened.proposals({ sessionId: 's' })).proposals[0];
  assert.equal(saved.sourceMessageId, 'message-123');
  await assert.rejects(reopened.commit({ proposalId: saved.id, sessionId: 's', sourceMessageId: 'override' }), isCode('VALIDATION'));
  await reopened.commit({ proposalId: saved.id, sessionId: 's' });
  assert.equal((await reopened.proposals({ sessionId: 's' })).proposals[0].sourceMessageId, 'message-123');
  const unanchored = await reopened.propose({ sessionId: 's', text: 'optional anchor omitted' });
  assert.equal(Object.hasOwn(unanchored.proposal, 'sourceMessageId'), false);
});

test('snapshot mutations cannot mutate store, corrupted JSON is not overwritten', async t => {
  const { store, filePath } = await fixture(t);
  await store.add({ text: 'kept', expectedRevision: 0 });
  const snap = await store.snapshot(); snap.tasks[0].text = 'oops'; snap.tasks.push(legacy('fake'));
  assert.equal((await store.snapshot()).tasks.length, 1); assert.equal((await store.snapshot()).tasks[0].text, 'kept');
  await fs.writeFile(filePath, '{broken');
  await assert.rejects(store.snapshot(), SyntaxError);
  await assert.rejects(store.add({ text: 'never overwrite corrupt', expectedRevision: 0 }), SyntaxError);
  assert.equal(await fs.readFile(filePath, 'utf8'), '{broken');
});
