// Built by build.mjs: the page runs in its own document, without global UI changes.
window.__ModuleLoader__.load({
  id: "harness-me-local",
  factory: function (require) {
    const React = require("react");
    const PAGE = "<!doctype html>\n<html lang=\"zh-CN\"><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><meta name=\"color-scheme\" content=\"light dark\"><title>Me · 我的日常</title>\n<style>\n:root{color-scheme:light;--bg:#f5f5ef;--card:#fffefb;--text:#293b36;--muted:#748079;--line:#dce3da;--accent:#497563;--soft:#eaf1e9;--danger:#ab4d49;--shadow:0 8px 30px #253b3010}*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--text);font:14px/1.65 system-ui,-apple-system,\"PingFang SC\",sans-serif}button,input,textarea,select{font:inherit}button,a,input,textarea,select{touch-action:manipulation}button{border:1px solid var(--line);border-radius:10px;padding:8px 14px;background:var(--card);color:var(--text);cursor:pointer}button:hover{background:var(--soft)}button:disabled{opacity:.5;cursor:wait}.primary{background:var(--accent);border-color:var(--accent);color:#fff}.primary:hover{filter:brightness(1.08);background:var(--accent)}.danger{color:var(--danger)}input,textarea,select{border:1px solid var(--line);background:var(--card);color:var(--text);border-radius:9px;padding:9px 11px;max-width:100%}textarea{width:100%;resize:vertical;min-height:105px}input:focus,textarea:focus,select:focus,button:focus-visible{outline:2px solid var(--accent);outline-offset:2px}label{display:grid;gap:4px;font-size:12px;color:var(--muted)}label.check{display:flex;align-items:flex-start;gap:8px;font-size:13px}input[type=checkbox]{margin-top:5px}.wrap{max-width:1080px;margin:auto;padding:34px 32px 72px}header{display:flex;justify-content:space-between;gap:20px;align-items:center;margin-bottom:24px}.brand{display:flex;gap:14px;align-items:center}.mark{display:grid;place-items:center;width:48px;height:48px;background:var(--soft);color:var(--accent);border-radius:17px;font:italic 25px Georgia}h1{font:500 29px/1.2 Georgia,serif;margin:0 0 5px}p{margin:6px 0}h2{font-size:17px;margin:0 0 12px}h3{font-size:14px;margin:0}.muted,small{color:var(--muted)}.eyebrow{font-size:11px;text-transform:uppercase;letter-spacing:2px;color:var(--accent)}nav{display:flex;gap:6px;margin-bottom:22px;border-bottom:1px solid var(--line);padding-bottom:12px}nav button{border-color:transparent;background:transparent}nav button[aria-selected=true]{background:var(--soft);color:var(--accent)}.card{background:var(--card);border:1px solid var(--line);border-radius:17px;padding:21px;box-shadow:var(--shadow);margin-bottom:20px}.row{display:flex;align-items:center;gap:10px;flex-wrap:wrap}.spread{justify-content:space-between}.fields{display:flex;gap:12px;flex-wrap:wrap;margin:12px 0}.fields label{flex:1;min-width:125px}.fields input,.fields select{width:100%}.hint{font-size:12px;color:var(--muted)}.note{white-space:pre-wrap;overflow-wrap:anywhere;font-size:15px;line-height:1.8;margin:10px 0}.meta{font-size:11px;color:var(--muted);overflow-wrap:anywhere}.tag{font-size:11px;border-radius:6px;padding:2px 7px;background:var(--soft);color:var(--accent)}.actions button{font-size:12px;padding:4px 9px}.day{font-size:13px;font-weight:600;margin:26px 0 10px;display:flex;align-items:center;gap:12px}.day:after{content:'';height:1px;background:var(--line);flex:1}.entry{border-left:2px solid var(--line);padding:0 0 21px 18px;margin-left:5px}.entry:last-child{padding-bottom:5px}.empty{text-align:center;padding:38px 15px;color:var(--muted)}.profiles{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:16px}.profiles .card{margin:0}.status{border-radius:10px;padding:9px 13px;margin-bottom:18px;background:var(--soft);white-space:pre-wrap;overflow-wrap:anywhere}.status.error{color:var(--danger);border:1px solid var(--danger)}[hidden]{display:none!important}dialog{background:var(--card);color:var(--text);border:1px solid var(--line);border-radius:18px;padding:24px;width:min(600px,calc(100% - 24px));max-height:90vh;overflow:auto;box-shadow:0 20px 100px #0004}dialog::backdrop{background:#182c2459;backdrop-filter:blur(3px)}.dialog-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:20px}.privacy{border-left:3px solid var(--accent);padding-left:14px;margin:18px 0}.path{font-family:monospace;word-break:break-all}.preview{white-space:pre-wrap;max-height:200px;overflow:auto;background:var(--soft);padding:14px;border-radius:10px}footer{margin-top:32px;font-size:12px;color:var(--muted)}\n:root[data-theme=dark]{color-scheme:dark;--bg:#1c2321;--card:#242d29;--text:#e2e9df;--muted:#a0afa5;--line:#3a4840;--accent:#86b69a;--soft:#303f35;--danger:#ed9e98;--shadow:0 8px 30px #00000010}:root[data-theme=dark] .primary{color:#15271d}@media(prefers-color-scheme:dark){:root:not([data-theme=light]){color-scheme:dark;--bg:#1c2321;--card:#242d29;--text:#e2e9df;--muted:#a0afa5;--line:#3a4840;--accent:#86b69a;--soft:#303f35;--danger:#ed9e98;--shadow:none}}@media(max-width:600px){.wrap{padding:22px 16px 48px}header{align-items:flex-start}.card{padding:16px}.fields{gap:8px}.fields label{min-width:115px}.brand{gap:10px}h1{font-size:25px}nav{gap:0}nav button{padding:8px 11px}.profiles{grid-template-columns:1fr}.row.filters>*{flex:1}button{min-height:36px}}\n.overview-grid,.chart-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}.chart{width:100%;height:150px;display:block}.chart-card{min-width:0}.chart-values{font-size:11px;overflow-wrap:anywhere}.profile-section{margin:24px 0}.goal-progress{height:6px;background:var(--line);border-radius:8px;overflow:hidden}.goal-progress span{display:block;height:100%;background:var(--accent)}nav{overflow-x:auto}nav button{white-space:nowrap}.ai-label{border-left:3px solid var(--accent);padding-left:10px;margin:10px 0}.conversation{background:var(--soft);padding:14px;border-radius:12px}.metrics-editor{font:12px monospace;min-height:75px}@media(max-width:600px){.overview-grid,.chart-grid{grid-template-columns:1fr}}\n</style></head><body><main class=\"wrap\">\n<header><div class=\"brand\"><div class=\"mark\" aria-hidden=\"true\">m.</div><div><h1>Me</h1><div class=\"muted\">留一点空间，给真实的自己。</div></div></div><span class=\"tag\">仅本地 · 文字记录</span></header>\n<nav aria-label=\"Me 导航\" role=\"tablist\"><button role=\"tab\" aria-selected=\"true\" data-tab=\"overview\">个人概览</button><button role=\"tab\" aria-selected=\"false\" data-tab=\"appearance\">形体</button><button role=\"tab\" aria-selected=\"false\" data-tab=\"daily\">日常时间线</button><button role=\"tab\" aria-selected=\"false\" data-tab=\"reviews\">复盘</button><button role=\"tab\" aria-selected=\"false\" data-tab=\"about\">关于我</button><button role=\"tab\" aria-selected=\"false\" data-tab=\"tasks\">今日 Me 日常</button><button role=\"tab\" aria-selected=\"false\" data-tab=\"privacy\">数据与隐私</button></nav>\n<div id=\"notice\" class=\"status\" role=\"status\" aria-live=\"polite\" hidden></div>\n<section id=\"reviews\" hidden><div class=\"conversation\"><strong>复盘</strong><p>把原始日记和复盘分析分开保存。复盘可以由聊天生成，也可以手动补充；不会改写原始记录。</p></div><div class=\"card\"><h2>新建复盘</h2><form id=\"reviewForm\"><div class=\"fields\"><label>日期<input id=\"reviewDate\" type=\"date\" required></label><label class=\"check\"><input id=\"reviewSensitive\" type=\"checkbox\">包含敏感内容</label></div><label>原始日记摘要<textarea id=\"reviewSummary\" required maxlength=\"20000\" placeholder=\"记录当天发生了什么\"></textarea></label><label>复盘分析（可选）<textarea id=\"reviewAnalysis\" maxlength=\"10000\" placeholder=\"观察、原因、下一步……\"></textarea></label><button class=\"primary\" type=\"submit\">保存复盘</button><p id=\"reviewStatus\" class=\"hint\" role=\"status\"></p></form></div><div class=\"card\"><h2>复盘记录</h2><form id=\"reviewFilters\" class=\"fields\"><label>从<input id=\"reviewFrom\" type=\"date\"></label><label>至<input id=\"reviewTo\" type=\"date\"></label><button type=\"submit\">筛选</button><button type=\"button\" id=\"reviewReset\">清除</button><button type=\"button\" id=\"reviewExport\">导出 Markdown</button></form><div id=\"reviewList\"></div><div class=\"row spread\"><span id=\"reviewCount\" class=\"hint\"></span><div><button id=\"reviewPrev\" type=\"button\">上一页</button><button id=\"reviewNext\" type=\"button\">下一页</button></div></div></div></section><section id=\"appearance\" hidden><div class=\"conversation\"><strong>形体</strong><p>记录减脂、护肤、穿搭、体态和其他与你的形体管理有关的当前状态、目标与执行记录。</p></div><div id=\"appearanceProfiles\"></div><div class=\"card\"><h2>快速记录执行</h2><form id=\"appearanceRecordForm\"><div class=\"fields\"><label>项目<select id=\"appearanceProject\"><option value=\"减脂\">减脂</option><option value=\"护肤\">护肤</option><option value=\"穿搭\">穿搭</option><option value=\"体态\">体态</option><option value=\"其他\">其他</option></select></label><label>内容<input id=\"appearanceRecordContent\" maxlength=\"20000\" required placeholder=\"例如：今天完成了训练\"></label><label>标签<input id=\"appearanceRecordTags\" maxlength=\"500\" placeholder=\"例如：力量训练\"></label></div><button class=\"primary\" type=\"submit\">保存执行记录</button></form><p id=\"appearanceRecordStatus\" class=\"hint\" role=\"status\"></p></div><div class=\"card\"><h2>最近执行记录</h2><div id=\"appearanceTimeline\"></div></div></section><section id=\"overview\"><div class=\"conversation\"><strong>用聊天更新，而不是填完一张表。</strong><p>直接在聊天中说“更新我的基础信息…”“把我的目标改为…”；性格与 MBTI 可保存自述、测评结果或有来源的暂定观察，不把 AI 观察当定论。</p></div><div id=\"overviewProfiles\"></div><div class=\"row spread\"><h2>真实记录的变化</h2><button id=\"refreshStats\">刷新图表</button></div><p class=\"hint\">最近 14 天 · 饮水次数不等于毫升数 · 空白代表没有记录，不补零。</p><div id=\"charts\" class=\"chart-grid\"></div></section><section id=\"daily\" hidden><form id=\"quick\" class=\"card\"><div class=\"row spread\"><h2>随手记</h2><span class=\"hint\">一句话也值得留下</span></div><label for=\"content\" class=\"hint\">发生了什么，或此刻想记下什么？</label><textarea id=\"content\" required maxlength=\"20000\" placeholder=\"今天的生活，按自己的节奏记录。\"></textarea><div class=\"fields\"><label>发生时间<input id=\"occurred\" type=\"datetime-local\" required></label><label>分类<input id=\"category\" list=\"categories\" maxlength=\"50\" placeholder=\"不分类也可以\"></label><label>标签（逗号分隔）<input id=\"tags\" maxlength=\"500\" placeholder=\"例如：散步，感受\"></label></div><div class=\"row spread\"><label class=\"check\"><input id=\"sensitive\" type=\"checkbox\">这条包含敏感信息</label><button class=\"primary\" type=\"submit\">保存并 AI 整理</button></div><p class=\"hint\">先保存原文，再发送非敏感的这条文字给当前模型提取数据。分析失败不丢记录；敏感内容勾选后仅保存原文，不自动发送模型。</p></form>\n<div class=\"card\"><h2>我的时间线</h2><form id=\"filters\"><div class=\"fields\"><label>搜索内容<input id=\"query\" type=\"search\" placeholder=\"找一段记忆…\"></label><label>分类<input id=\"filterCategory\" list=\"categories\" placeholder=\"全部分类\"></label><label>发生日期 · 从<input id=\"from\" type=\"date\"></label><label>至<input id=\"to\" type=\"date\"></label></div><div class=\"row spread\"><span class=\"hint\">按发生日期分组 · 时间使用本机时区</span><div class=\"row\"><button type=\"button\" id=\"reset\">清除筛选</button><button type=\"submit\">筛选</button></div></div></form><div id=\"timeline\"></div><div class=\"row spread\"><span id=\"count\" class=\"hint\"></span><div class=\"row\"><button id=\"prev\">上一页</button><button id=\"next\">下一页</button></div></div></div></section>\n<section id=\"about\" hidden><div class=\"row spread\" style=\"margin-bottom:18px\"><div><h2>关于我</h2><p class=\"hint\">长期背景由你明确维护，不从某一天的感受推断人格。</p></div><button id=\"newProfile\" class=\"primary\">添加背景卡</button></div><div id=\"profiles\" class=\"profiles\"></div></section>\n<section id=\"tasks\" hidden><div class=\"card\"><h2>今日 Me 日常</h2><p class=\"hint\">只在 Me 内管理的每日小事项；不会修改 todo 插件。没完成不评分，也不会自动记录为你已经做过。</p><form id=\"dailyTaskForm\" class=\"row\"><input id=\"dailyTaskText\" maxlength=\"200\" required placeholder=\"今天想做的一件小事\" aria-label=\"新增 Me 每日事项\"><button type=\"submit\">添加</button></form><div id=\"dailyTaskList\"></div><p id=\"dailyTaskStatus\" role=\"status\" class=\"hint\"></p></div></section><section id=\"privacy\" hidden><div class=\"card\"><h2>Me 悬浮窗设置</h2><label class=\"check\"><input id=\"floatingEnabled\" type=\"checkbox\">开启 Me 悬浮窗（也可用侧栏 Me 菜单右侧的开关）</label><label class=\"check\"><input id=\"hydrationEnabled\" type=\"checkbox\">1 小时无饮水记录：深蓝边框与轻微阴影（无声音、无震动）</label><label class=\"check\"><input id=\"movementEnabled\" type=\"checkbox\">2 小时无走动记录：红色边框，优先于饮水提示</label><label class=\"check\"><input id=\"floatAiEnabled\" type=\"checkbox\">允许悬浮窗把我主动提交的非敏感文字交给当前模型预览（默认开启，可在此关闭；敏感内容请在时间线手动保存，不要输入悬浮窗）</label><p class=\"hint\">未启用 AI 时，浮窗仍会展示原文确认框，确认后才保存，不后台发送文字。敏感资料使用 Me 页面敏感标记手动保存。</p></div><div class=\"card\"><div class=\"eyebrow\">YOUR DATA, YOUR CHOICE</div><h2>资料留在本地，决定留给你</h2><div class=\"privacy\"><p>已授权：聊天中清楚、明确的本人日常事实可自动记录。</p><p>敏感信息需你明确请求或确认；聊天里可明确要求更新基础信息和目标，性格与 MBTI 观察须标为有依据、可更正的暂定观察，不当成测评结论。</p><p>只在你点击记录或整理时发送该条文字给当前模型，不发送全部历史；不后台分析、不传照片、不自动同步网盘；坚果云仅在点击后手动备份或恢复。跨会话按需读取：纳入上下文的内容可能发送给当前模型供应商。</p></div><h3>本地保存位置</h3><p id=\"location\" class=\"path muted\">连接后显示</p><p id=\"policy\" class=\"hint\"></p><p class=\"hint\">本地资料不是加密保险箱。公司设备、聊天日志、下载文件、系统备份都可能留痕；退出账户或删除一处文件不保证抹除全部副本。</p></div><div class=\"card\"><h2>导出与恢复</h2><p class=\"hint\">Markdown 使用时间线的当前筛选（导出全部匹配记录，不限当前页）；JSON 是包含全部记录、背景卡与 Me 每日事项的完整备份，可能含敏感信息，请妥善保存。</p><label class=\"check\"><input id=\"exportSensitive\" type=\"checkbox\">本次 Markdown 明确包含敏感记录（默认不包含）</label><div class=\"row\"><button id=\"markdown\">导出筛选 Markdown</button><button id=\"backup\">完整 JSON 备份</button><button id=\"restore\">从 JSON 恢复…</button><input id=\"restoreFile\" type=\"file\" accept=\".json,application/json\" hidden></div><p class=\"hint\">恢复先预览，再确认合并。同 ID 不覆盖；不同内容的同 ID 冲突会报错，不静默替换本地资料。</p><p class=\"hint\">清理：可逐条删除记录与背景卡。彻底清理本地数据前，请关闭插件并依据上方路径检查工作数据及自行创建的导出、备份与系统副本；本页面不会自动清空目录。</p></div><div class=\"card\"><h2>坚果云手动备份与恢复</h2><p class=\"hint\">仅在你点击时操作。每次备份生成独立 JSON 文件，包含全部记录、背景卡、每日事项和敏感资料，不会自动同步或覆盖旧备份。</p><div class=\"row\"><button id=\"nutstoreBackup\">备份到坚果云</button><button id=\"nutstoreRestore\">从坚果云恢复…</button></div><p id=\"nutstoreStatus\" class=\"hint\" role=\"status\" style=\"white-space:pre-wrap;overflow-wrap:anywhere\">恢复只合并，同 ID 不同内容会拒绝；删除不会传播。写入目录不代表云端上传完成。</p></div></section>\n<footer>不评分，不催促。没有记录，不等于没有发生。</footer></main><datalist id=\"categories\"><option>饮食</option><option>运动</option><option>睡眠</option><option>身体</option><option>感受</option><option>生活</option><option>随想</option></datalist>\n<dialog id=\"editor\"><form id=\"editForm\"><h2 id=\"editTitle\">编辑记录</h2><p id=\"editRevision\" class=\"hint\"></p><label>内容<textarea id=\"editContent\" required maxlength=\"20000\"></textarea></label><div id=\"recordFields\"><div class=\"fields\"><label>发生时间<input id=\"editOccurred\" type=\"datetime-local\" required></label><label>分类<input id=\"editCategory\" list=\"categories\" maxlength=\"50\"></label><label>标签（逗号分隔）<input id=\"editTags\" maxlength=\"500\"></label></div><label>指标修正（JSON 数组；改原文后请重新整理或明确修正）<textarea id=\"editMetrics\" class=\"metrics-editor\" placeholder=\"[]\"></textarea></label></div><div id=\"profileFields\" hidden><div class=\"fields\"><label>来源<input id=\"editSource\" maxlength=\"100\" placeholder=\"用户手动确认\"></label><label>状态<select id=\"editStatus\"><option value=\"active\">已确认</option><option value=\"unknown\">未知 / 待确认</option><option value=\"outdated\">已过时</option></select></label></div><div class=\"fields\"><label>分组<select id=\"editGroup\"><option value=\"basic\">基础信息</option><option value=\"personality\">性格</option><option value=\"mbti\">MBTI</option><option value=\"goal\">目标</option><option value=\"other\">其他</option></select></label><label>依据类型<select id=\"editKind\"><option value=\"self_report\">本人自述</option><option value=\"assessment\">测评</option><option value=\"observation\">AI 聊天观察（暂定）</option></select></label><label>确定程度<select id=\"editConfidence\"><option value=\"tentative\">暂定</option><option value=\"moderate\">有一定依据</option><option value=\"confirmed\">本人确认</option></select></label></div><label>依据 / 来源线索<textarea id=\"editEvidence\" maxlength=\"2000\" placeholder=\"测评日期、用户原话或相关记录 ID；不虚构依据\"></textarea></label><div class=\"fields\"><label>目标指标（可选）<select id=\"editGoalMetric\"><option value=\"\">无量化目标</option><option value=\"water_ml\">饮水量 ml / 天</option><option value=\"exercise_min\">运动 min / 天</option><option value=\"weight_kg\">体重 kg</option><option value=\"sleep_hour\">睡眠 hour / 天</option></select></label><label>目标值<input id=\"editGoalTarget\" type=\"number\" min=\"0\" step=\"any\"></label></div><label class=\"check\"><input id=\"editInclude\" type=\"checkbox\">明确同意：允许此卡纳入跨会话上下文（可能发送给当前模型供应商；敏感内容也仅在勾选后纳入）</label></div><label class=\"check\"><input id=\"editSensitive\" type=\"checkbox\">包含健康、心理等敏感信息</label><p id=\"editError\" class=\"status error\" role=\"alert\" hidden></p><div class=\"dialog-actions\"><button type=\"button\" id=\"reloadEditor\">重新载入最新内容</button><button type=\"button\" id=\"cancelEdit\">取消</button><button class=\"primary\" type=\"submit\">确认保存</button></div></form></dialog>\n<dialog id=\"reviewEditor\"><form id=\"reviewEditForm\"><h2>编辑复盘</h2><p id=\"reviewEditRevision\" class=\"hint\"></p><label>日期<input id=\"reviewEditDate\" type=\"date\" required></label><label>原始日记摘要<textarea id=\"reviewEditSummary\" maxlength=\"20000\" required></textarea></label><label>复盘分析<textarea id=\"reviewEditAnalysis\" maxlength=\"10000\"></textarea></label><label class=\"check\"><input id=\"reviewEditSensitive\" type=\"checkbox\">包含敏感内容</label><p id=\"reviewEditError\" class=\"status error\" role=\"alert\" hidden></p><div class=\"dialog-actions\"><button id=\"reviewReload\" type=\"button\">重新载入最新内容</button><button id=\"reviewCancelEdit\" type=\"button\">取消</button><button class=\"primary\" type=\"submit\">保存更正</button></div></form></dialog>\n<dialog id=\"nutstoreDialog\"><h2>选择坚果云备份</h2><p id=\"nutstorePath\" class=\"hint\" style=\"overflow-wrap:anywhere\"></p><label>可用备份<select id=\"nutstoreChoices\" size=\"6\" style=\"width:100%;margin:8px 0\"></select></label><p id=\"nutstoreError\" class=\"status error\" hidden></p><div class=\"dialog-actions\"><button id=\"closeNutstore\">取消</button><button id=\"chooseNutstore\" class=\"primary\" disabled>预览并合并…</button></div></dialog>\n<dialog id=\"restoreDialog\"><h2>确认合并备份</h2><p>只合并，不覆盖本地同 ID 内容。请确认这是你信任的备份文件。</p><div id=\"restorePreview\" class=\"preview\"></div><p id=\"restoreError\" class=\"status error\" hidden></p><div class=\"dialog-actions\"><button id=\"cancelRestore\">取消</button><button id=\"confirmRestore\" class=\"primary\">确认合并到本地</button></div></dialog>\n<script>\n'use strict';\n(() => {\nconst $ = id => document.getElementById(id);\nconst state = { request: null, revision: null, offset: 0, limit: 20, total: 0, records: [], profiles: [], appearanceRecords: [], reviews: [], reviewRevision: null, reviewDraftRevision: null, reviewEditing: null, reviewTotal: 0, reviewOffset: 0, reviewLimit: 20, reviewGeneration: 0, reviewBusy: false, dailyTasks: null, dailyBusy: false, preferencesCleanup: null, editing: null, pendingImport: null, disposed: false, generation: 0, loading: false, importBusy: false };\nconst text = (tag, value, cls) => { const n = document.createElement(tag); n.textContent = String(value ?? ''); if (cls) n.className = cls; return n; };\nconst local = value => { const d = value ? new Date(value) : new Date(); if (Number.isNaN(d.getTime())) return ''; return new Date(d.getTime() - d.getTimezoneOffset()*60000).toISOString().slice(0,16); };\nconst stamp = value => { const d = new Date(value); return Number.isNaN(d.getTime()) ? '未知时间' : d.toLocaleString('zh-CN', {hour12:false}); };\nconst day = value => { const d = new Date(value); return Number.isNaN(d.getTime()) ? '未知日期' : d.toLocaleDateString('zh-CN', {year:'numeric',month:'long',day:'numeric',weekday:'short'}); };\nconst tags = value => value.split(/[,，]/).map(x => x.trim()).filter(Boolean);\nfunction notify(message, error = false) { if(state.disposed) return; $('notice').textContent = message; $('notice').className = 'status' + (error ? ' error' : ''); $('notice').hidden = !message; }\nasync function call(op, args = {}) { if (!state.request || state.disposed) throw new Error('Me 尚未连接，请稍后重试；输入会保留。'); return state.request({op, ...args}); }\nfunction filters() { const f={};const query=$('query').value.trim(),category=$('filterCategory').value.trim();if(query)f.query=query;if(category)f.category=category;if($('from').value)f.from=new Date($('from').value+'T00:00:00').toISOString();if($('to').value)f.to=new Date($('to').value+'T23:59:59.999').toISOString();return f; }\nfunction action(label, run, cls) { const b = text('button', label, cls); b.type = 'button'; b.addEventListener('click', run); return b; }\nfunction meta(record) { return `发生 ${stamp(record.occurredAt)} · 记录 ${stamp(record.recordedAt)}${record.updatedAt && record.updatedAt !== record.recordedAt ? ' · 更新 ' + stamp(record.updatedAt) : ''}`; }\nfunction renderTimeline() {\n const root = $('timeline'); root.replaceChildren(); let lastDay;\n if (!state.records.length) root.append(text('div', '这里还是一片空白。可以写下第一句话，也可以慢慢来。', 'empty'));\n for (const r of state.records) { const date = day(r.occurredAt); if (date !== lastDay) { root.append(text('div', date, 'day')); lastDay = date; }\n const entry = text('article', '', 'entry'); const top = text('div', '', 'row spread'); const badges = text('div', '', 'row'); badges.append(text('span', r.category || '未分类', 'tag')); if(r.sensitive) badges.append(text('span','敏感','tag')); top.append(badges);\n const actions = text('div','','row actions'); actions.append(action('编辑', () => openRecord(r.id)),action('AI 整理 / 重试',()=>analyze(r.id,state.recordRevision)),action('删除', () => removeRecord(r), 'danger')); top.append(actions); entry.append(top,text('div',r.content,'note'),text('div',meta(r),'meta'));\n if(r.metrics?.length)entry.append(text('div',r.metrics.map(m=>`${m.label||m.kind} ${m.value} ${m.unit}`).join(' · '),'tag'));if(r.analysis)entry.append(text('div',`AI ${r.analysis.status==='done'?'已整理':r.analysis.status==='failed'?'整理失败':'整理中'}：${r.analysis.summary||r.analysis.error||''}`,'ai-label'));if(r.tags?.length) entry.append(text('div',r.tags.map(t=>'#'+t).join('  '),'meta')); entry.append(text('div', '来源：'+(r.source || '用户手动'), 'meta')); root.append(entry); }\n $('count').textContent = `共 ${state.total} 条 · 第 ${Math.floor(state.offset/state.limit)+1} 页`;\n $('prev').disabled = state.loading || state.offset === 0; $('next').disabled = state.loading || state.offset+state.limit >= state.total;\n}\nfunction renderProfiles() { const root=$('profiles'); root.replaceChildren(); if(!state.profiles.length) root.append(text('div','还没有背景卡。只留下你愿意长期提供的资料。','empty'));\n for(const p of state.profiles) {const card=text('article','','card'); const status={active:'已确认',unknown:'未知 / 待确认',outdated:'已过时'}[p.status] || p.status || '未知'; const row=text('div','','row'); row.append(text('span',status,'tag'),text('span',p.includeInContext?'允许纳入上下文':'不纳入上下文','tag')); if(p.sensitive) row.append(text('span','敏感','tag')); card.append(row,text('div',p.content,'note'),text('div',`来源：${p.source || '用户手动'}\\n记录：${stamp(p.recordedAt)}\\n最近确认：${p.confirmedAt ? stamp(p.confirmedAt) : '尚未确认'}`,'meta')); const actions=text('div','','row actions'); actions.append(action('编辑 / 确认',()=>openProfile(p.id)),action('删除',()=>removeProfile(p),'danger'));card.append(actions);root.append(card); }\n}\nasync function refresh() { const generation=++state.generation; state.loading=true; try {const [found, profiles] = await Promise.all([call('search',{...filters(),includeSensitive:true,offset:state.offset,limit:state.limit}),call('profileGet',{includeSensitive:true})]); if(state.disposed||generation!==state.generation)return; state.revision=Math.max(found.revision,profiles.revision); state.recordRevision=found.revision;state.profileRevision=profiles.revision;state.records=found.records;state.total=found.total;state.profiles=profiles.profiles; if(state.offset>=state.total&&state.offset>0){state.offset=Math.max(0,Math.floor((state.total-1)/state.limit)*state.limit);return refresh();} renderProfiles();await refreshStats();} finally {if(generation===state.generation){state.loading=false;renderTimeline();}} }\nasync function safeRefresh() {try{await refresh();}catch(e){notify(e.message,true);}}\nasync function runButton(button, fn) {button.disabled=true;try{await fn();}catch(e){notify(e.message,true);}finally{button.disabled=false;}}\n$('occurred').value=local();\n$('quick').addEventListener('submit',e=>{e.preventDefault();const b=e.submitter;runButton(b,async()=>{const draft={content:$('content').value,occurredAt:$('occurred').value,category:$('category').value,tags:$('tags').value,sensitive:$('sensitive').checked};const saved=await call('add',{content:draft.content,occurredAt:new Date(draft.occurredAt).toISOString(),category:draft.category.trim(),tags:tags(draft.tags),source:'用户手动',sensitive:draft.sensitive});if($('content').value===draft.content)$('content').value='';if($('tags').value===draft.tags)$('tags').value='';if($('category').value===draft.category)$('category').value='';if($('occurred').value===draft.occurredAt)$('occurred').value=local();if($('sensitive').checked===draft.sensitive)$('sensitive').checked=false;notify(draft.sensitive?'敏感原文已保存，仅保留在本地。':'原文已保存，正在 AI 整理…');state.offset=0;await safeRefresh();if(!draft.sensitive)await analyze(saved.record.id,saved.revision);});});\n$('filters').addEventListener('submit',e=>{e.preventDefault();if($('from').value && $('to').value && $('from').value>$('to').value){notify('开始日期不能晚于结束日期。',true);return;}state.offset=0;safeRefresh();});\n$('reset').onclick=()=>{$('filters').reset();state.offset=0;safeRefresh();};$('prev').onclick=()=>{state.offset=Math.max(0,state.offset-state.limit);safeRefresh();};$('next').onclick=()=>{state.offset+=state.limit;safeRefresh();};\ndocument.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{document.querySelectorAll('[data-tab]').forEach(tab=>tab.setAttribute('aria-selected',String(tab===b)));['overview','appearance','daily','reviews','about','tasks','privacy'].forEach(id=>$(id).hidden=id!==b.dataset.tab);if(b.dataset.tab==='tasks')refreshDailyTasks();if(b.dataset.tab==='appearance')refreshAppearance();if(b.dataset.tab==='reviews')refreshReviews();});\nfunction populateEditor(item, kind, revision) {state.editing={kind,id:item?.id,expectedRevision:revision,originalContent:item?.content||'',originalMetrics:JSON.stringify(item?.metrics||[])};$('editTitle').textContent=kind==='profile'?'背景卡 · 明确确认':'编辑日常记录';$('editRevision').textContent=`基于版本 ${revision} 编辑。刷新时间线不会改变此版本；冲突时保留你的草稿。`;$('editContent').maxLength=kind==='profile'?10000:20000;$('editContent').value=item?.content||'';$('recordFields').hidden=kind!=='record';$('profileFields').hidden=kind!=='profile';$('editOccurred').required=kind==='record';$('editOccurred').value=local(item?.occurredAt);$('editCategory').value=item?.category||'';$('editTags').value=(item?.tags||[]).join('，');$('editMetrics').value=JSON.stringify(item?.metrics||[],null,2);$('editGroup').value=item?.group||'basic';$('editKind').value=item?.kind||'self_report';$('editConfidence').value=item?.confidence||'tentative';$('editEvidence').value=item?.evidence||'';$('editGoalMetric').value=item?.goal?.metric||'';$('editGoalTarget').value=item?.goal?.target??'';$('editSource').value=item?.source||'用户手动确认';$('editStatus').value=item?.status||'active';$('editSensitive').checked=!!item?.sensitive;$('editInclude').checked=!!item?.includeInContext;$('editError').hidden=true;$('reloadEditor').hidden=!item?.id;}\nasync function openRecord(id){try{const result=await call('get',{id});const item=result.record;if(!item)throw new Error('记录已被删除，请刷新后重试。');populateEditor(item,'record',result.revision);$('editor').showModal();}catch(e){notify(e.message,true);}}\nasync function openProfile(id){try{const result=await call('profileGet',{includeSensitive:true});const item=result.profiles.find(p=>p.id===id);if(!item)throw new Error('背景卡不存在，请刷新。');populateEditor(item,'profile',result.revision);$('editor').showModal();}catch(e){notify(e.message,true);}}\n$('newProfile').onclick=async()=>{try{const result=await call('profileGet',{includeSensitive:true});populateEditor(null,'profile',result.revision);$('editor').showModal();}catch(e){notify(e.message,true);}};\n$('cancelEdit').onclick=()=>{$('editor').close();state.editing=null;};\n$('reloadEditor').onclick=async()=>{if(!state.editing||!confirm('重新载入会放弃当前编辑草稿，确定继续？'))return;const {id,kind}=state.editing;try{if(kind==='profile'){const r=await call('profileGet',{includeSensitive:true});const p=r.profiles.find(p=>p.id===id);if(!p)throw new Error('这张卡已被删除；你的草稿仍保留。');populateEditor(p,kind,r.revision);}else{const r=await call('get',{id});if(!r.record)throw new Error('记录已被删除；你的草稿仍保留。');populateEditor(r.record,kind,r.revision);}}catch(e){$('editError').textContent=e.message;$('editError').hidden=false;}};\n$('editForm').addEventListener('submit',async e=>{e.preventDefault();const edit=state.editing;if(!edit)return;const b=e.submitter;b.disabled=true;try{if(edit.kind==='profile'){await call('profileSave',{id:edit.id,expectedRevision:edit.expectedRevision,content:$('editContent').value,source:$('editSource').value.trim(),sensitive:$('editSensitive').checked,includeInContext:$('editInclude').checked,status:$('editStatus').value,group:$('editGroup').value,kind:$('editKind').value,evidence:$('editEvidence').value,confidence:$('editKind').value==='observation'?'tentative':$('editConfidence').value,...($('editGoalMetric').value?{goal:{metric:$('editGoalMetric').value,target:Number($('editGoalTarget').value)}}:{goal:null})});}else{await call('update',{id:edit.id,expectedRevision:edit.expectedRevision,patch:{content:$('editContent').value,occurredAt:new Date($('editOccurred').value).toISOString(),category:$('editCategory').value.trim(),tags:tags($('editTags').value),sensitive:$('editSensitive').checked,metrics:correctedMetrics(edit)}});} $('editor').close();state.editing=null;notify('已保存更正。');await safeRefresh();}catch(err){$('editError').textContent=err.message+'\\n草稿与原编辑版本已保留。若有版本冲突，请先复制草稿，再主动点击“重新载入最新内容”。';$('editError').hidden=false;}finally{b.disabled=false;}});\nasync function removeRecord(r){const expectedRevision=state.recordRevision;if(!confirm('删除这条记录？此操作不能撤销。\\n'+r.content.slice(0,160)))return;try{await call('remove',{id:r.id,expectedRevision});notify('已删除记录。');await safeRefresh();}catch(e){notify(e.message+' 请刷新后确认最新内容，再决定是否删除。',true);await safeRefresh();}}\nasync function removeProfile(p){const expectedRevision=state.profileRevision;if(!confirm('删除这张背景卡？此操作不能撤销。\\n'+p.content.slice(0,160)))return;try{await call('profileRemove',{id:p.id,expectedRevision});notify('已删除背景卡。');await safeRefresh();}catch(e){notify(e.message+' 请刷新后重新确认。',true);await safeRefresh();}}\nfunction download(content,name,type){const blob=new Blob([content],{type});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}\n$('markdown').onclick=e=>runButton(e.currentTarget,async()=>{const result=await call('exportMarkdown',{...filters(),includeSensitive:$('exportSensitive').checked});download(typeof result==='string'?result:result.markdown,`Me-${new Date().toISOString().slice(0,10)}.md`,'text/markdown;charset=utf-8');notify('已导出当前筛选范围的 Markdown。');});\n$('backup').onclick=e=>runButton(e.currentTarget,async()=>{const result=await call('exportBackup');download(typeof result==='string'?result:result.data,`Me-backup-${new Date().toISOString().slice(0,10)}.json`,'application/json');notify('已导出完整备份，请安全保存。');});\n$('restore').onclick=()=>{$('restoreFile').value='';$('restoreFile').click();};\n$('restoreFile').onchange=async()=>{const file=$('restoreFile').files[0];if(!file)return;try{if(file.size>20*1024*1024)throw new Error('备份文件超过 20 MB，无法在页面中预览。');const raw=await file.text();const data=JSON.parse(raw);if(data.version!==1||!Array.isArray(data.records)||!Array.isArray(data.profiles))throw new Error('不是有效的 Me v1 完整备份。');const snapshot=await call('snapshot');const localRecords=new Map(snapshot.records.map(x=>[x.id,x]));const localProfiles=new Map(snapshot.profiles.map(x=>[x.id,x]));const localDaily=new Map((snapshot.dailyItems||[]).map(x=>[x.id,x]));const localReviews=new Map((snapshot.reviews||[]).map(x=>[x.id,x]));const overlap=data.records.filter(x=>localRecords.has(x.id)).length+data.profiles.filter(x=>localProfiles.has(x.id)).length+(data.dailyItems||[]).filter(x=>localDaily.has(x.id)).length+(data.reviews||[]).filter(x=>localReviews.has(x.id)).length;state.pendingImport={data:raw,expectedRevision:snapshot.revision};$('restorePreview').textContent=`文件：${file.name}\\n记录：${data.records.length} 条\\n背景卡：${data.profiles.length} 张\\n每日事项：${(data.dailyItems||[]).length} 项\\n复盘：${(data.reviews||[]).length} 篇\\n本地同 ID：${overlap} 项（仅完全相同才跳过，不覆盖）\\n\\n内容预览：\\n`+data.records.slice(0,3).map(x=>String(x.content||'').slice(0,200)).join('\\n—\\n');$('restoreError').hidden=true;$('restoreDialog').showModal();}catch(e){notify('无法预览：'+e.message,true);}};\n$('cancelRestore').onclick=()=>{$('restoreDialog').close();state.pendingImport=null;};\n$('confirmRestore').onclick=e=>{if(!state.pendingImport||state.importBusy)return;const pending=state.pendingImport;state.importBusy=true;e.currentTarget.disabled=true;call('importBackup',pending).then(async()=>{$('restoreDialog').close();state.pendingImport=null;notify('备份已合并；本地内容未被覆盖。');await Promise.all([safeRefresh(),refreshDailyTasks()]);}).catch(err=>{$('restoreError').textContent=err.message+' 如本地版本已变化，请取消并重新选择文件预览。';$('restoreError').hidden=false;}).finally(()=>{state.importBusy=false;$('confirmRestore').disabled=false;});};\n\n// Nutstore is an explicit local-folder backup/restore action, never a background sync.\n$('nutstoreBackup').onclick=e=>runButton(e.currentTarget,async()=>{\n $('nutstoreStatus').textContent='正在生成完整备份…';\n try{const result=await call('nutstoreBackup');$('nutstoreStatus').textContent=`备份已写入：${result.filePath}\\n记录 ${result.records} 条 · 背景 ${result.profiles} 张 · 每日事项 ${result.dailyItems} 项 · 复盘 ${result.reviews} 篇\\n${result.note}`;}\n catch(error){$('nutstoreStatus').textContent='备份失败：'+error.message;throw error;}\n});\n$('nutstoreRestore').onclick=async e=>{\n const button=e.currentTarget;button.disabled=true;$('nutstoreError').hidden=true;$('nutstoreChoices').replaceChildren(text('option','正在读取…'));$('chooseNutstore').disabled=true;$('nutstoreDialog').showModal();\n try{\n  const result=await call('nutstoreList',{limit:50});$('nutstorePath').textContent=result.directory;$('nutstoreChoices').replaceChildren();\n  if(!result.backups.length)$('nutstoreChoices').append(text('option','此目录还没有 Me 备份'));\n  for(const backup of result.backups){const option=text('option',backup.error?`${backup.id}（无法读取）`:`${backup.modifiedAt?stamp(backup.modifiedAt):backup.id} · 记录 ${backup.records} · 背景 ${backup.profiles} · 日常 ${backup.dailyItems} · 复盘 ${backup.reviews||0}`);option.value=backup.id;option.disabled=Boolean(backup.error);$('nutstoreChoices').append(option);}\n  if(result.backups.some(x=>!x.error)){$('nutstoreChoices').selectedIndex=result.backups.findIndex(x=>!x.error);$('chooseNutstore').disabled=false;}\n  $('nutstoreStatus').textContent=result.note;\n }catch(error){$('nutstoreError').textContent=error.message;$('nutstoreError').hidden=false;}\n finally{button.disabled=false;}\n};\n$('closeNutstore').onclick=()=>$('nutstoreDialog').close();\n$('chooseNutstore').onclick=async e=>{\n const id=$('nutstoreChoices').value;if(!id)return;const button=e.currentTarget;button.disabled=true;$('nutstoreError').hidden=true;\n try{\n  const backup=await call('nutstoreRead',{id});const data=JSON.parse(backup.data);const snapshot=await call('snapshot');\n  const ids=new Set([...snapshot.records,...snapshot.profiles,...(snapshot.dailyItems||[])].map(x=>x.id));\n  const overlap=[...data.records,...data.profiles,...(data.dailyItems||[])].filter(x=>ids.has(x.id)).length;\n  state.pendingImport={data:backup.data,expectedRevision:snapshot.revision};\n  $('restorePreview').textContent=`坚果云备份：${id}\\n文件内版本：${backup.revision}\\n记录：${data.records.length} 条\\n背景卡：${data.profiles.length} 张\\n每日事项：${(data.dailyItems||[]).length} 项\\n复盘：${(data.reviews||[]).length} 篇\\n本地同 ID：${overlap} 项（仅完全相同才跳过，不覆盖）\\n\\n只合并，不传播删除。目录中的文件不一定已由坚果云客户端上传完成。`;\n  $('restoreError').hidden=true;$('nutstoreDialog').close();$('restoreDialog').showModal();\n }catch(error){$('nutstoreError').textContent='无法读取：'+error.message;$('nutstoreError').hidden=false;$('chooseNutstore').disabled=false;}\n};\n\nfunction correctedMetrics(edit){const parsed=JSON.parse($('editMetrics').value||'[]');if(!Array.isArray(parsed))throw new Error('指标必须为 JSON 数组');const unchanged=JSON.stringify(parsed)===edit.originalMetrics;return $('editContent').value!==edit.originalContent&&unchanged?[]:parsed;}\nasync function analyze(id,expectedRevision){try{notify('原文已保存，正在 AI 整理这一条记录…');await call('analyzeRecord',{id,expectedRevision});notify('AI 整理完成；请检查提取数量，原文仍保留。');}catch(e){notify('原文已保存；AI 整理未完成：'+e.message+'，可稍后重试。',true);}await safeRefresh();}\nconst profileGroups=[['basic','基础信息'],['personality','性格'],['mbti','MBTI'],['goal','目标'],['other','其他背景']];\nfunction overview(stats){const root=$('overviewProfiles');root.replaceChildren();for(const [group,title]of profileGroups){const section=text('section','','profile-section');section.append(text('h2',title));const list=text('div','','overview-grid');const items=state.profiles.filter(p=>(p.group||'other')===group);if(!items.length)list.append(text('p','还没有记录。可在聊天中告诉我，也可以在“关于我”添加。','hint'));for(const p of items){const card=text('article','','card');card.append(text('div',p.content,'note'));card.append(text('div',`${{self_report:'本人自述',assessment:'测评',observation:'AI 观察（暂定）'}[p.kind]||'本人自述'} · ${{tentative:'暂定',moderate:'有一定依据',confirmed:'本人确认'}[p.confidence]||'未标注'} · ${p.status==='outdated'?'已过时':p.status==='unknown'?'待确认':'有效'}`,'meta'));if(p.evidence)card.append(text('div','依据：'+p.evidence,'meta'));card.append(text('div',`来源：${p.source||'用户'} · ${stamp(p.confirmedAt||p.recordedAt)}`,'meta'));if(p.goal){const key={water_ml:'waterMl',exercise_min:'exerciseMin',weight_kg:'weightKg',sleep_hour:'sleepHour'}[p.goal.metric];const today=stats.days?.at(-1)?.[key];card.append(text('div',`目标 ${p.goal.target} ${p.goal.unit||p.goal.metric} · 今日${today==null?'暂无记录':today}`,'meta'));}list.append(card);}section.append(list);root.append(section);}}\nfunction chart(title,key,unit,days){const card=text('article','','card chart-card');card.append(text('h3',title+' · '+unit));const values=days.map(d=>d[key]);const available=values.filter(v=>typeof v==='number');if(!available.length){card.append(text('p','还没有明确数据。没有记录不会当作零。','empty'));return card;}const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 520 150');svg.setAttribute('class','chart');svg.setAttribute('role','img');svg.setAttribute('aria-label',title+'，空白为未记录');const max=Math.max(...available,1);let points=[];const flush=()=>{if(!points.length)return;const line=document.createElementNS('http://www.w3.org/2000/svg','polyline');line.setAttribute('points',points.join(' '));line.setAttribute('fill','none');line.setAttribute('stroke','var(--accent)');line.setAttribute('stroke-width','2');svg.append(line);points=[];};days.forEach((d,i)=>{const v=d[key];if(v==null){flush();return;}const x=20+i*480/Math.max(days.length-1,1),y=125-v/max*105;points.push(x+','+y);const dot=document.createElementNS('http://www.w3.org/2000/svg','circle');dot.setAttribute('cx',x);dot.setAttribute('cy',y);dot.setAttribute('r',3);dot.setAttribute('fill','var(--accent)');const tip=document.createElementNS('http://www.w3.org/2000/svg','title');tip.textContent=d.date+'：'+v+' '+unit;dot.append(tip);svg.append(dot);});flush();card.append(svg,text('div',days.map(d=>d.date.slice(5)+': '+(d[key]==null?'—':d[key])).join(' · '),'chart-values muted'));return card;}\nasync function refreshStats(){try{const stats=await call('stats',{days:14,timeZone:Intl.DateTimeFormat().resolvedOptions().timeZone,includeSensitive:true});if(state.disposed)return;overview(stats);const root=$('charts');root.replaceChildren();for(const [title,key,unit]of [['饮水记录次数','waterCount','次'],['明确饮水量','waterMl','ml'],['运动时长','exerciseMin','分钟'],['体重','weightKg','kg'],['睡眠','sleepHour','小时']])root.append(chart(title,key,unit,stats.days||[]));}catch(e){$('charts').textContent='图表暂不可用：'+e.message;overview({days:[]});}}\n$('refreshStats').onclick=()=>refreshStats();\n\n// Reviews preserve raw diary summaries separately from interpretation; no AI request is made here.\nfunction reviewDateDefault(){const d=new Date();d.setDate(d.getDate()-1);return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,10);}\n$('reviewDate').value=reviewDateDefault();\nfunction reviewFilterArgs(){const args={includeSensitive:true,limit:state.reviewLimit,offset:state.reviewOffset};if($('reviewFrom').value)args.from=$('reviewFrom').value;if($('reviewTo').value)args.to=$('reviewTo').value;return args;}\nfunction reviewTextBlock(title,value){const block=text('section','','review-block');block.append(text('h3',title),text('div',value||'尚未填写','note'));return block;}\nfunction renderReviews(){\n const root=$('reviewList');root.replaceChildren();\n if(!state.reviews.length)root.append(text('p','还没有复盘。可以在这里写一篇，也可以在聊天中整理后保存。','empty'));\n for(const review of state.reviews){const card=text('article','','card');const top=text('div','','row spread');const heading=text('div','','row');heading.append(text('strong',review.date));if(review.sensitive)heading.append(text('span','敏感','tag'));if(review.status==='draft')heading.append(text('span','草稿','tag'));const controls=text('div','','row actions');controls.append(action('编辑',()=>openReview(review.id)),action('删除',()=>deleteReview(review),'danger'));top.append(heading,controls);card.append(top,reviewTextBlock('原始日记',review.summary),reviewTextBlock('复盘分析',review.analysis));if(review.analysis)card.append(text('div','分析来源：'+({user:'手动整理',ai:'AI 分析'}[review.analysisSource]||'未注明'),'meta'));if(review.sourceIds?.length)card.append(text('div','依据记录：'+review.sourceIds.join('、'),'meta'));if(review.updatedAt||review.createdAt)card.append(text('div','最近更新：'+stamp(review.updatedAt||review.createdAt),'meta'));root.append(card);}\n $('reviewCount').textContent=`共 ${state.reviewTotal} 篇 · 第 ${Math.floor(state.reviewOffset/state.reviewLimit)+1} 页`;$('reviewPrev').disabled=state.reviewOffset===0;$('reviewNext').disabled=state.reviewOffset+state.reviewLimit>=state.reviewTotal;\n}\nasync function refreshReviews(){const generation=++state.reviewGeneration;try{const found=await call('reviewList',reviewFilterArgs());if(state.disposed||generation!==state.reviewGeneration)return;state.reviews=found.reviews;state.reviewTotal=found.total;state.reviewRevision=found.revision;if(state.reviewDraftRevision===null)state.reviewDraftRevision=found.revision;if(state.reviewOffset>=found.total&&state.reviewOffset>0){state.reviewOffset=Math.max(0,Math.floor((found.total-1)/state.reviewLimit)*state.reviewLimit);return refreshReviews();}renderReviews();}catch(error){$('reviewStatus').textContent='读取失败：'+error.message;}}\n$('reviewFilters').addEventListener('submit',e=>{e.preventDefault();if($('reviewFrom').value&&$('reviewTo').value&&$('reviewFrom').value>$('reviewTo').value){$('reviewStatus').textContent='开始日期不能晚于结束日期。';return;}state.reviewOffset=0;refreshReviews();});\n$('reviewReset').onclick=()=>{$('reviewFrom').value='';$('reviewTo').value='';state.reviewOffset=0;refreshReviews();};$('reviewExport').onclick=async()=>{try{const exportArgs={includeSensitive:true};if($('reviewFrom').value)exportArgs.from=$('reviewFrom').value;if($('reviewTo').value)exportArgs.to=$('reviewTo').value;const markdown=await call('exportReviewsMarkdown',exportArgs);download(markdown,`Me-reviews-${new Date().toISOString().slice(0,10)}.md`,'text/markdown;charset=utf-8');$('reviewStatus').textContent='已导出当前筛选范围的复盘。';}catch(error){$('reviewStatus').textContent='导出失败：'+error.message;}};$('reviewPrev').onclick=()=>{state.reviewOffset=Math.max(0,state.reviewOffset-state.reviewLimit);refreshReviews();};$('reviewNext').onclick=()=>{state.reviewOffset+=state.reviewLimit;refreshReviews();};\n$('reviewForm').addEventListener('submit',async e=>{e.preventDefault();if(state.reviewBusy)return;state.reviewBusy=true;const button=e.submitter;button.disabled=true;const draft={date:$('reviewDate').value,summary:$('reviewSummary').value,analysis:$('reviewAnalysis').value,sensitive:$('reviewSensitive').checked};try{const current=await call('snapshot');state.reviewDraftRevision=current.revision;await call('reviewSave',{...draft,analysis:draft.analysis||null,analysisSource:draft.analysis?'user':null,status:'confirmed',expectedRevision:state.reviewDraftRevision});if($('reviewSummary').value===draft.summary)$('reviewSummary').value='';if($('reviewAnalysis').value===draft.analysis)$('reviewAnalysis').value='';state.reviewDraftRevision=null;$('reviewStatus').textContent='复盘已保存。';await refreshReviews();}catch(error){$('reviewStatus').textContent='未保存：'+error.message+'；输入已保留。';if(error.code==='REVISION_CONFLICT'){state.reviewDraftRevision=null;await refreshReviews();$('reviewStatus').textContent='版本已变化，本次未保存；输入保留，请检查后再次提交。';}}finally{state.reviewBusy=false;button.disabled=false;}});\nfunction fillReviewEditor(review,revision){state.reviewEditing={id:review.id,expectedRevision:revision,sourceIds:review.sourceIds||[],status:review.status||'confirmed',analysisSource:review.analysisSource,originalAnalysis:review.analysis||''};$('reviewEditDate').value=review.date;$('reviewEditSummary').value=review.summary;$('reviewEditAnalysis').value=review.analysis||'';$('reviewEditSensitive').checked=!!review.sensitive;$('reviewEditRevision').textContent=`基于版本 ${revision} 编辑；刷新列表不会改变编辑版本。`;$('reviewEditError').hidden=true;}\nasync function openReview(id){try{const result=await call('reviewGet',{id,includeSensitive:true});if(!result.review)throw new Error('复盘已被删除，请刷新。');fillReviewEditor(result.review,result.revision);$('reviewEditor').showModal();}catch(error){$('reviewStatus').textContent=error.message;}}\n$('reviewCancelEdit').onclick=()=>{$('reviewEditor').close();state.reviewEditing=null;};\n$('reviewReload').onclick=async()=>{const edit=state.reviewEditing;if(!edit||!confirm('重新载入会放弃当前草稿，确定继续？'))return;try{const result=await call('reviewGet',{id:edit.id,includeSensitive:true});if(!result.review)throw new Error('复盘已删除；草稿仍保留。');fillReviewEditor(result.review,result.revision);}catch(error){$('reviewEditError').textContent=error.message;$('reviewEditError').hidden=false;}};\n$('reviewEditForm').addEventListener('submit',async e=>{e.preventDefault();const edit=state.reviewEditing;if(!edit||state.reviewBusy)return;state.reviewBusy=true;const button=e.submitter;button.disabled=true;try{const analysis=$('reviewEditAnalysis').value;await call('reviewSave',{id:edit.id,date:$('reviewEditDate').value,summary:$('reviewEditSummary').value,analysis:analysis||null,analysisSource:analysis?(analysis===edit.originalAnalysis?(edit.analysisSource||'user'):'user'):null,sensitive:$('reviewEditSensitive').checked,sourceIds:edit.sourceIds,status:edit.status,expectedRevision:edit.expectedRevision});$('reviewEditor').close();state.reviewEditing=null;$('reviewStatus').textContent='复盘已更新。';await refreshReviews();}catch(error){$('reviewEditError').textContent=error.message+'；草稿及编辑版本已保留，请先检查最新内容。';$('reviewEditError').hidden=false;}finally{state.reviewBusy=false;button.disabled=false;}});\nasync function deleteReview(review){const expectedRevision=state.reviewRevision;if(!confirm('删除 '+review.date+' 的这篇复盘？此操作不能撤销。'))return;try{await call('reviewDelete',{id:review.id,expectedRevision});$('reviewStatus').textContent='复盘已删除。';await refreshReviews();}catch(error){$('reviewStatus').textContent='未删除：'+error.message+'；请刷新后重新确认。';}}\n// Called on review tab entry and after saves; chat-created reviews use exactly the same list.\nwindow.__meRefreshReviews=()=>refreshReviews();\n\n// Independent Me daily items. They never modify the separate todo plugin.\nconst today = () => { const d=new Date();return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,10); };\nfunction renderDailyTasks(){\n const root=$('dailyTaskList');root.replaceChildren();const data=state.dailyTasks;\n if(!data){root.append(text('p','正在读取今日事项…','hint'));return;}\n if(!data.items.length){root.append(text('p','还没有每日事项。添加一件小事即可，不需要打卡压力。','empty'));return;}\n for(const item of data.items){\n  const row=text('article','','row spread');row.style.padding='12px 0';row.style.borderBottom='1px solid var(--line)';\n  const main=text('div','','row');const toggle=action(item.done?'✓':'○',()=>mutateDaily(()=>call('dailyUpdate',{id:item.id,expectedRevision:state.dailyTasks.revision,date:data.date,done:!item.done})),'primary');\n  toggle.title=item.done?'恢复今天未完成':'标记今天完成';toggle.setAttribute('aria-label',toggle.title);toggle.style.borderRadius='50%';toggle.style.minWidth='34px';toggle.style.padding='5px 9px';\n  const label=text('span',item.text);if(item.done){label.style.textDecoration='line-through';label.style.opacity='.55';}main.append(toggle,label);\n  const actions=text('div','','row actions');actions.append(action('编辑',()=>{const next=prompt('修改每日事项',item.text);if(next!==null&&next.trim()&&next!==item.text)mutateDaily(()=>call('dailyUpdate',{id:item.id,expectedRevision:state.dailyTasks.revision,text:next.trim()}));}),action('删除',()=>{if(confirm('删除这个 Me 每日事项？历史完成日期也会一并删除。'))mutateDaily(()=>call('dailyRemove',{id:item.id,expectedRevision:state.dailyTasks.revision}));},'danger'));\n  row.append(main,actions);root.append(row);\n }\n}\nconst appearanceSections=[['appearance_current_','当前'],['appearance_goal_','目标']];\nfunction renderAppearance(){const root=$('appearanceProfiles');root.replaceChildren();for(const [group,title] of [['减脂','减脂'],['护肤','护肤'],['穿搭','穿搭'],['体态','体态'],['其他','其他']]){const section=text('section','','profile-section');section.append(text('h2',title));const list=text('div','','overview-grid');const items=state.profiles.filter(p=>p.group==='appearance'&&({减脂:'fat_loss',护肤:'skincare',穿搭:'style',体态:'posture',其他:'other'}[group]||'other')===(p.section||'other'));if(!items.length)list.append(text('p','暂无资料。可通过聊天更新，或在关于我中维护。','hint'));for(const p of items){const card=text('article','','card');card.append(text('div',p.content,'note'),text('div',`${p.status==='active'?'当前有效':'状态：'+p.status} · ${p.kind||'本人记录'}`,'meta'));if(p.goal)card.append(text('div',`目标：${p.goal.target??''} ${p.goal.unit||''}`,'meta'));if(p.evidence)card.append(text('div','依据：'+p.evidence,'meta'));list.append(card)}section.append(list);root.append(section)}}\nasync function refreshAppearance(){try{const [profiles,records]=await Promise.all([call('profileGet',{includeSensitive:true}),call('search',{limit:100,offset:0,includeSensitive:true})]);state.profiles=profiles.profiles;renderAppearance();const root=$('appearanceTimeline');root.replaceChildren();const list=(records.records||[]).filter(r=>r.project==='appearance');if(!list.length)root.append(text('p','暂无执行记录。','empty'));for(const r of list){const row=text('article','','entry');row.append(text('div',r.content,'note'),text('div',`${stamp(r.occurredAt)} · ${r.category||'形体'}`,'meta'));if(r.tags?.length)row.append(text('div',r.tags.map(t=>'#'+t).join(' '),'meta'));root.append(row)}}catch(e){$('appearanceRecordStatus').textContent='读取失败：'+e.message}}\n$('appearanceRecordForm').addEventListener('submit',async e=>{e.preventDefault();const content=$('appearanceRecordContent').value.trim();if(!content)return;const status=$('appearanceRecordStatus');status.textContent='保存中…';try{await call('add',{content,occurredAt:new Date().toISOString(),category:$('appearanceProject').value,tags:tags($('appearanceRecordTags').value),source:'Me 形体',sensitive:false,project:'appearance',activity:({减脂:'exercise',护肤:'skincare',穿搭:'style',体态:'posture',其他:'other'}[$('appearanceProject').value]||'other')});$('appearanceRecordContent').value='';$('appearanceRecordTags').value='';status.textContent='已保存';await refreshAppearance()}catch(error){status.textContent='保存失败：'+error.message}});\nasync function refreshDailyTasks(){try{const result=await call('dailyList',{date:today()});if(state.disposed)return;state.dailyTasks=result;renderDailyTasks();$('dailyTaskStatus').textContent='';}catch(e){$('dailyTaskStatus').textContent='读取失败：'+e.message;}}\nasync function mutateDaily(operation){\n if(state.dailyBusy)return;state.dailyBusy=true;$('dailyTaskStatus').textContent='正在保存…';\n try{const result=await operation();if(state.dailyTasks)state.dailyTasks.revision=result.revision;$('dailyTaskStatus').textContent='已保存';await refreshDailyTasks();}\n catch(e){$('dailyTaskStatus').textContent='未保存：'+e.message;await refreshDailyTasks();}\n finally{state.dailyBusy=false;}\n}\n$('dailyTaskForm').addEventListener('submit',async e=>{e.preventDefault();if(state.dailyBusy)return;const input=$('dailyTaskText');const content=input.value.trim();if(!content)return;if(!state.dailyTasks)await refreshDailyTasks();if(!state.dailyTasks)return;await mutateDaily(()=>call('dailyAdd',{text:content,expectedRevision:state.dailyTasks.revision}));if(state.dailyTasks?.items.some(x=>x.text===content))input.value='';});\n\n// The iframe and floating widget share the same Host-owned preference store.\nif(window.__mePreferences){\n const preferences=window.__mePreferences;\n const sync=()=>{const p=preferences.get();$('floatingEnabled').checked=p.enabled;$('hydrationEnabled').checked=p.hydration;$('movementEnabled').checked=p.movement;$('floatAiEnabled').checked=p.ai;};\n sync();state.preferencesCleanup=preferences.subscribe(sync);\n $('floatingEnabled').onchange=e=>preferences.set({enabled:e.currentTarget.checked});\n $('hydrationEnabled').onchange=e=>preferences.set({hydration:e.currentTarget.checked,reminderVersion:2});\n $('movementEnabled').onchange=e=>preferences.set({movement:e.currentTarget.checked,reminderVersion:2});\n $('floatAiEnabled').onchange=e=>preferences.set({ai:e.currentTarget.checked});\n}else{\n for(const id of ['floatingEnabled','hydrationEnabled','movementEnabled','floatAiEnabled'])$(id).disabled=true;\n}\n\nwindow.__meConnect = request => {state.request=request;state.disposed=false;notify('正在读取本地资料…');Promise.all([refresh(),refreshDailyTasks(),refreshAppearance(),refreshReviews(),call('info').then(info=>{if(state.disposed)return;$('location').textContent=info.dataFile||info.dataPath||info.path||info.dataDir||'服务未提供路径';$('policy').textContent=typeof info.policy==='string'?info.policy:JSON.stringify(info.policy||{});})]).then(()=>{if(!state.disposed)notify('');}).catch(e=>notify(e.message,true));return()=>{state.disposed=true;state.request=null;state.generation++;state.reviewGeneration++;state.preferencesCleanup?.();state.preferencesCleanup=null;};};\n})();\n</script></body></html>\n";
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
