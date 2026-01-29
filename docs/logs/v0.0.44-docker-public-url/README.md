# v0.0.44 Docker Public URL

## 改了什么

- Docker 脚本尝试探测公网 IP 并打印可访问链接
- Docker get started 文档补充 `MANAGER_PUBLIC_HOST`

## 使用方式

- `MANAGER_PUBLIC_HOST=<your-public-ip-or-domain> curl -fsSL https://clawdbot-manager.pages.dev/docker.sh | bash`

## 验证方式

- `pnpm -r --if-present lint`
- `pnpm -r --if-present build`
- 冒烟（非仓库目录）：
  - `MANAGER_PUBLIC_HOST=127.0.0.1 bash /path/to/clawdbot-manager/apps/web/public/docker.sh`

## 发布/部署方式

- 无需发布
