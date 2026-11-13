import test from 'node:test';
import assert from 'node:assert/strict';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { MeStore } from '../lib/store.js';

async function fixture(t) {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'me-store-test-'));
  t.after(() => fs.rm(dir, { recursive: true, force: true }));
  const filePath = path.join(dir, 'private', 'me.json');
  return { dir, filePath, store: new MeStore({ filePath }) };
}
const invalid = (p) => assert.rejects(p, { code: 'VALIDATION_ERROR' });

test('empty store has no seed data and reads do not create files', async t => {
  const { store, filePath } = await fixture(t);
  assert.deepEqual(await store.snapshot(), { version: 1, revision: 0, records: [], profiles: [] });
  assert.deepEqual(await store.search(), { revision: 0, total: 0, records: [] });
  assert.deepEqual(await store.get({ id: 'missing' }), { revision: 0, record: null });
  await assert.rejects(fs.stat(filePath), { code: 'ENOENT' });
});

test('CRUD records preserves occurrence/recording distinction and optimistic revisions', async t => {
  const { store, filePath } = await fixture(t);
  const created = await store.add({ content: 'test-only walk', occurredAt: '2024-02-29T23:59:59+08:00', category: 'movement', tags: ['outside'], source: 'chat-explicit', expectedRevision: 0 });
  assert.equal(created.revision, 1);
  assert.equal(created.record.occurredAt, '2024-02-29T23:59:59+08:00');
  assert.notEqual(created.record.recordedAt, created.record.occurredAt);
  const second = new MeStore({ filePath });
  assert.deepEqual((await second.get({ id: created.record.id })).record, created.record);
  await assert.rejects(second.update({ id: created.record.id, expectedRevision: 0, patch: { content: 'stale' } }), { code: 'REVISION_CONFLICT' });
  const updated = await second.update({ id: created.record.id, expectedRevision: 1, patch: { content: 'corrected' } });
  assert.equal(updated.record.recordedAt, created.record.recordedAt);
  assert.equal(updated.revision, 2);
  await invalid(store.remove({ id: created.record.id }));
  const removed = await store.remove({ id: created.record.id, expectedRevision: 2 });
  assert.equal(removed.revision, 3);
  assert.equal((await store.snapshot()).records.length, 0);
  await assert.rejects(store.remove({ id: created.record.id, expectedRevision: 3 }), { code: 'NOT_FOUND' });
  assert.equal((await store.snapshot()).revision, 3);
});

test('search applies inclusive timestamps, query, exact category, sensitive filter and pagination', async t => {
  const { store } = await fixture(t);
  for (let i = 0; i < 55; i++) await store.add({ content: `synthetic entry ${i}`, occurredAt: '2024-01-01T00:00:00Z', category: i % 2 ? 'odd' : 'even', tags: ['sample'] });
  await store.add({ content: 'private synthetic entry', sensitive: true });
  assert.equal((await store.search()).records.length, 50);
  assert.equal((await store.search()).total, 55);
  assert.equal((await store.search({ includeSensitive: true })).total, 56);
  assert.equal((await store.search({ query: 'SAMPLE', category: 'even', from: '2024-01-01T00:00:00Z', to: '2024-01-01T00:00:00Z' })).total, 28);
  assert.equal((await store.search({ offset: 50 })).records.length, 5);
  assert.equal((await store.search({ offset: 100 })).records.length, 0);
  assert.equal((await store.exportMarkdown()).split('\n## ').length - 1, 55);
  assert.equal((await store.exportMarkdown({ limit: 10 })).split('\n## ').length - 1, 10);
  assert.equal((await store.exportMarkdown({ offset: 50 })).split('\n## ').length - 1, 5);
  await invalid(store.exportMarkdown({ limit: 101 }));
  for (const input of [{ limit: 0 }, { limit: 101 }, { offset: -1 }, { offset: 0.5 }, { includeSensitive: 'yes' }, { query: 2 }, { category: [] }, { from: '2025-01-01T00:00:00Z', to: '2024-01-01T00:00:00Z' }, { unsupported: true }]) await invalid(store.search(input));
});

test('strict field and real calendar validation rejects invalid input without writes', async t => {
  const { store } = await fixture(t);
  for (const occurredAt of ['2023-02-29T00:00:00Z', '2024-04-31T00:00:00Z', '2024-00-01T00:00:00Z', '2024-01-01T24:00:00Z', '2024-01-01T00:00:60Z', '2024-01-01', '2024-01-01T00:00:00', '2024-01-01T00:00:00+14:01', null]) await invalid(store.add({ content: 'synthetic', occurredAt }));
  for (const patch of [{ content: '' }, { content: 'x'.repeat(20001) }, { sensitive: 1 }, { source: null }, { category: {} }, { tags: ['x', 'x'] }, { tags: Array(21).fill('tag') }, { tags: [2] }, { unknown: true }]) await invalid(store.add({ content: 'synthetic', ...patch }));
  assert.equal((await store.snapshot()).revision, 0);
  assert.throws(() => new MeStore({ filePath: 'x', extra: true }), { code: 'VALIDATION_ERROR' });
});

test('profiles require revision, preserve provenance timestamps, safe context defaults', async t => {
  const { store } = await fixture(t);
  await invalid(store.profileSave({ content: 'synthetic preference' }));
  const safe = await store.profileSave({ expectedRevision: 0, content: 'synthetic preference', source: 'manual' });
  const secret = await store.profileSave({ expectedRevision: 1, content: 'synthetic sensitive', sensitive: true });
  assert.equal(secret.profile.includeInContext, false);
  const hidden = await store.profileSave({ expectedRevision: 2, content: 'synthetic hidden', includeInContext: false });
  await store.profileSave({ expectedRevision: 3, content: 'synthetic old', status: 'outdated' });
  await store.profileSave({ expectedRevision: 4, content: 'synthetic unknown', status: 'unknown' });
  assert.deepEqual((await store.profileGet()).profiles.map(p => p.id), [safe.profile.id]);
  assert.equal((await store.profileGet({ includeSensitive: true })).profiles.length, 5);
  assert.deepEqual((await store.context()).profiles.map(p => p.id), [safe.profile.id]);
  assert.equal((await store.context({ includeSensitive: true })).profiles.length, 3);
  const change = await store.profileSave({ id: safe.profile.id, expectedRevision: 5, content: 'synthetic correction', sensitive: true });
  assert.equal(change.profile.includeInContext, false);
  assert.equal(change.profile.recordedAt, safe.profile.recordedAt);
  assert.ok(change.profile.confirmedAt);
  assert.equal((await store.profileRemove({ id: hidden.profile.id, expectedRevision: 6 })).revision, 7);
  await invalid(store.profileSave({ expectedRevision: 7, content: 'x', status: 'diagnosed' }));
});

test('context is bounded, safe, query-filtered and uses only included source IDs', async t => {
  const { store } = await fixture(t);
  await store.add({ content: 'safe synthetic walk' });
  await store.add({ content: 'secret synthetic walk', sensitive: true });
  const context = await store.context({ query: 'walk' });
  assert.equal(context.total, 1);
  assert.equal(context.records.length, 1);
  assert.deepEqual(context.sourceIds, context.records.map(r => r.id));
  assert.equal((await store.context({ includeSensitive: true })).records.length, 2);
  await store.add({ content: 'x'.repeat(20000) });
  const bounded = await store.context({ maxChars: 500 });
  assert.ok(JSON.stringify(bounded).length <= 500);
  assert.equal(bounded.truncated, true);
  assert.deepEqual(bounded.sourceIds, [...bounded.profiles, ...bounded.records].map(x => x.id));
  await invalid(store.context({ maxChars: 255 }));
  await invalid(store.context(null));
});

test('Markdown export contains occurrence, provenance and original text; backup is lossless', async t => {
  const { store, dir } = await fixture(t);
  const item = await store.add({ content: 'Synthetic original\nsecond line', category: 'test', tags: ['sample'], source: 'manual' });
  await store.profileSave({ expectedRevision: 1, content: 'Synthetic profile', sensitive: true });
  const markdown = await store.exportMarkdown({ query: 'original' });
  assert.ok(markdown.includes(item.record.id));
  assert.ok(markdown.includes('Synthetic original\nsecond line'));
  assert.ok(markdown.includes('Recorded:'));
  const backup = await store.exportBackup();
  const restored = new MeStore({ filePath: path.join(dir, 'restored.json') });
  const result = await restored.importBackup({ data: backup, expectedRevision: 0 });
  assert.deepEqual(result, { revision: 1, addedRecords: 1, addedProfiles: 1, skipped: 0 });
  assert.deepEqual((await restored.snapshot()).records, (await store.snapshot()).records);
  assert.deepEqual((await restored.snapshot()).profiles, (await store.snapshot()).profiles);
  assert.deepEqual(await restored.importBackup({ data: backup, expectedRevision: 1 }), { revision: 1, addedRecords: 0, addedProfiles: 0, skipped: 2 });
});

test('Markdown export excludes sensitive records unless explicitly requested', async t => {
  const { store } = await fixture(t);
  await store.add({ content: 'public synthetic export' });
  await store.add({ content: 'private synthetic export', sensitive: true });
  assert.ok((await store.exportMarkdown()).includes('public synthetic export'));
  assert.ok(!(await store.exportMarkdown()).includes('private synthetic export'));
  assert.ok((await store.exportMarkdown({ includeSensitive: true })).includes('private synthetic export'));
  assert.ok(!(await store.exportMarkdown({ includeSensitive: false })).includes('private synthetic export'));
  await invalid(store.exportMarkdown({ includeSensitive: 'yes' }));
});

test('conflicting imports reject atomically, duplicate IDs and prototype attacks fail validation', async t => {
  const { store } = await fixture(t);
  await store.add({ content: 'synthetic original' });
  const before = await store.exportBackup(); const value = JSON.parse(before);
  value.records.unshift({ ...value.records[0], id: 'new-before-conflict' });
  value.records[1].content = 'conflict';
  await assert.rejects(store.importBackup({ expectedRevision: 1, data: JSON.stringify(value) }), { code: 'IMPORT_CONFLICT' });
  assert.equal(await store.exportBackup(), before);
  for (const data of ['{', '{"version":1,"revision":0,"records":[],"profiles":[],"__proto__":{"polluted":true}}', JSON.stringify({ ...JSON.parse(before), records: [JSON.parse(before).records[0], JSON.parse(before).records[0]] }), JSON.stringify({ version: 2, revision: 0, records: [], profiles: [] }), ' '.repeat(8 * 1024 * 1024 + 1)]) await invalid(store.importBackup({ expectedRevision: 1, data }));
  assert.equal({}.polluted, undefined);
  assert.equal(await store.exportBackup(), before);
});

test('corrupt store fails closed and private atomic files leave no temporary files', async t => {
  const { store, filePath } = await fixture(t);
  await store.add({ content: 'synthetic' });
  if (process.platform !== 'win32') {
    assert.equal((await fs.stat(filePath)).mode & 0o777, 0o600);
    assert.equal((await fs.stat(path.dirname(filePath))).mode & 0o777, 0o700);
  }
  assert.deepEqual(await fs.readdir(path.dirname(filePath)), ['me.json']);
  await fs.writeFile(filePath, '{broken');
  await assert.rejects(store.snapshot(), { code: 'CORRUPT_STORE' });
  await assert.rejects(store.add({ content: 'must not replace corrupt data' }), { code: 'CORRUPT_STORE' });
  assert.equal(await fs.readFile(filePath, 'utf8'), '{broken');
  assert.deepEqual(await fs.readdir(path.dirname(filePath)), ['me.json']);
});

test('independent instances serialize concurrent writes and exactly one same-revision update wins', async t => {
  const { store, filePath } = await fixture(t);
  await Promise.all(Array.from({ length: 20 }, (_, i) => new MeStore({ filePath }).add({ content: `synthetic ${i}` })));
  const snapshot = await store.snapshot(); assert.equal(snapshot.revision, 20); assert.equal(snapshot.records.length, 20);
  const results = await Promise.allSettled([store, new MeStore({ filePath })].map((s, i) => s.update({ id: snapshot.records[0].id, expectedRevision: 20, patch: { content: `winner ${i}` } })));
  assert.equal(results.filter(x => x.status === 'fulfilled').length, 1);
  assert.equal(results.find(x => x.status === 'rejected').reason.code, 'REVISION_CONFLICT');
});

test('independent Node processes serialize writes without lost updates', async t => {
  const { store, filePath } = await fixture(t);
  const url = new URL('../lib/store.js', import.meta.url).href;
  const run = i => new Promise((resolve, reject) => {
    const child = spawn(process.execPath, ['--input-type=module', '-e', `import {MeStore} from ${JSON.stringify(url)}; const s = new MeStore({filePath:${JSON.stringify(filePath)}}); for(let j=0;j<4;j++) await s.add({content:'synthetic process ${i} '+j});`], { stdio: ['ignore', 'pipe', 'pipe'] });
    let stderr = ''; child.stderr.on('data', x => { stderr += x; });
    child.on('error', reject); child.on('exit', code => code === 0 ? resolve() : reject(new Error(`child exited ${code}: ${stderr}`)));
  });
  await Promise.all([run(1), run(2), run(3)]);
  const state = await store.snapshot(); assert.equal(state.revision, 12); assert.equal(state.records.length, 12);
});
