# Spark AI 数据基座（Phase 0）PRD

| 模块： | 跨会话记忆 / 动机画像 / 情绪信号管道 |
| --- | --- |
| 周期： | 2周（Phase 0A 5天 + Phase 0B 5天） |
| 优先级： | P0 — Phase 1（学伴灵魂）的前置依赖 |

![image.png](https://alidocs.oss-cn-zhangjiakou.aliyuncs.com/res/WgZOZA8L866ZeqLX/img/d2d2a776-4b89-44f8-9b80-07f5ff194d23.png)

# 第一部分：战略背景

## 1.1 愿景与产品的差距

Spark AI 的产品愿景是成为学生的“灵魂伴侣”——理解他们的动机、守护他们的意愿、与他们共同成长。但当前产品本质上仍然是一个教务SaaS系统：课程管理、作业提交、课表排课，以及一个标准的聊天界面。

这不是功能差距，而是数据差距。产品没有任何基础设施来追踪学生的情绪状态、动机变化、或与学伴的关系演进。没有这些数据，学伴就不可能是伴侣——它只是一个回答问题的聊天机器人。

Phase 0 的目标就是补上这个数据差距。它构建三个数据地基，后续所有功能都依赖于它们。

## 1.2 Phase 0 交付物

| **模块** | **做什么** | **为什么重要** |
| --- | --- | --- |
| **跨会话记忆** | 让学伴记住过去的对话、未完成的话题、做过的承诺 | 没有记忆，每次对话都是初次见面。记忆是把工具变成关系的关键。 |
| **动机画像** | 建模每个学生的动机类型、情绪基线、学习节奏、信任关系 | Phase 1 动机引擎和学伴策略的数据基座。 |
| **情绪信号管道** | 从聊天、作业、课程、前端行为、mem0 拒绝内容中采集情绪信号 | 为动机画像提供输入，同时支持情绪危机的实时告警。 |

## 1.3 优先级与依赖关系

_跨会话记忆（第一）→ 动机画像（第二）→ 情绪信号管道（第三）_

跨会话记忆排第一，因为它是唯一一个用户能立即感知到的改变。上线第二天，学伴就能说“上次我们聊到了……”。它还会产生会话摘要，为另外两个模块提供数据输入。

动机画像排第二，因为它定义了情绪信号管道写入的目标 schema。先建表再采集，避免返工。

情绪信号管道排第三，因为它是生产者，另外两个是消费者。它的集成点最多，放在最后可以借鉴前两个模块的经验。

## 1.4 执行计划：Phase 0A + 0B

两周分为两个可交付里程碑。Phase 0A（第1-5天）交付用户可感知的核心功能：跨会话记忆 + 聊天侧情绪信号。Phase 0B（第6-10天）补齐全部数据基础设施。第5天结束时即可 demo。

**Phase 0A — 跨会话记忆 + 聊天信号（第1-5天）**

| **天** | **重点** | **后端** | **前端** |
| --- | --- | --- | --- |
| 1 | 前置 + 数据层 | 引入 golang-migrate；创建 SessionMemory 表 + migration；WorkingMemory Redis schema + 基础 CRUD | 无改动 |
| 2–3 | 记忆服务 | SessionSummarizer（AI 摘要 + 异步触发）、ContextAssembler（三层检索 + 800 token 预算）、WorkingMemory 每轮更新逻辑 | 无改动 |
| 4 | 集成 + 聊天信号 | 接入 chatBusiness.go（开始→组装记忆，结束→生成摘要）。ChatEmotionAnalyzer（关键词 + AI 打分）、Mem0SignalBridge、SignalCollector + AlertTrigger 基础版 | 无改动 |
| 5 | 端到端测试 | 走通全链路：聊天 → 摘要生成 → 下次聊天检索注入 → 学伴引用记忆。修复集成问题。缓冲日。 | 无改动 |

**Phase 0A 交付物：**学伴能记住过去的对话，主动提起未完成话题和承诺，并能从聊天中检测情绪信号。第5天可 demo。

**Phase 0B — 动机画像 + 完整信号管道（第6-10天）**

| **天** | **重点** | **后端** | **前端** |
| --- | --- | --- | --- |
| 6–7 | 画像数据层 | 全部8张 motivation-profile 表 + migration + repo。ProfileComputer 骨架（小时级任务）、MemoryConsolidator（日级任务）注册到 xxl-job | 无改动 |
| 8–9 | 前端信号 | AssignmentAnalyzer、课程参与度 handler、微行为信号 handler | AssignmentEmotionTracker、LessonEngagementTracker、MicroBehaviorTracker |
| 10 | 联调 + 验收 | 全5个信号源联通 SignalCollector。ProfileComputer 读取真实数据并计算 flow\_state。记忆衰减和整合任务运行。全管道验证 | 验证所有 tracker 正常上报 |

**Phase 0B 交付物：**完整数据地基就位——所有信号源活跃，动机画像每小时计算，记忆整合每日运行。Phase 1 学伴策略开发可以启动。

# 第二部分：架构

## 2.1 三层记忆架构

记忆系统借鉴人类认知心理学模型：工作记忆（此刻发生了什么）、情景记忆（之前发生了什么）、语义记忆（这个人是谁）。每层有不同的存储、生命周期和检索特征。

| **层** | **存储** | **生命周期** | **存储内容** | **类比** |
| --- | --- | --- | --- | --- |
| **工作记忆** | Redis | 4小时 | 当前对话状态、活跃话题、情绪基调 | 你辨导时面前的黑板 |
| **情景记忆** | PostgreSQL | 90天（衰减） | 会话摘要、情绪弧线、未完成话题、承诺 | 过去几个月的日记 |
| **语义记忆** | mem0（已有） | 永久 | 稳定偏好、目标、身份信息、性格特征 | 你对一个好朋友的了解，但不记得是哪天知道的 |

数据随时间向下流动：工作记忆在会话结束时压缩为情景记忆；反复出现的情景记忆在日级整合时升级为语义记忆（mem0）。**这模拟了**人类通过重复和情感显著性形成长期记忆的过程。

_关键原则：这三层不能合并到 mem0 中。详见第 2.2 节。_

## 2.2 为什么不能用 mem0 替代另外两层

团队现有的 mem0 系统专为语义记忆设计，其提示词包含严格的拒绝协议，过滤临时情绪、社交客套和敏感信息。但正是这种严谨性使其不适合工作记忆和情景记忆：

*   **生命周期冲突：**mem0 存储永久事实，没有 TTL 概念。工作记忆需要 4 小时自动过期，情景记忆需要 90 天衰减淘汰。
    
*   **写入频率冲突：**mem0 每次对话提取 0–3 条记忆。工作记忆每轮都要更新（一次对话可能 20+ 次写入）。走 mem0 的 AI 提取管道成本和延迟都不合理。
    
*   **检索逻辑冲突：**mem0 按语义相似度检索。情景记忆需要综合时间衰减、重要性、未完成话题加权、承诺检查等多维度排序。
    
*   **数据结构冲突：**mem0 存储扁平字符串。情景记忆是结构化复合对象（摘要、情绪弧线、未完成话题、承诺等多个关联字段）。拆成多条 mem0 记忆会丢失关联性。
    
    正确的架构是：mem0 保持不变（专事语义记忆），Redis 和 PostgreSQL 处理新的两层。日级整合任务将高频情景模式升级到 mem0，形成清晰的向上数据流。
    
    ## 2.3 情绪信号管道架构
    
    情绪信号管道从五个源采集信号，经中心收集器归一化后写入两个目标：PostgreSQL（小时级聚合，驱动动机画像计算）和 Redis（实时阈值检测，驱动紧急学伴干预）。
    
    | **信号源** | **触发时机** | **采集内容** | **信号类型示例** |
    | --- | --- | --- | --- |
    | **聊天情绪** | 每轮对话后 | 关键词匹配 + AI 情绪打分 | chat\_keyword, chat\_sentiment\_frustration |
    | **作业行为** | 任务提交时 | 完成速度与个人基线对比、中断次数、提示请求 | assignment\_rushing, assignment\_struggling |
    | **课程参与度** | 离开页面/定时 | 滚动深度、活跃时间、交互次数、空闲比例 | lesson\_deep\_engagement, lesson\_low\_engagement |
    | **mem0 桥接** | mem0 提取后 | 接受的记忆作为显式自报告；被拒的情绪内容作为旁路信号 | explicit\_self\_report, rejected\_emotion\_expression |
    | **前端微行为** | 模式检测时 | 快速连点（沮丧）、反复后退导航、愤怒退出模式 | rapid\_clicking, navigation\_hesitation |
    
    ## 2.4 动机画像数据架构
    
    动机画像分三层组织。原始信号高频写入；计算画像每小时聚合；身份层特征每日综合。
    
    | **层** | **表** | **更新频率** | **用途** |
    | --- | --- | --- | --- |
    | **原始信号** | emotion\_signal, learning\_behavior, chat\_interaction | 实时（每个事件） | 只记录不判断，原子事件 |
    | **计算画像** | motivation\_state,hu emotion\_baseline, learning\_rhythm | 每小时（xxl-job） | 将信号聚合为可操作的快照 |
    | **身份层** | motivation\_profile, trust\_bond | 每天（xxl-job） | 长期特征：主导动机、抗挫力、自我效能感 |
    
    # 第三部分：模块详细设计
    
    ## 3.1 模块一：跨会话记忆
    
    ### 3.1.1 WorkingMemory（Redis）
    
    每个用户一个 JSON 对象，存在 Redis 中，每轮对话更新，4小时后自动过期。
    
    | **字段** | **类型** | **说明** |
    | --- | --- | --- |
    | user\_id | int64 | 学生 ID |
    | buddy\_id | int64 | 学伴 ID |
    | session\_id | string | 当前会话 UUID |
    | active\_topics | \[\]string | 当前正在讨论的话题，从关键词提取 |
    | emotional\_tone | string | 本次会话的整体情绪基调：positive / negative / neutral / mixed |
    | unfinished\_thread | JSON | {topic, progress, user\_question} — 被中断或未完全解决的话题 |
    | turn\_count | int | 本次会话的对话轮数 |
    | last\_user\_message | string | 学生最近一条消息（快速上下文） |
    | started\_at | timestamp | 会话开始时间 |
    
    **Redis key：**wm:{user\_id}，TTL: 4小时
    
    ### 3.1.2 SessionMemory（PostgreSQL）
    
    每次完成的会话生成一行。由 SessionSummarizer 服务在会话结束时生成。
    
    | **字段** | **类型** | **说明** |
    | --- | --- | --- |
    | id | int64 PK | 自增主键 |
    | user\_id | int64 INDEX | 学生 ID |
    | buddy\_id | int64 | 学伴 ID |
    | session\_id | string | 会话 UUID，关联聊天历史 |
    | summary | text | AI 生成的叙事性摘要（100–200字，第三人称） |
    | key\_topics | JSON 数组 | 主要话题，如 \["二次函数", "考试焦虑"\] |
    | emotional\_arc | string | 情绪轨迹，如 "焦虑 → 安心 → 有动力" |
    | user\_disclosures | text | 学生主动分享的个人信息（生活、感受、经历） |
    | unfinished\_thread | JSON | {topic, progress, user\_question} — 会话结束时未解决的话题 |
    | promises\_made | JSON 数组 | 学伴做出的承诺，如 \["明天一起复习"\] |
    | shared\_jokes | JSON 数组 | 共同幽默或共鸣的瞬间（构建关系质感） |
    | importance | float64 | 0.0–1.0，这次对话对关系的重要性 |
    | access\_count | int | 被检索（回忆）了多少次 |
    | decay\_score | float64 | 当前相关性分数（每次检索时重新计算） |
    | created\_at | timestamp | 会话结束时间（摘要生成时间） |
    
    ### 3.1.3 核心服务
    
    **SessionSummarizer：**会话结束时异步触发（5分钟无操作~~或主动退出~~）。取最近20轮对话调用 AI 生成结构化摘要。不足 3 轮的对话跳过。
    
    **ContextAssembler：**新会话开始时同步触发。从三层检索记忆，格式化为 system prompt 附加内容，强制 800 token 预算上限。分配：语义记忆(mem0) ≤200 token、情景记忆(top 3-5) ≤400 token、动机状态 ≤100 token、信任关系 ≤100 token。
    
    **MemoryConsolidator：**日级 xxl-job 任务。三个职责：(1) 归档 90 天以上且 importance < 0.3 的记忆；(2) 合并同一话题 3 天内的多条记忆防止重复；(3) 将高频出现的情景模式通过 mem0 API 升级为语义记忆。
    
    ### 3.1.4 相关性评分算法
    
    ContextAssembler 检索情景记忆时，按复合相关性分数排序，而非简单按时间。公式：
    
    score = (时间衰减 × 0.30) + (重要性 × 0.30) + (未完成话题加权 × 0.25) + (承诺加权 × 0.30) + (访问频率加成 × 0.15)
    
*   **时间衰减：**指数衰减，半衰期 7 天：exp(-0.099 × 天数)。1天前 = 0.91，7天前 = 0.50，30天前 = 0.05。
    
*   **重要性：**SessionSummarizer 评分的原始 importance（0.0–1.0）。
    
*   **未完成话题加权：**如果 unfinished\_thread 非空，+0.25。确保被中断的话题能优先被想起。
    
*   **承诺加权：**如果 promises\_made 非空，+0.30。忘记承诺会严重损害信任，这是最高的单项加权。
    
*   **访问频率加成：**min(access\_count × 0.05, 0.15)。越常被想起的记忆衰减越慢。
    
    最终分数封顶 1.0。取 top 5 注入 system prompt。
    
    ### 3.1.5 集成点
    
    以下改动均为旁路添加，不修改现有逻辑：
    
*   **spark-app/controller/chat\_controller.go：**会话开始时调用 ContextAssembler.Assemble()，结果追加到 system prompt。失败时降级为无记忆模式。
    
*   **spark-app/controller/chat\_controller.go：**会话结束时异步调用 SessionSummarizer.Summarize()。
    
*   **spark-xxl-job：**注册日级 MemoryConsolidator.DailyConsolidate() 任务。
    
*   **spark-model：**新建 motivation/session\_memory.go。
    
*   **spark-dao：**新建 session\_memory\_repo.go，GORM 持久化，按 created\_at 按月分区。
    
    ## 3.2 模块二：动机画像
    
    ### 3.2.1 原始信号层
    
    _警告：不能复用现有的 learning\_events 表。该表使用 SaveOrUpdate（按学生+素材 upsert），是“最新状态表”。情绪信号需要append-only的时间序列存储——下午3点的沮丧信号和3点半的恢复信号必须共存，不能覆盖。必须新建表。_
    
    **emotion\_signal：**记录所有可能暗示情绪状态的事件。字段：id, user\_id, session\_id, signal\_type(字符串枚举), signal\_value(float64, -1.0到1.0), source(chat/assignment/lesson/buddy/mem0), context(JSON快照), created\_at。按月分区。
    
    **learning\_behavior：**记录任务完成的过程，而非结果。字段：id, user\_id, task\_id, task\_type, started\_at, completed\_at(可空), duration\_seconds, attempt\_count, error\_count, hint\_requested, completion\_rate, difficulty\_level。
    
    **chat\_interaction：**每次会话的对话质量指标。字段：id, user\_id, buddy\_id, session\_id, message\_count, avg\_response\_length(学生的), initiated\_by\_user(bool), topic\_depth(1-5), emotional\_valence(float64), session\_duration, created\_at。
    
    ### 3.2.2 计算画像层
    
    **motivation\_state：**每小时快照。字段：id, user\_id, flow\_state(枚举: bored/frustrated/flow/disengaged), motivation\_level(0-1.0), energy\_level(0-1.0), trend(rising/falling/stable), trend\_duration\_hours, computed\_at, signal\_sources(JSON)。
    
    心流状态分类规则（初始版，规则引擎）：
    
*   **flow：**完成率高 + 速度在个人均值 0.7–1.3 倍 + 错误率低
    
*   **bored：**完成率高 + 速度 < 个人均值 0.3 倍 + 几乎零错误
    
*   **frustrated：**完成率低 + 重试多 + 频繁请求提示
    
*   **disengaged：**超过 48 小时无任何学习活动
    
    **emotion\_baseline：**滚动情绪基线。字段：id, user\_id, baseline\_valence(-1到1), volatility(波动幅度), current\_deviation(当前偏离基线的程度), peak\_hours(JSON), low\_hours(JSON), computed\_at。核心洞察：一个平时活泼的学生突然沉默是告警，一个平时安静的学生同样沉默是正常。current\_deviation 才是真正的告警指标。
    
    **learning\_rhythm：**个人学习节奏。字段：id, user\_id, preferred\_duration\_minutes, preferred\_difficulty(float64), best\_performance\_time(string), attention\_span\_minutes, recovery\_pattern(quick\_bounce/slow\_build/needs\_break), computed\_at。recovery\_pattern 直接影响学伴策略：quick\_bounce 简短鼓励；slow\_build 转换话题；needs\_break 建议休息。
    
    ### 3.2.3 身份层
    
    **motivation\_profile：**长期画像，每日更新。字段：id, user\_id, dominant\_motivation(mastery/social/achievement/curiosity/approval), motivation\_stability(0-1.0), self\_efficacy(0-1.0), growth\_mindset(0-1.0), resilience\_score(0-1.0), engagement\_history(JSON: 30天曲线), personality\_traits(JSON), updated\_at。
    
    dominant\_motivation 决定学伴策略的根本方向：
    
*   **mastery：**强调理解深度。“你离真正掌握这个概念越来越近了。”
    
*   **social：**强调同伴认可。“你同学们会很欣赏你在这个话题上的见解。”
    
*   **achievement：**强调进度指标。“这周已经掌握了 3 个话题。”
    
*   **curiosity：**引入跨学科联系。“这个跟物理里的一个有趣现象有关……”
    
*   **approval：**提供具体肯定。“你解决这道题的思路真的很精彩。”
    
    **trust\_bond：**学生与学伴的关系质量。字段：id, user\_id, buddy\_id, trust\_level(0-1.0), intimacy\_depth(1-5), shared\_memories(计数), conflict\_count, repair\_success, bond\_age\_days, last\_interaction, updated\_at。信任等级决定学伴能做什么：低信任 = 只能闲聊和轻度鼓励；高信任 = 深度动机引导和适度挑战。
    
    ## 3.3 模块三：情绪信号管道
    
    _Phase 0A 范围：第一周只实现聊天侧信号（3.3.1 和 3.3.4）。作业行为(3.3.2)、课程参与度(3.3.3)、前端微行为(3.3.5) 均为 Phase 0B 交付物，因为它们需要前端工程。_
    
    ### 3.3.1 信号源：聊天情绪
    
    两阶段分析，均异步执行，不阻塞聊天主流程：
    
*   **第一阶段——关键词扫描（零延迟）：**约20个中文情绪关键词映射到情感分数。每条学生消息都触发。例：“不想学”→ -0.6，“原来如此”→ 0.5。产生 signal\_type = chat\_keyword。
    
*   **第二阶段——AI 打分（需要 AI 调用）：**仅对超过10字的消息触发。提示词要求返回 {valence, category, confidence} JSON。confidence < 0.4 的结果丢弃。成本：每次约250 input token。每用户每天上限 50 次。
    
    ### 3.3.2 信号源：作业行为（Phase 0B）
    
    前端 AssignmentEmotionTracker 采集：开始时间、提交时间、中断次数（visibilitychange API）、中断总时长、提示请求、答案修改、快速点击检测。后端分析器将所有指标与学生个人滚动均值对比（不用全局阈值）。关键信号：assignment\_rushing（速度 < 0.3倍均值）、assignment\_struggling（速度 > 2.5倍 + 多提示）、assignment\_smooth\_completion。
    
    ### 3.3.3 信号源：课程参与度（Phase 0B）
    
    前端 LessonEngagementTracker 采集：滚动深度(0–1.0)、活跃时间（排除超过30秒的空闲）、交互次数、空闲比例。后端解读：高滚动 + 长活跃 = 深度投入；低滚动 + 短时间 = 无兴趣；反复回滚同一区域 = 卡在某个概念。
    
    ### 3.3.4 信号源：mem0 桥接
    
    从现有 mem0 管道的两条路径：
    
*   **路径一（接受的记忆）：**当 isStable=true 时，每条提取的记忆同时写入 emotion\_signal，signal\_type=explicit\_self\_report。目标类 +0.3，挫折类 -0.3，中性偏好 0。
    
*   **路径二（被拒的情绪）：**当 isStable=false 且 reason 包含情绪关键词时，写入 emotion\_signal，signal\_type=rejected\_emotion\_expression。这可以捕获 mem0 正确拒绝存入语义记忆但对情绪追踪有价值的信号。
    
    实现：Mem0SignalBridge 服务在每次 mem0 提取调用后运行。同时 mem0 提示词升级加入 emotionHint 输出字段（{detected, valence, category}）。
    
    ### 3.3.5 信号源：前端微行为（Phase 0B）
    
    MicroBehaviorTracker 检测挨了学生没明确表达但行为暗示的沮丧信号：快速连点（2秒刅5次以上）、反复后退导航（3次以上）、愤怒退出模式。所有信号每种类型每5分钟最多报一次，避免刷屏。通过现有 learning-event 接口上报。
    
    ### 3.3.6 SignalCollector 服务
    
    所有五个源的中央汇聚点。职责：(1) 去重：同一用户+同一 signal\_type 在5分钟内丢弃（Redis SETNX）；(2) 持久化到 PostgreSQL emotion\_signal 表；(3) 缓冲到 Redis 实时路径（key: emotion\_buffer:{user\_id}, TTL: 2小时）；(4) 通过 AlertTrigger 检查实时告警阈值。
    
    ### 3.3.7 实时告警触发器
    
    两条告警规则，每条信号到达时检查：
    
*   **规则一——急性危机：**单条信号 value ≤ -0.7 立即触发主动关怀，策略=empathy\_first（不提学习，纯情绪支持）。
    
*   **规则二——累积恶化：**1小时内 3 条以上 value < -0.3 的信号触发主动关怀，策略=gentle\_check\_in（自然地问问怎么了）。
    

告警路由到 BuddyNotifier，推送学伴主动发起的消息。这就是学伴在学生还没说什么时就“注意到”他们正在挣扎的机制。

# 第四部分：执行

## 4.1 mem0 提示词升级

对现有 mem0 提取提示词做三处修改：

1.  白名单新增E 类：“关系与信任标记——对学伴的明确信任表达、对互动方式的正/负反馈、关系里程碑”。新增格式：“关系:...”和“互动:...”。
    
2.  新增记忆更新机制：当新记忆与已有记忆属于同一维度但内容已变更时，加前缀“更新|”（如“更新|目标:期末数学达到90分”）。消费端收到此前缀时替换旧记忆而非新增。
    
3.  新增emotionHint 输出字段：{detected: boolean, valence: float, category: string}。每次调用都填充，包括 isStable=false 时。可选 category：neutral, frustration, boredom, anxiety, joy, curiosity, fatigue。
    

所有现有拒绝协议（A到F）保持不变。emotionHint 与记忆提取决策独立——它是观察到什么的元数据，不是要存储的记忆。

## 4.2 前置条件

第1天开始前必须就位：

*   **数据库迁移工具：**在 spark-dao 模块引入 golang-migrate（或 goose）。Phase 0 所有新表必须通过版本化迁移文件创建，不允许用 GORM AutoMigrate。Phase 0 新增 9 张表含分区和索引，生产环境必须有迁移管理。半天工作量。
    
*   **Claude Code 上手：**Phase 0 的每个工程师必须在第1天前完成至少一次完整的服务生成练习。工作流是：贴入对应规格章节作为 context → 让 Claude Code 生成完整服务文件 → review 和调整 → 提交。跳过这步的工程师会在第2天落后。
    
    ## 4.3 风险登记
    
    | **风险** | **严重度** | **缓解措施** | **降级方案** |
    | --- | --- | --- | --- |
    | 摘要 AI 调用失败 | 中 | 指数退避重试一次 | 跳过摘要；下次会话无该段情景记忆 |
    | 记忆上下文超出 token 限制 | 低 | ContextAssembler 强制 800 token 上限截断 | 优先截断最旧的情景记忆；语义记忆永远能放下 |
    | 情绪关键词误判 | 中 | 关键词列表人工筛选；AI 打分要求 confidence > 0.4 | 最坏情况：学伴多问一句“你还好吗”——略尬尬但无害 |
    | AI 情绪分析成本超支 | 低 | 每用户每天上限50次；短消息跳过 AI | 降级为仅关键词检测（零成本） |
    | emotion\_signal 表过大 | 低 | 按月分区；超过6个月的原始信号归档 | 聚合后的画像保留；只有原始信号被归档 |
    | 学伴引用了不准确的记忆 | 低 | 学伴使用试探性语言：“如果我没记错的话……” | 学生自然纠正；纠正本身成为新的信号 |
    
    ## 4.4 验收标准
    
    **Phase 0A（第5天结束）：**
    
*   学伴在测试对话中能正确引用上次会话的话题
    
*   上次会话的未完成话题被主动提起
    
*   学伴做出的承诺在下次相关会话中被呈现
    
*   记忆上下文注入为会话启动增加 < 200ms 延迟
    
*   聊天情绪信号（关键词 + AI + mem0 桥接）正在写入 emotion\_signal 表
    
*   实时告警在模拟危机场景下正确触发
    
    **Phase 0B（第10天结束）：**
    
*   全部8张 motivation-profile 表已创建，索引和约束正确
    
*   ProfileComputer 小时级任务连续运行 48 小时无错误
    
*   flow\_state 分类与人工评估匹配率 > 70%
    
*   全部5个信号源的数据都在 emotion\_signal 表中出现
    
*   mem0 桥接正在产生 explicit\_self\_report 和 rejected\_emotion\_expression 信号
    
*   每用户每天 AI 调用次数控制在 50 次预算内
    
    ## 4.5 定量指标与测量方法
    
    本文档中所有定量目标分三类。团队必须明确哪些是硬约束、哪些是待验证目标、哪些是初始假设。
    
    | **指标** | **类别** | **测量方法** | **校准计划** |
    | --- | --- | --- | --- |
    | 800 token 记忆预算 | 硬约束 | 模型窗口(4-8k)减去 system prompt 和对话历史。在 ContextAssembler 中记录 | 模型变更时调整；与窗口大小等比缩放 |
    | 每用户每天 AI 情绪分析上限50次 | 硬约束 | Redis 计数器，每次 AI 打分前检查。通过日报监控 | 成本超 15% 时收紧；预算充足时放宽 |
    | 会话摘要覆盖率 > 95% | 自动化指标 | 每日：count(session\_memory) / count(chat\_session where turn\_count>=3) | 低于 95% 时排查 AI 调用失败和异步任务可靠性 |
    | 情绪信号延迟 < 5秒 | 自动化指标 | 信号源事件时间戳与SignalCollector 入口时间戳的差值。每天抽样100条 | 超过 5秒检查 AI 网络延迟；降级为仅关键词 |
    | 记忆检索准确率 > 80% | 人工抽样 | 第一周每奥10条，之后每吧50条。人工判断注入的记忆是否与当前对话相关 | 根据误判/漏判模式调整相关性评分权重 |
    | flow\_state 准确率 > 70% | 人工抽样 | 抽样 100 个小时快照，与老师/运营人员的人工评估对比 | 调整分类阈值；必要时增加更多信号维度 |
    | AI 成本增量 < 15% | 月度审查 | 比较 AI API 月度账单。Phase 0 每用户每天新增约16次轻量调用，vs 现有约20次 completion | 接近 15% 时降低 AI 打分频率（每3轮一次） |
    | 4h TTL / 90天保留 / 7天半衰期 | 初始假设 | 监控：返回用户的工作记忆命中率；情景记忆检索有用性；衰减曲线 vs 实际相关性 | 2周真实用户数据后调整。TTL 可能需要6-8h；半衰期可能需要10-14天 |
    
    ## 4.6 代码库对齐说明（基于代码审查）
    
    以下观察基于对当前代码库的审查，所有工程师在开始实施前必须阅读：
    
*   **mem0 已集成。**聊天前的语义记忆检索和聊天后的异步提取在 MemoryServiceImpl.go 和 buddyChatTemplateImpl.go 中。Phase 0 不改变此流程——它在旁边新增两层。
    
*   **Session ID 已存在。**前端 chat store 和后端 chatReq.go 都携带 sessionId。直接用作 SessionMemory 和 WorkingMemory 的外键，不需要新的 ID 方案。
    
*   **learning\_events 使用 SaveOrUpdate（upsert）。**该表追踪每个学生-素材对的最新状态。不能用于情绪信号，必须新建 append-only 表（见 3.2.1 节）。
    
*   **巡检和停滞检测已存在但面向老师。**learningPatrolBusiness.go 和 stallDetectionBusiness.go 检测学习异常并呈现给老师。Phase 0 新增并行的学生端路径：同样的异常信号可以触发学伴主动关怀。可考虑复用检测逻辑。
    
*   **Redis 和 PostgreSQL 已在使用。**不需要新的基础设施部署。WorkingMemory 用 Redis；所有新表用现有 PostgreSQL 实例。
    
*   **xxl-job 已运行。**ProfileComputer（小时级）和 MemoryConsolidator（日级）作为新任务注册到现有 spark-xxl-job 模块。
    
*   **前端埋点较稀疏。**PostHog 已集成但只追踪少量事件。Phase 0B 的前端 tracker（作业、课程、微行为）是全新代码。从现有 usePostHog.ts 模式出发，但写专用的 tracker 服务。