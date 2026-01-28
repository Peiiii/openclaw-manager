# v0.0.16 CLI TOML Config Prompts

## 改了什么

- CLI 各步骤统一读取 TOML 配置（默认 `manager.toml`，可用 `--config` 指定）
- 关键输入缺失时改为交互式提示（非交互模式直接报错）
- `.gitignore` 增加本地 TOML 配置文件忽略规则

## 验证方式

- `pnpm -r --if-present lint`
- `pnpm -r --if-present build`
- `pnpm -r --if-present tsc`
- 冒烟（非仓库目录）：
  - `MANAGER_API_URL=http://127.0.0.1:17321 node /path/to/clawdbot-manager/scripts/manager-cli.mjs status --config /tmp/manager.toml`

## 发布/部署方式

- 无需发布

## 相关文档

- [CLI 快速验证指南](../../cli.md)
