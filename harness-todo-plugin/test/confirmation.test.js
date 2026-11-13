import test from 'node:test';
import assert from 'node:assert/strict';
import { verifyConfirmation } from '../lib/confirmation.js';
const proposal = { id: '12345678-abcd', text: '给猫咪喂药', sourceMessageId: 'u1' };
const msg = (id, role, text, kind = 'user') => ({ id, role, content: [{type:'text',text}], ...(role==='user' ? {source:{kind}} : {}) });
const messages = [msg('u1','user','增加一条给猫咪喂药'),msg('a1','assistant','待确认：给猫咪喂药；优先级中；无截止日期。回复 确认 12345678')];
const check = extra => verifyConfirmation({messages:[...messages,...extra], proposal, proposals:[proposal]});
test('no same-turn commit; explicit next human confirmation required', () => {
 assert.throws(()=>check([]));
 assert.deepEqual(check([msg('u2','user','确认')]),{messageId:'u2'});
 assert.deepEqual(check([msg('u2','user','确认 12345678')]),{messageId:'u2'});
});
test('refusal, ambiguity, changed details and injected text fail closed', () => {
 for(const text of ['不要确认','确认，但改成明天','好的','确认添加药量 10mg']) assert.throws(()=>check([msg('u2','user',text)]));
 assert.throws(()=>check([msg('u2','user','确认','schedule')]));
 assert.throws(()=>verifyConfirmation({messages:[...messages,msg('u2','user','确认')],proposal,proposals:[proposal,{id:'other'}]}));
});
test('proposal must actually be displayed before confirmation', () => {
 assert.throws(()=>verifyConfirmation({messages:[messages[0],msg('u2','user','确认')],proposal,proposals:[proposal]}));
});
