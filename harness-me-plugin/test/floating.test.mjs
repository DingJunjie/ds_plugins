import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const source = await readFile(new URL('../floating-widget.js', import.meta.url), 'utf8');
function harness({ ai = true, failAI = false } = {}) {
  const states = [], refs = [], effects = [];
  let index = 0;
  const Fragment = Symbol('Fragment');
  const React = {
    Fragment,
    createElement: (type, props, ...children) => ({ type, props: props || {}, children: children.flat(Infinity).filter(x => x !== null && x !== undefined && x !== false) }),
    useState(initial) { const i = index++; if (!(i in states)) states[i] = typeof initial === 'function' ? initial() : initial; return [states[i], value => { states[i] = typeof value === 'function' ? value(states[i]) : value; }]; },
    useRef(initial) { const i = index++; if (!(i in refs)) refs[i] = { current: initial }; return refs[i]; },
    useEffect(fn) { effects.push(fn); },
    useSyncExternalStore(_subscribe, get) { index++; return get(); }
  };
  const storage = { 'harness.me.ui.v2': JSON.stringify({ enabled: true, hydration: false, ai }) };
  const calls = [];
  let revision = 0;
  const dailyItem = { id: 'daily-1', text: '拉伸', active: true, doneDates: [], createdAt: '2026-11-10T00:00:00Z', updatedAt: '2026-11-10T00:00:00Z' };
  const backend = async request => {
    calls.push(request);
    if (request.op === 'previewAnalysis') {
      if (failAI) throw new Error('模型不可用');
      return { summary: '喝了水', category: '饮水', model: 'test/model', metrics: [{ kind: 'water', value: 1, unit: 'count' }] };
    }
    if (request.op === 'add') return { revision: ++revision, record: { id: 'r' + revision, ...request } };
    if (request.op === 'stats') return { revision, lastWaterAt: null, days: [{ waterCount: null, waterMl: null, exerciseMin: null, sleepHour: null }], profiles: [] };
    if (request.op === 'dailyList') return { revision, date: request.date, items: [{ ...dailyItem, done: false }] };
    if (request.op === 'dailyUpdate') { revision++; return { revision, item: { ...dailyItem, doneDates: request.done ? [request.date] : [] } }; }
    throw new Error('unexpected ' + request.op);
  };
  const context = {
    React, localStorage: { getItem: k => storage[k] || null, setItem: (k,v) => { storage[k] = v; } },
    window: { innerWidth: 1200, innerHeight: 800, addEventListener() {}, removeEventListener() {} },
    Intl, Date, setTimeout: fn => { fn(); return 1; }, clearTimeout() {}, setInterval: () => 1, clearInterval() {}, console
  };
  vm.runInNewContext(source, context);
  const prefs = context.createMePreferences();
  const Floating = context.createMeFloating({ connection: { rpc: { call: async (_path,_method,payload) => {
    try { return { ok: true, value: { ok: true, value: await backend(payload.args.request) } }; }
    catch (error) { return { ok: true, value: { ok: false, error: { message: error.message } } }; }
  } } } }, prefs);
  let tree;
  const render = () => { index = 0; tree = Floating(); return tree; };
  render();
  for (const effect of effects.splice(0)) effect();
  const flush = async () => { for (let i=0;i<8;i++) await Promise.resolve(); render(); };
  const all = (node = tree, result = []) => {
    if (!node || typeof node !== 'object') return result;
    result.push(node);
    for (const child of node.children || []) all(child, result);
    return result;
  };
  const find = predicate => all().find(predicate);
  const byLabel = label => find(n => n.props?.['aria-label'] === label);
  return { render, flush, all, find, byLabel, calls, prefs, storage, get tree() { return tree; } };
}

test('floating Enter previews before save; cancel preserves draft and confirm saves once', async () => {
  const ui = harness();
  ui.byLabel('展开 Me 随手记').props.onClick(); ui.render();
  const input = ui.byLabel('Me 随手记内容');
  input.props.onChange({ target: { value: '我刚喝了一杯水' } }); ui.render();
  ui.byLabel('Me 随手记内容').props.onKeyDown({ key: 'Enter', shiftKey: false, isComposing: false, preventDefault() {} });
  await ui.flush();
  assert.equal(ui.calls.filter(x => x.op === 'previewAnalysis').length, 1);
  assert.equal(ui.calls.filter(x => x.op === 'add').length, 0);
  assert.ok(ui.byLabel('确认 Me 记录'));
  const cancel = ui.all().find(n => n.type === 'button' && n.children.includes('取消'));
  cancel.props.onClick(); ui.render();
  assert.equal(ui.byLabel('Me 随手记内容').props.value, '我刚喝了一杯水');
  ui.byLabel('整理并预览').props.onClick(); await ui.flush();
  const confirm = ui.all().find(n => n.type === 'button' && n.children.includes('确认保存'));
  confirm.props.onClick(); await ui.flush();
  const adds = ui.calls.filter(x => x.op === 'add');
  assert.equal(adds.length, 1);
  assert.equal(adds[0].category, '饮水');
  assert.equal(adds[0].analysis.summary, '喝了水');
  assert.equal(adds[0].analysis.model, 'test/model');
});

test('AI failure still permits raw-only confirmation without losing text', async () => {
  const ui = harness({ failAI: true });
  ui.byLabel('展开 Me 随手记').props.onClick(); ui.render();
  ui.byLabel('Me 随手记内容').props.onChange({ target: { value: '只是原文' } }); ui.render();
  ui.byLabel('整理并预览').props.onClick(); await ui.flush();
  assert.equal(ui.calls.filter(x => x.op === 'add').length, 0);
  ui.all().find(n => n.type === 'button' && n.children.includes('确认保存')).props.onClick(); await ui.flush();
  const saved = ui.calls.find(x => x.op === 'add');
  assert.equal(saved.content, '只是原文'); assert.equal(saved.analysis, undefined); assert.equal(saved.metrics, undefined);
});

test('circular quick water, exercise and daily completion use exact operations', async () => {
  const ui = harness();
  ui.byLabel('展开 Me 随手记').props.onClick(); ui.render();
  const water = ui.byLabel('记一次喝水');
  assert.equal(water.props.style.borderRadius, '50%');
  await water.props.onClick(); await ui.flush();
  const waterAdd = ui.calls.find(x => x.op === 'add');
  assert.deepEqual(JSON.parse(JSON.stringify(waterAdd.metrics)), [{ kind: 'water', value: 1, unit: 'count' }]);
  ui.byLabel('记录运动时长').props.onClick(); ui.render();
  ui.byLabel('运动时长').props.onChange({ target: { value: '20' } }); ui.render();
  await ui.byLabel('确认运动记录').props.onClick(); await ui.flush();
  assert.equal(ui.calls.filter(x => x.op === 'add').at(-1).metrics[0].value, 20);
  ui.byLabel('查看今日 Me 日常').props.onClick(); await ui.flush();
  ui.byLabel('标记今天完成').props.onClick(); await ui.flush();
  assert.equal(ui.calls.find(x => x.op === 'dailyUpdate').done, true);
});

test('dragging clamps to viewport and persists position without opening on drag', async () => {
  const ui = harness();
  const collapsed = ui.byLabel('展开 Me 随手记');
  const target = { closest: () => null };
  const base = { button: 0, pointerId: 1, target, clientX: 1100, clientY: 700 };
  collapsed.props.onPointerDown({ ...base, currentTarget: { setPointerCapture() {} } });
  collapsed.props.onPointerMove({ ...base, clientX: 900, clientY: 500 });
  collapsed.props.onPointerUp({ ...base, clientX: 900, clientY: 500 });
  ui.render();
  assert.ok(ui.prefs.get().position);
  assert.ok(ui.byLabel('展开 Me 随手记'), 'drag alone should leave the launcher collapsed');
  assert.equal(JSON.parse(ui.storage['harness.me.ui.v2']).position.x, 630);
});
