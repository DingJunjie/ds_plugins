import { promises as fs } from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

const MAX_BYTES = 8 * 1024 * 1024;
const MAX_ITEMS = 10000;
const own = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
function fail(message, code = 'VALIDATION_ERROR') { const e = new Error(message); e.code = code; throw e; }
function object(value, keys, name = 'input') {
  if (!value || typeof value !== 'object' || Array.isArray(value) || ![Object.prototype, null].includes(Object.getPrototypeOf(value))) fail(`${name} must be an object`);
  for (const key of Object.keys(value)) if (!keys.includes(key)) fail(`Unknown ${name} field: ${key}`);
}
function text(v, name, max, empty = false) {
  if (typeof v !== 'string' || v.length > max || (!empty && !v.trim()) || v.includes('\0')) fail(`Invalid ${name}`);
  return v;
}
function bool(v, name) { if (typeof v !== 'boolean') fail(`${name} must be boolean`); return v; }
function integer(v, name, min = 0, max = Number.MAX_SAFE_INTEGER) {
  if (!Number.isSafeInteger(v) || v < min || v > max) fail(`Invalid ${name}`); return v;
}
function id(v) { if (typeof v !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9_-]{0,127}$/.test(v)) fail('Invalid id'); return v; }
function timestamp(v, name) {
  if (typeof v !== 'string') fail(`Invalid ${name}: timezone ISO timestamp required`);
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,3}))?(Z|([+-])(\d{2}):(\d{2}))$/.exec(v);
  if (!m) fail(`Invalid ${name}: timezone ISO timestamp required`);
  const [y, mo, d, h, mi, s] = m.slice(1, 7).map(Number);
  const leap = y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0);
  const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (y < 1 || mo < 1 || mo > 12 || d < 1 || d > days[mo - 1] || h > 23 || mi > 59 || s > 59 || (m[8] !== 'Z' && (Number(m[10]) > 14 || Number(m[11]) > 59 || (Number(m[10]) === 14 && Number(m[11]) !== 0))) || !Number.isFinite(Date.parse(v))) fail(`Invalid ${name}`);
  return v;
}
function tags(v) {
  if (!Array.isArray(v) || v.length > 20) fail('Invalid tags');
  const result = v.map(x => text(x, 'tag', 50));
  if (new Set(result).size !== result.length) fail('Duplicate tags');
  return result;
}
const METRIC_UNITS = { water: ['count', 'ml'], exercise: ['min'], weight: ['kg'], sleep: ['hour'], food: ['g'] };
function number(v, name, max = 10000000) {
  if (typeof v !== 'number' || !Number.isFinite(v) || v <= 0 || v > max) fail(`Invalid ${name}`); return v;
}
function metrics(v = []) {
  if (!Array.isArray(v) || v.length > 30) fail('Invalid metrics');
  return v.map(m => {
    object(m, ['kind', 'value', 'unit', 'label'], 'metric');
    if (!own(METRIC_UNITS, m.kind) || !METRIC_UNITS[m.kind].includes(m.unit)) fail('Invalid metric dimension');
    const result = { kind: m.kind, value: number(m.value, 'metric value'), unit: m.unit };
    if (m.unit === 'count') integer(m.value, 'metric count', 1, 10000);
    if (m.label !== undefined) result.label = text(m.label, 'metric label', 200, true);
    return result;
  });
}
function analysis(v = null) {
  if (v === null) return null;
  object(v, ['status', 'summary', 'model', 'analyzedAt', 'error'], 'analysis');
  if (!['pending', 'done', 'failed'].includes(v.status)) fail('Invalid analysis status');
  const result = { status: v.status, summary: text(v.summary === undefined ? '' : v.summary, 'analysis summary', 4000, true) };
  if (v.model !== undefined) result.model = text(v.model, 'analysis model', 200, true);
  if (v.analyzedAt !== undefined) result.analyzedAt = timestamp(v.analyzedAt, 'analyzedAt');
  if (v.error !== undefined) result.error = text(v.error, 'analysis error', 2000, true);
  return result;
}
function goal(v = null) {
  if (v === null) return null;
  object(v, ['metric', 'target', 'unit'], 'goal');
  const units = { water_ml: 'ml', exercise_min: 'min', weight_kg: 'kg', sleep_hour: 'hour' };
  if (!own(units, v.metric) || (v.unit !== undefined && v.unit !== units[v.metric])) fail('Invalid goal dimension');
  return { metric: v.metric, target: number(v.target, 'goal target'), unit: units[v.metric] };
}
const RECORD_KEYS = ['id', 'content', 'occurredAt', 'recordedAt', 'updatedAt', 'category', 'tags', 'source', 'sensitive'];
const RECORD_OPTIONAL = ['metrics', 'analysis', 'project', 'activity'];
const PROFILE_OPTIONAL = ['group', 'kind', 'evidence', 'confidence', 'goal', 'section'];
const APPEARANCE_SECTIONS = ['fat_loss', 'skincare', 'style', 'posture', 'other'];
const RECORD_PROJECTS = ['appearance', 'other'];
const RECORD_ACTIVITIES = ['nutrition', 'exercise', 'skincare', 'posture', 'style', 'weight', 'other'];
const DAILY_MAX = 10000;
const DAILY_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
function dailyDate(v, name = 'date') {
  if (typeof v !== 'string' || !DAILY_DATE_RE.test(v)) fail(`Invalid ${name}`);
  const [y,m,d] = v.split('-').map(Number); const dt = new Date(`${v}T00:00:00Z`);
  if (!Number.isFinite(dt.getTime()) || dt.getUTCFullYear() !== y || dt.getUTCMonth() + 1 !== m || dt.getUTCDate() !== d) fail(`Invalid ${name}`);
  return v;
}
function dailyItem(v) {
  object(v, ['id','text','createdAt','updatedAt','active','doneDates'], 'daily item');
  for (const key of ['id','text','createdAt','updatedAt','active','doneDates']) if (!own(v,key)) fail(`Missing daily item field: ${key}`);
  if (!Array.isArray(v.doneDates) || v.doneDates.length > 1000) fail('Invalid doneDates');
  const doneDates = v.doneDates.map(x => dailyDate(x, 'done date'));
  if (new Set(doneDates).size !== doneDates.length) fail('Duplicate done date');
  return { id:id(v.id), text:text(v.text,'daily text',500), createdAt:timestamp(v.createdAt,'createdAt'), updatedAt:timestamp(v.updatedAt,'updatedAt'), active:bool(v.active,'active'), doneDates };
}
const REVIEW_KEYS = ['id', 'date', 'summary', 'analysis', 'analysisSource', 'createdAt', 'updatedAt', 'sensitive', 'sourceIds', 'status'];
function review(v) {
  object(v, REVIEW_KEYS, 'review');
  for (const key of REVIEW_KEYS) if (!own(v, key)) fail(`Missing review field: ${key}`);
  const explanation = v.analysis === null ? null : text(v.analysis, 'review analysis', 10000);
  if (![null, 'user', 'ai'].includes(v.analysisSource)) fail('Invalid review analysisSource');
  if ((explanation === null) !== (v.analysisSource === null)) fail('Review analysis and analysisSource must be supplied together');
  if (!Array.isArray(v.sourceIds) || v.sourceIds.length > 200) fail('Invalid review sourceIds');
  const sourceIds = v.sourceIds.map(id);
  if (new Set(sourceIds).size !== sourceIds.length) fail('Duplicate review source id');
  if (!['draft', 'confirmed'].includes(v.status)) fail('Invalid review status');
  return { id:id(v.id), date:dailyDate(v.date,'review date'), summary:text(v.summary,'review summary',20000), analysis:explanation, analysisSource:v.analysisSource, createdAt:timestamp(v.createdAt,'review createdAt'), updatedAt:timestamp(v.updatedAt,'review updatedAt'), sensitive:bool(v.sensitive,'review sensitive'), sourceIds, status:v.status };
}
const PROFILE_KEYS = ['id', 'content', 'source', 'sensitive', 'includeInContext', 'status', 'recordedAt', 'confirmedAt', 'updatedAt'];
function record(v) {
  object(v, [...RECORD_KEYS, ...RECORD_OPTIONAL], 'record');
  for (const key of RECORD_KEYS) if (!own(v, key)) fail(`Missing record field: ${key}`);
  const project = v.project === undefined || v.project === null ? null : text(v.project, 'project', 50);
  const activity = v.activity === undefined || v.activity === null ? null : text(v.activity, 'activity', 50);
  if (project !== null && !RECORD_PROJECTS.includes(project)) fail('Invalid project');
  if (activity !== null && !RECORD_ACTIVITIES.includes(activity)) fail('Invalid activity');
  return { id: id(v.id), content: text(v.content, 'content', 20000), occurredAt: timestamp(v.occurredAt, 'occurredAt'), recordedAt: timestamp(v.recordedAt, 'recordedAt'), updatedAt: timestamp(v.updatedAt, 'updatedAt'), category: text(v.category, 'category', 100, true), tags: tags(v.tags), source: text(v.source, 'source', 100), sensitive: bool(v.sensitive, 'sensitive'), metrics: metrics(v.metrics), analysis: analysis(v.analysis), project, activity };
}
function profile(v) {
  object(v, [...PROFILE_KEYS, ...PROFILE_OPTIONAL], 'profile');
  for (const key of PROFILE_KEYS) if (!own(v, key)) fail(`Missing profile field: ${key}`);
  if (!['active', 'outdated', 'unknown'].includes(v.status)) fail('Invalid status');
  const group = v.group === undefined ? 'other' : v.group;
  const section = v.section === undefined ? 'other' : v.section;
  const kind = v.kind === undefined ? 'self_report' : v.kind;
  const confidence = kind === 'observation' ? 'tentative' : (v.confidence === undefined ? 'confirmed' : v.confidence);
  if (!['basic', 'personality', 'mbti', 'goal', 'appearance', 'other'].includes(group)) fail('Invalid profile group');
  if (!APPEARANCE_SECTIONS.includes(section)) fail('Invalid profile section');
  if (!['self_report', 'assessment', 'observation'].includes(kind)) fail('Invalid profile kind');
  if (v.confidence !== undefined && !['tentative', 'moderate', 'confirmed'].includes(v.confidence)) fail('Invalid profile confidence');
  return { id: id(v.id), content: text(v.content, 'content', 10000), source: text(v.source, 'source', 100), sensitive: bool(v.sensitive, 'sensitive'), includeInContext: bool(v.includeInContext, 'includeInContext'), status: v.status, recordedAt: timestamp(v.recordedAt, 'recordedAt'), confirmedAt: timestamp(v.confirmedAt, 'confirmedAt'), updatedAt: timestamp(v.updatedAt, 'updatedAt'), group, section, kind, evidence: text(v.evidence === undefined ? '' : v.evidence, 'profile evidence', 4000, true), confidence, goal: goal(v.goal) };
}
function validateState(value) {
  object(value, ['version', 'revision', 'records', 'profiles', 'dailyItems', 'reviews'], 'backup');
  if (value.version !== 1) fail('Unsupported backup version');
  integer(value.revision, 'revision');
  for (const key of ['records', 'profiles']) if (!Array.isArray(value[key]) || value[key].length > MAX_ITEMS) fail(`Invalid ${key}`);
  if (value.dailyItems !== undefined && (!Array.isArray(value.dailyItems) || value.dailyItems.length > DAILY_MAX)) fail('Invalid dailyItems');
  const state = { version: 1, revision: value.revision, records: value.records.map(record), profiles: value.profiles.map(profile) };
  // Old version-1 snapshots are read without adding a new key until a daily item exists.
  if (value.dailyItems !== undefined) state.dailyItems = value.dailyItems.map(dailyItem);
  if (value.reviews !== undefined) {
    if (!Array.isArray(value.reviews) || value.reviews.length > MAX_ITEMS) fail('Invalid reviews');
    state.reviews = value.reviews.map(review);
  }
  const ids = new Set();
  for (const item of [...state.records, ...state.profiles, ...(state.dailyItems ?? []), ...(state.reviews ?? [])]) { if (ids.has(item.id)) fail('Duplicate backup id'); ids.add(item.id); }
  return state;
}
function parse(data) {
  if (typeof data !== 'string' || Buffer.byteLength(data) > MAX_BYTES) fail('Backup exceeds size limit or is not text');
  let value;
  try { value = JSON.parse(data, (key, v) => { if (['__proto__', 'prototype', 'constructor'].includes(key)) fail('Unsafe JSON key'); return v; }); }
  catch (error) { fail(`Invalid JSON: ${error.message}`); }
  return validateState(value);
}
function filters(input = {}, extra = []) {
  object(input, ['query', 'category', 'from', 'to', 'limit', 'offset', 'project', ...extra]);
  const f = { limit: input.limit === undefined ? 50 : integer(input.limit, 'limit', 1, 100), offset: input.offset === undefined ? 0 : integer(input.offset, 'offset', 0, MAX_ITEMS) };
  if (input.query !== undefined) f.query = text(input.query, 'query', 1000, true).toLocaleLowerCase();
  if (input.category !== undefined) f.category = text(input.category, 'category', 100, true);
  if (input.project !== undefined) { f.project = text(input.project, 'project', 50); if (!RECORD_PROJECTS.includes(f.project)) fail('Invalid project'); }
  if (input.from !== undefined) f.from = Date.parse(timestamp(input.from, 'from'));
  if (input.to !== undefined) f.to = Date.parse(timestamp(input.to, 'to'));
  if (input.project !== undefined) f.project = text(input.project, 'project', 50, true);
  if (f.from !== undefined && f.to !== undefined && f.from > f.to) fail('from must not exceed to');
  return f;
}
function select(state, f, includeSensitive = true) {
  return state.records.filter(r => (includeSensitive || !r.sensitive) && (f.project === undefined || r.project === f.project) && (f.category === undefined || r.category === f.category) && (f.from === undefined || Date.parse(r.occurredAt) >= f.from) && (f.to === undefined || Date.parse(r.occurredAt) <= f.to) && (f.project === undefined || r.project === f.project) && (!f.query || [r.content, r.category, ...r.tags].join('\n').toLocaleLowerCase().includes(f.query))).sort((a, b) => Date.parse(b.occurredAt) - Date.parse(a.occurredAt) || a.id.localeCompare(b.id));
}
const safeProfiles = (state, includeSensitive) => state.profiles.filter(p => includeSensitive || (!p.sensitive && p.includeInContext));

/** Local text-only personal data store. Every public method returns a Promise. */
export class MeStore {
  constructor(options = {}) {
    object(options, ['filePath']);
    const { filePath } = options;
    text(filePath, 'filePath', 4096);
    this.filePath = path.resolve(filePath);
    this.lockPath = `${this.filePath}.lock`;
  }
  async _read() {
    try {
      const stat = await fs.lstat(this.filePath);
      if (!stat.isFile() || stat.isSymbolicLink() || stat.size > MAX_BYTES) fail('Unsafe or oversized store file', 'CORRUPT_STORE');
      return parse(await fs.readFile(this.filePath, 'utf8'));
    } catch (e) {
      if (e.code === 'ENOENT') return { version: 1, revision: 0, records: [], profiles: [] };
      if (e.code === 'VALIDATION_ERROR') fail(`Store is corrupt: ${e.message}`, 'CORRUPT_STORE');
      throw e;
    }
  }
  async _write(state) {
    const data = JSON.stringify(validateState(state), null, 2) + '\n';
    if (Buffer.byteLength(data) > MAX_BYTES) fail('Store exceeds size limit');
    const tmp = `${this.filePath}.${randomUUID()}.tmp`;
    let handle;
    try {
      handle = await fs.open(tmp, 'wx', 0o600);
      await handle.writeFile(data, 'utf8'); await handle.sync(); await handle.close(); handle = null;
      await fs.rename(tmp, this.filePath);
      const dir = await fs.open(path.dirname(this.filePath), 'r');
      try { await dir.sync(); } finally { await dir.close(); }
    } finally { if (handle) await handle.close(); await fs.unlink(tmp).catch(e => { if (e.code !== 'ENOENT') throw e; }); }
  }
  async _mutate(expectedRevision, required, change) {
    if (required || expectedRevision !== undefined) integer(expectedRevision, 'expectedRevision');
    await fs.mkdir(path.dirname(this.filePath), { recursive: true, mode: 0o700 });
    let lock;
    const deadline = Date.now() + 5000;
    while (!lock) {
      try { lock = await fs.open(this.lockPath, 'wx', 0o600); }
      catch (e) {
        if (e.code !== 'EEXIST') throw e;
        if (Date.now() >= deadline) fail('Store is locked; a crashed writer may require manual lock removal after confirming no writer is active', 'STORE_LOCKED');
        await new Promise(resolve => setTimeout(resolve, 15 + Math.random() * 25));
      }
    }
    try {
      await lock.writeFile(JSON.stringify({ pid: process.pid, createdAt: new Date().toISOString() }));
      const state = await this._read();
      if (expectedRevision !== undefined && state.revision !== expectedRevision) fail(`Revision conflict: expected ${expectedRevision}, actual ${state.revision}`, 'REVISION_CONFLICT');
      const result = change(state);
      if (!result.noChange) { state.revision = integer(state.revision + 1, 'revision'); await this._write(state); }
      return { revision: state.revision, ...result.value };
    } finally { await lock.close(); await fs.unlink(this.lockPath); }
  }
  async snapshot() { return this._read(); }
  async dailyList(input) {
    object(input, ['date']); const date = dailyDate(input.date); const state = await this._read();
    return { revision: state.revision, date, items: (state.dailyItems ?? []).filter(item => item.active).map(item => ({...item, done:item.doneDates.includes(date)})) };
  }
  async dailyAdd(input) {
    object(input, ['text','expectedRevision']); const content=text(input.text,'daily text',500);
    return this._mutate(input.expectedRevision, true, state => {
      const items=state.dailyItems ?? (state.dailyItems=[]);
      if (items.length>=DAILY_MAX) fail('Daily item limit exceeded');
      const now=new Date().toISOString(); const item=dailyItem({id:randomUUID(),text:content,createdAt:now,updatedAt:now,active:true,doneDates:[]});
      items.push(item); return {value:{item}};
    });
  }
  async dailyUpdate(input) {
    object(input, ['id','expectedRevision','text','active','date','done']); id(input.id);
    if (input.text === undefined && input.active === undefined && input.done === undefined) fail('Empty daily update');
    if ((input.date === undefined) !== (input.done === undefined)) fail('date and done must be supplied together');
    const nextText = input.text === undefined ? undefined : text(input.text,'daily text',500);
    const active = input.active === undefined ? undefined : bool(input.active,'active');
    const date = input.date === undefined ? undefined : dailyDate(input.date);
    const done = input.done === undefined ? undefined : bool(input.done,'done');
    return this._mutate(input.expectedRevision, true, state => {
      const items = state.dailyItems ?? []; const index = items.findIndex(item => item.id === input.id);
      if (index < 0) fail('Daily item not found','NOT_FOUND');
      const prior=items[index]; const dates=[...prior.doneDates];
      if (done !== undefined) { const at=dates.indexOf(date); if (done && at<0) { if (dates.length>=1000) fail('Daily completion history limit exceeded'); dates.push(date); dates.sort(); } else if (!done && at>=0) dates.splice(at,1); }
      const item=dailyItem({...prior,...(nextText === undefined ? {} : {text:nextText}),...(active === undefined ? {} : {active}),doneDates:dates,updatedAt:new Date().toISOString()});
      items[index]=item; return {value:{item}};
    });
  }
  async dailyRemove(input) {
    object(input, ['id','expectedRevision']); id(input.id);
    return this._mutate(input.expectedRevision, true, state => {
      const items=state.dailyItems ?? []; const index=items.findIndex(item=>item.id===input.id);
      if (index<0) fail('Daily item not found','NOT_FOUND');
      const [item]=items.splice(index,1); return {value:{item}};
    });
  }
  async reviewList(input = {}) {
    object(input, ['from', 'to', 'includeSensitive', 'limit', 'offset']);
    const from = input.from === undefined ? undefined : dailyDate(input.from, 'review from');
    const to = input.to === undefined ? undefined : dailyDate(input.to, 'review to');
    if (from !== undefined && to !== undefined && from > to) fail('from must not exceed to');
    const include = input.includeSensitive === undefined ? false : bool(input.includeSensitive, 'includeSensitive');
    const limit = input.limit === undefined ? 50 : integer(input.limit, 'limit', 1, 100);
    const offset = input.offset === undefined ? 0 : integer(input.offset, 'offset', 0, MAX_ITEMS);
    const state = await this._read();
    const reviews = (state.reviews ?? []).filter(item => (include || !item.sensitive) && (from === undefined || item.date >= from) && (to === undefined || item.date <= to)).sort((a,b) => b.date.localeCompare(a.date) || b.updatedAt.localeCompare(a.updatedAt) || a.id.localeCompare(b.id));
    return { revision:state.revision, total:reviews.length, reviews:reviews.slice(offset,offset+limit) };
  }
  async reviewGet(input) {
    object(input, ['id', 'includeSensitive']); id(input.id);
    const include = input.includeSensitive === undefined ? false : bool(input.includeSensitive, 'includeSensitive');
    const state = await this._read();
    return { revision:state.revision, review:(state.reviews ?? []).find(item => item.id === input.id && (include || !item.sensitive)) ?? null };
  }
  async reviewSave(input) {
    object(input, ['id', 'date', 'summary', 'analysis', 'analysisSource', 'sensitive', 'sourceIds', 'status', 'expectedRevision']);
    if (input.id !== undefined) id(input.id);
    dailyDate(input.date, 'review date'); text(input.summary, 'review summary', 20000);
    return this._mutate(input.expectedRevision, true, state => {
      const items = state.reviews ?? [];
      const index = input.id === undefined ? -1 : items.findIndex(item => item.id === input.id);
      if (input.id !== undefined && index < 0) fail('Review not found', 'NOT_FOUND');
      const previous = index < 0 ? {} : items[index];
      const now = new Date().toISOString();
      // A changed user account invalidates the previous interpretation unless explicitly replaced.
      const changed = previous.summary !== undefined && previous.summary !== input.summary;
      const nextAnalysis = input.analysis === undefined ? (changed ? null : (previous.analysis ?? null)) : input.analysis;
      const nextSource = input.analysisSource === undefined ? (nextAnalysis === null ? null : (changed ? null : (previous.analysisSource ?? null))) : input.analysisSource;
      const item = review({ id:previous.id ?? randomUUID(), date:input.date, summary:input.summary, analysis:nextAnalysis, analysisSource:nextSource, createdAt:previous.createdAt ?? now, updatedAt:now, sensitive:input.sensitive === undefined ? (previous.sensitive ?? false) : input.sensitive, sourceIds:input.sourceIds === undefined ? (previous.sourceIds ?? []) : input.sourceIds, status:input.status === undefined ? (changed ? 'draft' : (previous.status ?? 'draft')) : input.status });
      if (index < 0) { if (items.length >= MAX_ITEMS) fail('Review limit exceeded'); items.push(item); } else items[index] = item;
      state.reviews = items;
      return { value:{review:item} };
    });
  }
  async reviewDelete(input) {
    object(input, ['id', 'expectedRevision']); id(input.id);
    return this._mutate(input.expectedRevision, true, state => {
      const items = state.reviews ?? []; const index = items.findIndex(item => item.id === input.id);
      if (index < 0) fail('Review not found', 'NOT_FOUND');
      const [item] = items.splice(index,1);
      return { value:{review:item} };
    });
  }
  async exportReviewsMarkdown(input = {}) {
    object(input, ['from', 'to', 'includeSensitive']);
    const from = input.from === undefined ? undefined : dailyDate(input.from, 'review from');
    const to = input.to === undefined ? undefined : dailyDate(input.to, 'review to');
    if (from !== undefined && to !== undefined && from > to) fail('from must not exceed to');
    const include = input.includeSensitive === undefined ? false : bool(input.includeSensitive, 'includeSensitive');
    const state = await this._read();
    const reviews = (state.reviews ?? []).filter(item => (include || !item.sensitive) && (from === undefined || item.date >= from) && (to === undefined || item.date <= to)).sort((a,b) => b.date.localeCompare(a.date) || b.updatedAt.localeCompare(a.updatedAt));
    const lines = ['# Me 复盘', '', `Revision: ${state.revision}`, ''];
    for (const item of reviews) {
      lines.push(`## ${item.date}`, '', `- ID: ${item.id}`, `- 状态: ${item.status}`, `- 敏感: ${item.sensitive}`, `- 记录时间: ${item.createdAt}`, `- 更新时间: ${item.updatedAt}`, `- 依据记录: ${item.sourceIds.length ? item.sourceIds.join(', ') : '(无)'}`, '', '### 原始日记', '', item.summary, '', '### 复盘分析', '', item.analysis ?? '(尚未填写)', '', `- 分析来源: ${item.analysisSource ?? '(无)'}`, '');
    }
    return lines.join('\n');
  }
  async search(input = {}) {
    const f = filters(input, ['includeSensitive']); const include = input.includeSensitive === undefined ? false : bool(input.includeSensitive, 'includeSensitive');
    const state = await this._read(); const records = select(state, f, include);
    return { revision: state.revision, total: records.length, records: records.slice(f.offset, f.offset + f.limit) };
  }
  async get(input) {
    object(input, ['id']); id(input.id); const state = await this._read();
    return { revision: state.revision, record: state.records.find(r => r.id === input.id) ?? null };
  }
  async add(input) {
    object(input, ['content', 'occurredAt', 'category', 'tags', 'source', 'sensitive', 'expectedRevision', ...RECORD_OPTIONAL]);
    const now = new Date().toISOString();
    const item = record({ id: randomUUID(), content: input.content, occurredAt: input.occurredAt === undefined ? now : input.occurredAt, recordedAt: now, updatedAt: now, category: input.category === undefined ? '' : input.category, tags: input.tags === undefined ? [] : input.tags, source: input.source === undefined ? 'manual' : input.source, sensitive: input.sensitive === undefined ? false : input.sensitive, metrics: input.metrics, analysis: input.analysis, project: input.project, activity: input.activity });
    return this._mutate(input.expectedRevision, false, state => { if (state.records.length >= MAX_ITEMS) fail('Record limit exceeded'); state.records.push(item); return { value: { record: item } }; });
  }
  async update(input) {
    object(input, ['id', 'expectedRevision', 'patch']); id(input.id);
    object(input.patch, ['content', 'occurredAt', 'category', 'tags', 'source', 'sensitive', ...RECORD_OPTIONAL], 'patch');
    if (!Object.keys(input.patch).length) fail('Empty patch');
    return this._mutate(input.expectedRevision, true, state => {
      const index = state.records.findIndex(r => r.id === input.id); if (index < 0) fail('Record not found', 'NOT_FOUND');
      const previous = state.records[index];
      const invalidated = input.patch.content !== undefined && input.patch.content !== previous.content ? { metrics: [], analysis: null } : {};
      const item = record({ ...previous, ...invalidated, ...input.patch, updatedAt: new Date().toISOString() }); state.records[index] = item;
      return { value: { record: item } };
    });
  }
  async remove(input) {
    object(input, ['id', 'expectedRevision']); id(input.id);
    return this._mutate(input.expectedRevision, true, state => {
      const index = state.records.findIndex(r => r.id === input.id); if (index < 0) fail('Record not found', 'NOT_FOUND');
      const [record] = state.records.splice(index, 1); return { value: { record } };
    });
  }
  async profileGet(input = {}) {
    object(input, ['includeSensitive']); const include = input.includeSensitive === undefined ? false : bool(input.includeSensitive, 'includeSensitive');
    const state = await this._read(); return { revision: state.revision, profiles: safeProfiles(state, include).filter(p => include || p.status === 'active') };
  }
  async profileSave(input) {
    object(input, ['id', 'expectedRevision', 'content', 'source', 'sensitive', 'includeInContext', 'status', ...PROFILE_OPTIONAL]);
    if (input.id !== undefined) id(input.id);
    return this._mutate(input.expectedRevision, true, state => {
      const index = input.id === undefined ? -1 : state.profiles.findIndex(p => p.id === input.id);
      if (input.id !== undefined && index < 0) fail('Profile not found', 'NOT_FOUND');
      const previous = index < 0 ? {} : state.profiles[index]; const now = new Date().toISOString();
      const sensitive = input.sensitive === undefined ? (previous.sensitive ?? false) : input.sensitive;
      const item = profile({ id: previous.id ?? randomUUID(), content: input.content, source: input.source === undefined ? (previous.source ?? 'manual') : input.source, sensitive, includeInContext: input.includeInContext === undefined ? (sensitive ? false : (previous.includeInContext ?? true)) : input.includeInContext, status: input.status === undefined ? (previous.status ?? 'active') : input.status, recordedAt: previous.recordedAt ?? now, confirmedAt: now, updatedAt: now, group: input.group === undefined ? (previous.group ?? 'other') : input.group, section: input.section === undefined ? (previous.section ?? 'other') : input.section, kind: input.kind === undefined ? (previous.kind ?? 'self_report') : input.kind, evidence: input.evidence === undefined ? (previous.evidence ?? '') : input.evidence, confidence: input.confidence === undefined ? (previous.confidence ?? 'confirmed') : input.confidence, goal: input.goal === undefined ? (previous.goal ?? null) : input.goal });
      if (index < 0) { if (state.profiles.length >= MAX_ITEMS) fail('Profile limit exceeded'); state.profiles.push(item); } else state.profiles[index] = item;
      return { value: { profile: item } };
    });
  }
  async appearanceGet(input = {}) {
    object(input, ['includeSensitive']);
    const include = input.includeSensitive === undefined ? false : bool(input.includeSensitive, 'includeSensitive');
    const state = await this._read();
    const profiles = safeProfiles(state, include).filter(p => p.group === 'appearance' && p.status === 'active');
    const records = state.records.filter(r => r.project === 'appearance' && (include || !r.sensitive)).sort((a,b)=>Date.parse(b.occurredAt)-Date.parse(a.occurredAt)).slice(0,50);
    const grouped = {};
    for (const section of APPEARANCE_SECTIONS) grouped[section] = profiles.filter(p => p.section === section);
    return { revision: state.revision, sections: grouped, profiles, records };
  }
  async profileRemove(input) {
    object(input, ['id', 'expectedRevision']); id(input.id);
    return this._mutate(input.expectedRevision, true, state => {
      const index = state.profiles.findIndex(p => p.id === input.id); if (index < 0) fail('Profile not found', 'NOT_FOUND');
      const [profile] = state.profiles.splice(index, 1); return { value: { profile } };
    });
  }
  async context(input = {}) {
    object(input, ['query', 'category', 'from', 'to', 'limit', 'offset', 'includeSensitive', 'maxChars']);
    const f = filters({ ...input, limit: input.limit === undefined ? 20 : input.limit }, ['includeSensitive', 'maxChars']);
    const include = input.includeSensitive === undefined ? false : bool(input.includeSensitive, 'includeSensitive');
    const maxChars = input.maxChars === undefined ? 12000 : integer(input.maxChars, 'maxChars', 256, 50000);
    const state = await this._read(); const matches = select(state, f, include);
    const result = { revision: state.revision, total: matches.length, records: [], profiles: [], sourceIds: [], truncated: false };
    let used = JSON.stringify(result).length;
    const append = (kind, item) => {
      const size = JSON.stringify(item).length + JSON.stringify(item.id).length + 4;
      if (used + size > maxChars) { result.truncated = true; return; }
      used += size; result[kind].push(item); result.sourceIds.push(item.id);
    };
    // Inactive profiles remain available to explicit profile reads, not current context.
    for (const p of safeProfiles(state, include).filter(p => p.status === 'active' && (!f.query || p.content.toLocaleLowerCase().includes(f.query)))) append('profiles', p);
    const page = matches.slice(f.offset, f.offset + f.limit);
    for (const r of page) append('records', r);
    if (matches.length > f.offset + f.limit || f.offset > 0) result.truncated = true;
    return result;
  }
  async stats(input = {}) {
    object(input, ['days', 'timeZone', 'includeSensitive']);
    const countDays = input.days === undefined ? 14 : integer(input.days, 'days', 1, 366);
    const timeZone = input.timeZone === undefined ? 'Asia/Shanghai' : text(input.timeZone, 'timeZone', 100);
    const include = input.includeSensitive === undefined ? false : bool(input.includeSensitive, 'includeSensitive');
    let formatter;
    try { formatter = new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }); formatter.format(); } catch { fail('Invalid timeZone'); }
    const state = await this._read(); const now = Date.now();
    const today = formatter.format(new Date());
    const dates = []; const cursor = new Date(`${today}T12:00:00Z`);
    for (let i = countDays - 1; i >= 0; i--) { const d = new Date(cursor); d.setUTCDate(cursor.getUTCDate() - i); dates.push(d.toISOString().slice(0,10)); }
    const days = dates.map(date => ({ date, waterCount: null, waterMl: null, exerciseMin: null, weightKg: null, sleepHour: null }));
    const byDate = new Map(days.map(d => [d.date, d])); let lastWaterAt = null; let lastMovementAt = null;
    for (const r of state.records) {
      if (!include && r.sensitive) continue;
      const when = Date.parse(r.occurredAt); if (when > now) continue;
      if (r.metrics.some(m => m.kind === 'water') && (!lastWaterAt || when > Date.parse(lastWaterAt))) lastWaterAt = r.occurredAt;
      if ((r.activity === 'exercise' || r.metrics.some(m => m.kind === 'exercise')) && (!lastMovementAt || when > Date.parse(lastMovementAt))) lastMovementAt = r.occurredAt;
      const day = byDate.get(formatter.format(new Date(when))); if (!day) continue;
      const water = r.metrics.filter(m => m.kind === 'water');
      if (water.length) day.waterCount = (day.waterCount ?? 0) + 1;
      for (const m of r.metrics) {
        if (m.kind === 'water') { if (m.unit === 'ml') day.waterMl = (day.waterMl ?? 0) + m.value; }
        else if (m.kind === 'exercise') day.exerciseMin = (day.exerciseMin ?? 0) + m.value;
        else if (m.kind === 'weight') day.weightKg = m.value;
        else if (m.kind === 'sleep') day.sleepHour = (day.sleepHour ?? 0) + m.value;
      }
    }
    return { revision: state.revision, timeZone, days, lastWaterAt, lastMovementAt, profiles: safeProfiles(state, include).filter(p => p.status === 'active') };
  }
  async exportMarkdown(input = {}) {
    const f = filters(input, ['includeSensitive']); const include = input.includeSensitive === undefined ? false : bool(input.includeSensitive, 'includeSensitive');
    const state = await this._read();
    // Local UI exports the complete selected range; tool callers supply an explicit bounded limit.
    const records = select(state, f, include).slice(f.offset, input.limit === undefined ? undefined : f.offset + f.limit);
    const lines = ['# Me records', '', `Revision: ${state.revision}`, ''];
    for (const r of records) lines.push(`## ${r.occurredAt}`, '', r.content, '', `- ID: ${r.id}`, `- Recorded: ${r.recordedAt}`, `- Updated: ${r.updatedAt}`, `- Category: ${r.category || '(none)'}`, `- Tags: ${r.tags.join(', ') || '(none)'}`, `- Source: ${r.source}`, `- Sensitive: ${r.sensitive}`, '');
    return lines.join('\n');
  }
  async exportBackup() { return JSON.stringify(await this._read(), null, 2) + '\n'; }
  async importBackup(input) {
    object(input, ['data', 'expectedRevision']); const imported = parse(input.data);
    return this._mutate(input.expectedRevision, true, state => {
      let addedRecords = 0; let addedProfiles = 0; let addedDailyItems = 0; let addedReviews = 0; let skipped = 0;
      const existing = new Map([...state.records, ...state.profiles, ...(state.dailyItems ?? []), ...(state.reviews ?? [])].map(item => [item.id, item]));
      for (const key of ['records', 'profiles', 'dailyItems', 'reviews']) for (const item of (imported[key] ?? [])) {
        const old = existing.get(item.id); const target = state[key] ?? (state[key]=[]);
        if (old) { if (!target.some(x => x.id === item.id) || JSON.stringify(old) !== JSON.stringify(item)) fail(`Import conflict for id ${item.id}`, 'IMPORT_CONFLICT'); skipped++; }
        else { target.push(item); existing.set(item.id, item); if (key === 'records') addedRecords++; else if (key === 'profiles') addedProfiles++; else if (key === 'dailyItems') addedDailyItems++; else addedReviews++; }
      }
      if (state.records.length > MAX_ITEMS || state.profiles.length > MAX_ITEMS || (state.dailyItems?.length ?? 0)>DAILY_MAX || (state.reviews?.length ?? 0)>MAX_ITEMS) fail('Import item limit exceeded');
      return { noChange: !addedRecords && !addedProfiles && !addedDailyItems && !addedReviews, value: { addedRecords, addedProfiles, ...(imported.dailyItems !== undefined || addedDailyItems ? {addedDailyItems} : {}), ...(imported.reviews !== undefined || addedReviews ? {addedReviews} : {}), skipped } };
    });
  }
}

export default MeStore;
