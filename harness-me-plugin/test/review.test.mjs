import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { MeStore } from '../lib/store.js';

async function fixture(t) {
  const dir = await mkdtemp(path.join(tmpdir(), 'me-review-test-'));
  t.after(() => rm(dir, { recursive: true, force: true }));
  return new MeStore({ filePath: path.join(dir, 'me.json') });
}
const reviewInput = {
  date: '2026-11-11', summary: '我吃了早餐，练了第一部分，之后休息。',
  analysis: '今天有推进，也有需要继续观察的卡点。', analysisSource: 'ai',
  sourceIds: ['record-1'], sensitive: false, status: 'confirmed'
};

test('review stores raw account and AI analysis separately, with source and date', async t => {
  const store = await fixture(t);
  const saved = await store.reviewSave({ ...reviewInput, expectedRevision: 0 });
  assert.equal(saved.revision, 1);
  assert.equal(saved.review.summary, reviewInput.summary);
  assert.equal(saved.review.analysisSource, 'ai');
  assert.deepEqual(saved.review.sourceIds, ['record-1']);
  assert.equal(saved.review.status, 'confirmed');
  const listed = await store.reviewList({ from: '2026-11-11', to: '2026-11-11' });
  assert.equal(listed.total, 1);
  assert.equal((await store.reviewGet({ id: saved.review.id })).review.analysis, reviewInput.analysis);
});

test('sensitive reviews are hidden by default and available only with explicit local flag', async t => {
  const store = await fixture(t);
  const saved = await store.reviewSave({ ...reviewInput, sensitive: true, expectedRevision: 0 });
  assert.equal((await store.reviewList()).total, 0);
  assert.equal((await store.reviewGet({ id: saved.review.id })).review, null);
  assert.equal((await store.reviewList({ includeSensitive: true })).total, 1);
  assert.equal((await store.reviewGet({ id: saved.review.id, includeSensitive: true })).review.sensitive, true);
});

test('editing the account invalidates stale analysis and uses optimistic revision', async t => {
  const store = await fixture(t);
  const saved = await store.reviewSave({ ...reviewInput, expectedRevision: 0 });
  const changed = await store.reviewSave({ id: saved.review.id, date: reviewInput.date, summary: '新的用户叙述', expectedRevision: 1 });
  assert.equal(changed.review.analysis, null);
  assert.equal(changed.review.analysisSource, null);
  assert.equal(changed.review.status, 'draft');
  assert.deepEqual(changed.review.sourceIds, ['record-1']);
  await assert.rejects(store.reviewSave({ id: saved.review.id, date: reviewInput.date, summary: '覆盖旧内容', expectedRevision: 1 }), { code: 'REVISION_CONFLICT' });
  assert.equal((await store.reviewGet({ id: saved.review.id })).review.summary, '新的用户叙述');
});

test('review validation rejects inconsistent analysis, invalid dates and unsafe source IDs', async t => {
  const store = await fixture(t);
  for (const patch of [
    { date: '2026-02-30' }, { analysis: 'x', analysisSource: null },
    { analysis: null, analysisSource: 'ai' }, { sourceIds: ['bad id'] }, { summary: '' }
  ]) await assert.rejects(store.reviewSave({ ...reviewInput, ...patch, expectedRevision: 0 }), { code: 'VALIDATION_ERROR' });
  assert.equal((await store.snapshot()).revision, 0);
});

test('review Markdown keeps raw account and analysis separate and honors sensitive filter', async t => {
  const store = await fixture(t);
  await store.reviewSave({ ...reviewInput, expectedRevision: 0 });
  await store.reviewSave({ ...reviewInput, summary: '敏感叙述', sensitive: true, expectedRevision: 1 });
  const markdown = await store.exportReviewsMarkdown({ from: '2026-11-11', to: '2026-11-11' });
  assert.match(markdown, /原始日记/); assert.match(markdown, /复盘分析/); assert.match(markdown, /今天有推进/);
  assert.doesNotMatch(markdown, /敏感叙述/);
  assert.match(await store.exportReviewsMarkdown({ includeSensitive: true }), /敏感叙述/);
});

test('review backup roundtrip, idempotent import and conflict rejection preserve old v1', async t => {
  const store = await fixture(t);
  const saved = await store.reviewSave({ ...reviewInput, expectedRevision: 0 });
  const data = await store.exportBackup();
  assert.equal(JSON.parse(data).reviews.length, 1);
  const restored = new MeStore({ filePath: path.join(path.dirname(store.filePath), 'restored.json') });
  const result = await restored.importBackup({ data, expectedRevision: 0 });
  assert.equal(result.addedReviews, 1);
  assert.deepEqual((await restored.reviewGet({ id: saved.review.id })).review, saved.review);
  assert.equal((await restored.importBackup({ data, expectedRevision: 1 })).addedReviews, 0);
  const conflict = JSON.parse(data); conflict.reviews[0].summary = '被篡改的内容';
  await assert.rejects(restored.importBackup({ data: JSON.stringify(conflict), expectedRevision: 1 }), { code: 'IMPORT_CONFLICT' });
  const old = new MeStore({ filePath: path.join(path.dirname(store.filePath), 'old.json') });
  await old.importBackup({ data: JSON.stringify({ version: 1, revision: 2, records: [], profiles: [] }), expectedRevision: 0 });
  assert.equal((await old.snapshot()).reviews, undefined);
});
