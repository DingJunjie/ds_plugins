"""Build the authenticated Host-backed Todo without changing the standalone page."""
import json
import re
from pathlib import Path

root = Path(__file__).resolve().parent
page = (root.parent / 'todo' / 'index.html').read_text(encoding='utf-8')

def replace_once(old, new):
    global page
    if page.count(old) != 1:
        raise RuntimeError(f'Expected exactly one source anchor: {old[:80]!r}')
    page = page.replace(old, new, 1)

def replace_section(start, end, replacement):
    global page
    a, b = page.index(start), page.index(end)
    page = page[:a] + replacement + '\n\n' + page[b:]

replace_once('<label class="field">截止', '<label class="field"><span id="dateLabel">截止</span>')
replace_once('        <span class="hint">Enter 快速添加</span>', '''        <label class="field">重复
          <select id="recurrenceMode" aria-label="重复频率">
            <option value="none">不重复</option><option value="daily">每天</option><option value="weekly">每周</option>
          </select>
        </label>
        <div id="weekdays" class="weekdays" role="group" aria-label="每周重复日期" hidden>
          <label><input type="checkbox" value="1">一</label><label><input type="checkbox" value="2">二</label><label><input type="checkbox" value="3">三</label><label><input type="checkbox" value="4">四</label><label><input type="checkbox" value="5">五</label><label><input type="checkbox" value="6">六</label><label><input type="checkbox" value="7">日</label>
        </div>
        <span class="hint">重复事项按 Host 本地日期生成 · 不发送提醒</span>''')
replace_once('const KEY = "lumen.todo.v1";', '// Task persistence is owned by the Host bridge.')
replace_section('  const shiftISO = (days) => {', '  let state =', '')
replace_section('  function load() {', '  /* ---------------- helpers ---------------- */', '')
replace_section('  /* ---------------- actions ---------------- */', '  /* ---------------- events ---------------- */', '')
replace_once('composer.addEventListener("submit", (e) => {', 'composer.addEventListener("submit", async (e) => {')
replace_once('    addTask(text, activePrio, $("dueInput").value);', '''    const originalText = input.value;
    const originalDue = $("dueInput").value;
    if (!await addTask(text, activePrio, originalDue)) return;
    // Do not erase text the user started typing while the request was pending.
    if (input.value !== originalText || $("dueInput").value !== originalDue) return;''')
replace_once('if (e.key === "Escape") { editingId = null; render(); }',
             'if (e.key === "Escape" && !editSaving) { editingId = null; finishDeferred(); render(); }')
replace_once('    if (act === "toggle") toggleTask(id);',
             '    if (editSaving) return;\n    if (act === "toggle") toggleTask(id);')
replace_once('    if (!li || state.filter !== "all") return;',
             '    if (!li || state.filter !== "all" || busy || editingId || revision === null) { e.preventDefault(); return; }')
replace_once('    dragId = null;\n    document.querySelectorAll(".task")',
             '    dragId = null;\n    finishDeferred();\n    document.querySelectorAll(".task")')
replace_once('''    const [moved] = state.tasks.splice(from, 1);
    const to = targetId ? state.tasks.findIndex((t) => t.id === targetId) : state.tasks.length;
    state.tasks.splice(to < 0 ? state.tasks.length : to, 0, moved);
    dragId = null;
    save();
    render();''', '''    const ids = state.tasks.map(t => t.id);
    const [moved] = ids.splice(from, 1);
    const to = targetId ? ids.indexOf(targetId) : ids.length;
    ids.splice(to < 0 ? ids.length : to, 0, moved);
    dragId = null;
    reorderTasks(ids);''')
replace_once('    state.filter = btn.dataset.f;', '    if (editingId || busy) return;\n    state.filter = btn.dataset.f;')
replace_section('  $("clearBtn").addEventListener("click", () => {', '  $("exportBtn").addEventListener',
                '  $("clearBtn").addEventListener("click", clearCompleted);')
replace_once('      const chips = [];', '''      const chips = [];
      if (t.recurrence) chips.push(`<span class="chip">↻ ${esc(repeatDescription(t))}</span>`);''')
replace_once('      if (t.due) body += ` · 截止 ${t.due}`;', '''      if (t.due) body += ` · ${t.recurrence ? "应做" : "截止"} ${t.due}`;
      if (t.recurrence) body += ` · ${repeatDescription(t)}（开始 ${t.recurrence.start}）`;''')
bridge = (root / 'page-bridge.js').read_text(encoding='utf-8')
replace_once('  /* ---------------- boot ---------------- */', bridge + '\n  /* ---------------- boot ---------------- */')
replace_once('''  $("themeBtn").addEventListener("click", () => {
    state.theme = state.theme === "dark" ? "light" : "dark";
    applyTheme();
    save();
  });''', '''  $("themeBtn").addEventListener("click", () => {
    themeFollow = false;
    state.theme = state.theme === "dark" ? "light" : "dark";
    applyTheme();
    save();
  });''')
replace_once('数据存在本地', '数据保存在 Harness 本地')
replace_once('</style>', '''
  body { padding-top: 64px; padding-bottom: 36px; }
  .composer:focus-within .composer-meta, .composer.open .composer-meta { max-height: 240px; }
  #recurrenceMode { font:inherit; color:var(--ink-soft); background:var(--surface-2); border:1px solid var(--line); border-radius:9px; padding:6px 8px; }
  .weekdays { display:flex; gap:5px; flex-wrap:wrap; }
  .weekdays[hidden] { display:none; }
  .weekdays label { cursor:pointer; font-size:12px; color:var(--ink-soft); border:1px solid var(--line); padding:4px 6px; border-radius:8px; }
  .weekdays input { accent-color:var(--accent); margin:0 4px 0 0; }
  .weekdays label:has(input:checked) { background:var(--accent-wash); border-color:var(--accent); }
  @media (hover: none) { .actions { opacity: 1; transform: none; } }
</style>''')
# Prevent inline-script termination if future bridge code contains a literal closing tag.
if '</script' in bridge.lower():
    raise RuntimeError('Bridge must not contain inline script closing tags')
assert 'state.tasks.push(' not in page
assert 'state.tasks.splice(' not in page
assert 'seed()' not in page
bundle = (root / 'client-template.js').read_text(encoding='utf-8')
assert bundle.count('__PAGE__') == 1
bundle = bundle.replace('__PAGE__', json.dumps(page, ensure_ascii=False))
assert bundle.count('__FLOATING_WIDGET__') == 1
bundle = bundle.replace('__FLOATING_WIDGET__', (root / 'floating-widget.js').read_text(encoding='utf-8'))
(root / 'lib' / 'client.js').write_text(bundle, encoding='utf-8')
print('Built', root / 'lib' / 'client.js')
