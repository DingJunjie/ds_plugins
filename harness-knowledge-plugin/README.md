# Harness 知识点 · 0.1.0

正式 Harness 插件：左侧「知识点」百科页面 + 聊天工具 + 右上角「快速记 idea」浮窗，共享本地 JSON 数据。用来把「用第一性原理拆解某件事物」的 idea 沉淀成结构化知识点，并支持在与 AI 的持续讨论中不断追加角度、越聊越丰满。

## 核心能力

- **第一性原理拆解**：每个知识点包含「前提/公理 → 基本事实/要素 → 推导结论」三层结构，还有领域、标签、一句话概述、关联知识点。
- **聊天一键解析并存档**：在聊天里让 AI 用第一性原理解析某个 idea/事物，即可存为一条知识点。
- **持续讨论追加角度**：与 AI 讨论中产生的新角度/诠释，通过 `knowledge_add_perspective` 追加进已有知识点，不覆盖原内容。
- **百科面板**：左侧边栏「知识点」页面，支持搜索、领域筛选、列表浏览、详情查看与编辑、新增角度。
- **快速记 idea 浮窗**：右上角悬浮球，想到什么立刻记标题 + 一句补充，之后再到面板或聊天里展开成完整知识点。
- **导出备份**：面板可导出全部内容为 Markdown 并复制/下载，手动上传夸克网盘等做备份或换机迁移。

## 聊天工具

`knowledge_search` / `knowledge_list` / `knowledge_domains` / `knowledge_get` / `knowledge_save` / `knowledge_update` / `knowledge_add_perspective` / `knowledge_delete` / `knowledge_export`。

## 存储

本地数据位置：`harness-knowledge-plugin/data/knowledge.json`（首次写入后创建，空库不生成示例）。同一个 Host 的页面和聊天共享同一份数据；跨机器云同步需配合网盘同步盘或手动导出。

## 安装与开发

- 构建：`python3 harness-knowledge-plugin/build.py`
- 测试：`node --test harness-knowledge-plugin/test/*.test.js harness-knowledge-plugin/frontend.test.mjs`
- 安装：通过 Plugin Manager 以本地链接安装 `harness-knowledge-plugin` 目录；修改后重新构建、停用/启用插件并刷新原 Harness 页面。

## 验证范围

存储层与前端桥接共 11 项单元测试通过。完整交互（聊天解析存档、悬浮球快速记、面板编辑、导出）需在当前 GUI 实测。
