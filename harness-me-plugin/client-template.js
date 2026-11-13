// Built by build.mjs: the page runs in its own document, without global UI changes.
window.__ModuleLoader__.load({
  id: "harness-me-local",
  factory: function (require) {
    const React = require("react");
    const PAGE = __PAGE__;
    __FLOATING_WIDGET__
    function createPanel(ctx, preferences) {
      return function MePanel() {
        const lifecycle = React.useRef(null);
        React.useEffect(() => () => lifecycle.current?.(), []);
        const connect = React.useCallback(event => {
          lifecycle.current?.();
          const frame = event.currentTarget.contentWindow;
          frame.__mePreferences = { get: preferences.get, set: preferences.set, subscribe: preferences.subscribe };
          const aborter = new AbortController();
          let dispose = () => {};
          const syncTheme = () => {
            try {
              const root = document.documentElement;
              const style = getComputedStyle(root);
              const explicit = root.getAttribute('data-theme') || root.getAttribute('data-color-scheme') || '';
              const dark = /dark/i.test(explicit) || root.classList.contains('dark') || style.colorScheme === 'dark' || (!explicit && !root.classList.contains('light') && style.colorScheme !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches);
              frame.document.documentElement.dataset.theme = dark ? 'dark' : 'light';
              const bg = style.getPropertyValue('--dsw-alias-bg-base');
              if (bg.trim()) frame.document.documentElement.style.setProperty('--host-bg', bg);
            } catch {}
          };
          syncTheme();
          const observer = new MutationObserver(syncTheme);
          observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'style', 'data-theme', 'data-color-scheme'] });
          const media = window.matchMedia('(prefers-color-scheme: dark)');
          const onMedia = () => syncTheme();
          media.addEventListener?.('change', onMedia);
          if (typeof frame.__meConnect === 'function') dispose = frame.__meConnect(async request => {
            const transport = await ctx.connection.rpc.call('/api', 'localMe/request', { args: { request } }, aborter.signal);
            if (!transport.ok) throw new Error(transport.error?.message || 'Harness 连接失败');
            const result = transport.value;
            if (!result?.ok) {
              const error = new Error(result?.error?.message || 'Me 请求失败');
              error.code = result?.error?.code || 'REQUEST_FAILED';
              throw error;
            }
            return result.value;
          });
          lifecycle.current = () => { dispose?.(); aborter.abort(); observer.disconnect(); media.removeEventListener?.('change', onMedia); };
        }, []);
        return React.createElement('iframe', {
          title: 'Me · 我的日常', srcDoc: PAGE, onLoad: connect,
          style: { width: '100%', height: '100%', minHeight: 0, flex: 1, border: 0, display: 'block', colorScheme: 'light dark' }
        });
      };
    }
    const ME_SWITCH_CSS = `button:has(.me-trailing){position:relative}.me-trailing{position:absolute;right:8px;top:50%;transform:translateY(-50%);width:26px;height:15px;border-radius:999px;background:#b9c2bb;cursor:pointer;box-shadow:inset 0 0 0 1px #0002}.me-trailing.on{background:#5d9275}.me-trailing::after{content:'';position:absolute;top:2px;left:2px;width:11px;height:11px;border-radius:50%;background:#fff;transition:left .16s;box-shadow:0 1px 2px #0004}.me-trailing.on::after{left:13px}`;
    function MeIcon(prefs) {
      return function Icon({ size }) {
        const options = React.useSyncExternalStore(prefs.subscribe, prefs.get);
        const wide = size !== 18;
        return React.createElement(React.Fragment, null,
          React.createElement('svg', { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', 'aria-hidden': true },
            React.createElement('circle', { cx: 12, cy: 8, r: 3.5 }), React.createElement('path', { d: 'M5 21v-2a7 7 0 0 1 14 0v2M3 3h3M18 3h3' })),
          wide && React.createElement('span', {
            role: 'switch', 'aria-checked': options.enabled, 'aria-label': options.enabled ? '关闭 Me 悬浮窗' : '打开 Me 悬浮窗',
            title: options.enabled ? '关闭 Me 悬浮窗' : '打开 Me 悬浮窗',
            className: 'me-trailing' + (options.enabled ? ' on' : ''), tabIndex: -1,
            onClick: e => { e.stopPropagation(); e.preventDefault(); prefs.set({ enabled: !options.enabled }); }
          })
        );
      };
    }
    return {
      inject: ['slots', 'layout', 'connection'],
      apply(ctx) {
        if (typeof document !== 'undefined' && !document.querySelector('style[data-me-switch]')) {
          const style = document.createElement('style'); style.setAttribute('data-me-switch', ''); style.textContent = ME_SWITCH_CSS;
          (document.head || document.documentElement).appendChild(style);
          ctx.effect(() => () => style.remove(), 'me: sidebar switch style');
        }
        const preferences = createMePreferences();
        const Panel = createPanel(ctx, preferences);
        const Floating = createMeFloating(ctx, preferences);
        const Icon = MeIcon(preferences);
        ctx.effect(() => ctx.slots.inject('shell.overlay', () => ctx.slots.register({ name: 'shell.overlay', id: 'local-me.floating' }, Floating)), 'me: floating overlay');
        ctx.effect(() => ctx.slots.inject('main', () => ctx.slots.register({ name: 'main', key: 'local-me', id: 'local-me.main' }, Panel)), 'me: main panel');
        ctx.effect(() => ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({ name: 'sidebar.panellist', id: 'local-me', label: 'Me', order: 17 }, Icon)), 'me: sidebar entry');
      }
    };
  }
});
