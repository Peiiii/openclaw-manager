# 发布部署

本指南面向维护者，描述如何发布 Cloudflare Pages。

## 前置条件

- 已安装依赖：`pnpm install`
- 已准备 Cloudflare API Token（非交互环境需要）

## 发布到 Pages

```bash
pnpm deploy:pages
```

可选环境变量：

- `CLOUDFLARE_API_TOKEN`：Cloudflare API Token（必需于非交互环境）
- `CLOUDFLARE_PAGES_PROJECT`：项目名（默认 `clawdbot-manager`）
- `CLOUDFLARE_PAGES_BRANCH`：分支名（默认 `main`）

## 线上冒烟验证

```bash
curl -fsS https://<project>.pages.dev
```
