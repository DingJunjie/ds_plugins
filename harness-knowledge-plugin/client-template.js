// Generated bundle template; PAGE and FLOATING_WIDGET are substituted by build.py.
window.__ModuleLoader__.load({
  id: "harness-knowledge-local",
  factory: function(require) {
    const React = require("react");
    const PAGE = __PAGE__;
    __FLOATING_WIDGET__
    function createPanel(ctx) {
      return function KnowledgePanel() {
        const cleanup = React.useRef(null);
        const controller = React.useRef(null);
        React.useEffect(() => () => {
          if (cleanup.current) cleanup.current();
          if (controller.current) controller.current.abort();
        }, []);
        const connect = React.useCallback((event) => {
          if (cleanup.current) cleanup.current();
          if (controller.current) controller.current.abort();
          const aborter = new AbortController();
          controller.current = aborter;
          const frame = event.currentTarget.contentWindow;
          cleanup.current = frame.__knowledgeConnect(async (request) => {
            const transport = await ctx.connection.rpc.call("/api", "localKnowledge/request", {
              args: { request }
            }, aborter.signal);
            if (!transport.ok) throw new Error(transport.error?.message || "Harness 连接失败");
            const result = transport.value;
            if (!result || !result.ok) {
              const error = new Error(result?.error?.message || "知识点请求失败");
              error.code = result?.error?.code || "REQUEST_FAILED";
              throw error;
            }
            return result.value;
          });
        }, []);
        return React.createElement("iframe", {
          title: "条目", srcDoc: PAGE, onLoad: connect, allow: "clipboard-write",
          style: { width: "100%", height: "100%", minHeight: 0, flex: 1, border: 0, display: "block" }
        });
      };
    }
    const FLOAT_KEY = "harness.knowledge.float.enabled.v1";
    const TRAILING_CSS = `
      button:has(.hkf-trailing){position:relative}
      .hkf-trailing{position:absolute;right:8px;top:50%;transform:translateY(-50%);width:26px;height:15px;border-radius:999px;background:#c9bfae;cursor:pointer;box-shadow:inset 0 0 0 1px #00000014}
      .hkf-trailing.on{background:#4f6ef7}
      .hkf-trailing::after{content:'';position:absolute;top:2px;left:2px;width:11px;height:11px;border-radius:50%;background:#fff;transition:left .16s;box-shadow:0 1px 2px #0004}
      .hkf-trailing.on::after{left:13px}
    `;
    function injectStyle(id, css) {
      if (typeof document === "undefined") return;
      if (!document.querySelector || !document.querySelector(`style[data-knowledge-css="${id}"]`)) {
        const tag = document.createElement("style");
        tag.setAttribute("data-knowledge-css", id);
        tag.textContent = css;
        (document.head || document.documentElement).appendChild(tag);
      }
    }
    function createKnowledgeIcon(store) {
      return function KnowledgeIcon({ size, active }) {
        const enabled = React.useSyncExternalStore ? React.useSyncExternalStore(store.subscribe, store.get) : store.get();
        const wide = size !== 18;
        return React.createElement(React.Fragment, null,
          React.createElement("svg", {
            width: 16, height: 16, viewBox: "0 0 24 24", fill: "none",
            stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true
          }, React.createElement("path", { d: "M9 18h6M10 21h4" }),
             React.createElement("path", { d: "M12 3a6 6 0 0 0-3.6 10.8c.6.5 1 1.3 1.1 2.2h5c.1-.9.5-1.7 1.1-2.2A6 6 0 0 0 12 3Z" })),
          wide && React.createElement("span", {
            role: "switch", "aria-checked": enabled, "aria-label": "快速记 idea 浮窗开关", title: enabled ? "关闭快速记 idea 浮窗" : "打开快速记 idea 浮窗",
            className: "hkf-trailing" + (enabled ? " on" : ""),
            tabIndex: -1,
            onClick: (e) => {
              e.stopPropagation(); e.preventDefault();
              const next = !store.get(); store.set(next);
              try { localStorage.setItem(FLOAT_KEY, next ? "1" : "0"); } catch {}
            }
          })
        );
      };
    }
    const SYNC_CSS = `
      .hkf-sync{font:inherit;font-size:12px;cursor:pointer;border:1px solid var(--dsw-alias-border-l2,#e3e8f1);background:var(--dsw-alias-bg-layer-1,#fff);color:var(--dsw-alias-label-primary,#1b2333);border-radius:8px;padding:6px 10px;box-sizing:border-box;white-space:nowrap}
      .hkf-sync:hover{background:var(--dsw-alias-bg-layer-2,#eef1f7)}
      .hkf-sync:disabled{opacity:.5;cursor:default}
      .hkf-sync-rail{width:36px;padding:6px 0;text-align:center}
    `;
    function createSyncButton(ctx) {
      return function SyncButton({ wide }) {
        const [status, setStatus] = React.useState('');
        const [busy, setBusy] = React.useState(false);
        const sync = async () => {
          if (busy) return;
          setBusy(true); setStatus('');
          const call = async ns => {
            const reply = await ctx.connection.rpc.call('/api', ns + '/request', { args: { request: { op: 'syncToNutstore' } } });
            if (!reply.ok) throw new Error(reply.error?.message || '连接失败');
            if (!reply.value?.ok) throw new Error(reply.value?.error?.message || '同步失败');
            return reply.value.value;
          };
          const results = await Promise.allSettled([call('localKnowledge'), call('localTodo')]);
          const failed = results.filter(r => r.status === 'rejected');
          setStatus(failed.length ? (failed[0].reason?.message || '同步失败') : '已同步 ✓');
          setTimeout(() => setStatus(''), 2600);
          setBusy(false);
        };
        const collapsed = wide === false;
        return React.createElement('button', {
          type: 'button', className: 'hkf-sync' + (collapsed ? ' hkf-sync-rail' : ''),
          onClick: sync, disabled: busy,
          title: status || '同步到坚果云', 'aria-label': '同步到坚果云'
        }, collapsed ? '☁️' : (status || (busy ? '同步中…' : '☁️ 同步到坚果云')));
      };
    }
    return {
      inject: ["slots", "layout", "connection"],
      apply(ctx) {
        injectStyle("trailing", TRAILING_CSS);
        injectStyle("sync", SYNC_CSS);
        const Panel = createPanel(ctx);
        const floatStore = createFloatStore((() => { try { return localStorage.getItem(FLOAT_KEY) !== "0"; } catch { return true; } })());
        const FloatingKnowledge = createFloatingKnowledge(ctx, floatStore);
        const KnowledgeIcon = createKnowledgeIcon(floatStore);
        const SyncButton = createSyncButton(ctx);
        ctx.effect(() => ctx.slots.inject("shell.overlay", () => ctx.slots.register({
          name: "shell.overlay", id: "local-knowledge.floating"
        }, FloatingKnowledge)), "knowledge: floating widget");
        ctx.effect(() => ctx.slots.inject("main", () => ctx.slots.register({
          name: "main", key: "local-knowledge", id: "local-knowledge.main"
        }, Panel)), "knowledge: main panel");
        ctx.effect(() => ctx.slots.inject("sidebar.panellist", () => ctx.slots.register({
          name: "sidebar.panellist", id: "local-knowledge", label: "条目", order: 16
        }, KnowledgeIcon)), "knowledge: sidebar entry");
        ctx.effect(() => ctx.slots.inject("sidebar.footer.action", () => ctx.slots.register({
          name: "sidebar.footer.action", id: "local-knowledge.sync", label: "同步到坚果云"
        }, SyncButton)), "knowledge: sync button");
      }
    };
  }
});
