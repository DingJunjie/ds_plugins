import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { MeStore } from '../lib/store.js';
import { NutstoreBackups, CLOUD_NOTE } from '../lib/nutstore.js';
import { MeRemote } from '../lib/index.js';

async function fixture(t) {
  const directory = await mkdtemp(path.join(tmpdir(), 'me-nutstore-test-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  return { directory, backups: new NutstoreBackups({ directory: path.join(directory, 'backups') }) };
}

test('manual backup creates unique private JSON files and lossless restore data', async t => {
  const { directory, backups } = await fixture(t);
  const store = new MeStore({ filePath: path.join(directory, 'working.json') });
  await store.add({ content: 'temporary test', expectedRevision: 0 });
  const data = await store.exportBackup();
  const first = await backups.backup(data);
  const second = await backups.backup(data);
  assert.notEqual(first.id, second.id);
  assert.ok(first.filePath.startsWith(directory));
  assert.equal((await stat(first.filePath)).mode & 0o777, 0o600);
  assert.equal(first.note, CLOUD_NOTE);
  assert.match(first.note, /上传状态/);
  const list = await backups.list();
  assert.equal(list.backups.length, 2);
  assert.equal(list.backups[0].records, 1);
  const read = await backups.read({ id: first.id });
  assert.equal(read.data, data);
  const restored = new MeStore({ filePath: path.join(directory, 'restored.json') });
  await restored.importBackup({ data: read.data, expectedRevision: 0 });
  assert.equal((await restored.snapshot()).records[0].content, 'temporary test');
});

test('backup list reports damaged files and read rejects traversal and invalid data', async t => {
  const { backups } = await fixture(t);
  await backups.backup(JSON.stringify({ version: 1, revision: 0, records: [], profiles: [] }));
  await writeFile(path.join(backups.directory, 'me-damaged.json'), '{broken');
  const list = await backups.list();
  assert.ok(list.backups.find(x => x.id === 'me-damaged.json')?.error);
  await assert.rejects(backups.read({ id: '../working.json' }), { code: 'BACKUP_INVALID' });
  await assert.rejects(backups.read({ id: 'me-damaged.json' }), { code: 'BACKUP_INVALID' });
  await assert.rejects(backups.backup('{not-json'), { code: 'BACKUP_INVALID' });
});

test('remote owner explicitly triggers backup/list/read, never automatically', async t => {
  const { backups } = await fixture(t);
  const store = { exportBackup: async () => JSON.stringify({ version: 1, revision: 4, records: [], profiles: [] }) };
  const remote = { ctx: { invocation: { peer: { principal: { kind: 'owner' } } } }, store, backups };
  const result = await MeRemote.prototype.request.call(remote, { op: 'nutstoreBackup' });
  assert.equal(result.ok, true); assert.equal(result.value.revision, 4);
  const list = await MeRemote.prototype.request.call(remote, { op: 'nutstoreList', limit: 10 });
  assert.equal(list.value.backups.length, 1);
  const read = await MeRemote.prototype.request.call(remote, { op: 'nutstoreRead', id: result.value.id });
  assert.equal(read.ok, true);
  assert.equal((await MeRemote.prototype.request.call(remote, { op: 'nutstoreRead', id: result.value.id, extra: true })).ok, false);
});
