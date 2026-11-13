function createFloatStore(initial) {
  let value = initial;
  const listeners = new Set();
  return {
    get: () => value,
    set: next => { if (value !== next) { value = next; listeners.forEach(l => l()); } },
    subscribe: l => { listeners.add(l); return () => { listeners.delete(l); }; }
  };
}
function createFloatingKnowledge(ctx, store = createFloatStore(true)) {
  const h = React.createElement;
  const KEY = 'harness.knowledge.float.v1';
  const WIDTH = 231; // 154px * 1.5; keep drag bounds in sync with the panel width.
  const read = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } };
  const clamp = (pos, collapsed) => ({
    x: Math.max(8, Math.min(Number.isFinite(pos.x) ? pos.x : window.innerWidth - WIDTH, Math.max(8, window.innerWidth - Math.min(WIDTH, window.innerWidth - 16) - 8))),
    y: Math.max(54, Math.min(Number.isFinite(pos.y) ? pos.y : 68, Math.max(54, window.innerHeight - (collapsed ? 44 : 300))))
  });
  const fmt = t => { try { return new Date(t).toISOString().slice(0, 10); } catch { return ''; } };
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  return function FloatingKnowledge() {
    const [enabled, setEnabled] = React.useState(() => store.get());
    const [collapsed, setCollapsed] = React.useState(() => !!read().collapsed);
    const [position, setPosition] = React.useState(() => clamp(read(), !!read().collapsed));
    const [entries, setEntries] = React.useState(null);
    const [selected, setSelected] = React.useState(null);
    const [error, setError] = React.useState('');
    const locked = React.useRef(false);
    const drag = React.useRef(null);
    const lifetime = React.useRef(null);
    const collapsedRef = React.useRef(collapsed);
    collapsedRef.current = collapsed;

    React.useEffect(() => store.subscribe(() => setEnabled(store.get())), [store]);
    React.useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify({ ...position, collapsed })); } catch {} }, [position, collapsed]);
    React.useEffect(() => () => { if (lifetime.current) lifetime.current.abort(); }, []);

    const call = React.useCallback(async request => {
      const reply = await ctx.connection.rpc.call('/api', 'localKnowledge/request', { args: { request } }, lifetime.current?.signal);
      if (!reply.ok) throw new Error(reply.error?.message || '连接失败');
      if (!reply.value?.ok) throw new Error(reply.value?.error?.message || '知识点读取失败');
      return reply.value.value;
    }, []);

    React.useEffect(() => {
      if (!enabled) return;
      const controller = new AbortController(); lifetime.current = controller;
      let stopped = false;
      const refresh = async () => {
        if (locked.current || stopped) return;
        locked.current = true;
        try {
          const next = await call({ op: 'list' });
          if (!stopped) { setEntries([...next.entries].sort((a, b) => b.updatedAt - a.updatedAt)); setError(''); }
        } catch (e) { if (!stopped) setError(e.message); }
        finally { locked.current = false; }
      };
      refresh();
      const timer = setInterval(refresh, 3000);
      const resize = () => setPosition(p => clamp(p, collapsedRef.current));
      window.addEventListener('resize', resize);
      return () => { stopped = true; clearInterval(timer); controller.abort(); window.removeEventListener('resize', resize); };
    }, [call, enabled]);

    const openEntry = async id => {
      setSelected({ loading: true });
      try { const r = await call({ op: 'get', id }); setSelected({ entry: r.entry }); }
      catch (e) { setError(e.message); setSelected(null); }
    };
    const closeModal = () => setSelected(null);

    if (!enabled) return null;
    const list = entries || [];

    const section = (title, items) => items && items.length
      ? h('div', { className: 'hkf-m-sec', key: title },
          h('div', { className: 'hkf-m-h' }, title),
          h('ul', { className: 'hkf-m-ul' }, items.map((t, i) => h('li', { key: i }, t))))
      : null;

    const modal = selected && h('div', {
      className: 'hkf-modal', role: 'dialog', 'aria-modal': 'true',
      onClick: e => { if (e.target === e.currentTarget) closeModal(); }
    },
      h('div', { className: 'hkf-modal-card', 'data-window-drag-exclude': true },
        h('div', { className: 'hkf-modal-head' },
          h('div', { className: 'hkf-modal-title' }, selected.loading ? '加载中…' : esc(selected.entry?.title)),
          h('button', { className: 'hkf-close', type: 'button', onClick: closeModal, 'aria-label': '关闭' }, '✕')),
        h('div', { className: 'hkf-modal-body' },
          selected.loading ? h('div', { className: 'hkf-empty' }, '加载中…') :
          h(React.Fragment, null,
            selected.entry.domain || (selected.entry.tags && selected.entry.tags.length) ? h('div', { className: 'hkf-m-meta' },
              (selected.entry.domain ? h('span', { className: 'hkf-m-domain' }, esc(selected.entry.domain)) : null),
              (selected.entry.tags || []).map(t => h('span', { className: 'hkf-m-tag', key: t }, esc(t)))) : null,
            selected.entry.summary ? h('p', { className: 'hkf-m-summary' }, esc(selected.entry.summary)) : null,
            section('前提 / 公理', selected.entry.axioms),
            section('基本事实 / 要素', selected.entry.elements),
            section('推导结论', selected.entry.conclusions),
            (selected.entry.related || []).length ? h('div', { className: 'hkf-m-sec', key: 'rel' },
              h('div', { className: 'hkf-m-h' }, '关联'), h('div', { className: 'hkf-m-rel' }, selected.entry.related.map(esc).join('、'))) : null,
            h('div', { className: 'hkf-m-date' }, `更新于 ${fmt(selected.entry.updatedAt)}`)))));

    return h(React.Fragment, null,
      h('style', null, `
        .hkf-root{position:fixed;z-index:81;max-width:calc(100vw - 16px);box-sizing:border-box;background:var(--dsw-alias-bg-layer-1,#ffffff);color:var(--dsw-alias-label-primary,#1b2333);border:1px solid var(--dsw-alias-border-l2,#e3e8f1);border-radius:16px;box-shadow:0 12px 38px #0003;font:13px/1.5 -apple-system,BlinkMacSystemFont,'PingFang SC',sans-serif;pointer-events:auto;overflow:hidden}
        .hkf-header{display:flex;align-items:center;gap:6px;padding:6px 12px;cursor:grab;touch-action:none;user-select:none}
        .hkf-header:active{cursor:grabbing}
        .hkf-heading{flex:1;font-weight:650;white-space:nowrap}
        .hkf-count{color:#4f6ef7;font-size:11px;margin-left:7px}
        .hkf-btn{border:0;background:transparent;color:inherit;border-radius:8px;cursor:pointer;padding:3px 7px;font:inherit;line-height:1.4}.hkf-btn:hover{background:#8882}
        .hkf-body{padding:4px 8px 8px;min-height:40px}
        .hkf-list{list-style:none;margin:0;padding:0;max-height:min(320px,46vh);overflow:auto}
        .hkf-item{padding:9px 8px;border-top:1px solid #8882;cursor:pointer;border-radius:8px}
        .hkf-item:first-child{border-top:0}
        .hkf-item:hover{background:#8881}
        .hkf-item-title{font-weight:600;line-height:1.35;overflow-wrap:anywhere}
        .hkf-item-meta{font-size:11px;opacity:.6;margin-top:3px}
        .hkf-empty{padding:18px 12px;text-align:center;opacity:.6;font-size:12.5px}
        .hkf-error{font-size:11px;color:#c74b4b;padding:2px 8px 8px;overflow-wrap:anywhere}
        .hkf-modal{position:fixed;inset:0;z-index:120;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;padding:20px;box-sizing:border-box}
        .hkf-modal-card{width:100%;max-width:560px;max-height:82vh;overflow:auto;background:var(--dsw-alias-bg-layer-1,#fff);color:var(--dsw-alias-label-primary,#1b2333);border-radius:16px;box-shadow:0 24px 70px #0005}
        .hkf-modal-head{display:flex;align-items:center;gap:8px;padding:14px 16px;border-bottom:1px solid var(--dsw-alias-border-l2,#e3e8f1);position:sticky;top:0;z-index:1;background:var(--dsw-alias-bg-layer-1,#ffffff)}
        .hkf-modal-title{flex:1;font-weight:700;font-size:15px;line-height:1.35}
        .hkf-close{border:0;background:transparent;font-size:15px;cursor:pointer;color:inherit;padding:2px 8px;border-radius:8px}.hkf-close:hover{background:#8882}
        .hkf-modal-body{padding:14px 16px 18px}
        .hkf-m-meta{display:flex;gap:5px;flex-wrap:wrap;margin-bottom:10px}
        .hkf-m-domain{font-size:11px;color:#4f6ef7;background:#e9eeff;padding:1px 8px;border-radius:6px}
        .hkf-m-tag{font-size:11px;opacity:.7;background:#eef1f7;border:1px solid #e3e8f1;padding:1px 7px;border-radius:6px}
        .hkf-m-summary{font-size:13.5px;opacity:.85;line-height:1.6;margin:0 0 12px}
        .hkf-m-sec{margin-bottom:14px}
        .hkf-m-h{font-size:11px;text-transform:uppercase;letter-spacing:.05em;opacity:.5;margin-bottom:6px}
        .hkf-m-ul{list-style:none;margin:0;padding:0}
        .hkf-m-ul li{position:relative;padding:5px 0 5px 16px;font-size:13px;line-height:1.6;border-bottom:1px dashed #8883}
        .hkf-m-ul li:last-child{border-bottom:0}
        .hkf-m-ul li::before{content:'';position:absolute;left:2px;top:12px;width:6px;height:6px;border-radius:50%;background:#4f6ef7;opacity:.7}
        .hkf-m-who{display:inline-block;font-size:10px;color:#4f6ef7;background:#e9eeff;border-radius:5px;padding:0 5px;margin-right:6px}
        .hkf-m-who.user{color:#3f9d6c;background:#e5f3ea}
        .hkf-m-rel{font-size:13px;opacity:.85}
        .hkf-m-date{font-size:11px;opacity:.45;margin-top:14px}
      `),
      h('section', {
        className: 'hkf-root', 'aria-label': '条目列表', 'data-window-drag-exclude': true,
        style: { left: position.x, top: position.y, width: WIDTH }
      },
        h('div', {
          className: 'hkf-header', tabIndex: 0, role: 'group', 'aria-label': '拖动条目列表浮窗',
          onPointerDown: e => {
            if (e.target.closest('button') || e.button !== 0) return;
            drag.current = { x: e.clientX, y: e.clientY, start: position };
            e.currentTarget.setPointerCapture(e.pointerId);
          },
          onPointerMove: e => { if (drag.current) setPosition(clamp({ x: drag.current.start.x + e.clientX - drag.current.x, y: drag.current.start.y + e.clientY - drag.current.y }, collapsed)); },
          onPointerUp: () => { drag.current = null; }, onPointerCancel: () => { drag.current = null; }, onLostPointerCapture: () => { drag.current = null; },
          onKeyDown: e => {
            if (e.target !== e.currentTarget) return;
            const delta = { ArrowLeft: [-16, 0], ArrowRight: [16, 0], ArrowUp: [0, -16], ArrowDown: [0, 16] }[e.key];
            if (delta) { e.preventDefault(); setPosition(p => clamp({ x: p.x + delta[0], y: p.y + delta[1] }, collapsed)); }
          }
        },
          h('span', { className: 'hkf-heading' }, '💡 条目', h('span', { className: 'hkf-count' }, entries ? String(list.length) : '…')),
          h('button', { className: 'hkf-btn', type: 'button', onClick: () => { setCollapsed(c => !c); setPosition(p => clamp(p, !collapsed)); }, 'aria-label': collapsed ? '展开条目列表' : '收起条目列表' }, collapsed ? '＋' : '−')),
        !collapsed && h('div', { className: 'hkf-body' },
          !entries ? h('div', { className: 'hkf-empty' }, '正在加载…')
          : list.length ? h('ul', { className: 'hkf-list' }, list.map(e => h('li', {
              className: 'hkf-item', key: e.id, onClick: () => openEntry(e.id), role: 'button', tabIndex: 0,
              onKeyDown: ev => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); openEntry(e.id); } }
            },
            h('div', { className: 'hkf-item-title' }, esc(e.title)),
            h('div', { className: 'hkf-item-meta' }, (e.domain ? esc(e.domain) + ' · ' : '') + fmt(e.updatedAt)))))
          : h('div', { className: 'hkf-empty' }, '还没有条目，去聊天里解析一个吧'),
          error && h('div', { className: 'hkf-error', role: 'status' }, error))),
      modal);
  };
}
