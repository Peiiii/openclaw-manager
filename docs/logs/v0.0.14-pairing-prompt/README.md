# v0.0.14 Pairing Prompt

## 改了什么

- CLI 增加 `pairing-prompt`：命令行交互输入配对码
- `apply` 支持 `pairing.prompt`（优先于 wait/codes）
- 增加 `--non-interactive` 支持，便于自动化流程暂停等待人工配对码
- `pairing-approve/pairing-prompt` 支持 `--continue` 衔接通道探测

## 验证方式

- `pnpm -r --if-present lint`
- `pnpm -r --if-present build`
- 冒烟（非仓库目录）：
  - `node /path/to/clawdbot-manager/scripts/manager-cli.mjs pairing-prompt --non-interactive`
  - `node /path/to/clawdbot-manager/scripts/manager-cli.mjs pairing-approve --code "ABCDE123" --continue`

## 发布/部署方式

- 无需发布

## 相关文档

- [CLI 快速验证指南](../../cli.md)
