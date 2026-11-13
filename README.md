# 我的 DSH 插件

三个独立插件的代码仓库。插件代码可用 Git/GitHub 管理，个人数据通过坚果云备份与恢复，不混入代码仓库。

| 目录 | 包名 | 当前版本 | 作用 |
|---|---|---|---|
| `harness-knowledge-plugin/` | `harness-knowledge-local` | 0.1.1 | 条目：讨论、整理、Markdown 输出 |
| `harness-me-plugin/` | `harness-me-local` | 0.6.1 | Me：个人背景、日常、形体、复盘 |
| `harness-todo-plugin/` | `harness-todo-local` | 1.1.1 | 个人待办与重复任务 |

当前包声明兼容 **DSH 0.2.2-rc.2**；新机器安装前检查实际版本，不绕过不兼容检查。

## 重要：当前运行目录未迁移

本仓库于 2026-11-13 从工作区复制代码、构建源文件和测试。排除了 `data/`、`node_modules/` 和私人备份。当前公司电脑已安装的插件仍链接到：

`/Users/nereus/Documents/deepseek-harness/default-workspace/`

本次没有重新安装/改链接，因此修改本仓库不会自动改变当前 GUI。不要删除原工作区插件目录。后续切换运行路径应先备份，再通过插件管理器卸载/安装，并验证数据；尤其条目和 Todo 数据目前位于旧插件目录内。

## 构建结构

保留现有相对目录，避免迁移破坏构建：

```text
harness-knowledge-plugin/   # 构建读取 ../knowledge/index.html
knowledge/index.html
harness-todo-plugin/        # 构建读取 ../todo/index.html
todo/index.html
harness-me-plugin/          # 自包含 page.html + build.mjs
```

本仓库已包含生成后的 `lib/client.js`。构建源文件也一并保留。不要只复制插件子目录后期待 Python 构建仍能找到页面源文件。

```sh
python3 harness-knowledge-plugin/build.py
python3 harness-todo-plugin/build.py
node harness-me-plugin/build.mjs
```

测试：

```sh
node --test harness-knowledge-plugin/test/*.test.js harness-knowledge-plugin/frontend.test.mjs
node --test harness-todo-plugin/test/*.test.js harness-todo-plugin/frontend.test.mjs
node --test harness-me-plugin/test/*.test.mjs
```

某些测试/运行需要插件依赖。每个插件目录内按实际 DSH 环境准备兼容依赖，安装时默认禁用依赖脚本；不复制旧机器的 node_modules。使用本地链接安装时还需确保插件自身能解析 peerDependencies，不能仅凭安装命令成功认定可运行。

## 本次整理验证

- 三个插件均在本仓库重新构建成功。
- 条目与 Todo 共36项测试通过。
- Me 共43项测试通过；另3个测试文件因本仓库尚未安装 `@deepseek-ai/dsh-tools` 等 peer 依赖而无法加载，尚不能宣称完整测试通过。准备兼容依赖后应重跑全部 Me 测试。
- 未从此目录重新安装或做 GUI 验收；当前运行仍使用旧工作区路径。
- 检查未复制个人 data/ 和 node_modules/，Git ignore 覆盖其路径。

新机安装与坚果云流程详见 [同步与换机.md](同步与换机.md)。每个插件原 README 保留历史开发说明；版本与实时行为以当前 package.json 和代码为准。

本次不创建远程仓库、不提交、不推送；已有 `.git` 保持原样。提交前检查 staged diff，确认没有私人 JSON、密钥或导出文档。
