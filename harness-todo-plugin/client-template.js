// Generated bundle template; PAGE is substituted by build.py.
window.__ModuleLoader__.load({
  id: "harness-todo-local",
  factory: function(require) {
    const React = require("react");
    const PAGE = __PAGE__;
    __FLOATING_WIDGET__
    function createPanel(ctx) {
      return function TodoPanel() {
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
          // Inject only into our own iframe. No global message listener or unauthenticated fetch.
          cleanup.current = frame.__todoConnect(async (request) => {
            const transport = await ctx.connection.rpc.call("/api", "localTodo/request", {
              args: { request }
            }, aborter.signal);
            if (!transport.ok) throw new Error(transport.error?.message || "Harness 连接失败");
            const result = transport.value;
            if (!result || !result.ok) {
              const error = new Error(result?.error?.message || "待办请求失败");
              error.code = result?.error?.code || "REQUEST_FAILED";
              throw error;
            }
            return result.value;
          });
        }, []);
        return React.createElement("iframe", {
          title: "待办清单", srcDoc: PAGE, onLoad: connect, allow: "clipboard-write",
          style: { width: "100%", height: "100%", minHeight: 0, flex: 1, border: 0, display: "block" }
        });
      };
    }
    const FLOAT_KEY = "harness.todo.float.enabled.v1";
    // The panel row has no trailing slot; we render the switch inside the icon
    // glyph and pin it to the row's right edge with `:has()` + absolute positioning.
    const TRAILING_CSS = `
      button:has(.htf-trailing){position:relative}
      .htf-trailing{position:absolute;right:8px;top:50%;transform:translateY(-50%);width:26px;height:15px;border-radius:999px;background:#c9bfae;cursor:pointer;box-shadow:inset 0 0 0 1px #00000014}
      .htf-trailing.on{background:#c9633f}
      .htf-trailing::after{content:'';position:absolute;top:2px;left:2px;width:11px;height:11px;border-radius:50%;background:#fff;transition:left .16s;box-shadow:0 1px 2px #0004}
      .htf-trailing.on::after{left:13px}
    `;
    function injectStyle(id, css) {
      if (typeof document === "undefined") return;
      if (!document.querySelector || !document.querySelector(`style[data-todo-css="${id}"]`)) {
        const tag = document.createElement("style");
        tag.setAttribute("data-todo-css", id);
        tag.textContent = css;
        (document.head || document.documentElement).appendChild(tag);
      }
    }
    function createTodoIcon(store) {
      return function TodoIcon({ size, active }) {
        const enabled = React.useSyncExternalStore ? React.useSyncExternalStore(store.subscribe, store.get) : store.get();
        const wide = size !== 18;
        return React.createElement(React.Fragment, null,
          React.createElement("svg", {
            width: 16, height: 16, viewBox: "0 0 24 24", fill: "none",
            stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true
          }, React.createElement("rect", {x: 3.5, y: 3.5, width: 17, height: 17, rx: 5}),
             React.createElement("path", {d: "m7.5 12 3 3 6-6"})),
          wide && React.createElement("span", {
            role: "switch", "aria-checked": enabled, "aria-label": "待办浮窗开关", title: enabled ? "关闭待办浮窗" : "打开待办浮窗",
            className: "htf-trailing" + (enabled ? " on" : ""),
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
    return {
      inject: ["slots", "layout", "connection"],
      apply(ctx) {
        injectStyle("trailing", TRAILING_CSS);
        const Panel = createPanel(ctx);
        const floatStore = createFloatStore((() => { try { return localStorage.getItem(FLOAT_KEY) !== "0"; } catch { return true; } })());
        const FloatingTodo = createFloatingTodo(ctx, floatStore);
        const TodoIcon = createTodoIcon(floatStore);
        ctx.effect(() => ctx.slots.inject("shell.overlay", () => ctx.slots.register({
          name: "shell.overlay", id: "local-todo.floating"
        }, FloatingTodo)), "todo: floating widget");
        ctx.effect(() => ctx.slots.inject("main", () => ctx.slots.register({
          name: "main", key: "local-todo", id: "local-todo.main"
        }, Panel)), "todo: main panel");
        ctx.effect(() => ctx.slots.inject("sidebar.panellist", () => ctx.slots.register({
          name: "sidebar.panellist", id: "local-todo", label: "待办清单", order: 15
        }, TodoIcon)), "todo: sidebar entry");
      }
    };
  }
});
