import test from 'node:test';
import assert from 'node:assert/strict';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { TodoStore } from '../lib/store.js';

async function fixture(t, initial = '2026-11-09') {
  const base = await fs.realpath(os.tmpdir());
  const dir = await fs.mkdtemp(path.join(base, 'harness-todo-recurrence-test-'));
  t.after(async () => {
    const resolved = await fs.realpath(dir);
    assert.equal(path.dirname(resolved), base);
    assert.match(path.basename(resolved), /^harness-todo-recurrence-test-[A-Za-z0-9]+$/);
    assert.equal(resolved, path.resolve(dir));
    await fs.rm(resolved, { recursive: true });
  });
  let current = initial;
  const now = () => new Date(`${current}T12:00:00`);
  const filePath = path.join(dir, 'store.json');
  return { store: new TodoStore({filePath, now}), filePath, now, day: value => {current = value;} };
}
const code = expected => error => error.code === expected;

test('daily completion stays visible today, rolls forward without writes and skips missed days', async t => {
  const {store,filePath,day,now} = await fixture(t);
  const add = await store.add({text:'每日散步',recurrence:{kind:'daily',start:'2026-11-01'},expectedRevision:0});
  assert.equal(add.task.occurrenceDate,'2026-11-09');assert.equal(add.task.due,'2026-11-09');assert.equal(add.task.done,false);
  let result = await store.update({id:add.task.id,patch:{done:true},occurrenceDate:'2026-11-09',expectedRevision:1});
  assert.equal(result.tasks[0].done,true);assert.equal(result.tasks[0].completedAt,now().getTime());
  assert.equal((await store.snapshot()).tasks[0].occurrenceDate,'2026-11-09');
  const raw = JSON.parse(await fs.readFile(filePath,'utf8'));
  assert.equal(raw.version,1);assert.equal(raw.tasks[0].done,false);assert.equal(raw.tasks[0].completedAt,null);assert.equal(raw.tasks[0].due,'');
  assert.deepEqual(raw.tasks[0].completions,{'2026-11-09':now().getTime()});
  day('2026-11-10');result=await new TodoStore({filePath,now}).snapshot();
  assert.equal(result.revision,2);assert.equal(result.tasks.length,1);assert.equal(result.tasks[0].done,false);assert.equal(result.tasks[0].due,'2026-11-10');
  day('2026-12-01');result=await store.snapshot();
  assert.equal(result.tasks.length,1);assert.equal(result.tasks[0].occurrenceDate,'2026-12-01');assert.equal(result.revision,2);
});

test('weekly start and offdays project next eligible day using Mon1 Sun7',async t=>{
  const {store,day}=await fixture(t,'2026-11-08'); // Sunday
  const add=await store.add({text:'周一周三',recurrence:{kind:'weekly',days:[3,1],start:'2026-11-10'},expectedRevision:0});
  assert.deepEqual(add.task.recurrence.days,[1,3]);assert.equal(add.task.occurrenceDate,'2026-11-11');
  day('2026-11-11');let snap=await store.snapshot();assert.equal(snap.tasks[0].due,'2026-11-11');
  await store.update({id:add.task.id,patch:{done:true},occurrenceDate:'2026-11-11',expectedRevision:1});
  assert.equal((await store.snapshot()).tasks[0].done,true);
  day('2026-11-12');snap=await store.snapshot();assert.equal(snap.tasks[0].due,'2026-11-16');assert.equal(snap.tasks[0].done,false);
  const sunday=await store.add({text:'周日',recurrence:{kind:'weekly',days:[7],start:'2026-11-01'},expectedRevision:2});
  assert.equal(sunday.task.due,'2026-11-15');
  day('2026-11-15');assert.equal((await store.snapshot()).tasks[1].due,'2026-11-15');
});

test('future daily start honored and recurring done can be undone without changing template',async t=>{
  const {store,filePath}=await fixture(t);
  const add=await store.add({text:'future',recurrence:{kind:'daily',start:'2026-12-01'},expectedRevision:0});
  assert.equal(add.task.due,'2026-12-01');
  await store.update({id:add.task.id,patch:{done:true},occurrenceDate:'2026-12-01',expectedRevision:1});
  const result=await store.update({id:add.task.id,patch:{done:false},occurrenceDate:'2026-12-01',expectedRevision:2});
  assert.equal(result.tasks[0].done,false);assert.equal(result.tasks[0].completedAt,null);assert.deepEqual(result.tasks[0].completions,{});
  assert.equal(JSON.parse(await fs.readFile(filePath,'utf8')).tasks[0].done,false);
});

test('same revision cannot authorize stale midnight occurrence; invalid mutations do not persist',async t=>{
  const {store,day}=await fixture(t);
  const add=await store.add({text:'daily',recurrence:{kind:'daily',start:'2026-11-09'},expectedRevision:0});
  await assert.rejects(store.update({id:add.task.id,patch:{done:true},expectedRevision:1}),code('VALIDATION'));
  day('2026-11-10');
  await assert.rejects(store.update({id:add.task.id,patch:{done:true},occurrenceDate:'2026-11-09',expectedRevision:1}),code('STALE_OCCURRENCE'));
  await assert.rejects(store.update({id:add.task.id,patch:{text:'bad partial',due:''},expectedRevision:1}),code('VALIDATION'));
  const snap=await store.snapshot();assert.equal(snap.revision,1);assert.equal(snap.tasks[0].text,'daily');assert.deepEqual(snap.tasks[0].completions,{});
  const result=await store.update({id:add.task.id,patch:{done:true},occurrenceDate:'2026-11-10',expectedRevision:1});assert.equal(result.tasks[0].done,true);
});

test('recurrence validation is strict and one-off chat proposals and old persisted commits remain compatible',async t=>{
  const {store,filePath,now}=await fixture(t);
  for(const recurrence of [null,{}, {kind:'monthly',start:'2026-11-01'}, {kind:'daily',start:''}, {kind:'daily',start:'2026-02-29'}, {kind:'daily',start:'2026-11-01',days:[1]}, {kind:'weekly',start:'2026-11-01',days:[]}, {kind:'weekly',start:'2026-11-01',days:[0]}, {kind:'weekly',start:'2026-11-01',days:[8]}, {kind:'weekly',start:'2026-11-01',days:[1,1]}]) await assert.rejects(store.add({text:'bad',recurrence,expectedRevision:0}),code('VALIDATION'));
  await assert.rejects(store.add({text:'two dates',due:'2026-12-01',recurrence:{kind:'daily',start:'2026-11-01'},expectedRevision:0}),code('VALIDATION'));
  await assert.rejects(store.propose({sessionId:'s',text:'not supported',recurrence:{kind:'daily',start:'2026-11-01'}}),code('VALIDATION'));
  const proposed=await store.propose({sessionId:'s',text:'old one-off'});
  const committed=await store.commit({sessionId:'s',proposalId:proposed.proposal.id});
  assert.equal(Object.hasOwn(committed.task,'recurrence'),false);
  const reopened=new TodoStore({filePath,now});
  const snapshot=await reopened.snapshot();
  assert.equal(snapshot.revision,2);assert.deepEqual(snapshot.tasks,[committed.task]);assert.ok(snapshot.serverToday);assert.ok(snapshot.timezone);
  assert.equal((await reopened.commit({sessionId:'s',proposalId:proposed.proposal.id})).alreadyCommitted,true);
  await assert.rejects(reopened.update({id:committed.task.id,patch:{done:true},occurrenceDate:'2026-11-09',expectedRevision:2}),code('VALIDATION'));
  const done=await reopened.update({id:committed.task.id,patch:{done:true,due:'2026-12-01'},expectedRevision:2});assert.equal(done.tasks[0].done,true);assert.equal(done.tasks[0].due,'2026-12-01');
});

test('reorder and explicit remove address recurring template ids; no occurrences persisted separately',async t=>{
  const {store}=await fixture(t);
  const a=await store.add({text:'repeat',recurrence:{kind:'daily',start:'2026-11-09'},expectedRevision:0});
  const b=await store.add({text:'one-off',expectedRevision:1});
  const result=await store.reorder({ids:[b.task.id,a.task.id],expectedRevision:2});assert.deepEqual(result.tasks.map(t=>t.id),[b.task.id,a.task.id]);
  const removed=await store.remove({ids:[a.task.id],expectedRevision:3});assert.equal(removed.tasks.length,1);assert.equal(removed.tasks[0].id,b.task.id);
});
