import { promises as fs } from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

// Serializes independent instances addressing the same file in this Node process.
// One Host process should own a store file; this is not an inter-process lock.
const queues = new Map();
const MAX_ENTRIES = 10000;
const MAX_LIST = 100;
const MAX_TAGS = 20;
const MAX_RELATED = 50;
const MAX_PERSPECTIVES = 200;
const clone = value => JSON.parse(JSON.stringify(value));

export class StoreError extends Error {
  constructor(code, message, details = {}) { super(message); this.name = 'StoreError'; this.code = code; Object.assign(this, details); }
}
function fail(message) { throw new StoreError('VALIDATION', message); }

function object(value, allowed, name = 'input') {
  if (!value || typeof value !== 'object' || Array.isArray(value)) fail(`${name} must be an object`);
  for (const key of Object.keys(value)) if (!allowed.includes(key)) fail(`Unknown ${name} field: ${key}`);
}
function string(value, name, max = 200) {
  if (typeof value !== 'string' || !value.trim() || value.length > max || /[\u0000-\u001f\u007f]/.test(value)) fail(`${name} must be a nonempty string of at most ${max} characters without control characters`);
  return value;
}
function optionalString(value, name, max = 200) {
  if (value === '' || value === undefined || value === null) return '';
  return string(value, name, max);
}
function stringList(value, name, maxItems = MAX_LIST, maxLen = 500) {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value) || value.length > maxItems) fail(`${name} must be an array of at most ${maxItems} items`);
  return value.map((v, i) => string(v, `${name}[${i}]`, maxLen));
}
function timestamp(value, name) { if (!Number.isSafeInteger(value) || value < 0) fail(`${name} must be a nonnegative safe integer`); return value; }
function id(value) { return string(value, 'id', 200); }

function perspective(input) {
  object(input, ['text', 'source', 'createdAt'], 'perspective');
  if (!['user', 'ai'].includes(input.source)) fail('perspective.source must be user or ai');
  return { text: string(input.text, 'perspective text', 1000), source: input.source, createdAt: timestamp(input.createdAt, 'createdAt') };
}

function typeField(value) {
  if (value === undefined || value === null || value === '') return 'knowledge';
  if (!['knowledge', 'plan'].includes(value)) fail('type must be knowledge or plan');
  return value;
}
function entry(input) {
  object(input, ['id', 'type', 'title', 'domain', 'tags', 'summary', 'axioms', 'elements', 'conclusions', 'perspectives', 'related', 'createdAt', 'updatedAt'], 'entry');
  const result = {
    id: id(input.id),
    type: typeField(input.type),
    title: string(input.title, 'title', 200),
    domain: optionalString(input.domain, 'domain', 50),
    tags: stringList(input.tags, 'tags', MAX_TAGS, 50).map(t => t.trim()).filter(Boolean),
    summary: optionalString(input.summary, 'summary', 500).trim(),
    axioms: stringList(input.axioms, 'axioms', MAX_LIST, 500).map(t => t.trim()),
    elements: stringList(input.elements, 'elements', MAX_LIST, 500).map(t => t.trim()),
    conclusions: stringList(input.conclusions, 'conclusions', MAX_LIST, 500).map(t => t.trim()),
    related: stringList(input.related, 'related', MAX_RELATED, 200).map(t => t.trim()),
    createdAt: timestamp(input.createdAt, 'createdAt'),
    updatedAt: timestamp(input.updatedAt, 'updatedAt'),
  };
  if (!Array.isArray(input.perspectives) || input.perspectives.length > MAX_PERSPECTIVES) fail('perspectives must be an array of at most 200 items');
  result.perspectives = input.perspectives.map(perspective);
  if (result.updatedAt < result.createdAt) fail('updatedAt must not precede createdAt');
  return result;
}

function empty() { return { version: 1, revision: 0, entries: [] }; }
function validateState(state) {
  object(state, ['version', 'revision', 'entries'], 'store');
  if (state.version !== 1) fail('Unsupported store version');
  timestamp(state.revision, 'revision');
  if (!Array.isArray(state.entries) || state.entries.length > MAX_ENTRIES) fail('Invalid stored entries');
  state.entries = state.entries.map(entry);
  const ids = new Set();
  for (const e of state.entries) {
    if (ids.has(e.id)) fail('Duplicate entry id');
    ids.add(e.id);
  }
  return state;
}

const FIELDS = ['type', 'title', 'domain', 'tags', 'summary', 'axioms', 'elements', 'conclusions', 'related'];
function fields(input) {
  return {
    type: typeField(input.type),
    title: string(input.title, 'title', 200),
    domain: optionalString(input.domain, 'domain', 50),
    tags: stringList(input.tags, 'tags', MAX_TAGS, 50).map(t => t.trim()).filter(Boolean),
    summary: optionalString(input.summary, 'summary', 500).trim(),
    axioms: stringList(input.axioms, 'axioms', MAX_LIST, 500).map(t => t.trim()),
    elements: stringList(input.elements, 'elements', MAX_LIST, 500).map(t => t.trim()),
    conclusions: stringList(input.conclusions, 'conclusions', MAX_LIST, 500).map(t => t.trim()),
    related: stringList(input.related, 'related', MAX_RELATED, 200).map(t => t.trim()),
  };
}

const brief = e => ({ id: e.id, type: e.type, title: e.title, domain: e.domain, tags: e.tags, summary: e.summary, createdAt: e.createdAt, updatedAt: e.updatedAt });

function matchesQuery(e, query) {
  const q = query.toLowerCase();
  const hay = [e.title, e.domain, e.summary, ...e.tags, ...e.axioms, ...e.elements, ...e.conclusions, ...e.perspectives.map(p => p.text)].join('\n').toLowerCase();
  return hay.includes(q);
}

function renderMarkdown(e) {
  const isPlan = e.type === 'plan';
  const hAxioms = isPlan ? '目标 / 原则' : '前提 / 公理';
  const hElements = isPlan ? '现状 / 约束' : '基本事实 / 要素';
  const hConclusions = isPlan ? '执行步骤' : '推导结论';
  const lines = [`# ${e.title}`, ''];
  const meta = [];
  if (e.domain) meta.push(e.domain);
  meta.push(`${isPlan ? '计划' : '知识'} · 更新于 ${new Date(e.updatedAt).toISOString().slice(0, 10)}`);
  lines.push(`> ${meta.join(' · ')}`, '');
  if (e.summary) lines.push(e.summary, '');
  if (e.axioms.length) { lines.push(`## ${hAxioms}`); for (const t of e.axioms) lines.push(`- ${t}`); lines.push(''); }
  if (e.elements.length) { lines.push(`## ${hElements}`); for (const t of e.elements) lines.push(`- ${t}`); lines.push(''); }
  if (e.conclusions.length) { lines.push(`## ${hConclusions}`); for (const t of e.conclusions) lines.push(`- ${t}`); lines.push(''); }
  if (isPlan && e.conclusions.length) { lines.push('## 打卡清单'); for (const t of e.conclusions) lines.push(`- [ ] ${t}`); lines.push(''); }
  if (e.related.length) lines.push(`关联：${e.related.join('、')}`, '');
  return lines.join('\n');
}

export class KnowledgeStore {
  constructor({ filePath, now = () => new Date() } = {}) {
    if (typeof filePath !== 'string' || !filePath.trim() || filePath.includes('\0')) fail('filePath is required');
    if (typeof now !== 'function') fail('now must be a function returning Date');
    this.filePath = path.resolve(filePath); this.now = now;
  }
  _clock() {
    const d = this.now();
    if (!(d instanceof Date) || !Number.isFinite(d.getTime())) fail('now must return a valid Date');
    timestamp(d.getTime(), 'current time');
    const today = `${String(d.getFullYear()).padStart(4, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    return { today, timestamp: d.getTime() };
  }
  _run(fn) {
    const previous = queues.get(this.filePath) ?? Promise.resolve();
    const pending = previous.catch(() => {}).then(async () => {
      let state;
      try { state = validateState(JSON.parse(await fs.readFile(this.filePath, 'utf8'))); }
      catch (e) { if (e.code === 'ENOENT') state = empty(); else throw e; }
      return fn(state);
    });
    queues.set(this.filePath, pending);
    pending.finally(() => { if (queues.get(this.filePath) === pending) queues.delete(this.filePath); }).catch(() => {});
    return pending;
  }
  async _save(state) {
    if (state.revision === Number.MAX_SAFE_INTEGER) fail('Revision exhausted');
    state.revision++;
    validateState(state);
    const dir = path.dirname(this.filePath);
    await fs.mkdir(dir, { recursive: true });
    const temp = path.join(dir, `.${path.basename(this.filePath)}.${randomUUID()}.tmp`);
    let handle;
    try {
      handle = await fs.open(temp, 'wx', 0o600);
      await handle.writeFile(JSON.stringify(state, null, 2) + '\n', 'utf8');
      await handle.sync(); await handle.close(); handle = null;
      await fs.rename(temp, this.filePath);
    } finally {
      if (handle) await handle.close();
      try { await fs.unlink(temp); } catch (e) { if (e.code !== 'ENOENT') throw e; }
    }
  }
  _revision(state, value) {
    timestamp(value, 'expectedRevision');
    if (state.revision !== value) throw new StoreError('REVISION_CONFLICT', 'State changed; reload before retrying', { currentRevision: state.revision });
  }
  _snapshot(state) {
    return clone({ revision: state.revision, serverToday: this._clock().today, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, entries: state.entries });
  }
  snapshot() { return this._run(state => this._snapshot(state)); }
  list() { return this._run(state => clone({ revision: state.revision, entries: state.entries.map(brief) })); }
  get(input) {
    return this._run(state => {
      object(input, ['id']); const wanted = id(input.id);
      const found = state.entries.find(e => e.id === wanted);
      if (!found) throw new StoreError('NOT_FOUND', 'Knowledge point not found');
      return clone({ revision: state.revision, entry: found });
    });
  }
  output(input) {
    return this._run(state => {
      object(input, ['id']);
      const wanted = id(input.id);
      const found = state.entries.find(e => e.id === wanted);
      if (!found) throw new StoreError('NOT_FOUND', 'Knowledge point not found');
      return clone({ revision: state.revision, markdown: renderMarkdown(found) });
    });
  }
  search(input) {
    return this._run(state => {
      object(input, ['query', 'domain']);
      const query = typeof input.query === 'string' ? input.query.trim() : '';
      const domain = typeof input.domain === 'string' ? input.domain.trim() : '';
      const q = query.toLowerCase();
      let entries = state.entries;
      if (domain) entries = entries.filter(e => e.domain === domain);
      if (q) entries = entries.filter(e => matchesQuery(e, q));
      return clone({ revision: state.revision, entries: entries.map(brief) });
    });
  }
  domains() {
    return this._run(state => {
      const counts = new Map();
      for (const e of state.entries) { const d = e.domain || '未分类'; counts.set(d, (counts.get(d) || 0) + 1); }
      return clone([...counts.entries()].sort((a, b) => b[1] - a[1]).map(([domain, count]) => ({ domain, count })));
    });
  }
  add(input) {
    return this._run(async state => {
      object(input, [...FIELDS, 'expectedRevision']); this._revision(state, input.expectedRevision);
      const clock = this._clock(), details = fields(input);
      if (state.entries.length >= MAX_ENTRIES) fail('Knowledge point limit reached');
      const record = { id: randomUUID(), ...details, perspectives: [], createdAt: clock.timestamp, updatedAt: clock.timestamp };
      state.entries.push(record); await this._save(state);
      return clone({ revision: state.revision, entry: record });
    });
  }
  update(input) {
    return this._run(async state => {
      object(input, ['id', 'patch', 'expectedRevision']); this._revision(state, input.expectedRevision);
      const wanted = id(input.id);
      object(input.patch, FIELDS, 'patch');
      const record = state.entries.find(e => e.id === wanted);
      if (!record) throw new StoreError('NOT_FOUND', 'Knowledge point not found');
      const clock = this._clock();
      const patch = fields({ ...record, ...input.patch });
      for (const key of FIELDS) if (Object.hasOwn(input.patch, key)) record[key] = patch[key];
      record.updatedAt = clock.timestamp;
      if (record.updatedAt < record.createdAt) record.updatedAt = record.createdAt;
      await this._save(state);
      return clone({ revision: state.revision, entry: record });
    });
  }
  addPerspective(input) {
    return this._run(async state => {
      object(input, ['id', 'text', 'source', 'expectedRevision']); this._revision(state, input.expectedRevision);
      const wanted = id(input.id);
      const record = state.entries.find(e => e.id === wanted);
      if (!record) throw new StoreError('NOT_FOUND', 'Knowledge point not found');
      if (record.perspectives.length >= MAX_PERSPECTIVES) fail('Perspective limit reached');
      const clock = this._clock();
      const p = perspective({ text: input.text, source: input.source ?? 'ai', createdAt: clock.timestamp });
      record.perspectives.push(p);
      record.updatedAt = clock.timestamp;
      await this._save(state);
      return clone({ revision: state.revision, entry: record });
    });
  }
  remove(input) {
    return this._run(async state => {
      object(input, ['ids', 'expectedRevision']); this._revision(state, input.expectedRevision);
      if (!Array.isArray(input.ids) || input.ids.length > MAX_ENTRIES) fail('ids must be an array of at most 10000 ids');
      const requested = input.ids.map(id);
      const known = new Set(state.entries.map(e => e.id));
      if (requested.some(x => !known.has(x))) throw new StoreError('NOT_FOUND', 'Knowledge point not found');
      if (!requested.length) return this._snapshot(state);
      const removed = new Set(requested);
      state.entries = state.entries.filter(e => !removed.has(e.id));
      // Drop dangling references to removed entries.
      for (const e of state.entries) e.related = e.related.filter(t => state.entries.some(x => x.title === t));
      await this._save(state); return clone({ revision: state.revision, removedIds: [...requested] });
    });
  }
  exportMarkdown() {
    return this._run(state => {
      const lines = [`# 知识点百科（${state.entries.length} 条）`, ''];
      for (const e of state.entries) {
        lines.push(`## ${e.title}`);
        if (e.domain) lines.push(`- 领域：${e.domain}`);
        if (e.tags.length) lines.push(`- 标签：${e.tags.join('、')}`);
        if (e.summary) lines.push(`- 概述：${e.summary}`);
        if (e.axioms.length) { lines.push('', '### 前提 / 公理'); for (const t of e.axioms) lines.push(`- ${t}`); }
        if (e.elements.length) { lines.push('', '### 基本事实 / 要素'); for (const t of e.elements) lines.push(`- ${t}`); }
        if (e.conclusions.length) { lines.push('', '### 推导结论'); for (const t of e.conclusions) lines.push(`- ${t}`); }
        if (e.perspectives.length) { lines.push('', '### 角度 / 诠释'); for (const p of e.perspectives) lines.push(`- [${p.source === 'user' ? '用户' : 'AI'}] ${p.text}`); }
        if (e.related.length) lines.push('', `- 关联：${e.related.join('、')}`);
        const d = new Date(e.updatedAt).toISOString().slice(0, 10);
        lines.push('', `> 更新于 ${d}`, '');
      }
      return { revision: state.revision, markdown: lines.join('\n') };
    });
  }
}
export default KnowledgeStore;
