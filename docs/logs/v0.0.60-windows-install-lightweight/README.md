# v0.0.60 Windows Install Lightweight Guard

## 迭代完成说明

- Windows 安装脚本在安装目录已存在且非 Git 仓库时给出提示并退出，避免覆盖未知目录。
- corepack 不可用时输出 pnpm 备用安装方式（npm 全局安装）。
- 移除 Node 版本要求提示，仅保留 Node 存在性检查。

## 使用方式

- 若目录已存在但非 Git 仓库，请清空或更换安装目录后重试：
  - `MANAGER_INSTALL_DIR="C:\\path\\to\\empty-dir"`
- corepack 不可用时，先执行：
  - `npm i -g pnpm`

## 验证方式

- `pnpm build`
- `pnpm lint`
- `pnpm -r --if-present tsc`
- 冒烟：在 Windows 上执行 `irm https://openclaw-manager.com/install.ps1 | iex`，确认提示清晰且不再误覆盖目录。

## 发布/部署方式

- `pnpm deploy:pages`
- 线上冒烟：访问 `https://openclaw-manager.com`
