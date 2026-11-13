// Only preferences and window position are persisted. Personal drafts stay in memory.
function createMePreferences() {
  const key = 'harness.me.ui.v2';
  let prefs = { enabled: false, hydration: true, movement: true, ai: true, position: null };
  try {
    const saved = JSON.parse(localStorage.getItem(key) || '{}');
    const p = saved.position;
    prefs = {
      enabled: saved.enabled === true,
      hydration: saved.reminderVersion === 2 ? saved.hydration !== false : true,
      movement: saved.movement !== false,
      reminderVersion: 2,
      // The user explicitly requested AI previews; this can be disabled in Me settings.
      ai: saved.ai !== false,
      position: p && Number.isFinite(p.x) && Number.isFinite(p.y) ? { x: p.x, y: p.y } : null
    };
  } catch {}
  const listeners = new Set();
  return {
    get: () => prefs,
    subscribe: fn => { listeners.add(fn); return () => listeners.delete(fn); },
    set: patch => {
      prefs = { ...prefs, ...patch };
      try { localStorage.setItem(key, JSON.stringify(prefs)); } catch {}
      for (const fn of listeners) fn();
    }
  };
}

function meHydrationDue(enabled, lastWaterAt, baseline, now) {
  const latest = Math.max(Number.isFinite(Date.parse(lastWaterAt)) ? Date.parse(lastWaterAt) : 0, baseline);
  return enabled && now - latest >= 60 * 60 * 1000;
}
function meReminderStyle(waterDue, movementDue) {
  if (movementDue) return { border: '2px solid #c7333f', boxShadow: '0 0 0 3px #c7333f18, 0 5px 20px #c7333f38', label: '走动记录提醒' };
  if (waterDue) return { border: '2px solid #174a8b', boxShadow: '0 0 0 3px #174a8b18, 0 5px 20px #174a8b38', label: '饮水记录提醒' };
  return { border: '1px solid var(--dsw-alias-border-l2,#d4dfd7)', boxShadow: '0 6px 24px #0003', label: '' };
}
function meMovementDue(enabled, lastMovementAt, baseline, now) {
  const latest = Math.max(Number.isFinite(Date.parse(lastMovementAt)) ? Date.parse(lastMovementAt) : 0, baseline);
  return enabled && now - latest >= 2 * 60 * 60 * 1000;
}
function meClampPosition(position, width = 360, height = 240, panelWidth = 340, panelHeight = 260) {
  return {
    x: Math.min(Math.max(0, width - panelWidth - 8), Math.max(0, position.x)),
    y: Math.min(Math.max(0, height - panelHeight - 8), Math.max(0, position.y))
  };
}
function meLocalDate() {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

function createMeFloating(ctx, prefs) {
  const h = React.createElement;
  const request = async args => {
    const response = await ctx.connection.rpc.call('/api', 'localMe/request', { args: { request: args } });
    if (!response.ok || !response.value?.ok) {
      const error = new Error(response.value?.error?.message || response.error?.message || 'Me 连接失败');
      error.code = response.value?.error?.code;
      throw error;
    }
    return response.value.value;
  };
  const icon = name => {
    const shapes = {
      water: h('path', { d: 'M12 2C9 7 5 11 5 15a7 7 0 0 0 14 0c0-4-4-8-7-13Z' }),
      walk: h(React.Fragment, null, h('circle', { cx: 14, cy: 4, r: 2 }), h('path', { d: 'M10 21l2-7-3-3 3-4 3 4 4 1M7 13l2-5 3-1M12 14l5 7' })),
      exercise: h('path', { d: 'M2 9h3m14 0h3M5 6v6m14-6v6M7 4h3v10H7zm7 0h3v10h-3zM10 9h4' }),
      body: h(React.Fragment, null,
        h('path', { d: 'M3 17l5-5 4 3 7-9M3 21h18' }),
        h('path', { d: 'M15 6h4v4' })),
      daily: h(React.Fragment, null,
        h('path', { d: 'M6 3h12v18H6zM9 8l2 2 4-4M9 15h6' })),
      send: h('path', { d: 'M4 4l17 8-17 8 3-8-3-8Zm3 8h14' }),
      close: h('path', { d: 'M6 12h12' }),
      check: h('path', { d: 'M5 12l4 4L19 6' })
    };
    return h('svg', {
      width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
      strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true
    }, shapes[name]);
  };
  const metricText = metric => ({
    water: '饮水', exercise: '运动', weight: '体重', sleep: '睡眠', food: '食物'
  }[metric.kind] || metric.kind) + ` ${metric.value} ${{ count: '次', ml: 'ml', min: '分钟', kg: 'kg', hour: '小时', g: 'g' }[metric.unit] || metric.unit}`;
  const missing = (value, unit) => value == null ? '暂无记录' : `${value} ${unit}`;

  return function MeFloating() {
    const options = React.useSyncExternalStore(prefs.subscribe, prefs.get);
    const [open, setOpen] = React.useState(false);
    const [draft, setDraft] = React.useState('');
    const [busy, setBusy] = React.useState(false);
    const [status, setStatus] = React.useState('');
    const [water, setWater] = React.useState(null);
    const [movement, setMovement] = React.useState(null);
    const [now, setNow] = React.useState(Date.now());
    const [position, setPosition] = React.useState(options.position);
    const [preview, setPreview] = React.useState(null);
    const [panel, setPanel] = React.useState('');
    const [minutes, setMinutes] = React.useState('10');
    const [stats, setStats] = React.useState(null);
    const [daily, setDaily] = React.useState(null);
    const baseline = React.useRef(Date.now());
    const movementBaseline = React.useRef(Date.now());
    const alive = React.useRef(true);
    const drag = React.useRef(null);
    const suppressClick = React.useRef(false);
    const positionRef = React.useRef(position);
    const rootRef = React.useRef(null);
    const busyRef = React.useRef(false);
    positionRef.current = position;

    React.useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);
    React.useEffect(() => { baseline.current = Date.now(); }, [options.hydration, options.enabled]);
    React.useEffect(() => { movementBaseline.current = Date.now(); }, [options.movement, options.enabled]);
    React.useEffect(() => {
      if (!options.enabled) return;
      let stopped = false;
      const refresh = async () => {
        try {
          const value = await request({ op: 'stats', days: 1, timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone, includeSensitive: true });
          if (!stopped) { setWater(value.lastWaterAt); setMovement(value.lastMovementAt); }
        } catch {}
      };
      refresh();
      const timer = setInterval(() => { setNow(Date.now()); refresh(); }, 30000);
      return () => { stopped = true; clearInterval(timer); };
    }, [options.enabled]);
    React.useEffect(() => {
      const clamp = () => setPosition(old => old ? meClampPosition(old, window.innerWidth, window.innerHeight, rootRef.current?.offsetWidth || 340, rootRef.current?.offsetHeight || 260) : old);
      window.addEventListener('resize', clamp);
      return () => window.removeEventListener('resize', clamp);
    }, []);
    React.useEffect(() => {
      if (!options.enabled || !positionRef.current) return;
      const current = positionRef.current;
      const clamped = meClampPosition(current, window.innerWidth, window.innerHeight, rootRef.current?.offsetWidth || 340, rootRef.current?.offsetHeight || 260);
      if (clamped.x !== current.x || clamped.y !== current.y) setPosition(clamped);
    }, [open, panel, options.enabled]);

    const beginDrag = e => {
      if (e.button !== 0 || e.target.closest('textarea,select,input,a') || (e.target.closest('button') && e.currentTarget !== e.target)) return;
      const rect = rootRef.current?.getBoundingClientRect();
      drag.current = {
        pointerId: e.pointerId, startX: e.clientX, startY: e.clientY,
        origin: positionRef.current || { x: rect?.left ?? Math.max(0, window.innerWidth - 370), y: rect?.top ?? Math.max(0, window.innerHeight - 200) },
        moved: false
      };
      e.currentTarget.setPointerCapture?.(e.pointerId);
    };
    const moveDrag = e => {
      const d = drag.current;
      if (!d || d.pointerId !== e.pointerId) return;
      const dx = e.clientX - d.startX, dy = e.clientY - d.startY;
      if (Math.abs(dx) + Math.abs(dy) > 4) d.moved = true;
      if (d.moved) setPosition(meClampPosition({ x: d.origin.x + dx, y: d.origin.y + dy }, window.innerWidth, window.innerHeight, rootRef.current?.offsetWidth || 340, rootRef.current?.offsetHeight || 260));
    };
    const endDrag = e => {
      const d = drag.current;
      if (!d || d.pointerId !== e.pointerId) return;
      drag.current = null;
      if (d.moved) {
        const moved = meClampPosition({ x: d.origin.x + e.clientX - d.startX, y: d.origin.y + e.clientY - d.startY }, window.innerWidth, window.innerHeight, rootRef.current?.offsetWidth || 340, rootRef.current?.offsetHeight || 260);
        setPosition(moved);
        prefs.set({ position: moved });
        suppressClick.current = true;
        setTimeout(() => { suppressClick.current = false; }, 0);
      }
    };
    const beginBusy = () => {
      if (busyRef.current) return false;
      busyRef.current = true;
      setBusy(true);
      return true;
    };
    const endBusy = () => { busyRef.current = false; if (alive.current) setBusy(false); };

    const quick = async (content, metrics, category) => {
      if (!beginBusy()) return false;
      setStatus('');
      try {
        const result = await request({ op: 'add', content, occurredAt: new Date().toISOString(), source: 'Me 悬浮窗', sensitive: false, metrics, category, ...(['走动','运动'].includes(category) ? { activity: 'exercise' } : {}) });
        if (metrics.some(m => m.kind === 'water')) setWater(result.record.occurredAt);
        if (['走动','运动'].includes(category)) { setMovement(result.record.occurredAt); setNow(Date.now()); }
        setStatus(category === '饮水' ? '饮水已记录' : category === '走动' ? '走动已记录' : `运动 ${metrics[0].value} 分钟已记录`);
        return true;
      } catch (e) {
        if (alive.current) setStatus('记录失败：' + e.message);
        return false;
      } finally { endBusy(); }
    };
    const prepare = async () => {
      const content = draft.trim();
      if (!content || !beginBusy()) return;
      setStatus('');
      let extracted = null, error = '';
      if (options.ai) {
        try { extracted = await request({ op: 'previewAnalysis', content }); }
        catch (e) { error = e.message || '当前无法使用 AI'; }
      }
      if (alive.current) {
        setPreview({
          content, category: extracted?.category || '', metrics: Array.isArray(extracted?.metrics) ? extracted.metrics : [],
          summary: extracted?.summary || '', model: extracted?.model || '', ai: Boolean(extracted), error
        });
        endBusy();
      } else endBusy();
    };
    const confirm = async () => {
      if (!preview || !beginBusy()) return;
      try {
        await request({
          op: 'add', content: preview.content, occurredAt: new Date().toISOString(), source: 'Me 悬浮窗', sensitive: false,
          ...(preview.category ? { category: preview.category } : {}),
          ...(preview.metrics.length ? { metrics: preview.metrics } : {}),
          ...(preview.ai ? { analysis: { status: 'done', summary: preview.summary, model: preview.model, analyzedAt: new Date().toISOString() } } : {})
        });
        if (alive.current) {
          setDraft(current => current === preview.content ? '' : current);
          setPreview(null);
          setStatus('已保存');
        }
      } catch (e) {
        if (alive.current) setStatus('保存失败：' + e.message + '；草稿仍在');
      } finally { endBusy(); }
    };
    const showPanel = async key => {
      if (panel === key) { setPanel(''); return; }
      setPanel(key);
      setStatus('');
      try {
        if (key === 'body') {
          setStats(null);
          setStats(await request({ op: 'stats', days: 7, timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone, includeSensitive: true }));
        }
        if (key === 'daily') {
          setDaily(null);
          setDaily(await request({ op: 'dailyList', date: meLocalDate() }));
        }
      } catch (e) { setStatus((key === 'body' ? '身体记录' : '今日事项') + '读取失败：' + e.message); }
    };
    const toggleDaily = async item => {
      if (!daily || !beginBusy()) return;
      try {
        const result = await request({ op: 'dailyUpdate', id: item.id, expectedRevision: daily.revision, date: daily.date, done: !item.done });
        setDaily(current => current ? { ...current, revision: result.revision, items: current.items.map(x => x.id === item.id ? { ...result.item, done: !item.done } : x) } : current);
      } catch (e) {
        setStatus('事项未更新：' + e.message);
        try { setDaily(await request({ op: 'dailyList', date: meLocalDate() })); } catch {}
      } finally { endBusy(); }
    };

    if (!options.enabled) return null;
    const due = meHydrationDue(options.hydration, water, baseline.current, now);
    const movementDue = meMovementDue(options.movement, movement, movementBaseline.current, now);
    const reminder = meReminderStyle(due, movementDue);
    const at = position ? meClampPosition(position, window.innerWidth, window.innerHeight, rootRef.current?.offsetWidth || 340, rootRef.current?.offsetHeight || 260) : null;
    const base = {
      position: 'fixed', ...(at ? { left: at.x, top: at.y } : { right: 24, bottom: 24 }), zIndex: 1000,
      font: '13px/1.5 system-ui', color: 'var(--dsw-alias-label-primary,#263b32)', pointerEvents: 'auto'
    };
    const border = reminder.border;
    const circle = {
      display: 'inline-grid', placeItems: 'center', width: 38, height: 38, padding: 0, flex: '0 0 38px',
      borderRadius: '50%', border: '1px solid var(--dsw-alias-border-l2,#9caa9f)',
      background: 'var(--dsw-alias-bg-layer-2,transparent)', color: 'inherit', cursor: 'pointer'
    };
    const tool = (name, label, onClick, disabled = false, active = false) => h('button', {
      type: 'button', onClick, disabled, title: label, 'aria-label': label, 'aria-pressed': active,
      style: { ...circle, ...(active ? { color: 'var(--dsw-alias-brand-primary,#497563)', borderColor: 'currentColor' } : {}) }
    }, icon(name));

    return h('div', { 'data-me-floating': true, 'data-window-drag-exclude': true, ref: rootRef, style: base },
      open ? h('section', {
        'aria-label': 'Me 随手记悬浮窗',
        style: { width: 'min(340px,calc(100vw - 16px))', padding: 14, background: 'var(--dsw-alias-bg-layer-1,#fffefb)', border, borderRadius: 18, boxShadow: reminder.label ? reminder.boxShadow : '0 10px 38px #0003' }
      },
        h('div', {
          onPointerDown: beginDrag, onPointerMove: moveDrag, onPointerUp: endDrag, onPointerCancel: endDrag,
          style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', touchAction: 'none', cursor: 'grab', padding: '0 0 10px', userSelect: 'none' },
          title: '拖动 Me 悬浮窗'
        }, h('strong', { style: { letterSpacing: '.08em' } }, 'Me'), tool('close', '收起 Me', () => setOpen(false))),
        h('textarea', {
          'aria-label': 'Me 随手记内容', value: draft, maxLength: 20000, disabled: busy && !preview,
          onChange: e => setDraft(e.target.value),
          onKeyDown: e => { if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); prepare(); } },
          placeholder: '记录刚刚发生的事…',
          style: { width: '100%', minHeight: 68, resize: 'vertical', boxSizing: 'border-box', background: 'transparent', color: 'inherit', border: '1px solid var(--dsw-alias-border-l2,#9caa9f)', borderRadius: 10, padding: 10, outline: 'none' }
        }),
        h('div', { style: { display: 'flex', justifyContent: 'space-between', gap: 8, marginTop: 10 } },
          tool('water', '记一次喝水', async () => { if (await quick('喝了口水', [{ kind: 'water', value: 1, unit: 'count' }], '饮水')) setNow(Date.now()); }, busy),
          tool('walk', '记一次起身走动', () => quick('起身走动了一次', [], '走动'), busy),
          tool('exercise', '记录运动时长', () => showPanel('exercise'), busy, panel === 'exercise'),
          tool('body', '查看身体记录概览', () => showPanel('body'), false, panel === 'body'),
          tool('daily', '查看今日 Me 日常', () => showPanel('daily'), false, panel === 'daily'),
          tool('send', busy ? '正在整理' : '整理并预览', prepare, busy || !draft.trim())
        ),
        panel === 'exercise' && h('div', { style: { display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 } },
          h('select', { 'aria-label': '运动时长', value: minutes, onChange: e => setMinutes(e.target.value), style: { flex: 1, color: 'inherit', background: 'transparent', padding: 6 } },
            ...[5, 10, 20, 30, 45, 60].map(v => h('option', { key: v, value: String(v) }, v + ' 分钟'))),
          tool('check', '确认运动记录', async () => { if (await quick('运动了 ' + minutes + ' 分钟', [{ kind: 'exercise', value: Number(minutes), unit: 'min' }], '运动')) setPanel(''); }, busy)
        ),
        panel === 'body' && h('div', { style: { marginTop: 12, maxHeight: 210, overflow: 'auto', fontSize: 12 } },
          h('strong', null, '身体记录 · 今天'),
          h('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px 12px', marginTop: 6 } },
            h('span', null, '饮水 ' + missing(stats?.days?.at(-1)?.waterCount, '次')),
            h('span', null, '运动 ' + missing(stats?.days?.at(-1)?.exerciseMin, '分钟')),
            h('span', null, '水量 ' + missing(stats?.days?.at(-1)?.waterMl, 'ml')),
            h('span', null, '睡眠 ' + missing(stats?.days?.at(-1)?.sleepHour, '小时'))),
          !stats && h('div', null, '正在读取…'),
          stats && h('div', { style: { opacity: .7, marginTop: 6 } }, '仅展示已有记录，不代表健康诊断。')),
        panel === 'daily' && h('div', { style: { marginTop: 12, maxHeight: 210, overflow: 'auto' } },
          h('strong', null, '今日 Me 日常'),
          !daily && h('div', null, '正在读取…'),
          ...(daily?.items || []).map(item => h('button', {
            key: item.id, type: 'button', disabled: busy, onClick: () => toggleDaily(item),
            title: item.done ? '恢复为未完成' : '标记今天完成',
            'aria-label': item.done ? '恢复为未完成' : '标记今天完成',
            style: { display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '7px 0', border: 0, background: 'transparent', color: 'inherit', textAlign: 'left', cursor: 'pointer', textDecoration: item.done ? 'line-through' : 'none', opacity: item.done ? .55 : 1 }
          }, h('span', { 'aria-hidden': true, style: { ...circle, width: 20, height: 20, flexBasis: 20, fontSize: 12 } }, item.done ? '✓' : ''), h('span', null, item.text))),
          daily && !daily.items.length && h('div', { style: { opacity: .65, marginTop: 6 } }, '暂无事项，可在 Me 页面添加。')),
        status && h('div', { role: 'status', style: { fontSize: 12, marginTop: 8, whiteSpace: 'pre-wrap' } }, status)
      ) : h('button', {
        type: 'button', 'aria-label': reminder.label ? '展开 Me，' + reminder.label : '展开 Me 随手记',
        onPointerDown: beginDrag, onPointerMove: moveDrag, onPointerUp: endDrag, onPointerCancel: endDrag,
        onClick: () => { if (suppressClick.current) { suppressClick.current = false; return; } setOpen(true); },
        title: reminder.label || '点击展开；也可拖动',
        style: { ...circle, width: 48, height: 48, border, background: 'var(--dsw-alias-bg-layer-1,#fffefb)', boxShadow: reminder.boxShadow, touchAction: 'none', fontWeight: 650 }
      }, 'Me'),
      preview && h('div', {
        role: 'dialog', 'aria-modal': true, 'aria-label': '确认 Me 记录', 'data-window-drag-exclude': true,
        style: { position: 'fixed', inset: 0, zIndex: 1001, display: 'grid', placeItems: 'center', background: '#0007', padding: 16 }
      }, h('section', {
        style: { background: 'var(--dsw-alias-bg-layer-1,#fffefb)', color: 'inherit', borderRadius: 18, padding: 20, width: 'min(380px,100%)', maxHeight: '85vh', overflow: 'auto', boxShadow: '0 16px 60px #0005' }
      },
        h('h3', { style: { marginTop: 0 } }, '确认这条记录'),
        h('p', { style: { whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' } }, preview.content),
        preview.ai ? h(React.Fragment, null,
          h('p', null, '分类：' + (preview.category || '未分类')),
          h('p', null, preview.metrics.length ? preview.metrics.map(metricText).join(' · ') : '未提取到明确数量'),
          preview.summary && h('p', { style: { opacity: .75 } }, preview.summary)
        ) : h('p', null, options.ai ? 'AI 暂不可用，将只保存原文。' : 'AI 整理已在 Me 设置中关闭，将只保存原文。'),
        preview.error && h('p', { style: { fontSize: 12, opacity: .7 } }, preview.error),
        h('div', { style: { display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 16 } },
          h('button', { type: 'button', onClick: () => setPreview(null), disabled: busy }, '取消'),
          h('button', { type: 'button', onClick: confirm, disabled: busy, style: { borderRadius: 10, padding: '7px 14px' } }, busy ? '保存中…' : '确认保存'))))
    );
  };
}
