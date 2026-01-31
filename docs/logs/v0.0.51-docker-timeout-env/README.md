# v0.0.51 Docker Timeout Env

## 改了什么

- Docker 脚本支持 `MANAGER_GATEWAY_TIMEOUT_MS`
- Docker get started 文档补充超时参数说明

## 使用方式

- `MANAGER_GATEWAY_TIMEOUT_MS=60000 curl -fsSL https://openclaw-manager.com/docker.sh | bash`

## 验证方式

- `pnpm -r --if-present lint`
- `pnpm -r --if-present build`
- 冒烟（非仓库目录）：
  - `MANAGER_GATEWAY_TIMEOUT_MS=60000 bash /path/to/clawdbot-manager/apps/web/public/docker.sh`

## 发布/部署方式

- 无需发布
