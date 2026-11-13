# 我的 DSH 插件

三个独立插件的代码仓库。插件代码可用 Git/GitHub 管理，个人数据通过坚果云备份与恢复，不混入代码仓库。

| 目录 | 包名 | 当前版本 | 作用 |
|---|---|---|---|
| `harness-knowledge-plugin/` | `harness-knowledge-local` | 0.1.1 | 条目：讨论、整理、Markdown 输出 |
| `harness-me-plugin/` | `harness-me-local` | 0.6.1 | Me：个人背景、日常、形体、复盘 |
| `harness-todo-plugin/` | `harness-todo-local` | 1.1.1 | 个人待办与重复任务 |

当前包声明兼容 **DSH 0.2.2-rc.2**；新机器安装前检查实际版本，不绕过不兼容检查。

## 当前运行目录：已切换到本仓库

2026-11-13 已通过 Plugin Manager 逐个卸载旧链接、重新安装三个仓库目录，三次安装均报告 `application: applied`。当前 profile 的三个实际链接已核对为：

```text
/Users/nereus/Documents/AIRepositories/ds_plugins/harness-knowledge-plugin
/Users/nereus/Documents/AIRepositories/ds_plugins/harness-me-plugin
/Users/nereus/Documents/AIRepositories/ds_plugins/harness-todo-plugin
```

以后只在本仓库修改代码。修改后构建相应客户端、按需通过 Plugin Manager 重载，并刷新当前 GUI；本仓库没有自动构建 watcher。Git 提交或推送不会自动让家里电脑安装更新。

条目/Todo 的完整本地数据已在停用插件后复制到本仓库相应 `data/`，受 `.gitignore` 保护，不可提交；Me 继续使用 `~/.dsh/me/me.json`。node_modules 已从同版本本机工作依赖准备，仅供本机运行，不可提交，换机需重新安装依赖。

迁移前私人快照在 `~/.dsh/plugin-migration-backups/20261113-181244/`。旧工作区目录保留为备份，已不被当前 profile 引用，后续不要再编辑那份。迁移未删除旧数据、未上传云端。

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
- 准备兼容本机依赖后，Me 全部53项测试通过。
- 三插件均从本仓库重新安装成功；profile 实际链接核对通过。尚未人工验收刷新后的页面交互。
- 条目数据 revision 20 / 3条、Todo revision 11 / 2条迁移校验通过；Me 原路径未改变。
- 本机运行 data/ 和 node_modules/ 受 Git ignore 保护；初次代码整理未包含这些内容，后续迁移仅在本机补入。提交前务必检查 staged diff。

新机安装与坚果云流程详见 [同步与换机.md](同步与换机.md)。每个插件原 README 保留历史开发说明；版本与实时行为以当前 package.json 和代码为准。

本次不创建远程仓库、不提交、不推送；已有 `.git` 保持原样。提交前检查 staged diff，确认没有私人 JSON、密钥或导出文档。
