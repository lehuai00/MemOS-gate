# AGENTS.md — MSCE 研究开发约定

## 项目范围
- 本仓库用于基于 MemOS 开展 Agent 经验效用评估与选择性 Skill 晋升研究；复用现有 MemOS 插件和 OpenClaw，不重新开发 Agent。
- **主要工作范围**：`apps/memos-local-plugin/`（TypeScript / Node.js），重点为 `adapters/openclaw/`、`core/memory/l2/`、`core/skill/`、`core/retrieval/` 及对应测试。
- 其他 MemOS Python 代码仅按需查阅；插件任务使用自身的 npm 脚本与 Vitest，不套用根目录的 Poetry、Makefile、pytest 流程。

## 开发环境与目录
- **源码仓库**：`F:\Agents\MSCE\MemOS\`。`node_modules/`、`dist/` 等正常构建产物可以留在项目内，但不能意外提交。
- **工具安装**：Node.js、npm、OpenClaw 使用系统安装，依据实际版本要求升级，不在仓库内搭建独立工具链。
- **运行数据**：`F:\Agents\MSCE\msce-runtime\` 存放实验用 OpenClaw 配置/工作区、`MEMOS_HOME`、数据库、日志和结果。启动前确认路径真正生效。
- 使用独立 OpenClaw 实验 profile，不改写默认 profile。密钥仅保存在受控的本机配置或环境变量中。

## 开发与验证原则
- 以用户当前任务为准，**优先最小可运行结果**；不主动扩展审计框架、实验平台或不必要的重构。
- 保留原有 Gain、Eligibility、Skill 生命周期等实现作为研究基线；有必要修改时尽量局部、可验证。
- 环境或构建问题优先针对性排查、修复和重试；不因普通构建产物复制整个仓库或反复新建安装目录。
- 修改代码后运行相关 npm/Vitest 检查；严格区分模拟测试与真实 Agent 运行证据，报告实际执行的命令和结果。
- **当前阶段目标、步骤与验收标准写在 `PLANS.md` 中**；若用户当前指令与计划不同，以用户最新指令为准。

## Git 与安全
- 未经明确授权，不提交、推送、更改 Git 远程或执行破坏性清理；操作前后检查 `git status`。
- 不将运行数据库、实验日志、工具链压缩包、密钥或个人配置提交到 Git。
- 不擅自删除未知数据；处理遗留环境文件前先确认没有被运行进程或配置引用。
