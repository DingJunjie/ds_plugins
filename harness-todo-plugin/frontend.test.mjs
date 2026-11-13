import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
import {webcrypto} from 'node:crypto';

function bridge(legacy) {
  const storage = new Map(legacy ? [['harness.todo.local.v1', JSON.stringify(legacy)]] : []);
  const node = {style: {}, setAttribute() {}, before() {}};
  let poll, clears = 0;
  const context = vm.createContext({
    console, crypto: webcrypto, TextEncoder, window: {crypto: webcrypto},
    document: {createElement: () => ({...node, style: {}}), querySelector: () => node},
    localStorage: {getItem: k => storage.get(k) ?? null, setItem: (k,v) => storage.set(k,v)},
    state: {tasks: [], theme: 'light', filter: 'all'}, editingId: null, dragId: null,
    render() {}, toast() {},
    setInterval: f => {poll = f; return 1;}, clearInterval: () => clears++
  });
  vm.runInContext(fs.readFileSync(new URL('./page-bridge.js', import.meta.url), 'utf8'), context);
  const run = expr => vm.runInContext(expr, context);
  const settle = async () => { for (let i=0;i<20;i++) await new Promise(r => setImmediate(r)); };
  return {context, run, storage, settle, poll: () => poll(), clears: () => clears};
}
test('empty Host has no seed; adds carry expectedRevision; failed add retains authoritative data', async () => {
  const b = bridge(); const calls = []; let fail = false;
  b.context.request = async req => {
    calls.push(req);
    if (req.op === 'snapshot') return {revision: 0, tasks: []};
    if (fail) throw new Error('offline');
    return {revision: 1, tasks: [{id:'safe-uuid',text:req.text}]};
  };
  const dispose = b.run('window.__todoConnect(request)'); await b.settle();
  assert.equal(b.context.state.tasks.length, 0);
  assert.equal(await b.run('addTask("hello", "mid", "")'), true);
  assert.equal(calls[1].op, 'add'); assert.equal(calls[1].expectedRevision, 0);
  fail = true;
  assert.equal(await b.run('addTask("keep me", "high", "")'), false);
  assert.equal(b.context.state.tasks[0].text, 'hello');
  dispose(); assert.equal(b.clears(), 1);
});
test('legacy imports once after ack with stable fingerprint; original backup intact', async () => {
  const task = {id:'old',text:'legacy',done:false,prio:'mid',due:'',createdAt:1,completedAt:null};
  const b = bridge({tasks:[task],theme:'dark'}); const original = b.storage.get('harness.todo.local.v1');
  const calls = [];
  b.context.request = async req => {calls.push(req); return {revision:req.op === 'importLegacy' ? 1 : 0,tasks:[]};};
  const dispose = b.run('window.__todoConnect(request)'); await b.settle();
  assert.equal(calls[1].op, 'importLegacy');
  assert.ok(calls[1].fingerprint.length <= 128);
  assert.ok(calls[1].clientId);
  assert.equal(b.storage.get('harness.todo.local.v1'), original);
  b.poll(); await b.settle();
  assert.equal(calls.filter(r => r.op === 'importLegacy').length, 1);
  dispose();
});
test('polling skips edits and overlapping requests; conflicts preserve edit and old expectedRevision', async () => {
  const b = bridge(); let resolve, count = 0;
  b.context.request = () => {count++; return new Promise(r => {resolve = r;});};
  const dispose = b.run('window.__todoConnect(request)');
  b.poll(); assert.equal(count, 1);
  resolve({revision:1,tasks:[{id:'a',text:'old'}]}); await b.settle();
  b.run('startEdit("a")'); b.poll(); assert.equal(count, 1);
  b.context.request2 = async req => {
    if (req.op === 'update') { assert.equal(req.expectedRevision, 1); const e = new Error('changed'); e.code='REVISION_CONFLICT'; throw e; }
    return {revision:2,tasks:[{id:'a',text:'external'}]};
  };
  b.run('hostRequest = request2');
  await b.run('commitEdit("a", "my draft")');
  assert.equal(b.context.editingId, 'a');
  assert.equal(b.context.state.tasks[0].text, 'old');
  b.run('editingId=null; finishDeferred()');
  assert.equal(b.context.state.tasks[0].text, 'external');
  dispose();
});
test('generated page parses, preserves markdown, and contains no local task writes or seed', () => {
  let generated;
  const context = vm.createContext({window:{__ModuleLoader__:{load:m => {generated=m.factory;}}}});
  vm.runInContext(fs.readFileSync(new URL('./lib/client.js', import.meta.url), 'utf8'), context);
  const code = generated.toString();
  const start = code.indexOf('const PAGE = ') + 'const PAGE = '.length;
  const end = code.indexOf(';\n', start);
  assert.ok(end > start);
  const page = JSON.parse(code.slice(start, end));
  const script = /<script>([\s\S]*?)<\/script>/.exec(page)[1];
  assert.doesNotThrow(() => new vm.Script(script));
  assert.ok(page.includes('function toMarkdown()'));
  assert.ok(page.includes('if (!await addTask('));
  assert.ok(!page.includes('seed()'));
  assert.ok(!page.includes('JSON.stringify({ tasks: state.tasks'));
});
test('parent uses authenticated connection and unwraps both result envelopes', async () => {
  let exported, props, cleanup;
  const calls = [];
  const React = {useRef: () => ({current:null}), useEffect:f => {cleanup=f();}, useCallback:f=>f,
    createElement: (_, p) => {props=p; return p;}};
  const context = vm.createContext({AbortController, window:{__ModuleLoader__:{load:m=> {exported=m.factory(()=>React);}}}});
  vm.runInContext(fs.readFileSync(new URL('./client-template.js', import.meta.url), 'utf8').replace('__PAGE__','"html"').replace('__FLOATING_WIDGET__', fs.readFileSync(new URL('./floating-widget.js', import.meta.url), 'utf8')),context);
  const ctx = {connection:{rpc:{call:async (...args)=> {calls.push(args);return {ok:true,value:{ok:true,value:{revision:3,tasks:[]}}};}}},
    effect:f=>f(), slots:{inject:(_,f)=>f(),register:(spec, component)=> {if(spec.name==='main') component(); return ()=>{};}}};
  exported.apply(ctx);
  // icon creation runs after panel creation; capture the iframe props at creation instead.
  let request;
  // Register again with a slot collector so the function can be mounted in isolation.
  ctx.slots.register=(spec,component)=> {if(spec.name==='main'){component(); request=props.onLoad; } return ()=>{};};
  exported.apply(ctx);
  let rpc;
  request({currentTarget:{contentWindow:{__todoConnect:f=> {rpc=f;return ()=>{};}}}});
  const result = await rpc({op:'snapshot'});
  assert.equal(result.revision,3);
  assert.equal(calls[0][0],'/api'); assert.equal(calls[0][1],'localTodo/request');
  assert.equal(calls[0][2].args.request.op,'snapshot');
  cleanup();
});
