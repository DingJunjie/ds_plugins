// One-record, user-triggered extraction. Never send the rest of Me to a model.
const SYSTEM = `你只整理一条由用户主动保存的 Me 原始记录，不添加事实，也不做诊断。仅输出一个 JSON 对象：{"summary":"简短整理","category":"饮水|运动|饮食|睡眠|身体|感受|生活|随想|其他","metrics":[{"kind":"water|exercise|weight|sleep|food","value":数字,"unit":"count|ml|min|kg|hour|g"}]}。只有明确是本人已发生的事情才提取指标；假设、疑问、他人经历、计划不给指标。饮水若确实喝过可记录 {kind:"water",value:1,unit:"count"}；仅明确毫升数时另记 ml，不能把一口、一杯、一斤猜成毫升。运动时长仅写明确分钟数；体重仅写明确本人测得的公斤数；睡眠仅写明确小时数。食物重量不能当饮水量。不要输出 Markdown、注释或额外文字。`;
const ALLOWED = new Set(['饮水','运动','饮食','睡眠','身体','感受','生活','随想','其他']);
const DIMENSIONS = {water:['count','ml'],exercise:['min'],weight:['kg'],sleep:['hour'],food:['g']};
export function parseExtraction(raw) {
  if (typeof raw !== 'string' || raw.length > 12000) throw new Error('AI 整理结果过长或无效');
  let value; try { value = JSON.parse(raw.trim().replace(/^```(?:json)?\s*/i,'').replace(/\s*```$/,'')); } catch { throw new Error('AI 整理结果不是有效 JSON'); }
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('AI 整理结果格式错误');
  const summary = typeof value.summary === 'string' ? value.summary.slice(0,4000) : '';
  const category = ALLOWED.has(value.category) ? value.category : '其他';
  if (!Array.isArray(value.metrics) || value.metrics.length > 12) throw new Error('AI 整理指标无效');
  const metrics = value.metrics.map(m => {
    if (!m || typeof m !== 'object' || !DIMENSIONS[m.kind]?.includes(m.unit) || typeof m.value !== 'number' || !Number.isFinite(m.value) || m.value <= 0 || m.value > 10000000 || (m.unit === 'count' && (!Number.isInteger(m.value) || m.value > 10000))) throw new Error('AI 整理指标无效');
    return {kind:m.kind,value:m.value,unit:m.unit};
  });
  // A water-bearing record counts once; ml and count never double-count.
  return {summary,category,metrics};
}
export function chooseModel(agents) {
  if (!agents || typeof agents.list !== 'function') throw new Error('未找到当前聊天模型；原文已保存，稍后可重试整理');
  const routes = agents.list().filter(a => (a.session?.meta?.delegationDepth ?? 0) === 0 && a.model?.current()).map(a=>a.model.current());
  const distinct = [...new Map(routes.map(r=>[`${r.provider}\0${r.model}`,r])).values()];
  if (distinct.length !== 1) throw new Error('无法确定唯一的当前聊天模型；原文已保存，请在单一模型会话中重试');
  return distinct[0];
}
export async function extractRecord(llm, route, content, signal) {
  if (typeof content !== 'string' || !content.trim() || content.length > 20000) throw new Error('原文无效');
  const parts=[]; let finish;
  for await (const chunk of llm.stream({provider:route.provider,model:route.model,system:SYSTEM,messages:[{role:'user',content}],maxTokens:650,signal})) {
    signal?.throwIfAborted?.();
    if (chunk.type === 'text-delta') { parts.push(chunk.text); if (parts.join('').length > 12000) throw new Error('AI 整理超出长度限制'); }
    if (chunk.type === 'finish') finish=chunk.reason;
  }
  if (finish?.kind !== 'stop') throw new Error(finish?.kind === 'error' ? '当前模型调用失败' : 'AI 整理未完整完成');
  return parseExtraction(parts.join(''));
}
