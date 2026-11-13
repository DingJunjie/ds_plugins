// Runs inside the standalone page's closure, sharing render/state/editingId.
let hostRequest = null;
let revision = null;
let snapshotDay = null;
let busy = false;
let stopped = false;
let deferredSnapshot = null;
let migrationChecked = false;
let editRevision = null;
let editSaving = false;
let themeFollow = false;
const UI_KEY = "harness.todo.ui.v2";
const LEGACY_KEY = "harness.todo.local.v1";
const IMPORT_KEY = "harness.todo.import.v2";
const CLIENT_KEY = "harness.todo.client.v2";
const statusNode = document.createElement("p");
statusNode.id = "sync-status";
statusNode.setAttribute("role", "status");
statusNode.style.cssText = "font-size:12px;color:var(--muted);padding:0 6px;min-height:18px;word-break:break-word";
document.querySelector(".card").before(statusNode);
function connectionStatus(text, error = false) {
  statusNode.textContent = text;
  statusNode.style.color = error ? "var(--accent)" : "var(--muted)";
}
const recurrenceMode = typeof document.getElementById === 'function' ? document.getElementById('recurrenceMode') : null;
if (recurrenceMode) {
  const syncRepeat = () => {
    document.getElementById('weekdays').hidden = recurrenceMode.value !== 'weekly';
    document.getElementById('dateLabel').textContent = recurrenceMode.value === 'none' ? '截止' : '开始';
    if (recurrenceMode.value === 'weekly' && !document.querySelector('#weekdays input:checked')) {
      const day = new Date().getDay() || 7;
      document.querySelector(`#weekdays input[value="${day}"]`).checked = true;
    }
  };
  recurrenceMode.addEventListener('change', syncRepeat);
  syncRepeat();
}
function repeatDescription(t) {
  if (!t.recurrence) return '';
  return t.recurrence.kind === 'daily' ? '每天重复' : '每周'+t.recurrence.days.map(d=>['一','二','三','四','五','六','日'][d-1]).join('、')+'重复';
}
function localGet(key) { try { return localStorage.getItem(key); } catch { return null; } }
function localSet(key, value) { try { localStorage.setItem(key, value); return true; } catch { return false; } }
function detectHarnessDark() {
  try {
    if (window.parent && window.parent !== window && window.parent.document && window.parent.document.body) {
      return window.parent.document.body.hasAttribute('data-ds-dark-theme');
    }
  } catch {}
  return false;
}
function watchHarnessTheme() {
  try {
    if (typeof MutationObserver === 'undefined' || !window.parent || window.parent === window) return;
    const body = window.parent.document && window.parent.document.body;
    if (!body) return;
    const sync = () => { if (themeFollow) { state.theme = body.hasAttribute('data-ds-dark-theme') ? 'dark' : 'light'; applyTheme(); } };
    new MutationObserver(sync).observe(body, { attributes: true, attributeFilter: ['data-ds-dark-theme'] });
  } catch {}
}
function load() {
  let theme = null;
  try {
    const saved = JSON.parse(localGet(UI_KEY) || localGet(LEGACY_KEY) || "{}");
    theme = saved.theme;
    state.filter = ["all", "active", "done"].includes(saved.filter) ? saved.filter : "all";
  } catch { /* only presentation defaults, never seed tasks */ }
  if (theme === "dark" || theme === "light") {
    themeFollow = false;
    state.theme = theme;
  } else {
    themeFollow = true;
    state.theme = detectHarnessDark() ? "dark" : "light";
  }
  state.tasks = [];
}
function save() {
  localSet(UI_KEY, JSON.stringify({theme: themeFollow ? "auto" : state.theme, filter: state.filter}));
}
function acceptSnapshot(snapshot) {
  if (!snapshot || !Number.isSafeInteger(snapshot.revision) || !Array.isArray(snapshot.tasks)) throw new Error("待办服务返回了无效数据");
  if (editingId || dragId) { deferredSnapshot = snapshot; return; }
  if (revision === snapshot.revision && snapshotDay === snapshot.serverToday) return;
  revision = snapshot.revision;
  snapshotDay = snapshot.serverToday;
  state.tasks = snapshot.tasks;
  deferredSnapshot = null;
  render();
}
function finishDeferred() {
  if (deferredSnapshot && !editingId && !dragId) acceptSnapshot(deferredSnapshot);
}
async function fingerprint(text) {
  // SHA-256 is stable across reloads; fallback is a bounded deterministic string.
  if (window.crypto?.subtle) {
    const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
    return [...new Uint8Array(bytes)].map(b => b.toString(16).padStart(2, "0")).join("");
  }
  let a = 2166136261, b = 0;
  for (let i = 0; i < text.length; i++) { a = Math.imul(a ^ text.charCodeAt(i), 16777619); b = Math.imul(b ^ text.charCodeAt(i), 31); }
  return `legacy-${text.length}-${a >>> 0}-${b >>> 0}`;
}
async function migrate(snapshot) {
  const raw = localGet(LEGACY_KEY);
  if (!raw) return snapshot;
  const legacy = JSON.parse(raw);
  if (!Array.isArray(legacy.tasks)) throw new Error("旧待办备份格式无效，未迁移；原备份已保留");
  const fp = await fingerprint(JSON.stringify(legacy.tasks));
  if (localGet(IMPORT_KEY) === fp) return snapshot;
  let clientId = localGet(CLIENT_KEY);
  if (!clientId) {
    clientId = crypto.randomUUID();
    if (!localSet(CLIENT_KEY, clientId)) throw new Error("无法保存迁移标识，旧待办未迁移；请允许本地存储");
  }
  const result = await hostRequest({op: "importLegacy", clientId, fingerprint: fp, tasks: legacy.tasks, expectedRevision: snapshot.revision});
  // Never remove or alter the old task backup. Mark only after acknowledged success.
  localSet(IMPORT_KEY, fp);
  return result;
}
async function refresh(initial = false) {
  if (stopped || busy || !hostRequest || editingId || dragId) return;
  busy = true;
  try {
    let snapshot = await hostRequest({op: "snapshot"});
    if (!migrationChecked) {
      acceptSnapshot(snapshot);
      snapshot = await migrate(snapshot);
      migrationChecked = true;
    }
    if (stopped) return;
    acceptSnapshot(snapshot);
    connectionStatus("已连接 · 数据保存在 Harness 本地");
  } catch (e) {
    if (!stopped) connectionStatus(`连接或迁移失败：${e.message}；未保存的输入仍保留`, true);
  } finally { busy = false; }
}
async function mutate(op, args, expected = revision) {
  if (stopped || !hostRequest || revision === null) { connectionStatus("尚未连接，请稍后重试；输入未丢失", true); return null; }
  if (busy) { connectionStatus("正在同步，请稍后重试；输入未丢失", true); return null; }
  busy = true;
  connectionStatus("正在保存…");
  try {
    const snapshot = await hostRequest({op, ...args, expectedRevision: expected});
    if (stopped) return null;
    connectionStatus("已保存到 Harness 本地");
    return snapshot;
  } catch (e) {
    if (stopped) return null;
    if (e.code === "REVISION_CONFLICT") {
      try { acceptSnapshot(await hostRequest({op: "snapshot"})); } catch { /* show original conflict */ }
      connectionStatus("待办已被其他操作修改，本次未保存。已刷新；编辑中的文字保留，请 Esc 退出后重新编辑", true);
    } else connectionStatus(`保存失败：${e.message}。输入已保留，请重试`, true);
    return null;
  } finally { busy = false; }
}
async function addTask(text, prio, due) {
  if (editingId) { connectionStatus("请先完成当前编辑", true); return false; }
  const mode = (typeof recurrenceMode?.value === 'string' ? recurrenceMode.value : 'none') || 'none';
  const selected = (typeof document.querySelectorAll === 'function' ? [...document.querySelectorAll('#weekdays input:checked')] : []).map(el=>Number(el.value));
  if (mode === 'weekly' && !selected.length) { connectionStatus('请至少选择一个重复星期', true); return false; }
  const recurrence = mode === 'none' ? null : {kind:mode,start:due || snapshotDay || (new Date().toISOString().slice(0,10)),...(mode === 'weekly' ? {days:selected} : {})};
  const snapshot = await mutate("add", {text, prio, due: recurrence ? '' : due || '', ...(recurrence ? {recurrence} : {})});
  if (!snapshot) return false;
  acceptSnapshot(snapshot);
  return true;
}
async function toggleTask(id) {
  if (editingId) return;
  const t = state.tasks.find(x => x.id === id);
  if (!t) return;
  const snapshot = await mutate("update", {id, patch: {done: !t.done}, ...(t.recurrence ? {occurrenceDate:t.occurrenceDate} : {})});
  if (snapshot) acceptSnapshot(snapshot);
}
async function removeTask(id) {
  if (editingId) return;
  if (state.tasks.find(t=>t.id===id)?.recurrence && !window.confirm('删除整个重复任务及其完成记录？')) return;
  const snapshot = await mutate("remove", {ids: [id]});
  if (snapshot) acceptSnapshot(snapshot);
}
function startEdit(id) {
  if (busy || editingId || revision === null) return;
  editingId = id;
  editRevision = revision;
  render();
}
async function commitEdit(id, value) {
  if (editSaving || editingId !== id) return;
  const text = value.trim();
  if (!text) { connectionStatus("待办文字不能为空，修改尚未保存", true); return; }
  editSaving = true;
  const snapshot = await mutate("update", {id, patch: {text}}, editRevision);
  editSaving = false;
  if (snapshot) { editingId = null; deferredSnapshot = null; acceptSnapshot(snapshot); }
}
async function reorderTasks(ids) {
  const snapshot = await mutate("reorder", {ids});
  if (snapshot) acceptSnapshot(snapshot);
}
async function clearCompleted() {
  if (editingId) return;
  const ids = state.tasks.filter(t => t.done && !t.recurrence).map(t => t.id);
  if (!ids.length) return toast("没有可清除的一次性任务；重复任务保留");
  const snapshot = await mutate("remove", {ids});
  if (snapshot) { acceptSnapshot(snapshot); toast(`已清除 ${ids.length} 件`); }
}
window.__todoConnect = (request) => {
  hostRequest = request;
  stopped = false;
  connectionStatus("正在连接 Harness…");
  refresh(true);
  const interval = setInterval(() => refresh(), 2000);
  return () => { stopped = true; clearInterval(interval); hostRequest = null; };
};
connectionStatus("正在连接 Harness…");
watchHarnessTheme();
