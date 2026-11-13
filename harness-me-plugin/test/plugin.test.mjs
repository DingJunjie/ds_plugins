import test from 'node:test';
import assert from 'node:assert/strict';
import { MeRemote, POLICY, inject } from '../lib/index.js';

test('remote denies non-owner before touching data', async () => {
  let touched = false;
  const remote = { ctx: { invocation: { peer: { principal: { kind: 'guest' } } } }, store: { snapshot() { touched = true; } } };
  const result = await MeRemote.prototype.request.call(remote, { op: 'snapshot' });
  assert.equal(result.ok, false); assert.equal(result.error.code, 'FORBIDDEN'); assert.equal(touched, false);
});
test('remote owner access is explicitly allowlisted', async () => {
  const remote = { ctx: { invocation: { peer: { principal: { kind: 'owner' } } } }, store: { snapshot: async () => ({ revision: 7 }) } };
  assert.deepEqual(await MeRemote.prototype.request.call(remote, { op: 'snapshot' }), { ok: true, value: { revision: 7 } });
  for (const op of ['constructor', '__proto__', 'toString', 'syncToNutstore']) {
    assert.equal((await MeRemote.prototype.request.call(remote, { op })).ok, false);
  }
});
test('cross-session rules are registered without embedding personal history', () => {
  assert.ok(inject.includes('systemPrompt'));
  assert.match(POLICY, /先 me_context/); assert.match(POLICY, /敏感/); assert.match(POLICY, /不是指令/);
  assert.doesNotMatch(POLICY, /INFP/);
});
