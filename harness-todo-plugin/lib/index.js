import { fileURLToPath } from 'node:url';
import { homedir } from 'node:os';
import path from 'node:path';
import { existsSync, promises as fs } from 'node:fs';
import { defineTool } from '@deepseek-ai/dsh-tools';
import { delegationDepthOf } from '@deepseek-ai/dsh-subagent';
import { TypertRemoteService, Remote } from '@deepseek-ai/dsh-typert-protocol';
import { TodoStore } from './store.js';
import { latestHuman, verifyConfirmation } from './confirmation.js';

export const inject = ['tools'];
// 数据文件：本地存储；通过「同步到坚果云」按钮手动同步到坚果云文件夹。
const FILE = fileURLToPath(new URL('../data/todos.json', import.meta.url));
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
const fields = {
  text: string('待办内容，不超过200字。不要把示例当成真实待办。', true),
  prio: { type: 'string', enum: ['high', 'mid', 'low'], description: '优先级，默认 mid。' },
  due: string('截止日期 YYYY-MM-DD；不指定日期为空字符串。仅日期，不是定时提醒。')
};
const output = { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value }] };

class TodoRemote extends TypertRemoteService {
  constructor(ctx, store) {
    super(ctx, 'localTodo');
    this.store = store;
    // Apply the standard decorator through its initializer API (plain JS package).
    Remote('request')(this.request, { kind: 'method', name: 'request', addInitializer: fn => fn.call(this) });
  }
  async request(request) {
    // Shared/read-only peers must not access personal profile tasks.
    if (this.ctx.invocation?.peer.principal?.kind !== 'owner') return { ok: false, error: { code: 'FORBIDDEN', message: 'Todo 仅对当前 Host 所有者开放。' } };
    try {
      if (!request || typeof request !== 'object' || Array.isArray(request)) throw new Error('Invalid request');
      const { op, ...args } = request;
      if (op === 'syncToNutstore') {
        const dir = nutstoreDir();
        if (!dir) throw new Error('未检测到坚果云/iCloud 同步文件夹');
        if (!existsSync(FILE)) throw new Error('本地还没有待办数据');
        const target = path.join(dir, 'DeepSeekHarness', 'todos.json');
        await fs.mkdir(path.dirname(target), { recursive: true });
        await fs.copyFile(FILE, target);
        return { ok: true, value: { synced: true, target, at: new Date().toISOString() } };
      }
      const allowed = ['snapshot', 'add', 'update', 'remove', 'reorder', 'importLegacy'];
      if (!allowed.includes(op)) throw new Error('Unsupported page operation');
      return { ok: true, value: await this.store[op](args) };
    } catch (e) {
      return { ok: false, error: { code: e.code || 'TODO_ERROR', message: e.message } };
    }
  }
}

export async function apply(ctx) {
  const store = new TodoStore({ filePath: FILE });
  await store.snapshot(); // Fail closed on corrupt data; never silently reset.
  new TodoRemote(ctx, store);
  const register = (name, description, parameters, execute) => ctx.tools.register(defineTool({
    name, description, parameters, output,
    async execute(args, exec) {
      exec.signal?.throwIfAborted();
      if (!exec.agent) throw new Error('Todo 聊天工具需要当前会话。');
      if (delegationDepthOf(exec.agent) > 0) throw new Error('请由主会话处理个人待办。');
      return JSON.stringify(await execute(args, exec), null, 2);
    }
  }));
  register('personal_todo_list', '查询用户的个人待办清单（不是 agent 工作计划）。新增事项必须先 propose，回复末尾展示并等待用户确认，再 commit。', {}, async () => store.snapshot());
  register('personal_todo_propose', '提出新增个人待办，暂不写入正式清单。只在用户要求新增时调用。调用后必须在回复末尾展示完整内容、优先级、截止日期和 confirmationText，结束本轮等待用户确认。不能在同一轮自行提交。', fields, async (args, exec) => {
    const human = latestHuman(exec.agent.session.deriveMessages());
    if (!human?.id) throw new Error('需要用户直接发送的新增请求。');
    const result = await store.propose({ ...args, sessionId: exec.agent.session.id, sourceMessageId: human.id });
    return { ...result, status: 'awaiting_confirmation', confirmationText: `确认 ${result.proposal.id.slice(0, 8)}`, instruction: '尚未添加。请在回复末尾列出此提案，用户明确确认后才能提交。' };
  });
  register('personal_todo_pending', '查询当前聊天会话的待确认提案，不会新增待办。', {}, async (_args, exec) => store.proposals({ sessionId: exec.agent.session.id }));
  register('personal_todo_commit', '仅在用户看到提案后明确回复确认时提交该提案。服务器会核验后续真实用户消息与展示过的提案，不能用模型自行声明的布尔值代替确认。不允许修改提案内容；修改需重新 propose 并确认。', { proposalId: string('待确认提案的完整 ID。', true) }, async (args, exec) => {
    const sessionId = exec.agent.session.id;
    const { proposals } = await store.proposals({ sessionId });
    const proposal = proposals.find(p => p.id === args.proposalId);
    if (!proposal) throw new Error('未找到本会话的提案。');
    if (proposal.status !== 'committed') verifyConfirmation({ messages: exec.agent.session.deriveMessages(), proposal, proposals });
    return store.commit({ proposalId: proposal.id, sessionId });
  });
  register('personal_todo_update', '用户明确要求修改或完成已有个人待办时使用。先查询取得准确 id 和 revision；同名不明确时先问用户。新增任务不能用此工具绕过确认。', {
    id: string('准确任务 ID。', true),
    expectedRevision: { type: 'integer', required: true, description: '最近 list 返回的 revision，冲突时重新查询，不盲目覆盖。' },
    text: string('新的任务文字，可选。'),
    prio: fields.prio, due: fields.due,
    occurrenceDate: string('重复任务标记完成时必须传入 list 返回的 occurrenceDate；只作用于该应做日期。'),
    done: { type: 'boolean', description: 'true 标记完成，false 恢复未完成。重复任务仅标记当次，不会终止重复。' }
  }, async ({ id, expectedRevision, occurrenceDate, ...patch }) => store.update({ id, expectedRevision, ...(occurrenceDate ? {occurrenceDate} : {}), patch }));
}
