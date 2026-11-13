import { fileURLToPath } from 'node:url';
import { homedir } from 'node:os';
import path from 'node:path';
import { existsSync, promises as fs } from 'node:fs';
import { defineTool } from '@deepseek-ai/dsh-tools';
import { delegationDepthOf } from '@deepseek-ai/dsh-subagent';
import { TypertRemoteService, Remote } from '@deepseek-ai/dsh-typert-protocol';
import { KnowledgeStore } from './store.js';

export const inject = ['tools'];
// 数据文件：本地存储；通过「同步到坚果云」按钮手动同步到坚果云文件夹。
const FILE = fileURLToPath(new URL('../data/knowledge.json', import.meta.url));
// 坚果云同步目标：优先「我的坚果云」内容目录，其次同步根，其次 iCloud Drive。
function nutstoreDir() {
  const override = process.env.DSH_DATA_DIR;
  if (override && override.trim()) return path.resolve(override.trim());
  const candidates = [
    path.join(homedir(), 'Nutstore Files', 'Nutstore'),
    path.join(homedir(), 'Nutstore Files'),
    path.join(homedir(), '我的坚果云'),
    path.join(homedir(), 'Library', 'Mobile Documents', 'com~apple~CloudDocs'),
  ];
  return candidates.find(dir => existsSync(dir)) || null;
}
const string = (description, required = false) => ({ type: 'string', description, ...(required ? { required } : {}) });
const list = description => ({ type: 'array', items: { type: 'string' }, description });
const output = { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value }] };

const FIELDS = {
  type: { type: 'string', enum: ['knowledge', 'plan'], description: '条目类型：knowledge 为知识/认知，plan 为计划/目标。默认 knowledge。' },
  title: string('知识点标题（这个 idea / 事物叫什么），不超过 200 字。', true),
  domain: string('领域，如 物理 / 商业 / AI / 认知 / 个人成长，不超过 50 字。'),
  tags: list('标签数组，每个不超过 50 字，最多 20 个。'),
  summary: string('一句话概述，不超过 500 字。'),
  axioms: list('前提 / 公理：最根本、不可再简化的假设或事实，每条不超过 500 字。'),
  elements: list('基本事实 / 要素：由前提拆出的关键构成，每条不超过 500 字。'),
  conclusions: list('推导结论：从前提与要素推导出的结论，每条不超过 500 字。'),
  related: list('关联知识点的标题数组（若有）。'),
};

class KnowledgeRemote extends TypertRemoteService {
  constructor(ctx, store) {
    super(ctx, 'localKnowledge');
    this.store = store;
    Remote('request')(this.request, { kind: 'method', name: 'request', addInitializer: fn => fn.call(this) });
  }
  async request(request) {
    if (this.ctx.invocation?.peer.principal?.kind !== 'owner') return { ok: false, error: { code: 'FORBIDDEN', message: '知识点百科仅对当前 Host 所有者开放。' } };
    try {
      if (!request || typeof request !== 'object' || Array.isArray(request)) throw new Error('Invalid request');
      const { op, ...args } = request;
      if (op === 'syncToNutstore') {
        const dir = nutstoreDir();
        if (!dir) throw new Error('未检测到坚果云/iCloud 同步文件夹');
        if (!existsSync(FILE)) throw new Error('本地还没有知识点数据');
        const target = path.join(dir, 'DeepSeekHarness', 'knowledge.json');
        await fs.mkdir(path.dirname(target), { recursive: true });
        await fs.copyFile(FILE, target);
        return { ok: true, value: { synced: true, target, at: new Date().toISOString() } };
      }
      const allowed = ['snapshot', 'list', 'get', 'search', 'domains', 'add', 'update', 'addPerspective', 'remove', 'output', 'exportMarkdown'];
      if (!allowed.includes(op)) throw new Error('Unsupported page operation');
      return { ok: true, value: await this.store[op](args) };
    } catch (e) {
      return { ok: false, error: { code: e.code || 'KNOWLEDGE_ERROR', message: e.message } };
    }
  }
}

export async function apply(ctx) {
  const store = new KnowledgeStore({ filePath: FILE });
  await store.snapshot(); // Fail closed on corrupt data; never silently reset.
  new KnowledgeRemote(ctx, store);
  const register = (name, description, parameters, execute) => ctx.tools.register(defineTool({
    name, description, parameters, output,
    async execute(args, exec) {
      exec.signal?.throwIfAborted();
      if (!exec.agent) throw new Error('知识点工具需要当前会话。');
      if (delegationDepthOf(exec.agent) > 0) throw new Error('请由主会话处理知识点。');
      return JSON.stringify(await execute(args, exec), null, 2);
    }
  }));

  register('knowledge_search', '按关键词或领域检索已存知识点。返回标题、领域、标签、概述和 id。拿不准 id 时先用本工具查。', {
    query: string('搜索关键词，匹配标题/概述/标签/公理/要素/结论/角度，可留空。'),
    domain: string('按领域精确筛选，可留空。')
  }, async args => store.search(args));
  register('knowledge_list', '列出全部知识点的简要信息（标题、领域、标签、概述、更新时间）。', {}, async () => store.list());
  register('knowledge_domains', '列出所有领域及其条目数，用于了解已有分类。', {}, async () => store.domains());
  register('knowledge_get', '按 id 读取一条知识点的完整内容，含第一性原理分解与角度记录。', { id: string('知识点 id。', true) }, async args => store.get(args));
  register('knowledge_save', '当你用第一性原理分析了一个 idea / 概念 / 事物后，把它存为一条知识点。分析要先回到最根本、不可再简化的前提，再向上推导，不要堆砌常识或类比。用户在本次对话明确要求解析并保存时才调用。', FIELDS, async args => {
    const { expectedRevision, ...rest } = args;
    const snapshot = await store.snapshot();
    return store.add({ ...rest, expectedRevision: snapshot.revision });
  });
  register('knowledge_update', '用户要求修改已有条目时使用。先 search/list/get 取得准确 id 和 revision，同名先问用户。只改核心字段；角度记录用 knowledge_add_perspective 追加。', {
    id: string('条目 id。', true),
    expectedRevision: { type: 'integer', required: true, description: '最近 list/get/search 返回的 revision，冲突时重新查询。' },
    ...FIELDS,
    title: string('新的标题，可选，不超过 200 字。')
  }, async ({ id, expectedRevision, ...patch }) => store.update({ id, expectedRevision, patch }));
  register('knowledge_add_perspective', '与用户持续讨论某个已有知识点、产生新角度或更优诠释时，追加一条角度/诠释记录（不覆盖原有内容，知识点越聊越丰满）。', {
    id: string('知识点 id。', true),
    text: string('本次讨论新增的角度/诠释，不超过 1000 字。', true),
    source: { type: 'string', enum: ['user', 'ai'], description: '角度来源：user 为用户观点，ai 为你的分析。默认 ai。' },
    expectedRevision: { type: 'integer', required: true, description: '最近 list/get/search 返回的 revision，冲突时重新查询。' }
  }, async args => {
    const { expectedRevision, source = 'ai', ...rest } = args;
    return store.addPerspective({ ...rest, source, expectedRevision });
  });
  register('knowledge_delete', '用户明确要求删除知识点时使用。先确认 id 再删，可一次删多条。', {
    ids: list('要删除的知识点 id 数组。'),
    expectedRevision: { type: 'integer', required: true, description: '最近 list/get/search 返回的 revision，冲突时重新查询。' }
  }, async args => store.remove(args));
  register('knowledge_export', '把整个知识点百科导出为 Markdown 文本，用于备份或上传网盘。', {}, async () => store.exportMarkdown());
  register('knowledge_output', '把单条条目输出为 Markdown 文档（按类型格式化：知识→条目文档，计划→执行方案+打卡清单）。', { id: string('条目 id。', true) }, async args => store.output(args));
}
