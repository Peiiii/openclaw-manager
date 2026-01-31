# v0.0.57 MVP Presenter Architecture

## 设计方案

目标：视图与逻辑解耦，按 MVP 风格重组前端 Onboarding 流程，使状态、动作与编排边界清晰。

- 状态层：所有可订阅状态下沉到 `stores/`（Zustand 单例）。
- 逻辑层：每个 store 对应一个 manager（`managers/`），通过箭头函数暴露 actions。
- 编排层：全局 presenter 暴露 managers 与全局能力，通过 Context 提供。
- 业务组件：直接使用 `usePresenter()` 获取 actions；直接从 store 订阅状态；减少 props 透传。

## 实现说明

- 新增 `stores/onboarding-store.ts`，统一管理 Onboarding 视图状态。
- 新增 `managers/*`，将各 store 动作暴露为 manager actions。
- 新增 `presenter/`，集中提供全局 presenter 与 `usePresenter`。
- Onboarding 页面改为直接使用 presenter + store 订阅，移除过度封装的 view model hook。

## 使用方式

- UI 层调用：
  - `const presenter = usePresenter()` 获取全局能力。
  - `useOnboardingStore(...)` 等直接订阅状态。
  - 业务动作通过 `presenter.onboarding.*` 调用。

## 验证方式

- `pnpm build`
- `pnpm lint`
- `pnpm -r --if-present tsc`
- 冒烟：启动前端（`pnpm dev:web`）并进入 Onboarding 流程，确认步骤切换、提交动作与日志刷新正常。

## 发布/部署方式

- `pnpm deploy:pages`
- 线上冒烟：访问 `https://openclaw-manager.com`
