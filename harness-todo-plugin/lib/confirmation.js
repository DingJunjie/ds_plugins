// The model cannot grant confirmation through a boolean tool argument.
// Read only genuine user messages, never tool results, schedules, or injected text.
export function latestHuman(messages) {
  return [...messages].reverse().find(m => m.role === 'user' && m.source?.kind === 'user');
}
export function messageText(message) {
  return (message?.content || []).filter(b => b.type === 'text').map(b => b.text).join('\n').trim();
}
export function verifyConfirmation({ messages, proposal, proposals }) {
  const human = latestHuman(messages);
  if (!human?.id || !proposal.sourceMessageId || human.id === proposal.sourceMessageId) {
    throw new Error('尚未收到提案之后的用户确认。请在回复末尾展示待办详情，等待用户确认后再提交。');
  }
  const text = messageText(human).replace(/[。！!\s]+$/u, '');
  const short = proposal.id.slice(0, 8);
  const explicit = [`确认 ${short}`, `确认添加 ${short}`, `确认 ${proposal.id}`, `确认添加 ${proposal.id}`];
  const plain = ['确认', '确认添加', '确认新增', '确认加入'];
  if (!explicit.includes(text) && !plain.includes(text)) {
    throw new Error(`需要明确确认。请用户回复“确认 ${short}”；修改内容后必须生成新提案。`);
  }
  // Plain confirmation is safe only for the last proposal shown in this Session.
  const last = proposals.at(-1);
  if (plain.includes(text) && last?.id !== proposal.id) throw new Error(`存在其他提案，请用户回复“确认 ${short}”指明事项。`);
  const from = messages.findIndex(m => m.id === proposal.sourceMessageId);
  const until = messages.findIndex(m => m.id === human.id);
  if (from < 0 || until <= from) throw new Error('无法验证提案和确认的聊天顺序；请重新展示提案。');
  const priorityLabel = { high: '高', mid: '中', low: '低' }[proposal.prio || 'mid'];
  const shown = messages.slice(from + 1, until).some(m => {
    const display = messageText(m);
    return m.role === 'assistant' && display.includes(proposal.text) && display.includes(short)
      && display.includes(priorityLabel)
      && (proposal.due ? display.includes(proposal.due) : /无截止日期|未设置|不指定/.test(display));
  });
  if (!shown) throw new Error('用户确认前未找到包含事项和确认编号的助手回复。请先在回复末尾展示提案。');
  return { messageId: human.id };
}
