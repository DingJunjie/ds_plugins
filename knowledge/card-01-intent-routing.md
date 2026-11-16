# 卡1｜意图识别与工具路由

> 目标：能用自己的话讲清“用户输入 → 意图与参数 → 工具调用 → 据实回答”。状态：已完成两轮讨论；待运行演示巩固。

## 1. 核心理解

意图识别是判断用户想完成什么；参数提取是确定操作对象与条件；路由是选择处理路径或工具。三者可以在同一次 LLM 推理中完成，不必各调用一次模型，也不一定需要显式任务编排。意图识别也可以用规则、分类模型或混合方案实现。

**模型提调用，程序控执行，MCP 传消息，工具查数据，模型据实回答。**

## 2. 链路与职责

```text
用户输入 + 上下文 + 可用工具定义
    ↓
LLM：理解意图、提取参数、提出工具调用（也可能先澄清）
    ↓
Host 宿主程序：检查工具白名单、参数、权限、执行策略
    ↓
MCP Client ── tools/call / JSON-RPC 2.0 ──→ MCP Server
                                                   ↓
                                          工具实现 → 业务 API / 数据库
    ↑                                              ↓
MCP Client ←────────── 工具结果 ─────────── MCP Server
    ↓
Host：将结果整理为模型 API 支持的工具结果消息
    ↓
LLM：依据结果回答；不补造进度、完成比例或上线时间
```

- **LLM 工具调用 ≠ MCP 请求**：模型输出工具名与结构化参数；Client 负责构造和发送 MCP 协议消息。
- Host 是运行模型、协调工具与执行策略的应用。Client 是其连接 MCP Server 的客户端组件，并非一定是独立进程。
- 工具由 Server 暴露，其内部可以调用普通 HTTP API 或数据库，不必继续使用 MCP。
- MCP 是可选接入方式；工具也可以是本地函数。MCP 本身不会替你完成业务授权和所有安全检查。
- 固定的校验、通信、回填流程是工作流；模型根据上下文选择工具、追问或下一步，是动态决策。是否称为 Agent，不取决于是否用了 MCP。

## 3. 案例：查学生端登录功能进度

**以下均为教学示例，不代表真实项目状态。** 前提：上下文已确定“学生端”，工具 `get_task_progress(project, feature)` 已向模型提供。

用户：“帮我看看登录功能现在做到哪了。”

模型提出调用（内容示意，不是完整模型 API 报文）：

```json
{"name":"get_task_progress","arguments":{"project":"学生端","feature":"登录"}}
```

Host 校验后，Client 发送 MCP 调用。Server 查询任务系统，得到示例记录：状态“进行中”、已完成“登录表单、接口联调”、剩余“异常场景测试”、无已记录阻塞、更新时间“2026-11-16 10:00 +08:00”。结果回填模型后，可回答：

> 按任务系统 11 月 16 日 10:00 的记录，学生端登录功能进行中；登录表单与接口联调已完成，剩余异常场景测试，暂未记录阻塞。这是任务记录状态，不代表已经验收或上线。

**不能补出“完成 90%”或“今天上线”。** 若上下文没明确项目，先询问教师端、学生端还是 track 端，不凭空选择。

## 4. 边界与失败回退

| 情况 | 处理 |
| --- | --- |
| 缺少项目等必要信息 | 先澄清，不猜参数 |
| 非白名单工具、参数不合法 | 阻止执行，纠正参数或请求澄清 |
| 无权限 | 明确告知，不绕过、不盲目重试 |
| 未查到任务 | 说明未查到，不等于任务没开始 |
| 临时网络故障 | 有限重试；本例是只读查询，写操作还须考虑幂等性 |
| 持续失败 | 告知无法确认，提供人工查询路径，不让 LLM 猜进度 |

工具结果是外部数据，不是新的系统指令；可能包含敏感内容或恶意文本，Host 应限制暴露范围。生产环境还应设置超时、调用次数限制、日志脱敏等。

## 5. 三分钟复述与自测

**复述顺序：** ① 区分意图、参数、路由；② 用学生端案例走一遍链路；③ 解释模型调用和 MCP 请求的区别；④ 说清信息不足、权限失败、网络失败时怎么办。

**自测：** 谁真正发送 MCP 请求？为什么不能把“未查到”解释成“未开始”？没有 MCP 能否调用工具？

## 6. 配套 Python 演示

同目录 `card-01-intent-routing-demo.py`，Python 3.10+，无第三方依赖、无网络、无密钥、无文件写入。运行：

```bash
python3 knowledge/card-01-intent-routing-demo.py
python3 knowledge/card-01-intent-routing-demo.py --scenario clarify
python3 knowledge/card-01-intent-routing-demo.py --scenario temporary
python3 knowledge/card-01-intent-routing-demo.py --scenario unavailable
python3 knowledge/card-01-intent-routing-demo.py --scenario denied
python3 knowledge/card-01-intent-routing-demo.py --scenario missing
python3 knowledge/card-01-intent-routing-demo.py --self-test
```

**真实与模拟的边界：** 模型判断与回答使用规则模拟；业务记录为虚构数据；Client/Server 在同一进程，通过 JSON 序列化演示 `tools/call` 请求和响应，没有真实网络传输。仅演示 MCP 调用阶段的消息形状，未实现初始化、能力协商、工具发现和完整生命周期，因此不是可连接实际 MCP 客户端的 Server。
