# 开发者指南

面向本项目开发者的最小可用流程与约定。

## 环境要求

- Node.js 22+
- pnpm 10+

## 安装依赖

```bash
pnpm install
```

## 本地启动

一键启动 Web + API：

```bash
pnpm dev
```

仅启动 Web：

```bash
pnpm dev:web
```

仅启动 API：

```bash
pnpm dev:api
```

常用环境变量：

- `MANAGER_OPEN_BROWSER=0`：启动时不自动打开浏览器
- `MANAGER_API_PORT=17321`：指定 API 端口
- `MANAGER_AUTH_USERNAME` / `MANAGER_AUTH_PASSWORD`：API 管理员账号
- `VITE_MANAGER_API_URL`：Web 访问的 API 地址

## 常用脚本

```bash
pnpm lint
pnpm build
```

## 目录结构

- `apps/web`：Web 前端（React + Vite）
- `apps/api`：本地 API 服务（Hono）
- `scripts`：运维/开发脚本
- `docs`：用户文档与开发文档

## 验证与排障

- CLI 验证流程见：`docs/cli.md`
- 安装与部署见：`docs/install.md`、`docs/docker.md`
