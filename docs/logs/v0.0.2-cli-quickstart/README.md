# 2026-01-27 CLI 安装闭环 + 启动收敛

## 目标

- 新用户最少输入即可启动：先确保 CLI 可用，再自动拉起网关
- 明确“缺少 CLI”时的引导与一键安装入口
- 向导步骤更清晰，减少失败后的不确定性

## 本次交付

- 新增“安装 CLI”步骤，未检测到 CLI 时阻断后续流程
- API 增加 `/api/cli/install`，支持一键安装 CLI
- Quickstart 在 CLI 未安装时给出明确错误
- CLI/网关默认端口统一为 `18789`

## 使用方式（开发态）

1. 安装依赖：`pnpm install`
2. 一键启动：`pnpm dev`
3. 打开浏览器：`http://127.0.0.1:5179`

## 验证方式

- `pnpm lint`
- `pnpm build`
- 冒烟测试（非仓库目录，/tmp）：
  - `MANAGER_OPEN_BROWSER=0 MANAGER_API_PORT=17331 pnpm --dir /path/to/clawdbot-manager dev`
  - `curl http://127.0.0.1:5179`
  - `curl http://127.0.0.1:17331/api/status`

执行结果：全部通过。

## 发布/部署

- Cloudflare Pages：
  - `pnpm deploy:pages`
  - 线上冒烟验证：`curl https://openclaw-manager.com`
  - 部署地址：`https://openclaw-manager.com`
