# AI求职简历决策助手 Web

这是当前 MVP 的 Web 端工程，目标是先跑通“围绕目标JD的高可信简历决策助手”主链路。

## 当前范围

本期先做 5 个核心页面：

1. 首页与任务入口
2. 经历录入与简历解析确认
3. JD 输入与拆解
4. 匹配分析结果
5. 简历编辑与 PDF 导出

## 本地环境

由于当前机器没有系统级 Node.js，这个项目使用仓库根目录下的本地工具链：

1. Node.js 路径：`../.tools/node/bin`
2. 当前脚本已经在 `package.json` 中提供了 `*:local` 命令

## 启动方式

在 `web` 目录下运行：

```bash
npm run dev:local
```

构建：

```bash
npm run build:local
```

代码检查：

```bash
npm run lint:local
```

默认访问地址：`http://localhost:3000`

## 环境变量

复制 `.env.example` 为 `.env.local` 后可本地调整：

```bash
cp .env.example .env.local
```

当前示例变量：

1. `NEXT_PUBLIC_APP_NAME`
2. `NEXT_PUBLIC_APP_URL`
3. `NEXT_PUBLIC_APP_BASE_PATH`
4. `NEXT_PUBLIC_ENABLE_MOCKS`
5. `ANALYSIS_API_BASE_URL`
6. `ANALYSIS_API_KEY`
7. `ANALYSIS_API_MODEL`
8. `ANALYSIS_API_PATH`
9. `TASK_DATA_DIR`

其中分析链路默认支持 OpenAI-compatible Chat Completions 接口。
如果没有配置 `ANALYSIS_API_BASE_URL`、`ANALYSIS_API_KEY`、`ANALYSIS_API_MODEL`，当前会回退到本地确定性分析逻辑，方便本地继续开发。

如果需要把应用部署在同域名子路径下，例如 `https://example.com/resume-tool`，请在构建前设置：

```bash
NEXT_PUBLIC_APP_BASE_PATH=/resume-tool
NEXT_PUBLIC_APP_URL=https://example.com/resume-tool
```

如果需要把任务 JSON 数据放到仓库之外的持久化目录，请设置：

```bash
TASK_DATA_DIR=/var/lib/resume-tool/tasks
```

## 目录说明

1. `src/app`：App Router 页面
2. `src/app/tasks/demo/*`：按 PRD 拆出的首批页面骨架
3. `src/components`：共享组件
4. `src/lib`：共享数据和后续业务逻辑入口

## 下一步开发建议

1. 先把经历录入页接成真实表单和本地草稿保存
2. 再接 JD 拆解与匹配分析接口
3. 最后接简历编辑、版本快照和 PDF 导出
