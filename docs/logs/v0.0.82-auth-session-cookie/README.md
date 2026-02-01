# 2026-02-01 Auth Session Cookie

## 背景 / 问题

- 刷新页面后必须重复输入用户名/密码，登录态无法跨页面存续
- 现有鉴权仅依赖内存中的 Basic Header，缺少可持续的会话机制

## 决策

- 引入后端签名 session cookie（httpOnly），前端请求默认携带
- AuthGate 不再只依赖 authHeader，改为基于状态探测决定是否展示登录
- 保留 Basic Header 作为兼容链路，不影响现有 CLI/脚本

## 变更内容

- 新增 session cookie 签发/校验（`/api/auth/login` 写入 cookie，鉴权中间件支持 cookie）
- 前端 fetch 统一携带 `credentials: "include"`，允许跨源携带 cookie
- AuthGate 增加“登录态检查”加载态，避免每次刷新都强制输入

## 使用方式

- 正常登录一次后，刷新页面应自动保持登录态

## 验证

```bash
pnpm build
pnpm lint
pnpm -r --if-present tsc

# smoke（非仓库目录）
curl -fsS https://openclaw-manager.com/ > /dev/null
```

验收点：

- 刷新页面不会再要求重复输入用户名/密码
- 未登录时仍会展示登录页面

## 发布 / 部署

- `pnpm deploy:pages`
- 按 `docs/workflows/npm-release-process.md` 执行 `pnpm release:publish`
  - 已发布：`openclaw-manager@0.1.15`

## 影响范围 / 风险

- Breaking change：否
- 风险：跨域环境需允许携带 cookie（已在服务端 CORS 开启 credentials）
