// Included inside the client factory by build.py; no extra server or dependencies.
function createFloatStore(initial) {
  let value = initial;
  const listeners = new Set();
  return {
    get: () => value,
    set: next => { if (value !== next) { value = next; listeners.forEach(l => l()); } },
    subscribe: l => { listeners.add(l); return () => { listeners.delete(l); }; }
  };
}
function createFloatingTodo(ctx, store = createFloatStore(true)) {
  const h = React.createElement;
  const KEY = 'harness.todo.float.v1';
  const read = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } };
  const clamp = (pos, collapsed) => ({
    x: Math.max(8, Math.min(Number.isFinite(pos.x) ? pos.x : window.innerWidth - 330, Math.max(8, window.innerWidth - Math.min(collapsed ? 170 : 310, window.innerWidth - 16) - 8))),
    y: Math.max(54, Math.min(Number.isFinite(pos.y) ? pos.y : 68, Math.max(54, window.innerHeight - (collapsed ? 48 : 200))))
  });
  return function FloatingTodo() {
    const [collapsed, setCollapsed] = React.useState(() => !!read().collapsed);
    const [position, setPosition] = React.useState(() => clamp(read(), !!read().collapsed));
    const [snapshot, setSnapshot] = React.useState(null);
    const [error, setError] = React.useState('');
    const [busy, setBusy] = React.useState(false);
    const [enabled, setEnabled] = React.useState(() => store.get());
    const [draft, setDraft] = React.useState('');
    const [draftPrio, setDraftPrio] = React.useState('mid');
    const [showAdd, setShowAdd] = React.useState(false);
    const locked = React.useRef(false);
    const drag = React.useRef(null);
    const lifetime = React.useRef(null);
    const collapsedRef = React.useRef(collapsed);
    collapsedRef.current = collapsed;
    const call = React.useCallback(async request => {
      const reply = await ctx.connection.rpc.call('/api', 'localTodo/request', { args: { request } }, lifetime.current?.signal);
      if (!reply.ok) throw new Error(reply.error?.message || '连接失败');
      if (!reply.value?.ok) throw new Error(reply.value?.error?.message || '待办读取失败');
      return reply.value.value;
    }, []);
    React.useEffect(() => store.subscribe(() => setEnabled(store.get())), [store]);
    React.useEffect(() => {
      if (!enabled) return;
      const controller = new AbortController(); lifetime.current = controller;
      let stopped = false;
      const refresh = async () => {
        if (locked.current || stopped) return;
        locked.current = true;
        try { const next = await call({op:'snapshot'}); if (!stopped) { setSnapshot(next); setError(''); } }
        catch(e) { if (!stopped) setError(e.message); }
        finally { locked.current = false; }
      };
      refresh();
      const timer = setInterval(refresh, 2000);
      const resize = () => setPosition(p => clamp(p, collapsedRef.current));
      window.addEventListener('resize', resize);
      return () => { stopped = true; clearInterval(timer); controller.abort(); window.removeEventListener('resize', resize); };
    }, [call, enabled]);
    React.useEffect(() => {
      try { localStorage.setItem(KEY, JSON.stringify({...position,collapsed})); } catch {}
    }, [position, collapsed]);
    const toggle = async task => {
      if (locked.current || !snapshot) return;
      locked.current = true; setBusy(true);
      try {
        const next = await call({op:'update',id:task.id,patch:{done:!task.done},...(task.recurrence ? {occurrenceDate:task.occurrenceDate} : {}),expectedRevision:snapshot.revision});
        if (!lifetime.current.signal.aborted) { setSnapshot(next); setError(''); }
      } catch(e) { if (!lifetime.current.signal.aborted) setError(e.message + '；请等候同步后重试'); }
      finally { locked.current = false; if (!lifetime.current.signal.aborted) setBusy(false); }
    };
    const add = async () => {
      const text = draft.trim();
      if (!text || locked.current || !snapshot) return;
      locked.current = true; setBusy(true);
      try {
        const next = await call({op:'add', text, prio: draftPrio, due: '', expectedRevision: snapshot.revision});
        if (!lifetime.current.signal.aborted) { setSnapshot(next); setDraft(''); setError(''); }
      } catch(e) { if (!lifetime.current.signal.aborted) setError(e.message + '；请等候同步后重试'); }
      finally { locked.current = false; if (!lifetime.current.signal.aborted) setBusy(false); }
    };
    if (!enabled) return null;
    const tasks = snapshot?.tasks.filter(t => !t.done) || [];
    const today = snapshot?.serverToday || (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; })();
    const daily = tasks.filter(t => !t.due || t.due <= today);
    const future = tasks.filter(t => t.due && t.due > today);
    const grouped = daily.length > 0 && future.length > 0;
    const repeatLabel = t => !t.recurrence ? '' : t.recurrence.kind === 'daily' ? ' · ↻ 每天' : ' · ↻ 每周'+t.recurrence.days.map(d=>['一','二','三','四','五','六','日'][d-1]).join('、');
    const taskRow = t => h('li',{className:'htf-task',key:t.id},
      h('button',{className:'htf-check',type:'button',disabled:busy,onClick:()=>toggle(t),'aria-label':`标记完成：${t.text}`}),
      h('div',null,h('div',{className:'htf-text'},t.text),h('div',{className:'htf-meta'+(t.prio==='high'?' htf-high':'')},({high:'高优先级',mid:'中优先级',low:'低优先级'}[t.prio]||'中优先级')+(t.due?' · '+t.due:'')+repeatLabel(t))));
    const group = (label, items) => h('section',{className:'htf-group',key:label,'aria-label':label},
      h('div',{className:'htf-group-label'},label,h('span',null,items.length)),
      h('ul',{className:'htf-list'},...items.map(taskRow)));
    const button = (label, onClick, text) => h('button',{type:'button',className:'htf-button',onClick,'aria-label':label,title:label},text);
    return h('section', {
      className:'htf-root', 'aria-label':'悬浮待办清单', 'data-window-drag-exclude': true,
      style:{left:position.x,top:position.y,width:collapsed ? 170 : 310}
    },
      h('style',null,`
        .htf-root{position:fixed;z-index:80;max-width:calc(100vw - 16px);box-sizing:border-box;background:var(--dsw-alias-bg-layer-1,#fffdf8);color:var(--dsw-alias-label-primary,#241f19);border:1px solid var(--dsw-alias-border-l2,#e7ddcc);border-radius:17px;box-shadow:0 12px 38px #0002;font:13px/1.5 -apple-system,BlinkMacSystemFont,'PingFang SC',sans-serif;pointer-events:auto;overflow:hidden}
        .htf-header{display:flex;align-items:center;gap:6px;padding:4px 10px;min-height:30px;cursor:grab;touch-action:none;user-select:none}
        .htf-header:active{cursor:grabbing}.htf-heading{flex:1;font-weight:650;white-space:nowrap}.htf-count{color:#c9633f;font-size:11px;margin-left:7px}
        .htf-button{border:0;background:transparent;color:inherit;border-radius:7px;cursor:pointer;padding:2px 6px;font:inherit;line-height:1.4}.htf-button:hover{background:#8882}.htf-button:focus-visible,.htf-check:focus-visible,.htf-header:focus-visible{outline:2px solid #c9633f;outline-offset:-2px}
        .htf-add{display:flex;gap:5px;padding:6px 10px;border-top:1px solid #8882}
        .htf-add-input{flex:1;min-width:0;font:inherit;color:inherit;background:var(--dsw-alias-bg-layer-2,#f3ece0);border:1px solid var(--dsw-alias-border-l2,#e7ddcc);border-radius:8px;padding:4px 8px;outline:none}.htf-add-input:focus{border-color:#c9633f}
        .htf-add-prio{font:inherit;color:inherit;background:var(--dsw-alias-bg-layer-2,#f3ece0);border:1px solid var(--dsw-alias-border-l2,#e7ddcc);border-radius:8px;padding:4px 2px}
        .htf-add-btn{font:inherit;border:0;border-radius:8px;cursor:pointer;color:#fff;background:#c9633f;padding:4px 10px}.htf-add-btn:hover{background:#a9482a}.htf-add-btn:disabled{opacity:.4;cursor:default}
        .htf-scroll{max-height:min(310px,45vh);overflow:auto}.htf-list{list-style:none;margin:0;padding:0 12px}.htf-group-label{display:flex;justify-content:space-between;align-items:center;padding:7px 12px 4px;font-size:10px;font-weight:600;letter-spacing:.08em;opacity:.55;background:#88808}.htf-group-label span{font-size:10px;letter-spacing:0}.htf-group+.htf-group{border-top:1px solid #8882}.htf-group .htf-task:first-child{border-top:0}.htf-task{display:flex;gap:9px;padding:11px 0;border-top:1px solid #8882}.htf-check{width:19px;height:19px;border:1.5px solid #a79989;border-radius:50%;background:transparent;flex:none;margin-top:2px;cursor:pointer}.htf-check:hover{border-color:#c9633f;background:#c9633f20}.htf-check:disabled{opacity:.4;cursor:wait}.htf-text{overflow-wrap:anywhere}.htf-meta{font-size:11px;opacity:.65;margin-top:3px}.htf-high{color:#c9633f;opacity:1}.htf-footer{display:flex;justify-content:space-between;align-items:center;padding:3px 10px;min-height:27px;border-top:1px solid #8882;font-size:10px;opacity:.85}.htf-empty{padding:18px 12px;text-align:center;opacity:.65}.htf-error{font-size:11px;color:#b64438;padding:0 12px 9px;overflow-wrap:anywhere}
      `),
      h('div', {
        className:'htf-header',tabIndex:0,role:'group','aria-label':'拖动待办浮窗，方向键移动，Home 回到右上角',
        onPointerDown:e => {
          if(e.target.closest('button') || e.target.closest('input') || e.target.closest('select') || e.button !== 0) return;
          drag.current={x:e.clientX,y:e.clientY,start:position};e.currentTarget.setPointerCapture(e.pointerId);
        },
        onPointerMove:e => { if(drag.current) setPosition(clamp({x:drag.current.start.x+e.clientX-drag.current.x,y:drag.current.start.y+e.clientY-drag.current.y},collapsed)); },
        onPointerUp:() => {drag.current=null;},onPointerCancel:() => {drag.current=null;},onLostPointerCapture:() => {drag.current=null;},
        onKeyDown:e => {
          if(e.target !== e.currentTarget) return;
          const delta={ArrowLeft:[-16,0],ArrowRight:[16,0],ArrowUp:[0,-16],ArrowDown:[0,16]}[e.key];
          if(delta){e.preventDefault();setPosition(p=>clamp({x:p.x+delta[0],y:p.y+delta[1]},collapsed));}
          if(e.key==='Home'){e.preventDefault();setPosition(clamp({},collapsed));}
        }
      }, h('span',{className:'htf-heading'},'✓ 待办',h('span',{className:'htf-count'},snapshot ? tasks.length : '…')),
      button(collapsed?'展开待办':'折叠待办',()=>{setCollapsed(!collapsed);setPosition(p=>clamp(p,!collapsed));},collapsed?'＋':'−')),
      !collapsed && h(React.Fragment,null,
        !snapshot ? h('div',{className:'htf-empty'},'正在连接清单…') : tasks.length ? h('div',{className:'htf-scroll'},
          ...(grouped ? [group('每日',daily),group('未来',future)] : [h('ul',{className:'htf-list',key:'all'},...tasks.map(taskRow))])) : h('div',{className:'htf-empty'},'全部完成，歇一会儿吧 ✦'),
        h('div',{className:'htf-footer'},
          button(showAdd ? '收起添加' : '添加待办',()=>setShowAdd(s=>!s), showAdd ? '－ 收起' : '＋ 添加'),
          button('打开完整待办清单',()=>ctx.layout.selectPanel('local-todo'),'完整清单 ↗')),
        showAdd && h('div',{className:'htf-add'},
          h('input',{className:'htf-add-input',value:draft,placeholder:'新增待办…',maxLength:200,'aria-label':'新待办内容',autoFocus:true,onChange:e=>setDraft(e.target.value),onKeyDown:e=>{ if(e.key==='Enter'){e.preventDefault();add();} }}),
          h('select',{className:'htf-add-prio',value:draftPrio,'aria-label':'优先级',onChange:e=>setDraftPrio(e.target.value)},
            h('option',{value:'high'},'高'),h('option',{value:'mid'},'中'),h('option',{value:'low'},'低')),
          h('button',{className:'htf-add-btn',type:'button',disabled:busy || !draft.trim(),onClick:add},'添加'))),
      error && h('div',{className:'htf-error',role:'status'},error)
    );
  };
}
