# 2026-01-30 Onboarding UI Refactor

## 背景 / 问题

- `apps/web/src/App.tsx` 逻辑和 UI 混在一起，维护成本高，定位问题慢

## 决策

- 将业务逻辑抽到独立 hook，UI 渲染下沉到页面组件，保持行为一致

## 变更内容

- 新增 `apps/web/src/features/onboarding/use-onboarding.ts`：集中管理状态派生与副作用
- 新增 `apps/web/src/features/onboarding/onboarding-page.tsx`：纯 UI 渲染
- `apps/web/src/App.tsx` 精简为入口壳

## 使用方式

- 功能入口不变，仍通过 Web UI 的引导流程使用

## 验证方式

```bash
pnpm lint
pnpm build

# smoke-check（非仓库目录）
cd /tmp
curl -fsS https://clawdbot-manager.pages.dev/ >/dev/null
```

验收点：

- build/lint 无报错
- Pages 首页可正常返回

## 发布 / 部署

```bash
pnpm deploy:pages
```

## 影响范围 / 风险

- 无行为变更，属于前端结构调整
- 风险：状态/副作用迁移遗漏（已通过 lint/build 与线上访问验证）

## 相关文档

- 无
