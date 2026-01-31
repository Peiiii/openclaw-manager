# v0.0.63 Local NPM Auth for Release

## 迭代完成说明

- 使用 `.npmrc.publish.local` 持久化发布凭证，避免重复提供 token。
- `.npmrc.publish.local` 已加入 `.gitignore`，确保不会提交到仓库。
- 发布命令使用 `NPM_CONFIG_USERCONFIG` 指向本地凭证文件。

## 使用方式

- 本地发布：
  - `NPM_CONFIG_USERCONFIG=.npmrc.publish.local pnpm release:publish`

## 验证方式

- `pnpm build`
- `pnpm lint`
- `pnpm -r --if-present tsc`

## 发布/部署方式

- `pnpm release:publish`
- `pnpm deploy:pages`
- 线上冒烟：访问 `https://openclaw-manager.com`
