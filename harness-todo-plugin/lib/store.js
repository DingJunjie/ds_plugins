import { promises as fs } from 'node:fs';
import path from 'node:path';
import { createHash, randomUUID } from 'node:crypto';

// Serializes independent instances addressing the same file in this Node process.
// One Host process should own a store file; this is not an inter-process lock.
const queues = new Map();
const MAX_TASKS = 10000;
const MAX_PROPOSALS = 10000;
const clone = value => JSON.parse(JSON.stringify(value));
const hash = value => createHash('sha256').update(value).digest('hex');
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
function text(value) { return string(value, 'text').trim(); }
function priority(value) { if (!['high', 'mid', 'low'].includes(value)) fail('prio must be high, mid, or low'); return value; }
function date(value) {
  if (value === '') return value;
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value) || value.startsWith('0000') || !Number.isFinite(Date.parse(`${value}T00:00:00Z`)) || new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) !== value) fail('due must be a valid YYYY-MM-DD date or empty string');
  return value;
}
function timestamp(value, name) { if (!Number.isSafeInteger(value) || value < 0) fail(`${name} must be a nonnegative safe integer`); return value; }
function bool(value) { if (typeof value !== 'boolean') fail('done must be boolean'); return value; }
function ids(value) {
  if (!Array.isArray(value) || value.length > MAX_TASKS) fail('ids must be an array of at most 10000 ids');
  const result = value.map(v => string(v, 'id'));
  if (new Set(result).size !== result.length) fail('ids must be unique');
  return result;
}
function fields(input) { return { text: text(input.text), prio: priority(input.prio === undefined ? 'mid' : input.prio), due: date(input.due === undefined ? '' : input.due) }; }
function recurrence(input) {
  object(input, ['kind', 'days', 'start'], 'recurrence');
  if (!['daily', 'weekly'].includes(input.kind)) fail('recurrence.kind must be daily or weekly');
  if (!date(input.start)) fail('recurrence.start is required');
  if (input.kind === 'daily') {
    if (Object.hasOwn(input, 'days')) fail('recurrence.days is only allowed for weekly tasks');
    return { kind: 'daily', start: input.start };
  }
  if (!Array.isArray(input.days) || !input.days.length || input.days.some(d => !Number.isInteger(d) || d < 1 || d > 7) || new Set(input.days).size !== input.days.length) fail('weekly recurrence.days must be unique weekdays 1..7');
  return { kind: 'weekly', days: [...input.days].sort((a, b) => a - b), start: input.start };
}
function scheduled(rule, iso) {
  return iso >= rule.start && (rule.kind === 'daily' || rule.days.includes(new Date(`${iso}T12:00:00Z`).getUTCDay() || 7));
}
function nextOccurrence(rule, today) {
  let candidate = today < rule.start ? rule.start : today;
  for (let i = 0; i < 7; i++) {
    if (scheduled(rule, candidate)) return candidate;
    const d = new Date(`${candidate}T12:00:00Z`); d.setUTCDate(d.getUTCDate() + 1);
    candidate = d.toISOString().slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(candidate)) fail('Recurring date exceeds supported calendar range');
  }
  fail('Unable to find recurring occurrence');
}
function task(input) {
  object(input, ['id', 'text', 'done', 'prio', 'due', 'createdAt', 'completedAt', 'recurrence', 'completions'], 'task');
  const done = bool(input.done);
  const createdAt = timestamp(input.createdAt, 'createdAt');
  const completedAt = input.completedAt === null ? null : timestamp(input.completedAt, 'completedAt');
  if ((done && completedAt === null) || (!done && completedAt !== null)) fail('completedAt must match done');
  const result = { id: string(input.id, 'id'), text: text(input.text), done, prio: priority(input.prio), due: date(input.due), createdAt, completedAt };
  if (Object.hasOwn(input, 'recurrence')) {
    const rule = recurrence(input.recurrence);
    if (done || completedAt !== null || result.due !== '') fail('Recurring templates require done false, completedAt null and due empty');
    if (!input.completions || typeof input.completions !== 'object' || Array.isArray(input.completions)) fail('Recurring completions must be a date map');
    for (const [iso, time] of Object.entries(input.completions)) {
      if (!date(iso) || !scheduled(rule, iso)) fail('Completion date must be a scheduled occurrence');
      timestamp(time, 'completion timestamp');
    }
    result.recurrence = rule; result.completions = { ...input.completions };
  } else if (Object.hasOwn(input, 'completions')) fail('completions requires recurrence');
  return result;
}
function empty() { return { version: 1, revision: 0, tasks: [], proposals: [], commits: {}, imports: {}, legacyIds: {} }; }
function validateState(state) {
  object(state, ['version', 'revision', 'tasks', 'proposals', 'commits', 'imports', 'legacyIds'], 'store');
  if (state.version !== 1) fail('Unsupported store version');
  timestamp(state.revision, 'revision');
  if (!Array.isArray(state.tasks) || state.tasks.length > MAX_TASKS) fail('Invalid stored tasks');
  state.tasks = state.tasks.map(task);
  ids(state.tasks.map(t => t.id));
  if (!Array.isArray(state.proposals) || state.proposals.length > MAX_PROPOSALS) fail('Invalid stored proposals');
  const proposalIds = new Set();
  for (const p of state.proposals) {
    object(p, ['id', 'sessionId', 'text', 'prio', 'due', 'createdAt', 'status', 'sourceMessageId'], 'proposal');
    string(p.id, 'proposal id'); string(p.sessionId, 'sessionId'); text(p.text); priority(p.prio); date(p.due); timestamp(p.createdAt, 'createdAt');
    if (Object.hasOwn(p, 'sourceMessageId')) string(p.sourceMessageId, 'sourceMessageId');
    if (!['pending', 'committed'].includes(p.status) || proposalIds.has(p.id)) fail('Invalid proposal status or duplicate id');
    proposalIds.add(p.id);
  }
  for (const name of ['commits', 'imports', 'legacyIds']) {
    const records = state[name];
    if (!records || typeof records !== 'object' || Array.isArray(records)) fail(`Invalid ${name}`);
    for (const [key, val] of Object.entries(records)) {
      if (!/^[a-f0-9]{64}$/.test(key)) fail(`Invalid ${name} key`);
      if (name === 'commits') task(val);
      else if (name === 'imports') { if (val !== true) fail('Invalid import record'); }
      else string(val, 'legacy task id');
    }
  }
  for (const p of state.proposals) if (p.status === 'committed' && !state.commits[hash(p.id)]) fail('Missing committed task record');
  return state;
}

export class TodoStore {
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
    date(today);
    return { today, timestamp: d.getTime() };
  }
  _project(entry, today) {
    if (!entry.recurrence) return entry;
    const occurrenceDate = nextOccurrence(entry.recurrence, today);
    const completedAt = Object.hasOwn(entry.completions, occurrenceDate) ? entry.completions[occurrenceDate] : null;
    return { ...entry, occurrenceDate, due: occurrenceDate, done: completedAt !== null, completedAt };
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
    // Temp file always in same directory/filesystem, exclusively created.
    const temp = path.join(dir, `.${path.basename(this.filePath)}.${randomUUID()}.tmp`);
    let handle;
    try {
      handle = await fs.open(temp, 'wx', 0o600);
      await handle.writeFile(JSON.stringify(state, null, 2) + '\n', 'utf8');
      await handle.sync(); await handle.close(); handle = null;
      await fs.rename(temp, this.filePath);
    } finally {
      if (handle) await handle.close();
      // Only this exact, freshly generated temp file can be removed.
      try { await fs.unlink(temp); } catch (e) { if (e.code !== 'ENOENT') throw e; }
    }
  }
  _revision(state, value) {
    timestamp(value, 'expectedRevision');
    if (state.revision !== value) throw new StoreError('REVISION_CONFLICT', 'State changed; reload before retrying', { currentRevision: state.revision });
  }
  _snapshot(state, today = this._clock().today) {
    return clone({ revision: state.revision, serverToday: today, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      tasks: state.tasks.map(entry => this._project(entry, today)) });
  }
  snapshot() { return this._run(state => this._snapshot(state)); }
  list() { return this.snapshot(); }
  add(input) {
    return this._run(async state => {
      object(input, ['text', 'prio', 'due', 'expectedRevision', 'recurrence']); this._revision(state, input.expectedRevision);
      const details = fields(input), clock = this._clock();
      const repeating = Object.hasOwn(input, 'recurrence') ? { recurrence: recurrence(input.recurrence), completions: {} } : {};
      if (repeating.recurrence && details.due !== '') fail('Recurring tasks use recurrence.start; due must be empty');
      if (state.tasks.length >= MAX_TASKS) fail('Task limit reached');
      const entry = { id: randomUUID(), ...details, ...repeating, done: false, createdAt: clock.timestamp, completedAt: null };
      state.tasks.push(entry); await this._save(state);
      return { ...this._snapshot(state, clock.today), task: clone(this._project(entry, clock.today)) };
    });
  }
  update(input) {
    return this._run(async state => {
      object(input, ['id', 'patch', 'expectedRevision', 'occurrenceDate']); this._revision(state, input.expectedRevision);
      const id = string(input.id, 'id');
      object(input.patch, ['text', 'done', 'prio', 'due'], 'patch');
      if (!Object.keys(input.patch).length) fail('patch must not be empty');
      const entry = state.tasks.find(t => t.id === id);
      if (!entry) throw new StoreError('NOT_FOUND', 'Task not found');
      const patch = input.patch, clock = this._clock();
      if (entry.recurrence) {
        if (Object.hasOwn(patch, 'due')) fail('Recurring task due is projected; changing due is not supported');
        if (Object.hasOwn(patch, 'done')) {
          if (!date(input.occurrenceDate)) fail('occurrenceDate is required to update recurring completion');
          const currentDate = this._project(entry, clock.today).occurrenceDate;
          if (input.occurrenceDate !== currentDate) throw new StoreError('STALE_OCCURRENCE', 'Occurrence changed; reload before retrying', { occurrenceDate: currentDate });
        }
      } else if (Object.hasOwn(input, 'occurrenceDate')) fail('occurrenceDate is only supported for recurring tasks');
      if (Object.hasOwn(patch, 'text')) entry.text = text(patch.text);
      if (Object.hasOwn(patch, 'prio')) entry.prio = priority(patch.prio);
      if (Object.hasOwn(patch, 'due')) entry.due = date(patch.due);
      if (Object.hasOwn(patch, 'done')) {
        const done = bool(patch.done);
        if (entry.recurrence) {
          if (done && !Object.hasOwn(entry.completions, input.occurrenceDate)) entry.completions[input.occurrenceDate] = clock.timestamp;
          if (!done) delete entry.completions[input.occurrenceDate];
        } else if (entry.done !== done) { entry.done = done; entry.completedAt = done ? clock.timestamp : null; }
      }
      await this._save(state); return this._snapshot(state, clock.today);
    });
  }
  remove(input) {
    return this._run(async state => {
      object(input, ['ids', 'expectedRevision']); this._revision(state, input.expectedRevision);
      const requested = ids(input.ids), known = new Set(state.tasks.map(t => t.id));
      if (requested.some(id => !known.has(id))) throw new StoreError('NOT_FOUND', 'Task not found');
      if (!requested.length) return this._snapshot(state);
      const removed = new Set(requested); state.tasks = state.tasks.filter(t => !removed.has(t.id));
      await this._save(state); return this._snapshot(state);
    });
  }
  reorder(input) {
    return this._run(async state => {
      object(input, ['ids', 'expectedRevision']); this._revision(state, input.expectedRevision);
      const requested = ids(input.ids), byId = new Map(state.tasks.map(t => [t.id, t]));
      if (requested.length !== state.tasks.length || requested.some(id => !byId.has(id))) fail('reorder requires every current task id exactly once');
      if (requested.every((id, i) => state.tasks[i].id === id)) return this._snapshot(state);
      state.tasks = requested.map(id => byId.get(id)); await this._save(state); return this._snapshot(state);
    });
  }
  propose(input) {
    return this._run(async state => {
      object(input, ['sessionId', 'text', 'prio', 'due', 'sourceMessageId']);
      const sessionId = string(input.sessionId, 'sessionId'), details = fields(input);
      const anchor = Object.hasOwn(input, 'sourceMessageId') ? { sourceMessageId: string(input.sourceMessageId, 'sourceMessageId') } : {};
      if (state.proposals.length >= MAX_PROPOSALS) fail('Proposal limit reached');
      const proposal = { id: randomUUID(), sessionId, ...details, ...anchor, createdAt: Date.now(), status: 'pending' };
      state.proposals.push(proposal); await this._save(state);
      return { revision: state.revision, proposal: clone(proposal) };
    });
  }
  proposals(input) {
    return this._run(state => {
      object(input, ['sessionId']); const sessionId = string(input.sessionId, 'sessionId');
      return clone({ revision: state.revision, proposals: state.proposals.filter(p => p.sessionId === sessionId) });
    });
  }
  // Caller MUST verify explicit human confirmation before invoking this method.
  // Details cannot be supplied here: only the exact immutable proposal is committed.
  commit(input) {
    return this._run(async state => {
      object(input, ['proposalId', 'sessionId']);
      const id = string(input.proposalId, 'proposalId'), sessionId = string(input.sessionId, 'sessionId');
      const proposal = state.proposals.find(p => p.id === id);
      if (!proposal) throw new StoreError('NOT_FOUND', 'Proposal not found');
      if (proposal.sessionId !== sessionId) throw new StoreError('SESSION_MISMATCH', 'Proposal belongs to another session');
      if (proposal.status === 'committed') return { ...this._snapshot(state), task: clone(state.commits[hash(id)]), alreadyCommitted: true };
      if (state.tasks.length >= MAX_TASKS) fail('Task limit reached');
      const entry = { id: randomUUID(), text: proposal.text, prio: proposal.prio, due: proposal.due, done: false, createdAt: Date.now(), completedAt: null };
      state.tasks.push(entry); proposal.status = 'committed'; state.commits[hash(id)] = clone(entry);
      await this._save(state); return { ...this._snapshot(state), task: clone(entry), alreadyCommitted: false };
    });
  }
  importLegacy(input) {
    return this._run(async state => {
      object(input, ['clientId', 'fingerprint', 'tasks', 'expectedRevision']); this._revision(state, input.expectedRevision);
      const clientId = string(input.clientId, 'clientId'), fingerprint = string(input.fingerprint, 'fingerprint', 256);
      if (!Array.isArray(input.tasks) || input.tasks.length > MAX_TASKS) fail('tasks must be an array of at most 10000 tasks');
      const incoming = input.tasks.map(task); ids(incoming.map(t => t.id));
      const importKey = hash(JSON.stringify([clientId, fingerprint]));
      if (state.imports[importKey]) return { ...this._snapshot(state), imported: 0, alreadyImported: true };
      const additions = incoming.filter(t => !state.legacyIds[hash(JSON.stringify([clientId, t.id]))]);
      if (state.tasks.length + additions.length > MAX_TASKS) fail('Task limit reached');
      for (const entry of additions) {
        const id = randomUUID();
        state.legacyIds[hash(JSON.stringify([clientId, entry.id]))] = id;
        state.tasks.push({ ...entry, id });
      }
      state.imports[importKey] = true;
      await this._save(state); return { ...this._snapshot(state), imported: additions.length, alreadyImported: false };
    });
  }
}
export default TodoStore;
