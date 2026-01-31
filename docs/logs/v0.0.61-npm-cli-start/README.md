# v0.0.61 NPM CLI Start (No Git Clone)

## 迭代完成说明

- 新增 `openclaw-manager` npm CLI，提供 `start` 命令启动服务。
- CLI 直接使用包内构建产物（API dist + Web dist），不再依赖 git clone。
- 提供 `build:openclaw-manager` 脚本用于发布前拷贝构建产物。
- README 补充 npm 安装入口。

## 使用方式

```bash
npm i -g openclaw-manager
openclaw-manager start
```

## 验证方式

- `pnpm build`
- `pnpm lint`
- `pnpm -r --if-present tsc`
- 冒烟：`node /path/to/packages/cli/bin/openclaw-manager.js --help`

## 发布/部署方式

- `pnpm build:openclaw-manager`（发布前拷贝 dist）
- `pnpm deploy:pages`
- 线上冒烟：访问 `https://openclaw-manager.com`
