# v0.0.5 Cross-Platform Install

## 改了什么

- 新增 Windows 一键安装脚本：`apps/web/public/install.ps1`
- Windows 脚本支持克隆/更新、构建、创建管理员配置，并后台启动 API
- README 增加 PowerShell 一键安装示例

## 验证方式

- `pnpm -r --if-present lint`
- `pnpm -r --if-present build`
- 冒烟（线上脚本可访问性，非仓库目录）：
  - `curl -fsSL https://openclaw-manager.com/install.sh | head -n 5`
  - `curl -fsSL https://openclaw-manager.com/install.ps1 | head -n 5`

## 发布/部署方式

- `pnpm deploy:pages`
- 更新后脚本地址：
  - `https://openclaw-manager.com/install.sh`
  - `https://openclaw-manager.com/install.ps1`
