# MemOS 本地插件：研究开发约定

## 项目范围
- 适用于 `apps/memos-local-plugin/`（TypeScript/Node.js）。使用插件自身的脚本和 Vitest 测试，不套用根目录 Python 项目的 `make format` / `pytest` 流程。
- 研究目标：验证历史 L2 Policy Gain 能否预测未来任务效用，探索基于任务条件的经验效用评估与选择性 Skill 晋升。复用现有 MemOS 和 Agent 集成能力。
- 重点目录：`core/memory/l2/`、`core/skill/eligibility.ts`、`core/skill/`、`core/retrieval/`（均相对于本目录）。

## 开发约束
- 保留现有 Gain、Eligibility、Skill 结晶、检索及反馈机制，作为可复现基线。新算法使用独立模块或明确的配置开关，不重新开发 Agent。
- 优先小范围修改，并补充相应 Vitest 测试；报告实际执行的命令与结果。示例：`npm exec vitest -- run tests/unit/skill/eligibility.test.ts`。
- 区分模拟测试与真实 Agent 运行。评估效用时，记录任务及 episode 标识、Policy/Skill 版本、检索曝光与实际使用、trial、奖励和执行成本，严格隔离评估数据。
- 未经确认，不修改全仓配置、依赖、数据库结构或 Git 远程地址，不提交或推送代码；不得在测试数据和日志中保存密钥或敏感原始轨迹。
- 研究现有实现时，若可访问 `MSCE_FEASIBILITY.md`，先阅读该报告；具体阶段任务以用户当前指令为准。
