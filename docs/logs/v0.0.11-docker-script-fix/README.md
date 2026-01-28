# v0.0.11 Docker Script Fix

## 改了什么

- 修复 `docker.sh` 在未设置环境变量时的 `unbound variable` 报错
- 登录提示显示实际默认账号/密码
- 增加 `/health` 就绪检测（避免脚本结束但服务未启动）

## 验证方式

- `pnpm -r --if-present lint`
- `pnpm -r --if-present build`
- 冒烟（非仓库目录）：
  - `MANAGER_DOCKER_NAME=moltbot-manager-smoke MANAGER_CONFIG_VOLUME=moltbot-manager-smoke MANAGER_API_PORT=17436 bash /Users/peiwang/Projects/clawdbot-manager/apps/web/public/docker.sh`
  - `curl -fsS http://127.0.0.1:17436/health`

## 发布/部署方式

- `pnpm deploy:pages`

## 相关文档

- [Docker 对外文档](../../docker.md)
