# 2026-01-31 仓库与域名统一为 OpenClaw Manager

## 迭代完成说明

- 仓库默认地址统一为 `https://github.com/Peiiii/openclaw-manager.git`
- 官网域名统一为 `https://openclaw-manager.com/`
- Pages 默认项目仍为 `clawdbot-manager`（多域名绑定）
- Docker/安装脚本/文档中的相关默认值同步更新

## 使用方式

- 安装脚本：`curl -fsSL https://openclaw-manager.com/install.sh | bash`
- Windows 安装：`irm https://openclaw-manager.com/install.ps1 | iex`
- Docker 脚本：`curl -fsSL https://openclaw-manager.com/docker.sh | bash`

## 测试 / 验证 / 验收方式

```bash
pnpm build
pnpm lint
pnpm -r --if-present tsc

# smoke-test: 非仓库目录，验证脚本已指向新仓库
cd /tmp
curl -fsSL https://openclaw-manager.pages.dev/install.sh | rg "openclaw-manager.git"
```

验收点：
- build/lint/tsc 全部通过
- smoke-test 能命中 `openclaw-manager.git`

## 发布 / 部署方式

```bash
pnpm deploy:pages
```

线上验收：
- `curl -fsS https://openclaw-manager.com/ > /dev/null`
- 若自定义域名解析未刷新，可先用 `https://openclaw-manager.pages.dev/` 验证部署可用

## 影响范围 / 风险

- 影响范围：安装脚本、Docker 脚本、部署默认值、文档说明
- 风险：若自定义域名解析未刷新，脚本可能短暂是旧版本
