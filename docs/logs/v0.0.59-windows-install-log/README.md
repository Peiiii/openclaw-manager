# v0.0.59 Windows Install Log Redirect Fix

## 迭代完成说明

- 修复 Windows 安装脚本中 stdout/stderr 重定向到同一路径导致的报错。
- 新增 `MANAGER_ERROR_LOG_PATH` 用于指定错误日志路径。
- 启动时额外输出错误日志路径，便于排查。

## 使用方式

- 默认日志：
  - `clawdbot-manager.log`
  - `clawdbot-manager.error.log`
- 自定义错误日志路径：
  - `MANAGER_ERROR_LOG_PATH="C:\\path\\to\\clawdbot-manager.error.log"`

## 验证方式

- `pnpm build`
- `pnpm lint`
- `pnpm -r --if-present tsc`
- 冒烟：在 Windows 上执行 `irm https://claw.cool/install.ps1 | iex`，确认不再报错并生成两个日志文件。

## 发布/部署方式

- `pnpm deploy:pages`
- 线上冒烟：访问 `https://claw.cool`
