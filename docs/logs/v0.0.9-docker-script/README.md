# v0.0.9 Docker Shortcut Script

## 改了什么

- 新增 `https://claw.cool/docker.sh` 快捷脚本
- 对外文档改为“短命令 + 可选参数”

## 验证方式

- `pnpm -r --if-present lint`
- `pnpm -r --if-present build`
- 冒烟（线上脚本可访问性，非仓库目录）：
  - `curl -fsSL https://claw.cool/docker.sh | head -n 5`

## 发布/部署方式

- `pnpm deploy:pages`

## 相关文档

- [Docker 对外文档](../../docker.md)
