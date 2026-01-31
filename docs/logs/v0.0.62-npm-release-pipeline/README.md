# v0.0.62 NPM Release Pipeline Setup

## 迭代完成说明

- 初始化 changeset 配置与脚本，补齐 npm 发布流程。
- 增加 release:check/version/publish 脚本，发布前自动执行 build/lint/tsc。
- 增加 build:openclaw-manager，发布前拷贝构建产物到 npm 包。

## 使用方式

- 变更后创建 changeset：
  - `pnpm changeset`
- 版本更新：
  - `pnpm release:version`
- 发布：
  - `pnpm release:publish`

## 验证方式

- `pnpm build`
- `pnpm lint`
- `pnpm -r --if-present tsc`

## 发布/部署方式

- `pnpm release:publish`（需 npm 登录或 NPM_TOKEN）
- `pnpm deploy:pages`
- 线上冒烟：访问 `https://openclaw-manager.com`
