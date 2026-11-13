import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';

test('generated client bundle parses and page has no local data persistence', () => {
  let generated;
  const context = vm.createContext({ window: { __ModuleLoader__: { load: m => { generated = m.factory; } } } });
  vm.runInContext(fs.readFileSync(new URL('./lib/client.js', import.meta.url), 'utf8'), context);
  const code = generated.toString();
  const start = code.indexOf('const PAGE = ') + 'const PAGE = '.length;
  const end = code.indexOf(';\n', start);
  assert.ok(end > start);
  const page = JSON.parse(code.slice(start, end));
  assert.ok(page.includes('<title>条目</title>'));
  const script = /<script>([\s\S]*?)<\/script>/.exec(page)[1];
  assert.doesNotThrow(() => new vm.Script(script));
  assert.ok(script.includes('window.__knowledgeConnect'));
  assert.ok(script.includes('function toMarkdown()'));
  // The encyclopedia page must not write data to browser localStorage.
  assert.ok(!page.includes('localStorage'));
  // Panel id is registered for the sidebar/main slots.
  assert.ok(code.includes('local-knowledge'));
});

test('parent panel uses authenticated connection and unwraps both envelopes', async () => {
  let exported, props, cleanup;
  const calls = [];
  const React = {
    useRef: () => ({ current: null }),
    useEffect: f => { cleanup = f(); },
    useCallback: f => f,
    createElement: (_tag, p) => { props = p; return p; },
    Fragment: {},
    useState: () => [null, () => {}],
    useSyncExternalStore: (_s, g) => g()
  };
  const context = vm.createContext({
    AbortController,
    window: { __ModuleLoader__: { load: m => { exported = m.factory(() => React); } } }
  });
  const source = fs.readFileSync(new URL('./client-template.js', import.meta.url), 'utf8')
    .replace('__PAGE__', '"html"')
    .replace('__FLOATING_WIDGET__', fs.readFileSync(new URL('./floating-widget.js', import.meta.url), 'utf8'));
  vm.runInContext(source, context);
  const ctx = {
    connection: { rpc: { call: async (...args) => { calls.push(args); return { ok: true, value: { ok: true, value: { revision: 3, entries: [] } } }; } } },
    effect: f => f(),
    slots: { inject: (_name, f) => f(), register: (spec, component) => { if (spec.name === 'main') component(); return () => {}; } }
  };
  exported.apply(ctx);
  assert.ok(props && props.onLoad, 'iframe onLoad should be registered');
  let rpc;
  props.onLoad({ currentTarget: { contentWindow: { __knowledgeConnect: f => { rpc = f; return () => {}; } } } });
  assert.ok(rpc, '__knowledgeConnect should be called');
  const result = await rpc({ op: 'snapshot' });
  assert.equal(result.revision, 3);
  assert.equal(calls[0][0], '/api');
  assert.equal(calls[0][1], 'localKnowledge/request');
  assert.equal(calls[0][2].args.request.op, 'snapshot');
  if (cleanup) cleanup();
});
