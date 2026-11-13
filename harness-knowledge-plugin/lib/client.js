// Generated bundle template; PAGE and FLOATING_WIDGET are substituted by build.py.
window.__ModuleLoader__.load({
  id: "harness-knowledge-local",
  factory: function(require) {
    const React = require("react");
    const PAGE = "<!doctype html>\n<html lang=\"zh-CN\" data-theme=\"light\">\n<head>\n<meta charset=\"utf-8\">\n<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n<title>条目</title>\n<link rel=\"icon\" href=\"data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🔬</text></svg>\">\n<style>\n  :root {\n    --bg: #f6f7fb;\n    --surface: #ffffff;\n    --surface-2: #eef1f7;\n    --ink: #1b2333;\n    --ink-soft: #44506a;\n    --muted: #8a93a8;\n    --line: #e3e8f1;\n    --accent: #4f6ef7;\n    --accent-deep: #3a55d6;\n    --accent-wash: #e9eeff;\n    --ok: #3f9d6c;\n    --warn: #b9832f;\n    --danger: #c74b4b;\n    --radius: 16px;\n    color-scheme: light;\n  }\n  [data-theme=\"dark\"] {\n    --bg: #12151d;\n    --surface: #1a1f2b;\n    --surface-2: #222839;\n    --ink: #eef1f8;\n    --ink-soft: #c3cadd;\n    --muted: #7d869c;\n    --line: #2c3345;\n    --accent: #7b96ff;\n    --accent-deep: #a3b6ff;\n    --accent-wash: #232b47;\n    --ok: #7cc29b;\n    --warn: #d9a45e;\n    --danger: #e07c7c;\n    color-scheme: dark;\n  }\n  * { box-sizing: border-box; }\n  html, body { height: 100%; }\n  body {\n    margin: 0; padding: 0;\n    background: var(--bg); color: var(--ink);\n    font-family: -apple-system, BlinkMacSystemFont, \"SF Pro Text\", \"PingFang SC\",\n                 \"Hiragino Sans GB\", \"Microsoft YaHei\", system-ui, sans-serif;\n    -webkit-font-smoothing: antialiased;\n    transition: background .35s ease, color .35s ease;\n    display: flex; flex-direction: column; overflow: hidden;\n  }\n  header { padding: 14px 16px 10px; border-bottom: 1px solid var(--line); background: var(--surface); }\n  .brand { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }\n  .brand h1 { font-size: 15px; margin: 0; font-weight: 700; letter-spacing: .02em; }\n  .brand .count { font-size: 11px; color: var(--muted); }\n  .toolbar { display: flex; gap: 8px; align-items: center; }\n  .search { flex: 1; position: relative; }\n  .search input {\n    width: 100%; font: inherit; color: var(--ink);\n    background: var(--surface-2); border: 1px solid var(--line); border-radius: 10px;\n    padding: 7px 10px 7px 28px; outline: none;\n  }\n  .search input:focus { border-color: var(--accent); }\n  .search svg { position: absolute; left: 9px; top: 50%; transform: translateY(-50%); opacity: .5; }\n  .btn {\n    font: inherit; font-size: 12.5px; cursor: pointer;\n    background: var(--surface-2); color: var(--ink-soft); border: 1px solid var(--line);\n    border-radius: 10px; padding: 7px 11px; white-space: nowrap;\n  }\n  .btn:hover { background: var(--line); }\n  .btn.primary { background: var(--accent); color: #fff; border-color: var(--accent); }\n  .btn.primary:hover { background: var(--accent-deep); }\n  .btn:disabled { opacity: .45; cursor: default; }\n  .chips { display: flex; gap: 6px; flex-wrap: wrap; padding: 9px 16px; border-bottom: 1px solid var(--line); }\n  .chip {\n    font: inherit; font-size: 12px; cursor: pointer; padding: 4px 11px; border-radius: 999px;\n    background: transparent; color: var(--ink-soft); border: 1px solid var(--line);\n  }\n  .chip.on { background: var(--accent-wash); color: var(--accent-deep); border-color: var(--accent); }\n  main { flex: 1; display: flex; min-height: 0; }\n  .list { width: 38%; min-width: 220px; border-right: 1px solid var(--line); overflow-y: auto; background: var(--surface); }\n  .list-item { padding: 12px 16px; border-bottom: 1px solid var(--line); cursor: pointer; }\n  .list-item:hover { background: var(--surface-2); }\n  .list-item.on { background: var(--accent-wash); }\n  .list-item .t { font-weight: 650; font-size: 13.5px; line-height: 1.35; }\n  .list-item .meta { font-size: 11px; color: var(--muted); margin-top: 4px; display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }\n  .list-item .sum { font-size: 12px; color: var(--ink-soft); margin-top: 5px; line-height: 1.45; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }\n  .badge { font-size: 10.5px; color: var(--accent-deep); background: var(--accent-wash); padding: 1px 7px; border-radius: 6px; }\n  .empty { padding: 40px 20px; text-align: center; color: var(--muted); font-size: 13px; }\n  .detail { flex: 1; overflow-y: auto; padding: 22px 26px 60px; min-width: 0; }\n  .detail h2 { margin: 0 0 4px; font-size: 21px; line-height: 1.3; }\n  .detail .sub { color: var(--muted); font-size: 12px; margin-bottom: 14px; display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }\n  .detail .tags { display: flex; gap: 5px; flex-wrap: wrap; margin-bottom: 12px; }\n  .detail .tags span { font-size: 11px; color: var(--ink-soft); background: var(--surface-2); border: 1px solid var(--line); padding: 2px 8px; border-radius: 6px; }\n  .detail .summary { font-size: 14px; color: var(--ink-soft); line-height: 1.6; margin: 0 0 16px; }\n  .block { margin-bottom: 18px; }\n  .block h3 { font-size: 12px; text-transform: uppercase; letter-spacing: .06em; color: var(--muted); margin: 0 0 8px; }\n  .block ul { margin: 0; padding-left: 0; list-style: none; }\n  .block li { position: relative; padding: 7px 0 7px 20px; font-size: 13.5px; line-height: 1.6; border-bottom: 1px dashed var(--line); }\n  .block li:last-child { border-bottom: 0; }\n  .block li::before { content: ''; position: absolute; left: 2px; top: 14px; width: 7px; height: 7px; border-radius: 50%; background: var(--accent); opacity: .75; }\n  .block.axioms li::before { background: var(--warn); }\n  .block.elements li::before { background: var(--ok); }\n  .block.conclusions li::before { background: var(--accent); }\n  .perspectives li { padding-left: 0; }\n  .perspectives li::before { display: none; }\n  .perspective { font-size: 13px; line-height: 1.6; }\n  .perspective .who { display: inline-block; font-size: 10px; color: var(--accent-deep); background: var(--accent-wash); border-radius: 5px; padding: 0 5px; margin-right: 6px; }\n  .perspective .who.user { color: var(--ok); background: color-mix(in srgb, var(--ok) 14%, transparent); }\n  .related a { color: var(--accent-deep); cursor: pointer; text-decoration: none; }\n  .related a:hover { text-decoration: underline; }\n  .actions { display: flex; gap: 8px; margin-bottom: 16px; }\n  .tabbar { display: flex; gap: 4px; border-bottom: 1px solid var(--line); margin-top: 14px; }\n  .tab { font: inherit; font-size: 12.5px; cursor: pointer; padding: 8px 12px; background: transparent; color: var(--muted); border: none; border-bottom: 2px solid transparent; }\n  .tab.on { color: var(--accent-deep); border-bottom-color: var(--accent); font-weight: 600; }\n  .tabbody { padding-top: 14px; }\n  .persp-add { display: flex; gap: 8px; margin-top: 8px; }\n  .persp-add input { flex: 1; font: inherit; color: var(--ink); background: var(--surface-2); border: 1px solid var(--line); border-radius: 9px; padding: 7px 10px; outline: none; }\n  .persp-add input:focus { border-color: var(--accent); }\n  .editor label { display: block; font-size: 12px; color: var(--muted); margin: 12px 0 5px; }\n  .editor input, .editor textarea, .editor select {\n    width: 100%; font: inherit; color: var(--ink); background: var(--surface);\n    border: 1px solid var(--line); border-radius: 10px; padding: 8px 10px; outline: none; resize: vertical;\n  }\n  .editor input:focus, .editor textarea:focus, .editor select:focus { border-color: var(--accent); }\n  .editor textarea { min-height: 68px; line-height: 1.55; }\n  .editor textarea.tall { min-height: 110px; }\n  .editor .row { display: flex; gap: 10px; }\n  .editor .row > div { flex: 1; }\n  .editor .hint { font-size: 11px; color: var(--muted); margin-top: 3px; }\n  #sync-status { font-size: 11.5px; color: var(--muted); padding: 6px 16px; min-height: 20px; border-top: 1px solid var(--line); background: var(--surface); }\n  @media (max-width: 640px) {\n    main { flex-direction: column; }\n    .list { width: 100%; border-right: 0; border-bottom: 1px solid var(--line); max-height: 45%; }\n    .detail { padding: 16px; }\n  }\n</style>\n</head>\n<body>\n<header>\n  <div class=\"brand\">\n    <h1>条目</h1><span class=\"count\" id=\"count\"></span>\n  </div>\n  <div class=\"toolbar\">\n    <div class=\"search\">\n      <svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\"><circle cx=\"11\" cy=\"11\" r=\"7\"></circle><path d=\"m21 21-4.3-4.3\"></path></svg>\n      <input id=\"searchInput\" type=\"search\" placeholder=\"搜索标题 / 概述 / 公理 / 结论…\" aria-label=\"搜索条目\">\n    </div>\n    <button class=\"btn\" id=\"exportBtn\" type=\"button\" title=\"导出为 Markdown\">导出</button>\n    <button class=\"btn primary\" id=\"newBtn\" type=\"button\">＋ 新建</button>\n  </div>\n</header>\n<div class=\"chips\" id=\"chips\" role=\"tablist\" aria-label=\"领域筛选\"></div>\n<main>\n  <div class=\"list\" id=\"list\"></div>\n  <div class=\"detail\" id=\"detail\"><div class=\"empty\">从左侧选择一条条目，或点击「＋ 新建」记录你的第一个 idea</div></div>\n</main>\n<div id=\"sync-status\" role=\"status\"></div>\n\n<script>\n  const state = {\n    entries: [], revision: null, query: '', domain: '', selectedId: null,\n    editing: false, isNew: false, theme: 'light', themeFollow: true,\n    draft: null, detailTab: 'organized'\n  };\n  const $ = id => document.getElementById(id);\n  const esc = s => String(s ?? '').replace(/[&<>\"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',\"'\":'&#39;'}[c]));\n  const fmtDate = t => { try { return new Date(t).toISOString().slice(0, 10); } catch { return ''; } };\n  const splitLines = s => String(s ?? '').split(/\\r?\\n/).map(x => x.trim()).filter(Boolean);\n\n  function applyTheme() {\n    state.theme = state.themeFollow ? (detectHarnessDark() ? 'dark' : 'light') : state.theme;\n    document.documentElement.setAttribute('data-theme', state.theme);\n  }\n  function detectHarnessDark() {\n    try {\n      if (window.parent && window.parent !== window && window.parent.document && window.parent.document.body) {\n        return window.parent.document.body.hasAttribute('data-ds-dark-theme');\n      }\n    } catch {}\n    return false;\n  }\n\n  function domains() {\n    const counts = new Map();\n    for (const e of state.entries) { const d = e.domain || '未分类'; counts.set(d, (counts.get(d) || 0) + 1); }\n    return [...counts.entries()].sort((a, b) => b[1] - a[1]);\n  }\n  function filtered() {\n    let es = state.entries;\n    if (state.domain) es = es.filter(e => e.domain === state.domain);\n    if (state.query) {\n      const q = state.query.toLowerCase();\n      es = es.filter(e => [e.title, e.domain, e.summary, ...(e.tags||[]), ...(e.axioms||[]), ...(e.elements||[]), ...(e.conclusions||[]), ...(e.perspectives||[]).map(p=>p.text)].join('\\n').toLowerCase().includes(q));\n    }\n    return es;\n  }\n  function selected() { return state.entries.find(e => e.id === state.selectedId) || null; }\n\n  function render() {\n    $('count').textContent = state.entries.length ? `${state.entries.length} 条` : '';\n    // chips\n    const chipEl = $('chips');\n    const ds = domains();\n    const chip = (label, value, on) => { const b = document.createElement('button'); b.className = 'chip' + (on ? ' on' : ''); b.type = 'button'; b.textContent = label; b.onclick = () => { state.domain = value; state.selectedId = null; state.editing = false; render(); }; return b; };\n    chipEl.replaceChildren(chip('全部', '', state.domain === ''), ...ds.map(([d, n]) => chip(`${d} ${n}`, d, state.domain === d)));\n    // list\n    const listEl = $('list');\n    const es = filtered();\n    if (!es.length) { listEl.innerHTML = `<div class=\"empty\">${state.entries.length ? '没有匹配的条目' : '还没有条目，从聊天解析或点「＋ 新建」开始吧'}</div>`; }\n    else {\n      listEl.innerHTML = '';\n      for (const e of es) {\n        const div = document.createElement('div');\n        div.className = 'list-item' + (e.id === state.selectedId ? ' on' : '');\n        div.innerHTML = `<div class=\"t\">${esc(e.title)}</div>\n          <div class=\"meta\">${e.domain ? `<span class=\"badge\">${esc(e.domain)}</span>` : ''}${e.tags.length ? `<span>${esc(e.tags.slice(0,3).join(' · '))}</span>` : ''}<span>${fmtDate(e.updatedAt)}</span></div>\n          ${e.summary ? `<div class=\"sum\">${esc(e.summary)}</div>` : ''}`;\n        div.onclick = () => { state.selectedId = e.id; state.editing = false; render(); };\n        listEl.appendChild(div);\n      }\n    }\n    renderDetail();\n  }\n  function renderDetail() {\n    const el = $('detail');\n    if (state.editing) { renderEditor(el); return; }\n    const e = selected();\n    if (!e) { el.innerHTML = `<div class=\"empty\">从左侧选择一条条目，或点击「＋ 新建」记录你的第一个 idea</div>`; return; }\n    const tab = state.detailTab || 'organized';\n    const perspCount = (e.perspectives || []).length;\n    const related = (e.related || []).map(t => {\n      const target = state.entries.find(x => x.title === t);\n      return target ? `<a data-id=\"${esc(target.id)}\">${esc(t)}</a>` : esc(t);\n    }).join('、');\n    const organizedHTML = `\n      ${e.summary ? `<p class=\"summary\">${esc(e.summary)}</p>` : ''}\n      ${e.axioms.length ? `<div class=\"block axioms\"><h3>前提 / 公理</h3><ul>${e.axioms.map(t => `<li>${esc(t)}</li>`).join('')}</ul></div>` : ''}\n      ${e.elements.length ? `<div class=\"block elements\"><h3>基本事实 / 要素</h3><ul>${e.elements.map(t => `<li>${esc(t)}</li>`).join('')}</ul></div>` : ''}\n      ${e.conclusions.length ? `<div class=\"block conclusions\"><h3>推导结论</h3><ul>${e.conclusions.map(t => `<li>${esc(t)}</li>`).join('')}</ul></div>` : ''}\n      ${e.related.length ? `<div class=\"block\"><h3>关联</h3><div class=\"related\">${related}</div></div>` : ''}\n    `;\n    const recordsHTML = `\n      ${perspCount ? `<div class=\"block perspectives\"><ul>${(e.perspectives || []).map(p => `<li><div class=\"perspective\"><span class=\"who ${p.source}\">${p.source === 'user' ? '用户' : 'AI'}</span>${esc(p.text)}</div></li>`).join('')}</ul></div>` : `<div class=\"empty\">还没有角度记录。聊到新情况或新进展时，AI 会把角度追加到这里。</div>`}\n      <div class=\"persp-add\"><input id=\"perspInput\" placeholder=\"新增一个角度或诠释，Enter 追加…\" aria-label=\"新增角度\"><button class=\"btn\" id=\"perspBtn\" type=\"button\">追加</button></div>\n    `;\n    el.innerHTML = `\n      <div class=\"actions\">\n        <button class=\"btn\" id=\"editBtn\" type=\"button\">编辑</button>\n        <button class=\"btn\" id=\"outputBtn\" type=\"button\">输出</button>\n        <button class=\"btn\" id=\"deleteBtn\" type=\"button\">删除</button>\n      </div>\n      <h2>${esc(e.title)}</h2>\n      <div class=\"sub\">${e.domain ? `<span class=\"badge\">${esc(e.domain)}</span>` : ''}<span>更新于 ${fmtDate(e.updatedAt)}</span></div>\n      ${e.tags.length ? `<div class=\"tags\">${e.tags.map(t => `<span>${esc(t)}</span>`).join('')}</div>` : ''}\n      <div class=\"tabbar\">\n        <button class=\"tab${tab === 'organized' ? ' on' : ''}\" type=\"button\" data-tab=\"organized\">整理后</button>\n        <button class=\"tab${tab === 'records' ? ' on' : ''}\" type=\"button\" data-tab=\"records\">角度记录${perspCount ? ` (${perspCount})` : ''}</button>\n      </div>\n      <div class=\"tabbody\">${tab === 'organized' ? organizedHTML : recordsHTML}</div>\n    `;\n    $('editBtn').onclick = openEdit;\n    $('outputBtn').onclick = outputSelected;\n    $('deleteBtn').onclick = deleteSelected;\n    el.querySelectorAll('.tab').forEach(b => b.onclick = () => { state.detailTab = b.dataset.tab; render(); });\n    const perspBtn = $('perspBtn'), perspInput = $('perspInput');\n    if (perspBtn && perspInput) {\n      perspBtn.onclick = submitPerspective;\n      perspInput.addEventListener('keydown', ev => { if (ev.key === 'Enter') submitPerspective(); });\n    }\n    el.querySelectorAll('.related a').forEach(a => a.onclick = () => { state.selectedId = a.dataset.id; render(); });\n  }\n  function renderEditor(el) {\n    const e = state.isNew ? null : selected();\n    const d = state.draft || (e ? { type: e.type, title: e.title, domain: e.domain, tags: e.tags, summary: e.summary, axioms: e.axioms, elements: e.elements, conclusions: e.conclusions, related: e.related } : { type: 'knowledge', title: '', domain: '', tags: [], summary: '', axioms: [], elements: [], conclusions: [], related: [] });\n    state.draft = d;\n    el.innerHTML = `\n      <div class=\"actions\">\n        <button class=\"btn primary\" id=\"saveBtn\" type=\"button\">保存</button>\n        <button class=\"btn\" id=\"cancelBtn\" type=\"button\">取消</button>\n      </div>\n      <div class=\"editor\">\n        <label for=\"fType\">类型</label>\n        <select id=\"fType\">\n          <option value=\"knowledge\"${d.type !== 'plan' ? ' selected' : ''}>知识（理解某事物）</option>\n          <option value=\"plan\"${d.type === 'plan' ? ' selected' : ''}>计划 / 目标（达成某件事）</option>\n        </select>\n        <label for=\"fTitle\">标题</label><input id=\"fTitle\" maxlength=\"200\" placeholder=\"这个 idea / 事物叫什么\" value=\"${esc(d.title)}\">\n        <div class=\"row\">\n          <div><label for=\"fDomain\">领域</label><input id=\"fDomain\" maxlength=\"50\" list=\"domainList\" placeholder=\"物理 / 商业 / AI / 认知…\" value=\"${esc(d.domain)}\">\n            <datalist id=\"domainList\">${domains().map(([x]) => `<option value=\"${esc(x)}\">`).join('')}</datalist></div>\n          <div><label for=\"fTags\">标签（逗号分隔）</label><input id=\"fTags\" maxlength=\"200\" value=\"${esc((d.tags||[]).join(', '))}\"></div>\n        </div>\n        <label for=\"fSummary\">一句话概述</label><input id=\"fSummary\" maxlength=\"500\" value=\"${esc(d.summary)}\">\n        <label for=\"fAxioms\">前提 / 公理（每行一条）</label><textarea id=\"fAxioms\" class=\"tall\">${esc((d.axioms||[]).join('\\n'))}</textarea>\n        <label for=\"fElements\">基本事实 / 要素（每行一条）</label><textarea id=\"fElements\" class=\"tall\">${esc((d.elements||[]).join('\\n'))}</textarea>\n        <label for=\"fConclusions\">推导结论（每行一条）</label><textarea id=\"fConclusions\" class=\"tall\">${esc((d.conclusions||[]).join('\\n'))}</textarea>\n        <label for=\"fRelated\">关联条目标题（每行一条）</label><textarea id=\"fRelated\">${esc((d.related||[]).join('\\n'))}</textarea>\n        <div class=\"hint\">角度/诠释在详情页追加，不在此编辑。</div>\n      </div>\n    `;\n    $('saveBtn').onclick = saveDraft;\n    $('cancelBtn').onclick = cancelEdit;\n  }\n\n  function openNew() { state.isNew = true; state.editing = true; state.selectedId = null; state.draft = null; render(); }\n  function openEdit() { state.isNew = false; state.editing = true; state.draft = null; render(); }\n  function cancelEdit() { state.editing = false; state.draft = null; render(); }\n  function collectDraft() {\n    return {\n      type: $('fType').value,\n      title: $('fTitle').value.trim(),\n      domain: $('fDomain').value.trim(),\n      tags: splitLines($('fTags').value.replace(/[，,]/g, '\\n')),\n      summary: $('fSummary').value.trim(),\n      axioms: splitLines($('fAxioms').value),\n      elements: splitLines($('fElements').value),\n      conclusions: splitLines($('fConclusions').value),\n      related: splitLines($('fRelated').value)\n    };\n  }\n  async function saveDraft() {\n    const d = collectDraft();\n    if (!d.title) { syncStatus('标题不能为空', true); return; }\n    state.draft = d;\n    const r = state.isNew ? await mutate('add', d) : await mutate('update', { id: state.selectedId, patch: d });\n    if (r) {\n      state.editing = false; state.draft = null;\n      if (state.isNew) state.selectedId = r.result?.entry?.id ?? null;\n      acceptSnapshot(r.snapshot);\n    }\n  }\n  function submitPerspective() {\n    const input = $('perspInput'); const text = input.value.trim();\n    if (!text || !state.selectedId) return;\n    input.value = '';\n    mutate('addPerspective', { id: state.selectedId, text, source: 'user' }).then(r => { if (r) acceptSnapshot(r.snapshot); });\n  }\n  function deleteSelected() {\n    const e = selected(); if (!e) return;\n    if (!window.confirm(`删除条目「${e.title}」？此操作不可撤销。`)) return;\n    mutate('remove', { ids: [e.id] }).then(r => { if (r) { state.selectedId = null; acceptSnapshot(r.snapshot); } });\n  }\n  async function outputSelected() {\n    const e = selected(); if (!e) return;\n    try {\n      const r = await hostRequest({ op: 'output', id: e.id });\n      const md = r.markdown;\n      try { await navigator.clipboard.writeText(md); syncStatus('已复制条目 Markdown 到剪贴板'); }\n      catch {\n        const blob = new Blob([md], { type: 'text/markdown' });\n        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `${e.title}.md`; a.click(); URL.revokeObjectURL(a.href);\n        syncStatus(`已下载 ${e.title}.md`);\n      }\n    } catch (err) { syncStatus(`输出失败：${err.message}`, true); }\n  }\n  function toMarkdown() {\n    const lines = [`# 条目库（${state.entries.length} 条）`, ''];\n    for (const e of state.entries) {\n      lines.push(`## ${e.title}`);\n      if (e.domain) lines.push(`- 领域：${e.domain}`);\n      if (e.tags.length) lines.push(`- 标签：${e.tags.join('、')}`);\n      if (e.summary) lines.push(`- 概述：${e.summary}`);\n      if (e.axioms.length) { lines.push('', '### 前提 / 公理'); e.axioms.forEach(t => lines.push(`- ${t}`)); }\n      if (e.elements.length) { lines.push('', '### 基本事实 / 要素'); e.elements.forEach(t => lines.push(`- ${t}`)); }\n      if (e.conclusions.length) { lines.push('', '### 推导结论'); e.conclusions.forEach(t => lines.push(`- ${t}`)); }\n      if (e.perspectives.length) { lines.push('', '### 角度 / 诠释'); e.perspectives.forEach(p => lines.push(`- [${p.source === 'user' ? '用户' : 'AI'}] ${p.text}`)); }\n      if (e.related.length) lines.push('', `- 关联：${e.related.join('、')}`);\n      lines.push('', `> 更新于 ${fmtDate(e.updatedAt)}`, '');\n    }\n    return lines.join('\\n');\n  }\n  async function doExport() {\n    const md = toMarkdown();\n    try { await navigator.clipboard.writeText(md); syncStatus('已复制 Markdown 到剪贴板，可粘贴到夸克网盘或任意笔记'); }\n    catch {\n      const blob = new Blob([md], { type: 'text/markdown' });\n      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'knowledge.md'; a.click(); URL.revokeObjectURL(a.href);\n      syncStatus('已下载 knowledge.md');\n    }\n  }\n\n  function acceptSnapshot(snapshot) {\n    if (!snapshot || !Number.isSafeInteger(snapshot.revision) || !Array.isArray(snapshot.entries)) { syncStatus('服务返回无效数据', true); return; }\n    if (state.editing) { deferredSnapshot = snapshot; return; }\n    state.revision = snapshot.revision;\n    state.entries = snapshot.entries;\n    // keep selection if still present\n    if (state.selectedId && !state.entries.some(e => e.id === state.selectedId)) state.selectedId = null;\n    deferredSnapshot = null;\n    render();\n  }\n  function finishDeferred() { if (deferredSnapshot && !state.editing) acceptSnapshot(deferredSnapshot); }\n\n  $('searchInput').addEventListener('input', ev => { state.query = ev.target.value.trim(); render(); });\n  $('newBtn').addEventListener('click', openNew);\n  $('exportBtn').addEventListener('click', doExport);\n\n// Runs inside the knowledge page's shared script scope (injected at the boot anchor).\nlet hostRequest = null;\nlet revision = null;\nlet busy = false;\nlet stopped = false;\nlet deferredSnapshot = null;\n\nfunction syncStatus(text, error = false) {\n  const node = document.getElementById('sync-status');\n  if (!node) return;\n  node.textContent = text;\n  node.style.color = error ? 'var(--danger)' : 'var(--muted)';\n}\n\nfunction watchHarnessTheme() {\n  try {\n    if (typeof MutationObserver === 'undefined' || !window.parent || window.parent === window) return;\n    const body = window.parent.document && window.parent.document.body;\n    if (!body) return;\n    const sync = () => { if (state.themeFollow) applyTheme(); };\n    new MutationObserver(sync).observe(body, { attributes: true, attributeFilter: ['data-ds-dark-theme'] });\n  } catch {}\n}\n\nasync function refresh() {\n  if (stopped || busy || !hostRequest || state.editing) return;\n  busy = true;\n  try {\n    const snapshot = await hostRequest({ op: 'snapshot' });\n    if (stopped) return;\n    acceptSnapshot(snapshot);\n    syncStatus('已连接 · 数据保存在 Harness 本地');\n  } catch (e) {\n    if (!stopped) syncStatus(`连接失败：${e.message}；未保存的输入仍保留`, true);\n  } finally { busy = false; }\n}\n\nasync function mutate(op, args, expected = revision) {\n  if (stopped || !hostRequest || revision === null) { syncStatus('尚未连接，请稍后重试；输入未丢失', true); return null; }\n  if (busy) { syncStatus('正在同步，请稍后重试；输入未丢失', true); return null; }\n  busy = true;\n  syncStatus('正在保存…');\n  try {\n    const result = await hostRequest({ op, ...args, expectedRevision: expected });\n    if (stopped) return null;\n    const snapshot = await hostRequest({ op: 'snapshot' });\n    if (stopped) return null;\n    syncStatus('已保存到 Harness 本地');\n    return { snapshot, result };\n  } catch (e) {\n    if (stopped) return null;\n    if (e.code === 'REVISION_CONFLICT') {\n      try { acceptSnapshot(await hostRequest({ op: 'snapshot' })); } catch { /* show original conflict */ }\n      syncStatus('数据已被其他操作修改，本次未保存。已刷新；编辑中的内容请重新提交', true);\n    } else syncStatus(`保存失败：${e.message}。输入已保留，请重试`, true);\n    return null;\n  } finally { busy = false; }\n}\n\nwindow.__knowledgeConnect = (request) => {\n  hostRequest = request;\n  stopped = false;\n  syncStatus('正在连接 Harness…');\n  refresh();\n  const interval = setInterval(() => refresh(), 2000);\n  return () => { stopped = true; clearInterval(interval); hostRequest = null; };\n};\n\napplyTheme();\nrender();\nwatchHarnessTheme();\nsyncStatus('正在连接 Harness…');\n\n  /* ---------------- boot ---------------- */\n</script>\n</body>\n</html>\n";
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
