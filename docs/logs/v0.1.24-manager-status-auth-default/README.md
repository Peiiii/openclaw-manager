# 2026-02-05 manager:status auth default alignment

## 背景 / 问题

- `pnpm manager:status` 使用 `manager.toml` 的 `admin/pass`，而本地 `pnpm dev` 的 API 默认账号为 `openclaw/openclaw`，导致 401。

## 决策

- CLI 优先读取 `MANAGER_AUTH_USERNAME/MANAGER_AUTH_PASSWORD`，环境变量优先级高于 `manager.toml`。
- 更新默认 `manager.toml` 账号为 `openclaw/openclaw`，与 API 默认一致。
- 文档同步更新默认账号与环境变量名称。

## 变更内容

- `scripts/manager-cli.mjs`：新增 `MANAGER_AUTH_USERNAME/PASSWORD`，并调整优先级。
- `manager.toml`：默认账号改为 `openclaw/openclaw`。
- `docs/cli.md`：示例与 FAQ 同步新的默认账号与变量。

## 使用方式

- 本地 `pnpm dev` 启动 API 后，直接执行 `pnpm manager:status` 应返回 `ok: true`。
- 如需显式指定账号：`MANAGER_AUTH_USERNAME=<user> MANAGER_AUTH_PASSWORD=<pass> pnpm manager:status`。

## 验证

```bash
# build / lint / typecheck
pnpm build
pnpm lint
pnpm -r --if-present tsc

# smoke-check（非仓库目录）
MANAGER_AUTH_USERNAME=openclaw MANAGER_AUTH_PASSWORD=openclaw MANAGER_CONFIG_PATH=/tmp/openclaw-manager-config.json MANAGER_API_PORT=17331 MANAGER_WEB_DIST=/Users/peiwang/Projects/clawdbot-manager/apps/web/dist node /Users/peiwang/Projects/clawdbot-manager/apps/api/dist/index.js &
API_PID=$!
sleep 1
MANAGER_AUTH_USERNAME=openclaw MANAGER_AUTH_PASSWORD=openclaw MANAGER_API_URL=http://127.0.0.1:17331 node /Users/peiwang/Projects/clawdbot-manager/scripts/manager-cli.mjs status --non-interactive
kill $API_PID
```

验收点：

- `manager:status` 输出包含 `ok: true`，且无 401。

## 发布 / 部署

- 无需发布；未涉及 npm 包或线上环境。

## 影响范围 / 风险

- Breaking change：否。
- 风险：若用户通过 `MANAGER_AUTH_USER/PASS` 注入账号，CLI 仍支持，但文档不再推荐。
