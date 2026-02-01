# 2026-02-01 Default Auth Credentials

## 背景 / 问题

- 首次启动时返回 `auth not configured`，导致无法登录
- 期望系统自带默认用户名/密码，开箱可用

## 决策

- 在未配置 auth 的情况下启用默认账号（openclaw / openclaw）
- 登录提示中明确默认账号
- session 签名使用默认账号作为兜底密钥

## 变更内容

- 新增默认账号常量并在 `resolveAuthState` 兜底启用
- session secret 在未配置时使用默认账号
- 登录界面提示默认账号
- 增加 `migrate:remote` 脚本，占位远程迁移流程

## 使用方式

- 默认账号：`openclaw / openclaw`
- 如果配置了自定义账号（环境变量/配置文件），默认账号不再生效

## 验证

```bash
pnpm build
pnpm lint
pnpm -r --if-present tsc

# smoke（非仓库目录）
curl -fsS https://openclaw-manager.com/ > /dev/null
```

验收点：

- 未配置 auth 时，使用默认账号可以登录
- 配置自定义账号时，默认账号无效

## 发布 / 部署

- `pnpm deploy:pages`
- 按 `docs/workflows/npm-release-process.md` 执行 `pnpm release:publish`
  - 已发布：`openclaw-manager@0.1.16`

## 影响范围 / 风险

- Breaking change：否
- 风险：默认账号需在生产环境尽快替换为自定义账号
