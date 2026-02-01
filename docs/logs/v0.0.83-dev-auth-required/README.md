# 2026-02-01 Dev Auth Required by Default

## 背景 / 问题

- `pnpm dev` 启动后未登录也能直接进入系统
- 原因是 dev 脚本默认注入 `MANAGER_AUTH_DISABLED=1`，绕过鉴权

## 决策

- dev 模式不再强制关闭鉴权
- 如需关闭，显式设置 `MANAGER_AUTH_DISABLED=1`

## 变更内容

- 调整 `apps/api/src/dev.ts`：仅在环境变量显式设置时才注入 `MANAGER_AUTH_DISABLED`

## 使用方式

- 默认 `pnpm dev` 会要求登录
- 需跳过登录时：`MANAGER_AUTH_DISABLED=1 pnpm dev`

## 验证

```bash
pnpm build
pnpm lint
pnpm -r --if-present tsc

# smoke（非仓库目录）
curl -fsS https://openclaw-manager.com/ > /dev/null
```

验收点：

- `pnpm dev` 打开页面会要求登录
- 显式设置 `MANAGER_AUTH_DISABLED=1` 后可跳过登录

## 发布 / 部署

- `pnpm deploy:pages`
- 如需发布 npm 包，按 `docs/workflows/npm-release-process.md` 执行

## 影响范围 / 风险

- Breaking change：否
- 风险：开发环境若依赖默认跳过登录，需要显式设置环境变量
