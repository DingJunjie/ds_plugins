// Runs inside the knowledge page's shared script scope (injected at the boot anchor).
let hostRequest = null;
let revision = null;
let busy = false;
let stopped = false;
let deferredSnapshot = null;

function syncStatus(text, error = false) {
  const node = document.getElementById('sync-status');
  if (!node) return;
  node.textContent = text;
  node.style.color = error ? 'var(--danger)' : 'var(--muted)';
}

function watchHarnessTheme() {
  try {
    if (typeof MutationObserver === 'undefined' || !window.parent || window.parent === window) return;
    const body = window.parent.document && window.parent.document.body;
    if (!body) return;
    const sync = () => { if (state.themeFollow) applyTheme(); };
    new MutationObserver(sync).observe(body, { attributes: true, attributeFilter: ['data-ds-dark-theme'] });
  } catch {}
}

async function refresh() {
  if (stopped || busy || !hostRequest || state.editing) return;
  busy = true;
  try {
    const snapshot = await hostRequest({ op: 'snapshot' });
    if (stopped) return;
    acceptSnapshot(snapshot);
    syncStatus('已连接 · 数据保存在 Harness 本地');
  } catch (e) {
    if (!stopped) syncStatus(`连接失败：${e.message}；未保存的输入仍保留`, true);
  } finally { busy = false; }
}

async function mutate(op, args, expected = revision) {
  if (stopped || !hostRequest || revision === null) { syncStatus('尚未连接，请稍后重试；输入未丢失', true); return null; }
  if (busy) { syncStatus('正在同步，请稍后重试；输入未丢失', true); return null; }
  busy = true;
  syncStatus('正在保存…');
  try {
    const result = await hostRequest({ op, ...args, expectedRevision: expected });
    if (stopped) return null;
    const snapshot = await hostRequest({ op: 'snapshot' });
    if (stopped) return null;
    syncStatus('已保存到 Harness 本地');
    return { snapshot, result };
  } catch (e) {
    if (stopped) return null;
    if (e.code === 'REVISION_CONFLICT') {
      try { acceptSnapshot(await hostRequest({ op: 'snapshot' })); } catch { /* show original conflict */ }
      syncStatus('数据已被其他操作修改，本次未保存。已刷新；编辑中的内容请重新提交', true);
    } else syncStatus(`保存失败：${e.message}。输入已保留，请重试`, true);
    return null;
  } finally { busy = false; }
}

window.__knowledgeConnect = (request) => {
  hostRequest = request;
  stopped = false;
  syncStatus('正在连接 Harness…');
  refresh();
  const interval = setInterval(() => refresh(), 2000);
  return () => { stopped = true; clearInterval(interval); hostRequest = null; };
};

applyTheme();
render();
watchHarnessTheme();
syncStatus('正在连接 Harness…');
