# 2026-01-31 品牌文案统一为 OpenClaw

## 迭代完成说明

- 用户可见文案统一为 OpenClaw / OpenClaw Manager
- README 截图文件改名为 `openclaw-manager.png`
- UI 与文档中保留 `clawdbot` 作为 CLI 命令/包名说明
- `packages/cli/web-dist` 继续纳入版本管理（不加入 .gitignore）

## 使用方式

- 安装脚本：`curl -fsSL https://openclaw-manager.com/install.sh | bash`
- CLI 启动：`openclaw-manager start`

## 测试 / 验证 / 验收方式

```bash
pnpm build
pnpm lint
pnpm -r --if-present tsc

# smoke-test: 非仓库目录验证脚本仍可访问
cd /tmp
curl -fsS https://openclaw-manager.com/install.sh | head -n 5
```

验收点：
- build/lint/tsc 全部通过
- `install.sh` 返回 200 且输出 bash 头部

## 发布 / 部署方式

```bash
pnpm deploy:pages
```

线上验收：
- `curl -fsS https://openclaw-manager.com/ > /dev/null`

## 影响范围 / 风险

- 影响范围：README、文档、前端文案、截图文件名
- 风险：若本地缓存未刷新，可能仍看到旧截图文件名
