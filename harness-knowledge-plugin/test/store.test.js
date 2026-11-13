import test from 'node:test';
import assert from 'node:assert/strict';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { KnowledgeStore } from '../lib/store.js';

async function fixture(t) {
  const base = await fs.realpath(os.tmpdir());
  const dir = await fs.mkdtemp(path.join(base, 'harness-knowledge-store-test-'));
  t.after(async () => {
    const resolved = await fs.realpath(dir);
    assert.equal(path.dirname(resolved), base);
    assert.match(path.basename(resolved), /^harness-knowledge-store-test-[A-Za-z0-9]+$/);
    await fs.rm(resolved, { recursive: true });
  });
  const filePath = path.join(dir, 'nested', 'knowledge.json');
  return { store: new KnowledgeStore({ filePath }), filePath };
}
const localMetadata = () => {
  const d = new Date(), pad = n => String(n).padStart(2, '0');
  return { serverToday: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone };
};
const isCode = code => e => e.code === code;
const fields = (over = {}) => ({ title: '比特币', domain: '金融', tags: ['货币'], summary: '去中心化的数字资产', axioms: ['人是自利的'], elements: ['稀缺性'], conclusions: ['信任最小化'], related: [], ...over });

test('empty store persists and reloads; add returns entry and bumps revision', async t => {
  const { store, filePath } = await fixture(t);
  assert.deepEqual(await store.snapshot(), { revision: 0, entries: [], ...localMetadata() });
  const r = await store.add({ ...fields(), expectedRevision: 0 });
  assert.equal(r.revision, 1); assert.equal(r.entry.title, '比特币');
  assert.deepEqual(r.entry.perspectives, []);
  const reopened = new KnowledgeStore({ filePath });
  assert.equal((await reopened.snapshot()).entries.length, 1);
  assert.equal((await reopened.snapshot()).entries[0].id, r.entry.id);
});

test('concurrent writers serialize; stale revision rejects without poisoning', async t => {
  const { store, filePath } = await fixture(t);
  const other = new KnowledgeStore({ filePath });
  const results = await Promise.allSettled([store.add({ ...fields(), expectedRevision: 0 }), other.add({ ...fields(), expectedRevision: 0 })]);
  assert.equal(results.filter(r => r.status === 'fulfilled').length, 1);
  assert.equal(results.find(r => r.status === 'rejected').reason.code, 'REVISION_CONFLICT');
  assert.equal((await store.snapshot()).entries.length, 1);
  await other.add({ ...fields({ title: '第二性' }), expectedRevision: 1 });
  assert.equal((await store.snapshot()).revision, 2);
});

test('update patches core fields and stamps updatedAt', async t => {
  const { store } = await fixture(t);
  const { entry } = await store.add({ ...fields(), expectedRevision: 0 });
  const r = await store.update({ id: entry.id, expectedRevision: 1, patch: { title: '比特币（修正）', axioms: ['稀缺', '共识'], conclusions: [] } });
  assert.equal(r.entry.title, '比特币（修正）');
  assert.deepEqual(r.entry.axioms, ['稀缺', '共识']);
  assert.deepEqual(r.entry.conclusions, []);
  assert.equal(r.entry.domain, '金融');
  assert.ok(r.entry.updatedAt >= r.entry.createdAt);
});

test('addPerspective appends without overwriting and keeps source', async t => {
  const { store } = await fixture(t);
  const { entry } = await store.add({ ...fields(), expectedRevision: 0 });
  const r1 = await store.addPerspective({ id: entry.id, text: '用户角度：价值来自共识', source: 'user', expectedRevision: 1 });
  assert.equal(r1.entry.perspectives.length, 1);
  const r2 = await store.addPerspective({ id: entry.id, text: 'AI 角度：信任是基础设施', expectedRevision: 2 });
  assert.equal(r2.entry.perspectives.length, 2);
  assert.equal(r2.entry.perspectives[0].source, 'user');
  assert.equal(r2.entry.perspectives[1].source, 'ai');
  assert.equal(r2.entry.axioms.length, 1);
});

test('search filters by text and domain; domains aggregates counts', async t => {
  const { store } = await fixture(t);
  await store.add({ ...fields(), expectedRevision: 0 });
  await store.add({ ...fields({ title: '热力学第二定律', domain: '物理', tags: [], summary: '封闭系统的熵不会减少' }), expectedRevision: 1 });
  const byDomain = await store.search({ domain: '物理' });
  assert.equal(byDomain.entries.length, 1);
  assert.equal(byDomain.entries[0].title, '热力学第二定律');
  const byText = await store.search({ query: '数字资产' });
  assert.equal(byText.entries.length, 1);
  assert.deepEqual((await store.domains()), [{ domain: '金融', count: 1 }, { domain: '物理', count: 1 }]);
});

test('remove deletes entries and drops dangling related references', async t => {
  const { store } = await fixture(t);
  const a = await store.add({ ...fields({ title: 'A' }), expectedRevision: 0 });
  await store.add({ ...fields({ title: 'B', related: ['A'] }), expectedRevision: 1 });
  const r = await store.remove({ ids: [a.entry.id], expectedRevision: 2 });
  assert.deepEqual(r.removedIds, [a.entry.id]);
  const snap = await store.snapshot();
  assert.equal(snap.entries.length, 1);
  assert.deepEqual(snap.entries[0].related, []);
});

test('exportMarkdown contains structured sections', async t => {
  const { store } = await fixture(t);
  await store.add({ ...fields(), expectedRevision: 0 });
  await store.addPerspective({ id: (await store.snapshot()).entries[0].id, text: '新角度', source: 'ai', expectedRevision: 1 });
  const { markdown } = await store.exportMarkdown();
  assert.ok(markdown.includes('## 比特币'));
  assert.ok(markdown.includes('### 前提 / 公理'));
  assert.ok(markdown.includes('### 推导结论'));
  assert.ok(markdown.includes('### 角度 / 诠释'));
});

test('strict validation rejects bad input without altering state', async t => {
  const { store } = await fixture(t);
  for (const bad of [
    { title: '' }, { title: 'x'.repeat(201) }, { title: 'x\ny' }, { title: 'x', tags: ['a'.repeat(51)] },
    { title: 'x', tags: 'not-array' }, { title: 'x', axioms: ['a'.repeat(501)] }, { title: 'x', summary: 'y'.repeat(501) },
  ]) await assert.rejects(store.add({ ...fields(bad), expectedRevision: 0 }), isCode('VALIDATION'));
  assert.equal((await store.snapshot()).entries.length, 0);
  await assert.rejects(store.add({ ...fields() }), isCode('VALIDATION')); // missing expectedRevision
  const { entry } = await store.add({ ...fields(), expectedRevision: 0 });
  await assert.rejects(store.get({ id: 'missing' }), isCode('NOT_FOUND'));
  await assert.rejects(store.update({ id: entry.id, expectedRevision: 1, patch: { title: 'y\ny' } }), isCode('VALIDATION'));
});

test('type-only updates preserve content and output contains only organized material', async t => {
  const { store } = await fixture(t);
  const { entry } = await store.add({ ...fields(), expectedRevision: 0 });
  assert.equal(entry.type, 'knowledge');
  await store.addPerspective({ id: entry.id, text: 'discussion-only-marker', expectedRevision: 1 });
  const changed = await store.update({ id: entry.id, patch: { type: 'plan' }, expectedRevision: 2 });
  assert.equal(changed.entry.title, entry.title);
  assert.equal(changed.entry.type, 'plan');
  assert.equal(changed.entry.perspectives.length, 1);
  assert.equal((await store.list()).entries[0].type, 'plan');
  const { markdown } = await store.output({ id: entry.id });
  assert.ok(markdown.includes('## 执行步骤'));
  assert.ok(markdown.includes('## 打卡清单'));
  assert.ok(!markdown.includes('discussion-only-marker'));
  await assert.rejects(store.update({ id: entry.id, patch: { type: 'invalid' }, expectedRevision: 3 }), isCode('VALIDATION'));
});

test('snapshot mutation cannot mutate store; corrupt JSON is never overwritten', async t => {
  const { store, filePath } = await fixture(t);
  await store.add({ ...fields(), expectedRevision: 0 });
  const snap = await store.snapshot();
  snap.entries[0].title = 'oops'; snap.entries.push({ id: 'fake', title: 'x', domain: '', tags: [], summary: '', axioms: [], elements: [], conclusions: [], related: [], perspectives: [], createdAt: 0, updatedAt: 0 });
  assert.equal((await store.snapshot()).entries.length, 1);
  assert.equal((await store.snapshot()).entries[0].title, '比特币');
  await fs.writeFile(filePath, '{broken');
  await assert.rejects(store.snapshot(), SyntaxError);
  await assert.rejects(store.add({ ...fields(), expectedRevision: 0 }), SyntaxError);
  assert.equal(await fs.readFile(filePath, 'utf8'), '{broken');
});
